import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CaptionEditor } from "@/components/maya/caption-editor";
import { PlatformSelector } from "@/components/maya/platform-selector";
import { useUpdatePost } from "@/hooks/use-maya";
import type { Schedule, SocialAccount } from "@/types";

function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

interface EditPostModalProps {
  post: Schedule | null;
  accounts: SocialAccount[];
  open: boolean;
  onClose: () => void;
}

export function EditPostModal({ post, accounts, open, onClose }: EditPostModalProps) {
  const updatePost = useUpdatePost();

  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [platformIds, setPlatformIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => {
    if (post) {
      setCaption(post.content?.caption || "");
      setHashtags(post.content?.hashtags || "");
      setPlatformIds(post.platforms?.map((p) => p.social_account_id) || []);
      setScheduledAt(toLocalInputValue(post.scheduled_at));
    }
  }, [post]);

  if (!post) return null;

  const handleSave = () => {
    updatePost.mutate(
      {
        id: post.id,
        data: {
          caption,
          hashtags,
          platforms: platformIds,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <CaptionEditor
            caption={caption}
            onCaptionChange={setCaption}
            hashtags={hashtags}
            onHashtagsChange={setHashtags}
            disabled={updatePost.isPending}
          />

          <div className="space-y-1.5">
            <Label htmlFor="edit-scheduled-at" className="text-xs">
              Tanggal & Waktu
            </Label>
            <Input
              id="edit-scheduled-at"
              type="datetime-local"
              lang="id-ID"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              disabled={updatePost.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Platform Tujuan</Label>
            <PlatformSelector
              accounts={accounts}
              isLoading={false}
              selectedIds={platformIds}
              onChange={setPlatformIds}
              disabled={updatePost.isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updatePost.isPending}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={updatePost.isPending}>
            {updatePost.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
