import { useAuthStore } from "@/stores/auth";
import { Lock, ShieldAlert, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubscriptionGateBanner() {
  const { user } = useAuthStore();

  if (!user || user.subscription_status === "active") {
    return null;
  }

  const isExpired = user.subscription_status === "expired";
  const isSuspended = user.subscription_status === "suspended";

  return (
    <div className="w-full bg-destructive/10 border-b border-destructive/20 px-4 py-3 text-destructive font-medium text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <ShieldAlert className="h-4 w-4 shrink-0 text-destructive animate-pulse" />
        <div>
          <span className="font-semibold">
            {isExpired ? "Paket Berlangganan Berakhir!" : isSuspended ? "Akun Diberhentikan Sementara!" : "Status Langganan Tidak Aktif"}
          </span>
          <span className="ml-1.5 opacity-90 hidden md:inline">
            Aksi eksekusi AI Employee (generate image, publish post, broadcast WA) dibatasi.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          className="h-7 text-xs px-3"
          onClick={() => {
            window.open(
              "https://wa.me/6281234567890?text=Halo%20Admin%20Fluxy,%20saya%20ingin%20memperbarui%20paket%20langganan",
              "_blank"
            );
          }}
        >
          Perbarui Paket <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function SubscriptionGateGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  if (user && user.subscription_status !== "active") {
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-40 select-none grayscale blur-[1px]">
          {children}
        </div>
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-background/80 backdrop-blur-sm rounded-lg border border-destructive/30">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive mb-3">
            <Lock className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold">Fitur Di-lock</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1">
            Status langganan akun Anda saat ini tidak aktif. Silakan hubungi admin untuk mengaktifkan kembali paket Anda agar dapat menggunakan fitur ini.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              window.open("https://wa.me/6281234567890?text=Halo%20Admin%20Fluxy,%20saya%20ingin%20reaktivasi%20akun", "_blank");
            }}
          >
            Hubungi Admin Fluxy
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
