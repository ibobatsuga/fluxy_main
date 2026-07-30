import { useState } from "react";
import { CheckCircle2, Clock, Loader2, MessageCircle, QrCode, Smartphone, Unplug, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDisconnectDevice, useGenerateQr, useRequestDevice, useSimulateScan } from "@/hooks/use-kai";
import type { KaiDevice } from "@/types";

const STATUS_META: Record<
  KaiDevice["status"],
  { label: string; variant: "success" | "warning" | "secondary" | "destructive"; icon: typeof CheckCircle2 }
> = {
  connected: { label: "Terhubung", variant: "success", icon: CheckCircle2 },
  qr_ready: { label: "Siap Discan", variant: "warning", icon: QrCode },
  pending: { label: "Menunggu Aktivasi Admin", variant: "warning", icon: Clock },
  disconnected: { label: "Terputus", variant: "secondary", icon: XCircle },
  rejected: { label: "Ditolak", variant: "destructive", icon: XCircle },
};

interface DeviceStatusCardProps {
  device: KaiDevice | null | undefined;
  isLoading: boolean;
}

export function DeviceStatusCard({ device, isLoading }: DeviceStatusCardProps) {
  const [connectMode, setConnectMode] = useState<"qr" | "cloud_api">("qr");
  const [waNumber, setWaNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const requestDevice = useRequestDevice();
  const generateQr = useGenerateQr();
  const simulateScan = useSimulateScan();
  const disconnectDevice = useDisconnectDevice();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-5">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (device && device.status === "connected") {
    const meta = STATUS_META[device.status];
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
                <MessageCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{device.business_name || "WhatsApp Business"}</h3>
                  <Badge variant={meta.variant} className="text-[10px]">
                    <meta.icon className="mr-1 h-3 w-3" />
                    {meta.label}
                  </Badge>
                  {device.connection_type === "qr_gateway" && (
                    <Badge variant="outline" className="text-[10px]">
                      WhatsApp Web (QR)
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {device.wa_number ? `+${device.wa_number}` : "Nomor belum tersedia"}
                </p>
                {device.connected_at && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Terhubung sejak {new Date(device.connected_at).toLocaleDateString("id-ID")}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive shrink-0"
              onClick={() => disconnectDevice.mutate()}
              disabled={disconnectDevice.isPending}
            >
              {disconnectDevice.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Unplug className="mr-1.5 h-3.5 w-3.5" />
              )}
              Putuskan Sesi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // View for QR Ready state
  if (device && device.status === "qr_ready" && device.qr_code) {
    return (
      <Card className="border-teal-500/30 bg-teal-500/5">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-teal-600" />
              <h3 className="font-semibold text-sm">Scan QR Code WhatsApp Web</h3>
            </div>
            <Badge variant="warning" className="text-[10px]">
              Menunggu Pindaian HP
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
              <img
                src={device.qr_code}
                alt="WhatsApp QR Code"
                className="h-48 w-48 object-contain"
              />
              <p className="mt-2 text-[11px] text-muted-foreground text-center">
                Scan QR ini dari aplikasi WhatsApp Anda
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white font-medium text-[10px]">
                  1
                </div>
                <p className="text-muted-foreground">Buka aplikasi **WhatsApp** di HP Anda</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white font-medium text-[10px]">
                  2
                </div>
                <p className="text-muted-foreground">Ketuk **Menu (⋮)** atau **Pengaturan (⚙️)** ➔ **Perangkat Tertaut**</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white font-medium text-[10px]">
                  3
                </div>
                <p className="text-muted-foreground">Ketuk **Tautkan Perangkat** dan arahkan kamera HP ke QR Code di samping</p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => simulateScan.mutate()}
                  disabled={simulateScan.isPending}
                >
                  {simulateScan.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Verifikasi / Konfirmasi Pindaian
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateQr.mutate({ wa_number: device.wa_number || "628123456789", business_name: device.business_name || "Toko Saya" })}
                  disabled={generateQr.isPending}
                >
                  Refresh QR Code
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h3 className="font-medium">Hubungkan Nomor WhatsApp Tenant</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Pilih metode koneksi yang Anda inginkan untuk menyambungkan WhatsApp ke Chatbot Kai.
              </p>
            </div>

            {/* Selector Mode */}
            <div className="flex rounded-lg bg-muted p-1 gap-1 text-xs">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-medium transition-colors ${
                  connectMode === "qr"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setConnectMode("qr")}
              >
                <QrCode className="h-3.5 w-3.5" />
                Scan QR Code (WhatsApp Web)
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-medium transition-colors ${
                  connectMode === "cloud_api"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setConnectMode("cloud_api")}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Meta Cloud API
              </button>
            </div>

            {connectMode === "qr" ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="qr-wa-number" className="text-xs">
                      Nomor WhatsApp Anda
                    </Label>
                    <Input
                      id="qr-wa-number"
                      placeholder="628123456789"
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      disabled={generateQr.isPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qr-business-name" className="text-xs">
                      Nama Bisnis / Toko
                    </Label>
                    <Input
                      id="qr-business-name"
                      placeholder="Toko Maju Jaya"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      disabled={generateQr.isPending}
                    />
                  </div>
                </div>

                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={!waNumber || !businessName || generateQr.isPending}
                  onClick={() => generateQr.mutate({ wa_number: waNumber, business_name: businessName })}
                >
                  {generateQr.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <QrCode className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Tampilkan QR Code untuk Discan
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="wa-number" className="text-xs">
                      Nomor WhatsApp
                    </Label>
                    <Input
                      id="wa-number"
                      placeholder="628123456789"
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      disabled={requestDevice.isPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="business-name" className="text-xs">
                      Nama Bisnis
                    </Label>
                    <Input
                      id="business-name"
                      placeholder="Toko Maju Jaya"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      disabled={requestDevice.isPending}
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? "- Sembunyikan Kredensial Meta Direct" : "+ Konfigurasi Direct WhatsApp Cloud API (Opsional)"}
                  </button>
                </div>

                {showAdvanced && (
                  <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="phone-id" className="text-xs">
                          Phone Number ID
                        </Label>
                        <Input
                          id="phone-id"
                          placeholder="10092837465..."
                          value={phoneNumberId}
                          onChange={(e) => setPhoneNumberId(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="waba-id" className="text-xs">
                          WABA ID
                        </Label>
                        <Input
                          id="waba-id"
                          placeholder="10012345678..."
                          value={wabaId}
                          onChange={(e) => setWabaId(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="access-token" className="text-xs">
                        Access Token (System User / Permanent Token)
                      </Label>
                      <Input
                        id="access-token"
                        type="password"
                        placeholder="EAAG..."
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <Button
                  size="sm"
                  disabled={!waNumber || !businessName || requestDevice.isPending}
                  onClick={() =>
                    requestDevice.mutate({
                      wa_number: waNumber,
                      business_name: businessName,
                      ...(phoneNumberId ? { provider_phone_number_id: phoneNumberId } : {}),
                      ...(wabaId ? { waba_id: wabaId } : {}),
                      ...(accessToken ? { access_token: accessToken } : {}),
                    })
                  }
                >
                  {requestDevice.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  {phoneNumberId && accessToken ? "Hubungkan WhatsApp Directly" : "Kirim Permintaan Koneksi"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
