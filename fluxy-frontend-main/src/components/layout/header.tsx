import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  Bell,
  Menu,
  User,
  Settings,
  CreditCard,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Users,
  Info,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth";
import { useSidebarStore } from "@/stores/sidebar";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSubscriptionBadge } from "@/components/layout/subscription-badge";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";

function getNotificationIcon(type: string) {
  switch (type) {
    case "kai_handover":
      return <MessageSquare className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
    case "maya_failed":
      return <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />;
    case "admin_tenant_pending":
      return <Users className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />;
    case "pixel_done":
      return <Sparkles className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />;
    case "subscription_warning":
      return <Info className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />;
    default:
      return <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />;
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}


const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pixel": "Pixel - AI Designer",
  "/maya": "Maya - Social Media",
  "/maya/connect": "Hubungkan Akun",
  "/maya/create": "Jadwalkan Konten",
  "/maya/stories": "Penjadwal Multi-Story",
  "/echo": "Echo - Analytics",
  "/kai": "Kai - Chatbot",
  "/kai/setup": "Setup Device",
  "/kai/broadcast": "Broadcast",
  "/kai/chatbot": "Chatbot",
  "/kai/logs": "Logs",
  "/admin/tenants": "Kelola Tenant",
  "/admin/kai": "Kai Devices",
  "/admin/config": "Konfigurasi",
  "/settings": "Pengaturan & Langganan",
};

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [{ label: "Fluxy", href: "/dashboard" }];

  const segments = pathname.split("/").filter(Boolean);
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const label = routeLabels[currentPath];
    if (label) {
      const isLast = i === segments.length - 1;
      crumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    }
  }

  return crumbs;
}

export function Header() {
  const { user, logout } = useAuthStore();
  const { setMobileOpen } = useSidebarStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

  const breadcrumbs = useMemo(() => getBreadcrumbs(location.pathname), [location.pathname]);

  const subEnd = user?.subscription_end_date
    ? new Date(user.subscription_end_date)
    : null;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <nav className="hidden sm:flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            // Fix #15: gunakan label sebagai key, bukan index array
            <span key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-muted-foreground">/</span>}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {i === 0 ? <Logo size="sm" /> : crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {user?.subscription_status && (
          <div className="hidden sm:flex items-center gap-2 mr-2">
            {getSubscriptionBadge(user.subscription_status)}
            {subEnd && user.subscription_status === "active" && (
              <span className="text-[10px] text-muted-foreground">
                s.d. {format(subEnd, "EEEE, d MMM yyyy", { locale: id })}
              </span>
            )}
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 sm:w-96" align="end">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="font-semibold text-sm">Notifikasi</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="text-[11px] font-medium text-primary hover:underline"
                    onClick={() => markAllRead.mutate()}
                  >
                    Tandai semua dibaca
                  </button>
                )}
                <Badge variant={unreadCount > 0 ? "default" : "secondary"} className="text-[10px]">
                  {unreadCount} baru
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">Belum ada notifikasi</p>
                <p className="text-xs text-muted-foreground/70">Notifikasi aktivitas akan muncul di sini</p>
              </div>
            ) : (
              <div className="max-h-88 overflow-y-auto divide-y divide-border/40">
                {notifications.slice(0, 8).map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={`w-full p-3 text-left transition-colors hover:bg-muted/60 flex items-start gap-3 ${
                      notification.read_at ? "opacity-75" : "bg-primary/5 font-medium"
                    }`}
                    onClick={() => {
                      if (!notification.read_at) {
                        markRead.mutate(notification.id);
                      }
                      if (notification.data?.url) {
                        navigate(notification.data.url as string);
                      }
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {notification.title}
                        </p>
                        {!notification.read_at && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground/80 font-normal">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {user ? getInitials(user.name) : "??"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {user ? getInitials(user.name) : "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  {user?.business_name && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.business_name}
                    </p>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/dashboard">
                <User className="mr-2 h-4 w-4" />
                <span>Profil Saya</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/maya/connect">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Akun Terhubung</span>
              </Link>
            </DropdownMenuItem>
            {/* Fix #14: Pengaturan diarahkan ke halaman berbeda dari Profil */}
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan & Langganan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

