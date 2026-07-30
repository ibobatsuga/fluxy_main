import type { User } from "@/types";

// Fix #11: getTenantStatus dipindah ke file .ts terpisah agar
// tenant-status-badge.tsx hanya mengekspor komponen React, mendukung Fast Refresh.

export type TenantStatus = "pending" | "active" | "expired" | "suspended" | "none";

export function getTenantStatus(user: User): TenantStatus {
  if (!user.is_approved) return "pending";
  if (user.subscription_status === "suspended") return "suspended";
  if (user.subscription_end_date && new Date(user.subscription_end_date) < new Date()) {
    return "expired";
  }
  if (user.subscription_status === "active") return "active";
  return "none";
}
