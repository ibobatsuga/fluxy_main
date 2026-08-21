import { Worker } from "bullmq";
import { redisConnection, type BroadcastJob } from "../lib/queue";
import {
  findBroadcast,
  findWhatsAppConnection,
  findConversationState,
  isWithin24hWindow,
  updateBroadcastStatus,
  updateBroadcastRecipientStatus,
  createMessageIfNotExists,
} from "../lib/tenantScope";
import { buildProvider } from "../lib/whatsapp";
import { jitteredWahaDelayMs, META_BROADCAST_DELAY_MS } from "../lib/broadcast/rateLimit";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function startBroadcastWorker() {
  return new Worker<BroadcastJob>(
    "broadcast",
    async (job) => {
      const { tenantId, broadcastId } = job.data;
      const broadcast = await findBroadcast(tenantId, broadcastId);
      const connection = await findWhatsAppConnection(tenantId);
      if (!broadcast || !connection || connection.status !== "CONNECTED") {
        throw new Error("Broadcast or WhatsApp connection not available");
      }

      await updateBroadcastStatus(broadcastId, "RUNNING", { startedAt: new Date() });
      const provider = buildProvider(connection);

      for (const recipient of broadcast.recipients.filter((r) => r.status === "PENDING")) {
        try {
          let providerMessageId: string;
          let content = broadcast.message;

          if (connection.provider === "WAHA") {
            await sleep(jitteredWahaDelayMs());
            const result = await provider.sendMessage(recipient.contactNumber, broadcast.message);
            providerMessageId = result.providerMessageId;
          } else {
            await sleep(META_BROADCAST_DELAY_MS);
            const conversation = await findConversationState(tenantId, recipient.contactNumber);
            if (isWithin24hWindow(conversation)) {
              const result = await provider.sendMessage(recipient.contactNumber, broadcast.message);
              providerMessageId = result.providerMessageId;
            } else if (broadcast.templateName && broadcast.templateLang && provider.sendTemplateMessage) {
              const result = await provider.sendTemplateMessage(
                recipient.contactNumber,
                broadcast.templateName,
                broadcast.templateLang,
                []
              );
              providerMessageId = result.providerMessageId;
              content = `[template: ${broadcast.templateName}]`;
            } else {
              await updateBroadcastRecipientStatus(recipient.id, "SKIPPED", {
                error: "Outside 24h window and no approved template provided",
              });
              continue;
            }
          }

          await createMessageIfNotExists(tenantId, {
            connectionId: connection.id,
            direction: "OUT",
            providerMessageId,
            fromNumber: connection.phoneNumber ?? "",
            toNumber: recipient.contactNumber,
            content,
            status: "sent",
          });
          await updateBroadcastRecipientStatus(recipient.id, "SENT", { sentAt: new Date() });
        } catch (err) {
          await updateBroadcastRecipientStatus(recipient.id, "FAILED", { error: String(err) });
        }
      }

      await updateBroadcastStatus(broadcastId, "COMPLETED", { completedAt: new Date() });
    },
    { connection: redisConnection }
  );
}
