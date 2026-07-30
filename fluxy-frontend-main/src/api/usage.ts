import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { UsageSummary } from "@/types";

export const usageApi = {
  getSummary: async (): Promise<UsageSummary> => {
    const res = await api.get<ApiResponse<UsageSummary>>("/v1/usage/summary");
    return res.data.data;
  },
};
