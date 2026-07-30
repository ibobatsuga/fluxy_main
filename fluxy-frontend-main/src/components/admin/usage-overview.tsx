import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MessageSquare, Palette, Calendar, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { UsageSummary } from "@/types";

const EMPLOYEE_META = {
  pixel: { label: "Pixel", icon: Palette, color: "text-pink-400", bg: "bg-pink-500/10" },
  maya: { label: "Maya", icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10" },
  echo: { label: "Echo", icon: BarChart3, color: "text-green-400", bg: "bg-green-500/10" },
  kai: { label: "Kai", icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10" },
} as const;

interface UsageOverviewProps {
  usage: UsageSummary | undefined;
  isLoading: boolean;
}

export function UsageOverview({ usage, isLoading }: UsageOverviewProps) {
  const chartData = usage
    ? (Object.keys(EMPLOYEE_META) as (keyof typeof EMPLOYEE_META)[]).map((key) => ({
        name: EMPLOYEE_META[key].label,
        used: usage[key].used,
      }))
    : [];

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-1">
        {(Object.keys(EMPLOYEE_META) as (keyof typeof EMPLOYEE_META)[]).map((key) => {
          const meta = EMPLOYEE_META[key];
          if (isLoading || !usage) {
            return (
              <Card key={key}>
                <CardContent className="p-4">
                  <Skeleton className="h-9 w-full rounded-lg" />
                </CardContent>
              </Card>
            );
          }
          const { used, limit } = usage[key];
          const unlimited = limit < 0;
          return (
            <Card key={key}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.bg}`}>
                    <meta.icon className={`h-4 w-4 ${meta.color}`} />
                  </div>
                  <span className="text-sm font-medium">{meta.label}</span>
                </div>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {used.toLocaleString("id-ID")}
                  {!unlimited && `/${limit.toLocaleString("id-ID")}`}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Penggunaan Platform</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className="h-56 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={224}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  formatter={(value) => [Number(value ?? 0).toLocaleString("id-ID"), "Digunakan"]}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="used" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
