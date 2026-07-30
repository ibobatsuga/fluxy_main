import { useState } from "react";
import { Trash2, ExternalLink, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { MediaItem } from "@/api/pixel";

interface GalleryGridProps {
  items: MediaItem[];
  isLoading: boolean;
  onSelect: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  onRegenerate?: (item: MediaItem) => void;
}

export function GalleryGrid({ items, isLoading, onSelect, onDelete, onRegenerate }: GalleryGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Eye}
        title="Belum ada gambar"
        description="Generate gambar produk pertama Anda menggunakan AI"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative cursor-pointer"
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onSelect(item)}
        >
          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted transition-all group-hover:border-primary/30 group-hover:shadow-md">
            <img
              src={item.url}
              alt="Generated image"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Hover overlay */}
          {hoveredId === item.id && (
            <div className="absolute inset-0 flex items-end rounded-xl bg-gradient-to-t from-black/60 via-transparent to-transparent p-2">
              <div className="flex w-full items-center justify-between">
                <Badge variant="secondary" className="text-[9px] bg-black/50 border-0">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </Badge>
                <div className="flex gap-1">
                  {onRegenerate && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-black/50 border-0 hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRegenerate(item);
                      }}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 bg-black/50 border-0 hover:bg-black/70"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.url, "_blank");
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 bg-black/50 border-0 hover:bg-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
