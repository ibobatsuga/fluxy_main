import api from "@/lib/axios";

export interface GenerateImageRequest {
  content_type: "feed" | "story";
  input_type: "upload" | "gdrive";
  image_file?: File;
  gdrive_link?: string;
  lighting?: string;
  background?: string;
  style?: string;
}

export interface GenerateCaptionRequest {
  prompt: string;
}

export interface GenerateCaptionResponse {
  text: string;
}

export interface MediaItem {
  id: string;
  user_id: string;
  type: "image" | "video" | "generated_image";
  path: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface ContentItem {
  id: string;
  user_id: string;
  caption: string | null;
  hashtags: string | null;
  media_urls: string[] | null;
  created_at: string;
  updated_at: string;
}

export const pixelApi = {
  generateImage: async (data: GenerateImageRequest): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append("content_type", data.content_type);
    formData.append("input_type", data.input_type);

    if (data.input_type === "upload" && data.image_file) {
      formData.append("image_file", data.image_file);
    }
    if (data.input_type === "gdrive" && data.gdrive_link) {
      formData.append("gdrive_link", data.gdrive_link);
    }
    if (data.lighting) formData.append("lighting", data.lighting);
    if (data.background) formData.append("background", data.background);
    if (data.style) formData.append("style", data.style);

    const res = await api.post("/v1/ai/generate-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  generateCaption: async (data: GenerateCaptionRequest): Promise<GenerateCaptionResponse> => {
    const res = await api.post<{ data: GenerateCaptionResponse }>("/v1/ai/generate-caption", data);
    return res.data.data;
  },

  uploadMedia: async (file: File): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<{ data: MediaItem }>("/v1/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  deleteMedia: async (id: string): Promise<void> => {
    await api.delete(`/v1/media/${id}`);
  },

  listMedia: async (): Promise<MediaItem[]> => {
    const res = await api.get<{ data: MediaItem[] }>("/v1/media");
    return res.data.data;
  },

  listContents: async (): Promise<ContentItem[]> => {
    const res = await api.get<{ data: ContentItem[] }>("/v1/contents");
    return res.data.data;
  },

  createContent: async (data: {
    caption?: string;
    hashtags?: string;
    media_urls?: string[];
  }): Promise<ContentItem> => {
    const res = await api.post<{ data: ContentItem }>("/v1/contents", data);
    return res.data.data;
  },

  deleteContent: async (id: string): Promise<void> => {
    await api.delete(`/v1/contents/${id}`);
  },
};
