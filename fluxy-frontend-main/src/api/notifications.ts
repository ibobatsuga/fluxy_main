import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { FluxyNotification } from "@/types";

export type { FluxyNotification };


export const notificationApi = {
  list: async (): Promise<FluxyNotification[]> => {
    const res = await api.get<ApiResponse<FluxyNotification[]>>("/v1/notifications");
    return res.data.data;
  },
  markRead: async (id: string): Promise<FluxyNotification> => {
    const res = await api.post<ApiResponse<FluxyNotification>>(`/v1/notifications/${id}/read`);
    return res.data.data;
  },
  markAllRead: async (): Promise<void> => {
    await api.post("/v1/notifications/read-all");
  },
};
