import { X, Download, ExternalLink, Trash2, Copy, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { MediaItem } from "@/api/pixel";

interface ImageDetailModalProps {
  item: MediaItem | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRegenerate?: (item: MediaItem) => void;
}

export function ImageDetailModal({
  item,
  open,
  onClose,
  onDelete,
  onRegenerate,
}: ImageDetailModalProps) {
  if (!item) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pixel-${item.id.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(item.url, "_blank");
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(item.url);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card">
        <DialogTitle className="sr-only">Image Detail</DialogTitle>
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="flex-1 bg-black">
            <img
              src={item.url}
              alt="Generated image"
              className="h-full w-full object-contain max-h-[70vh]"
            />
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Detail</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="secondary" className="text-[10px]">
                  {item.type}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-xs">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {item.id.slice(0, 8)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              {onRegenerate && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    onRegenerate(item);
                    onClose();
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleCopyUrl}>
                <Copy className="mr-2 h-4 w-4" />
                Copy URL
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => window.open(item.url, "_blank")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Full Size
              </Button>
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  onDelete(item.id);
                  onClose();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
