import { useEffect, useState } from "react";
import { Loader2, Sliders } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useDefaultLimits, useUpdateDefaultLimits } from "@/hooks/use-admin";

export function LimitsForm() {
  const { data: limits, isLoading } = useDefaultLimits();
  const updateLimits = useUpdateDefaultLimits();

  const [pixel, setPixel] = useState(50);
  const [maya, setMaya] = useState(60);
  const [kai, setKai] = useState(1000);
  const [motion, setMotion] = useState(30);

  useEffect(() => {
    if (limits) {
      setPixel(limits.pixel);
      setMaya(limits.maya);
      setKai(limits.kai);
      setMotion(limits.motion);
    }
  }, [limits]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Batasan Default</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Sliders className="h-4 w-4 text-muted-foreground" />
          Batasan Penggunaan Default per Bulan
        </CardTitle>
        <CardDescription>
          Berlaku untuk tenant baru — limit per tenant tetap dapat disesuaikan secara individual di
          halaman detail tenant. Echo bersifat unlimited (analitik) sehingga tidak dikonfigurasi di
          sini.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="limit-pixel" className="text-xs">
              Pixel (gambar/bulan)
            </Label>
            <Input
              id="limit-pixel"
              type="number"
              min={0}
              value={pixel}
              onChange={(e) => setPixel(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="limit-maya" className="text-xs">
              Maya (post/bulan)
            </Label>
            <Input
              id="limit-maya"
              type="number"
              min={0}
              value={maya}
              onChange={(e) => setMaya(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="limit-kai" className="text-xs">
              Kai (broadcast/bulan)
            </Label>
            <Input
              id="limit-kai"
              type="number"
              min={0}
              value={kai}
              onChange={(e) => setKai(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="limit-motion" className="text-xs">
              Motion (prompt/bulan)
            </Label>
            <Input
              id="limit-motion"
              type="number"
              min={0}
              value={motion}
              onChange={(e) => setMotion(Number(e.target.value))}
            />
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => updateLimits.mutate({ pixel, maya, kai, motion })}
          disabled={updateLimits.isPending}
        >
          {updateLimits.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Simpan Batasan
        </Button>
      </CardContent>
    </Card>
  );
}
