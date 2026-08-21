-- CreateEnum
CREATE TYPE "AiProviderType" AS ENUM ('OPENAI', 'GEMINI', 'CLAUDE', 'GROQ', 'OPENROUTER');

-- CreateTable
CREATE TABLE "AiSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" "AiProviderType" NOT NULL,
    "apiKeyEncrypted" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationState" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "aiPausedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiSettings_tenantId_key" ON "AiSettings"("tenantId");

-- CreateIndex
CREATE INDEX "ConversationState_tenantId_idx" ON "ConversationState"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationState_tenantId_contactNumber_key" ON "ConversationState"("tenantId", "contactNumber");

-- AddForeignKey
ALTER TABLE "AiSettings" ADD CONSTRAINT "AiSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationState" ADD CONSTRAINT "ConversationState_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
