-- AlterTable
ALTER TABLE "ConversationState" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "lastMessagePreview" TEXT;

-- CreateIndex
CREATE INDEX "ConversationState_tenantId_lastMessageAt_idx" ON "ConversationState"("tenantId", "lastMessageAt");
