import { useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRejectTenant } from "@/hooks/use-admin";
import type { User } from "@/types";

interface RejectTenantModalProps {
  tenant: User | null;
  onClose: () => void;
}

export function RejectTenantModal({ tenant, onClose }: RejectTenantModalProps) {
  const rejectTenant = useRejectTenant();
  const [reason, setReason] = useState("");

  const handleReject = () => {
    if (!tenant || !reason.trim()) return;
    rejectTenant.mutate(
      { userId: tenant.id, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog
      open={tenant !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setReason("");
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            Reject Tenant
          </DialogTitle>
          <DialogDescription>
            Tolak pendaftaran {tenant?.business_name || tenant?.name}. Alasan akan dikirimkan ke
            tenant.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="reject-reason" className="text-xs">
            Alasan Penolakan
          </Label>
          <Textarea
            id="reject-reason"
            placeholder="Contoh: Data bisnis tidak lengkap, silakan daftar ulang dengan dokumen yang valid."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!reason.trim() || rejectTenant.isPending}
          >
            {rejectTenant.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Reject Pendaftaran
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
