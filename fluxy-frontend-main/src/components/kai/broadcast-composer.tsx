import { useState } from "react";
import { Link2, Loader2, Send, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateBroadcast, useKaiGroups } from "@/hooks/use-kai";

export function BroadcastComposer() {
  const { data: groups = [], isLoading: groupsLoading } = useKaiGroups();
  const createBroadcast = useCreateBroadcast();

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const toggleGroup = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    createBroadcast.mutate(
      {
        group_ids: selectedGroupIds,
        message,
        image_url: imageUrl || undefined,
      },
      {
        onSuccess: () => {
          setSelectedGroupIds([]);
          setMessage("");
          setImageUrl("");
        },
      }
    );
  };

  const canSend = selectedGroupIds.length > 0 && message.trim().length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Send className="h-4 w-4 text-muted-foreground" />
          Kirim Broadcast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            Pilih Grup ({selectedGroupIds.length} dipilih)
          </Label>
          {groupsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 text-center">
              <p className="text-xs text-muted-foreground">Belum ada grup kontak</p>
              <Button asChild size="sm" variant="outline">
                <Link to="/kai/setup">
                  <Link2 className="mr-1.5 h-3.5 w-3.5" />
                  Tambah Grup
                </Link>
              </Button>
            </div>
          ) : (
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {groups.map((group) => (
                <label
                  key={group.id}
                  htmlFor={`group-${group.id}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-2.5 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={selectedGroupIds.includes(group.id)}
                    onCheckedChange={() => toggleGroup(group.id)}
                    disabled={createBroadcast.isPending}
                  />
                  <span className="text-sm">{group.alias}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="broadcast-message" className="text-xs">
            Pesan
          </Label>
          <Textarea
            id="broadcast-message"
            placeholder="Tulis pesan broadcast Anda..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={createBroadcast.isPending}
            rows={4}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="broadcast-image" className="text-xs">
            URL Gambar (opsional)
          </Label>
          <Input
            id="broadcast-image"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={createBroadcast.isPending}
          />
        </div>

        <Button className="w-full" disabled={!canSend || createBroadcast.isPending} onClick={handleSend}>
          {createBroadcast.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-3.5 w-3.5" />
          )}
          Kirim Broadcast
        </Button>
      </CardContent>
    </Card>
  );
}
