import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { AlertTriangle, MessagesSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { KaiConversation } from "@/types";

const STATE_META: Record<
  KaiConversation["state"],
  { label: string; variant: "success" | "warning" | "secondary" }
> = {
  bot_active: { label: "Bot Aktif", variant: "success" },
  waiting_admin: { label: "Perlu Respon", variant: "warning" },
  paused: { label: "Dijeda", variant: "secondary" },
};

interface ConversationListProps {
  conversations: KaiConversation[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (conversation: KaiConversation) => void;
}

export function ConversationList({
  conversations,
  isLoading,
  selectedId,
  onSelect,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="Belum ada percakapan"
        description="Percakapan chatbot dengan pelanggan akan muncul di sini"
      />
    );
  }

  const sorted = [...conversations].sort((a, b) => {
    if (a.state === "waiting_admin" && b.state !== "waiting_admin") return -1;
    if (b.state === "waiting_admin" && a.state !== "waiting_admin") return 1;
    return new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime();
  });

  return (
    <div className="divide-y">
      {sorted.map((conversation) => {
        const meta = STATE_META[conversation.state];
        const isSelected = conversation.id === selectedId;
        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation)}
            className={cn(
              "flex w-full flex-col gap-1 p-3 text-left transition-colors hover:bg-muted/50",
              isSelected && "bg-muted"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">
                {conversation.contact_name || conversation.wa_contact}
              </span>
              {conversation.state === "waiting_admin" ? (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
              ) : (
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {conversation.last_message_at
                    ? formatDistanceToNow(new Date(conversation.last_message_at), { locale: id })
                    : ""}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {conversation.last_message || "Belum ada pesan"}
            </p>
            <Badge variant={meta.variant} className="w-fit text-[9px]">
              {meta.label}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
