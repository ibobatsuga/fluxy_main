import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminApi,
  type ApproveTenantInput,
  type ActivateDeviceInput,
} from "@/api/admin";
import type { DefaultLimits } from "@/types";

export function useTenants() {
  return useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: adminApi.listTenants,
    staleTime: 30 * 1000,
  });
}

export function useTenantUsage(userId: string | null) {
  return useQuery({
    queryKey: ["admin", "tenants", userId, "usage"],
    queryFn: () => adminApi.getTenantUsage(userId as string),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export function useApproveTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ApproveTenantInput }) =>
      adminApi.approveUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "activity-logs"] });
      toast.success("Tenant berhasil diaktivasi");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengaktivasi tenant");
    },
  });
}

export function useRejectTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminApi.rejectUser(userId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "activity-logs"] });
      toast.success("Pendaftaran tenant ditolak");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menolak tenant");
    },
  });
}

export function useSuspendTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.suspendTenant(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "activity-logs"] });
      toast.success("Tenant berhasil di-suspend");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal men-suspend tenant");
    },
  });
}

export function useReactivateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.reactivateTenant(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "activity-logs"] });
      toast.success("Tenant berhasil diaktifkan kembali");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengaktifkan kembali tenant");
    },
  });
}

export function useAggregateUsage() {
  return useQuery({
    queryKey: ["admin", "usage", "aggregate"],
    queryFn: adminApi.getAggregateUsage,
    staleTime: 60 * 1000,
  });
}

export function useActivityLogs(params?: { tenant_id?: string; type?: string }) {
  return useQuery({
    queryKey: ["admin", "activity-logs", params],
    queryFn: () => adminApi.getActivityLogs(params),
    staleTime: 30 * 1000,
  });
}

export function usePendingDevices() {
  return useQuery({
    queryKey: ["admin", "kai", "pending-devices"],
    queryFn: adminApi.getPendingDevices,
    staleTime: 30 * 1000,
  });
}

export function useActivateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deviceId, data }: { deviceId: string; data: ActivateDeviceInput }) =>
      adminApi.activateDevice(deviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "kai", "pending-devices"] });
      toast.success("Device WhatsApp berhasil diaktivasi");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengaktivasi device");
    },
  });
}

export function useRejectDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => adminApi.rejectDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "kai", "pending-devices"] });
      toast.success("Permintaan device ditolak");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menolak device");
    },
  });
}

export function useDefaultLimits() {
  return useQuery({
    queryKey: ["admin", "config", "limits"],
    queryFn: adminApi.getDefaultLimits,
    staleTime: 60 * 1000,
  });
}

export function useUpdateDefaultLimits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DefaultLimits) => adminApi.updateDefaultLimits(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "config", "limits"] });
      toast.success("Batasan default berhasil disimpan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menyimpan batasan default");
    },
  });
}

export function usePlatformCredentials() {
  return useQuery({
    queryKey: ["admin", "config", "credentials"],
    queryFn: adminApi.getPlatformCredentials,
    staleTime: 60 * 1000,
  });
}

export function useUpdatePlatformCredentials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.updatePlatformCredentials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "config", "credentials"] });
      toast.success("Kredensial platform berhasil disimpan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menyimpan kredensial");
    },
  });
}

export function useSyncMetaAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.syncMetaAssets,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["maya", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "activity-logs"] });
      toast.success(
        `Meta tersinkron: ${result.facebook_accounts} Facebook, ${result.instagram_accounts} Instagram, ${result.whatsapp_numbers} WhatsApp`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menyinkronkan aset Meta");
    },
  });
}
