import { Worker } from "bullmq";
import { redisConnection, type AiReplyJob } from "../lib/queue";
import {
  findConversationState,
  pauseAiForContact,
  findAiSettings,
  findWhatsAppConnection,
  listProducts,
  listRecentMessagesForContact,
  createMessageIfNotExists,
} from "../lib/tenantScope";
import { buildAiProvider } from "../lib/ai";
import { buildSystemPrompt, HANDOFF_SENTINEL } from "../lib/ai/systemPrompt";
import { buildProvider } from "../lib/whatsapp";
import { prisma } from "../lib/prisma";

const HANDOFF_PAUSE_MINUTES = 30;
const HISTORY_MESSAGE_LIMIT = 10;
const DEFAULT_HANDOFF_MESSAGE = "Maaf, pertanyaan ini akan diteruskan ke pemilik toko.";

export function startAiReplyWorker() {
  return new Worker<AiReplyJob>(
    "ai-reply",
    async (job) => {
      const { tenantId, contactNumber } = job.data;

      const conversation = await findConversationState(tenantId, contactNumber);
      if (conversation?.aiPausedUntil && conversation.aiPausedUntil > new Date()) {
        return { skipped: "ai-paused" };
      }

      const aiSettings = await findAiSettings(tenantId);
      if (!aiSettings) {
        return { skipped: "no-ai-settings" };
      }

      const connection = await findWhatsAppConnection(tenantId);
      if (!connection || connection.status !== "CONNECTED") {
        return { skipped: "whatsapp-not-connected" };
      }

      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      const products = await listProducts(tenantId);
      const systemPrompt = buildSystemPrompt(
        tenant?.name ?? "",
        products.map((p) => ({ name: p.name, price: p.price.toString(), stock: p.stock, sku: p.sku }))
      );

      const history = await listRecentMessagesForContact(tenantId, contactNumber, HISTORY_MESSAGE_LIMIT);
      const chatHistory = history.map((m) => ({
        role: (m.direction === "IN" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));

      const aiProvider = buildAiProvider(aiSettings);
      const rawReply = await aiProvider.generateReply(systemPrompt, chatHistory);

      let replyText = rawReply;
      if (rawReply.startsWith(HANDOFF_SENTINEL)) {
        const stripped = rawReply.slice(HANDOFF_SENTINEL.length).trim();
        replyText = stripped || DEFAULT_HANDOFF_MESSAGE;
        await pauseAiForContact(tenantId, contactNumber, new Date(Date.now() + HANDOFF_PAUSE_MINUTES * 60_000));
      }

      const whatsappProvider = buildProvider(connection);
      const result = await whatsappProvider.sendMessage(contactNumber, replyText);
      await createMessageIfNotExists(tenantId, {
        connectionId: connection.id,
        direction: "OUT",
        providerMessageId: result.providerMessageId,
        fromNumber: connection.phoneNumber ?? "",
        toNumber: contactNumber,
        content: replyText,
        status: "sent",
      });

      return { sent: true, handoff: rawReply.startsWith(HANDOFF_SENTINEL) };
    },
    { connection: redisConnection }
  );
}
