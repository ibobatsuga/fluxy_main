import { Link } from "react-router-dom";
import { Link2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { InstagramIcon, TiktokIcon } from "@/components/icons/social-icons";
import type { SocialAccount } from "@/types";

const PROVIDER_STYLE: Record<string, { label: string; badgeClass: string; icon: typeof InstagramIcon }> = {
  instagram: { label: "Instagram", badgeClass: "bg-gradient-to-br from-purple-500 to-pink-500", icon: InstagramIcon },
  tiktok: { label: "TikTok", badgeClass: "bg-black", icon: TiktokIcon },
};

interface PlatformSelectorProps {
  accounts: SocialAccount[];
  isLoading: boolean;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function PlatformSelector({ accounts, isLoading, selectedIds, onChange, disabled }: PlatformSelectorProps) {
  const activeAccounts = accounts.filter((a) => a.is_active);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    );
  }

  if (activeAccounts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 text-center">
        <p className="text-xs text-muted-foreground">Belum ada akun terhubung</p>
        <Button asChild size="sm" variant="outline">
          <Link to="/maya/connect">
            <Link2 className="mr-1.5 h-3.5 w-3.5" />
            Hubungkan Akun
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activeAccounts.map((account) => {
        const style = PROVIDER_STYLE[account.provider];
        const Icon = style?.icon;
        const label = style?.label ?? account.provider;
        const badgeClass = style?.badgeClass ?? "bg-gray-500";
        return (
          <label
            key={account.id}
            htmlFor={`platform-${account.id}`}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-2.5 transition-colors hover:bg-muted/50"
          >
            <Checkbox
              id={`platform-${account.id}`}
              checked={selectedIds.includes(account.id)}
              onCheckedChange={() => toggle(account.id)}
              disabled={disabled}
            />
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white ${badgeClass}`}>
              {Icon ? (
                <Icon className="h-4 w-4" />
              ) : (
                <span className="text-[9px] font-bold">{account.provider.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{label}</p>
              <p className="truncate text-xs text-muted-foreground">@{account.platform_username}</p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
