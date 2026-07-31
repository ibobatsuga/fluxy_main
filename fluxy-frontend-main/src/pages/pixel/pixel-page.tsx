import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import pixelAvatar from "@/assets/Agent-HeroIcon/pixel.webp";
import { FeatureCard } from "@/components/pixel/feature-card";
import { MultiImageUploader, type UploadedImage } from "@/components/pixel/multi-image-uploader";
import { InstructionEditor } from "@/components/pixel/instruction-editor";
import { ResultPanel } from "@/components/pixel/result-panel";
import { GalleryGrid } from "@/components/pixel/gallery-grid";
import { ImageDetailModal } from "@/components/pixel/image-detail-modal";
import {
  useGenerateImage,
  useGallery,
  useDeleteMedia,
  usePixelFeatures,
} from "@/hooks/use-pixel";
import type { GenerateImageResult, MediaItem, PixelFeature } from "@/api/pixel";
import { PIXEL_CATEGORIES } from "@/data/pixel-categories";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";

export function PixelPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toolId = searchParams.get("tool");

  const { data: features = [], isLoading: featuresLoading } = usePixelFeatures();
  const selectedFeature = useMemo(
    () => features.find((f) => f.id === toolId) ?? null,
    [features, toolId]
  );

  if (toolId && selectedFeature) {
    return (
      <WorkspaceView
        feature={selectedFeature}
        onBack={() => setSearchParams({}, { replace: true })}
      />
    );
  }

  return (
    <CatalogView
      features={features}
      isLoading={featuresLoading}
      onSelect={(id) => setSearchParams({ tool: id })}
    />
  );
}

// ── Catalog view ─────────────────────────────────────────────────────────────

function CatalogView({
  features,
  isLoading,
  onSelect,
}: {
  features: PixelFeature[];
  isLoading: boolean;
  onSelect: (id: string) => void;
}) {
  const [category, setCategory] = useState<string>("Semua");
  const [search, setSearch] = useState("");

  const { data: galleryItems = [], isLoading: galleryLoading } = useGallery();
  const deleteMedia = useDeleteMedia();
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = features.filter((feature) => {
    const matchCategory = category === "Semua" || feature.category === category;
    const query = search.trim().toLowerCase();
    const matchSearch =
      query === "" ||
      feature.name.toLowerCase().includes(query) ||
      feature.description.toLowerCase().includes(query);
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AgentAvatar img={pixelAvatar} name="Pixel" bgClassName="bg-blue-600" size="h-11 w-11" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pixel Studio</h1>
            <p className="text-sm text-muted-foreground">
              {features.length} AI tools untuk kebutuhan visual bisnis Anda
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari tool..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["Semua", ...PIXEL_CATEGORIES].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
              category === item
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Tidak ada tool ditemukan</p>
          <p className="text-xs text-muted-foreground">Coba kategori atau kata kunci lain</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} onSelect={() => onSelect(feature.id)} />
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Riwayat Hasil</CardTitle>
            <span className="text-xs text-muted-foreground">{galleryItems.length} item</span>
          </div>
        </CardHeader>
        <CardContent>
          <GalleryGrid
            items={galleryItems}
            isLoading={galleryLoading}
            onSelect={(item) => {
              setDetailItem(item);
              setDetailOpen(true);
            }}
            onDelete={(id) => deleteMedia.mutate(id)}
            onRegenerate={() => {
              toast.info("Buka tool terkait untuk generate ulang.");
            }}
          />
        </CardContent>
      </Card>

      <ImageDetailModal
        item={detailItem}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailItem(null);
        }}
        onDelete={(id) => deleteMedia.mutate(id)}
        onRegenerate={() => {
          toast.info("Buka tool terkait untuk generate ulang.");
        }}
      />
    </div>
  );
}

// ── Workspace view ───────────────────────────────────────────────────────────

function WorkspaceView({
  feature,
  onBack,
}: {
  feature: PixelFeature;
  onBack: () => void;
}) {
  const generateImage = useGenerateImage();

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [instruction, setInstruction] = useState("");
  const [contentType, setContentType] = useState<"feed" | "story">("feed");
  const [result, setResult] = useState<GenerateImageResult["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate =
    (!feature.requires_image || images.length > 0) &&
    (!feature.requires_prompt || instruction.trim() !== "");

  const handleGenerate = () => {
    if (feature.requires_image && images.length === 0) {
      toast.error("Mohon upload minimal satu gambar referensi");
      return;
    }
    if (feature.requires_prompt && instruction.trim() === "") {
      toast.error("Mohon isi instruksi untuk tool ini");
      return;
    }

    setError(null);
    setResult(null);

    generateImage.mutate(
      {
        feature: feature.id,
        content_type: contentType,
        instruction: instruction.trim() || undefined,
        image_files: images.length > 0 ? images.map((img) => img.file) : undefined,
      },
      {
        onSuccess: (response) => {
          setResult(response.data ?? null);
        },
        onError: (err: unknown) => {
          setError(getErrorMessage(err, "Gagal membuat hasil AI."));
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{feature.name}</h1>
            <Badge variant="secondary" className="text-[10px]">{feature.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
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
              <CardTitle className="text-sm font-medium">
                {feature.multi_image ? "Gambar Referensi (hingga 5)" : "Upload Gambar"}
                {!feature.requires_image && " (opsional)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MultiImageUploader
                images={images}
                onChange={setImages}
                maxImages={feature.multi_image ? 5 : 1}
                disabled={generateImage.isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                Pengaturan Generate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InstructionEditor
                feature={feature}
                instruction={instruction}
                onInstructionChange={setInstruction}
                contentType={contentType}
                onContentTypeChange={setContentType}
                onGenerate={handleGenerate}
                isGenerating={generateImage.isPending}
                disabled={!canGenerate && !generateImage.isPending}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Hasil</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultPanel isGenerating={generateImage.isPending} result={result} error={error} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
