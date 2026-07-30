import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { MayaNav } from "@/components/maya/maya-nav";
import { ContentCalendarSection } from "@/components/maya/content-calendar-section";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "@/components/icons/social-icons";
import mayaAvatar from "@/assets/Agent-HeroIcon/Maya.webp";
import {
  useMayaAccounts,
  useConnectAccount,
  useConfirmConnect,
  useDisconnectAccount,
} from "@/hooks/use-maya";
import type { MayaPlatform } from "@/api/maya";

const PLATFORMS: {
  id: MayaPlatform;
  label: string;
  description: string;
  badgeClass: string;
  icon: typeof InstagramIcon;
}[] = [
  {
    id: "facebook",
    label: "Facebook Page",
    description: "Publikasikan feed post & gambar carousel ke Facebook Page",
    badgeClass: "bg-blue-600",
    icon: FacebookIcon,
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Publikasikan feed post & story ke Instagram Business",
    badgeClass: "bg-gradient-to-br from-purple-500 to-pink-500",
    icon: InstagramIcon,
  },
  {
    id: "tiktok",
    label: "TikTok",
    description: "Publikasikan video ke akun TikTok bisnis Anda",
    badgeClass: "bg-black",
    icon: TiktokIcon,
  },
];

const providerColors: Record<string, string> = {
  instagram: "bg-gradient-to-br from-purple-500 to-pink-500",
  facebook: "bg-blue-600",
  tiktok: "bg-black",
  twitter: "bg-sky-500",
  linkedin: "bg-blue-700",
  bluesky: "bg-sky-400",
};

export function MayaConnectPage() {
  const selfServiceConnectEnabled =
    import.meta.env.VITE_MAYA_SELF_SERVICE_CONNECT === "true" ||
    import.meta.env.VITE_USE_MOCK === "true";
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: accounts = [], isLoading } = useMayaAccounts();
  const connectAccount = useConnectAccount();
  const confirmConnect = useConfirmConnect();
  const disconnectAccount = useDisconnectAccount();

  const confirmedRef = useRef(false);

  useEffect(() => {
    const mockProvider = searchParams.get("mock_connect");
    if (mockProvider && !confirmedRef.current) {
      confirmedRef.current = true;
      confirmConnect.mutate(mockProvider as MayaPlatform, {
        onSettled: () => {
          setSearchParams({}, { replace: true });
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AgentAvatar img={mayaAvatar} name="Maya" bgClassName="bg-blue-600" size="h-11 w-11" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hubungkan Akun</h1>
          <p className="text-sm text-muted-foreground">
            Hubungkan akun media sosial untuk mulai publikasi konten dengan Maya
          </p>
        </div>
      </div>

      <MayaNav />

      {/* Ringkasan Akun Terhubung */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : accounts.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Ringkasan Akun Terhubung</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${providerColors[account.provider] || "bg-gray-500"}`}
                  >
                    {account.provider === "facebook" ? (
                      <FacebookIcon className="h-5 w-5" />
                    ) : account.provider === "instagram" ? (
                      <InstagramIcon className="h-5 w-5" />
                    ) : account.provider === "tiktok" ? (
                      <TiktokIcon className="h-5 w-5" />
                    ) : (
                      <span className="text-xs font-bold uppercase">{account.provider.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {account.platform_username || account.provider}
                    </p>
                    <p className="truncate text-xs capitalize text-muted-foreground">{account.provider}</p>
                  </div>
                  {account.is_active ? (
                    <Badge variant="success" className="shrink-0 text-[10px]">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="shrink-0 text-[10px]">
                      <XCircle className="mr-1 h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const account = accounts.find((a) => a.provider === platform.id && a.is_active);
          const isConnecting =
            (connectAccount.isPending && connectAccount.variables === platform.id) ||
            confirmConnect.isPending;

          const PlatformIcon = platform.icon;

          return (
            <Card key={platform.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${platform.badgeClass}`}
                  >
                    <PlatformIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{platform.label}</h3>
                      {account && (
                        <Badge variant="success" className="text-[10px]">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Terhubung
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{platform.description}</p>

                    {isLoading ? (
                      <Skeleton className="mt-3 h-8 w-full rounded-md" />
                    ) : account ? (
                      <div className="mt-3 space-y-3">
                        <p className="truncate text-sm text-muted-foreground">
                          @{account.platform_username || "unknown"}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => disconnectAccount.mutate(account.id)}
                          disabled={disconnectAccount.isPending}
                        >
                          Putuskan Koneksi
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="mt-3"
                        onClick={() => connectAccount.mutate(platform.id)}
                        disabled={isConnecting || !selfServiceConnectEnabled}
                      >
                        {isConnecting ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <PlatformIcon className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {selfServiceConnectEnabled
                          ? `Hubungkan ${platform.label}`
                          : "Hubungi Admin Fluxy"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ContentCalendarSection />
    </div>
  );
}
