import { Router } from "express";
import { z } from "zod";
import { requireAuth, getAuth } from "../middleware/auth";
import { findFollowUpSettings, upsertFollowUpSettings } from "../lib/tenantScope";

export const followUpRouter = Router();
followUpRouter.use(requireAuth);

const settingsSchema = z.object({
  enabled: z.boolean(),
  delayHours: z.number().int().min(1).max(24 * 30),
  message: z.string().min(1),
});

followUpRouter.get("/settings", async (req, res) => {
  const { tenantId } = getAuth(req);
  const settings = await findFollowUpSettings(tenantId);
  res.json({ settings });
});

followUpRouter.post("/settings", async (req, res) => {
  const { tenantId } = getAuth(req);
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const settings = await upsertFollowUpSettings(tenantId, parsed.data);
  res.status(201).json({ settings });
});
