import { Badge } from "@/components/ui/badge";
import type { User } from "@/types";
import { getTenantStatus, type TenantStatus } from "@/lib/tenant-utils";

const STATUS_META: Record<
  TenantStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "secondary" }
> = {
  pending: { label: "Pending", variant: "warning" },
  active: { label: "Aktif", variant: "success" },
  expired: { label: "Kedaluwarsa", variant: "destructive" },
  suspended: { label: "Suspended", variant: "secondary" },
  none: { label: "Belum Berlangganan", variant: "secondary" },
};

export function TenantStatusBadge({ user, className }: { user: User; className?: string }) {
  const status = getTenantStatus(user);
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.variant} className={className}>
      {meta.label}
    </Badge>
  );
}
