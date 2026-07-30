import { useEffect, useState } from "react";
import { Loader2, Power, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateChatbotSettings } from "@/hooks/use-kai";
import type { KaiChatbotSettings } from "@/types";

interface ChatbotSettingsPanelProps {
  settings: KaiChatbotSettings | null | undefined;
  isLoading: boolean;
}

export function ChatbotSettingsPanel({ settings, isLoading }: ChatbotSettingsPanelProps) {
  const updateSettings = useUpdateChatbotSettings();

  const [isActive, setIsActive] = useState(settings?.is_active ?? true);
  const [greeting, setGreeting] = useState(settings?.greeting_msg || "");
  const [paymentKeywords, setPaymentKeywords] = useState(
    (settings?.payment_keywords || []).join(", ")
  );
  const [adminWaNumber, setAdminWaNumber] = useState(settings?.admin_wa_number || "");
  const [handoffMsg, setHandoffMsg] = useState(settings?.handoff_notify_msg || "");

  useEffect(() => {
    if (!settings) return;
    setIsActive(settings.is_active);
    setGreeting(settings.greeting_msg || "");
    setPaymentKeywords((settings.payment_keywords || []).join(", "));
    setAdminWaNumber(settings.admin_wa_number || "");
    setHandoffMsg(settings.handoff_notify_msg || "");
  }, [settings]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Pengaturan Chatbot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  const handleSave = () => {
    updateSettings.mutate({
      is_active: isActive,
      greeting_msg: greeting,
      payment_keywords: paymentKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      admin_wa_number: adminWaNumber,
      handoff_notify_msg: handoffMsg,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Settings className="h-4 w-4 text-muted-foreground" />
          Pengaturan Chatbot
        </CardTitle>
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setIsActive((v) => !v)}
        >
          <Power className="mr-1.5 h-3 w-3" />
          {isActive ? "Aktif" : "Nonaktif"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="greeting" className="text-xs">
            Pesan Sapaan
          </Label>
          <Textarea
            id="greeting"
            placeholder="Halo! Terima kasih sudah menghubungi kami..."
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="payment-keywords" className="text-xs">
            Kata Kunci Pembayaran (pisahkan koma)
          </Label>
          <Input
            id="payment-keywords"
            placeholder="checkout, bayar, transfer, pesan sekarang"
            value={paymentKeywords}
            onChange={(e) => setPaymentKeywords(e.target.value)}
          />
          {paymentKeywords && (
            <div className="flex flex-wrap gap-1">
              {paymentKeywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
                .map((k) => (
                  <Badge key={k} variant="secondary" className="text-[10px]">
                    {k}
                  </Badge>
                ))}
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="admin-wa" className="text-xs">
              Nomor WA Admin (untuk handover)
            </Label>
            <Input
              id="admin-wa"
              placeholder="628123456789"
              value={adminWaNumber}
              onChange={(e) => setAdminWaNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="handoff-msg" className="text-xs">
              Pesan Notifikasi Handover
            </Label>
            <Input
              id="handoff-msg"
              placeholder="Lead siap checkout, perlu follow-up manual"
              value={handoffMsg}
              onChange={(e) => setHandoffMsg(e.target.value)}
            />
          </div>
        </div>

        <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Simpan Pengaturan
        </Button>
      </CardContent>
    </Card>
  );
}
