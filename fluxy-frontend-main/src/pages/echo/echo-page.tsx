import { useState } from "react";
import { BarChart3, Eye, Heart, TrendingUp, Users } from "lucide-react";
import { format, subDays } from "date-fns";
import echoAvatar from "@/assets/Agent-HeroIcon/Echo.webp";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { AnalyticsFilters } from "@/components/echo/analytics-filters";
import { KpiCard } from "@/components/echo/kpi-card";
import { TrendChart } from "@/components/echo/trend-chart";
import { ContentPerformanceTable } from "@/components/echo/content-performance-table";
import { useAnalyticsOverview, useContentPerformance, useExportReport } from "@/hooks/use-echo";
import type { EchoPlatform } from "@/api/echo";

function fmt(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function EchoPage() {
  const [platform, setPlatform] = useState<EchoPlatform>("all");
  const [from, setFrom] = useState(fmt(subDays(new Date(), 29)));
  const [to, setTo] = useState(fmt(new Date()));

  const params = { platform, from, to };
  const { data: analytics, isLoading: overviewLoading } = useAnalyticsOverview(params);
  const { data: contentItems = [], isLoading: contentLoading } = useContentPerformance(params);
  const exportReport = useExportReport();

  const overview = analytics?.overview;
  const daily = analytics?.daily ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AgentAvatar img={echoAvatar} name="Echo" bgClassName="bg-amber-500" size="h-11 w-11" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Echo</h1>
          <p className="text-sm text-muted-foreground">Analitik performa media sosial Anda</p>
        </div>
      </div>

      <AnalyticsFilters
        platform={platform}
        onPlatformChange={setPlatform}
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onExport={(fmtType) => exportReport.mutate({ format: fmtType, params })}
        isExporting={exportReport.isPending}
        exportEnabled={
          import.meta.env.VITE_ECHO_EXPORT_ENABLED === "true" ||
          import.meta.env.VITE_USE_MOCK === "true"
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Reach"
          value={overview ? overview.total_reach.toLocaleString("id-ID") : "-"}
          icon={Eye}
          color="text-blue-400"
          bg="bg-blue-500/10"
          isLoading={overviewLoading}
        />
        <KpiCard
          label="Total Engagement"
          value={overview ? overview.total_engagement.toLocaleString("id-ID") : "-"}
          icon={Heart}
          color="text-pink-400"
          bg="bg-pink-500/10"
          isLoading={overviewLoading}
        />
        <KpiCard
          label="Followers"
          value={overview ? overview.followers_count.toLocaleString("id-ID") : "-"}
          icon={Users}
          color="text-purple-400"
          bg="bg-purple-500/10"
          growth={overview?.followers_growth}
          isLoading={overviewLoading}
        />
        <KpiCard
          label="Engagement Rate"
          value={overview ? `${overview.engagement_rate}%` : "-"}
          icon={TrendingUp}
          color="text-green-400"
          bg="bg-green-500/10"
          isLoading={overviewLoading}
        />
      </div>

      {/* Trend Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChart
          title="Reach Harian"
          dataKey="reach"
          data={daily}
          color="#3b82f6"
          isLoading={overviewLoading}
        />
        <TrendChart
          title="Engagement Harian"
          dataKey="engagement"
          data={daily}
          color="#db2777"
          isLoading={overviewLoading}
        />
      </div>

      {/* Content Performance */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Performa per Konten</h2>
        </div>
        <ContentPerformanceTable items={contentItems} isLoading={contentLoading} />
      </section>
    </div>
  );
}
