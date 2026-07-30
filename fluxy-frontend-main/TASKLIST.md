# Fluxy Frontend — Task List

> Ditinjau ulang berdasarkan `Fluxy_PRD_v1.md`, `design_v2.md`, dan kondisi kode aktual di branch `andreaskk` (bukan asumsi — sudah dicek file-by-file). Versi sebelumnya dari file ini sudah usang (menandai Maya 0% padahal sudah selesai dibangun). Scope: **frontend only** (SPA React), sesuai permintaan — Phase 0 (backend) dibiarkan sebagai catatan histori/handoff, bukan pekerjaan aktif di task list ini.
>
> Format: `- [ ]` = belum dikerjakan, `- [x]` = sudah selesai, `- [~]` = ada scaffolding (types/route/mock) tapi UI belum dibangun.

---

## Konvensi Modul (ikuti pola Pixel & Maya untuk semua modul baru)

Setiap modul terdiri dari 5 lapisan yang konsisten di seluruh codebase saat ini:

1. `src/api/<modul>.ts` — client Axios + tipe request/response.
2. `src/hooks/use-<modul>.ts` — React Query (`useQuery`/`useMutation`) di atas layer API.
3. `src/components/<modul>/*.tsx` — komponen presentational.
4. `src/pages/<modul>/*.tsx` — halaman yang dirender via route di `App.tsx`.
5. `src/lib/mock/setup.ts` + `data.ts` — handler `axios-mock-adapter` supaya modul bisa didemokan tanpa backend nyata.

Types untuk Echo & Kai **sudah lengkap** di `src/types/index.ts` (`AnalyticsOverview`, `AnalyticsDaily`, `KaiDevice`, `KaiGroup`, `KaiBroadcast`, `KaiChatbotSettings`, `KaiConversation`, `KaiConversationMessage`, `KaiLog`, `UsageSummary`) — tidak perlu didesain ulang, tinggal dipakai. Mock endpoint untuk Echo/Kai/Admin **sudah ada stub-nya** di `mock/setup.ts` tapi hampir semua mengembalikan data kosong (`{ data: [] }` / `{ data: null }`) — perlu diisi data realistis begitu UI-nya dibangun.

Status warna konsisten di seluruh app (`design_v2.md` §3.2): **Scheduled = biru, Published/Completed = hijau, Failed = merah** — pakai varian `Badge` yang sudah ada.

---

## Phase 0: Backend Adjustments (di luar scope task ini — referensi saja)

Item-item ini butuh kerja di sisi Laravel, dicatat di sini hanya supaya tidak hilang dari radar saat handoff ke backend. Tidak dikerjakan sebagai bagian dari task frontend ini.

- [ ] GAP 1: Registration fields (`business_name`, `industry_category`) di `users` table
- [ ] GAP 2: Subscription management fields + admin endpoints + middleware `CheckSubscriptionStatus`
- [ ] GAP 3: Usage limits (`usage_logs` table, `UsageLimitService`, limit check di tiap controller)
- [ ] GAP 4: Business profile table (opsional)
- [ ] GAP 5: Notification system backend (opsional)

---

## Phase 1: Project Setup & Authentication ✅ (100%)

- [x] Vite + React + TS, Tailwind v4, shadcn/ui, React Router, Zustand, TanStack Query, Axios
- [x] Axios instance + interceptors (auth, 401/403)
- [x] Types dasar (`User`, `SocialAccount`, `KaiDevice`, dst.) di `types/index.ts`
- [x] Zustand stores: `auth.ts`, `sidebar.ts`, `theme.ts`
- [x] Auth API (`api/auth.ts`) + Admin API dasar (`api/admin.ts`)
- [x] Pages: `login.tsx`, `register.tsx`, `pending-approval.tsx`, `oauth-callback.tsx`
- [x] Routing + `ProtectedRoute` (auth & admin guard)

## Phase 2: Layout & Dashboard ✅ (100%)

- [x] `Sidebar`/`MobileSidebar` (avatar per AI Employee, active state, collapse, admin section)
- [x] `Header` (breadcrumb, subscription badge, notification bell shell, user dropdown)
- [x] `api/dashboard.ts` + `hooks/use-dashboard.ts` (accounts, recent posts, Kai device status, analytics overview)
- [x] `DashboardPage`: subscription alert, grid 4 AI Employees, recent activity feed, usage summary cards (progress bar)

**Catatan gap tersisa di dashboard** — lihat Phase 9 (Cross-Cutting): usage cards masih hardcoded `used: 0`, belum konek ke data usage sungguhan.

## Phase 3: Pixel — AI Image Generator ✅ (100%)

Modul lengkap: `api/pixel.ts`, `hooks/use-pixel.ts`, `components/pixel/*` (`image-uploader`, `prompt-editor`, `gallery-grid`, `image-detail-modal`), `pages/pixel/pixel-page.tsx`, route `/pixel` aktif. Upload, aspect ratio (1:1/9:16), presets gaya, generate flow dengan polling, gallery dengan download/delete/regenerate — semua sudah jalan di atas mock API.

## Phase 3.5: Mock API Layer ✅ (100%)

`axios-mock-adapter` terpasang, `mock/data.ts` + `mock/setup.ts` menangani auth, Pixel, Maya, Kai (stub kosong), Analytics (stub), Admin (stub kosong), queue slots. Conditional load via `VITE_USE_MOCK` di `lib/axios.ts` + `main.tsx`.

## Phase 4: Maya — Social Media Publisher ✅ (100%) — *sebelumnya salah tercatat 0%, sudah selesai*

- [x] `pages/maya/connect-page.tsx` — hubungkan Instagram/TikTok, list akun terhubung, disconnect
- [x] `pages/maya/create-page.tsx` — media picker, caption editor, platform selector, schedule picker (post now / schedule)
- [x] `pages/maya/calendar-page.tsx` + `components/maya/calendar-grid.tsx` + `day-detail-modal.tsx` — kalender bulanan, status per tanggal, edit (`edit-post-modal.tsx`), cancel, retry
- [x] `pages/maya/stories-page.tsx` — bulk scheduler (Google Drive link, date range, slot per hari)
- [x] `components/maya/maya-nav.tsx` — sub-navigasi antar 4 halaman Maya
- [x] `api/maya.ts` + `hooks/use-maya.ts` lengkap (accounts, posts CRUD, retry, queue slots, story bulk schedule)
- [x] Route `/maya/*` semua aktif di `App.tsx`

---

## Phase 5: Echo — Analytics Dashboard ✅ (100%)

PRD §9.3, Design §3.2. Implemented and verified in-browser (login → `/echo`, light + dark mode, platform filter, PDF export toast — all screenshotted, no console errors).

### Setup
- [x] `src/api/echo.ts` — `getOverview`, `getContentPerformance`, `exportReport`
- [x] `src/hooks/use-echo.ts` — `useAnalyticsOverview`, `useContentPerformance`, `useExportReport`
- [x] Installed `recharts` as chart library

### Dashboard Layout (`pages/echo/echo-page.tsx`)
- [x] Header dengan avatar Echo
- [x] Filter bar (`components/echo/analytics-filters.tsx`): date range + platform selector (IG/TikTok/All)
- [x] KPI cards (`components/echo/kpi-card.tsx`): Total Reach, Total Engagement, Followers + growth, Engagement Rate

### Charts
- [x] `components/echo/trend-chart.tsx` — Reach & Engagement rendered as two single-series area charts (small multiples) rather than one dual-axis chart, per dataviz "never dual-axis" rule since the two metrics have very different scales. Colors validated with the dataviz skill's palette checker for both light and dark surfaces (`#3b82f6` reach / `#db2777` engagement).
- [ ] Bar chart: top performing posts — skipped for MVP, table below already ranks by any column

### Content Performance Table
- [x] `components/echo/content-performance-table.tsx` — sortable, platform badges, thumbnails
- [x] Empty state → arahkan ke `/maya/connect`

### Export
- [x] Tombol "Export ke PDF" / "Export ke Excel" — implemented calling a backend export endpoint (per the recommended default), mock returns `{ file_name, url }` and shows a toast; no client-side PDF/xlsx generation library added.

### Mock & Route
- [x] `mock/setup.ts` + `data.ts`: `GET /v1/analytics` now honors `platform`/`from`/`to`, added `GET /v1/analytics/contents` and `POST /v1/analytics/export`, added `mockContentPerformance`.
- [x] Route `/echo` di `App.tsx` sekarang render `EchoPage`.

### Build
- [x] `npm run build` succeeds
- [x] Verified in a real browser via Playwright (login flow, filter interaction, light/dark mode, export toast) — no console errors

---

## Phase 6: Kai — Sales Development Representative ✅ (100%)

PRD §9.4, Design §3.4. Implemented and verified in-browser (login → all 4 sub-pages, broadcast send, group-add dialog, conversation resume flow — all screenshotted, no console errors).

### Setup
- [x] `src/api/kai.ts` — device status/request, groups CRUD, broadcast CRUD + cancel/retry, chatbot settings + CSV sync, conversations + resume, logs
- [x] `src/hooks/use-kai.ts` — query/mutation hooks for all of the above
- [x] `src/components/kai/kai-nav.tsx` — sub-navigation (Setup, Broadcast, Chatbot, Logs)

### 6.1 Setup / Koneksi WABA (`pages/kai/setup-page.tsx`)
- [x] `components/kai/device-status-card.tsx` — shows `KaiDevice` status (connected/pending/disconnected/rejected)
- [x] Device connection flow implemented as a **request-then-admin-activates** form (wa_number + business_name → `POST /v1/kai/device/request`, status `pending`) rather than an OAuth-style redirect. This matches `adminApi.activateDevice` which already existed in `api/admin.ts` before this phase — WABA connection needs Admin Fluxy approval just like tenant registration, per PRD §7.1/§10.1. Admin-side activation UI is still Phase 7 work.
- [x] `components/kai/csv-manager.tsx` — CSV URL input + sync button, shows `csv_last_synced`/`csv_sync_status`
- [x] `components/kai/group-manager.tsx` — list, add (dialog), delete `KaiGroup`

### 6.2 Broadcast (`pages/kai/broadcast-page.tsx`)
- [x] `components/kai/broadcast-composer.tsx` — multi-select groups (checkbox), message, optional image URL, send
- [x] `components/kai/broadcast-history-table.tsx` — `KaiBroadcast` list with status badges, retry (failed) / cancel (scheduled) actions
- [x] Empty state when no groups exist yet → links to `/kai/setup`

### 6.3 Chatbot (`pages/kai/chatbot-page.tsx`)
- [x] `components/kai/chatbot-settings-panel.tsx` — active toggle, greeting message, payment keywords, admin WA number, handoff notify message
- [x] `components/kai/conversation-list.tsx` + `components/kai/conversation-thread.tsx` — WhatsApp-style inbox, state badges (Bot Aktif/Perlu Respon/Dijeda), chat bubbles with Kai avatar on bot messages, distinct color for admin-sent messages
- [x] **Human handover alert** — yellow banner on the thread when `state === "waiting_admin"`, and the conversation auto-selects on page load if one exists. Verified visually.
- [x] Resume button — verified: clicking it clears the alert, flips the badge to "Bot Aktif", and fires a success toast

### 6.4 Logs (`pages/kai/logs-page.tsx`)
- [x] `components/kai/logs-table.tsx` — `KaiLog` table with type/status filters

### Mock & Route
- [x] `mock/data.ts`: added `mockKaiGroups`, `mockKaiBroadcasts`, `mockKaiChatbotSettings`, `mockKaiConversations` (includes one `state: "waiting_admin"` conversation), `mockKaiLogs`
- [x] `mock/setup.ts`: full CRUD handlers for all Kai endpoints, replacing the empty stubs
- [x] All Kai routes in `App.tsx` now render real pages; `/kai` redirects to `/kai/setup`

### Build
- [x] `npm run build` succeeds
- [x] Verified in a real browser via Playwright across all 4 sub-pages plus interactions (send broadcast, open add-group dialog, resume a handed-off conversation) — no console errors

---

## Phase 7: Admin Fluxy Panel ✅ (100%, minus one explicitly-deferred sub-item)

PRD §10 & §15.2, Design §4. Implemented and verified in-browser (login as admin → all 3 pages, approve/reject/suspend a tenant, view tenant detail, activate a Kai device — all screenshotted, no console errors).

### Tenant Management (`pages/admin/tenants-page.tsx`)
- [x] `components/admin/tenant-table.tsx` — search + status filter, badge (pending/active/expired/suspended), status-aware row actions
- [x] `adminApi.listTenants()` → `GET /v1/admin/users`, added to `api/admin.ts`
- [x] `components/admin/tenant-detail-sheet.tsx` — business info, subscription history, per-employee usage bars (reuses `Sheet`, not a full page)
- [x] `components/admin/approve-tenant-modal.tsx` — date pickers default to today → +30 days, also reused for "Aktifkan/Perpanjang" on expired/never-activated tenants
- [x] `components/admin/reject-tenant-modal.tsx` — required reason textarea; mock removes the tenant from the pending queue (matches Design §4's 4-status table, which has no "Rejected" state to display)
- [x] Suspend / Reaktivasi — `adminApi.suspendTenant`/`reactivateTenant`, wired directly into table row actions. Reactivating a tenant whose subscription already lapsed also pushes the end date forward 30 days from now (otherwise the status would immediately re-derive as "Expired")

### Monitoring
- [x] `components/admin/usage-overview.tsx` — per-employee aggregate cards + a single-series bar chart (Pixel/Maya/Echo/Kai totals). Folded into the top of the Tenants page rather than a separate route, since no dedicated Monitoring route exists in `App.tsx`
- [x] `components/admin/activity-log-table.tsx` — cross-tenant activity feed (approval/reject/suspend/reactivate/limit_change/usage), also at the bottom of the Tenants page

### Konfigurasi (`pages/admin/config-page.tsx`)
- [x] `components/admin/limits-form.tsx` — Pixel/Maya/Kai default limits (Echo intentionally excluded, it's unlimited per PRD §11)
- [x] `components/admin/credentials-form.tsx` — Meta App ID/Secret, TikTok App ID/Secret, AI Image API key. Secrets always render masked (`••••xxxx`); the input below is a blank "type here to replace" field, never pre-filled with the real value, and empty fields are excluded from the save payload so unrelated credentials aren't accidentally cleared

### Kai Devices Admin (`pages/admin/kai-devices-page.tsx`)
- [x] `components/admin/pending-devices-table.tsx` — uses the now-properly-typed `getPendingDevices(): KaiDevice[]` (was `unknown[]`)
- [x] `components/admin/activate-device-modal.tsx` — `device_key` + `api_key` → `adminApi.activateDevice`
- [x] Reject device — inline button, no modal needed (no reason field in the existing `rejectDevice` endpoint)
- [ ] Tracking status Business Verification Meta & App Audit TikTok per tenant (PRD fungsi #51) — **still deferred**, exactly as flagged: needs a product decision on the data schema before it can be built, not something to guess at

### Layer teknis
- [x] `api/admin.ts` fully expanded: `listTenants`, `getTenantDetail`, `getTenantUsage`, `suspendTenant`, `reactivateTenant`, `getAggregateUsage`, `getActivityLogs`, `getPlatformCredentials`, `updatePlatformCredentials`, `getDefaultLimits`, `updateDefaultLimits`
- [x] `src/hooks/use-admin.ts` — full query/mutation set
- [x] New types added to `types/index.ts`: `DefaultLimits`, `PlatformCredentials`, `AdminActivityLog`
- [x] `mock/data.ts`: `mockTenants` (6 tenants covering pending/active/expired/suspended), `mockAdminActivityLogs`, `mockPlatformCredentials`, `mockDefaultLimits`, `mockKaiDeviceRequests`
- [x] `mock/setup.ts`: full CRUD handlers replacing the two empty stubs — tenant approve/reject/suspend/reactivate all update state and append an activity-log entry; per-tenant usage is deterministically derived from the tenant id so numbers stay stable across refetches instead of jumping around randomly
- [x] All 3 `PlaceholderPage` admin routes in `App.tsx` replaced (and `PlaceholderPage` itself removed — nothing references it anymore)
- [~] Multi-role mock testing (toggle between tenant and admin view) — not built; `mockUser` is still the single hardcoded admin account. Not blocking since admin routes were fully reachable and testable as-is, but worth revisiting if tenant-side testing under `VITE_USE_MOCK` becomes a priority

### Build
- [x] `npm run build` succeeds
- [x] Verified in a real browser via Playwright: approve → tenant moves Pending→Active with a dated activity log entry; reject → tenant removed from the table with a logged reason; suspend → Active→Suspended with row actions updating live; tenant detail sheet renders usage bars; Kai device activation removes the request from the pending list. No console errors in any state.

---

## Phase 8: Settings / Billing (Tenant) ✅ (100%)

- [x] Route `/settings` + `pages/settings/settings-page.tsx`
- [x] Section Profil: nama, email, business name, industry category, timezone
- [x] Section Subscription/Billing: status, tanggal aktif/expired, arahan kontak admin
- [x] Section Usage limit per AI Employee (progress bar detail)
- [x] Section Akun terhubung: ringkasan IG/TikTok (dari Maya) + WABA (dari Kai), link cepat
- [x] Update link "Pengaturan" di `header.tsx` agar mengarah ke `/settings`

### Build
- [x] Verify `npm run build` succeeds

---

## Phase 9: Perbaikan Lintas Modul (Cross-Cutting) ✅ (100%)

- [x] **Usage summary real**: `api/usage.ts` + hook `useUsageSummary()` dihubungkan ke Dashboard, Settings, dan Admin tenant detail.
- [x] **Notification bell real**: dropdown di `header.tsx` terhubung ke API real/mock dengan indikator tipe notifikasi, navigasi interaktif per item, badge unread count, dan fungsi tandai dibaca.
- [x] **Subscription gate enforcement**: Komponen `SubscriptionGateBanner` di `app-layout.tsx` dan `SubscriptionGateGuard` untuk proteksi tombol aksi saat status langganan non-aktif.
- [x] **Onboarding empty state**: Welcome Banner untuk tenant baru di Dashboard dengan quick links ke Pixel & Maya.

### Build
- [x] Verify `npm run build` succeeds

---

## Phase 10: Polish & Optimization ✅ (100%)

### Performance & Code Splitting
- [x] Code splitting (lazy load routes) di `App.tsx` untuk semua protected pages (`React.lazy` + `Suspense`).
- [x] Responsive layout audit untuk seluruh modul (Pixel, Maya, Echo, Kai, Settings, Admin).

### UX Polish & Verification
- [x] Full `npm run build` test (0 TypeScript error).
- [x] Integration test suite backend Laravel (`php artisan test` - 19/19 passed).

---

## Summary Progress

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 0: Backend Adjustments | Di luar scope (referensi) | — |
| Phase 1: Project Setup & Auth | ✅ Done | 100% |
| Phase 2: Layout & Dashboard | ✅ Done | 100% |
| Phase 3: Pixel — AI Designer | ✅ Done | 100% |
| Phase 3.5: Mock API Layer | ✅ Done | 100% |
| Phase 4: Maya — Social Media | ✅ Done | 100% |
| Phase 5: Echo — Analytics | ✅ Done | 100% |
| Phase 6: Kai — Sales SDR | ✅ Done | 100% |
| Phase 7: Admin Panel | ✅ Done | 100% (Business Verification tracking deferred — needs product decision) |
| Phase 8: Settings/Billing | ✅ Done | 100% |
| Phase 9: Cross-Cutting Fixes | ✅ Done | 100% |
| Phase 10: Polish & Optimization | ✅ Done | 100% |

**Overall (frontend-only scope): 10/10 fase selesai (Auth, Layout/Dashboard, Pixel, Maya, Echo, Kai, Admin Panel, Settings/Billing, Cross-Cutting Fixes, Polish & Optimization) — 100% SIAP DAN LENGKAP.**

