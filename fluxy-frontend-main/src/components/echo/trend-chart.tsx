import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsDaily } from "@/types";

interface TrendChartProps {
  title: string;
  dataKey: keyof Pick<AnalyticsDaily, "reach" | "engagement" | "views">;
  data: AnalyticsDaily[];
  color: string;
  isLoading?: boolean;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}rb`;
  return String(value);
}

export function TrendChart({ title, dataKey, data, color, isLoading }: TrendChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-56 w-full rounded-lg" />
        ) : data.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            Belum ada data pada rentang ini
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={224}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => format(new Date(v), "d MMM", { locale: id })}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCompact}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value) => [Number(value ?? 0).toLocaleString("id-ID"), title]}
                labelFormatter={(v) => (v ? format(new Date(String(v)), "d MMMM yyyy", { locale: id }) : "")}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                fill={`url(#fill-${dataKey})`}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
