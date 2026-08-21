import { Router } from "express";
import { z } from "zod";
import { requireAuth, getAuth } from "../middleware/auth";
import { encryptCredentials } from "../lib/crypto";
import { findAiSettings, upsertAiSettings } from "../lib/tenantScope";

export const aiRouter = Router();
aiRouter.use(requireAuth);

const settingsSchema = z.object({
  provider: z.enum(["OPENAI", "GEMINI", "CLAUDE", "GROQ", "OPENROUTER"]),
  apiKey: z.string().min(1),
  model: z.string().min(1),
});

aiRouter.post("/settings", async (req, res) => {
  const { tenantId } = getAuth(req);
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const { provider, apiKey, model } = parsed.data;
  const settings = await upsertAiSettings(tenantId, {
    provider,
    model,
    apiKeyEncrypted: encryptCredentials(apiKey),
  });
  res.status(201).json({ settings: { provider: settings.provider, model: settings.model } });
});

aiRouter.get("/settings", async (req, res) => {
  const { tenantId } = getAuth(req);
  const settings = await findAiSettings(tenantId);
  if (!settings) {
    res.json({ settings: null });
    return;
  }
  res.json({ settings: { provider: settings.provider, model: settings.model } });
});
