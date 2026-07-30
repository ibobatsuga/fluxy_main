import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  kaiApi,
  type RequestDeviceInput,
  type CreateGroupInput,
  type CreateBroadcastInput,
  type UpdateChatbotSettingsInput,
} from "@/api/kai";

export function useKaiDevice() {
  return useQuery({
    queryKey: ["kai", "device"],
    queryFn: kaiApi.getDeviceStatus,
    staleTime: 60 * 1000,
  });
}

export function useRequestDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestDeviceInput) => kaiApi.requestDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "device"] });
      toast.success("Permintaan koneksi WhatsApp terkirim, menunggu aktivasi Admin Fluxy");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengirim permintaan koneksi");
    },
  });
}

export function useGenerateQr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { wa_number: string; business_name: string }) => kaiApi.generateQr(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "device"] });
      toast.success("QR Code WhatsApp berhasil dibuat. Silakan pindai dari HP Anda");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat QR Code WhatsApp");
    },
  });
}

export function useSimulateScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => kaiApi.simulateScan(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "device"] });
      toast.success("WhatsApp berhasil terhubung!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghubungkan WhatsApp");
    },
  });
}

export function useDisconnectDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => kaiApi.disconnectDevice(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "device"] });
      toast.success("Perangkat WhatsApp berhasil diputuskan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memutuskan koneksi WhatsApp");
    },
  });
}

export function useKaiGroups() {
  return useQuery({
    queryKey: ["kai", "groups"],
    queryFn: kaiApi.listGroups,
    staleTime: 60 * 1000,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupInput) => kaiApi.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "groups"] });
      toast.success("Grup berhasil ditambahkan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan grup");
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => kaiApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "groups"] });
      toast.success("Grup berhasil dihapus");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus grup");
    },
  });
}

export function useKaiBroadcasts() {
  return useQuery({
    queryKey: ["kai", "broadcasts"],
    queryFn: kaiApi.listBroadcasts,
    staleTime: 30 * 1000,
  });
}

export function useCreateBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBroadcastInput) => kaiApi.createBroadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "broadcasts"] });
      toast.success("Broadcast sedang dikirim");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengirim broadcast");
    },
  });
}

export function useCancelBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => kaiApi.cancelBroadcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "broadcasts"] });
      toast.success("Broadcast dibatalkan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membatalkan broadcast");
    },
  });
}

export function useRetryBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => kaiApi.retryBroadcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "broadcasts"] });
      toast.success("Broadcast sedang dicoba ulang");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mencoba ulang broadcast");
    },
  });
}

export function useChatbotSettings() {
  return useQuery({
    queryKey: ["kai", "chatbot", "settings"],
    queryFn: kaiApi.getChatbotSettings,
    staleTime: 60 * 1000,
  });
}

export function useUpdateChatbotSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateChatbotSettingsInput) => kaiApi.updateChatbotSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "chatbot", "settings"] });
      toast.success("Pengaturan chatbot disimpan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menyimpan pengaturan");
    },
  });
}

export function useSyncCsv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => kaiApi.syncCsv(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "chatbot", "settings"] });
      toast.success("Sinkronisasi data produk selesai");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal sinkronisasi CSV");
    },
  });
}

export function useKaiConversations() {
  return useQuery({
    queryKey: ["kai", "conversations"],
    queryFn: kaiApi.listConversations,
    staleTime: 15 * 1000,
  });
}

export function useResumeConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => kaiApi.resumeConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "conversations"] });
      toast.success("Bot dilanjutkan untuk percakapan ini");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal melanjutkan bot");
    },
  });
}

export function useSendConversationMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      kaiApi.sendConversationMessage(conversationId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kai", "conversations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Pesan WhatsApp gagal dikirim");
    },
  });
}

export function useKaiLogs(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ["kai", "logs", params],
    queryFn: () => kaiApi.listLogs(params),
    staleTime: 30 * 1000,
  });
}
