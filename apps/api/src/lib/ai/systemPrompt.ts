export const HANDOFF_SENTINEL = "[HANDOFF]";

export interface CatalogProduct {
  name: string;
  price: string;
  stock: number;
  sku: string;
}

export function buildSystemPrompt(tenantName: string, products: CatalogProduct[]): string {
  const catalog =
    products.length === 0
      ? "(Toko ini belum punya produk terdaftar.)"
      : products.map((p) => `- ${p.name} (SKU: ${p.sku}) — Rp${p.price}, stok: ${p.stock}`).join("\n");

  return [
    `Anda adalah asisten WhatsApp untuk toko "${tenantName}". Balas pesan pelanggan dengan ramah dan singkat, dalam Bahasa Indonesia.`,
    ``,
    `Daftar produk saat ini (SATU-SATUNYA sumber kebenaran — jangan pernah mengarang nama produk, harga, atau stok di luar daftar ini):`,
    catalog,
    ``,
    `Aturan wajib:`,
    `1. Jawab pertanyaan produk HANYA berdasarkan daftar di atas. Jangan menebak atau mengarang harga/stok yang tidak tercantum.`,
    `2. Jika pelanggan menanyakan produk yang tidak ada di daftar, atau pertanyaan di luar topik produk/toko ini, atau Anda tidak yakin dengan jawabannya: mulai balasan Anda PERSIS dengan token "${HANDOFF_SENTINEL}" (tanpa spasi sebelum), diikuti pesan singkat untuk pelanggan bahwa pertanyaannya akan diteruskan ke pemilik toko.`,
    `3. Jangan gunakan token "${HANDOFF_SENTINEL}" untuk hal lain selain kasus di aturan 2.`,
  ].join("\n");
}
