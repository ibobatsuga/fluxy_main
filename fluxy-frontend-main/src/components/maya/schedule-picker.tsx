import { Clock, Plus, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNextQueueSlot } from "@/hooks/use-maya";

function toLocalDateValue(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

function toLocalTimeValue(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(11, 16);
}

function combineDateTime(datePart: string, timePart: string): string {
  if (!datePart || !timePart) return "";
  const combined = new Date(`${datePart}T${timePart}`);
  return Number.isNaN(combined.getTime()) ? "" : combined.toISOString();
}

interface SchedulePickerProps {
  scheduleType: "now" | "schedule";
  onScheduleTypeChange: (type: "now" | "schedule") => void;
  scheduledAts: string[];
  onScheduledAtsChange: (isoList: string[]) => void;
  disabled?: boolean;
}

export function SchedulePicker({
  scheduleType,
  onScheduleTypeChange,
  scheduledAts,
  onScheduledAtsChange,
  disabled,
}: SchedulePickerProps) {
  const { data: nextSlot } = useNextQueueSlot();
  const minDate = toLocalDateValue(new Date().toISOString());

  const updateDate = (index: number, dateValue: string) => {
    const time = toLocalTimeValue(scheduledAts[index]) || "09:00";
    const next = [...scheduledAts];
    next[index] = combineDateTime(dateValue, time);
    onScheduledAtsChange(next);
  };

  const updateTime = (index: number, timeValue: string) => {
    const datePart = toLocalDateValue(scheduledAts[index]) || minDate;
    const next = [...scheduledAts];
    next[index] = combineDateTime(datePart, timeValue);
    onScheduledAtsChange(next);
  };

  const addSlot = () => {
    onScheduledAtsChange([...scheduledAts, ""]);
  };

  const removeSlot = (index: number) => {
    onScheduledAtsChange(scheduledAts.filter((_, i) => i !== index));
  };

  const validCount = scheduledAts.filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={scheduleType === "now" ? "default" : "outline"}
          size="sm"
          onClick={() => onScheduleTypeChange("now")}
          disabled={disabled}
        >
          <Zap className="mr-1.5 h-3.5 w-3.5" />
          Posting Sekarang
        </Button>
        <Button
          type="button"
          variant={scheduleType === "schedule" ? "default" : "outline"}
          size="sm"
          onClick={() => onScheduleTypeChange("schedule")}
          disabled={disabled}
        >
          <Clock className="mr-1.5 h-3.5 w-3.5" />
          Jadwalkan
        </Button>
      </div>

      {scheduleType === "schedule" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Tanggal & Jam</Label>
            {nextSlot && (
              <span className="text-[11px] text-muted-foreground">
                Slot berikutnya:{" "}
                <span className="font-medium text-foreground">
                  {new Date(nextSlot.slot).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23",
                  })}
                </span>
              </span>
            )}
          </div>

          <div className="space-y-2">
            {scheduledAts.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="date"
                  min={minDate}
                  value={toLocalDateValue(value)}
                  onChange={(e) => updateDate(index, e.target.value)}
                  disabled={disabled}
                  className="flex-3"
                />
                <Input
                  type="time"
                  lang="id-ID"
                  value={toLocalTimeValue(value)}
                  onChange={(e) => updateTime(index, e.target.value)}
                  disabled={disabled}
                  className="flex-2"
                />
                {scheduledAts.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSlot(index)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={addSlot}
            disabled={disabled}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Tambah Jadwal Lain
          </Button>

          {validCount > 1 && (
            <p className="text-[11px] text-muted-foreground">
              Konten akan dipublikasikan <span className="font-medium text-foreground">{validCount} kali</span> sesuai jadwal di atas.
            </p>
          )}
        </div>
      )}

      {scheduleType === "now" && (
        <Badge variant="secondary" className="gap-1">
          <Zap className="h-3 w-3 text-yellow-500" />
          Konten akan langsung dipublikasikan
        </Badge>
      )}
    </div>
  );
}
