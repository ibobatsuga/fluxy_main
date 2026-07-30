import { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import { CheckCircle2, Loader2 } from "lucide-react";
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
import { useApproveTenant } from "@/hooks/use-admin";
import type { User } from "@/types";

interface ApproveTenantModalProps {
  tenant: User | null;
  onClose: () => void;
}

export function ApproveTenantModal({ tenant, onClose }: ApproveTenantModalProps) {
  const approveTenant = useApproveTenant();
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));

  useEffect(() => {
    if (tenant) {
      setStartDate(format(new Date(), "yyyy-MM-dd"));
      setEndDate(format(addDays(new Date(), 30), "yyyy-MM-dd"));
    }
  }, [tenant]);

  const handleApprove = () => {
    if (!tenant) return;
    approveTenant.mutate(
      {
        userId: tenant.id,
        data: {
          subscription_start_date: new Date(startDate).toISOString(),
          subscription_end_date: new Date(endDate).toISOString(),
        },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={tenant !== null} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Approve Tenant
          </DialogTitle>
          <DialogDescription>
            Aktivasi {tenant?.business_name || tenant?.name} dengan mengatur tanggal mulai dan
            berakhirnya subscription.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sub-start" className="text-xs">
              Tanggal Aktif
            </Label>
            <Input
              id="sub-start"
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sub-end" className="text-xs">
              Tanggal Berakhir
            </Label>
            <Input
              id="sub-end"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleApprove}
            disabled={!startDate || !endDate || approveTenant.isPending}
          >
            {approveTenant.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Approve & Aktivasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
