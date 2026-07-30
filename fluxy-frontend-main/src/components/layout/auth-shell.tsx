import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/fluxyVector.png";

interface AuthShellProps {
  children: ReactNode;
  maxWidthClassName?: string;
}

/**
 * Shared wrapper for all auth screens (login, register, pending-approval):
 * dark hero banner (same gradient as the landing page hero) with the logo,
 * flowing into a white rounded card that floats over it.
 */
export function AuthShell({ children, maxWidthClassName = "max-w-md" }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div
        className="relative overflow-hidden px-6 pb-20 pt-14 text-center"
        style={{
          background:
            "radial-gradient(ellipse at 75% 15%, rgba(124,58,237,0.20) 0%, transparent 50%), linear-gradient(180deg, #0a0a14 0%, #101020 55%, #16162a 100%)",
        }}
      >
        <div className="relative z-10 mx-auto flex flex-col items-center gap-2">
          <img src={logoUrl} alt="Fluxy" className="h-12 w-12 rounded-xl object-contain" />
          <span className="text-xl font-bold tracking-tight text-white">Fluxy.id</span>
          <p className="text-sm text-zinc-400">AI-Powered Workforce for Your Business</p>
        </div>
      </div>

      <div className={cn("relative z-10 mx-auto -mt-12 w-full px-4 pb-16", maxWidthClassName)}>
        {children}
      </div>
    </div>
  );
}
