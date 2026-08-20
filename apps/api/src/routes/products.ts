import { Router } from "express";
import { z } from "zod";
import { requireAuth, getAuth } from "../middleware/auth";
import {
  createProduct,
  deleteProduct,
  findProduct,
  listProducts,
  updateProduct,
} from "../lib/tenantScope";

export const productsRouter = Router();
productsRouter.use(requireAuth);

const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  sku: z.string().min(1),
});

productsRouter.get("/", async (req, res) => {
  const { tenantId } = getAuth(req);
  res.json({ products: await listProducts(tenantId) });
});

productsRouter.get("/:id", async (req, res) => {
  const { tenantId } = getAuth(req);
  const product = await findProduct(tenantId, req.params.id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ product });
});

productsRouter.post("/", async (req, res) => {
  const { tenantId } = getAuth(req);
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const product = await createProduct(tenantId, parsed.data);
  res.status(201).json({ product });
});

productsRouter.put("/:id", async (req, res) => {
  const { tenantId } = getAuth(req);
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const updated = await updateProduct(tenantId, req.params.id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ product: await findProduct(tenantId, req.params.id) });
});

productsRouter.delete("/:id", async (req, res) => {
  const { tenantId } = getAuth(req);
  const deleted = await deleteProduct(tenantId, req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.status(204).send();
});
