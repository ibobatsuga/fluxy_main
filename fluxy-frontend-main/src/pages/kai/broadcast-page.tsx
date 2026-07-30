import kaiAvatar from "@/assets/Agent-HeroIcon/Kai.webp";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { KaiNav } from "@/components/kai/kai-nav";
import { BroadcastComposer } from "@/components/kai/broadcast-composer";
import { BroadcastHistoryTable } from "@/components/kai/broadcast-history-table";
import { useKaiBroadcasts } from "@/hooks/use-kai";

export function KaiBroadcastPage() {
  const { data: broadcasts = [], isLoading } = useKaiBroadcasts();

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

      <div className="grid gap-4 lg:grid-cols-2">
        <BroadcastComposer />
        <BroadcastHistoryTable broadcasts={broadcasts} isLoading={isLoading} />
      </div>
    </div>
  );
}
