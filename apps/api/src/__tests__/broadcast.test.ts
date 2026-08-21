import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";
import { encryptCredentials } from "../lib/crypto";
import { isWithin24hWindow } from "../lib/tenantScope";
import { WAHA_BROADCAST_DAILY_CAP } from "../lib/broadcast/rateLimit";

describe("isWithin24hWindow", () => {
  it("is false when there is no conversation", () => {
    expect(isWithin24hWindow(null)).toBe(false);
  });

  it("is false when the last message was outbound (we spoke last, not them)", () => {
    expect(isWithin24hWindow({ lastMessageAt: new Date(), lastMessageDirection: "OUT" })).toBe(false);
  });

  it("is true when the customer messaged within the last 24 hours", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    expect(isWithin24hWindow({ lastMessageAt: oneHourAgo, lastMessageDirection: "IN" })).toBe(true);
  });

  it("is false once 24 hours have passed since the customer's last message", () => {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    expect(isWithin24hWindow({ lastMessageAt: twoDaysAgo, lastMessageDirection: "IN" })).toBe(false);
  });
});

const app = createApp();
const runId = Date.now();
const tenantAEmail = `bc-owner-a-${runId}@test.local`;
const tenantBEmail = `bc-owner-b-${runId}@test.local`;

describe("broadcast", () => {
  let tenantAId: string;
  let tenantBId: string;
  const agentA = request.agent(app);
  const agentB = request.agent(app);

  beforeAll(async () => {
    const registerA = await agentA
      .post("/auth/register")
      .send({ tenantName: "Toko BC A", email: tenantAEmail, password: "password123" });
    tenantAId = registerA.body.tenant.id;

    const registerB = await agentB
      .post("/auth/register")
      .send({ tenantName: "Toko BC B", email: tenantBEmail, password: "password123" });
    tenantBId = registerB.body.tenant.id;

    await prisma.whatsAppConnection.create({
      data: {
        tenantId: tenantAId,
        provider: "WAHA",
        status: "CONNECTED",
        phoneNumber: "6281111111111",
        credentialsEncrypted: encryptCredentials(JSON.stringify({ sessionName: tenantAId, hmacSecret: "x" })),
      },
    });

    // A known contact — broadcasts are only allowed to contacts with an existing conversation.
    await prisma.conversationState.create({
      data: {
        tenantId: tenantAId,
        contactNumber: "628123123123",
        lastMessageAt: new Date(),
        lastMessagePreview: "hi",
        lastMessageDirection: "IN",
      },
    });
  });

  afterAll(async () => {
    await prisma.broadcastRecipient.deleteMany({ where: { broadcast: { tenantId: { in: [tenantAId, tenantBId] } } } });
    await prisma.broadcast.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.conversationState.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.whatsAppConnection.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.user.deleteMany({ where: { email: { in: [tenantAEmail, tenantBEmail] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
    await prisma.$disconnect();
  });

  it("rejects a WAHA broadcast with more recipients than the safety cap", async () => {
    const recipients = Array.from({ length: WAHA_BROADCAST_DAILY_CAP + 1 }, (_, i) => `6280000${String(i).padStart(5, "0")}`);
    const res = await agentA.post("/broadcast").send({ message: "Halo", recipients });
    expect(res.status).toBe(422);
    expect(res.body.error).toContain("ban risk");
  });

  it("rejects recipients that have no existing conversation", async () => {
    const res = await agentA.post("/broadcast").send({ message: "Halo", recipients: ["628999999999"] });
    expect(res.status).toBe(422);
    expect(res.body.unknownRecipients).toEqual(["628999999999"]);
  });

  it("creates a broadcast for known contacts, all recipients start PENDING", async () => {
    const res = await agentA.post("/broadcast").send({ message: "Promo hari ini!", recipients: ["628123123123"] });
    expect(res.status).toBe(201);
    expect(res.body.broadcast.recipients).toHaveLength(1);
    expect(res.body.broadcast.recipients[0].status).toBe("PENDING");
  });

  it("does not leak Tenant A's broadcasts to Tenant B", async () => {
    const listRes = await agentB.get("/broadcast");
    expect(listRes.status).toBe(200);
    expect(listRes.body.broadcasts).toHaveLength(0);

    const listA = await agentA.get("/broadcast");
    const broadcastId = listA.body.broadcasts[0].id;
    const crossTenantGet = await agentB.get(`/broadcast/${broadcastId}`);
    expect(crossTenantGet.status).toBe(404);
  });

  it("rejects broadcast creation without a connected WhatsApp connection", async () => {
    const res = await agentB.post("/broadcast").send({ message: "Halo", recipients: ["628123123123"] });
    expect(res.status).toBe(409);
  });
});
