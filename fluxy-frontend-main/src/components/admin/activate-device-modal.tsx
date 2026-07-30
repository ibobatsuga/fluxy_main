import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActivateDevice } from "@/hooks/use-admin";
import type { KaiDevice } from "@/types";

interface ActivateDeviceModalProps {
  device: KaiDevice | null;
  onClose: () => void;
}

export function ActivateDeviceModal({ device, onClose }: ActivateDeviceModalProps) {
  const activateDevice = useActivateDevice();
  const [deviceKey, setDeviceKey] = useState("");
  const [apiKey, setApiKey] = useState("");

  const handleActivate = () => {
    if (!device) return;
    activateDevice.mutate(
      { deviceId: device.id, data: { device_key: deviceKey, api_key: apiKey } },
      {
        onSuccess: () => {
          setDeviceKey("");
          setApiKey("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog
      open={device !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setDeviceKey("");
          setApiKey("");
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-green-500" />
            Aktivasi WhatsApp Business
          </DialogTitle>
          <DialogDescription>
            Aktivasi koneksi WABA untuk {device?.business_name} ({device?.wa_number}) setelah
            Business Verification selesai.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="device-key" className="text-xs">
              Device Key
            </Label>
            <Input
              id="device-key"
              placeholder="ping_dev_xxxxx"
              value={deviceKey}
              onChange={(e) => setDeviceKey(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="api-key" className="text-xs">
              API Key
            </Label>
            <Input
              id="api-key"
              placeholder="sk_waba_xxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleActivate}
            disabled={!deviceKey || !apiKey || activateDevice.isPending}
          >
            {activateDevice.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Aktivasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
