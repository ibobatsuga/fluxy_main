import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Image as ImageIcon, Pencil, RefreshCw, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Schedule } from "@/types";

const STATUS_VARIANT: Record<Schedule["status"], "default" | "secondary" | "destructive" | "success"> = {
  draft: "secondary",
  scheduled: "default",
  processing: "secondary",
  completed: "success",
  failed: "destructive",
};

const STATUS_LABEL: Record<Schedule["status"], string> = {
  draft: "Draft",
  scheduled: "Terjadwal",
  processing: "Diproses",
  completed: "Selesai",
  failed: "Gagal",
};

interface DayDetailModalProps {
  date: Date | null;
  posts: Schedule[];
  open: boolean;
  onClose: () => void;
  onEdit: (post: Schedule) => void;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
  isMutating?: boolean;
}

export function DayDetailModal({
  date,
  posts,
  open,
  onClose,
  onEdit,
  onDelete,
  onRetry,
  isMutating,
}: DayDetailModalProps) {
  if (!date) return null;

  const dayPosts = posts
    .filter((p) => p.scheduled_at && isSameDay(new Date(p.scheduled_at), date))
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {format(date, "EEEE, d MMMM yyyy", { locale: id })}
          </DialogTitle>
        </DialogHeader>

        {dayPosts.length === 0 ? (
          <EmptyState icon={CalendarIcon} title="Tidak ada konten" description="Belum ada post di tanggal ini" />
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {dayPosts.map((post) => (
              <div key={post.id} className="flex gap-3 rounded-lg border border-border p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  {post.content?.media_urls?.[0] ? (
                    <img src={post.content.media_urls[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={STATUS_VARIANT[post.status]} className="text-[10px]">
                      {STATUS_LABEL[post.status]}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(post.scheduled_at!), "HH:mm")}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {post.content?.caption || "Tanpa caption"}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    {(post.status === "draft" || post.status === "scheduled") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onEdit(post)}
                        disabled={isMutating}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                    {post.status === "failed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onRetry(post.id)}
                        disabled={isMutating}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                    {post.status !== "completed" && post.status !== "processing" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => onDelete(post.id)}
                        disabled={isMutating}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
