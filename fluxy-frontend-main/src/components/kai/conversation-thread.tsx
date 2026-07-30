import { type FormEvent, useEffect, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Loader2, MessageCircle, PlayCircle, Send } from "lucide-react";
import kaiAvatar from "@/assets/Agent-HeroIcon/Kai.webp";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useResumeConversation, useSendConversationMessage } from "@/hooks/use-kai";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { KaiConversation } from "@/types";

interface ConversationThreadProps {
  conversation: KaiConversation | null;
}

export function ConversationThread({ conversation }: ConversationThreadProps) {
  const resumeConversation = useResumeConversation();
  const sendMessage = useSendConversationMessage();
  const [draft, setDraft] = useState("");

  useEffect(() => setDraft(""), [conversation?.id]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const message = draft.trim();
    if (!conversation || !message) return;
    sendMessage.mutate(
      { conversationId: conversation.id, message },
      { onSuccess: () => setDraft("") }
    );
  };

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={MessageCircle}
          title="Pilih percakapan"
          description="Pilih kontak di sebelah kiri untuk melihat riwayat chat"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-3">
        <div>
          <p className="text-sm font-medium">
            {conversation.contact_name || conversation.wa_contact}
          </p>
          <p className="text-xs text-muted-foreground">{conversation.wa_contact}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {conversation.channel || "whatsapp"}
          </p>
        </div>
      </div>

      {conversation.state === "waiting_admin" && (
        <div className="flex items-center justify-between gap-3 border-b bg-yellow-500/10 px-4 py-2.5">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-xs font-medium">
              Lead siap checkout — perlu follow-up manual dari Anda
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 shrink-0 text-xs"
            onClick={() => resumeConversation.mutate(conversation.id)}
            disabled={resumeConversation.isPending}
          >
            {resumeConversation.isPending ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <PlayCircle className="mr-1.5 h-3 w-3" />
            )}
            Lanjutkan Bot
          </Button>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {(conversation.messages || []).map((msg) => {
          const isCustomer = msg.sender === "customer";
          return (
            <div
              key={msg.id}
              className={cn("flex items-end gap-2", isCustomer ? "justify-start" : "justify-end")}
            >
              {isCustomer ? null : msg.sender === "bot" ? (
                <img src={kaiAvatar} alt="Kai" className="h-6 w-6 shrink-0 rounded-full object-cover" />
              ) : null}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                  isCustomer
                    ? "rounded-bl-sm bg-muted"
                    : msg.sender === "bot"
                      ? "rounded-br-sm bg-primary/10 text-foreground"
                      : "rounded-br-sm bg-primary text-primary-foreground"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px] opacity-70",
                    !isCustomer && msg.sender === "admin" && "text-primary-foreground/70"
                  )}
                >
                  {format(new Date(msg.created_at), "HH:mm")}
                  {msg.sender === "bot" && " · Bot"}
                  {msg.sender === "admin" && " · Anda"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
        <Input
          aria-label="Pesan WhatsApp"
          placeholder={`Tulis balasan via ${conversation.channel || "WhatsApp"}…`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={4096}
          disabled={sendMessage.isPending}
        />
        <Button type="submit" size="icon" disabled={!draft.trim() || sendMessage.isPending}>
          {sendMessage.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Kirim pesan</span>
        </Button>
      </form>
    </div>
  );
}
