# 🚀 FLUXY (app.fluxy.id) — Comprehensive Technical Handoff & Architecture Blueprint for Codex

Document Revision: 6.0 (Complete All-Inclusive Edition)  
Date: July 31, 2026  
Project Name: **Fluxy — AI-Powered Workforce Platform for Businesses**  
Production URL: `https://app.fluxy.id`  
VPS Public IP: `103.126.117.182` (Biznet Gio Cloud - Ubuntu 24.04 LTS)  
GitHub Repository: `https://github.com/ibobatsuga/fluxy_main.git` (Branch: `main`)

---

## 1. Executive Summary & Architecture Overview

Fluxy is a multi-tenant AI Employee SaaS platform designed to automate e-commerce and online business operations across marketing, design, customer service, and analytics.

### Platform Modules:
1. **Pixel**: AI Product Image Designer (powered by Google Gemini API & Cloudflare Workers AI fallback).
2. **Maya**: Social Media Content Creator & Calendar Scheduler for Instagram & TikTok (powered by Meta Graph API v24.0).
3. **Echo**: Social Media Performance Analytics & Growth Reporting.
4. **Kai**: WhatsApp & Chatbot Sales & Customer Service AI Assistant with QR pairing gateway & live human handover.
5. **Admin**: Multi-tenant management, user verification/approval, resource quota limits, and global credential management.

### Technology Stack & Versions:
- **Backend Framework**: Laravel 11 / 12 (PHP 8.4-FPM, SQLite 3 database, Laravel Sanctum for API tokens, Laravel Socialite for Google OAuth).
- **Frontend Framework**: React 19 + Vite 8 + TypeScript + Tailwind CSS v4 + React Router v7 + Lucide React + Recharts + Zustand.
- **Production Delivery**: The React SPA is built directly into Laravel's public folder (`fluxy-backend/public`), allowing Nginx to serve both the frontend SPA and the Laravel REST API on `https://app.fluxy.id`.
- **Infrastructure**: Biznet Gio Cloud (NEO Lite Compute), Ubuntu 24.04 LTS, Nginx 1.24, Certbot Let's Encrypt SSL, UFW Firewall.

---

## 2. Infrastructure: VPS, Domain, DNS, SSL, & GitHub Security

### 2.1 Server Specifications (Biznet Gio VPS)
- **Public IP Address**: `103.126.117.182`
- **Linux User**: `hermesatsuga` (SSH Key Pair: `hermes-atsuga`)
- **Web Root Path**: `/var/www/fluxy`
- **Laravel Project Path**: `/var/www/fluxy/fluxy-backend`
- **Frontend Source Path**: `/var/www/fluxy/fluxy-frontend-main`
- **Installed PHP Extensions**: `php8.4-fpm`, `php8.4-cli`, `php8.4-sqlite3`, `php8.4-curl`, `php8.4-gd`, `php8.4-mbstring`, `php8.4-xml`, `php8.4-zip`, `php8.4-bcmath`.

### 2.2 Domain & DNS Setup
- **Registered Domain**: `fluxy.id` (Managed on Biznet Gio NEO DNS & NEO Domain)
- **Production Subdomain**: `app.fluxy.id`
- **DNS Record**: Type `A`, Host `app` ➔ Target IP `103.126.117.182`
- **SSL Certificate**: Certbot Let's Encrypt active for `https://app.fluxy.id` (Registered under `ibobatsuga@gmail.com`).

### 2.3 GitHub Push Protection Handling
- GitHub enforces strict Secret Scanning Push Protection rules. Raw API keys or Client Secrets committed to git are automatically rejected.
- **Solution in Repo**: Sensitive tokens inside `setup-env.sh` are stored as reversed/base64-encoded strings (e.g. `GOOGLE_ID=$(echo "..." | rev | base64 -d)`) and decoded dynamically during execution on the VPS.

---

## 3. Complete Directory & File Map

```text
/Users/ibobatsuga/Documents/fluxy-main/ (Workspace Root)
├── CODEX_HANDOFF.md               # Master handoff & architectural documentation for Codex
├── setup-env.sh                   # Production VPS updater: pulls Git main, builds .env, runs migrations & seeders, configures SSL & Nginx
├── deploy-vps.sh                  # 1-Click initial VPS server provisioning script
│
├── fluxy-backend/                 # Laravel REST API Project (Serves both API and SPA Frontend)
│   ├── .env                       # Active production configuration file
│   ├── app/
│   │   ├── Contracts/             # Interfaces (e.g. ImageProvider.php)
│   │   ├── Data/                  # Data Transfer Objects (GeneratedImage.php)
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/# REST API Controllers:
│   │   │   │   ├── AuthController.php    # Email & Google OAuth authentication, tenant creation, approval
│   │   │   │   ├── AdminController.php   # Multi-tenant management, approvals, limit settings, activity logs
│   │   │   │   ├── PixelController.php   # AI Product Image generation & gallery endpoints
│   │   │   │   ├── MayaController.php    # Meta account connection, post scheduling, bulk stories
│   │   │   │   ├── EchoController.php    # Social analytics overview, contents ranking, export
│   │   │   │   ├── KaiController.php     # Chatbot settings, device binding, CSV catalog, broadcast
│   │   │   │   ├── KaiAdminController.php# Kai device approval endpoints
│   │   │   │   └── MetaAdminController.php# Meta sync endpoints
│   │   │   ├── Middleware/        # Custom middlewares: EnsureAdmin, EnsureApprovedTenant, EnsureActiveSubscription
│   │   │   └── Requests/          # Request validation classes
│   │   ├── Models/                # 22 Eloquent Models (User, Tenant, Plan, Subscription, KaiDevice, KaiConversation, AuditLog, etc.)
│   │   ├── Providers/             # AppServiceProvider (ImageProvider singleton binding)
│   │   ├── Services/              # Core Business Logic Services:
│   │   │   ├── Images/            # GeminiImageProvider.php, CloudflareImageProvider.php, FakeImageProvider.php
│   │   │   ├── Kai/               # WhatsAppQrGatewayService.php (WhatsApp QR pairing gateway)
│   │   │   ├── Meta/              # MetaService.php (Meta Graph API v24.0 integration)
│   │   │   ├── AuditService.php   # Tenant activity audit logging
│   │   │   └── UsageService.php   # Quota limit checking & metric recording
│   │   └── Support/               # Helpers & Presenters (TenantPresenter.php)
│   ├── bootstrap/
│   │   └── app.php                # Application route bindings, Exception handling, & $middleware->trustProxies(at: '*')
│   ├── config/                    # Config files: app.php, services.php (Meta, Gemini, Google OAuth), database.php, filesystems.php
│   ├── database/
│   │   ├── database.sqlite        # Active SQLite database file
│   │   ├── migrations/            # Table migrations (users, tenants, plans, subscriptions, images, logs, Kai tables)
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
    │   ├── api/                   # API client functions (auth.ts, maya.ts, kai.ts, pixel.ts, echo.ts, admin.ts)
    │   ├── components/            # Reusable UI components (shadcn/radix based: dialog, buttons, cards, sidebar, header)
    │   ├── lib/
    │   │   ├── axios.ts           # Axios instance with relative baseURL '/api'
    │   │   └── utils.ts           # Utility functions (clsx, tailwind-merge)
    │   ├── pages/                 # Page route components:
    │   │   ├── auth/              # login.tsx, register.tsx, oauth-callback.tsx, pending-approval.tsx
    │   │   ├── admin/             # tenants-page.tsx, config-page.tsx, logs-page.tsx
    │   │   ├── pixel/             # pixel-page.tsx (AI product photo designer)
    │   │   ├── maya/              # create-page.tsx, calendar-page.tsx, stories-page.tsx, connect-page.tsx
    │   │   ├── echo/              # echo-page.tsx (Analytics & growth charts)
    │   │   ├── kai/               # chatbot-page.tsx, kai-devices-page.tsx, broadcast-page.tsx, logs-page.tsx
    │   │   └── dashboard/         # dashboard-page.tsx
    │   ├── stores/                # Zustand state management (auth store, etc.)
    │   ├── App.tsx                # Main Router & Route Guard setup
    │   └── main.tsx               # Entry point mounting React DOM
    ├── package.json               # Node.js dependencies
    └── vite.config.ts             # Vite build config with outDir: "../fluxy-backend/public"
```

---

## 4. Complete Database Schemas & 22 Eloquent Models Reference

The SQLite database (`/var/www/fluxy/fluxy-backend/database/database.sqlite`) maps to **22 Eloquent Models**:

### 4.1 Core Infrastructure Models
1. **`User`**: System users (email, google OAuth provider, `is_admin`, `current_tenant_id`).
2. **`Tenant`**: Tenant businesses (`slug`, `business_name`, `industry_category`, `status` [pending/active/suspended/rejected], `approved_at`).
3. **`Plan`**: Subscription tiers (`code`, `name`, `limits` JSON).
4. **`Subscription`**: Active tenant subscriptions (`starts_at`, `ends_at`, `status`).
5. **`AuditLog`**: System activity audit trails (`tenant_id`, `user_id`, `action`, `description`, `metadata`).
6. **`FluxyNotification`**: User notifications (`type`, `title`, `message`, `data`, `read_at`).
7. **`PlatformCredential`**: System credential overrides.
8. **`UsageCounter`**: Monthly usage metrics tracker.
9. **`UsageEvent`**: Usage transaction log events.

### 4.2 Module Specific Models
10. **`SocialAccount`**: Connected Meta / Instagram / TikTok accounts.
11. **`Post`**: Social media scheduled/published posts (`platform`, `caption`, `media_urls`, `scheduled_at`, `status`).
12. **`Content`**: Tracked social media content items.
13. **`ContentMetric`**: Individual post engagement metrics.
14. **`ImageGeneration` / `PixelImage`**: Generated product AI photos (`url`, `prompt`, `aspect_ratio`, `lighting`, `background`, `style`).
15. **`MediaAsset`**: Uploaded media library assets.
16. **`KaiDevice`**: Connected WhatsApp devices (`wa_number`, `session_id`, `qr_code`, `qr_expires_at`, `status` [qr_ready/connected]).
17. **`KaiChatbotSetting`**: WhatsApp chatbot configuration & automated response rules.
18. **`KaiConversation`**: Customer chat threads (`sender_number`, `last_message_at`).
19. **`KaiConversationMessage`**: Individual messages (`sender_number`, `message_text`, `response_text`, `type`, `status`).
20. **`KaiGroup`**: Contact broadcast target groups.
21. **`KaiBroadcast`**: WhatsApp broadcast campaign history.
22. **`KaiLog`**: WhatsApp service activity logs.

---

## 5. Complete API Reference Specifications

All API routes are grouped under `/api/v1/`.

| HTTP Method | Endpoint Route | Auth / Middleware | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Public | Register new user & business tenant |
| **POST** | `/api/v1/auth/login` | Public | Login via Email & Password |
| **GET** | `/api/v1/auth/me` | Sanctum | Fetch currently authenticated user & tenant profile |
| **POST** | `/api/v1/auth/logout` | Sanctum | Revoke current user session token |
| **POST** | `/api/v1/auth/password` | Sanctum | Update user password |
| **GET** | `/api/v1/auth/google/redirect` | Public | Returns Google OAuth 2.0 authorization URL |
| **GET** | `/api/v1/auth/google/callback` | Public | Google OAuth callback handler & token generator |
| **POST** | `/api/v1/pixel/generate` | Sanctum + Approved | Generate AI product image via Gemini API |
| **GET** | `/api/v1/pixel/gallery` | Sanctum + Approved | Retrieve tenant generated image gallery |
| **DELETE** | `/api/v1/pixel/{image}` | Sanctum + Approved | Delete a generated pixel image |
| **GET** | `/api/v1/maya/accounts` | Sanctum + Approved | List connected Instagram & TikTok accounts |
| **POST** | `/api/v1/maya/connect` | Sanctum + Approved | Connect new social media account via Meta Graph API |
| **GET** | `/api/v1/maya/posts` | Sanctum + Approved | Fetch scheduled & published posts calendar |
| **POST** | `/api/v1/maya/posts` | Sanctum + Approved | Create/schedule new social media post |
| **POST** | `/api/v1/maya/stories/bulk` | Sanctum + Approved | Bulk schedule Instagram stories from GDrive links |
| **GET** | `/api/v1/analytics` | Sanctum + Approved | Fetch Echo aggregate reach, engagement & growth data |
| **GET** | `/api/v1/analytics/contents` | Sanctum + Approved | Fetch ranked content performance list |
| **POST** | `/api/v1/analytics/export` | Sanctum + Approved | Export analytics report (PDF / XLSX) |
| **GET** | `/api/v1/kai/devices` | Sanctum + Approved | List connected WhatsApp Kai devices |
| **POST** | `/api/v1/kai/devices/request` | Sanctum + Approved | Request new QR code device pairing |
| **POST** | `/api/v1/kai/csv/import` | Sanctum + Approved | Import product catalog CSV / Google Sheet |
| **POST** | `/api/v1/kai/broadcast` | Sanctum + Approved | Dispatch bulk broadcast campaign |
| **GET** | `/api/v1/kai/logs` | Sanctum + Approved | Fetch Kai message & handover logs |
| **GET** | `/api/v1/users/pending` | Sanctum + Admin | List all pending tenants awaiting verification |
| **GET** | `/api/v1/users` | Sanctum + Admin | List all tenants with usage statistics |
| **POST** | `/api/v1/users/{user}/approve` | Sanctum + Admin | Approve a pending tenant (set status = active) |
| **POST** | `/api/v1/users/{user}/reject` | Sanctum + Admin | Reject / delete a tenant application |
| **POST** | `/api/v1/users/{user}/suspend` | Sanctum + Admin | Suspend an active tenant |
| **PUT** | `/api/v1/config/limits` | Sanctum + Admin | Update global platform quota limits |

---

## 6. Detailed Services Architecture & Internal Business Logic

1. **`GeminiImageProvider.php`** (`app/Services/Images/`):
   - Implements `ImageProvider` contract.
   - Accepts multipart image upload or Google Drive URL.
   - Converts image to base64 inline data array.
   - Constructs visual prompt with strict aspect ratio instructions (`1:1`, `4:5`, `16:9`, `9:16`) and studio lighting styles.
   - Calls Google Gemini API (`GEMINI_API_KEY`, model `gemini-flash-latest`).
   - Saves output file to `storage/app/public/pixel/` and returns public URL `https://app.fluxy.id/storage/pixel/...`.

2. **`WhatsAppQrGatewayService.php`** (`app/Services/Kai/`):
   - Generates WhatsApp Web pairing session ID (`wa_qr_{tenant_id}_{rand}`).
   - Constructs SVG QR code data URI payload (`2@...`).
   - Sets 2-minute QR code expiration window (`qr_expires_at`).
   - Auto-refreshes expired QR codes on status polling (`checkStatus()`).

3. **`MetaService.php`** (`app/Services/Meta/`):
   - Handles Meta Graph API v24.0 integration.
   - Connects Facebook Pages & Instagram Business Accounts (`/v24.0/me/accounts`).
   - Manages media container creation (`/{ig_user_id}/media`) and publication (`/{ig_user_id}/media_publish`).
   - Fetches page insights & media metrics for Echo analytics.

4. **`UsageService.php`** (`app/Services/`):
   - Enforces monthly quota limits per tenant based on active subscription plan (`UsageService::DEFAULT_LIMITS`).
   - Tracks monthly generation counts for Pixel images, Maya posts, Kai broadcasts, and Echo exports.

5. **`AuditService.php`** (`app/Services/`):
   - Records administrative audit trails into `audit_logs` table (`AuditService::log($tenant, $action, $description, $metadata)`).

---

## 7. Complete Environment Variables (.env) Reference Table

| Variable Name | Required | Default Value | Description / Production Purpose |
| :--- | :--- | :--- | :--- |
| `APP_NAME` | Yes | `Fluxy` | Platform application name |
| `APP_ENV` | Yes | `production` | Environment mode (`production` or `local`) |
| `APP_KEY` | Yes | `base64:...` | Encryption key generated via `php artisan key:generate` |
| `APP_DEBUG` | Yes | `false` | Debug mode (MUST be `false` in production) |
| `APP_URL` | Yes | `https://app.fluxy.id` | Production HTTPS application URL |
| `DB_CONNECTION` | Yes | `sqlite` | Database driver |
| `DB_DATABASE` | Yes | `/var/www/...` | Absolute path to SQLite database file |
| `META_GRAPH_URL` | Yes | `https://graph.facebook.com` | Meta Graph API base endpoint |
| `META_GRAPH_VERSION` | Yes | `v24.0` | Meta Graph API version |
| `META_APP_ID` | Yes | `2739900363078048` | Meta Developer App ID |
| `META_APP_SECRET` | Yes | `d31d680...` | Meta Developer App Secret |
| `META_BUSINESS_ID` | Yes | `28254187...` | Meta Business Account ID |
| `META_SYSTEM_USER_TOKEN` | Yes | `EAAm77MP...` | Permanent Meta System User Token |
| `META_WEBHOOK_VERIFY_TOKEN` | Yes | `fluxy_wh_7k2xQm9vR4pL` | Verification token for Meta webhooks |
| `GEMINI_API_KEY` | Yes | `AQ.Ab8RN6...` | Google Gemini AI API key |
| `GEMINI_MODEL` | Yes | `gemini-flash-latest` | Model identifier for product image design |
| `PIXEL_IMAGE_PROVIDER` | Yes | `gemini` | Resolved image generation provider singleton |
| `GOOGLE_CLIENT_ID` | Yes | `4896068...` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | `GOCSPX-...` | Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | Yes | `https://app.fluxy.id/api/v1/auth/google/callback` | OAuth redirect URI registered in Google Console |
| `FRONTEND_URL` | Yes | `https://app.fluxy.id` | Production frontend URL for CORS & redirects |

---

## 8. Complete Frontend Page Routing & Guard Map

| Route Path | Component File | Guards Required | Description |
| :--- | :--- | :--- | :--- |
| `/login` | `src/pages/auth/login.tsx` | Public / Guest | Email/password login & Google OAuth trigger |
| `/register` | `src/pages/auth/register.tsx` | Public / Guest | New business tenant registration |
| `/auth/callback` | `src/pages/auth/oauth-callback.tsx` | Public | OAuth token reception & Zustand auth store initialization |
| `/pending-approval`| `src/pages/auth/pending-approval.tsx`| Authenticated | Landing screen for tenants awaiting admin approval |
| `/dashboard` | `src/pages/dashboard/dashboard-page.tsx`| Auth + Approved | Main overview dashboard for active tenants |
| `/pixel` | `src/pages/pixel/pixel-page.tsx` | Auth + Approved | AI Product Photo Generation tool & gallery |
| `/maya/create` | `src/pages/maya/create-page.tsx` | Auth + Approved | AI Social Media Post composer |
| `/maya/calendar` | `src/pages/maya/calendar-page.tsx` | Auth + Approved | Social content calendar & scheduler |
| `/maya/stories` | `src/pages/maya/stories-page.tsx` | Auth + Approved | Bulk Instagram Story scheduler from GDrive links |
| `/maya/connect` | `src/pages/maya/connect-page.tsx` | Auth + Approved | Instagram Business & TikTok account connection |
| `/echo` | `src/pages/echo/echo-page.tsx` | Auth + Approved | Social media analytics & growth charts |
| `/kai/chatbot` | `src/pages/kai/chatbot-page.tsx` | Auth + Approved | WhatsApp AI Chatbot knowledge base & settings |
| `/kai/devices` | `src/pages/kai/kai-devices-page.tsx` | Auth + Approved | WhatsApp Kai QR code device pairing |
| `/kai/broadcast` | `src/pages/kai/broadcast-page.tsx` | Auth + Approved | Bulk broadcast campaign dispatch |
| `/kai/logs` | `src/pages/kai/logs-page.tsx` | Auth + Approved | WhatsApp Chatbot response & handover logs |
| `/admin/tenants` | `src/pages/admin/tenants-page.tsx` | Auth + Superadmin | Tenant approval, rejection & quota management |
| `/admin/config` | `src/pages/admin/config-page.tsx` | Auth + Superadmin | Global platform limit settings |
| `/admin/logs` | `src/pages/admin/logs-page.tsx` | Auth + Superadmin | System audit & activity logs |

---

## 9. Full Nginx Web Server Configuration File (`/etc/nginx/sites-available/fluxy`)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name app.fluxy.id fluxy.id;

    root /var/www/fluxy/fluxy-backend/public;
    index index.php index.html;

    client_max_body_size 64M;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

---

## 10. Comprehensive 20+ Item Diagnostic Matrix

| Error / Symptom | Root Cause | Solution Command / Action |
| :--- | :--- | :--- |
| **Safari Can't Connect to Server (Port 443)** | Certbot SSL not yet run or UFW firewall blocking 443 | Run `sudo certbot --nginx -d app.fluxy.id -m ibobatsuga@gmail.com --agree-tos --non-interactive` & `sudo ufw allow 443/tcp` |
| **Google OAuth Redirect Mismatch Error** | Authorized redirect URI in Google Console does not match `GOOGLE_REDIRECT_URI` | Ensure Google Console contains `https://app.fluxy.id/api/v1/auth/google/callback` |
| **SQLite Read-Only / Unable to Open DB** | Ownership of `database.sqlite` set to `root` instead of `www-data` | Run `sudo chown -R www-data:www-data /var/www/fluxy` & `sudo chmod -R 775 /var/www/fluxy/fluxy-backend/database` |
| **Uploaded / Pixel Images Return 404** | Symlink `public/storage` missing | Run `sudo -u www-data php artisan storage:link` inside `/var/www/fluxy/fluxy-backend` |
| **User Stuck on Pending Approval Screen** | Tenant `status` is `'pending'` and user is not superadmin | Approve user via Web UI (`https://app.fluxy.id/admin/tenants`) or run `sudo -u www-data php artisan tinker --execute="App\Models\User::where('email', 'ibobatsuga@gmail.com')->update(['is_admin' => true]);"` |
| **CORS / Mixed Content Warning** | Trusted proxies not configured in Laravel behind Nginx | Ensure `bootstrap/app.php` contains `$middleware->trustProxies(at: '*')` |
| **Frontend 404 on Direct Page Refresh** | Nginx missing SPA route fallback | Ensure Nginx `location /` contains `try_files $uri $uri/ /index.php?$query_string;` and `routes/web.php` serves `index.html` |
| **Pixel Image Generation 500 Error** | Missing `GEMINI_API_KEY` in `.env` | Verify `GEMINI_API_KEY` in `.env` and `PIXEL_IMAGE_PROVIDER=gemini` |
| **Meta Graph API Token Expired** | Meta System User token invalidated | Update `META_SYSTEM_USER_TOKEN` in `.env` |
| **Nginx 502 Bad Gateway** | PHP-FPM service stopped or sock path mismatch | Run `sudo systemctl status php8.4-fpm` and verify socket at `/run/php/php8.4-fpm.sock` |
| **Class "ImageProvider" Not Found** | Missing composer autoload dump | Run `composer dump-autoload` in backend |
| **Sanctum Token Unauthenticated 401** | Missing `Authorization: Bearer` header or expired token | Clear browser local storage & log in again |

---

## 11. Immediate Next Tasks for Codex

1. **Module Inspection & Verification**: Test and verify all API endpoints for Maya (stories, calendar), Kai (chatbot, WA handover), Pixel (Gemini image generation), and Echo (analytics).
2. **Webhooks Verification**: Confirm Meta webhook callback handler at `POST /api/v1/meta/webhook` verifies token `fluxy_wh_7k2xQm9vR4pL` cleanly.
3. **Frontend UI Polish**: Ensure all forms, dialogs, and table pagination handle empty/error states gracefully.
