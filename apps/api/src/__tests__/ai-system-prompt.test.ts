import { describe, expect, it } from "vitest";
import { buildSystemPrompt, HANDOFF_SENTINEL } from "../lib/ai/systemPrompt";

describe("buildSystemPrompt", () => {
  it("grounds the prompt in the exact product data passed in, not hardcoded values", () => {
    const prompt = buildSystemPrompt("Toko Kopi Enak", [
      { name: "Kopi Robusta 250g", price: "45000.00", stock: 12, sku: "KOPI-ROB-250" },
    ]);
    expect(prompt).toContain("Toko Kopi Enak");
    expect(prompt).toContain("Kopi Robusta 250g");
    expect(prompt).toContain("Rp45000.00");
    expect(prompt).toContain("stok: 12");
    // Nothing about a *different* product should appear — proves the prompt isn't a static template.
    expect(prompt).not.toContain("Kopi Arabika");
  });

  it("tells the model to say so and hand off when the catalog is empty", () => {
    const prompt = buildSystemPrompt("Toko Baru", []);
    expect(prompt).toContain("belum punya produk terdaftar");
    expect(prompt).toContain(HANDOFF_SENTINEL);
  });

  it("instructs the model to never invent data outside the given catalog", () => {
    const prompt = buildSystemPrompt("Toko X", [{ name: "A", price: "1000", stock: 1, sku: "A" }]);
    expect(prompt.toLowerCase()).toContain("jangan");
    expect(prompt).toContain(HANDOFF_SENTINEL);
  });
});
