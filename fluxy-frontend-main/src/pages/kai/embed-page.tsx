import kaiAvatar from "@/assets/Agent-HeroIcon/Kai.webp";
import { AgentAvatar } from "@/components/ui/agent-avatar";

const KAI_APP_URL = import.meta.env.VITE_KAI_APP_URL || "http://localhost:3001";

export function KaiEmbedPage() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-3">
        <AgentAvatar img={kaiAvatar} name="Kai" bgClassName="bg-teal-500" size="h-11 w-11" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kai</h1>
          <p className="text-sm text-muted-foreground">CRM WhatsApp AI — koneksi WA, auto-reply AI, percakapan, broadcast</p>
        </div>
      </div>
      <iframe
        src={KAI_APP_URL}
        title="Kai — CRM WhatsApp AI"
        className="w-full flex-1 rounded-lg border border-border"
        style={{ minHeight: "calc(100vh - 180px)" }}
      />
    </div>
  );
}
