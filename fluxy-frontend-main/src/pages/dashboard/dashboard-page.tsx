import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { useRecentPosts, useUsageSummary } from "@/hooks/use-dashboard";
import {
  Palette,
  Calendar,
  BarChart3,
  MessageSquare,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getSubscriptionBadge } from "@/components/layout/subscription-badge";

const aiEmployees = [
  {
    name: "Pixel",
    description: "Desainer Kreatif AI untuk foto produk",
    icon: Palette,
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-200",
    to: "/pixel",
  },
  {
    name: "Maya",
    description: "Manajer & Publisher Media Sosial",
    icon: Calendar,
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-200",
    to: "/maya",
  },
  {
    name: "Echo",
    description: "Analitik Media Sosial",
    icon: BarChart3,
    color: "text-amber-600",
    bg: "bg-amber-100",
    border: "border-amber-200",
    to: "/echo",
  },
  {
    name: "Kai",
    description: "Chatbot Sales & Layanan WhatsApp",
    icon: MessageSquare,
    color: "text-teal-600",
    bg: "bg-teal-100",
    border: "border-teal-200",
    to: "/kai",
  },
];

export function DashboardPage() {
  const { user, fetchUser } = useAuthStore();
  const { data: recentPosts, isLoading: postsLoading } = useRecentPosts(5);
  const { data: usage } = useUsageSummary();

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  const isSubscriptionActive = user?.subscription_status === "active";
  const subscriptionExpired =
    user?.subscription_end_date && new Date(user.subscription_end_date) < new Date();
  const subscriptionEnd = user?.subscription_end_date
    ? new Date(user.subscription_end_date)
    : null;
  const daysUntilExpiry = subscriptionEnd
    ? Math.ceil((subscriptionEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Selamat datang, {user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Kelola bisnis Anda dengan AI Employees
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user?.subscription_status && (
            <div className="flex items-center gap-2">
              {getSubscriptionBadge(user.subscription_status)}
              {isSubscriptionActive && daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                <Badge variant="warning" className="text-[10px]">
                  {daysUntilExpiry} hari lagi
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Welcome Banner for First-Time Users */}
      {(!recentPosts?.data || recentPosts.data.length === 0) && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                ✨ Selamat Datang di Fluxy AI Workspace
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Mulai Otomatisasi Operasional Bisnis Anda
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Fluxy menghubungkan 4 AI Employees (Pixel, Maya, Echo, Kai) untuk membantu pembuatan gambar produk, penjadwalan media sosial, analitik, dan layanan pelanggan WhatsApp secara otomatis.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button size="sm" asChild>
                <Link to="/pixel">
                  <Palette className="mr-1.5 h-4 w-4" /> Coba Pixel AI
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to="/maya/connect">
                  <Calendar className="mr-1.5 h-4 w-4" /> Hubungkan Medsos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Alert */}
      {!isSubscriptionActive && (
        <Card className={subscriptionExpired ? "border-red-500/20 bg-red-500/5" : "border-yellow-500/20 bg-yellow-500/5"}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${subscriptionExpired ? "bg-red-500/10" : "bg-yellow-500/10"}`}>
              {subscriptionExpired ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {subscriptionExpired
                  ? "Subscription Anda telah berakhir"
                  : "Belum ada subscription aktif"}
              </p>
              <p className="text-xs text-muted-foreground">
                {subscriptionExpired
                  ? "Hubungi admin Fluxy untuk memperpanjang langganan Anda."
                  : "Hubungi admin Fluxy untuk mengaktifkan langganan Anda dan mulai menggunakan AI Employees."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Employees */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI Employees</h2>
          <span className="text-xs text-muted-foreground">4 tersedia</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {aiEmployees.map((employee) => (
            <Link key={employee.name} to={employee.to}>
              <Card className={`transition-all hover:shadow-md hover:shadow-primary/5 hover:${employee.border} hover:-translate-y-0.5`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${employee.bg}`}>
                      <employee.icon className={`h-5 w-5 ${employee.color}`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-base">{employee.name}</CardTitle>
                  <CardDescription className="mt-1 text-xs leading-relaxed">
                    {employee.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Aktivitas Terakhir</h2>
        </div>

        {postsLoading ? (
          <Card>
            <CardContent className="p-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : recentPosts?.data && recentPosts.data.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentPosts.data.map((post) => (
                  <div key={post.id} className="flex items-start gap-3 p-4">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      post.status === "completed"
                        ? "bg-green-500/10"
                        : post.status === "failed"
                        ? "bg-red-500/10"
                        : post.status === "scheduled"
                        ? "bg-blue-500/10"
                        : "bg-muted"
                    }`}>
                      {post.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : post.status === "failed" ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : post.status === "scheduled" ? (
                        <Clock className="h-4 w-4 text-blue-500" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">
                        {post.content?.caption || "No caption"}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant={
                          post.status === "completed" ? "success"
                          : post.status === "failed" ? "destructive"
                          : post.status === "scheduled" ? "default"
                          : "secondary"
                        } className="text-[10px]">
                          {post.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={Calendar}
                title="Belum ada aktivitas"
                description="Buat konten pertama Anda menggunakan Maya"
                action={
                  <Button asChild size="sm">
                    <Link to="/maya/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Buat Konten
                    </Link>
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </section>

      {/* Quick Stats */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Ringkasan Penggunaan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UsageCard
            title="Pixel"
            used={usage?.pixel.used ?? 0}
            limit={usage?.pixel.limit ?? 50}
            unit="gambar"
            icon={Palette}
            color="text-blue-600"
          />
          <UsageCard
            title="Maya"
            used={usage?.maya.used ?? 0}
            limit={usage?.maya.limit ?? 60}
            unit="post"
            icon={Calendar}
            color="text-blue-600"
          />
          <UsageCard
            title="Echo"
            used={usage?.echo.used ?? 0}
            limit={usage?.echo.limit ?? -1}
            unit="view"
            icon={BarChart3}
            color="text-amber-600"
            unlimited
          />
          <UsageCard
            title="Kai"
            used={usage?.kai.used ?? 0}
            limit={usage?.kai.limit ?? 1000}
            unit="pesan"
            icon={MessageSquare}
            color="text-teal-600"
          />
        </div>
      </section>
    </div>
  );
}

function UsageCard({
  title,
  used,
  limit,
  unit,
  icon: Icon,
  color,
  unlimited,
}: {
  title: string;
  used: number;
  limit: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  unlimited?: boolean;
}) {
  const percentage = unlimited ? 0 : limit > 0 ? (used / limit) * 100 : 0;
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  return (
    <Card className="transition-colors hover:bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{unit} bulan ini</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">
              {unlimited ? "∞" : used}
              {!unlimited && limit > 0 && (
                <span className="text-sm font-normal text-muted-foreground">/{limit}</span>
              )}
            </p>
          </div>
        </div>
        {!unlimited && limit > 0 && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all ${
                isCritical
                  ? "bg-red-500"
                  : isWarning
                  ? "bg-yellow-500"
                  : "bg-primary"
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
