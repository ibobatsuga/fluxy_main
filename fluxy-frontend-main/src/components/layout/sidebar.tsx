import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  ChevronLeft,
  ChevronRight,
  Settings,
  MessageSquare,
  SlidersHorizontal,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useSidebarStore } from "@/stores/sidebar";
import { useAuthStore } from "@/stores/auth";
import { Logo } from "@/components/logo";
import { AgentAvatar } from "@/components/ui/agent-avatar";

import pixelAvatar from "@/assets/Agent-HeroIcon/pixel.webp";
import mayaAvatar from "@/assets/Agent-HeroIcon/Maya.webp";
import echoAvatar from "@/assets/Agent-HeroIcon/Echo.webp";
import kaiAvatar from "@/assets/Agent-HeroIcon/Kai.webp";

interface NavItem {
  to: string;
  label: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  avatar?: string;
  avatarBg?: string;
  matchPattern?: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, matchPattern: "/dashboard" },
  { to: "/pixel", label: "Pixel", subtitle: "AI Designer", icon: MessageSquare, avatar: pixelAvatar, avatarBg: "bg-blue-600", matchPattern: "/pixel" },
  { to: "/maya", label: "Maya", subtitle: "Social Media", icon: MessageSquare, avatar: mayaAvatar, avatarBg: "bg-blue-600", matchPattern: "/maya" },
  { to: "/echo", label: "Echo", subtitle: "Analytics", icon: MessageSquare, avatar: echoAvatar, avatarBg: "bg-amber-500", matchPattern: "/echo" },
  { to: "/kai", label: "Kai", subtitle: "Chatbot", icon: MessageSquare, avatar: kaiAvatar, avatarBg: "bg-teal-500", matchPattern: "/kai" },
];

const adminItems: NavItem[] = [
  { to: "/admin/tenants", label: "Tenants", icon: Shield, matchPattern: "/admin/tenants" },
  { to: "/admin/kai", label: "Devices", icon: Smartphone, matchPattern: "/admin/kai" },
  { to: "/admin/config", label: "Configuration", icon: SlidersHorizontal, matchPattern: "/admin/config" },
];

const settingItem: NavItem = {
  to: "/settings",
  label: "Setting",
  icon: Settings,
  matchPattern: "/settings",
};

interface SidebarNavProps {
  isCollapsed: boolean;
}

function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  const isActive = (pattern: string) => location.pathname.startsWith(pattern);

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.matchPattern || item.to);
    const navLink = (
      <NavLink
        key={item.to}
        to={item.to}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        {active && (
          <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
        )}
        {item.avatar ? (
          <AgentAvatar
            img={item.avatar}
            name={item.label}
            bgClassName={item.avatarBg}
            size="h-7 w-7"
            className={cn("shrink-0 transition-all", active && "ring-2 ring-primary")}
          />
        ) : (
          <item.icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              active ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
            )}
          />
        )}
        {!isCollapsed && (
          <div className="flex flex-1 items-center justify-between">
            <div className="flex flex-col">
              <span>{item.label}</span>
              {item.subtitle && (
                <span className="text-[10px] text-muted-foreground">{item.subtitle}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {item.badge && item.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
              {active && (
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </div>
          </div>
        )}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.to} delayDuration={0}>
          <TooltipTrigger asChild>{navLink}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
            {item.subtitle && (
              <p className="text-[10px] opacity-70">{item.subtitle}</p>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return navLink;
  };

  return (
    <>
      <nav className="flex-1 space-y-1 p-2">
        {user?.business_name && navItems.map(renderNavItem)}
      </nav>

      <div className="px-4">
        <Separator className="bg-sidebar-border" />
      </div>

      <nav className="space-y-1 p-2">
        {user?.is_admin && (
          <>
            {!isCollapsed && (
              <p className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Admin
              </p>
            )}
            {adminItems.map(renderNavItem)}
          </>
        )}
        {renderNavItem(settingItem)}
      </nav>
    </>
  );
}

function SidebarFooter() {
  const { isCollapsed, toggle } = useSidebarStore();
  const { user } = useAuthStore();

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <>
      <div className="px-4">
        <Separator className="bg-sidebar-border" />
      </div>

      {!isCollapsed && user && (
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {getInitials(user.name)}
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user.name}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
      )}

      <div className="p-2">
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full text-muted-foreground"
                onClick={toggle}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={toggle}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Collapse</span>
          </Button>
        )}
      </div>
    </>
  );
}

export function Sidebar() {
  const { isCollapsed } = useSidebarStore();

  return (
    <aside
      className={cn(
        "hidden md:flex fixed inset-y-0 left-0 z-50 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex h-14 items-center gap-2 px-4", isCollapsed && "justify-center")}>
        <Logo size={isCollapsed ? "sm" : "md"} showText={!isCollapsed} />
      </div>

      <div className="px-4">
        <Separator className="bg-sidebar-border" />
      </div>

      <SidebarNav isCollapsed={isCollapsed} />

      <SidebarFooter />
    </aside>
  );
}

export function MobileSidebar() {
  const { isMobileOpen, closeMobile } = useSidebarStore();
  const { user } = useAuthStore();

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <Sheet open={isMobileOpen} onOpenChange={closeMobile}>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-14 items-center gap-2 px-4">
          <Logo size="md" showText />
        </div>
        <div className="px-4">
          <Separator className="bg-sidebar-border" />
        </div>
        <SidebarNav isCollapsed={false} />
        {user && (
          <>
            <div className="px-4">
              <Separator className="bg-sidebar-border" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {getInitials(user.name)}
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {user.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
