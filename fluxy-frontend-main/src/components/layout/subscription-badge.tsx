import { Badge } from "@/components/ui/badge";

// Fix #11: getSubscriptionBadge dipindah ke file .tsx terpisah agar
// header.tsx hanya mengekspor komponen Header, mendukung Fast Refresh.

export function getSubscriptionBadge(status: string | undefined) {
  switch (status) {
    case "active":
      return <Badge variant="success" className="text-[10px]">Aktif</Badge>;
    case "expired":
      return <Badge variant="destructive" className="text-[10px]">Kedaluwarsa</Badge>;
    case "suspended":
      return <Badge variant="warning" className="text-[10px]">Suspended</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px]">Belum Berlangganan</Badge>;
  }
}
