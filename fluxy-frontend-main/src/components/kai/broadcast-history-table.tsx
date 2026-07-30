import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { History, RefreshCw, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useCancelBroadcast, useKaiGroups, useRetryBroadcast } from "@/hooks/use-kai";
import type { KaiBroadcast } from "@/types";

const STATUS_VARIANT: Record<KaiBroadcast["status"], "default" | "secondary" | "destructive" | "success" | "warning"> = {
  draft: "secondary",
  scheduled: "default",
  sending: "warning",
  sent: "success",
  failed: "destructive",
  cancelled: "secondary",
};

const STATUS_LABEL: Record<KaiBroadcast["status"], string> = {
  draft: "Draft",
  scheduled: "Terjadwal",
  sending: "Mengirim",
  sent: "Terkirim",
  failed: "Gagal",
  cancelled: "Dibatalkan",
};

interface BroadcastHistoryTableProps {
  broadcasts: KaiBroadcast[];
  isLoading: boolean;
}

export function BroadcastHistoryTable({ broadcasts, isLoading }: BroadcastHistoryTableProps) {
  const { data: groups = [] } = useKaiGroups();
  const cancelBroadcast = useCancelBroadcast();
  const retryBroadcast = useRetryBroadcast();

  const groupAlias = (id: string) => groups.find((g) => g.id === id)?.alias || id;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <History className="h-4 w-4 text-muted-foreground" />
          Riwayat Broadcast
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : broadcasts.length === 0 ? (
          <EmptyState
            icon={History}
            title="Belum ada broadcast"
            description="Riwayat broadcast Anda akan muncul di sini"
          />
        ) : (
          <div className="divide-y">
            {broadcasts.map((broadcast) => (
              <div key={broadcast.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm">{broadcast.message}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {broadcast.group_ids.map(groupAlias).join(", ")}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[broadcast.status]} className="shrink-0 text-[10px]">
                    {STATUS_LABEL[broadcast.status]}
                  </Badge>
                </div>
                {broadcast.error_message && (
                  <p className="text-[11px] text-destructive">{broadcast.error_message}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(broadcast.created_at), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    {broadcast.status === "failed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => retryBroadcast.mutate(broadcast.id)}
                        disabled={retryBroadcast.isPending}
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Coba Lagi
                      </Button>
                    )}
                    {broadcast.status === "scheduled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-destructive hover:text-destructive"
                        onClick={() => cancelBroadcast.mutate(broadcast.id)}
                        disabled={cancelBroadcast.isPending}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Batalkan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
