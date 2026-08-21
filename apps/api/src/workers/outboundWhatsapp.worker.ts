import { Worker } from "bullmq";
import { redisConnection, type OutboundMessageJob } from "../lib/queue";
import { findWhatsAppConnection, createMessageIfNotExists } from "../lib/tenantScope";
import { buildProvider } from "../lib/whatsapp";

export function startOutboundWhatsappWorker() {
  return new Worker<OutboundMessageJob>(
    "whatsapp-outbound",
    async (job) => {
      const { tenantId, to, text } = job.data;
      const connection = await findWhatsAppConnection(tenantId);
      if (!connection || connection.status !== "CONNECTED") {
        throw new Error(`Tenant ${tenantId} has no connected WhatsApp connection`);
      }
      const provider = buildProvider(connection);
      const result = await provider.sendMessage(to, text);
      await createMessageIfNotExists(tenantId, {
        connectionId: connection.id,
        direction: "OUT",
        providerMessageId: result.providerMessageId,
        fromNumber: connection.phoneNumber ?? "",
        toNumber: to,
        content: text,
        status: "sent",
      });
      return result;
    },
    { connection: redisConnection }
  );
}
