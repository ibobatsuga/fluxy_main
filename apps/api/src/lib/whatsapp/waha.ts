import crypto from "node:crypto";
import { env } from "../env";
import type { IncomingMessage, SendMessageResult, WhatsAppProvider } from "./provider";

export interface WahaCredentials {
  sessionName: string;
  hmacSecret: string;
}

// Confirmed against a live WAHA container (devlikeapro/waha:latest, version 2026.8.1):
// - POST /api/sessions {name, start, config} -> 201, session status STARTING
// - GET  /api/sessions/{name} -> current status (STARTING, SCAN_QR_CODE, WORKING, FAILED, STOPPED)
// - GET  /api/{session}/auth/qr[?format=raw] -> image/png, or {value: "<qr string>"}
// - POST /api/sendText {session, chatId, text} -> chatId is "{digits}@c.us"
// - Webhook envelope: {id: "evt_...", timestamp, session, event, payload}. `id` is per-delivery-attempt
//   (WebhookConductor builds a fresh envelope per event dispatch), NOT stable across redeliveries.
//   `payload.id` (e.g. "false_628...@c.us_XXXX") is the actual WhatsApp message id and IS stable — it
//   is the only safe idempotency key.
// - Webhook signature: header X-Webhook-Hmac = hex(hmac-sha512(rawBody, hmacSecret)).

export function wahaHeaders() {
  return { "X-Api-Key": env.wahaApiKey, "Content-Type": "application/json" };
}

export async function createWahaSession(sessionName: string, hmacSecret: string) {
  const res = await fetch(`${env.wahaBaseUrl}/api/sessions`, {
    method: "POST",
    headers: wahaHeaders(),
    body: JSON.stringify({
      name: sessionName,
      start: true,
      config: {
        webhooks: [
          {
            url: `${env.apiInternalUrl}/whatsapp/webhook/waha/${sessionName}`,
            events: ["message", "session.status"],
            hmac: { key: hmacSecret },
            retries: { delaySeconds: 2, attempts: 3 },
          },
        ],
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`WAHA session creation failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<{ name: string; status: string }>;
}

export async function getWahaSessionStatus(sessionName: string): Promise<string> {
  const res = await fetch(`${env.wahaBaseUrl}/api/sessions/${sessionName}`, {
    headers: wahaHeaders(),
  });
  if (!res.ok) {
    throw new Error(`WAHA session status fetch failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { status: string };
  return body.status;
}

export async function getWahaQrPng(sessionName: string): Promise<Buffer> {
  const res = await fetch(`${env.wahaBaseUrl}/api/${sessionName}/auth/qr`, {
    headers: { "X-Api-Key": env.wahaApiKey },
  });
  if (!res.ok) {
    throw new Error(`WAHA QR fetch failed: ${res.status} ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function stopWahaSession(sessionName: string): Promise<void> {
  await fetch(`${env.wahaBaseUrl}/api/sessions/${sessionName}`, {
    method: "DELETE",
    headers: wahaHeaders(),
  });
}

export class WahaProvider implements WhatsAppProvider {
  constructor(private readonly credentials: WahaCredentials) {}

  async sendMessage(to: string, text: string): Promise<SendMessageResult> {
    const res = await fetch(`${env.wahaBaseUrl}/api/sendText`, {
      method: "POST",
      headers: wahaHeaders(),
      body: JSON.stringify({
        session: this.credentials.sessionName,
        chatId: `${to}@c.us`,
        text,
      }),
    });
    if (!res.ok) {
      throw new Error(`WAHA sendText failed: ${res.status} ${await res.text()}`);
    }
    const body = (await res.json()) as { id: string };
    return { providerMessageId: body.id };
  }

  verifyWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): void {
    const signature = headers["x-webhook-hmac"];
    if (!signature || typeof signature !== "string") {
      throw new Error("Missing X-Webhook-Hmac header");
    }
    const expected = crypto.createHmac("sha512", this.credentials.hmacSecret).update(rawBody).digest("hex");
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new Error("Invalid webhook HMAC signature");
    }
  }

  parseIncomingWebhook(body: unknown): IncomingMessage | null {
    const envelope = body as {
      event?: string;
      timestamp?: number;
      payload?: { id?: string; from?: string; body?: string; fromMe?: boolean };
    };
    if (envelope.event !== "message" || !envelope.payload) return null;
    const { id, from, body: text, fromMe } = envelope.payload;
    if (fromMe || !id || !from) return null;
    return {
      from: from.replace("@c.us", ""),
      content: text ?? "",
      providerMessageId: id,
      timestamp: envelope.timestamp ? new Date(envelope.timestamp) : new Date(),
    };
  }
}
