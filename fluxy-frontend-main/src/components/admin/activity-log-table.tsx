import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle2, ScrollText, ShieldAlert, ShieldCheck, Sliders, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { AdminActivityLog } from "@/types";

const TYPE_META: Record<
  AdminActivityLog["type"],
  { label: string; icon: typeof CheckCircle2; variant: "success" | "warning" | "destructive" | "secondary" }
> = {
  approval: { label: "Approval", icon: CheckCircle2, variant: "success" },
  reject: { label: "Reject", icon: XCircle, variant: "destructive" },
  suspend: { label: "Suspend", icon: ShieldAlert, variant: "warning" },
  reactivate: { label: "Reaktivasi", icon: ShieldCheck, variant: "success" },
  limit_change: { label: "Perubahan Limit", icon: Sliders, variant: "secondary" },
  usage: { label: "Aktivitas AI Employee", icon: ScrollText, variant: "secondary" },
};

interface ActivityLogTableProps {
  logs: AdminActivityLog[];
  isLoading: boolean;
}

export function ActivityLogTable({ logs, isLoading }: ActivityLogTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            icon={ScrollText}
            title="Belum ada aktivitas"
            description="Log aktivitas tenant akan muncul di sini"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="divide-y">
          {logs.map((log) => {
            const meta = TYPE_META[log.type];
            return (
              <div key={log.id} className="flex items-start gap-3 p-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <meta.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{log.tenant_name}</span>
                    <Badge variant={meta.variant} className="text-[10px]">
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{log.message}</p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-[11px] text-muted-foreground">
                  {format(new Date(log.created_at), "d MMM, HH:mm", { locale: id })}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
