import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PromptEditorProps {
  onGenerate: (options: {
    lighting: string;
    background: string;
    style: string;
    contentType: "feed" | "story";
  }) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const ASPECT_RATIOS: {
  value: string;
  label: string;
  contentType: "feed" | "story";
  width: number;
  height: number;
}[] = [
  { value: "1:1", label: "1:1 Feed", contentType: "feed", width: 32, height: 32 },
  { value: "4:5", label: "4:5 Portrait", contentType: "feed", width: 26, height: 32 },
  { value: "16:9", label: "16:9 Landscape", contentType: "feed", width: 32, height: 18 },
  { value: "9:16", label: "9:16 Story", contentType: "story", width: 18, height: 32 },
];

const LIGHTING_PRESETS = [
  { value: "", label: "Default" },
  { value: "soft natural lighting", label: "Natural" },
  { value: "warm studio lighting", label: "Warm Studio" },
  { value: "cool blue lighting", label: "Cool Blue" },
  { value: "golden hour lighting", label: "Golden Hour" },
  { value: "dramatic side lighting", label: "Dramatic" },
];

const BACKGROUND_PRESETS = [
  { value: "", label: "Default" },
  { value: "white studio background", label: "White Studio" },
  { value: "minimalist clean background", label: "Minimalist" },
  { value: "wooden table surface", label: "Wood Table" },
  { value: "marble surface", label: "Marble" },
  { value: "gradient pastel background", label: "Pastel" },
  { value: "nature outdoor background", label: "Nature" },
];

const STYLE_PRESETS = [
  { value: "", label: "Default" },
  { value: "minimalist product photography", label: "Minimalis" },
  { value: "luxury premium product shot", label: "Premium" },
  { value: "lifestyle product photography", label: "Lifestyle" },
  { value: "flat lay product arrangement", label: "Flat Lay" },
  { value: "close-up macro detail shot", label: "Macro" },
  { value: "editorial product styling", label: "Editorial" },
];

export function PromptEditor({ onGenerate, isGenerating, disabled }: PromptEditorProps) {
  const [lighting, setLighting] = useState("");
  const [background, setBackground] = useState("");
  const [style, setStyle] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const handleGenerate = () => {
    const contentType = ASPECT_RATIOS.find((r) => r.value === aspectRatio)?.contentType ?? "feed";
    onGenerate({ lighting, background, style, contentType });
  };

  return (
    <div className="space-y-5">
      {/* Aspect Ratio */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Rasio Gambar</Label>
        <div className="grid grid-cols-2 gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => setAspectRatio(ratio.value)}
              disabled={disabled || isGenerating}
              aria-pressed={aspectRatio === ratio.value}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 rounded-lg border-2 transition-all",
                aspectRatio === ratio.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center">
                <div
                  className="rounded-sm border-2 border-current"
                  style={{ width: ratio.width, height: ratio.height }}
                />
              </div>
              <span className="text-[10px] font-medium">{ratio.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lighting */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Pencahayaan</Label>
        <div className="flex flex-wrap gap-1.5">
          {LIGHTING_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setLighting(preset.value)}
              disabled={disabled || isGenerating}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-all border",
                lighting === preset.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Background */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Background</Label>
        <div className="flex flex-wrap gap-1.5">
          {BACKGROUND_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setBackground(preset.value)}
              disabled={disabled || isGenerating}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-all border",
                background === preset.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Gaya Foto</Label>
        <div className="flex flex-wrap gap-1.5">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setStyle(preset.value)}
              disabled={disabled || isGenerating}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-all border",
                style === preset.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={disabled || isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Image
          </>
        )}
      </Button>
    </div>
  );
}
