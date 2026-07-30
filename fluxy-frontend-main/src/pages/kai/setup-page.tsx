import kaiAvatar from "@/assets/Agent-HeroIcon/Kai.webp";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { KaiNav } from "@/components/kai/kai-nav";
import { DeviceStatusCard } from "@/components/kai/device-status-card";
import { CsvManager } from "@/components/kai/csv-manager";
import { GroupManager } from "@/components/kai/group-manager";
import { useChatbotSettings, useKaiDevice } from "@/hooks/use-kai";

export function KaiSetupPage() {
  const { data: device, isLoading: deviceLoading } = useKaiDevice();
  const { data: settings, isLoading: settingsLoading } = useChatbotSettings();

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
        <DeviceStatusCard device={device} isLoading={deviceLoading} />
        <CsvManager settings={settings} isLoading={settingsLoading} />
      </div>

      <GroupManager />
    </div>
  );
}
