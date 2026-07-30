import { useQuery, useMutation } from "@tanstack/react-query";
import { echoApi, type AnalyticsParams, type ExportFormat } from "@/api/echo";
import { toast } from "sonner";

export function useAnalyticsOverview(params: AnalyticsParams) {
  return useQuery({
    queryKey: ["echo", "overview", params],
    queryFn: () => echoApi.getOverview(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useContentPerformance(params: AnalyticsParams) {
  return useQuery({
    queryKey: ["echo", "contents", params],
    queryFn: () => echoApi.getContentPerformance(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ format, params }: { format: ExportFormat; params?: AnalyticsParams }) =>
      echoApi.exportReport(format, params),
    onSuccess: (data, variables) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
      toast.success(`Laporan ${variables.format.toUpperCase()} sedang disiapkan (${data.file_name})`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengekspor laporan");
    },
  });
}
