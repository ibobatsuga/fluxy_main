import api from "@/lib/axios";
import type { SocialAccount, Schedule, KaiDevice, AnalyticsResponse, UsageSummary } from "@/types";
import type { ApiResponse } from "@/types/api";

export const accountsApi = {
  list: async (): Promise<SocialAccount[]> => {
    const res = await api.get<ApiResponse<SocialAccount[]>>("/v1/accounts");
    return res.data.data;
  },

  health: async (): Promise<unknown[]> => {
    const res = await api.get<ApiResponse<unknown[]>>("/v1/accounts/health");
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/v1/accounts/${id}`);
  },
};

export const postsApi = {
  list: async (params?: { status?: string; per_page?: number }): Promise<{ data: Schedule[]; meta?: Record<string, unknown> }> => {
    const res = await api.get("/v1/posts", { params });
    return res.data.data ? res.data : { data: res.data.data || [] };
  },
};

export const kaiDeviceApi = {
  status: async (): Promise<KaiDevice | null> => {
    try {
      const res = await api.get<ApiResponse<KaiDevice>>("/v1/kai/device/status");
      return res.data.data;
    } catch {
      return null;
    }
  },
};

export const analyticsApi = {
  overview: async (params?: { platform?: string; days?: number }): Promise<AnalyticsResponse> => {
    const res = await api.get<ApiResponse<AnalyticsResponse>>("/v1/analytics", { params });
    return res.data.data;
  },
};

export const usageApi = {
  summary: async (): Promise<UsageSummary> => {
    const res = await api.get<ApiResponse<UsageSummary>>("/v1/usage/summary");
    return res.data.data;
  },
};
