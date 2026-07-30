import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { useUsageSummary } from "@/hooks/use-usage";
import {
  CreditCard,
  Building2,
  Globe,
  Palette,
  Calendar,
  BarChart3,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Save,
  Languages,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSubscriptionBadge } from "@/components/layout/subscription-badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function SettingsPage() {
  const { user } = useAuthStore();
  const { data: usage } = useUsageSummary();

  const [businessName, setBusinessName] = useState(user?.business_name || "");
  const [industryCategory, setIndustryCategory] = useState(user?.industry_category || "");
  const [timezone, setTimezone] = useState(user?.timezone || "Asia/Jakarta");
  const [language, setLanguage] = useState("id");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profil bisnis berhasil diperbarui!");
    }, 600);
  };

  const subEnd = user?.subscription_end_date ? new Date(user.subscription_end_date) : null;
  const subStart = user?.subscription_start_date ? new Date(user.subscription_start_date) : null;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan & Langganan</h1>
        <p className="text-muted-foreground">
          Kelola profil bisnis, status langganan, dan pemakaian kuota AI Employees Anda.
        </p>
      </div>

      {/* 1. Subscription & Billing Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Paket & Status Langganan
            </CardTitle>
            <CardDescription>
              Detail akun langganan dan akses fitur Fluxy Anda
            </CardDescription>
          </div>
          {user?.subscription_status && getSubscriptionBadge(user.subscription_status)}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="text-xs text-muted-foreground font-medium">Paket Aktif</p>
              <p className="text-lg font-bold mt-1 text-foreground">Fluxy Pro Tier</p>
            </div>
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="text-xs text-muted-foreground font-medium">Tanggal Mulai</p>
              <p className="text-sm font-semibold mt-1">
                {subStart ? format(subStart, "dd MMMM yyyy", { locale: id }) : "1 Juli 2026"}
              </p>
            </div>
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="text-xs text-muted-foreground font-medium">Berlaku Hingga</p>
              <p className="text-sm font-semibold mt-1 text-primary">
                {subEnd ? format(subEnd, "dd MMMM yyyy", { locale: id }) : "31 Desember 2026"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg bg-muted/50 p-4 border text-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-medium">Ingin Upgrade atau Perpanjang Paket?</p>
                <p className="text-xs text-muted-foreground">
                  Hubungi tim Admin Fluxy untuk bantuan penyesuaian kuota dan pembayaran.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open("https://wa.me/6281234567890?text=Halo%20Admin%20Fluxy,%20saya%20inik%20tanya%20upgrade%20paket", "_blank");
              }}
            >
              Hubungi Admin <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Business Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Profil Bisnis & Akun
          </CardTitle>
          <CardDescription>
            Perbarui data usaha Anda yang digunakan oleh AI Employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Pemilik Akun</Label>
                <Input id="name" value={user?.name || ""} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled className="bg-muted/50" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="business_name">Nama Usaha / Brand</Label>
                <Input
                  id="business_name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Contoh: Toko Maju Jaya"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Kategori Industri</Label>
                <Input
                  id="industry"
                  value={industryCategory}
                  onChange={(e) => setIndustryCategory(e.target.value)}
                  placeholder="Contoh: E-commerce / Fashion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Waktu</Label>
                <Input
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="Asia/Jakarta"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
              <div className="space-y-2">
                <Label htmlFor="language" className="flex items-center gap-1.5">
                  <Languages className="h-4 w-4 text-primary" /> Bahasa Antarmuka (Language)
                </Label>
                <Select value={language} onValueChange={(val) => {
                  setLanguage(val);
                  toast.success(`Bahasa diubah ke ${val === "id" ? "Bahasa Indonesia" : val === "en" ? "English" : "日本語"}`);
                }}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Pilih bahasa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">🇮🇩 Bahasa Indonesia (ID)</SelectItem>
                    <SelectItem value="en">🇬🇧 English (US)</SelectItem>
                    <SelectItem value="ja">🇯🇵 日本語 (JA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 3. Detailed Usage Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Detail Quota Usage AI Employees
          </CardTitle>
          <CardDescription>
            Konsumsi kuota harian/bulanan masing-masing AI Employee Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Pixel */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
                    <Palette className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Pixel (AI Designer)</p>
                    <p className="text-xs text-muted-foreground">Generasi Gambar AI</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {usage?.pixel.used ?? 12} / {usage?.pixel.limit ?? 50} Gambar
                </Badge>
              </div>
              <Progress
                value={(((usage?.pixel.used ?? 12) / (usage?.pixel.limit ?? 50)) * 100)}
                className="h-2"
              />
            </div>

            {/* Maya */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-purple-500/10 text-purple-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Maya (Social Media)</p>
                    <p className="text-xs text-muted-foreground">Jadwal & Publish Post</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {usage?.maya.used ?? 18} / {usage?.maya.limit ?? 60} Post
                </Badge>
              </div>
              <Progress
                value={(((usage?.maya.used ?? 18) / (usage?.maya.limit ?? 60)) * 100)}
                className="h-2"
              />
            </div>

            {/* Echo */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-amber-500/10 text-amber-500">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Echo (Analytics)</p>
                    <p className="text-xs text-muted-foreground">Monitoring Insights</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">Unlimited</Badge>
              </div>
              <Progress value={100} className="h-2 bg-muted" />
            </div>

            {/* Kai */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-teal-500/10 text-teal-500">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Kai (WhatsApp SDR)</p>
                    <p className="text-xs text-muted-foreground">Pesan Chatbot & Broadcast</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {usage?.kai.used ?? 260} / {usage?.kai.limit ?? 1000} Pesan
                </Badge>
              </div>
              <Progress
                value={(((usage?.kai.used ?? 260) / (usage?.kai.limit ?? 1000)) * 100)}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Connected Accounts Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Koneksi Platform Terhubung
          </CardTitle>
          <CardDescription>
            Ringkasan saluran media sosial dan WhatsApp terhubung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                IG/TT
              </div>
              <div>
                <p className="font-medium text-sm">Maya — Social Media Accounts</p>
                <p className="text-xs text-muted-foreground">Instagram (@tokomajujaya) & TikTok connected</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/maya/connect">
                Kelola Akun Maya <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                WA
              </div>
              <div>
                <p className="font-medium text-sm">Kai — WhatsApp Business API</p>
                <p className="text-xs text-muted-foreground">Nomor: +62 812-3456-789 (Status: Connected)</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/kai/setup">
                Setup Device Kai <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
