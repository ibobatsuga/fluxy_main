import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";
import { encryptCredentials } from "../lib/crypto";
import { createMessageIfNotExists } from "../lib/tenantScope";

const app = createApp();
const runId = Date.now();
const tenantAEmail = `conv-owner-a-${runId}@test.local`;
const tenantBEmail = `conv-owner-b-${runId}@test.local`;

describe("conversations", () => {
  let tenantAId: string;
  let tenantBId: string;
  let connectionAId: string;
  const agentA = request.agent(app);
  const agentB = request.agent(app);

  beforeAll(async () => {
    const registerA = await agentA
      .post("/auth/register")
      .send({ tenantName: "Toko Conv A", email: tenantAEmail, password: "password123" });
    tenantAId = registerA.body.tenant.id;

    const registerB = await agentB
      .post("/auth/register")
      .send({ tenantName: "Toko Conv B", email: tenantBEmail, password: "password123" });
    tenantBId = registerB.body.tenant.id;

    const connection = await prisma.whatsAppConnection.create({
      data: {
        tenantId: tenantAId,
        provider: "WAHA",
        status: "CONNECTED",
        phoneNumber: "6281111111111",
        credentialsEncrypted: encryptCredentials(JSON.stringify({ sessionName: tenantAId, hmacSecret: "x" })),
      },
    });
    connectionAId = connection.id;
  });

  afterAll(async () => {
    await prisma.message.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.conversationState.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.whatsAppConnection.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.user.deleteMany({ where: { email: { in: [tenantAEmail, tenantBEmail] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
    await prisma.$disconnect();
  });

  it("creates a conversation summary automatically when a message is stored", async () => {
    await createMessageIfNotExists(tenantAId, {
      connectionId: connectionAId,
      direction: "IN",
      providerMessageId: `msg-${runId}-1`,
      fromNumber: "628123123123",
      toNumber: "6281111111111",
      content: "Halo, ada kopi?",
    });

    const res = await agentA.get("/conversations");
    expect(res.status).toBe(200);
    const convo = res.body.conversations.find((c: { contactNumber: string }) => c.contactNumber === "628123123123");
    expect(convo).toBeDefined();
    expect(convo.lastMessagePreview).toBe("Halo, ada kopi?");
  });

  it("does not leak Tenant A's conversations to Tenant B", async () => {
    const res = await agentB.get("/conversations");
    expect(res.status).toBe(200);
    expect(res.body.conversations).toHaveLength(0);
  });

  it("returns full message history for a contact, isolated per tenant", async () => {
    const okRes = await agentA.get("/conversations/628123123123/messages");
    expect(okRes.status).toBe(200);
    expect(okRes.body.messages).toHaveLength(1);

    const leakRes = await agentB.get("/conversations/628123123123/messages");
    expect(leakRes.status).toBe(200);
    expect(leakRes.body.messages).toHaveLength(0);
  });

  it("lets staff rename a contact, scoped to their own tenant", async () => {
    const res = await agentA.patch("/conversations/628123123123").send({ name: "Bu Sari" });
    expect(res.status).toBe(200);
    expect(res.body.conversation.displayName).toBe("Bu Sari");

    const listRes = await agentA.get("/conversations");
    const convo = listRes.body.conversations.find((c: { contactNumber: string }) => c.contactNumber === "628123123123");
    expect(convo.displayName).toBe("Bu Sari");

    // Tenant B renaming the same phone number must not affect Tenant A's row.
    await agentB.patch("/conversations/628123123123").send({ name: "Nama Lain" });
    const stillA = await prisma.conversationState.findUnique({
      where: { tenantId_contactNumber: { tenantId: tenantAId, contactNumber: "628123123123" } },
    });
    expect(stillA?.displayName).toBe("Bu Sari");
  });

  it("finds a conversation by search (contact number, name, or message preview)", async () => {
    const byName = await agentA.get("/conversations?q=Sari");
    expect(byName.body.conversations).toHaveLength(1);

    const byContent = await agentA.get("/conversations?q=kopi");
    expect(byContent.body.conversations).toHaveLength(1);

    const noMatch = await agentA.get("/conversations?q=tidak-ada-yang-cocok");
    expect(noMatch.body.conversations).toHaveLength(0);
  });
});

describe("conversations at scale (200 dummy conversations)", () => {
  const scaleRunId = `${runId}-scale`;
  const scaleEmail = `conv-scale-${runId}@test.local`;
  let tenantId: string;
  let connectionId: string;
  const agent = request.agent(app);

  beforeAll(async () => {
    const register = await agent
      .post("/auth/register")
      .send({ tenantName: "Toko Scale", email: scaleEmail, password: "password123" });
    tenantId = register.body.tenant.id;

    const connection = await prisma.whatsAppConnection.create({
      data: {
        tenantId,
        provider: "WAHA",
        status: "CONNECTED",
        phoneNumber: "6280000000000",
        credentialsEncrypted: encryptCredentials(JSON.stringify({ sessionName: tenantId, hmacSecret: "x" })),
      },
    });
    connectionId = connection.id;

    const messages = Array.from({ length: 200 }, (_, i) => ({
      tenantId,
      connectionId,
      direction: "IN" as const,
      providerMessageId: `${scaleRunId}-${i}`,
      fromNumber: `62800000${String(i).padStart(4, "0")}`,
      toNumber: "6280000000000",
      content: `Pesan dummy dari kontak ${i}`,
      createdAt: new Date(Date.now() - i * 1000),
    }));
    await prisma.message.createMany({ data: messages });
    // ConversationState summaries are normally upserted by createMessageIfNotExists on the live
    // path (webhook/worker) — seeded here directly since createMany bypasses that helper.
    await prisma.conversationState.createMany({
      data: messages.map((m) => ({
        tenantId,
        contactNumber: m.fromNumber,
        lastMessageAt: m.createdAt,
        lastMessagePreview: m.content,
      })),
    });
  });

  afterAll(async () => {
    await prisma.message.deleteMany({ where: { tenantId } });
    await prisma.conversationState.deleteMany({ where: { tenantId } });
    await prisma.whatsAppConnection.deleteMany({ where: { tenantId } });
    await prisma.user.deleteMany({ where: { email: scaleEmail } });
    await prisma.tenant.deleteMany({ where: { id: tenantId } });
  });

  it("lists all 200 conversations, sorted most-recent-first, within a reasonable time", async () => {
    const start = Date.now();
    const res = await agent.get("/conversations");
    const elapsedMs = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body.conversations).toHaveLength(200);
    expect(elapsedMs).toBeLessThan(2000);

    const timestamps = res.body.conversations.map((c: { lastMessageAt: string }) => new Date(c.lastMessageAt).getTime());
    const sorted = [...timestamps].sort((a, b) => b - a);
    expect(timestamps).toEqual(sorted);
  });

  it("search over 200 conversations still finds the right one", async () => {
    const res = await agent.get("/conversations?q=kontak 42");
    expect(res.status).toBe(200);
    expect(res.body.conversations.some((c: { lastMessagePreview: string }) => c.lastMessagePreview.includes("kontak 42"))).toBe(
      true
    );
  });
});
