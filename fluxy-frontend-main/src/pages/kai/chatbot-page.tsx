import { useEffect, useState } from "react";
import kaiAvatar from "@/assets/Agent-HeroIcon/Kai.webp";
import { Card } from "@/components/ui/card";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { KaiNav } from "@/components/kai/kai-nav";
import { ChatbotSettingsPanel } from "@/components/kai/chatbot-settings-panel";
import { ConversationList } from "@/components/kai/conversation-list";
import { ConversationThread } from "@/components/kai/conversation-thread";
import { useChatbotSettings, useKaiConversations } from "@/hooks/use-kai";
import type { KaiConversation } from "@/types";

export function KaiChatbotPage() {
  const { data: settings, isLoading: settingsLoading } = useChatbotSettings();
  const { data: conversations = [], isLoading: conversationsLoading } = useKaiConversations();
  const [selected, setSelected] = useState<KaiConversation | null>(null);

  useEffect(() => {
    if (!selected && conversations.length > 0) {
      const withHandover = conversations.find((c) => c.state === "waiting_admin");
      setSelected(withHandover || conversations[0]);
    } else if (selected) {
      const updated = conversations.find((c) => c.id === selected.id);
      if (updated) setSelected(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

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

      <ChatbotSettingsPanel settings={settings} isLoading={settingsLoading} />

      <Card className="overflow-hidden p-0">
        <div className="grid h-[560px] grid-cols-1 sm:grid-cols-[280px_1fr]">
          <div className="overflow-y-auto border-b sm:border-b-0 sm:border-r">
            <ConversationList
              conversations={conversations}
              isLoading={conversationsLoading}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
            />
          </div>
          <ConversationThread conversation={selected} />
        </div>
      </Card>
    </div>
  );
}
