import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pixelApi, type GenerateImageRequest } from "@/api/pixel";
import { toast } from "sonner";

export function useGallery() {
  return useQuery({
    queryKey: ["pixel", "gallery"],
    queryFn: pixelApi.listMedia,
    staleTime: 30 * 1000,
  });
}

export function usePixelFeatures() {
  return useQuery({
    queryKey: ["pixel", "features"],
    queryFn: pixelApi.listFeatures,
    staleTime: 60 * 60 * 1000,
  });
}

export function useContents() {
  return useQuery({
    queryKey: ["pixel", "contents"],
    queryFn: pixelApi.listContents,
    staleTime: 30 * 1000,
  });
}

export function useGenerateImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateImageRequest) => pixelApi.generateImage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pixel", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat hasil AI");
    },
  });
}

export function useGenerateCaption() {
  return useMutation({
    mutationFn: (prompt: string) => pixelApi.generateCaption({ prompt }),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate caption");
    },
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => pixelApi.uploadMedia(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pixel", "gallery"] });
      toast.success("Gambar berhasil diupload");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengupload gambar");
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pixelApi.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pixel", "gallery"] });
      toast.success("Gambar berhasil dihapus");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus gambar");
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pixelApi.deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pixel", "contents"] });
      queryClient.invalidateQueries({ queryKey: ["pixel", "gallery"] });
      toast.success("Konten berhasil dihapus");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus konten");
    },
  });
}

export function useInvalidateGallery() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["pixel", "gallery"] });
    queryClient.invalidateQueries({ queryKey: ["pixel", "contents"] });
  };
}
