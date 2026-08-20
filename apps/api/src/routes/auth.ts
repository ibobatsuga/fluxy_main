import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signSession, sessionCookieOptions, SESSION_COOKIE } from "../lib/session";
import { requireAuth, getAuth } from "../middleware/auth";

export const authRouter = Router();

const registerSchema = z.object({
  tenantName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const { tenantName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { user, tenant } = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({ data: { name: tenantName } });
    const user = await tx.user.create({
      data: { tenantId: tenant.id, email, passwordHash, role: "OWNER" },
    });
    return { user, tenant };
  });

  const token = signSession({ userId: user.id, tenantId: tenant.id });
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions);
  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
    tenant: { id: tenant.id, name: tenant.name },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signSession({ userId: user.id, tenantId: user.tenantId });
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions);
  res.json({ user: { id: user.id, email: user.email, role: user.role } });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const { userId, tenantId } = getAuth(req);
  const user = await prisma.user.findFirst({ where: { id: userId, tenantId } });
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!user || !tenant) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({
    user: { id: user.id, email: user.email, role: user.role },
    tenant: { id: tenant.id, name: tenant.name },
  });
});
