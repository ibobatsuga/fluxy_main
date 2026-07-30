import { useCallback, useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  onGdriveLink?: (link: string) => void;
  selectedFile: File | null;
  previewUrl: string | null;
  onClear: () => void;
  disabled?: boolean;
  inputType: "upload" | "gdrive";
  onInputTypeChange: (type: "upload" | "gdrive") => void;
  gdriveLink: string;
  onGdriveLinkChange: (link: string) => void;
}

export function ImageUploader({
  onFileSelect,
  selectedFile,
  previewUrl,
  onClear,
  disabled,
  inputType,
  onInputTypeChange,
  gdriveLink,
  onGdriveLinkChange,
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  if (previewUrl || (inputType === "gdrive" && gdriveLink)) {
    return (
      <div className="relative">
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-64 w-full object-contain"
            />
          ) : (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <Link2 className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground break-all px-4">
                  {gdriveLink}
                </p>
              </div>
            </div>
          )}
          {!disabled && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7"
              onClick={onClear}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        {selectedFile && (
          <p className="mt-2 text-xs text-muted-foreground">
            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={inputType === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => onInputTypeChange("upload")}
          disabled={disabled}
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          Upload File
        </Button>
        <Button
          type="button"
          variant={inputType === "gdrive" ? "default" : "outline"}
          size="sm"
          onClick={() => onInputTypeChange("gdrive")}
          disabled={disabled}
        >
          <Link2 className="mr-1.5 h-3.5 w-3.5" />
          Google Drive
        </Button>
      </div>

      {inputType === "upload" ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium">
            {isDragOver ? "Drop gambar di sini" : "Drag & drop gambar produk"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            atau klik untuk memilih file (JPG, PNG, max 5MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="gdrive-link" className="text-xs">
            Paste Google Drive link
          </Label>
          <Input
            id="gdrive-link"
            placeholder="https://drive.google.com/file/d/..."
            value={gdriveLink}
            onChange={(e) => onGdriveLinkChange(e.target.value)}
            disabled={disabled}
          />
          <p className="text-[10px] text-muted-foreground">
            Link harus publicly accessible
          </p>
        </div>
      )}
    </div>
  );
}
