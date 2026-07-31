import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth";
import { useUsageSummary } from "@/hooks/use-usage";
import { useLanguageStore } from "@/stores/language";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";
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
  Clapperboard,
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
import { id as idLocale, enUS } from "date-fns/locale";

export function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: usage } = useUsageSummary();
  const { language, setLanguage } = useLanguageStore();

  const [businessName, setBusinessName] = useState(user?.business_name || "");
  const [industryCategory, setIndustryCategory] = useState(user?.industry_category || "");
  const [timezone, setTimezone] = useState(user?.timezone || "Asia/Jakarta");
  const [isSaving, setIsSaving] = useState(false);

  const dateLocale = language === "en" ? enUS : idLocale;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(t("settings.profile.saveSuccessToast"));
    }, 600);
  };

  const subEnd = user?.subscription_end_date ? new Date(user.subscription_end_date) : null;
  const subStart = user?.subscription_start_date ? new Date(user.subscription_start_date) : null;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* 1. Subscription & Billing Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {t("settings.subscription.title")}
            </CardTitle>
            <CardDescription>
              {t("settings.subscription.description")}
            </CardDescription>
          </div>
          {user?.subscription_status && getSubscriptionBadge(user.subscription_status)}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="text-xs text-muted-foreground font-medium">{t("settings.subscription.activePlan")}</p>
              <p className="text-lg font-bold mt-1 text-foreground">{t("settings.subscription.planName")}</p>
            </div>
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="text-xs text-muted-foreground font-medium">{t("settings.subscription.startDate")}</p>
              <p className="text-sm font-semibold mt-1">
                {subStart ? format(subStart, "dd MMMM yyyy", { locale: dateLocale }) : t("settings.subscription.defaultStartDate")}
              </p>
            </div>
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="text-xs text-muted-foreground font-medium">{t("settings.subscription.endDate")}</p>
              <p className="text-sm font-semibold mt-1 text-primary">
                {subEnd ? format(subEnd, "dd MMMM yyyy", { locale: dateLocale }) : t("settings.subscription.defaultEndDate")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg bg-muted/50 p-4 border text-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-medium">{t("settings.subscription.upgradeTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("settings.subscription.upgradeDescription")}
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
              {t("settings.subscription.contactAdmin")} <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Business Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t("settings.profile.title")}
          </CardTitle>
          <CardDescription>
            {t("settings.profile.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("settings.profile.ownerName")}</Label>
                <Input id="name" value={user?.name || ""} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("settings.profile.email")}</Label>
                <Input id="email" value={user?.email || ""} disabled className="bg-muted/50" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="business_name">{t("settings.profile.businessName")}</Label>
                <Input
                  id="business_name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={t("settings.profile.businessNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">{t("settings.profile.industry")}</Label>
                <Input
                  id="industry"
                  value={industryCategory}
                  onChange={(e) => setIndustryCategory(e.target.value)}
                  placeholder={t("settings.profile.industryPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{t("settings.profile.timezone")}</Label>
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
                  <Languages className="h-4 w-4 text-primary" /> {t("settings.profile.language")}
                </Label>
                <Select value={language} onValueChange={(val) => {
                  const nextLanguage = val as SupportedLanguage;
                  setLanguage(nextLanguage);
                  toast.success(
                    t("settings.profile.languageChangedToast", {
                      language: t(`settings.profile.languages.${nextLanguage}`),
                    })
                  );
                }}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder={t("settings.profile.languagePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang === "id" ? "🇮🇩" : "🇬🇧"} {t(`settings.profile.languages.${lang}`)} ({lang.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? t("settings.profile.saving") : t("settings.profile.save")}
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
            {t("settings.usage.title")}
          </CardTitle>
          <CardDescription>
            {t("settings.usage.description")}
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
                    <p className="font-semibold text-sm">{t("settings.usage.pixel")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings.usage.pixelDescription")}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {usage?.pixel.used ?? 12} / {usage?.pixel.limit ?? 50} {t("settings.usage.pixelUnit")}
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
                    <p className="font-semibold text-sm">{t("settings.usage.maya")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings.usage.mayaDescription")}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {usage?.maya.used ?? 18} / {usage?.maya.limit ?? 60} {t("settings.usage.mayaUnit")}
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
                    <p className="font-semibold text-sm">{t("settings.usage.echo")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings.usage.echoDescription")}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">{t("settings.usage.echoUnlimited")}</Badge>
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
                    <p className="font-semibold text-sm">{t("settings.usage.kai")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings.usage.kaiDescription")}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {usage?.kai.used ?? 260} / {usage?.kai.limit ?? 1000} {t("settings.usage.kaiUnit")}
                </Badge>
              </div>
              <Progress
                value={(((usage?.kai.used ?? 260) / (usage?.kai.limit ?? 1000)) * 100)}
                className="h-2"
              />
            </div>

            {/* Motion */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-orange-500/10 text-orange-500">
                    <Clapperboard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t("settings.usage.motion")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings.usage.motionDescription")}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {usage?.motion.used ?? 4} / {usage?.motion.limit ?? 30} {t("settings.usage.motionUnit")}
                </Badge>
              </div>
              <Progress
                value={(((usage?.motion.used ?? 4) / (usage?.motion.limit ?? 30)) * 100)}
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
            {t("settings.connections.title")}
          </CardTitle>
          <CardDescription>
            {t("settings.connections.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                IG/TT
              </div>
              <div>
                <p className="font-medium text-sm">{t("settings.connections.maya")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.connections.mayaStatus")}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/maya/connect">
                {t("settings.connections.mayaManage")} <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                WA
              </div>
              <div>
                <p className="font-medium text-sm">{t("settings.connections.kai")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.connections.kaiStatus")}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/kai/setup">
                {t("settings.connections.kaiSetup")} <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
