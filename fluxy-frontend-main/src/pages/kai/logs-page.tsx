import { useState } from "react";
import kaiAvatar from "@/assets/Agent-HeroIcon/Kai.webp";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { KaiNav } from "@/components/kai/kai-nav";
import { LogsTable } from "@/components/kai/logs-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKaiLogs } from "@/hooks/use-kai";

export function KaiLogsPage() {
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const { data: logs = [], isLoading } = useKaiLogs({
    type: type === "all" ? undefined : type,
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AgentAvatar img={kaiAvatar} name="Kai" bgClassName="bg-teal-500" size="h-11 w-11" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kai</h1>
          <p className="text-sm text-muted-foreground">Chatbot Sales & Layanan Anda</p>
        </div>
      </div>

      <KaiNav />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="broadcast">Broadcast</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
            <SelectItem value="handoff">Handover</SelectItem>
            <SelectItem value="resume">Resume Bot</SelectItem>
            <SelectItem value="system">Sistem</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="success">Berhasil</SelectItem>
            <SelectItem value="failed">Gagal</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <LogsTable logs={logs} isLoading={isLoading} />
    </div>
  );
}
