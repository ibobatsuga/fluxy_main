# 🚀 FLUXY (app.fluxy.id) — Complete Handoff & Technical Context for Codex

Document Created: July 31, 2026  
Project: **Fluxy — AI-Powered Workforce Platform for Businesses**  
Production URL: `https://app.fluxy.id`  
VPS IP: `103.126.117.182` (Biznet Gio Cloud - Ubuntu 24.04 LTS)

---

## 1. Executive Summary & Architecture Overview

Fluxy is a multi-tenant SaaS platform that provides AI employees for online businesses and e-commerce stores:
- **Pixel**: AI Product Image Designer (powered by Google Gemini API).
- **Maya**: Social Media Content Creator & Schedule Manager for Instagram & TikTok (powered by Meta Graph API).
- **Echo**: Social Media Performance Analytics & Growth Reporting.
- **Kai**: WhatsApp & Chatbot Sales & Customer Service AI Assistant with live handover.
- **Admin**: Multi-tenant management, user verification/approval, resource limit quotas, and global credential management.

### Tech Stack:
- **Backend**: Laravel 11 / 12 (PHP 8.4-FPM, SQLite database, Sanctum authentication, Socialite for Google OAuth).
- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router v7 + Lucide React + Recharts + Zustand.
- **Production Delivery**: The frontend is built directly into `fluxy-backend/public` so Nginx serves both the static React Single Page Application (SPA) and the Laravel REST API from a unified domain (`https://app.fluxy.id`).
- **Web Server & SSL**: Nginx + Certbot Let's Encrypt SSL + UFW Firewall.

---

## 2. Directory Structure & Key Paths

```text
/Users/ibobatsuga/Documents/fluxy-main/ (Local Workspace)
├── deploy-vps.sh                  # 1-Click initial VPS provisioning script
├── setup-env.sh                   # Automatic code updater, .env builder, migration, & SSL setup script
├── fluxy-backend/                 # Laravel REST API project
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/  # AuthController, AdminController, KaiController, MayaController, etc.
│   │   ├── Http/Middleware/          # EnsureAdmin, EnsureApprovedTenant, EnsureActiveSubscription
│   │   ├── Models/                   # User, Tenant, Plan, Subscription, KaiDevice, etc.
│   │   └── Services/                 # Images/GeminiImageProvider, Kai, Meta, UsageService
│   ├── bootstrap/app.php          # Route bindings & TrustProxies config ($middleware->trustProxies(at: '*'))
│   ├── config/                    # app.php, services.php, database.php, filesystems.php
│   ├── database/                  # database.sqlite, migrations/, seeders/DatabaseSeeder.php
│   ├── public/                    # Compiled SPA static assets (index.html, /assets/*)
│   └── routes/                    # api.php (REST API endpoints), web.php (SPA fallback)
└── fluxy-frontend-main/           # React 19 Frontend source code
    ├── src/
    │   ├── api/                   # API client functions (auth.ts, maya.ts, kai.ts, etc.)
    │   ├── components/            # UI components (shadcn/radix based)
    │   ├── lib/axios.ts           # Axios instance configured with relative baseURL '/api'
    │   ├── pages/                 # React router page components (login, register, dashboard, admin, etc.)
    │   └── stores/                # Zustand state management (auth store, etc.)
    ├── package.json
    └── vite.config.ts             # Configured with outDir: "../fluxy-backend/public"
```

---

## 3. Comprehensive End-to-End System Workflows

### 3.1 Overall Request & Routing Architecture Workflow
```
[User Browser] 
       │
       ├─► (HTTPS / Port 443) ──► [Nginx Web Server]
       │                               │
       │                               ├─► Static SPA Pages (/login, /dashboard, /pixel, etc.)
       │                               │   └─► Serves /var/www/fluxy/fluxy-backend/public/index.html
       │                               │       (via routes/web.php SPA fallback)
       │                               │
       │                               └─► API Calls (/api/v1/...)
       │                                   └─► FastCGI Pass to php8.4-fpm.sock
       │                                       └─► Laravel Router (routes/api.php)
       │                                           └─► Middlewares -> Controllers -> Services/DB
```

---

### 3.2 Module Workflows (Frontend & Backend Details)

#### A. Authentication & Authorization Module (Auth)
- **Frontend Files**: `src/pages/auth/login.tsx`, `register.tsx`, `oauth-callback.tsx`, `src/stores/auth.ts`
- **Backend Files**: `app/Http/Controllers/Api/V1/AuthController.php`, `config/services.php`
- **Detailed Workflow**:
  1. **Email Register / Login**:
     - User submits credentials on `/login` or `/register`.
     - Frontend sends `POST /api/v1/auth/login` or `POST /api/v1/auth/register`.
     - Backend verifies credentials, creates Sanctum bearer token, and returns user & tenant profile.
  2. **Google OAuth 2.0 Flow**:
     - User clicks "Masuk dengan Google".
     - Frontend redirects browser to `/api/v1/auth/google/redirect`.
     - Laravel Socialite generates state & redirects to Google OAuth consent URL (`https://accounts.google.com/...`).
     - Google redirects back to `https://app.fluxy.id/api/v1/auth/google/callback?code=...`.
     - `AuthController::googleCallback()` receives code, fetches Google user info.
     - **Owner Logic**: If Google email is `ibobatsuga@gmail.com`, Laravel sets `is_admin = true` and tenant status `active`. Other users receive `is_admin = false` and tenant status `pending`.
     - Backend redirects browser to `https://app.fluxy.id/auth/callback?token=<sanctum_token>`.
     - `oauth-callback.tsx` receives token, saves it into Zustand store (`setToken`), calls `fetchUser()`, and routes:
       - If `is_admin = true` or tenant `status = active` ➔ Navigates to `/dashboard`.
       - If tenant `status = pending` ➔ Navigates to `/pending-approval`.

---

#### B. Pixel Module (AI Product Image Designer)
- **Frontend Files**: `src/pages/pixel/pixel-page.tsx`, `src/components/pixel/image-uploader.tsx`, `src/api/pixel.ts`
- **Backend Files**: `app/Http/Controllers/Api/V1/PixelController.php`, `app/Services/Images/GeminiImageProvider.php`
- **Detailed Workflow**:
  1. User uploads a product image (or inputs a public Google Drive image link) and selects ratio (1:1, 4:5, 16:9, 9:16), lighting, background, and style.
  2. Frontend sends `POST /api/v1/pixel/generate` with multipart image or link.
  3. `PixelController` calls `UsageService` to check tenant quota limits.
  4. Controller dispatches generation request to `GeminiImageProvider`.
  5. `GeminiImageProvider` converts input image to base64, builds tailored prompt, and calls Google Gemini API (`GEMINI_API_KEY`, model `gemini-flash-latest`).
  6. Generated image blob is saved to `/var/www/fluxy/fluxy-backend/storage/app/public/pixel/` and logged in `pixel_images` database table.
  7. Public image URL (`https://app.fluxy.id/storage/pixel/...`) is returned to React frontend gallery.

---

#### C. Maya Module (Social Media Content Creator & Calendar Scheduler)
- **Frontend Files**: `src/pages/maya/create-page.tsx`, `calendar-page.tsx`, `stories-page.tsx`, `connect-page.tsx`
- **Backend Files**: `app/Http/Controllers/Api/V1/MayaController.php`, `app/Services/Meta/MetaService.php`
- **Detailed Workflow**:
  1. **Account Integration**: User connects Instagram Business or Facebook Page via Meta Graph API (`META_APP_ID`, `META_SYSTEM_USER_TOKEN`).
  2. **Post Creation & AI Caption**: User inputs topic, selects platform, and attaches media.
  3. **Scheduling**: `POST /api/v1/maya/posts` saves post record with `scheduled` status.
  4. **Publishing**: `MetaService` triggers publish via Meta Graph API `/v24.0/{ig_user_id}/media` container creation & `/media_publish`.
  5. **Bulk Stories Scheduler**: User uploads multiple Google Drive media links with slot per day rule; system auto-creates story publication queue.

---

#### D. Echo Module (Social Media Analytics & Growth Reporting)
- **Frontend Files**: `src/pages/echo/echo-page.tsx`, `src/components/echo/trend-chart.tsx`
- **Backend Files**: `app/Http/Controllers/Api/V1/EchoController.php`, `app/Services/Meta/MetaService.php`
- **Detailed Workflow**:
  1. `GET /api/v1/analytics?platform=all&from=YYYY-MM-DD&to=YYYY-MM-DD` fetches aggregate reach, engagement, followers growth %, and daily timeseries metrics.
  2. `GET /api/v1/analytics/contents` ranks top posts by reach, likes, comments, shares, views.
  3. `POST /api/v1/analytics/export` generates PDF / XLSX summary reports.

---

#### E. Kai Module (WhatsApp & Sales Chatbot Assistant)
- **Frontend Files**: `src/pages/kai/chatbot-page.tsx`, `kai-devices-page.tsx`, `broadcast-page.tsx`, `logs-page.tsx`
- **Backend Files**: `app/Http/Controllers/Api/V1/KaiController.php`, `app/Models/KaiDevice.php`, `KaiMessage.php`
- **Detailed Workflow**:
  1. **Device Pairing**: QR code device activation request (`POST /api/v1/kai/devices/request`).
  2. **Inventory Catalog Ingestion**: Imports product CSV / Google Sheet for inventory, pricing, and stock querying.
  3. **Auto-Response & Handover**: When customer inquiry matches payment/checkout keywords, chatbot notifies human admin (`admin_wa_number`) and logs handover record.
  4. **Broadcast Campaigns**: `POST /api/v1/kai/broadcast` dispatches bulk broadcast messages to targeted contact groups.

---

#### F. Admin Module (Multi-Tenant Management & Approval)
- **Frontend Files**: `src/pages/admin/tenants-page.tsx`, `config-page.tsx`, `logs-page.tsx`
- **Backend Files**: `app/Http/Controllers/Api/V1/AdminController.php`, `app/Http/Middleware/EnsureAdmin.php`
- **Detailed Workflow**:
  1. Superadmin (`ibobatsuga@gmail.com` or `admin@fluxy.local`) opens `https://app.fluxy.id/admin/tenants`.
  2. `GET /api/v1/users` lists all registered tenant businesses with usage stats and pending/active statuses.
  3. **Approve Action**: `POST /api/v1/users/{user}/approve` updates tenant status to `active` and sets `approved_at = now()`. The tenant user can now access the full dashboard.
  4. **Reject / Suspend Action**: `POST /api/v1/users/{user}/reject` or `suspend` disables tenant access.
  5. **Limit Configuration**: `PUT /api/v1/config/limits` updates resource limits per module.

---

## 4. Production Environment & Credentials Setup

The production server uses `/var/www/fluxy/fluxy-backend/.env` with the following configuration:

```env
APP_NAME=Fluxy
APP_ENV=production
APP_KEY=base64:4T4M7k8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6=
APP_DEBUG=false
APP_URL=https://app.fluxy.id

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/fluxy/fluxy-backend/database/database.sqlite

# Meta Graph API Credentials
META_GRAPH_URL=https://graph.facebook.com
META_GRAPH_VERSION=v24.0
META_APP_ID=2739900363078048
META_APP_SECRET=d31d6808c851d7eb79bd77dc3754dcd7
META_BUSINESS_ID=2825418767693278
META_SYSTEM_USER_TOKEN=EAAm77MPceaABSNZ...
META_WEBHOOK_VERIFY_TOKEN=fluxy_wh_7k2xQm9vR4pL

# Gemini AI Provider for Pixel
GEMINI_API_KEY=AQ.Ab8RN6IE2Nkal...
GEMINI_MODEL=gemini-flash-latest
PIXEL_IMAGE_PROVIDER=gemini

# Google OAuth Credentials
GOOGLE_CLIENT_ID=489606815165-***.apps.googleusercontent.com (Managed via setup-env.sh)
GOOGLE_CLIENT_SECRET=GOCSPX-*** (Managed via setup-env.sh)
GOOGLE_REDIRECT_URI=https://app.fluxy.id/api/v1/auth/google/callback
FRONTEND_URL=https://app.fluxy.id
```

---

## 5. Build, Deployment, & Automated Operations

### Local Development / Frontend Build
To compile the frontend SPA assets directly into Laravel's public directory:
```bash
npm --prefix fluxy-frontend-main run build
```

### Deploying & Updating VPS (`app.fluxy.id`)
On the VPS (`103.126.117.182`), run the automated deployment script:
```bash
cd /var/www/fluxy && sudo bash setup-env.sh
```

What `setup-env.sh` automatically performs:
1. Configures `safe.directory` and pulls latest code from `origin main`.
2. Generates the production `.env` file with base64-decoded credentials.
3. Sets up directory structure and initial database permissions (`www-data:www-data 775`).
4. Runs `php artisan config:clear`, `cache:clear`, `migrate --force`, and `db:seed --force`.
5. Ensures symbolic link `php artisan storage:link`.
6. Installs Certbot and generates Let's Encrypt SSL for `app.fluxy.id`.
7. Reconfigures Nginx webserver and reloads services.

---

## 6. Known Edge Cases & Critical Engineering Rules for Codex

When editing or extending the codebase, strictly adhere to these rules:

1. **Relative API Base URL**:
   - Frontend API client in `fluxy-frontend-main/src/lib/axios.ts` must use relative baseURL: `import.meta.env.VITE_API_BASE_URL || "/api"`.
   - Do NOT hardcode `http://localhost:8000` or temporary tunnel URLs in frontend components or API handlers.

2. **Trusted Proxies & SSL Enforcement**:
   - `fluxy-backend/bootstrap/app.php` has `$middleware->trustProxies(at: '*')`. Always maintain this so Laravel properly handles HTTPS behind Nginx.

3. **SQLite & Storage Permissions**:
   - Always run `sudo chown -R www-data:www-data /var/www/fluxy` after file modifications on VPS so PHP-FPM never encounters `SQLite Read-Only` database lock errors.

4. **No External PaaS Dependencies**:
   - The platform must run 100% self-contained on Ubuntu VPS (SQLite DB, Local Storage, Nginx, Certbot). Do not introduce dependencies on external PaaS platforms like Render, Railway, Koyeb, or Vercel.

---

## 7. Immediate Next Tasks for Codex

1. **Module Inspection & Verification**: Test and verify all API endpoints for Maya (stories, calendar), Kai (chatbot, WA handover), Pixel (Gemini image generation), and Echo (analytics).
2. **Webhooks Verification**: Confirm Meta webhook callback handler at `POST /api/v1/meta/webhook` verifies token `fluxy_wh_7k2xQm9vR4pL` cleanly.
3. **Frontend UI Polish**: Ensure all forms, dialogs, and table pagination handle empty/error states gracefully.
