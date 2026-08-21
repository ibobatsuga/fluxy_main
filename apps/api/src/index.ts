import { createApp } from "./app";
import { env } from "./lib/env";
import { startOutboundWhatsappWorker } from "./workers/outboundWhatsapp.worker";
import { startAiReplyWorker } from "./workers/aiReply.worker";
import { startBroadcastWorker } from "./workers/broadcast.worker";
import { startFollowUpScanWorker, scheduleFollowUpScan } from "./workers/followUpScan.worker";

const app = createApp();

app.listen(env.port, () => {
  console.log(`[api] listening on :${env.port}`);
});

startOutboundWhatsappWorker();
startAiReplyWorker();
startBroadcastWorker();
startFollowUpScanWorker();
scheduleFollowUpScan();
console.log("[api] outbound WhatsApp + AI reply + broadcast + follow-up workers started");
