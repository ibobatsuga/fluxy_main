import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  mayaApi,
  type MayaPlatform,
  type CreatePostRequest,
  type UpdatePostRequest,
  type StoryBulkScheduleRequest,
} from "@/api/maya";

export function useMayaAccounts() {
  return useQuery({
    queryKey: ["maya", "accounts"],
    queryFn: mayaApi.listAccounts,
    staleTime: 2 * 60 * 1000,
  });
}

export function useConnectAccount() {
  return useMutation({
    mutationFn: (provider: MayaPlatform) => mayaApi.getConnectRedirect(provider),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghubungkan akun");
    },
  });
}

export function useConfirmConnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provider: MayaPlatform) => mayaApi.confirmConnect(provider),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: ["maya", "accounts"] });
      toast.success(`Akun ${account.provider} berhasil terhubung`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghubungkan akun");
    },
  });
}

export function useDisconnectAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mayaApi.disconnectAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maya", "accounts"] });
      toast.success("Akun berhasil diputuskan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memutuskan akun");
    },
  });
}

export function useMayaPosts(params?: { status?: string; per_page?: number }) {
  return useQuery({
    queryKey: ["maya", "posts", params],
    queryFn: () => mayaApi.listPosts(params),
    staleTime: 30 * 1000,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => mayaApi.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maya", "posts"] });
      toast.success("Konten berhasil dijadwalkan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat konten");
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostRequest }) => mayaApi.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maya", "posts"] });
      toast.success("Post berhasil diperbarui");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui post");
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mayaApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maya", "posts"] });
      toast.success("Post berhasil dibatalkan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membatalkan post");
    },
  });
}

export function useRetryPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mayaApi.retryPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maya", "posts"] });
      toast.success("Post sedang dicoba ulang");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mencoba ulang post");
    },
  });
}

export function useQueueSlots() {
  return useQuery({
    queryKey: ["maya", "queue", "slots"],
    queryFn: mayaApi.listQueueSlots,
    staleTime: 60 * 1000,
  });
}

export function useNextQueueSlot() {
  return useQuery({
    queryKey: ["maya", "queue", "next-slot"],
    queryFn: mayaApi.nextQueueSlot,
    staleTime: 60 * 1000,
  });
}

export function useStoryBulkSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoryBulkScheduleRequest) => mayaApi.storyBulkSchedule(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["maya", "posts"] });
      toast.success(`${res.count} story berhasil dijadwalkan`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menjadwalkan story");
    },
  });
}
