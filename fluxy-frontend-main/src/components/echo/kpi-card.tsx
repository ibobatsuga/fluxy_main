import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  growth?: number;
  isLoading?: boolean;
}

export function KpiCard({ label, value, icon: Icon, color, bg, growth, isLoading }: KpiCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = (growth ?? 0) >= 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", bg)}>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-bold leading-tight">{value}</p>
            </div>
          </div>
        </div>
        {growth !== undefined && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {isPositive ? (
              <ArrowUp className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500" />
            )}
            <span className={isPositive ? "text-green-500" : "text-red-500"}>
              {isPositive ? "+" : ""}
              {growth}%
            </span>
            <span className="text-muted-foreground">vs periode lalu</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
