import {
  Eye,
  Wand2,
  Palette,
  Briefcase,
  Heart,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export const PIXEL_CATEGORIES = [
  "Vision AI",
  "Edit Cepat",
  "Creative",
  "Professional",
  "Special Moments",
  "Marketing",
] as const;

export const PIXEL_CATEGORY_META: Record<string, { icon: LucideIcon; className: string }> = {
  "Vision AI": { icon: Eye, className: "bg-cyan-500/10 text-cyan-600" },
  "Edit Cepat": { icon: Wand2, className: "bg-indigo-500/10 text-indigo-600" },
  Creative: { icon: Palette, className: "bg-fuchsia-500/10 text-fuchsia-600" },
  Professional: { icon: Briefcase, className: "bg-blue-500/10 text-blue-600" },
  "Special Moments": { icon: Heart, className: "bg-rose-500/10 text-rose-600" },
  Marketing: { icon: Megaphone, className: "bg-amber-500/10 text-amber-600" },
};
