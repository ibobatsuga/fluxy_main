import { useCallback, useRef, useState } from "react";
import { Link2, Plus, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PlatformSelector } from "@/components/maya/platform-selector";
import { MayaNav } from "@/components/maya/maya-nav";
import { ContentCalendarSection } from "@/components/maya/content-calendar-section";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import mayaAvatar from "@/assets/Agent-HeroIcon/Maya.webp";
import { useMayaAccounts, useStoryBulkSchedule } from "@/hooks/use-maya";
import { toast } from "sonner";

interface StoryItem {
  id: string;
  link: string;
  time: string;
}

export function MayaStoriesPage() {
  const { data: accounts = [], isLoading: accountsLoading } = useMayaAccounts();
  const storyBulkSchedule = useStoryBulkSchedule();

  const nextId = useRef(1);
  const [platformIds, setPlatformIds] = useState<string[]>([]);
  const [items, setItems] = useState<StoryItem[]>([{ id: "item-0", link: "", time: "09:00" }]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCarousel, setIsCarousel] = useState(false);

  const addItem = useCallback(() => {
    nextId.current += 1;
    setItems((prev) => [...prev, { id: `item-${nextId.current}`, link: "", time: "09:00" }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  }, []);

  const updateLink = useCallback((id: string, link: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, link } : i)));
  }, []);

  const updateTime = useCallback((id: string, time: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, time } : i)));
  }, []);

  const validItems = items.filter((i) => i.link.trim());

  const estimatedDays =
    startDate && endDate
      ? Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1)
      : 0;
  const estimatedCount = estimatedDays * validItems.length;

  const handleSubmit = useCallback(() => {
    if (platformIds.length === 0) {
      toast.error("Pilih minimal 1 platform tujuan");
      return;
    }
    if (validItems.length === 0) {
      toast.error("Masukkan minimal 1 link Google Drive story");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Tentukan rentang tanggal upload");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error("Tanggal akhir harus setelah tanggal mulai");
      return;
    }

    storyBulkSchedule.mutate({
      content_items: validItems.map(({ link, time }) => ({ link, time })),
      start_date: startDate,
      end_date: endDate,
      platforms: platformIds,
      is_carousel: isCarousel,
    });
  }, [platformIds, validItems, startDate, endDate, isCarousel, storyBulkSchedule]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AgentAvatar img={mayaAvatar} name="Maya" bgClassName="bg-blue-600" size="h-11 w-11" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Penjadwal Multi-Story</h1>
          <p className="text-sm text-muted-foreground">
            Jadwalkan banyak story sekaligus dari beberapa link Google Drive
          </p>
        </div>
      </div>

      <MayaNav />

      <div className="grid gap-6 lg:grid-cols-5">
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
                disabled={storyBulkSchedule.isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Link2 className="h-4 w-4 text-primary" />
                Konten Stories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Input
                      placeholder={`https://drive.google.com/file/d/... (link #${index + 1})`}
                      value={item.link}
                      onChange={(e) => updateLink(item.id, e.target.value)}
                      disabled={storyBulkSchedule.isPending}
                      className="flex-3"
                    />
                    <Input
                      type="time"
                      lang="id-ID"
                      value={item.time}
                      onChange={(e) => updateTime(item.id, e.target.value)}
                      disabled={storyBulkSchedule.isPending}
                      className="flex-1"
                    />
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                        disabled={storyBulkSchedule.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={addItem}
                disabled={storyBulkSchedule.isPending}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Tambah Link
              </Button>

              <p className="text-[10px] text-muted-foreground">
                Setiap link akan dijadwalkan pada jam masing-masing, berulang setiap hari dalam rentang tanggal upload.
              </p>

              <label className="flex cursor-pointer items-center gap-2 pt-1">
                <Checkbox
                  checked={isCarousel}
                  onCheckedChange={(checked) => setIsCarousel(checked === true)}
                  disabled={storyBulkSchedule.isPending}
                />
                <span className="text-xs">Gabungkan sebagai carousel Instagram</span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Rentang Tanggal Upload</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start-date" className="text-xs">
                  Mulai
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={storyBulkSchedule.isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-date" className="text-xs">
                  Selesai
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={storyBulkSchedule.isPending}
                />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={storyBulkSchedule.isPending}>
            <Sparkles className="mr-2 h-4 w-4" />
            {storyBulkSchedule.isPending ? "Menjadwalkan..." : "Jadwalkan Story"}
          </Button>
        </div>

        {/* Right - Summary */}
        <div className="lg:col-span-2">
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rentang hari</span>
                <span className="font-medium">{estimatedDays || "-"} hari</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Link konten</span>
                <span className="font-medium">{validItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-medium">{isCarousel ? "Carousel" : "Story terpisah"}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Estimasi total story</span>
                <span className="text-lg font-bold text-primary">{estimatedCount || "-"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ContentCalendarSection />
    </div>
  );
}
