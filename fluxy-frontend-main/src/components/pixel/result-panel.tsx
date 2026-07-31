import { AlertCircle, Copy, Download, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { GenerateImageResult } from "@/api/pixel";

interface ResultPanelProps {
  isGenerating: boolean;
  result: GenerateImageResult["data"] | null;
  error: string | null;
}

export function ResultPanel({ isGenerating, result, error }: ResultPanelProps) {
  if (isGenerating) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/30">
          <Sparkles className="h-9 w-9 animate-pulse text-white" />
        </div>
        <p className="text-lg font-bold">AI sedang bekerja...</p>
        <p className="mt-2 text-sm text-muted-foreground">Biasanya memakan waktu 10-30 detik</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50">
          <AlertCircle className="h-9 w-9 text-red-400" />
        </div>
        <p className="text-lg font-bold text-red-600">Gagal Membuat Hasil</p>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-blue-500/10">
          <ImageIcon className="h-9 w-9 text-primary/60" />
        </div>
        <p className="text-lg font-bold">Hasil akan muncul di sini</p>
        <p className="mt-2 text-sm text-muted-foreground">Isi input di sebelah kiri lalu klik Generate</p>
      </div>
    );
  }

  if (result.type === "text") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-muted/50 p-6">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">Hasil:</p>
          <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{result.text}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(result.text);
            toast.success("Teks disalin ke clipboard");
          }}
        >
          <Copy className="mr-2 h-3.5 w-3.5" />
          Salin Teks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-muted/50">
        <img src={result.url} alt="Hasil AI" className="max-h-[480px] w-full object-contain" />
      </div>
      <Button asChild size="sm">
        <a href={result.url} download target="_blank" rel="noreferrer">
          <Download className="mr-2 h-3.5 w-3.5" />
          Download
        </a>
      </Button>
    </div>
  );
}
