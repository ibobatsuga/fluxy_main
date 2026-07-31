import { useState } from "react";
import {
  Search,
  Building2,
  Users,
  UserSearch,
  Download,
  Trash2,
  Loader2,
  Zap,
  ExternalLink,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import lunaAvatar from "@/assets/Agent-HeroIcon/Luna.webp";
import { useLeads, useSearchLeads, useDeleteLead, useExportLeads } from "@/hooks/use-luna";
import type { Lead, LeadSource } from "@/api/luna";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";

export function LunaPage() {
  const [source, setSource] = useState<LeadSource>("google_maps");

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyUrlsText, setCompanyUrlsText] = useState("");
  const [maxItems, setMaxItems] = useState(20);

  const search = useSearchLeads();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const deleteLead = useDeleteLead();
  const exportLeads = useExportLeads();

  const handleSearch = () => {
    if (source === "google_maps" && (!keyword.trim() || !location.trim())) {
      toast.error("Mohon isi kata kunci dan lokasi");
      return;
    }
    if (source === "linkedin_people" && !keyword.trim()) {
      toast.error("Mohon isi kata kunci pencarian");
      return;
    }
    const companyUrls = companyUrlsText
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);
    if (source === "linkedin_company" && companyUrls.length === 0) {
      toast.error("Mohon isi minimal satu URL perusahaan LinkedIn");
      return;
    }

    search.mutate(
      {
        source,
        keyword: keyword.trim() || undefined,
        location: location.trim() || undefined,
        job_title: jobTitle.trim() || undefined,
        company_urls: source === "linkedin_company" ? companyUrls : undefined,
        max_items: maxItems,
      },
      {
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Gagal mencari leads"));
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AgentAvatar img={lunaAvatar} name="Luna" bgClassName="bg-violet-600" size="h-11 w-11" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Luna</h1>
            <p className="text-sm text-muted-foreground">Lead Generation Specialist</p>
          </div>
        </div>
        <Badge variant="secondary" className="hidden gap-1 sm:flex">
          <Zap className="h-3 w-3 text-yellow-500" />
          Powered by Apify
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Cari Leads Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={source} onValueChange={(v) => setSource(v as LeadSource)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="google_maps" className="text-xs">
                    <Building2 className="mr-1 h-3.5 w-3.5" /> Bisnis
                  </TabsTrigger>
                  <TabsTrigger value="linkedin_company" className="text-xs">
                    <Users className="mr-1 h-3.5 w-3.5" /> Karyawan
                  </TabsTrigger>
                  <TabsTrigger value="linkedin_people" className="text-xs">
                    <UserSearch className="mr-1 h-3.5 w-3.5" /> Cari Orang
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="google_maps" className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Kata Kunci Bisnis
                    </Label>
                    <Input
                      placeholder="mis. konsultan pajak, kedai kopi"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Lokasi</Label>
                    <Input
                      placeholder="mis. Jakarta Selatan"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="linkedin_company" className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      URL Perusahaan LinkedIn <span className="font-normal">(satu per baris)</span>
                    </Label>
                    <Textarea
                      placeholder="https://www.linkedin.com/company/nama-perusahaan"
                      rows={3}
                      value={companyUrlsText}
                      onChange={(e) => setCompanyUrlsText(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Jabatan <span className="font-normal">(opsional)</span>
                    </Label>
                    <Input
                      placeholder="mis. Marketing Manager"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="linkedin_people" className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Kata Kunci</Label>
                    <Input
                      placeholder="mis. Head of Marketing e-commerce"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Lokasi <span className="font-normal">(opsional)</span>
                      </Label>
                      <Input
                        placeholder="mis. Indonesia"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Jabatan <span className="font-normal">(opsional)</span>
                      </Label>
                      <Input
                        placeholder="mis. Founder"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Jumlah Maksimal Hasil
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={maxItems}
                  onChange={(e) => setMaxItems(Math.min(50, Math.max(1, Number(e.target.value))))}
                />
              </div>

              <Button
                onClick={handleSearch}
                disabled={search.isPending}
                className="mt-4 w-full"
                size="lg"
              >
                {search.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mencari Leads...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Cari Leads
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Leads Tersimpan</CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{leads.length} leads</span>
                  {leads.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportLeads.mutate()}
                      disabled={exportLeads.isPending}
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Export CSV
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : leads.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Belum ada leads"
                  description="Cari leads baru menggunakan form di sebelah kiri"
                />
              ) : (
                <div className="space-y-2">
                  {leads.map((lead) => (
                    <LeadRow key={lead.id} lead={lead} onDelete={() => deleteLead.mutate(lead.id)} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LeadRow({ lead, onDelete }: { lead: Lead; onDelete: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{lead.name}</p>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {lead.type === "business" ? "Bisnis" : "Kontak"}
          </Badge>
        </div>
        {(lead.title || lead.company) && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {[lead.title, lead.company].filter(Boolean).join(" · ")}
          </p>
        )}
        {lead.address && <p className="mt-0.5 truncate text-xs text-muted-foreground">{lead.address}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {lead.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {lead.phone}
            </span>
          )}
          {lead.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> {lead.email}
            </span>
          )}
          {(lead.website || lead.linkedin_url) && (
            <a
              href={lead.website ?? lead.linkedin_url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Kunjungi
            </a>
          )}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}
