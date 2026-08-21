import { Worker } from "bullmq";
import { redisConnection, outboundWhatsappQueue, followUpScanQueue, type FollowUpScanJob } from "../lib/queue";
import { listAllEnabledFollowUpSettings, findStaleUnansweredConversations } from "../lib/tenantScope";

const SCAN_INTERVAL_MS = 15 * 60 * 1000;

export function startFollowUpScanWorker() {
  return new Worker<FollowUpScanJob>(
    "followup-scan",
    async () => {
      const allSettings = await listAllEnabledFollowUpSettings();
      let enqueued = 0;
      for (const settings of allSettings) {
        const cutoff = new Date(Date.now() - settings.delayHours * 60 * 60 * 1000);
        const stale = await findStaleUnansweredConversations(settings.tenantId, cutoff);
        for (const conversation of stale) {
          await outboundWhatsappQueue.add("followup", {
            tenantId: settings.tenantId,
            to: conversation.contactNumber,
            text: settings.message,
          });
          enqueued++;
        }
      }
      return { tenantsScanned: allSettings.length, followUpsEnqueued: enqueued };
    },
    { connection: redisConnection }
  );
}

export async function scheduleFollowUpScan() {
  await followUpScanQueue.add("scan", {}, { repeat: { every: SCAN_INTERVAL_MS }, jobId: "followup-scan-repeatable" });
}
