import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { PendingDevicesTable } from "@/components/admin/pending-devices-table";
import { ActivateDeviceModal } from "@/components/admin/activate-device-modal";
import { usePendingDevices } from "@/hooks/use-admin";
import type { KaiDevice } from "@/types";

export function AdminKaiDevicesPage() {
  const { data: devices = [], isLoading } = usePendingDevices();
  const [activating, setActivating] = useState<KaiDevice | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kai Devices</h1>
          <p className="text-sm text-muted-foreground">
            Aktivasi permintaan koneksi WhatsApp Business dari tenant
          </p>
        </div>
      </div>

      <PendingDevicesTable devices={devices} isLoading={isLoading} onActivate={setActivating} />

      <ActivateDeviceModal device={activating} onClose={() => setActivating(null)} />
    </div>
  );
}
