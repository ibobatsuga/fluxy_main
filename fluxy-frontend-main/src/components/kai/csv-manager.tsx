import { useEffect, useState } from "react";
import { CheckCircle2, FileSpreadsheet, Loader2, RefreshCw, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSyncCsv, useUpdateChatbotSettings } from "@/hooks/use-kai";
import type { KaiChatbotSettings } from "@/types";

const SYNC_META: Record<
  KaiChatbotSettings["csv_sync_status"],
  { label: string; variant: "success" | "warning" | "secondary" | "destructive" }
> = {
  idle: { label: "Belum disinkronkan", variant: "secondary" },
  syncing: { label: "Sinkronisasi...", variant: "warning" },
  success: { label: "Tersinkronisasi", variant: "success" },
  failed: { label: "Gagal", variant: "destructive" },
};

interface CsvManagerProps {
  settings: KaiChatbotSettings | null | undefined;
  isLoading: boolean;
}

export function CsvManager({ settings, isLoading }: CsvManagerProps) {
  const [csvUrl, setCsvUrl] = useState(settings?.csv_url || "");
  const updateSettings = useUpdateChatbotSettings();
  const syncCsv = useSyncCsv();

  useEffect(() => {
    setCsvUrl(settings?.csv_url || "");
  }, [settings?.csv_url]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Data Produk (CSV)</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  const syncStatus = settings?.csv_sync_status || "idle";
  const meta = SYNC_META[syncStatus];
  const isSyncing = syncStatus === "syncing" || syncCsv.isPending;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            Data Produk (CSV)
          </CardTitle>
          <Badge variant={meta.variant} className="text-[10px]">
            {syncStatus === "success" && <CheckCircle2 className="mr-1 h-3 w-3" />}
            {syncStatus === "failed" && <XCircle className="mr-1 h-3 w-3" />}
            {meta.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Link Google Sheet/CSV berisi kolom nama produk, stok, dan harga — dipakai chatbot Kai
          untuk menjawab pertanyaan pelanggan.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={csvUrl}
            onChange={(e) => setCsvUrl(e.target.value)}
            disabled={updateSettings.isPending}
          />
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={!csvUrl || updateSettings.isPending}
            onClick={() => updateSettings.mutate({ csv_url: csvUrl })}
          >
            Simpan Link
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {settings?.csv_last_synced
              ? `Terakhir sinkron ${formatDistanceToNow(new Date(settings.csv_last_synced), { addSuffix: true, locale: id })}`
              : "Belum pernah disinkronkan"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            disabled={!settings?.csv_url || isSyncing}
            onClick={() => syncCsv.mutate()}
          >
            {isSyncing ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            Sinkronkan Sekarang
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
