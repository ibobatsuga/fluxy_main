import { prisma } from "./prisma";

/**
 * Every tenant-scoped query MUST go through one of these functions.
 * tenantId is always the first parameter and always lands in the Prisma
 * `where` clause, so a query can't accidentally return another tenant's
 * rows even if a caller passes an ID that belongs to a different tenant.
 */

export interface ProductInput {
  name: string;
  price: number;
  stock: number;
  sku: string;
}

export function listProducts(tenantId: string) {
  return prisma.product.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export function findProduct(tenantId: string, productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, tenantId },
  });
}

export function createProduct(tenantId: string, data: ProductInput) {
  return prisma.product.create({
    data: { ...data, tenantId },
  });
}

export async function updateProduct(tenantId: string, productId: string, data: Partial<ProductInput>) {
  const { count } = await prisma.product.updateMany({
    where: { id: productId, tenantId },
    data,
  });
  return count > 0;
}

export async function deleteProduct(tenantId: string, productId: string) {
  const { count } = await prisma.product.deleteMany({
    where: { id: productId, tenantId },
  });
  return count > 0;
}

export function findWhatsAppConnection(tenantId: string) {
  return prisma.whatsAppConnection.findUnique({ where: { tenantId } });
}

export function upsertWhatsAppConnection(
  tenantId: string,
  data: {
    provider: "WAHA" | "META";
    status: "DISCONNECTED" | "CONNECTING" | "QR_PENDING" | "CONNECTED" | "FAILED";
    phoneNumber?: string | null;
    credentialsEncrypted: string;
  }
) {
  return prisma.whatsAppConnection.upsert({
    where: { tenantId },
    create: { tenantId, ...data },
    update: data,
  });
}

export function updateWhatsAppConnectionStatus(
  tenantId: string,
  status: "DISCONNECTED" | "CONNECTING" | "QR_PENDING" | "CONNECTED" | "FAILED"
) {
  return prisma.whatsAppConnection.updateMany({
    where: { tenantId },
    data: { status },
  });
}

export function updateWhatsAppConnectionPhoneNumber(tenantId: string, phoneNumber: string) {
  return prisma.whatsAppConnection.updateMany({
    where: { tenantId },
    data: { phoneNumber },
  });
}

export interface MessageInput {
  connectionId: string;
  direction: "IN" | "OUT";
  providerMessageId: string;
  fromNumber: string;
  toNumber: string;
  content: string;
  status?: string;
}

/** Returns the created row, or null if a message with this providerMessageId already exists for this tenant (idempotent no-op). */
export async function createMessageIfNotExists(tenantId: string, data: MessageInput) {
  let message;
  try {
    message = await prisma.message.create({ data: { ...data, tenantId } });
  } catch (err) {
    const isUniqueViolation = typeof err === "object" && err !== null && "code" in err && err.code === "P2002";
    if (isUniqueViolation) return null;
    throw err;
  }
  const contactNumber = data.direction === "IN" ? data.fromNumber : data.toNumber;
  await touchConversationSummary(tenantId, contactNumber, message.createdAt, data.content, data.direction);
  return message;
}

export function listMessages(tenantId: string) {
  return prisma.message.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
}

/** Ascending order (oldest first) — the shape AI chat history needs. */
export async function listRecentMessagesForContact(tenantId: string, contactNumber: string, limit: number) {
  const rows = await prisma.message.findMany({
    where: {
      tenantId,
      OR: [{ fromNumber: contactNumber }, { toNumber: contactNumber }],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.reverse();
}

export function findAiSettings(tenantId: string) {
  return prisma.aiSettings.findUnique({ where: { tenantId } });
}

export function upsertAiSettings(
  tenantId: string,
  data: { provider: "OPENAI" | "GEMINI" | "CLAUDE" | "GROQ" | "OPENROUTER"; apiKeyEncrypted: string; model: string }
) {
  return prisma.aiSettings.upsert({
    where: { tenantId },
    create: { tenantId, ...data },
    update: data,
  });
}

export function findConversationState(tenantId: string, contactNumber: string) {
  return prisma.conversationState.findUnique({
    where: { tenantId_contactNumber: { tenantId, contactNumber } },
  });
}

export function pauseAiForContact(tenantId: string, contactNumber: string, until: Date) {
  return prisma.conversationState.upsert({
    where: { tenantId_contactNumber: { tenantId, contactNumber } },
    create: { tenantId, contactNumber, aiPausedUntil: until },
    update: { aiPausedUntil: until },
  });
}

/** Called on every inbound/outbound message so the chat list has an up-to-date summary row per contact. */
export function touchConversationSummary(
  tenantId: string,
  contactNumber: string,
  lastMessageAt: Date,
  lastMessagePreview: string,
  lastMessageDirection: "IN" | "OUT"
) {
  return prisma.conversationState.upsert({
    where: { tenantId_contactNumber: { tenantId, contactNumber } },
    create: { tenantId, contactNumber, lastMessageAt, lastMessagePreview, lastMessageDirection },
    update: { lastMessageAt, lastMessagePreview, lastMessageDirection },
  });
}

export function renameContact(tenantId: string, contactNumber: string, displayName: string | null) {
  return prisma.conversationState.upsert({
    where: { tenantId_contactNumber: { tenantId, contactNumber } },
    create: { tenantId, contactNumber, displayName },
    update: { displayName },
  });
}

export function listConversations(tenantId: string, search?: string) {
  return prisma.conversationState.findMany({
    where: {
      tenantId,
      lastMessageAt: { not: null },
      ...(search
        ? {
            OR: [
              { contactNumber: { contains: search, mode: "insensitive" } },
              { displayName: { contains: search, mode: "insensitive" } },
              { lastMessagePreview: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { lastMessageAt: "desc" },
  });
}

/** Whether this contact's 24h Meta customer-service window is currently open (their last inbound message was < 24h ago). */
export function isWithin24hWindow(conversation: { lastMessageAt: Date | null; lastMessageDirection: string | null } | null) {
  if (!conversation?.lastMessageAt) return false;
  const lastInboundAt =
    conversation.lastMessageDirection === "IN" ? conversation.lastMessageAt : null;
  if (!lastInboundAt) return false;
  return Date.now() - lastInboundAt.getTime() < 24 * 60 * 60 * 1000;
}

export interface BroadcastInput {
  message: string;
  templateName?: string;
  templateLang?: string;
  recipients: string[];
}

export function createBroadcast(tenantId: string, data: BroadcastInput) {
  return prisma.broadcast.create({
    data: {
      tenantId,
      message: data.message,
      templateName: data.templateName,
      templateLang: data.templateLang,
      recipients: {
        create: data.recipients.map((contactNumber) => ({ contactNumber })),
      },
    },
    include: { recipients: true },
  });
}

export function findBroadcast(tenantId: string, broadcastId: string) {
  return prisma.broadcast.findFirst({
    where: { id: broadcastId, tenantId },
    include: { recipients: true },
  });
}

export function listBroadcasts(tenantId: string) {
  return prisma.broadcast.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { recipients: true } } },
  });
}

export function updateBroadcastStatus(
  broadcastId: string,
  status: "DRAFT" | "RUNNING" | "COMPLETED" | "FAILED",
  extra?: { startedAt?: Date; completedAt?: Date }
) {
  return prisma.broadcast.update({
    where: { id: broadcastId },
    data: { status, ...extra },
  });
}

export function updateBroadcastRecipientStatus(
  recipientId: string,
  status: "PENDING" | "SENT" | "FAILED" | "SKIPPED",
  extra?: { sentAt?: Date; error?: string }
) {
  return prisma.broadcastRecipient.update({
    where: { id: recipientId },
    data: { status, ...extra },
  });
}

export function findFollowUpSettings(tenantId: string) {
  return prisma.followUpSettings.findUnique({ where: { tenantId } });
}

export function upsertFollowUpSettings(
  tenantId: string,
  data: { enabled: boolean; delayHours: number; message: string }
) {
  return prisma.followUpSettings.upsert({
    where: { tenantId },
    create: { tenantId, ...data },
    update: data,
  });
}

export function listAllEnabledFollowUpSettings() {
  return prisma.followUpSettings.findMany({ where: { enabled: true } });
}

/** Conversations whose last message was inbound (unanswered) and older than the cutoff. */
export function findStaleUnansweredConversations(tenantId: string, cutoff: Date) {
  return prisma.conversationState.findMany({
    where: {
      tenantId,
      lastMessageDirection: "IN",
      lastMessageAt: { lte: cutoff },
    },
  });
}
