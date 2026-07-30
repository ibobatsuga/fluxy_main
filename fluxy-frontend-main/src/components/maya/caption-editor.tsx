import { useCallback, useMemo } from "react";
import { Hash, Wand2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CAPTION_LIMIT = 2200;
const HASHTAG_LIMIT = 30;

interface CaptionEditorProps {
  caption: string;
  onCaptionChange: (value: string) => void;
  hashtags: string;
  onHashtagsChange: (value: string) => void;
  disabled?: boolean;
}

export function CaptionEditor({
  caption,
  onCaptionChange,
  hashtags,
  onHashtagsChange,
  disabled,
}: CaptionEditorProps) {
  const hashtagCount = useMemo(
    () => hashtags.split(/\s+/).filter((t) => t.startsWith("#") && t.length > 1).length,
    [hashtags]
  );

  const handleExtractHashtags = useCallback(() => {
    const found = caption.match(/#[\p{L}\p{N}_]+/gu) || [];
    if (found.length === 0) return;

    const existing = new Set(hashtags.split(/\s+/).filter(Boolean));
    const merged = [...existing, ...found].filter((v, i, arr) => arr.indexOf(v) === i);
    onHashtagsChange(merged.join(" "));

    const stripped = caption.replace(/#[\p{L}\p{N}_]+/gu, "").replace(/[ \t]+/g, " ").trim();
    onCaptionChange(stripped);
  }, [caption, hashtags, onCaptionChange, onHashtagsChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="caption" className="text-xs">
            Caption
          </Label>
          <span
            className={cn(
              "text-[10px] text-muted-foreground",
              caption.length > CAPTION_LIMIT && "text-destructive"
            )}
          >
            {caption.length}/{CAPTION_LIMIT}
          </span>
        </div>
        <Textarea
          id="caption"
          placeholder="Tulis caption untuk konten Anda..."
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          disabled={disabled}
          maxLength={CAPTION_LIMIT}
          rows={5}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="hashtags" className="text-xs flex items-center gap-1">
            <Hash className="h-3 w-3" />
            Hashtags
          </Label>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] text-muted-foreground",
                hashtagCount > HASHTAG_LIMIT && "text-destructive"
              )}
            >
              {hashtagCount}/{HASHTAG_LIMIT}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px]"
              onClick={handleExtractHashtags}
              disabled={disabled || !caption.includes("#")}
            >
              <Wand2 className="mr-1 h-3 w-3" />
              Ekstrak dari caption
            </Button>
          </div>
        </div>
        <Textarea
          id="hashtags"
          placeholder="#produkbaru #promo #tokomajujaya"
          value={hashtags}
          onChange={(e) => onHashtagsChange(e.target.value)}
          disabled={disabled}
          rows={2}
        />
        {hashtagCount > HASHTAG_LIMIT && (
          <p className="text-[10px] text-destructive">
            Instagram membatasi maksimal {HASHTAG_LIMIT} hashtag per post
          </p>
        )}
      </div>
    </div>
  );
}
