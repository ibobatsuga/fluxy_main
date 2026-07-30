import api from "@/lib/axios";
import type {
  User,
  KaiDevice,
  UsageSummary,
  DefaultLimits,
  PlatformCredentials,
  AdminActivityLog,
} from "@/types";
import type { ApiResponse } from "@/types/api";

interface PendingUser extends User {
  created_at: string;
}

export interface ApproveTenantInput {
  subscription_start_date: string;
  subscription_end_date: string;
}

export interface ActivateDeviceInput {
  device_key: string;
  api_key: string;
  business_name?: string;
}

export const adminApi = {
  listTenants: async (): Promise<User[]> => {
    const res = await api.get<ApiResponse<User[]>>("/v1/admin/users");
    return res.data.data;
  },

  getTenantDetail: async (userId: string): Promise<User> => {
    const res = await api.get<ApiResponse<User>>(`/v1/admin/users/${userId}`);
    return res.data.data;
  },

  getTenantUsage: async (userId: string): Promise<UsageSummary> => {
    const res = await api.get<ApiResponse<UsageSummary>>(`/v1/admin/users/${userId}/usage`);
    return res.data.data;
  },

  getPendingUsers: async (): Promise<PendingUser[]> => {
    const res = await api.get<ApiResponse<PendingUser[]>>("/v1/admin/users/pending");
    return res.data.data;
  },

  approveUser: async (userId: string, data: ApproveTenantInput): Promise<void> => {
    await api.post(`/v1/admin/users/${userId}/approve`, data);
  },

  rejectUser: async (userId: string, data?: { reason?: string }): Promise<void> => {
    await api.post(`/v1/admin/users/${userId}/reject`, data);
  },

  suspendTenant: async (userId: string): Promise<void> => {
    await api.post(`/v1/admin/users/${userId}/suspend`);
  },

  reactivateTenant: async (userId: string): Promise<void> => {
    await api.post(`/v1/admin/users/${userId}/reactivate`);
  },

  getAggregateUsage: async (): Promise<UsageSummary> => {
    const res = await api.get<ApiResponse<UsageSummary>>("/v1/admin/usage/aggregate");
    return res.data.data;
  },

  getActivityLogs: async (params?: {
    tenant_id?: string;
    type?: string;
  }): Promise<AdminActivityLog[]> => {
    const res = await api.get<ApiResponse<AdminActivityLog[]>>("/v1/admin/activity-logs", {
      params,
    });
    return res.data.data;
  },

  getPendingDevices: async (): Promise<KaiDevice[]> => {
    const res = await api.get<ApiResponse<KaiDevice[]>>("/v1/admin/kai/requests");
    return res.data.data;
  },

  activateDevice: async (deviceId: string, data: ActivateDeviceInput): Promise<void> => {
    await api.post(`/v1/admin/kai/${deviceId}/activate`, data);
  },

  rejectDevice: async (deviceId: string): Promise<void> => {
    await api.post(`/v1/admin/kai/${deviceId}/reject`);
  },

  getDefaultLimits: async (): Promise<DefaultLimits> => {
    const res = await api.get<ApiResponse<DefaultLimits>>("/v1/admin/config/limits");
    return res.data.data;
  },

  updateDefaultLimits: async (data: DefaultLimits): Promise<DefaultLimits> => {
    const res = await api.put<ApiResponse<DefaultLimits>>("/v1/admin/config/limits", data);
    return res.data.data;
  },

  getPlatformCredentials: async (): Promise<PlatformCredentials> => {
    const res = await api.get<ApiResponse<PlatformCredentials>>("/v1/admin/config/credentials");
    return res.data.data;
  },

  updatePlatformCredentials: async (
    data: Partial<
      Record<
        | "meta_app_id"
        | "meta_app_secret"
        | "meta_business_id"
        | "meta_system_user_token"
        | "meta_webhook_verify_token"
        | "tiktok_app_id"
        | "tiktok_app_secret"
        | "ai_image_api_key",
        string
      >
    >
  ): Promise<PlatformCredentials> => {
    const res = await api.put<ApiResponse<PlatformCredentials>>(
      "/v1/admin/config/credentials",
      data
    );
    return res.data.data;
  },

  syncMetaAssets: async (userId: string): Promise<{
    facebook_accounts: number;
    instagram_accounts: number;
    whatsapp_numbers: number;
  }> => {
    const res = await api.post<
      ApiResponse<{ facebook_accounts: number; instagram_accounts: number; whatsapp_numbers: number }>
    >("/v1/admin/meta/sync", { user_id: userId });
    return res.data.data;
  },
};
