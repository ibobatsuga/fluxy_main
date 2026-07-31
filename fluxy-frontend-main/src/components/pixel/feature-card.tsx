import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Images, Sparkles } from "lucide-react";
import { PIXEL_CATEGORY_META } from "@/data/pixel-categories";
import type { PixelFeature } from "@/api/pixel";

interface FeatureCardProps {
  feature: PixelFeature;
  onSelect: () => void;
}

export function FeatureCard({ feature, onSelect }: FeatureCardProps) {
  const meta = PIXEL_CATEGORY_META[feature.category];
  const Icon = meta?.icon ?? Sparkles;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      className="cursor-pointer transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta?.className ?? "bg-primary/10 text-primary"}`}>
            <Icon className="h-5 w-5" />
          </div>
          {feature.multi_image && (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Images className="h-3 w-3" /> Multi
            </Badge>
          )}
        </div>
        <p className="mt-3 text-sm font-semibold">{feature.name}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
      </CardContent>
    </Card>
  );
}
