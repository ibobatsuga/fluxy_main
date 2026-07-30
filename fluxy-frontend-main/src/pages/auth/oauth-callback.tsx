import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { Zap } from "lucide-react";
import { toast } from "sonner";

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, fetchUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Login dengan Google gagal. Silakan coba lagi.");
      navigate("/login");
      return;
    }

    if (token) {
      setToken(token);
      fetchUser()
        .then(() => {
          toast.success("Login berhasil!");
          navigate("/dashboard");
        })
        .catch(() => {
          toast.error("Gagal memuat data pengguna.");
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, setToken, fetchUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-600 animate-pulse">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <p className="text-sm text-muted-foreground">Memproses login...</p>
      </div>
    </div>
  );
}
