import { useCallback, useRef, useState } from "react";
import { Check, Image as ImageIcon, Link2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useGallery, useUploadMedia } from "@/hooks/use-pixel";

const DEFAULT_MAX_MEDIA = 10;

interface MediaPickerProps {
  selectedUrls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  maxItems?: number;
}

export function MediaPicker({ selectedUrls, onChange, disabled, maxItems = DEFAULT_MAX_MEDIA }: MediaPickerProps) {
  const { data: galleryItems = [], isLoading: galleryLoading } = useGallery();
  const uploadMedia = useUploadMedia();
  const [gdriveLink, setGdriveLink] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleUrl = useCallback(
    (url: string) => {
      if (selectedUrls.includes(url)) {
        onChange(selectedUrls.filter((u) => u !== url));
      } else if (maxItems === 1) {
        onChange([url]);
      } else if (selectedUrls.length < maxItems) {
        onChange([...selectedUrls, url]);
      }
    },
    [selectedUrls, onChange, maxItems]
  );

  const removeUrl = useCallback(
    (url: string) => {
      onChange(selectedUrls.filter((u) => u !== url));
    },
    [selectedUrls, onChange]
  );

  const handleUploadFile = useCallback(
    (file: File) => {
      uploadMedia.mutate(file, {
        onSuccess: (item) => {
          if (maxItems === 1) {
            onChange([item.url]);
          } else if (selectedUrls.length < maxItems) {
            onChange([...selectedUrls, item.url]);
          }
        },
      });
    },
    [uploadMedia, selectedUrls, onChange, maxItems]
  );

  const handleAddGdrive = useCallback(() => {
    if (!gdriveLink || selectedUrls.includes(gdriveLink)) return;
    if (maxItems === 1) {
      onChange([gdriveLink]);
      setGdriveLink("");
    } else if (selectedUrls.length < maxItems) {
      onChange([...selectedUrls, gdriveLink]);
      setGdriveLink("");
    }
  }, [gdriveLink, selectedUrls, onChange, maxItems]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="gallery">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gallery">Galeri Pixel</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="gdrive">Google Drive</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery">
          {galleryLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          ) : galleryItems.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="Galeri kosong"
              description="Generate gambar di Pixel terlebih dahulu"
              className="py-8"
            />
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {galleryItems.map((item) => {
                const isSelected = selectedUrls.includes(item.url);
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => toggleUrl(item.url)}
                    disabled={disabled}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                      isSelected ? "border-primary" : "border-transparent hover:border-primary/40"
                    )}
                  >
                    <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/40">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload">
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer",
              isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith("image/")) handleUploadFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-xs text-muted-foreground">
              {uploadMedia.isPending ? "Mengunggah..." : "Drag & drop atau klik untuk upload"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={disabled || uploadMedia.isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadFile(file);
                e.target.value = "";
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="gdrive">
          <div className="flex gap-2">
            <Input
              placeholder="https://drive.google.com/file/d/..."
              value={gdriveLink}
              onChange={(e) => setGdriveLink(e.target.value)}
              disabled={disabled}
            />
            <Button type="button" size="sm" onClick={handleAddGdrive} disabled={!gdriveLink || disabled}>
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Tambah
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {selectedUrls.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            {selectedUrls.length}/{maxItems} media dipilih {selectedUrls.length > 1 && "(carousel)"}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedUrls.map((url) => (
              <div key={url} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeUrl(url)}
                  className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
