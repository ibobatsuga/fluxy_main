import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Belum terautentikasi → redirect ke login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Fix #9: isAuthenticated = true tapi user masih null (sedang di-fetch atau gagal fetch)
  // Tampilkan loading spinner daripada meloloskan user tanpa data
  if (!user) {
    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    // isAuthenticated tapi user null dan tidak loading → token ada tapi invalid
    return <Navigate to="/login" replace />;
  }

  if (!user.is_approved) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
