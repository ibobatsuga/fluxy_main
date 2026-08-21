import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";
import { findStaleUnansweredConversations } from "../lib/tenantScope";

const app = createApp();
const runId = Date.now();
const tenantAEmail = `fu-owner-a-${runId}@test.local`;
const tenantBEmail = `fu-owner-b-${runId}@test.local`;

describe("follow-up settings", () => {
  let tenantAId: string;
  let tenantBId: string;
  const agentA = request.agent(app);
  const agentB = request.agent(app);

  beforeAll(async () => {
    const registerA = await agentA
      .post("/auth/register")
      .send({ tenantName: "Toko FU A", email: tenantAEmail, password: "password123" });
    tenantAId = registerA.body.tenant.id;

    const registerB = await agentB
      .post("/auth/register")
      .send({ tenantName: "Toko FU B", email: tenantBEmail, password: "password123" });
    tenantBId = registerB.body.tenant.id;
  });

  afterAll(async () => {
    await prisma.conversationState.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.followUpSettings.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.user.deleteMany({ where: { email: { in: [tenantAEmail, tenantBEmail] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
    await prisma.$disconnect();
  });

  it("has no settings before configuring", async () => {
    const res = await agentA.get("/followup/settings");
    expect(res.status).toBe(200);
    expect(res.body.settings).toBeNull();
  });

  it("saves follow-up settings", async () => {
    const res = await agentA.post("/followup/settings").send({ enabled: true, delayHours: 6, message: "Masih ada yang bisa dibantu?" });
    expect(res.status).toBe(201);
    expect(res.body.settings).toMatchObject({ enabled: true, delayHours: 6 });
  });

  it("does not leak Tenant A's follow-up settings to Tenant B", async () => {
    const res = await agentB.get("/followup/settings");
    expect(res.body.settings).toBeNull();
  });
});

describe("findStaleUnansweredConversations", () => {
  const runId2 = `${runId}-stale`;
  const email = `fu-stale-${runId}@test.local`;
  let tenantId: string;
  const agent = request.agent(app);

  beforeAll(async () => {
    const register = await agent.post("/auth/register").send({ tenantName: "Toko Stale", email, password: "password123" });
    tenantId = register.body.tenant.id;

    const cutoffHours = 6;
    const now = Date.now();
    await prisma.conversationState.createMany({
      data: [
        // Stale: last message inbound, 10h ago — should match a 6h cutoff.
        {
          tenantId,
          contactNumber: `${runId2}-stale-unanswered`,
          lastMessageDirection: "IN",
          lastMessageAt: new Date(now - 10 * 60 * 60 * 1000),
        },
        // Not stale: inbound but only 1h ago.
        {
          tenantId,
          contactNumber: `${runId2}-recent-unanswered`,
          lastMessageDirection: "IN",
          lastMessageAt: new Date(now - 1 * 60 * 60 * 1000),
        },
        // Already answered: last message outbound, even though it's old.
        {
          tenantId,
          contactNumber: `${runId2}-already-answered`,
          lastMessageDirection: "OUT",
          lastMessageAt: new Date(now - 10 * 60 * 60 * 1000),
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.conversationState.deleteMany({ where: { tenantId } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.tenant.deleteMany({ where: { id: tenantId } });
  });

  it("only returns conversations whose last message is inbound and older than the cutoff", async () => {
    const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const stale = await findStaleUnansweredConversations(tenantId, cutoff);
    const contacts = stale.map((c) => c.contactNumber);
    expect(contacts).toContain(`${runId2}-stale-unanswered`);
    expect(contacts).not.toContain(`${runId2}-recent-unanswered`);
    expect(contacts).not.toContain(`${runId2}-already-answered`);
  });
});
