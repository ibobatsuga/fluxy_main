import { useState } from "react";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateGroup, useDeleteGroup, useKaiGroups } from "@/hooks/use-kai";

export function GroupManager() {
  const { data: groups = [], isLoading } = useKaiGroups();
  const createGroup = useCreateGroup();
  const deleteGroup = useDeleteGroup();

  const [open, setOpen] = useState(false);
  const [alias, setAlias] = useState("");
  const [waGroupId, setWaGroupId] = useState("");

  const handleCreate = () => {
    createGroup.mutate(
      { alias, wa_group_id: waGroupId },
      {
        onSuccess: () => {
          setOpen(false);
          setAlias("");
          setWaGroupId("");
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Users className="h-4 w-4 text-muted-foreground" />
          Grup Kontak
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Tambah Grup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Grup Kontak</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="group-alias" className="text-xs">
                  Nama Grup
                </Label>
                <Input
                  id="group-alias"
                  placeholder="Reseller Bandung"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="group-wa-id" className="text-xs">
                  ID Grup WhatsApp
                </Label>
                <Input
                  id="group-wa-id"
                  placeholder="120363012345678901@g.us"
                  value={waGroupId}
                  onChange={(e) => setWaGroupId(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                size="sm"
                disabled={!alias || !waGroupId || createGroup.isPending}
                onClick={handleCreate}
              >
                {createGroup.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : groups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada grup"
            description="Tambahkan grup WhatsApp untuk mulai mengirim broadcast"
          />
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between rounded-lg border border-border p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{group.alias}</p>
                  <p className="truncate text-xs text-muted-foreground">{group.wa_group_id}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => deleteGroup.mutate(group.id)}
                  disabled={deleteGroup.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
