import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

import { ThemeProvider } from "@/components/theme-provider";
import { useThemeStore } from "@/stores/theme";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/layout/protected-route";

// Public pages — tidak perlu lazy (ringan, selalu diakses pertama kali)
import { LandingPage } from "@/pages/landing/landing-page";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { PendingApprovalPage } from "@/pages/auth/pending-approval";
import { OAuthCallbackPage } from "@/pages/auth/oauth-callback";

// Fix #12: Lazy load semua halaman protected agar main bundle tidak terlalu besar.
// Sebelumnya: 1.2MB — setelah code splitting, halaman hanya di-load saat diakses.
const DashboardPage = lazy(() =>
  import("@/pages/dashboard/dashboard-page").then((m) => ({ default: m.DashboardPage }))
);
const PixelPage = lazy(() =>
  import("@/pages/pixel/pixel-page").then((m) => ({ default: m.PixelPage }))
);
const MotionPage = lazy(() =>
  import("@/pages/motion/motion-page").then((m) => ({ default: m.MotionPage }))
);
const LunaPage = lazy(() =>
  import("@/pages/luna/luna-page").then((m) => ({ default: m.LunaPage }))
);
const MayaConnectPage = lazy(() =>
  import("@/pages/maya/connect-page").then((m) => ({ default: m.MayaConnectPage }))
);
const MayaCreatePage = lazy(() =>
  import("@/pages/maya/create-page").then((m) => ({ default: m.MayaCreatePage }))
);
const MayaStoriesPage = lazy(() =>
  import("@/pages/maya/stories-page").then((m) => ({ default: m.MayaStoriesPage }))
);
const EchoPage = lazy(() =>
  import("@/pages/echo/echo-page").then((m) => ({ default: m.EchoPage }))
);
const KaiSetupPage = lazy(() =>
  import("@/pages/kai/setup-page").then((m) => ({ default: m.KaiSetupPage }))
);
const KaiBroadcastPage = lazy(() =>
  import("@/pages/kai/broadcast-page").then((m) => ({ default: m.KaiBroadcastPage }))
);
const KaiChatbotPage = lazy(() =>
  import("@/pages/kai/chatbot-page").then((m) => ({ default: m.KaiChatbotPage }))
);
const KaiLogsPage = lazy(() =>
  import("@/pages/kai/logs-page").then((m) => ({ default: m.KaiLogsPage }))
);
const AdminTenantsPage = lazy(() =>
  import("@/pages/admin/tenants-page").then((m) => ({ default: m.AdminTenantsPage }))
);
const AdminKaiDevicesPage = lazy(() =>
  import("@/pages/admin/kai-devices-page").then((m) => ({ default: m.AdminKaiDevicesPage }))
);
const AdminConfigPage = lazy(() =>
  import("@/pages/admin/config-page").then((m) => ({ default: m.AdminConfigPage }))
);
const SettingsPage = lazy(() =>
  import("@/pages/settings/settings-page").then((m) => ({ default: m.SettingsPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function AppToaster() {
  const { theme } = useThemeStore();
  return <Toaster position="top-right" theme={theme} richColors />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pending-approval" element={<PendingApprovalPage />} />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute requireTenant>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path="/dashboard"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                }
              />

              {/* Pixel */}
              <Route
                path="/pixel"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PixelPage />
                  </Suspense>
                }
              />

              {/* Motion */}
              <Route
                path="/motion"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MotionPage />
                  </Suspense>
                }
              />

              {/* Luna */}
              <Route
                path="/luna"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LunaPage />
                  </Suspense>
                }
              />

              {/* Maya */}
              <Route path="/maya" element={<Navigate to="/maya/create" replace />} />
              <Route
                path="/maya/connect"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MayaConnectPage />
                  </Suspense>
                }
              />
              <Route
                path="/maya/create"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MayaCreatePage />
                  </Suspense>
                }
              />
              <Route path="/maya/calendar" element={<Navigate to="/maya/create" replace />} />
              <Route
                path="/maya/stories"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MayaStoriesPage />
                  </Suspense>
                }
              />

              {/* Echo */}
              <Route
                path="/echo"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <EchoPage />
                  </Suspense>
                }
              />

              {/* Kai */}
              <Route path="/kai" element={<Navigate to="/kai/setup" replace />} />
              <Route
                path="/kai/setup"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <KaiSetupPage />
                  </Suspense>
                }
              />
              <Route
                path="/kai/broadcast"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <KaiBroadcastPage />
                  </Suspense>
                }
              />
              <Route
                path="/kai/chatbot"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <KaiChatbotPage />
                  </Suspense>
                }
              />
              <Route
                path="/kai/logs"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <KaiLogsPage />
                  </Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SettingsPage />
                  </Suspense>
                }
              />
            </Route>

            {/* Admin Routes */}
            <Route
              element={
                <ProtectedRoute requireAdmin>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path="/admin/tenants"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminTenantsPage />
                  </Suspense>
                }
              />
              <Route
                path="/admin/kai"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminKaiDevicesPage />
                  </Suspense>
                }
              />
              <Route
                path="/admin/config"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminConfigPage />
                  </Suspense>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <AppToaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
