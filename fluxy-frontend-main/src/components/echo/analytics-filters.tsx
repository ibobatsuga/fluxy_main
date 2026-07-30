import { Calendar, FileSpreadsheet, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InstagramIcon, TiktokIcon } from "@/components/icons/social-icons";
import type { EchoPlatform } from "@/api/echo";

interface AnalyticsFiltersProps {
  platform: EchoPlatform;
  onPlatformChange: (platform: EchoPlatform) => void;
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onExport: (format: "pdf" | "xlsx") => void;
  isExporting?: boolean;
}

export function AnalyticsFilters({
  platform,
  onPlatformChange,
  from,
  to,
  onFromChange,
  onToChange,
  onExport,
  isExporting,
}: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Platform</Label>
          <Select value={platform} onValueChange={(v) => onPlatformChange(v as EchoPlatform)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Platform</SelectItem>
              <SelectItem value="instagram">
                <span className="inline-flex items-center gap-1.5">
                  <InstagramIcon className="h-3.5 w-3.5" />
                  Instagram
                </span>
              </SelectItem>
              <SelectItem value="tiktok">
                <span className="inline-flex items-center gap-1.5">
                  <TiktokIcon className="h-3.5 w-3.5" />
                  TikTok
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Dari Tanggal</Label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={from}
              max={to}
              onChange={(e) => onFromChange(e.target.value)}
              className="w-full pl-8 sm:w-[160px]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Sampai Tanggal</Label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={to}
              min={from}
              onChange={(e) => onToChange(e.target.value)}
              className="w-full pl-8 sm:w-[160px]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport("pdf")}
          disabled={isExporting}
        >
          <FileText className="mr-1.5 h-3.5 w-3.5" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport("xlsx")}
          disabled={isExporting}
        >
          <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
          Excel
        </Button>
      </div>
    </div>
  );
}
