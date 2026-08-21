import crypto from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";
import { encryptCredentials } from "../lib/crypto";

const app = createApp();
const runId = Date.now();
const tenantAEmail = `wa-owner-a-${runId}@test.local`;
const tenantBEmail = `wa-owner-b-${runId}@test.local`;
const hmacSecretA = "hmac-secret-tenant-a";

function sign(secret: string, body: string) {
  return crypto.createHmac("sha512", secret).update(body).digest("hex");
}

describe("whatsapp webhook", () => {
  let tenantAId: string;
  let tenantBId: string;
  let connectionAId: string;
  const agentA = request.agent(app);
  const agentB = request.agent(app);

  beforeAll(async () => {
    const registerA = await agentA
      .post("/auth/register")
      .send({ tenantName: "Toko WA A", email: tenantAEmail, password: "password123" });
    tenantAId = registerA.body.tenant.id;

    const registerB = await agentB
      .post("/auth/register")
      .send({ tenantName: "Toko WA B", email: tenantBEmail, password: "password123" });
    tenantBId = registerB.body.tenant.id;

    // Bypass the real WAHA session-creation HTTP call — that path is covered by a live manual
    // smoke test against the running WAHA container. This test targets the webhook handler itself.
    const connection = await prisma.whatsAppConnection.create({
      data: {
        tenantId: tenantAId,
        provider: "WAHA",
        status: "CONNECTED",
        phoneNumber: "6281111111111",
        credentialsEncrypted: encryptCredentials(
          JSON.stringify({ sessionName: tenantAId, hmacSecret: hmacSecretA })
        ),
      },
    });
    connectionAId = connection.id;
  });

  afterAll(async () => {
    await prisma.message.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.whatsAppConnection.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.user.deleteMany({ where: { email: { in: [tenantAEmail, tenantBEmail] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
    await prisma.$disconnect();
  });

  it("stores an inbound message when the HMAC signature is valid", async () => {
    const envelope = {
      id: "evt_first_delivery",
      timestamp: Date.now(),
      session: tenantAId,
      event: "message",
      payload: { id: `false_628999@c.us_${runId}`, from: "628999999999@c.us", body: "Halo", fromMe: false },
    };
    const raw = JSON.stringify(envelope);
    const res = await request(app)
      .post(`/whatsapp/webhook/waha/${tenantAId}`)
      .set("Content-Type", "application/json")
      .set("X-Webhook-Hmac", sign(hmacSecretA, raw))
      .send(raw);
    expect(res.status).toBe(200);

    const stored = await prisma.message.findFirst({
      where: { tenantId: tenantAId, providerMessageId: envelope.payload.id },
    });
    expect(stored).not.toBeNull();
    expect(stored?.content).toBe("Halo");
  });

  it("does not store the same message twice when WAHA redelivers with a new envelope id", async () => {
    const providerMessageId = `false_628888@c.us_${runId}`;
    const buildEnvelope = (envelopeId: string) => ({
      id: envelopeId,
      timestamp: Date.now(),
      session: tenantAId,
      event: "message",
      payload: { id: providerMessageId, from: "628888888888@c.us", body: "Retry me", fromMe: false },
    });

    for (const envelopeId of ["evt_retry_1", "evt_retry_2_different_id"]) {
      const envelope = buildEnvelope(envelopeId);
      const raw = JSON.stringify(envelope);
      const res = await request(app)
        .post(`/whatsapp/webhook/waha/${tenantAId}`)
        .set("Content-Type", "application/json")
        .set("X-Webhook-Hmac", sign(hmacSecretA, raw))
        .send(raw);
      expect(res.status).toBe(200);
    }

    const count = await prisma.message.count({ where: { tenantId: tenantAId, providerMessageId } });
    expect(count).toBe(1);
  });

  it("rejects a webhook with an invalid HMAC signature", async () => {
    const envelope = {
      id: "evt_forged",
      timestamp: Date.now(),
      session: tenantAId,
      event: "message",
      payload: { id: `false_forged@c.us_${runId}`, from: "628000000000@c.us", body: "Forged", fromMe: false },
    };
    const raw = JSON.stringify(envelope);
    const res = await request(app)
      .post(`/whatsapp/webhook/waha/${tenantAId}`)
      .set("Content-Type", "application/json")
      .set("X-Webhook-Hmac", sign("wrong-secret", raw))
      .send(raw);
    expect(res.status).toBe(401);

    const stored = await prisma.message.findFirst({ where: { providerMessageId: envelope.payload.id } });
    expect(stored).toBeNull();
  });

  it("rejects a forged webhook even if the attacker knows Tenant A's tenantId", async () => {
    // Tenant B has no connection at all; more importantly, without Tenant A's hmacSecret, no one
    // can produce a valid signature for Tenant A's tenantId path.
    const envelope = {
      id: "evt_cross_tenant",
      timestamp: Date.now(),
      session: tenantAId,
      event: "message",
      payload: { id: `false_xtenant@c.us_${runId}`, from: "628777777777@c.us", body: "Injected", fromMe: false },
    };
    const raw = JSON.stringify(envelope);
    const res = await request(app)
      .post(`/whatsapp/webhook/waha/${tenantAId}`)
      .set("Content-Type", "application/json")
      .set("X-Webhook-Hmac", sign("some-guessed-secret", raw))
      .send(raw);
    expect(res.status).toBe(401);
  });

  it("does not expose Tenant A's connection to Tenant B", async () => {
    const res = await agentB.get("/whatsapp/status");
    expect(res.status).toBe(200);
    expect(res.body.connection).toBeNull();
  });

  it("returns Tenant A's own connection to Tenant A", async () => {
    const res = await agentA.get("/whatsapp/status");
    expect(res.status).toBe(200);
    expect(res.body.connection.status).toBe("CONNECTED");
  });
});
