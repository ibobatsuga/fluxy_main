import api from "@/lib/axios";
import type { AnalyticsResponse } from "@/types";
import type { ApiResponse } from "@/types/api";

export type EchoPlatform = "instagram" | "tiktok" | "all";
export type ExportFormat = "pdf" | "xlsx";

export interface AnalyticsParams {
  platform?: EchoPlatform;
  from?: string;
  to?: string;
}

export interface ContentPerformanceItem {
  id: string;
  caption: string | null;
  platform: "instagram" | "tiktok";
  thumbnail_url: string | null;
  published_at: string | null;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

export const echoApi = {
  getOverview: async (params?: AnalyticsParams): Promise<AnalyticsResponse> => {
    const res = await api.get<ApiResponse<AnalyticsResponse>>("/v1/analytics", { params });
    return res.data.data;
  },

  getContentPerformance: async (
    params?: AnalyticsParams
  ): Promise<ContentPerformanceItem[]> => {
    const res = await api.get<ApiResponse<ContentPerformanceItem[]>>("/v1/analytics/contents", {
      params,
    });
    return res.data.data;
  },

  exportReport: async (
    format: ExportFormat,
    params?: AnalyticsParams
  ): Promise<{ file_name: string; url: string | null }> => {
    const res = await api.post<ApiResponse<{ file_name: string; url: string | null }>>(
      "/v1/analytics/export",
      { format, ...params }
    );
    return res.data.data;
  },
};
