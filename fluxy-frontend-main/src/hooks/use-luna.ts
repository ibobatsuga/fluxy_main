import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lunaApi, type LeadSource, type SearchLeadsRequest } from "@/api/luna";
import { toast } from "sonner";

export function useLeads(source?: LeadSource) {
  return useQuery({
    queryKey: ["luna", "leads", source ?? "all"],
    queryFn: () => lunaApi.listLeads(source),
    staleTime: 30 * 1000,
  });
}

export function useSearchLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SearchLeadsRequest) => lunaApi.search(data),
    onSuccess: (leads) => {
      queryClient.invalidateQueries({ queryKey: ["luna", "leads"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
      toast.success(`${leads.length} leads ditemukan`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mencari leads");
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lunaApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["luna", "leads"] });
      toast.success("Lead dihapus");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus lead");
    },
  });
}

export function useExportLeads() {
  return useMutation({
    mutationFn: async () => {
      const blob = await lunaApi.exportLeads();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `luna-leads-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengekspor leads");
    },
  });
}
