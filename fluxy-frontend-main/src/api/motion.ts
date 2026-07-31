import api from "@/lib/axios";

export interface MotionBrief {
  product_name: string;
  product_description: string;
  target_market: string;
  content_type: string;
  platform: string;
  ad_goal: string;
  language: string;
  tone: string;
  aspect_ratio: string;
  color_grading: string;
  character: string;
  duration: string;
  hook_style: string;
  pace_editing: string;
  setting_location?: string;
  character_gender?: string;
  music_mood?: string;
  transition?: string;
  text_overlay_animation: boolean;
  cinematic_camera: boolean;
  explicit_cta?: string;
  negative_prompt?: string;
}

export interface MotionGenerateResponse {
  data: { text: string };
}

export const motionApi = {
  generatePrompt: async (brief: MotionBrief): Promise<string> => {
    const res = await api.post<MotionGenerateResponse>("/v1/motion/generate-prompt", brief);
    return res.data.data.text;
  },
};
