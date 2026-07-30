import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle2, Clock, ScrollText, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { KaiLog } from "@/types";

const TYPE_LABEL: Record<KaiLog["type"], string> = {
  broadcast: "Broadcast",
  chat: "Chat",
  handoff: "Handover",
  resume: "Resume Bot",
  system: "Sistem",
  error: "Error",
};

const STATUS_META: Record<
  KaiLog["status"],
  { variant: "success" | "warning" | "destructive"; icon: typeof CheckCircle2 }
> = {
  success: { variant: "success", icon: CheckCircle2 },
  failed: { variant: "destructive", icon: XCircle },
  pending: { variant: "warning", icon: Clock },
};

interface LogsTableProps {
  logs: KaiLog[];
  isLoading: boolean;
}

export function LogsTable({ logs, isLoading }: LogsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
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
          <EmptyState icon={ScrollText} title="Belum ada log" description="Aktivitas Kai akan tercatat di sini" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => {
                const meta = STATUS_META[log.status];
                return (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {TYPE_LABEL[log.type]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {log.target || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={meta.variant} className="text-[10px]">
                        <meta.icon className="mr-1 h-3 w-3" />
                        {log.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "d MMM yyyy, HH:mm", { locale: id })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
