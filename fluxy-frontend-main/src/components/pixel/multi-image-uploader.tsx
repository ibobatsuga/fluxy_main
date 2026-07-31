import { useCallback, useRef, useState } from "react";
import { Upload, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface UploadedImage {
  file: File;
  preview: string;
}

interface MultiImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function MultiImageUploader({
  images,
  onChange,
  maxImages = 5,
  disabled,
}: MultiImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, Math.max(0, maxImages - images.length))
        .map((file) => ({ file, preview: URL.createObjectURL(file) }));
      if (incoming.length > 0) {
        onChange([...images, ...incoming]);
      }
    },
    [images, maxImages, onChange]
  );

  const removeAt = useCallback(
    (index: number) => {
      const next = [...images];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      onChange(next);
    },
    [images, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={img.preview} className="group relative overflow-hidden rounded-lg border border-border">
              <img src={img.preview} alt={`Referensi ${i + 1}`} className="h-24 w-full object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          {images.length < maxImages && !disabled && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {images.length === 0 && (
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium">
            {isDragOver ? "Lepaskan gambar di sini" : "Drag & drop gambar referensi"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {maxImages > 1
              ? `atau klik untuk memilih hingga ${maxImages} gambar (JPG, PNG, max 20MB)`
              : "atau klik untuk memilih file (JPG, PNG, max 20MB)"}
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={maxImages > 1}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {images.length > 0 && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            images.forEach((img) => URL.revokeObjectURL(img.preview));
            onChange([]);
          }}
        >
          Hapus semua
        </Button>
      )}
    </div>
  );
}
