import { useState } from "react";
import { KeyRound, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePlatformCredentials,
  useSyncMetaAssets,
  useTenants,
  useUpdatePlatformCredentials,
} from "@/hooks/use-admin";

interface FieldConfig {
  key:
    | "meta_app_id"
    | "meta_app_secret"
    | "meta_business_id"
    | "meta_system_user_token"
    | "meta_webhook_verify_token"
    | "tiktok_app_id"
    | "tiktok_app_secret"
    | "ai_image_api_key";
  label: string;
  maskedKey?:
    | "meta_app_secret_masked"
    | "meta_system_user_token_masked"
    | "meta_webhook_verify_token_masked"
    | "tiktok_app_secret_masked"
    | "ai_image_api_key_masked";
  plainCurrentKey?: "meta_app_id" | "meta_business_id" | "tiktok_app_id";
}

const FIELDS: FieldConfig[] = [
  { key: "meta_app_id", label: "Meta App ID", plainCurrentKey: "meta_app_id" },
  { key: "meta_app_secret", label: "Meta App Secret", maskedKey: "meta_app_secret_masked" },
  { key: "meta_business_id", label: "Meta Business ID", plainCurrentKey: "meta_business_id" },
  {
    key: "meta_system_user_token",
    label: "Meta System User Token",
    maskedKey: "meta_system_user_token_masked",
  },
  {
    key: "meta_webhook_verify_token",
    label: "Meta Webhook Verify Token",
    maskedKey: "meta_webhook_verify_token_masked",
  },
  { key: "tiktok_app_id", label: "TikTok App ID", plainCurrentKey: "tiktok_app_id" },
  { key: "tiktok_app_secret", label: "TikTok App Secret", maskedKey: "tiktok_app_secret_masked" },
  { key: "ai_image_api_key", label: "AI Image Generation API Key", maskedKey: "ai_image_api_key_masked" },
];

export function CredentialsForm() {
  const { data: credentials, isLoading } = usePlatformCredentials();
  const updateCredentials = useUpdatePlatformCredentials();
  const syncMeta = useSyncMetaAssets();
  const { data: tenants = [] } = useTenants();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedUserId, setSelectedUserId] = useState("");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Kredensial Integrasi Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const handleSave = () => {
    const payload = Object.fromEntries(
      Object.entries(drafts).filter(([, value]) => value.trim().length > 0)
    );
    if (Object.keys(payload).length === 0) return;
    updateCredentials.mutate(payload, { onSuccess: () => setDrafts({}) });
  };

  const hasChanges = Object.values(drafts).some((v) => v.trim().length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          Kredensial Integrasi Platform
        </CardTitle>
        <CardDescription>
          Nilai yang sudah tersimpan ditampilkan tersamar. Isi field di bawah hanya jika ingin
          mengganti nilainya — field yang dikosongkan tidak akan diubah.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {FIELDS.map((field) => {
          const currentValue = credentials
            ? field.maskedKey
              ? credentials[field.maskedKey]
              : field.plainCurrentKey
                ? credentials[field.plainCurrentKey]
                : null
            : null;
          return (
            <div key={field.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.key} className="text-xs">
                  {field.label}
                </Label>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {currentValue || "Belum diisi"}
                </span>
              </div>
              <Input
                id={field.key}
                type={field.maskedKey ? "password" : "text"}
                placeholder={field.maskedKey ? "Masukkan nilai baru untuk mengganti" : "Masukkan nilai baru"}
                value={drafts[field.key] || ""}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [field.key]: e.target.value }))}
              />
            </div>
          );
        })}
        <Button size="sm" onClick={handleSave} disabled={!hasChanges || updateCredentials.isPending}>
          {updateCredentials.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Simpan Perubahan
        </Button>

        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="meta-sync-tenant" className="text-xs">
            Tenant tujuan sinkronisasi aset Meta
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              id="meta-sync-tenant"
              className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
            >
              <option value="">Pilih tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.business_name || tenant.name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => syncMeta.mutate(selectedUserId)}
              disabled={!selectedUserId || syncMeta.isPending}
            >
              {syncMeta.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              Sinkronkan Meta
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Mengimpor Page Facebook, akun Instagram Professional, dan nomor WhatsApp yang
            ditugaskan ke System User.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
