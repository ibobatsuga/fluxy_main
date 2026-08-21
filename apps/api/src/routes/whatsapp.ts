import crypto from "node:crypto";
import { Router, type Request } from "express";
import { z } from "zod";
import { requireAuth, getAuth } from "../middleware/auth";
import { encryptCredentials, decryptCredentials } from "../lib/crypto";
import {
  findWhatsAppConnection,
  upsertWhatsAppConnection,
  updateWhatsAppConnectionStatus,
  updateWhatsAppConnectionPhoneNumber,
  createMessageIfNotExists,
  pauseAiForContact,
} from "../lib/tenantScope";
import { createWahaSession, getWahaSessionStatus, getWahaQrPng } from "../lib/whatsapp/waha";
import { WahaProvider, type WahaCredentials } from "../lib/whatsapp/waha";
import { MetaProvider, type MetaCredentials } from "../lib/whatsapp/meta";
import { outboundWhatsappQueue, aiReplyQueue } from "../lib/queue";

// A manual reply from staff means a human has taken over this conversation — pause AI auto-reply
// for this contact so it doesn't talk over them.
const HANDOFF_PAUSE_MINUTES = 30;

export const whatsappRouter = Router();

function rawBodyOf(req: Request): Buffer {
  return (req as unknown as { rawBody?: Buffer }).rawBody ?? Buffer.alloc(0);
}

const wahaSessionStatusMap: Record<string, "CONNECTING" | "QR_PENDING" | "CONNECTED" | "FAILED" | "DISCONNECTED"> = {
  STARTING: "CONNECTING",
  SCAN_QR_CODE: "QR_PENDING",
  WORKING: "CONNECTED",
  FAILED: "FAILED",
  STOPPED: "DISCONNECTED",
};

// --- Tenant-authenticated management endpoints ---

const connectSchema = z.discriminatedUnion("provider", [
  z.object({ provider: z.literal("waha") }),
  z.object({
    provider: z.literal("meta"),
    accessToken: z.string().min(1),
    phoneNumberId: z.string().min(1),
    appSecret: z.string().min(1),
    verifyToken: z.string().min(1),
  }),
]);

whatsappRouter.post("/connect", requireAuth, async (req, res) => {
  const { tenantId } = getAuth(req);
  const parsed = connectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  if (parsed.data.provider === "waha") {
    const hmacSecret = crypto.randomBytes(32).toString("hex");
    const credentials: WahaCredentials = { sessionName: tenantId, hmacSecret };
    try {
      await createWahaSession(tenantId, hmacSecret);
    } catch (err) {
      res.status(502).json({ error: "Failed to create WAHA session", details: String(err) });
      return;
    }
    const connection = await upsertWhatsAppConnection(tenantId, {
      provider: "WAHA",
      status: "CONNECTING",
      credentialsEncrypted: encryptCredentials(JSON.stringify(credentials)),
    });
    res.status(201).json({ connection: { id: connection.id, provider: connection.provider, status: connection.status } });
    return;
  }

  const { accessToken, phoneNumberId, appSecret, verifyToken } = parsed.data;
  const credentials: MetaCredentials = { accessToken, phoneNumberId, appSecret, verifyToken };
  const connection = await upsertWhatsAppConnection(tenantId, {
    provider: "META",
    status: "CONNECTED",
    credentialsEncrypted: encryptCredentials(JSON.stringify(credentials)),
  });
  res.status(201).json({ connection: { id: connection.id, provider: connection.provider, status: connection.status } });
});

whatsappRouter.get("/status", requireAuth, async (req, res) => {
  const { tenantId } = getAuth(req);
  const connection = await findWhatsAppConnection(tenantId);
  if (!connection) {
    res.json({ connection: null });
    return;
  }

  if (connection.provider === "WAHA") {
    const credentials = JSON.parse(decryptCredentials(connection.credentialsEncrypted)) as WahaCredentials;
    try {
      const wahaStatus = await getWahaSessionStatus(credentials.sessionName);
      const mapped = wahaSessionStatusMap[wahaStatus] ?? "FAILED";
      if (mapped !== connection.status) {
        await updateWhatsAppConnectionStatus(tenantId, mapped);
      }
      res.json({ connection: { provider: connection.provider, status: mapped, phoneNumber: connection.phoneNumber } });
    } catch {
      // WAHA unreachable/session gone — fall back to last known status rather than failing the
      // whole request; the webhook-driven session.status updates are the source of truth anyway.
      res.json({
        connection: { provider: connection.provider, status: connection.status, phoneNumber: connection.phoneNumber },
      });
    }
    return;
  }

  res.json({ connection: { provider: connection.provider, status: connection.status, phoneNumber: connection.phoneNumber } });
});

whatsappRouter.get("/qr", requireAuth, async (req, res) => {
  const { tenantId } = getAuth(req);
  const connection = await findWhatsAppConnection(tenantId);
  if (!connection || connection.provider !== "WAHA") {
    res.status(404).json({ error: "No WAHA connection to show a QR for" });
    return;
  }
  const credentials = JSON.parse(decryptCredentials(connection.credentialsEncrypted)) as WahaCredentials;
  try {
    const png = await getWahaQrPng(credentials.sessionName);
    res.setHeader("Content-Type", "image/png");
    res.send(png);
  } catch (err) {
    res.status(502).json({ error: "QR not available yet", details: String(err) });
  }
});

const sendSchema = z.object({ to: z.string().min(5), text: z.string().min(1) });

whatsappRouter.post("/send", requireAuth, async (req, res) => {
  const { tenantId } = getAuth(req);
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const connection = await findWhatsAppConnection(tenantId);
  if (!connection || connection.status !== "CONNECTED") {
    res.status(409).json({ error: "WhatsApp is not connected for this tenant" });
    return;
  }
  await pauseAiForContact(tenantId, parsed.data.to, new Date(Date.now() + HANDOFF_PAUSE_MINUTES * 60_000));
  const job = await outboundWhatsappQueue.add("send", { tenantId, ...parsed.data });
  res.status(202).json({ jobId: job.id });
});

// --- Public webhook endpoints (auth is via provider signature, not session cookie) ---

whatsappRouter.post("/webhook/waha/:tenantId", async (req, res) => {
  const { tenantId } = req.params;
  const connection = await findWhatsAppConnection(tenantId);
  if (!connection || connection.provider !== "WAHA") {
    res.status(404).end();
    return;
  }
  const credentials = JSON.parse(decryptCredentials(connection.credentialsEncrypted)) as WahaCredentials;
  const provider = new WahaProvider(credentials);

  try {
    provider.verifyWebhook(rawBodyOf(req), req.headers);
  } catch {
    res.status(401).end();
    return;
  }

  const envelope = req.body as {
    event?: string;
    me?: { id?: string };
    payload?: { id?: string; status?: string };
  };

  if (envelope.me?.id) {
    await updateWhatsAppConnectionPhoneNumber(tenantId, envelope.me.id.replace("@c.us", ""));
  }

  if (envelope.event === "session.status") {
    const mapped = envelope.payload?.status ? wahaSessionStatusMap[envelope.payload.status] : undefined;
    if (mapped) await updateWhatsAppConnectionStatus(tenantId, mapped);
    res.status(200).end();
    return;
  }

  const parsed = provider.parseIncomingWebhook(envelope);
  if (parsed) {
    const stored = await createMessageIfNotExists(tenantId, {
      connectionId: connection.id,
      direction: "IN",
      providerMessageId: parsed.providerMessageId,
      fromNumber: parsed.from,
      toNumber: connection.phoneNumber ?? "",
      content: parsed.content,
      status: "received",
    });
    if (stored) {
      await aiReplyQueue.add("reply", { tenantId, contactNumber: parsed.from });
    }
  }
  res.status(200).end();
});

whatsappRouter.get("/webhook/meta/:tenantId", async (req, res) => {
  const { tenantId } = req.params;
  const connection = await findWhatsAppConnection(tenantId);
  if (!connection || connection.provider !== "META") {
    res.status(404).end();
    return;
  }
  const credentials = JSON.parse(decryptCredentials(connection.credentialsEncrypted)) as MetaCredentials;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === credentials.verifyToken) {
    res.status(200).send(challenge);
    return;
  }
  res.status(403).end();
});

whatsappRouter.post("/webhook/meta/:tenantId", async (req, res) => {
  const { tenantId } = req.params;
  const connection = await findWhatsAppConnection(tenantId);
  if (!connection || connection.provider !== "META") {
    res.status(404).end();
    return;
  }
  const credentials = JSON.parse(decryptCredentials(connection.credentialsEncrypted)) as MetaCredentials;
  const provider = new MetaProvider(credentials);

  try {
    provider.verifyWebhook(rawBodyOf(req), req.headers);
  } catch {
    res.status(401).end();
    return;
  }

  const parsed = provider.parseIncomingWebhook(req.body);
  if (parsed) {
    const stored = await createMessageIfNotExists(tenantId, {
      connectionId: connection.id,
      direction: "IN",
      providerMessageId: parsed.providerMessageId,
      fromNumber: parsed.from,
      toNumber: connection.phoneNumber ?? "",
      content: parsed.content,
      status: "received",
    });
    if (stored) {
      await aiReplyQueue.add("reply", { tenantId, contactNumber: parsed.from });
    }
  }
  res.status(200).end();
});
