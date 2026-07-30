import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { AuthShell } from "@/components/layout/auth-shell";

export function PendingApprovalPage() {
  const { logout } = useAuthStore();

  return (
    <AuthShell>
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="mt-4 text-xl">Menunggu Persetujuan</CardTitle>
          <CardDescription>
            Akun Anda sedang dalam proses verifikasi oleh admin Fluxy. Anda akan menerima
            notifikasi email setelah akun disetujui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Apa selanjutnya?</p>
            <ul className="mt-2 space-y-1">
              <li>• Admin akan meninjau pendaftaran Anda</li>
              <li>• Proses biasanya memakan waktu 1x24 jam</li>
              <li>• Anda akan menerima email konfirmasi</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={() => logout()}>
              Keluar
            </Button>
            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full text-muted-foreground">
                Kembali ke halaman login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
