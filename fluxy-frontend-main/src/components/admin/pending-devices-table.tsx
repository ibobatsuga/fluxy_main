import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle2, MessageCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useRejectDevice } from "@/hooks/use-admin";
import type { KaiDevice } from "@/types";

interface PendingDevicesTableProps {
  devices: KaiDevice[];
  isLoading: boolean;
  onActivate: (device: KaiDevice) => void;
}

export function PendingDevicesTable({ devices, isLoading, onActivate }: PendingDevicesTableProps) {
  const rejectDevice = useRejectDevice();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (devices.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            icon={MessageCircle}
            title="Tidak ada permintaan koneksi"
            description="Permintaan koneksi WhatsApp Business dari tenant akan muncul di sini"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="divide-y p-0">
        {devices.map((device) => (
          <div key={device.id} className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                <MessageCircle className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{device.business_name}</p>
                <p className="text-xs text-muted-foreground">
                  +{device.wa_number} ·{" "}
                  {formatDistanceToNow(new Date(device.created_at), {
                    addSuffix: true,
                    locale: id,
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" className="h-7 text-xs" onClick={() => onActivate(device)}>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Aktivasi
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => rejectDevice.mutate(device.id)}
                disabled={rejectDevice.isPending}
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
