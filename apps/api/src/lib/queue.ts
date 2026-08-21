import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "./env";

export const redisConnection = new IORedis(env.redisUrl, { maxRetriesPerRequest: null });

export interface OutboundMessageJob {
  tenantId: string;
  to: string;
  text: string;
}

export const outboundWhatsappQueue = new Queue<OutboundMessageJob>("whatsapp-outbound", {
  connection: redisConnection,
});

export interface AiReplyJob {
  tenantId: string;
  contactNumber: string;
}

export const aiReplyQueue = new Queue<AiReplyJob>("ai-reply", {
  connection: redisConnection,
});

export interface BroadcastJob {
  tenantId: string;
  broadcastId: string;
}

export const broadcastQueue = new Queue<BroadcastJob>("broadcast", {
  connection: redisConnection,
});

// Empty payload — the worker scans every tenant with follow-ups enabled on each tick.
export type FollowUpScanJob = Record<string, never>;

export const followUpScanQueue = new Queue<FollowUpScanJob>("followup-scan", {
  connection: redisConnection,
});
