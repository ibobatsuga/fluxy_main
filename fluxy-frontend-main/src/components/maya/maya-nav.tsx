import { NavLink } from "react-router-dom";
import { CalendarRange, Link2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/maya/connect", label: "Hubungkan Akun", icon: Link2 },
  { to: "/maya/create", label: "Jadwalkan Konten", icon: Send },
  { to: "/maya/stories", label: "Stories", icon: CalendarRange },
];

export function MayaNav() {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-muted p-1">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
              isActive
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <tab.icon className="h-3.5 w-3.5" />
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
