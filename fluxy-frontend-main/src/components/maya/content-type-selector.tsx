import { Film, GalleryHorizontal, ImageIcon, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MayaContentType } from "@/api/maya";

const CONTENT_TYPES_BY_PROVIDER: Record<string, { value: MayaContentType; label: string; icon: typeof ImageIcon }[]> = {
  instagram: [
    { value: "story", label: "Story", icon: Timer },
    { value: "feed", label: "Feed", icon: ImageIcon },
    { value: "carousel", label: "Carousel", icon: GalleryHorizontal },
    { value: "reel", label: "Reel", icon: Film },
  ],
  tiktok: [
    { value: "story", label: "Story", icon: Timer },
    { value: "feed", label: "Feed", icon: ImageIcon },
  ],
};

interface ContentTypeSelectorProps {
  providers: string[];
  value: MayaContentType | null;
  onChange: (type: MayaContentType) => void;
  disabled?: boolean;
}

export function ContentTypeSelector({ providers, value, onChange, disabled }: ContentTypeSelectorProps) {
  if (providers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
        Pilih platform tujuan terlebih dahulu untuk melihat jenis konten yang tersedia
      </p>
    );
  }

  const optionLists = providers.map((p) => CONTENT_TYPES_BY_PROVIDER[p] || []);
  const availableTypes = optionLists.reduce((acc, list) =>
    acc.filter((opt) => list.some((o) => o.value === opt.value))
  );

  if (availableTypes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
        Tidak ada jenis konten yang kompatibel untuk kombinasi platform ini
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.value;
        return (
          <button
            type="button"
            key={type.value}
            onClick={() => onChange(type.value)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {type.label}
          </button>
        );
      })}
    </div>
  );
}
