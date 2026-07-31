import { useState } from "react";
import { Tag, Aperture, Sparkles, Loader2, Copy, Download, Clapperboard, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import motionAvatar from "@/assets/Agent-HeroIcon/Cody.webp";
import { useGenerateMotionPrompt } from "@/hooks/use-motion";
import type { MotionBrief } from "@/api/motion";
import { toast } from "sonner";
import {
  CONTENT_TYPE_OPTIONS,
  PLATFORM_OPTIONS,
  AD_GOAL_OPTIONS,
  LANGUAGE_OPTIONS,
  TONE_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  COLOR_GRADING_OPTIONS,
  CHARACTER_OPTIONS,
  DURATION_OPTIONS,
  HOOK_STYLE_OPTIONS,
  PACE_EDITING_OPTIONS,
  SETTING_LOCATION_OPTIONS,
  CHARACTER_GENDER_OPTIONS,
  MUSIC_MOOD_OPTIONS,
  TRANSITION_OPTIONS,
} from "@/data/motion-options";
import { getErrorMessage } from "@/lib/error";

const initialBrief: MotionBrief = {
  product_name: "",
  product_description: "",
  target_market: "",
  content_type: CONTENT_TYPE_OPTIONS[0],
  platform: PLATFORM_OPTIONS[0],
  ad_goal: AD_GOAL_OPTIONS[0],
  language: LANGUAGE_OPTIONS[0],
  tone: TONE_OPTIONS[0],
  aspect_ratio: ASPECT_RATIO_OPTIONS[0],
  color_grading: COLOR_GRADING_OPTIONS[0],
  character: CHARACTER_OPTIONS[0],
  duration: DURATION_OPTIONS[0],
  hook_style: HOOK_STYLE_OPTIONS[0],
  pace_editing: PACE_EDITING_OPTIONS[0],
  setting_location: SETTING_LOCATION_OPTIONS[0],
  character_gender: CHARACTER_GENDER_OPTIONS[0],
  music_mood: MUSIC_MOOD_OPTIONS[0],
  transition: TRANSITION_OPTIONS[0],
  text_overlay_animation: false,
  cinematic_camera: true,
  explicit_cta: "",
  negative_prompt: "",
};

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function MotionPage() {
  const [brief, setBrief] = useState<MotionBrief>(initialBrief);
  const [result, setResult] = useState<string | null>(null);
  const generate = useGenerateMotionPrompt();

  const update = <K extends keyof MotionBrief>(key: K, value: MotionBrief[K]) => {
    setBrief((prev) => ({ ...prev, [key]: value }));
  };

  const canGenerate =
    brief.product_name.trim() !== "" &&
    brief.product_description.trim() !== "" &&
    brief.target_market.trim() !== "";

  const handleGenerate = () => {
    if (!canGenerate) {
      toast.error("Mohon lengkapi Nama Produk, Deskripsi Produk, dan Target Market");
      return;
    }
    setResult(null);
    generate.mutate(brief, {
      onSuccess: (text) => setResult(text),
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error, "Gagal membuat prompt video"));
      },
    });
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("Prompt disalin ke clipboard");
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `motion-prompt-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AgentAvatar img={motionAvatar} name="Motion" bgClassName="bg-orange-500" size="h-11 w-11" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Motion</h1>
            <p className="text-sm text-muted-foreground">Buat berbagai format konten kreatif Anda</p>
          </div>
        </div>
        <Badge variant="secondary" className="hidden gap-1 sm:flex">
          <Zap className="h-3 w-3 text-yellow-500" />
          Powered by AI
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Tag className="h-4 w-4 text-primary" />
                Brief Produk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Nama Produk</Label>
                <Input
                  placeholder="mis. Serum Vitamin C Glow Pro"
                  value={brief.product_name}
                  onChange={(e) => update("product_name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Deskripsi Produk</Label>
                <Textarea
                  placeholder="Keunggulan, bahan aktif, manfaat utama..."
                  rows={3}
                  value={brief.product_description}
                  onChange={(e) => update("product_description", e.target.value)}
                  className="resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Target Market</Label>
                <Input
                  placeholder="mis. Wanita 18-35, kulit kering"
                  value={brief.target_market}
                  onChange={(e) => update("target_market", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldSelect
                  label="Jenis Konten"
                  value={brief.content_type}
                  onChange={(v) => update("content_type", v)}
                  options={CONTENT_TYPE_OPTIONS}
                />
                <FieldSelect
                  label="Platform"
                  value={brief.platform}
                  onChange={(v) => update("platform", v)}
                  options={PLATFORM_OPTIONS}
                />
              </div>
              <FieldSelect
                label="Tujuan Iklan"
                value={brief.ad_goal}
                onChange={(v) => update("ad_goal", v)}
                options={AD_GOAL_OPTIONS}
              />
              <div className="grid grid-cols-2 gap-3">
                <FieldSelect
                  label="Bahasa Iklan"
                  value={brief.language}
                  onChange={(v) => update("language", v)}
                  options={LANGUAGE_OPTIONS}
                />
                <FieldSelect
                  label="Gaya Bahasa"
                  value={brief.tone}
                  onChange={(v) => update("tone", v)}
                  options={TONE_OPTIONS}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Aperture className="h-4 w-4 text-primary" />
                Produksi Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FieldSelect
                  label="Aspect Ratio"
                  value={brief.aspect_ratio}
                  onChange={(v) => update("aspect_ratio", v)}
                  options={ASPECT_RATIO_OPTIONS}
                />
                <FieldSelect
                  label="Color Grading"
                  value={brief.color_grading}
                  onChange={(v) => update("color_grading", v)}
                  options={COLOR_GRADING_OPTIONS}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldSelect
                  label="Karakter"
                  value={brief.character}
                  onChange={(v) => update("character", v)}
                  options={CHARACTER_OPTIONS}
                />
                <FieldSelect
                  label="Durasi Video"
                  value={brief.duration}
                  onChange={(v) => update("duration", v)}
                  options={DURATION_OPTIONS}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldSelect
                  label="Hook Style"
                  value={brief.hook_style}
                  onChange={(v) => update("hook_style", v)}
                  options={HOOK_STYLE_OPTIONS}
                />
                <FieldSelect
                  label="Pace Editing"
                  value={brief.pace_editing}
                  onChange={(v) => update("pace_editing", v)}
                  options={PACE_EDITING_OPTIONS}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldSelect
                  label="Setting / Lokasi"
                  value={brief.setting_location ?? ""}
                  onChange={(v) => update("setting_location", v)}
                  options={SETTING_LOCATION_OPTIONS}
                />
                <FieldSelect
                  label="Gender Karakter"
                  value={brief.character_gender ?? ""}
                  onChange={(v) => update("character_gender", v)}
                  options={CHARACTER_GENDER_OPTIONS}
                />
              </div>
              <FieldSelect
                label="Musik Mood"
                value={brief.music_mood ?? ""}
                onChange={(v) => update("music_mood", v)}
                options={MUSIC_MOOD_OPTIONS}
              />
              <FieldSelect
                label="Transisi"
                value={brief.transition ?? ""}
                onChange={(v) => update("transition", v)}
                options={TRANSITION_OPTIONS}
              />

              <div className="flex items-center justify-between pt-1">
                <Label className="text-sm">Text Overlay Animasi</Label>
                <Switch
                  checked={brief.text_overlay_animation}
                  onCheckedChange={(checked) => update("text_overlay_animation", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Efek Kamera Sinematik</Label>
                <Switch
                  checked={brief.cinematic_camera}
                  onCheckedChange={(checked) => update("cinematic_camera", checked)}
                />
              </div>

              <div className="space-y-1.5 border-t pt-4">
                <Label className="text-xs font-medium text-muted-foreground">
                  CTA Eksplisit <span className="font-normal">(opsional)</span>
                </Label>
                <Input
                  placeholder="mis. Order sekarang, Kunjungi toko kami..."
                  value={brief.explicit_cta}
                  onChange={(e) => update("explicit_cta", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Negative Prompt <span className="font-normal">(opsional)</span>
                </Label>
                <Textarea
                  placeholder="mis. Jangan tampilkan kompetitor, hindari warna merah, tidak ada karakter anak-anak..."
                  rows={3}
                  value={brief.negative_prompt}
                  onChange={(e) => update("negative_prompt", e.target.value)}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generate.isPending}
                className="w-full"
                size="lg"
              >
                {generate.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuat Prompt...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Prompt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Hasil Prompt Video</CardTitle>
                {result && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCopy}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDownload}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generate.isPending ? (
                <div className="flex h-96 flex-col items-center justify-center text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
                    <Sparkles className="h-9 w-9 animate-pulse text-white" />
                  </div>
                  <p className="text-lg font-bold">Motion sedang menyusun brief...</p>
                  <p className="mt-2 text-sm text-muted-foreground">Biasanya memakan waktu 10-30 detik</p>
                </div>
              ) : result ? (
                <div className="whitespace-pre-wrap rounded-2xl bg-muted/50 p-6 text-sm leading-relaxed">
                  {result}
                </div>
              ) : (
                <div className="flex h-96 flex-col items-center justify-center text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500/10 to-amber-500/10">
                    <Clapperboard className="h-9 w-9 text-orange-500/60" />
                  </div>
                  <p className="text-lg font-bold">Prompt video akan muncul di sini</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Isi brief produk di sebelah kiri lalu klik Generate Prompt
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
