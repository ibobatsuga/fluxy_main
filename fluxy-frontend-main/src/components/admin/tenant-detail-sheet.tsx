import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Building2, Calendar, Mail, Tag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { TenantStatusBadge } from "@/components/admin/tenant-status-badge";
import { useTenantUsage } from "@/hooks/use-admin";
import type { User } from "@/types";

const EMPLOYEE_LABEL: Record<string, string> = {
  pixel: "Pixel",
  maya: "Maya",
  echo: "Echo",
  kai: "Kai",
};

interface TenantDetailSheetProps {
  tenant: User | null;
  onClose: () => void;
}

export function TenantDetailSheet({ tenant, onClose }: TenantDetailSheetProps) {
  const { data: usage, isLoading: usageLoading } = useTenantUsage(tenant?.id ?? null);

  return (
    <Sheet open={tenant !== null} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        {tenant && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{tenant.business_name || tenant.name}</SheetTitle>
                <TenantStatusBadge user={tenant} />
              </div>
            </SheetHeader>

            <div className="mt-4 space-y-5">
              <section className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{tenant.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{tenant.email}</span>
                </div>
                {tenant.industry_category && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-3.5 w-3.5 shrink-0" />
                    <span>{tenant.industry_category}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Daftar {format(new Date(tenant.created_at), "d MMMM yyyy", { locale: id })}
                  </span>
                </div>
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground">Riwayat Subscription</h3>
                {tenant.subscription_start_date && tenant.subscription_end_date ? (
                  <div className="rounded-lg border p-3 text-sm">
                    <p>
                      Aktif:{" "}
                      {format(new Date(tenant.subscription_start_date), "d MMM yyyy", {
                        locale: id,
                      })}{" "}
                      —{" "}
                      {format(new Date(tenant.subscription_end_date), "d MMM yyyy", {
                        locale: id,
                      })}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Belum pernah diaktivasi</p>
                )}
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground">Penggunaan Bulan Ini</h3>
                {usageLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-lg" />
                    ))}
                  </div>
                ) : usage ? (
                  <div className="space-y-3">
                    {(Object.keys(usage) as (keyof typeof usage)[]).map((key) => {
                      const { used, limit } = usage[key];
                      const unlimited = limit < 0;
                      const percentage = unlimited ? 0 : limit > 0 ? (used / limit) * 100 : 0;
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">{EMPLOYEE_LABEL[key]}</span>
                            <span className="text-muted-foreground">
                              {unlimited ? `${used} (unlimited)` : `${used}/${limit}`}
                            </span>
                          </div>
                          {!unlimited && (
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                              <div
                                className={`h-full rounded-full ${
                                  percentage >= 95
                                    ? "bg-red-500"
                                    : percentage >= 80
                                      ? "bg-yellow-500"
                                      : "bg-primary"
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Data penggunaan tidak tersedia</p>
                )}
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
