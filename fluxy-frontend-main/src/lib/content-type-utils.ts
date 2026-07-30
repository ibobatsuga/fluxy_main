import type { MayaContentType } from "@/api/maya";

// Fix #11: getAvailableContentTypes dipindah ke file .ts terpisah agar
// content-type-selector.tsx hanya mengekspor komponen React, mendukung Fast Refresh.

const CONTENT_TYPES_BY_PROVIDER: Record<string, MayaContentType[]> = {
  instagram: ["story", "feed", "carousel", "reel"],
  tiktok: ["story", "feed"],
};

export function getAvailableContentTypes(providers: string[]): MayaContentType[] {
  if (providers.length === 0) return [];
  const optionLists = providers.map((p) => CONTENT_TYPES_BY_PROVIDER[p] || []);
  return optionLists.reduce((acc, list) => acc.filter((opt) => list.includes(opt)));
}
