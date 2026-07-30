import { useState } from "react";
import { Shield } from "lucide-react";
import { TenantTable } from "@/components/admin/tenant-table";
import { TenantDetailSheet } from "@/components/admin/tenant-detail-sheet";
import { ApproveTenantModal } from "@/components/admin/approve-tenant-modal";
import { RejectTenantModal } from "@/components/admin/reject-tenant-modal";
import { UsageOverview } from "@/components/admin/usage-overview";
import { ActivityLogTable } from "@/components/admin/activity-log-table";
import { useAggregateUsage, useActivityLogs, useTenants } from "@/hooks/use-admin";
import type { User } from "@/types";

export function AdminTenantsPage() {
  const { data: tenants = [], isLoading: tenantsLoading } = useTenants();
  const { data: aggregateUsage, isLoading: usageLoading } = useAggregateUsage();
  const { data: logs = [], isLoading: logsLoading } = useActivityLogs();

  const [viewing, setViewing] = useState<User | null>(null);
  const [approving, setApproving] = useState<User | null>(null);
  const [rejecting, setRejecting] = useState<User | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Tenant</h1>
          <p className="text-sm text-muted-foreground">
            Approve, monitor, dan kelola seluruh tenant Fluxy
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Ringkasan Penggunaan Platform</h2>
        <UsageOverview usage={aggregateUsage} isLoading={usageLoading} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Daftar Tenant</h2>
        <TenantTable
          tenants={tenants}
          isLoading={tenantsLoading}
          onView={setViewing}
          onApprove={setApproving}
          onReject={setRejecting}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Log Aktivitas</h2>
        <ActivityLogTable logs={logs} isLoading={logsLoading} />
      </section>

      <TenantDetailSheet tenant={viewing} onClose={() => setViewing(null)} />
      <ApproveTenantModal tenant={approving} onClose={() => setApproving(null)} />
      <RejectTenantModal tenant={rejecting} onClose={() => setRejecting(null)} />
    </div>
  );
}
