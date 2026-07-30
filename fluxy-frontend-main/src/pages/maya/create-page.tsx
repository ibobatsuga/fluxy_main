import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, ImageIcon, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/maya/media-picker";
import { CaptionEditor } from "@/components/maya/caption-editor";
import { PlatformSelector } from "@/components/maya/platform-selector";
import { ContentTypeSelector } from "@/components/maya/content-type-selector";
import { getAvailableContentTypes } from "@/lib/content-type-utils";
import { SchedulePicker } from "@/components/maya/schedule-picker";
import { MayaNav } from "@/components/maya/maya-nav";
import { ContentCalendarSection } from "@/components/maya/content-calendar-section";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import mayaAvatar from "@/assets/Agent-HeroIcon/Maya.webp";
import { useMayaAccounts, useCreatePost } from "@/hooks/use-maya";
import { toast } from "sonner";
import type { MayaContentType } from "@/api/maya";

const CONTENT_TYPE_LABEL: Record<MayaContentType, string> = {
  story: "Story",
  feed: "Feed",
  carousel: "Carousel",
  reel: "Reel",
};

const MEDIA_MAX_BY_TYPE: Record<MayaContentType, number> = {
  story: 1,
  feed: 1,
  carousel: 10,
  reel: 1,
};

export function MayaCreatePage() {
  const { data: accounts = [], isLoading: accountsLoading } = useMayaAccounts();
  const createPost = useCreatePost();

  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [platformIds, setPlatformIds] = useState<string[]>([]);
  const [contentType, setContentType] = useState<MayaContentType | null>(null);
  const [scheduleType, setScheduleType] = useState<"now" | "schedule">("now");
  const [scheduledAts, setScheduledAts] = useState<string[]>([""]);

  const selectedAccounts = accounts.filter((a) => platformIds.includes(a.id));
  const selectedProviders = useMemo(
    () => Array.from(new Set(selectedAccounts.map((a) => a.provider))),
    [selectedAccounts]
  );
  const providersKey = selectedProviders.join(",");

  useEffect(() => {
    const available = getAvailableContentTypes(selectedProviders);
    if (contentType && !available.includes(contentType)) {
      setContentType(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providersKey]);

  const mediaMax = contentType ? MEDIA_MAX_BY_TYPE[contentType] : 1;

  useEffect(() => {
    setMediaUrls((prev) => (prev.length > mediaMax ? prev.slice(0, mediaMax) : prev));
  }, [mediaMax]);

  const validSchedules = scheduledAts.filter(Boolean);

  const handleSubmit = useCallback(() => {
    if (platformIds.length === 0) {
      toast.error("Pilih minimal 1 platform tujuan");
      return;
    }
    if (!contentType) {
      toast.error("Pilih jenis konten");
      return;
    }
    if (mediaUrls.length === 0) {
      toast.error("Pilih minimal 1 media untuk dipublikasikan");
      return;
    }
    if (scheduleType === "schedule" && validSchedules.length === 0) {
      toast.error("Tentukan minimal 1 tanggal & jam jadwal");
      return;
    }

    const targets = scheduleType === "schedule" ? validSchedules : [undefined];

    targets.forEach((scheduledAt) => {
      createPost.mutate({
        caption: caption || undefined,
        hashtags: hashtags || undefined,
        media_urls: mediaUrls,
        platforms: platformIds,
        content_type: contentType,
        schedule_type: scheduleType,
        scheduled_at: scheduledAt,
      });
    });
  }, [platformIds, contentType, mediaUrls, scheduleType, validSchedules, caption, hashtags, createPost]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AgentAvatar img={mayaAvatar} name="Maya" bgClassName="bg-blue-600" size="h-11 w-11" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jadwalkan Konten</h1>
          <p className="text-sm text-muted-foreground">
            Susun konten dan jadwalkan publikasi ke media sosial Anda
          </p>
        </div>
      </div>

      <MayaNav />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left - Form */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Social Media Tujuan</CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformSelector
                accounts={accounts}
                isLoading={accountsLoading}
                selectedIds={platformIds}
                onChange={setPlatformIds}
                disabled={createPost.isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Jenis Konten</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentTypeSelector
                providers={selectedProviders}
                value={contentType}
                onChange={setContentType}
                disabled={createPost.isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Media</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaPicker
                selectedUrls={mediaUrls}
                onChange={setMediaUrls}
                disabled={createPost.isPending}
                maxItems={mediaMax}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Caption</CardTitle>
            </CardHeader>
            <CardContent>
              <CaptionEditor
                caption={caption}
                onCaptionChange={setCaption}
                hashtags={hashtags}
                onHashtagsChange={setHashtags}
                disabled={createPost.isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Jadwal</CardTitle>
            </CardHeader>
            <CardContent>
              <SchedulePicker
                scheduleType={scheduleType}
                onScheduleTypeChange={setScheduleType}
                scheduledAts={scheduledAts}
                onScheduledAtsChange={setScheduledAts}
                disabled={createPost.isPending}
              />
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={createPost.isPending}>
            <Send className="mr-2 h-4 w-4" />
            {createPost.isPending
              ? "Memproses..."
              : scheduleType === "now"
              ? "Publikasikan Sekarang"
              : validSchedules.length > 1
              ? `Jadwalkan ${validSchedules.length} Konten`
              : "Jadwalkan Konten"}
          </Button>
        </div>

        {/* Right - Preview */}
        <div className="lg:col-span-2">
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mediaUrls.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-border bg-muted">
                  <img src={mediaUrls[0]} alt="Preview" className="aspect-square w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">Belum ada media dipilih</p>
                </div>
              )}

              {(caption || hashtags) && (
                <p className="text-sm leading-relaxed">
                  {caption}
                  {caption && hashtags && " "}
                  <span className="text-primary">{hashtags}</span>
                </p>
              )}

              <div className="flex flex-wrap gap-1.5">
                {contentType && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                    {CONTENT_TYPE_LABEL[contentType]}
                  </span>
                )}
                {selectedAccounts.map((a) => (
                  <span
                    key={a.id}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] capitalize text-secondary-foreground"
                  >
                    {a.provider}
                  </span>
                ))}
              </div>

              {scheduleType === "schedule" && validSchedules.length > 0 && (
                <div className="space-y-1">
                  {validSchedules.map((s) => (
                    <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {new Date(s).toLocaleString("id-ID", {
                        dateStyle: "long",
                        timeStyle: "short",
                        hourCycle: "h23",
                      })}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ContentCalendarSection />
    </div>
  );
}
