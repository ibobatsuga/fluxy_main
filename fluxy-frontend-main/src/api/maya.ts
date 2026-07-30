import api from "@/lib/axios";
import type { SocialAccount, Schedule, Content } from "@/types";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export type MayaPlatform = "facebook" | "instagram" | "tiktok";
export type MayaContentType = "story" | "feed" | "carousel" | "reel";

export interface CreatePostRequest {
  caption?: string;
  hashtags?: string;
  media_urls: string[];
  platforms: string[];
  content_type?: MayaContentType;
  schedule_type: "now" | "schedule";
  scheduled_at?: string;
}

export interface UpdatePostRequest {
  caption?: string;
  hashtags?: string;
  media_urls?: string[];
  platforms?: string[];
  scheduled_at?: string;
}

export interface StoryContentItem {
  link: string;
  time: string;
}

export interface StoryBulkScheduleRequest {
  content_items: StoryContentItem[];
  start_date: string;
  end_date: string;
  platforms: string[];
  is_carousel?: boolean;
}

export interface QueueSlot {
  slot: string;
  taken: boolean;
}

export const mayaApi = {
  listAccounts: async (): Promise<SocialAccount[]> => {
    const res = await api.get<ApiResponse<SocialAccount[]>>("/v1/accounts");
    return res.data.data;
  },

  getConnectRedirect: async (provider: MayaPlatform): Promise<{ url: string }> => {
    const res = await api.get<ApiResponse<{ url: string }>>(`/v1/accounts/connect/${provider}/redirect`);
    return res.data.data;
  },

  confirmConnect: async (provider: MayaPlatform): Promise<SocialAccount> => {
    const res = await api.post<ApiResponse<SocialAccount>>("/v1/accounts/connect/confirm", { provider });
    return res.data.data;
  },

  disconnectAccount: async (id: string): Promise<void> => {
    await api.delete(`/v1/accounts/${id}`);
  },

  listPosts: async (params?: { status?: string; per_page?: number }): Promise<Schedule[]> => {
    const res = await api.get<PaginatedResponse<Schedule> | ApiResponse<Schedule[]>>("/v1/posts", { params });
    return res.data.data;
  },

  createPost: async (data: CreatePostRequest): Promise<Schedule> => {
    const res = await api.post<ApiResponse<Schedule>>("/v1/posts", data);
    return res.data.data;
  },

  updatePost: async (id: string, data: UpdatePostRequest): Promise<Schedule> => {
    const res = await api.put<ApiResponse<Schedule>>(`/v1/posts/${id}`, data);
    return res.data.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/v1/posts/${id}`);
  },

  retryPost: async (id: string): Promise<Schedule> => {
    const res = await api.post<ApiResponse<Schedule>>(`/v1/posts/${id}/retry`);
    return res.data.data;
  },

  listQueueSlots: async (): Promise<QueueSlot[]> => {
    const res = await api.get<ApiResponse<QueueSlot[]>>("/v1/queue/slots");
    return res.data.data;
  },

  nextQueueSlot: async (): Promise<{ slot: string }> => {
    const res = await api.get<ApiResponse<{ slot: string }>>("/v1/queue/next-slot");
    return res.data.data;
  },

  storyBulkSchedule: async (data: StoryBulkScheduleRequest): Promise<{ message: string; count: number }> => {
    const res = await api.post<ApiResponse<{ message: string; count: number }>>("/v1/story-bulk-schedule", data);
    return res.data.data;
  },
};

export type { SocialAccount, Schedule, Content };
