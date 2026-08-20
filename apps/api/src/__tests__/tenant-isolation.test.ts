import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";

const app = createApp();

// Unique-per-run emails so repeated `vitest run` invocations don't collide
// on the User.email unique constraint.
const runId = Date.now();
const tenantAEmail = `owner-a-${runId}@test.local`;
const tenantBEmail = `owner-b-${runId}@test.local`;

describe("tenant isolation", () => {
  let tenantAProductId: string;
  const agentA = request.agent(app);
  const agentB = request.agent(app);

  beforeAll(async () => {
    const registerA = await agentA
      .post("/auth/register")
      .send({ tenantName: "Toko A", email: tenantAEmail, password: "password123" });
    expect(registerA.status).toBe(201);

    const productA = await agentA
      .post("/products")
      .send({ name: "Produk A", price: 10000, stock: 5, sku: `SKU-A-${runId}` });
    expect(productA.status).toBe(201);
    tenantAProductId = productA.body.product.id;

    const registerB = await agentB
      .post("/auth/register")
      .send({ tenantName: "Toko B", email: tenantBEmail, password: "password123" });
    expect(registerB.status).toBe(201);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [tenantAEmail, tenantBEmail] } } });
    await prisma.tenant.deleteMany({ where: { name: { in: ["Toko A", "Toko B"] } } });
    await prisma.$disconnect();
  });

  it("blocks Tenant B from reading Tenant A's product by ID", async () => {
    const res = await agentB.get(`/products/${tenantAProductId}`);
    expect([403, 404]).toContain(res.status);
  });

  it("blocks Tenant B from updating Tenant A's product", async () => {
    const res = await agentB.put(`/products/${tenantAProductId}`).send({ stock: 999 });
    expect([403, 404]).toContain(res.status);

    // Confirm the underlying row was NOT modified.
    const stillOwnedByA = await prisma.product.findUnique({ where: { id: tenantAProductId } });
    expect(stillOwnedByA?.stock).toBe(5);
  });

  it("blocks Tenant B from deleting Tenant A's product", async () => {
    const res = await agentB.delete(`/products/${tenantAProductId}`);
    expect([403, 404]).toContain(res.status);

    const stillExists = await prisma.product.findUnique({ where: { id: tenantAProductId } });
    expect(stillExists).not.toBeNull();
  });

  it("excludes Tenant A's products from Tenant B's product list", async () => {
    const res = await agentB.get("/products");
    expect(res.status).toBe(200);
    const ids = res.body.products.map((p: { id: string }) => p.id);
    expect(ids).not.toContain(tenantAProductId);
  });

  it("rejects unauthenticated access entirely", async () => {
    const res = await request(app).get("/products");
    expect(res.status).toBe(401);
  });
});

describe("auth flow", () => {
  const email = `auth-flow-${runId}@test.local`;

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.tenant.deleteMany({ where: { name: "Toko Auth Flow" } });
  });

  it("registers a tenant and returns an OWNER user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ tenantName: "Toko Auth Flow", email, password: "password123" });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("OWNER");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("logs in with the registered credentials", async () => {
    const agent = request.agent(app);
    const res = await agent.post("/auth/login").send({ email, password: "password123" });
    expect(res.status).toBe(200);

    const me = await agent.get("/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app).post("/auth/login").send({ email, password: "wrong-password" });
    expect(res.status).toBe(401);
  });
});
