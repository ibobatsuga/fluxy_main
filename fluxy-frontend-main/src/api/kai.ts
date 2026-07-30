import api from "@/lib/axios";
import type {
  KaiDevice,
  KaiGroup,
  KaiBroadcast,
  KaiChatbotSettings,
  KaiConversation,
  KaiConversationMessage,
  KaiLog,
} from "@/types";
import type { ApiResponse } from "@/types/api";

export interface RequestDeviceInput {
  wa_number: string;
  business_name: string;
  provider_phone_number_id?: string;
  waba_id?: string;
  access_token?: string;
}

export interface CreateGroupInput {
  alias: string;
  wa_group_id: string;
}

export interface CreateBroadcastInput {
  group_ids: string[];
  message: string;
  image_url?: string;
  scheduled_at?: string;
}

export interface UpdateChatbotSettingsInput {
  is_active?: boolean;
  greeting_msg?: string;
  payment_keywords?: string[];
  admin_wa_number?: string;
  handoff_notify_msg?: string;
  resume_keywords?: string[];
  resume_msg?: string;
  csv_url?: string;
}

export const kaiApi = {
  getDeviceStatus: async (): Promise<KaiDevice | null> => {
    try {
      const res = await api.get<ApiResponse<KaiDevice>>("/v1/kai/device/status");
      return res.data.data;
    } catch {
      return null;
    }
  },

  requestDevice: async (data: RequestDeviceInput): Promise<KaiDevice> => {
    const res = await api.post<ApiResponse<KaiDevice>>("/v1/kai/device/request", data);
    return res.data.data;
  },

  generateQr: async (data: { wa_number: string; business_name: string }): Promise<KaiDevice> => {
    const res = await api.post<ApiResponse<KaiDevice>>("/v1/kai/device/qr/generate", data);
    return res.data.data;
  },

  checkQrStatus: async (): Promise<KaiDevice | null> => {
    const res = await api.get<ApiResponse<KaiDevice | null>>("/v1/kai/device/qr/status");
    return res.data.data;
  },

  simulateScan: async (): Promise<KaiDevice> => {
    const res = await api.post<ApiResponse<KaiDevice>>("/v1/kai/device/qr/simulate-scan");
    return res.data.data;
  },

  disconnectDevice: async (): Promise<void> => {
    await api.post("/v1/kai/device/disconnect");
  },

  listGroups: async (): Promise<KaiGroup[]> => {
    const res = await api.get<ApiResponse<KaiGroup[]>>("/v1/kai/groups");
    return res.data.data;
  },

  createGroup: async (data: CreateGroupInput): Promise<KaiGroup> => {
    const res = await api.post<ApiResponse<KaiGroup>>("/v1/kai/groups", data);
    return res.data.data;
  },

  deleteGroup: async (id: string): Promise<void> => {
    await api.delete(`/v1/kai/groups/${id}`);
  },

  listBroadcasts: async (): Promise<KaiBroadcast[]> => {
    const res = await api.get<ApiResponse<KaiBroadcast[]>>("/v1/kai/broadcast");
    return res.data.data;
  },

  createBroadcast: async (data: CreateBroadcastInput): Promise<KaiBroadcast> => {
    const res = await api.post<ApiResponse<KaiBroadcast>>("/v1/kai/broadcast", data);
    return res.data.data;
  },

  cancelBroadcast: async (id: string): Promise<void> => {
    await api.delete(`/v1/kai/broadcast/${id}`);
  },

  retryBroadcast: async (id: string): Promise<KaiBroadcast> => {
    const res = await api.post<ApiResponse<KaiBroadcast>>(`/v1/kai/broadcast/${id}/retry`);
    return res.data.data;
  },

  getChatbotSettings: async (): Promise<KaiChatbotSettings | null> => {
    const res = await api.get<ApiResponse<KaiChatbotSettings | null>>("/v1/kai/chatbot/settings");
    return res.data.data;
  },

  updateChatbotSettings: async (
    data: UpdateChatbotSettingsInput
  ): Promise<KaiChatbotSettings> => {
    const res = await api.put<ApiResponse<KaiChatbotSettings>>("/v1/kai/chatbot/settings", data);
    return res.data.data;
  },

  syncCsv: async (): Promise<KaiChatbotSettings> => {
    const res = await api.post<ApiResponse<KaiChatbotSettings>>("/v1/kai/chatbot/csv-sync");
    return res.data.data;
  },

  listConversations: async (): Promise<KaiConversation[]> => {
    const res = await api.get<ApiResponse<KaiConversation[]>>("/v1/kai/chatbot/conversations");
    return res.data.data;
  },

  resumeConversation: async (id: string): Promise<KaiConversation> => {
    const res = await api.post<ApiResponse<KaiConversation>>(
      `/v1/kai/chatbot/conversations/${id}/resume`
    );
    return res.data.data;
  },

  sendConversationMessage: async (id: string, message: string): Promise<KaiConversationMessage> => {
    const res = await api.post<ApiResponse<KaiConversationMessage>>(
      `/v1/kai/chatbot/conversations/${id}/messages`,
      { message }
    );
    return res.data.data;
  },

  listLogs: async (params?: { type?: string; status?: string }): Promise<KaiLog[]> => {
    const res = await api.get<ApiResponse<KaiLog[]>>("/v1/kai/logs", { params });
    return res.data.data;
  },
};
