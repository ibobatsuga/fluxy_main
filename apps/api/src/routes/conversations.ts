import { Router } from "express";
import { z } from "zod";
import { requireAuth, getAuth } from "../middleware/auth";
import { listConversations, listRecentMessagesForContact, renameContact } from "../lib/tenantScope";

export const conversationsRouter = Router();
conversationsRouter.use(requireAuth);

conversationsRouter.get("/", async (req, res) => {
  const { tenantId } = getAuth(req);
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const conversations = await listConversations(tenantId, q);
  res.json({ conversations });
});

conversationsRouter.get("/:contactNumber/messages", async (req, res) => {
  const { tenantId } = getAuth(req);
  const messages = await listRecentMessagesForContact(tenantId, req.params.contactNumber, 200);
  res.json({ messages });
});

const renameSchema = z.object({ name: z.string().min(1).max(100).nullable() });

conversationsRouter.patch("/:contactNumber", async (req, res) => {
  const { tenantId } = getAuth(req);
  const parsed = renameSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const conversation = await renameContact(tenantId, req.params.contactNumber, parsed.data.name);
  res.json({ conversation });
});
