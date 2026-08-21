import { Router } from "express";
import { z } from "zod";
import { requireAuth, getAuth } from "../middleware/auth";
import {
  createBroadcast,
  findBroadcast,
  listBroadcasts,
  findWhatsAppConnection,
  findConversationState,
} from "../lib/tenantScope";
import { broadcastQueue } from "../lib/queue";
import { WAHA_BROADCAST_DAILY_CAP } from "../lib/broadcast/rateLimit";

export const broadcastRouter = Router();
broadcastRouter.use(requireAuth);

const createSchema = z.object({
  message: z.string().min(1),
  templateName: z.string().min(1).optional(),
  templateLang: z.string().min(1).optional(),
  recipients: z.array(z.string().min(5)).min(1),
});

broadcastRouter.post("/", async (req, res) => {
  const { tenantId } = getAuth(req);
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const connection = await findWhatsAppConnection(tenantId);
  if (!connection || connection.status !== "CONNECTED") {
    res.status(409).json({ error: "WhatsApp is not connected for this tenant" });
    return;
  }

  const { message, templateName, templateLang, recipients } = parsed.data;

  if (connection.provider === "WAHA" && recipients.length > WAHA_BROADCAST_DAILY_CAP) {
    res.status(422).json({
      error: `WAHA broadcast is capped at ${WAHA_BROADCAST_DAILY_CAP} recipients per broadcast to reduce ban risk (self-hosted WhatsApp automation, not an official bulk-messaging API).`,
    });
    return;
  }

  // Only allow broadcasting to contacts who have an existing conversation — mass-messaging
  // numbers this tenant has never talked to is the highest ban/spam-risk pattern and is
  // deliberately out of scope for now (see Fase 4 report).
  const unknown: string[] = [];
  for (const contactNumber of recipients) {
    const conversation = await findConversationState(tenantId, contactNumber);
    if (!conversation) unknown.push(contactNumber);
  }
  if (unknown.length > 0) {
    res.status(422).json({
      error: "Some recipients have no existing conversation with this tenant — broadcast is limited to known contacts.",
      unknownRecipients: unknown,
    });
    return;
  }

  const broadcast = await createBroadcast(tenantId, { message, templateName, templateLang, recipients });
  await broadcastQueue.add("run", { tenantId, broadcastId: broadcast.id });
  res.status(201).json({ broadcast });
});

broadcastRouter.get("/", async (req, res) => {
  const { tenantId } = getAuth(req);
  const broadcasts = await listBroadcasts(tenantId);
  res.json({ broadcasts });
});

broadcastRouter.get("/:id", async (req, res) => {
  const { tenantId } = getAuth(req);
  const broadcast = await findBroadcast(tenantId, req.params.id);
  if (!broadcast) {
    res.status(404).json({ error: "Broadcast not found" });
    return;
  }
  res.json({ broadcast });
});
