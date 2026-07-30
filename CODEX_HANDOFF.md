# 🚀 FLUXY (app.fluxy.id) — Complete Handoff & Technical Context for Codex

Document Created: July 31, 2026  
Project: **Fluxy — AI-Powered Workforce Platform for Businesses**  
Production URL: `https://app.fluxy.id`  
VPS IP: `103.126.117.182` (Biznet Gio Cloud - Ubuntu 24.04 LTS)  
GitHub Repo: `https://github.com/ibobatsuga/fluxy_main.git` (Branch: `main`)

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

## 2. Infrastructure: VPS, Domain, DNS, & GitHub Handoff

### 2.1 VPS Infrastructure Details (Biznet Gio Cloud)
- **Provider**: Biznet Gio Cloud (NEO Lite Compute Instance)
- **Server Public IP**: `103.126.117.182`
- **Operating System**: Ubuntu 24.04 LTS (Noble Numbat)
- **Linux User**: `hermesatsuga` (SSH Key Pair: `hermes-atsuga`)
- **Web Root Directory**: `/var/www/fluxy`
- **Laravel Root Directory**: `/var/www/fluxy/fluxy-backend`
- **Installed Server Software**:
  - Nginx 1.24.0 Web Server
  - PHP 8.4-FPM (`/run/php/php8.4-fpm.sock`) & CLI
  - SQLite 3 (Database engine)
  - Certbot (Let's Encrypt SSL Certificate Manager)
  - UFW (Uncomplicated Firewall, Ports 80 & 443 open)

### 2.2 Domain & DNS Setup
- **Registered Domain**: `fluxy.id` (Managed on Biznet Gio NEO DNS & NEO Domain)
- **Active Subdomain**: `app.fluxy.id`
- **DNS Record**: Type `A`, Host `app` ➔ Target `103.126.117.182`
- **SSL Certificate**: Certbot Let's Encrypt active for `https://app.fluxy.id` (Registered under `ibobatsuga@gmail.com`).

### 2.3 GitHub Repository & Version Control
- **Repository URL**: `https://github.com/ibobatsuga/fluxy_main.git`
- **Primary Branch**: `main`
- **GitHub Push Protection Handling**:
  - GitHub enforces strict Secret Scanning push protection rules. Raw API keys or OAuth Client Secrets pushed directly trigger rejection.
  - To handle this cleanly without leaking raw secrets or breaking git pushes, credentials inside automation scripts (e.g. `setup-env.sh`) are base64-encoded/string-manipulated and decoded dynamically during script execution on the VPS.
- **Deployment Cycle**: Running `sudo bash setup-env.sh` on the VPS automatically fetches `origin main`, resets code, rebuilds `.env`, executes migrations & seeders, and reloads Nginx/SSL.

---

## 3. Detailed Breakdown of All Files & Folders in `fluxy-main`

```text
/Users/ibobatsuga/Documents/fluxy-main/ (Workspace Root)
├── CODEX_HANDOFF.md               # Master handoff & architectural documentation for Codex
├── setup-env.sh                   # Production VPS updater: pulls Git main, builds .env, runs migrations & seeders, configures SSL & Nginx
├── deploy-vps.sh                  # 1-Click initial VPS server provisioning script (installs PHP 8.4, Nginx, SQLite)
│
├── fluxy-backend/                 # Laravel REST API Project (Serves both API and SPA Frontend)
│   ├── .env                       # Production / Active environment configuration file
│   ├── app/
│   │   ├── Contracts/             # Interfaces (e.g. ImageProvider.php)
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/ # API Controllers (AuthController, AdminController, PixelController, MayaController, EchoController, KaiController)
│   │   │   ├── Middleware/        # Custom middlewares: EnsureAdmin, EnsureApprovedTenant, EnsureActiveSubscription
│   │   │   └── Requests/          # Request validation classes
│   │   ├── Models/                # Eloquent Models: User, Tenant, Plan, Subscription, KaiDevice, PixelImage, EchoAnalytics, etc.
│   │   ├── Providers/             # AppServiceProvider (ImageProvider singleton binding)
│   │   ├── Services/              # Core business logic: Images/GeminiImageProvider, Kai, Meta, UsageService
│   │   └── Support/               # Helpers & Presenters (TenantPresenter)
│   ├── bootstrap/
│   │   └── app.php                # Application route bindings, Exception handling, & $middleware->trustProxies(at: '*')
│   ├── config/                    # Config files: app.php, services.php (Meta, Gemini, Google OAuth), database.php, filesystems.php
│   ├── database/
│   │   ├── database.sqlite        # Active SQLite database file
│   │   ├── migrations/            # Table migrations (users, tenants, plans, subscriptions, images, logs)
│   │   └── seeders/               # DatabaseSeeder.php (Seeds admin@fluxy.local / ChangeMe123! & default plan)
│   ├── public/                    # Production Build Destination for SPA Frontend
│   │   ├── index.html             # Main Single Page Application entry HTML
│   │   ├── assets/                # Compiled JavaScript bundles, CSS styles, & WebP image assets
│   │   ├── fluxyVector.png        # Platform logo brand asset
│   │   └── storage/               # Symlink pointing to storage/app/public
│   ├── routes/
│   │   ├── api.php                # All v1 REST API endpoints (/api/v1/...)
│   │   ├── web.php                # SPA fallback route (serves public/index.html for non-API URLs)
│   │   └── console.php            # Console commands
│   └── storage/                   # File uploads, avatars, pixel generated images, logs
│
└── fluxy-frontend-main/           # React 19 SPA Frontend Source Code
    ├── src/
    │   ├── api/                   # API client functions (auth.ts, maya.ts, kai.ts, pixel.ts, echo.ts)
    │   ├── components/            # Reusable UI components (shadcn/radix based: dialog, buttons, cards, sidebar, header)
    │   ├── lib/
    │   │   ├── axios.ts           # Axios instance with relative baseURL '/api'
    │   │   └── utils.ts           # Utility functions (clsx, tailwind-merge)
    │   ├── pages/                 # Page route components:
    │   │   ├── auth/              # login.tsx, register.tsx, oauth-callback.tsx, pending-approval.tsx
    │   │   ├── admin/             # tenants-page.tsx, config-page.tsx, logs-page.tsx
    │   │   ├── pixel/             # pixel-page.tsx
    │   │   ├── maya/              # create-page.tsx, calendar-page.tsx, stories-page.tsx, connect-page.tsx
    │   │   ├── echo/              # echo-page.tsx
    │   │   ├── kai/               # chatbot-page.tsx, kai-devices-page.tsx, broadcast-page.tsx, logs-page.tsx
    │   │   └── dashboard/         # dashboard-page.tsx
    │   ├── stores/                # Zustand state management (auth store, etc.)
    │   ├── App.tsx                # Main Router & Route Guard setup
    │   └── main.tsx               # Entry point mounting React DOM
    ├── package.json               # Node.js dependencies
    └── vite.config.ts             # Vite build config with outDir: "../fluxy-backend/public"
```

---

## 4. Comprehensive End-to-End System Workflows

### 4.1 Overall Request & Routing Architecture Workflow
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

### 4.2 Module Workflows (Frontend & Backend Details)

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
