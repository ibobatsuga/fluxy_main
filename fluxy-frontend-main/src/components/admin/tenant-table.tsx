import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Ban, CheckCircle2, Eye, PlayCircle, Search, UserX, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TenantStatusBadge } from "@/components/admin/tenant-status-badge";
import { getTenantStatus, type TenantStatus } from "@/lib/tenant-utils";
import { useReactivateTenant, useSuspendTenant } from "@/hooks/use-admin";
import type { User } from "@/types";

interface TenantTableProps {
  tenants: User[];
  isLoading: boolean;
  onView: (tenant: User) => void;
  onApprove: (tenant: User) => void;
  onReject: (tenant: User) => void;
}

export function TenantTable({ tenants, isLoading, onView, onApprove, onReject }: TenantTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "all">("all");
  const suspendTenant = useSuspendTenant();
  const reactivateTenant = useReactivateTenant();

  const filtered = useMemo(() => {
    return tenants.filter((tenant) => {
      const status = getTenantStatus(tenant);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          tenant.business_name?.toLowerCase().includes(q) ||
          tenant.name.toLowerCase().includes(q) ||
          tenant.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tenants, search, statusFilter]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama bisnis atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TenantStatus | "all")}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border">
          <EmptyState icon={UserX} title="Tidak ada tenant" description="Coba ubah pencarian atau filter status" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Nama Bisnis</th>
                  <th className="px-4 py-3 font-medium">Kontak</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Expired</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((tenant) => {
                  const status = getTenantStatus(tenant);
                  return (
                    <tr key={tenant.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{tenant.business_name || "-"}</p>
                        <p className="text-xs text-muted-foreground">{tenant.industry_category}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{tenant.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{tenant.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <TenantStatusBadge user={tenant} className="text-[10px]" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                        {tenant.subscription_end_date
                          ? formatDistanceToNow(new Date(tenant.subscription_end_date), {
                              addSuffix: true,
                              locale: id,
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onView(tenant)}
                            title="Lihat detail"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-green-600 hover:text-green-600"
                                onClick={() => onApprove(tenant)}
                                title="Approve"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => onReject(tenant)}
                                title="Reject"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          {(status === "expired" || status === "none") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-green-600 hover:text-green-600"
                              onClick={() => onApprove(tenant)}
                              title="Aktifkan / Perpanjang"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {status === "active" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => suspendTenant.mutate(tenant.id)}
                              disabled={suspendTenant.isPending}
                              title="Suspend"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {status === "suspended" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-green-600 hover:text-green-600"
                              onClick={() => reactivateTenant.mutate(tenant.id)}
                              disabled={reactivateTenant.isPending}
                              title="Reaktivasi"
                            >
                              <PlayCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
