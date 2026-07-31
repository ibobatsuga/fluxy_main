import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { PixelFeature } from "@/api/pixel";

interface InstructionEditorProps {
  feature: PixelFeature;
  instruction: string;
  onInstructionChange: (value: string) => void;
  contentType: "feed" | "story";
  onContentTypeChange: (value: "feed" | "story") => void;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function InstructionEditor({
  feature,
  instruction,
  onInstructionChange,
  contentType,
  onContentTypeChange,
  onGenerate,
  isGenerating,
  disabled,
}: InstructionEditorProps) {
  return (
    <div className="space-y-5">
      {!feature.text_output && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Rasio Gambar</Label>
          <div className="flex gap-2">
            {(["feed", "story"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onContentTypeChange(value)}
                disabled={disabled || isGenerating}
                className={cn(
                  "flex-1 rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all",
                  contentType === value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                {value === "feed" ? "1:1 Feed" : "9:16 Story"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs font-medium">
          Instruksi {feature.requires_prompt ? "(wajib)" : "(opsional)"}
        </Label>
        <Textarea
          value={instruction}
          onChange={(e) => onInstructionChange(e.target.value)}
          placeholder={
            feature.requires_prompt
              ? "Jelaskan hasil yang Anda inginkan..."
              : "Tambahkan instruksi spesifik (opsional)..."
          }
          rows={4}
          disabled={disabled || isGenerating}
          className="resize-none"
        />
      </div>

      <Button onClick={onGenerate} disabled={disabled || isGenerating} className="w-full" size="lg">
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Membuat...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
          </>
        )}
      </Button>
    </div>
  );
}
