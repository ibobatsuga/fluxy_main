export interface User {
  id: string;
  name: string;
  email: string;
  business_name: string | null;
  industry_category: string | null;
  provider: string | null;
  is_approved: boolean;
  is_admin: boolean;
  timezone: string | null;
  subscription_status: "none" | "active" | "expired" | "suspended";
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  provider: "instagram" | "facebook" | "twitter" | "linkedin" | "tiktok" | "youtube" | "bluesky" | "google";
  zernio_account_id: string;
  platform_username: string | null;
  platform_avatar: string | null;
  provider_metadata?: Record<string, unknown> | null;
  is_active: boolean;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KaiDevice {
  id: string;
  user_id: string;
  connection_type?: "cloud_api" | "qr_gateway";
  session_id?: string | null;
  qr_code?: string | null;
  qr_expires_at?: string | null;
  ping_device_id: string | null;
  waba_id?: string | null;
  wa_number: string | null;
  business_name: string | null;
  status: "pending" | "connected" | "disconnected" | "rejected" | "qr_ready";
  connected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KaiGroup {
  id: string;
  user_id: string;
  alias: string;
  wa_group_id: string;
  created_at: string;
  updated_at: string;
}

export interface KaiBroadcast {
  id: string;
  user_id: string;
  group_ids: string[];
  message: string;
  image_url: string | null;
  template_id: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed" | "cancelled";
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface KaiChatbotSettings {
  id: string;
  user_id: string;
  is_active: boolean;
  greeting_msg: string | null;
  payment_keywords: string[] | null;
  admin_wa_number: string | null;
  handoff_notify_msg: string | null;
  resume_keywords: string[] | null;
  resume_msg: string | null;
  auto_sync_interval: number | null;
  csv_url: string | null;
  csv_last_synced: string | null;
  csv_sync_status: "idle" | "syncing" | "success" | "failed";
}

export interface KaiConversation {
  id: string;
  user_id: string;
  channel?: "whatsapp" | "facebook" | "instagram";
  provider_account_id?: string | null;
  wa_contact: string;
  contact_name: string | null;
  state: "bot_active" | "waiting_admin" | "paused";
  last_message: string | null;
  last_message_at: string | null;
  handoff_at: string | null;
  resumed_at: string | null;
  messages?: KaiConversationMessage[];
}

export interface KaiConversationMessage {
  id: string;
  conversation_id: string;
  sender: "customer" | "bot" | "admin";
  message: string;
  created_at: string;
}

export interface Content {
  id: string;
  user_id: string;
  caption: string | null;
  hashtags: string | null;
  media_urls: string[] | null;
  content_type?: "story" | "feed" | "carousel" | "reel" | null;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  user_id: string;
  content_id: string;
  content?: Content;
  scheduled_at: string | null;
  actual_published_at: string | null;
  status: "draft" | "scheduled" | "processing" | "completed" | "failed";
  zernio_post_id: string | null;
  platforms?: SchedulePlatform[];
  created_at: string;
  updated_at: string;
}

export interface SchedulePlatform {
  id: string;
  schedule_id: string;
  social_account_id: string;
  social_account?: SocialAccount;
  status: "pending" | "publishing" | "published" | "failed";
  published_at: string | null;
  error_message: string | null;
}

export interface RecurringSchedule {
  id: string;
  user_id: string;
  content_id: string;
  content?: Content;
  platforms: { account_id: string; platform: string }[];
  repeat_type: "daily" | "weekly" | "biweekly" | "monthly" | "custom";
  repeat_days: string[] | null;
  custom_interval: number | null;
  custom_unit: "day" | "week" | "month" | null;
  end_type: "after" | "date";
  end_after: number | null;
  end_date: string | null;
  current_occurrences: number;
  next_scheduled_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsOverview {
  total_reach: number;
  total_engagement: number;
  followers_count: number;
  followers_growth: number;
  engagement_rate: number;
}

export interface AnalyticsDaily {
  date: string;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

export interface AnalyticsResponse {
  overview: AnalyticsOverview;
  daily: AnalyticsDaily[];
}

export interface KaiLog {
  id: string;
  user_id: string;
  type: "broadcast" | "chat" | "handoff" | "resume" | "system" | "error";
  target: string | null;
  status: "success" | "failed" | "pending";
  detail: Record<string, unknown> | null;
  created_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  ai_employee_type: "pixel" | "maya" | "echo" | "kai";
  action_type: string;
  created_at: string;
}

export interface UsageSummary {
  pixel: { used: number; limit: number };
  maya: { used: number; limit: number };
  echo: { used: number; limit: number };
  kai: { used: number; limit: number };
  motion: { used: number; limit: number };
  luna: { used: number; limit: number };
}

export interface DefaultLimits {
  pixel: number;
  maya: number;
  kai: number;
  motion: number;
  luna: number;
}

export interface PlatformCredentials {
  meta_app_id: string | null;
  meta_app_secret_masked: string | null;
  meta_business_id: string | null;
  meta_system_user_token_masked: string | null;
  meta_webhook_verify_token_masked: string | null;
  tiktok_app_id: string | null;
  tiktok_app_secret_masked: string | null;
  ai_image_api_key_masked: string | null;
  updated_at: string | null;
}

export interface AdminActivityLog {
  id: string;
  tenant_id: string;
  tenant_name: string;
  type: "approval" | "reject" | "suspend" | "reactivate" | "limit_change" | "usage";
  message: string;
  created_at: string;
}

export interface FluxyNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: { url?: string; [key: string]: unknown } | null;
  read_at: string | null;
  created_at: string;
}
