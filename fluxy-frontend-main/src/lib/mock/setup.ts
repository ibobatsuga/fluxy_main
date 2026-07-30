import MockAdapter from "axios-mock-adapter";
import type { AxiosInstance } from "axios";
import type { SocialAccount, Schedule, User, AdminActivityLog, PlatformCredentials, DefaultLimits, FluxyNotification } from "@/types";
import type { KaiDevice, KaiGroup, KaiBroadcast, KaiChatbotSettings, KaiConversation } from "@/types";
import {
  mockUser,
  mockSocialAccounts,
  mockMediaItems,
  mockPosts,
  mockContentPerformance,
  mockKaiGroups,
  mockKaiBroadcasts,
  mockKaiChatbotSettings,
  mockKaiConversations,
  mockKaiLogs,
  mockTenants,
  mockAdminActivityLogs,
  mockPlatformCredentials,
  mockDefaultLimits,
  mockKaiDeviceRequests,
  mockNotifications as initialNotifications,
} from "./data";

let mockGallery = [...mockMediaItems];
let mockAccounts: SocialAccount[] = [...mockSocialAccounts];
let mockScheduledPosts: Schedule[] = [...mockPosts];
let mockKaiDevice: KaiDevice | null = {
  id: "kai_dev_001",
  user_id: "usr_mock_001",
  ping_device_id: "ping_dev_001",
  wa_number: "628123456789",
  business_name: "Toko Maju Jaya",
  status: "connected",
  connected_at: "2026-07-10T10:00:00.000Z",
  created_at: "2026-07-08T10:00:00.000Z",
  updated_at: "2026-07-10T10:00:00.000Z",
};
let mockGroups: KaiGroup[] = [...mockKaiGroups];
let mockBroadcasts: KaiBroadcast[] = [...mockKaiBroadcasts];
let mockChatbotSettings: KaiChatbotSettings = { ...mockKaiChatbotSettings };
let mockConversations: KaiConversation[] = mockKaiConversations.map((c) => ({ ...c }));
let mockTenantList: User[] = mockTenants.map((t) => ({ ...t }));
let mockActivityLogs: AdminActivityLog[] = [...mockAdminActivityLogs];
let mockCredentials: PlatformCredentials = { ...mockPlatformCredentials };
let mockLimits: DefaultLimits = { ...mockDefaultLimits };
let mockDeviceRequests: KaiDevice[] = [...mockKaiDeviceRequests];
let mockNotifications: FluxyNotification[] = initialNotifications.map((n) => ({ ...n }));

function tenantUsage(tenantId: string) {
  const seed = tenantId.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return {
    pixel: { used: seed % mockLimits.pixel, limit: mockLimits.pixel },
    maya: { used: seed % mockLimits.maya, limit: mockLimits.maya },
    echo: { used: (seed % 500) + 20, limit: -1 },
    kai: { used: (seed * 3) % mockLimits.kai, limit: mockLimits.kai },
  };
}

function addActivityLog(tenant: User, type: AdminActivityLog["type"], message: string) {
  mockActivityLogs.unshift({
    id: generateId(),
    tenant_id: tenant.id,
    tenant_name: tenant.business_name || tenant.name,
    type,
    message,
    created_at: new Date().toISOString(),
  });
}
let mockCounter = 100;

function generateId(): string {
  mockCounter++;
  return `mock_${mockCounter}_${Date.now()}`;
}

const MAYA_PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
};

export function setupMock(api: AxiosInstance): MockAdapter {
  const mock = new MockAdapter(api, { delayResponse: 200 });

  // ========== AUTH ==========

  // POST /v1/auth/login
  mock.onPost("/v1/auth/login").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    if (!body.email || !body.password) {
      return [422, { message: "Validation failed", errors: { email: ["Email wajib diisi"], password: ["Password wajib diisi"] } }];
    }
    if (body.password.length < 6) {
      return [422, { message: "Validation failed", errors: { password: ["Password minimal 6 karakter"] } }];
    }
    return [200, {
      data: {
        user: mockUser,
        token: "mock-token-" + Date.now(),
      },
    }];
  });

  // POST /v1/auth/register
  mock.onPost("/v1/auth/register").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    if (!body.name || !body.email || !body.password || !body.business_name) {
      return [422, { message: "Validation failed", errors: { name: ["Nama wajib diisi"] } }];
    }
    return [200, {
      data: { message: "Registrasi berhasil! Akun Anda menunggu persetujuan admin." },
    }];
  });

  // GET /v1/auth/me
  mock.onGet("/v1/auth/me").reply(() => {
    return [200, { data: mockUser }];
  });

  // POST /v1/auth/logout
  mock.onPost("/v1/auth/logout").reply(() => {
    return [200, { data: null }];
  });

  // POST /v1/auth/password
  mock.onPost("/v1/auth/password").reply(() => {
    return [200, { data: null }];
  });

  // ========== PIXEL / AI / MEDIA ==========

  // POST /v1/ai/generate-image (simulate async generation)
  mock.onPost("/v1/ai/generate-image").reply(() => {
    const seed = generateId();
    const newItem = {
      id: seed,
      user_id: "usr_mock_001",
      type: "generated_image" as const,
      path: `uploads/generated_images/${seed}.png`,
      url: `https://picsum.photos/seed/${seed}/600/600`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Simulate async: add to gallery after delay
    setTimeout(() => {
      mockGallery.unshift(newItem);
    }, 3000);

    return [202, {
      message: "Image generation request received. You will be notified when it is ready.",
    }];
  });

  // POST /v1/ai/generate-caption
  mock.onPost("/v1/ai/generate-caption").reply(() => {
    return [200, {
      data: {
        text: "✨ Produk premium kami hadir dengan kualitas terbaik! Dibuat dengan bahan pilihan untuk kepuasan pelanggan. #ProdukBest #KualitasPremium #TokoMajuJaya",
      },
    }];
  });

  // POST /v1/media/upload
  mock.onPost("/v1/media/upload").reply(() => {
    const seed = generateId();
    const newItem = {
      id: seed,
      user_id: "usr_mock_001",
      type: "image" as const,
      path: `uploads/images/${seed}.jpg`,
      url: `https://picsum.photos/seed/${seed}/600/600`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockGallery.unshift(newItem);
    return [201, { data: newItem }];
  });

  // DELETE /v1/media/:id
  mock.onDelete(/\/v1\/media\/(.+)/).reply((config) => {
    const id = config.url?.split("/").pop() || "";
    mockGallery = mockGallery.filter((m) => m.id !== id);
    return [200, { message: "Media deleted" }];
  });

  // GET /v1/contents
  mock.onGet("/v1/contents").reply(() => {
    return [200, { data: mockGallery }];
  });

  // POST /v1/contents
  mock.onPost("/v1/contents").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    const newItem = {
      id: generateId(),
      user_id: "usr_mock_001",
      caption: body.caption || null,
      hashtags: body.hashtags || null,
      media_urls: body.media_urls || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return [201, { data: newItem }];
  });

  // DELETE /v1/contents/:id
  mock.onDelete(/\/v1\/contents\/(.+)/).reply(() => {
    return [200, { message: "Content deleted" }];
  });

  // ========== DASHBOARD ==========

  // GET /v1/accounts
  mock.onGet("/v1/accounts").reply(() => {
    return [200, { data: mockAccounts }];
  });

  // GET /v1/accounts/health
  mock.onGet("/v1/accounts/health").reply(() => {
    return [200, { data: [] }];
  });

  // GET /v1/posts
  mock.onGet("/v1/posts").reply(() => {
    const sorted = [...mockScheduledPosts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return [200, { data: sorted }];
  });

  mock.onGet("/v1/usage/summary").reply(() => {
    return [200, {
      data: {
        pixel: { used: 12, limit: mockLimits.pixel },
        maya: { used: 18, limit: mockLimits.maya },
        echo: { used: 84, limit: -1 },
        kai: { used: 260, limit: mockLimits.kai },
      },
    }];
  });

  mock.onGet("/v1/notifications").reply(() => [200, { data: mockNotifications }]);

  mock.onPost("/v1/notifications/read-all").reply(() => {
    mockNotifications = mockNotifications.map((item) => ({ ...item, read_at: new Date().toISOString() }));
    return [200, { data: null }];
  });

  mock.onPost(/\/v1\/notifications\/(.+)\/read/).reply((config) => {
    const id = config.url?.split("/")[3];
    const item = mockNotifications.find((notification) => notification.id === id);
    if (!item) return [404, { message: "Notification not found" }];
    item.read_at = new Date().toISOString();
    return [200, { data: item }];
  });

  // ========== MAYA ==========

  // GET /v1/accounts/connect/:provider/redirect
  mock.onGet(/\/v1\/accounts\/connect\/([^/]+)\/redirect/).reply((config) => {
    const match = config.url?.match(/\/v1\/accounts\/connect\/([^/]+)\/redirect/);
    const provider = match?.[1] || "instagram";
    return [
      200,
      { data: { url: `${window.location.origin}/maya/connect?mock_connect=${provider}` } },
    ];
  });

  // POST /v1/accounts/connect/confirm (mock-only helper simulating a completed OAuth flow)
  mock.onPost("/v1/accounts/connect/confirm").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    const provider = body.provider || "instagram";
    const newAccount: SocialAccount = {
      id: generateId(),
      user_id: "usr_mock_001",
      provider,
      zernio_account_id: `zern_${provider}_${Date.now()}`,
      platform_username: `tokomaju_${provider}`,
      platform_avatar: null,
      is_active: true,
      connected_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockAccounts.push(newAccount);
    return [201, { data: newAccount }];
  });

  // DELETE /v1/accounts/:id
  mock.onDelete(/\/v1\/accounts\/(.+)/).reply((config) => {
    const id = config.url?.split("/").pop() || "";
    mockAccounts = mockAccounts.filter((a) => a.id !== id);
    return [200, { message: "Account disconnected" }];
  });

  // POST /v1/posts
  mock.onPost("/v1/posts").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    const id = generateId();
    const contentId = generateId();
    const isNow = body.schedule_type === "now";
    const newPost: Schedule = {
      id,
      user_id: "usr_mock_001",
      content_id: contentId,
      content: {
        id: contentId,
        user_id: "usr_mock_001",
        caption: body.caption || null,
        hashtags: body.hashtags || null,
        media_urls: body.media_urls || null,
        content_type: body.content_type || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      scheduled_at: isNow ? new Date().toISOString() : body.scheduled_at || null,
      actual_published_at: null,
      status: isNow ? "processing" : "scheduled",
      zernio_post_id: null,
      platforms: (body.platforms || []).map((accountId: string) => ({
        id: generateId(),
        schedule_id: id,
        social_account_id: accountId,
        social_account: mockAccounts.find((a) => a.id === accountId),
        status: "pending" as const,
        published_at: null,
        error_message: null,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockScheduledPosts.unshift(newPost);

    if (isNow) {
      setTimeout(() => {
        const post = mockScheduledPosts.find((p) => p.id === id);
        if (post) {
          post.status = "completed";
          post.actual_published_at = new Date().toISOString();
          post.zernio_post_id = `zern_post_${id}`;
          post.platforms = post.platforms?.map((p) => ({
            ...p,
            status: "published" as const,
            published_at: new Date().toISOString(),
          }));
        }
      }, 3000);
    }

    return [201, { data: newPost }];
  });

  // PUT /v1/posts/:id
  mock.onPut(/\/v1\/posts\/(.+)/).reply((config) => {
    const id = config.url?.split("/").pop() || "";
    const body = JSON.parse(config.data || "{}");
    const post = mockScheduledPosts.find((p) => p.id === id);
    if (!post) {
      return [404, { message: "Post not found" }];
    }
    if (post.content) {
      if (body.caption !== undefined) post.content.caption = body.caption;
      if (body.hashtags !== undefined) post.content.hashtags = body.hashtags;
      if (body.media_urls !== undefined) post.content.media_urls = body.media_urls;
    }
    if (body.scheduled_at !== undefined) post.scheduled_at = body.scheduled_at;
    if (body.platforms !== undefined) {
      post.platforms = body.platforms.map((accountId: string) => ({
        id: generateId(),
        schedule_id: post.id,
        social_account_id: accountId,
        social_account: mockAccounts.find((a) => a.id === accountId),
        status: "pending" as const,
        published_at: null,
        error_message: null,
      }));
    }
    post.updated_at = new Date().toISOString();
    return [200, { data: post }];
  });

  // DELETE /v1/posts/:id
  mock.onDelete(/\/v1\/posts\/(.+)/).reply((config) => {
    const id = config.url?.split("/").pop() || "";
    mockScheduledPosts = mockScheduledPosts.filter((p) => p.id !== id);
    return [200, { message: "Post cancelled" }];
  });

  // POST /v1/posts/:id/retry
  mock.onPost(/\/v1\/posts\/(.+)\/retry/).reply((config) => {
    const id = config.url?.split("/")[config.url.split("/").length - 2] || "";
    const post = mockScheduledPosts.find((p) => p.id === id);
    if (!post) {
      return [404, { message: "Post not found" }];
    }
    post.status = "processing";
    post.updated_at = new Date().toISOString();
    setTimeout(() => {
      post.status = "completed";
      post.actual_published_at = new Date().toISOString();
      post.platforms = post.platforms?.map((p) => ({
        ...p,
        status: "published" as const,
        published_at: new Date().toISOString(),
        error_message: null,
      }));
    }, 2500);
    return [200, { data: post }];
  });

  // POST /v1/story-bulk-schedule
  mock.onPost("/v1/story-bulk-schedule").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    const start = new Date(body.start_date);
    const end = new Date(body.end_date);
    const contentItems: { link: string; time: string }[] = body.content_items || [];
    let count = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      for (const item of contentItems) {
        const [hour, minute] = item.time.split(":").map(Number);
        const scheduledAt = new Date(d);
        scheduledAt.setHours(hour || 0, minute || 0, 0, 0);
        const id = generateId();
        const contentId = generateId();
        mockScheduledPosts.push({
          id,
          user_id: "usr_mock_001",
          content_id: contentId,
          content: {
            id: contentId,
            user_id: "usr_mock_001",
            caption: `Story bulk — ${MAYA_PLATFORM_LABEL[body.platforms?.[0]] || "Story"}`,
            hashtags: null,
            media_urls: [item.link],
            content_type: "story",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          scheduled_at: scheduledAt.toISOString(),
          actual_published_at: null,
          status: "scheduled",
          zernio_post_id: null,
          platforms: (body.platforms || []).map((accountId: string) => ({
            id: generateId(),
            schedule_id: id,
            social_account_id: accountId,
            social_account: mockAccounts.find((a) => a.id === accountId),
            status: "pending" as const,
            published_at: null,
            error_message: null,
          })),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        count++;
      }
    }

    return [200, { message: "Story berhasil dijadwalkan", count }];
  });

  // ========== KAI ==========

  // GET /v1/kai/device/status
  mock.onGet("/v1/kai/device/status").reply(() => {
    return [200, { data: mockKaiDevice }];
  });

  // POST /v1/kai/device/request
  mock.onPost("/v1/kai/device/request").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    mockKaiDevice = {
      id: generateId(),
      user_id: "usr_mock_001",
      ping_device_id: null,
      wa_number: body.wa_number,
      business_name: body.business_name,
      status: "pending",
      connected_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return [201, { data: mockKaiDevice }];
  });

  // GET /v1/kai/groups
  mock.onGet("/v1/kai/groups").reply(() => {
    return [200, { data: mockGroups }];
  });

  // POST /v1/kai/groups
  mock.onPost("/v1/kai/groups").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    const newGroup = {
      id: generateId(),
      user_id: "usr_mock_001",
      alias: body.alias,
      wa_group_id: body.wa_group_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockGroups.push(newGroup);
    return [201, { data: newGroup }];
  });

  // DELETE /v1/kai/groups/:id
  mock.onDelete(/\/v1\/kai\/groups\/(.+)/).reply((config) => {
    const id = config.url?.split("/").pop() || "";
    mockGroups = mockGroups.filter((g) => g.id !== id);
    return [200, { message: "Group deleted" }];
  });

  // GET /v1/kai/broadcast
  mock.onGet("/v1/kai/broadcast").reply(() => {
    const sorted = [...mockBroadcasts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return [200, { data: sorted }];
  });

  // POST /v1/kai/broadcast
  mock.onPost("/v1/kai/broadcast").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    const id = generateId();
    const isScheduled = Boolean(body.scheduled_at);
    const newBroadcast: KaiBroadcast = {
      id,
      user_id: "usr_mock_001",
      group_ids: body.group_ids || [],
      message: body.message,
      image_url: body.image_url || null,
      template_id: null,
      scheduled_at: body.scheduled_at || null,
      sent_at: null,
      status: isScheduled ? "scheduled" : "sending",
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockBroadcasts.unshift(newBroadcast);

    if (!isScheduled) {
      setTimeout(() => {
        const broadcast = mockBroadcasts.find((b) => b.id === id);
        if (broadcast) {
          broadcast.status = "sent";
          broadcast.sent_at = new Date().toISOString();
          broadcast.updated_at = new Date().toISOString();
        }
      }, 2000);
    }

    return [201, { data: newBroadcast }];
  });

  // DELETE /v1/kai/broadcast/:id (cancel scheduled)
  mock.onDelete(/\/v1\/kai\/broadcast\/(.+)/).reply((config) => {
    const id = config.url?.split("/").pop() || "";
    const broadcast = mockBroadcasts.find((b) => b.id === id);
    if (!broadcast) return [404, { message: "Broadcast not found" }];
    broadcast.status = "cancelled";
    broadcast.updated_at = new Date().toISOString();
    return [200, { data: broadcast }];
  });

  // POST /v1/kai/broadcast/:id/retry
  mock.onPost(/\/v1\/kai\/broadcast\/(.+)\/retry/).reply((config) => {
    const id = config.url?.split("/")[config.url.split("/").length - 2] || "";
    const broadcast = mockBroadcasts.find((b) => b.id === id);
    if (!broadcast) return [404, { message: "Broadcast not found" }];
    broadcast.status = "sending";
    broadcast.error_message = null;
    broadcast.updated_at = new Date().toISOString();
    setTimeout(() => {
      broadcast.status = "sent";
      broadcast.sent_at = new Date().toISOString();
      broadcast.updated_at = new Date().toISOString();
    }, 2000);
    return [200, { data: broadcast }];
  });

  // GET /v1/kai/chatbot/settings
  mock.onGet("/v1/kai/chatbot/settings").reply(() => {
    return [200, { data: mockChatbotSettings }];
  });

  // PUT /v1/kai/chatbot/settings
  mock.onPut("/v1/kai/chatbot/settings").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    mockChatbotSettings = { ...mockChatbotSettings, ...body };
    return [200, { data: mockChatbotSettings }];
  });

  // POST /v1/kai/chatbot/csv-sync
  mock.onPost("/v1/kai/chatbot/csv-sync").reply(() => {
    mockChatbotSettings.csv_sync_status = "syncing";
    setTimeout(() => {
      mockChatbotSettings.csv_sync_status = "success";
      mockChatbotSettings.csv_last_synced = new Date().toISOString();
    }, 1500);
    return [200, { data: mockChatbotSettings }];
  });

  // GET /v1/kai/chatbot/conversations
  mock.onGet("/v1/kai/chatbot/conversations").reply(() => {
    return [200, { data: mockConversations }];
  });

  // POST /v1/kai/chatbot/conversations/:id/resume
  mock.onPost(/\/v1\/kai\/chatbot\/conversations\/(.+)\/resume/).reply((config) => {
    const id = config.url?.split("/")[config.url.split("/").length - 2] || "";
    const conversation = mockConversations.find((c) => c.id === id);
    if (!conversation) return [404, { message: "Conversation not found" }];
    conversation.state = "bot_active";
    conversation.resumed_at = new Date().toISOString();
    return [200, { data: conversation }];
  });

  // GET /v1/kai/logs?type=&status=
  mock.onGet("/v1/kai/logs").reply((config) => {
    const params = config.params || {};
    let logs = [...mockKaiLogs];
    if (params.type) logs = logs.filter((l) => l.type === params.type);
    if (params.status) logs = logs.filter((l) => l.status === params.status);
    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return [200, { data: logs }];
  });

  // ========== ANALYTICS ==========

  // GET /v1/analytics?platform=&from=&to=
  mock.onGet("/v1/analytics").reply((config) => {
    const params = config.params || {};
    const from = params.from ? new Date(params.from) : new Date(Date.now() - 29 * 86400000);
    const to = params.to ? new Date(params.to) : new Date();
    const dayCount = Math.max(
      1,
      Math.min(90, Math.round((to.getTime() - from.getTime()) / 86400000) + 1)
    );
    const platformMultiplier = params.platform === "tiktok" ? 1.4 : params.platform === "instagram" ? 0.9 : 1;

    const daily = Array.from({ length: dayCount }).map((_, i) => {
      const date = new Date(from);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split("T")[0],
        reach: Math.floor((Math.random() * 3000 + 1000) * platformMultiplier),
        engagement: Math.floor((Math.random() * 500 + 100) * platformMultiplier),
        likes: Math.floor((Math.random() * 300 + 50) * platformMultiplier),
        comments: Math.floor((Math.random() * 50 + 10) * platformMultiplier),
        shares: Math.floor((Math.random() * 30 + 5) * platformMultiplier),
        views: Math.floor((Math.random() * 5000 + 2000) * platformMultiplier),
      };
    });

    const totalReach = daily.reduce((sum, d) => sum + d.reach, 0);
    const totalEngagement = daily.reduce((sum, d) => sum + d.engagement, 0);

    return [200, {
      data: {
        overview: {
          total_reach: totalReach,
          total_engagement: totalEngagement,
          followers_count: 1250,
          followers_growth: 6.8,
          engagement_rate: totalReach > 0 ? Number(((totalEngagement / totalReach) * 100).toFixed(1)) : 0,
        },
        daily,
      },
    }];
  });

  // GET /v1/analytics/contents?platform=&from=&to=
  mock.onGet("/v1/analytics/contents").reply((config) => {
    const params = config.params || {};
    let items = [...mockContentPerformance];
    if (params.platform && params.platform !== "all") {
      items = items.filter((item) => item.platform === params.platform);
    }
    if (params.from) {
      const from = new Date(params.from);
      items = items.filter((item) => item.published_at && new Date(item.published_at) >= from);
    }
    if (params.to) {
      const to = new Date(params.to);
      to.setHours(23, 59, 59, 999);
      items = items.filter((item) => item.published_at && new Date(item.published_at) <= to);
    }
    return [200, { data: items }];
  });

  // POST /v1/analytics/export
  mock.onPost("/v1/analytics/export").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    const ext = body.format === "pdf" ? "pdf" : "xlsx";
    return [200, {
      data: { file_name: `echo-report-${Date.now()}.${ext}`, url: null },
    }];
  });

  // ========== QUEUE ==========

  mock.onGet("/v1/queue/slots").reply(() => {
    const takenTimes = new Set(
      mockScheduledPosts
        .filter((p) => p.status === "scheduled" && p.scheduled_at)
        .map((p) => new Date(p.scheduled_at as string).toISOString())
    );
    const dailyHours = [9, 12, 15, 18, 21];
    const slots = [];
    for (let d = 0; d < 7; d++) {
      for (const hour of dailyHours) {
        const date = new Date();
        date.setDate(date.getDate() + d);
        date.setHours(hour, 0, 0, 0);
        slots.push({ slot: date.toISOString(), taken: takenTimes.has(date.toISOString()) });
      }
    }
    return [200, { data: slots }];
  });

  mock.onGet("/v1/queue/next-slot").reply(() => {
    const date = new Date();
    date.setHours(date.getHours() + 2, 0, 0, 0);
    return [200, { data: { slot: date.toISOString() } }];
  });

  // ========== ADMIN ==========

  // GET /v1/admin/users/pending (register before the generic detail regex)
  mock.onGet("/v1/admin/users/pending").reply(() => {
    const pending = mockTenantList.filter((t) => !t.is_approved);
    return [200, { data: pending }];
  });

  // GET /v1/admin/users/:id/usage (register before the generic detail regex)
  mock.onGet(/\/v1\/admin\/users\/([^/]+)\/usage/).reply((config) => {
    const id = config.url?.split("/")[config.url.split("/").length - 2] || "";
    return [200, { data: tenantUsage(id) }];
  });

  // GET /v1/admin/users
  mock.onGet("/v1/admin/users").reply(() => {
    return [200, { data: mockTenantList }];
  });

  // GET /v1/admin/users/:id
  mock.onGet(/\/v1\/admin\/users\/([^/]+)$/).reply((config) => {
    const id = config.url?.split("/").pop() || "";
    const tenant = mockTenantList.find((t) => t.id === id);
    if (!tenant) return [404, { message: "Tenant not found" }];
    return [200, { data: tenant }];
  });

  // POST /v1/admin/users/:id/approve
  mock.onPost(/\/v1\/admin\/users\/([^/]+)\/approve/).reply((config) => {
    const id = config.url?.split("/")[config.url.split("/").length - 2] || "";
    const body = JSON.parse(config.data || "{}");
    const tenant = mockTenantList.find((t) => t.id === id);
    if (!tenant) return [404, { message: "Tenant not found" }];
    tenant.is_approved = true;
    tenant.subscription_status = "active";
    tenant.subscription_start_date = body.subscription_start_date;
    tenant.subscription_end_date = body.subscription_end_date;
    tenant.updated_at = new Date().toISOString();
    addActivityLog(
      tenant,
      "approval",
      `Diaktivasi hingga ${new Date(body.subscription_end_date).toLocaleDateString("id-ID")}`
    );
    return [200, { data: tenant }];
  });

  // POST /v1/admin/users/:id/reject
  mock.onPost(/\/v1\/admin\/users\/([^/]+)\/reject/).reply((config) => {
    const id = config.url?.split("/")[config.url.split("/").length - 2] || "";
    const body = JSON.parse(config.data || "{}");
    const tenant = mockTenantList.find((t) => t.id === id);
    if (!tenant) return [404, { message: "Tenant not found" }];
    addActivityLog(tenant, "reject", body.reason || "Pendaftaran ditolak");
    mockTenantList = mockTenantList.filter((t) => t.id !== id);
    return [200, { message: "Tenant rejected" }];
  });

  // POST /v1/admin/users/:id/suspend
  mock.onPost(/\/v1\/admin\/users\/([^/]+)\/suspend/).reply((config) => {
    const id = config.url?.split("/")[config.url.split("/").length - 2] || "";
    const tenant = mockTenantList.find((t) => t.id === id);
    if (!tenant) return [404, { message: "Tenant not found" }];
    tenant.subscription_status = "suspended";
    tenant.updated_at = new Date().toISOString();
    addActivityLog(tenant, "suspend", "Tenant di-suspend oleh Admin Fluxy");
    return [200, { data: tenant }];
  });

  // POST /v1/admin/users/:id/reactivate
  mock.onPost(/\/v1\/admin\/users\/([^/]+)\/reactivate/).reply((config) => {
    const id = config.url?.split("/")[config.url.split("/").length - 2] || "";
    const tenant = mockTenantList.find((t) => t.id === id);
    if (!tenant) return [404, { message: "Tenant not found" }];
    tenant.subscription_status = "active";
    const currentEnd = tenant.subscription_end_date ? new Date(tenant.subscription_end_date) : null;
    if (!currentEnd || currentEnd < new Date()) {
      const newEnd = new Date();
      newEnd.setDate(newEnd.getDate() + 30);
      tenant.subscription_end_date = newEnd.toISOString();
    }
    tenant.updated_at = new Date().toISOString();
    addActivityLog(tenant, "reactivate", "Tenant diaktifkan kembali oleh Admin Fluxy");
    return [200, { data: tenant }];
  });

  // GET /v1/admin/usage/aggregate
  mock.onGet("/v1/admin/usage/aggregate").reply(() => {
    const totals = mockTenantList.reduce(
      (acc, tenant) => {
        const usage = tenantUsage(tenant.id);
        acc.pixel.used += usage.pixel.used;
        acc.pixel.limit += usage.pixel.limit;
        acc.maya.used += usage.maya.used;
        acc.maya.limit += usage.maya.limit;
        acc.echo.used += usage.echo.used;
        acc.kai.used += usage.kai.used;
        acc.kai.limit += usage.kai.limit;
        return acc;
      },
      {
        pixel: { used: 0, limit: 0 },
        maya: { used: 0, limit: 0 },
        echo: { used: 0, limit: -1 },
        kai: { used: 0, limit: 0 },
      }
    );
    return [200, { data: totals }];
  });

  // GET /v1/admin/activity-logs?tenant_id=&type=
  mock.onGet("/v1/admin/activity-logs").reply((config) => {
    const params = config.params || {};
    let logs = [...mockActivityLogs];
    if (params.tenant_id) logs = logs.filter((l) => l.tenant_id === params.tenant_id);
    if (params.type) logs = logs.filter((l) => l.type === params.type);
    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return [200, { data: logs }];
  });

  // GET /v1/admin/kai/requests
  mock.onGet("/v1/admin/kai/requests").reply(() => {
    return [200, { data: mockDeviceRequests }];
  });

  // POST /v1/admin/kai/:id/activate
  mock.onPost(/\/v1\/admin\/kai\/([^/]+)\/activate/).reply((config) => {
    const id = config.url?.split("/")[config.url.split("/").length - 2] || "";
    mockDeviceRequests = mockDeviceRequests.filter((d) => d.id !== id);
    return [200, { message: "Device activated" }];
  });

  // POST /v1/admin/kai/:id/reject
  mock.onPost(/\/v1\/admin\/kai\/([^/]+)\/reject/).reply((config) => {
    const id = config.url?.split("/")[config.url.split("/").length - 2] || "";
    mockDeviceRequests = mockDeviceRequests.filter((d) => d.id !== id);
    return [200, { message: "Device rejected" }];
  });

  // GET /v1/admin/config/limits
  mock.onGet("/v1/admin/config/limits").reply(() => {
    return [200, { data: mockLimits }];
  });

  // PUT /v1/admin/config/limits
  mock.onPut("/v1/admin/config/limits").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    mockLimits = { ...mockLimits, ...body };
    return [200, { data: mockLimits }];
  });

  // GET /v1/admin/config/credentials
  mock.onGet("/v1/admin/config/credentials").reply(() => {
    return [200, { data: mockCredentials }];
  });

  // PUT /v1/admin/config/credentials
  mock.onPut("/v1/admin/config/credentials").reply((config) => {
    const body = JSON.parse(config.data || "{}");
    if (body.meta_app_id) mockCredentials.meta_app_id = body.meta_app_id;
    if (body.meta_business_id) mockCredentials.meta_business_id = body.meta_business_id;
    if (body.tiktok_app_id) mockCredentials.tiktok_app_id = body.tiktok_app_id;
    if (body.meta_app_secret) {
      mockCredentials.meta_app_secret_masked = `••••${body.meta_app_secret.slice(-4)}`;
    }
    if (body.meta_system_user_token) {
      mockCredentials.meta_system_user_token_masked = `••••${body.meta_system_user_token.slice(-4)}`;
    }
    if (body.meta_webhook_verify_token) {
      mockCredentials.meta_webhook_verify_token_masked = `••••${body.meta_webhook_verify_token.slice(-4)}`;
    }
    if (body.tiktok_app_secret) {
      mockCredentials.tiktok_app_secret_masked = `••••${body.tiktok_app_secret.slice(-4)}`;
    }
    if (body.ai_image_api_key) {
      mockCredentials.ai_image_api_key_masked = `••••${body.ai_image_api_key.slice(-4)}`;
    }
    mockCredentials.updated_at = new Date().toISOString();
    return [200, { data: mockCredentials }];
  });

  // POST /v1/admin/meta/sync
  mock.onPost("/v1/admin/meta/sync").reply(() => {
    return [
      200,
      { data: { facebook_accounts: 1, instagram_accounts: 1, whatsapp_numbers: 1 } },
    ];
  });

  // Catch-all for unmatched routes
  mock.onAny().reply((config) => {
    console.warn(`[MOCK] Unhandled: ${config.method?.toUpperCase()} ${config.url}`);
    return [404, { message: "Endpoint not found in mock" }];
  });

  return mock;
}
