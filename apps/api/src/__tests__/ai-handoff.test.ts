import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";
import { encryptCredentials } from "../lib/crypto";

const app = createApp();
const runId = Date.now();
const tenantAEmail = `ai-owner-a-${runId}@test.local`;
const tenantBEmail = `ai-owner-b-${runId}@test.local`;

describe("AI settings and manual handoff", () => {
  let tenantAId: string;
  let tenantBId: string;
  const agentA = request.agent(app);
  const agentB = request.agent(app);

  beforeAll(async () => {
    const registerA = await agentA
      .post("/auth/register")
      .send({ tenantName: "Toko AI A", email: tenantAEmail, password: "password123" });
    tenantAId = registerA.body.tenant.id;

    const registerB = await agentB
      .post("/auth/register")
      .send({ tenantName: "Toko AI B", email: tenantBEmail, password: "password123" });
    tenantBId = registerB.body.tenant.id;

    await prisma.whatsAppConnection.create({
      data: {
        tenantId: tenantAId,
        provider: "WAHA",
        status: "CONNECTED",
        phoneNumber: "6281111111111",
        credentialsEncrypted: encryptCredentials(
          JSON.stringify({ sessionName: tenantAId, hmacSecret: "irrelevant-for-this-test" })
        ),
      },
    });
  });

  afterAll(async () => {
    await prisma.conversationState.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.aiSettings.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.whatsAppConnection.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.user.deleteMany({ where: { email: { in: [tenantAEmail, tenantBEmail] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
    await prisma.$disconnect();
  });

  it("has no AI settings before configuring", async () => {
    const res = await agentA.get("/ai/settings");
    expect(res.status).toBe(200);
    expect(res.body.settings).toBeNull();
  });

  it("saves BYOK settings without ever returning the API key", async () => {
    const res = await agentA
      .post("/ai/settings")
      .send({ provider: "OPENAI", apiKey: "sk-super-secret-key", model: "gpt-4o-mini" });
    expect(res.status).toBe(201);
    expect(res.body.settings).toEqual({ provider: "OPENAI", model: "gpt-4o-mini" });
    expect(JSON.stringify(res.body)).not.toContain("sk-super-secret-key");

    const stored = await prisma.aiSettings.findUnique({ where: { tenantId: tenantAId } });
    expect(stored?.apiKeyEncrypted).not.toContain("sk-super-secret-key");

    const getRes = await agentA.get("/ai/settings");
    expect(getRes.body.settings).toEqual({ provider: "OPENAI", model: "gpt-4o-mini" });
  });

  it("does not leak Tenant A's AI settings to Tenant B", async () => {
    const res = await agentB.get("/ai/settings");
    expect(res.status).toBe(200);
    expect(res.body.settings).toBeNull();
  });

  it("pauses AI for a contact when staff sends a manual reply, and it is scoped per tenant", async () => {
    const contact = "628999999999";

    const before = await prisma.conversationState.findUnique({
      where: { tenantId_contactNumber: { tenantId: tenantAId, contactNumber: contact } },
    });
    expect(before).toBeNull();

    const res = await agentA.post("/whatsapp/send").send({ to: contact, text: "Halo dari staff" });
    expect(res.status).toBe(202);

    const after = await prisma.conversationState.findUnique({
      where: { tenantId_contactNumber: { tenantId: tenantAId, contactNumber: contact } },
    });
    expect(after?.aiPausedUntil).not.toBeNull();
    expect(after!.aiPausedUntil!.getTime()).toBeGreaterThan(Date.now());

    // Tenant B never sent anything for this contact — no row should exist under Tenant B.
    const crossTenant = await prisma.conversationState.findUnique({
      where: { tenantId_contactNumber: { tenantId: tenantBId, contactNumber: contact } },
    });
    expect(crossTenant).toBeNull();
  });
});
