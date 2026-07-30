import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar, MobileSidebar } from "./sidebar";
import { Header } from "./header";
import { SubscriptionGateBanner } from "./subscription-gate";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSidebarStore } from "@/stores/sidebar";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { isCollapsed, closeMobile } = useSidebarStore();
  const { fetchUser, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <MobileSidebar />
        <div
          className={cn(
            "flex flex-col transition-all duration-300 min-h-screen",
            "md:pl-16",
            !isCollapsed && "md:!pl-64"
          )}
        >
          <Header />
          <SubscriptionGateBanner />
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
