import { useState, useCallback, useEffect, useRef } from "react";
import { Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import pixelAvatar from "@/assets/Agent-HeroIcon/pixel.webp";
import { ImageUploader } from "@/components/pixel/image-uploader";
import { PromptEditor } from "@/components/pixel/prompt-editor";
import { GalleryGrid } from "@/components/pixel/gallery-grid";
import { ImageDetailModal } from "@/components/pixel/image-detail-modal";
import { useGenerateImage, useGallery, useDeleteMedia, useInvalidateGallery } from "@/hooks/use-pixel";
import type { MediaItem } from "@/api/pixel";
import { toast } from "sonner";

export function PixelPage() {
  const { data: galleryItems = [], isLoading: galleryLoading } = useGallery();
  const generateImage = useGenerateImage();
  const deleteMedia = useDeleteMedia();
  const invalidateGallery = useInvalidateGallery();

  // Local state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inputType, setInputType] = useState<"upload" | "gdrive">("upload");
  const [gdriveLink, setGdriveLink] = useState("");
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Polling for new images after generation starts
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCountRef = useRef(galleryItems.length);

  // Fix #3 & #5: Track previewUrl in a ref so cleanup always sees the latest value.
  // Also track whether the current URL is a blob URL (created via createObjectURL)
  // vs a remote URL — revokeObjectURL hanya boleh dipanggil untuk blob URL.
  const previewUrlRef = useRef<string | null>(null);
  const isBlobUrlRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    if (!isPolling) return;

    pollingRef.current = setInterval(() => {
      invalidateGallery();
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isPolling, invalidateGallery]);

  useEffect(() => {
    if (isPolling && galleryItems.length > prevCountRef.current) {
      // Fix #4: Hanya stop polling, tidak perlu clear interval manual di sini
      // karena effect di atas sudah menghandle cleanup via return function.
      setIsPolling(false);
      toast.success("Gambar berhasil dibuat!");
    }
    prevCountRef.current = galleryItems.length;
  }, [galleryItems.length, isPolling]);

  const revokeCurrentBlobUrl = useCallback(() => {
    if (isBlobUrlRef.current && previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      isBlobUrlRef.current = false;
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    revokeCurrentBlobUrl();
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    isBlobUrlRef.current = true;
    setPreviewUrl(url);
  }, [revokeCurrentBlobUrl]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    revokeCurrentBlobUrl();
    setPreviewUrl(null);
    setGdriveLink("");
  }, [revokeCurrentBlobUrl]);

  const handleGenerate = useCallback(
    (options: {
      lighting: string;
      background: string;
      style: string;
      contentType: "feed" | "story";
    }) => {
      if (inputType === "upload" && !selectedFile) {
        toast.error("Mohon upload gambar terlebih dahulu");
        return;
      }
      if (inputType === "gdrive" && !gdriveLink) {
        toast.error("Mohon masukkan link Google Drive");
        return;
      }

      generateImage.mutate(
        {
          content_type: options.contentType,
          input_type: inputType,
          image_file: inputType === "upload" ? selectedFile! : undefined,
          gdrive_link: inputType === "gdrive" ? gdriveLink : undefined,
          lighting: options.lighting || undefined,
          background: options.background || undefined,
          style: options.style || undefined,
        },
        {
          onSuccess: () => {
            setIsPolling(true);
          },
        }
      );
    },
    [inputType, selectedFile, gdriveLink, generateImage]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMedia.mutate(id);
    },
    [deleteMedia]
  );

  const handleSelect = useCallback((item: MediaItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  }, []);

  const handleRegenerate = useCallback(
    (item: MediaItem) => {
      if (item.type === "generated_image") {
        setInputType("upload");
        setSelectedFile(null);
        // Fix #5: Revoke blob URL jika ada, lalu set ke remote URL
        // (jangan panggil revokeObjectURL pada remote URL — hanya blob URL yang valid)
        revokeCurrentBlobUrl();
        // item.url adalah remote URL, bukan blob URL
        isBlobUrlRef.current = false;
        setPreviewUrl(item.url);
        toast.info("Gambar dimuat. Sesuaikan pengaturan lalu generate kembali.");
      }
    },
    [revokeCurrentBlobUrl]
  );

  // Fix #3: Cleanup on unmount menggunakan ref sehingga selalu mendapat nilai terbaru
  useEffect(() => {
    return () => {
      revokeCurrentBlobUrl();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <AgentAvatar img={pixelAvatar} name="Pixel" bgClassName="bg-blue-600" size="h-11 w-11" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pixel</h1>
              <p className="text-sm text-muted-foreground">AI Designer untuk foto produk Anda</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3 text-yellow-500" />
            Powered by AI
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Panel - Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Input Gambar</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                onClear={handleClear}
                disabled={generateImage.isPending}
                inputType={inputType}
                onInputTypeChange={setInputType}
                gdriveLink={gdriveLink}
                onGdriveLinkChange={setGdriveLink}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Pengaturan Generate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PromptEditor
                onGenerate={handleGenerate}
                isGenerating={generateImage.isPending || isPolling}
                disabled={!selectedFile && !gdriveLink}
              />
            </CardContent>
          </Card>

          {/* Status */}
          {isPolling && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-medium">Sedang memproses...</p>
                  <p className="text-xs text-muted-foreground">
                    Gambar sedang dibuat oleh AI. Anda akan diberitahu saat selesai.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Gallery */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Gallery</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {galleryItems.length} gambar
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <GalleryGrid
                items={galleryItems}
                isLoading={galleryLoading}
                onSelect={handleSelect}
                onDelete={handleDelete}
                onRegenerate={handleRegenerate}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Modal */}
      <ImageDetailModal
        item={detailItem}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailItem(null);
        }}
        onDelete={handleDelete}
        onRegenerate={handleRegenerate}
      />
    </div>
  );
}
