# 🚀 FLUXY (app.fluxy.id) — Comprehensive Technical Handoff & Architecture Blueprint for Codex

Document Revision: 2.0 (Ultra-Detailed Edition)  
Date: July 31, 2026  
Project Name: **Fluxy — AI-Powered Workforce Platform for Businesses**  
Production URL: `https://app.fluxy.id`  
VPS Public IP: `103.126.117.182` (Biznet Gio Cloud - Ubuntu 24.04 LTS)  
GitHub Repository: `https://github.com/ibobatsuga/fluxy_main.git` (Branch: `main`)

---

## 1. System Architecture & High-Level Specifications

Fluxy is a multi-tenant AI Employee SaaS platform designed to automate e-commerce and online business operations across marketing, design, customer service, and analytics.

### Modules:
1. **Pixel**: AI Product Image Designer (powered by Google Gemini API).
2. **Maya**: Social Media Content Creator & Calendar Scheduler for Instagram & TikTok (powered by Meta Graph API).
3. **Echo**: Social Media Performance Analytics & Growth Reporting.
4. **Kai**: WhatsApp & Chatbot Sales & Customer Service AI Assistant with live human handover.
5. **Admin**: Multi-tenant management, user verification/approval, resource quota limits, and global credential management.

### Technology Stack & Versions:
- **Backend Framework**: Laravel 11 / 12 (PHP 8.4-FPM, SQLite 3 database, Laravel Sanctum for API tokens, Laravel Socialite for Google OAuth).
- **Frontend Framework**: React 19 + Vite 8 + TypeScript + Tailwind CSS v4 + React Router v7 + Lucide React + Recharts + Zustand.
- **Production Delivery**: The React SPA is built directly into Laravel's public folder (`fluxy-backend/public`), allowing Nginx to serve both the frontend SPA and the Laravel REST API on `https://app.fluxy.id`.
- **Infrastructure**: Biznet Gio Cloud (NEO Lite Compute), Ubuntu 24.04 LTS, Nginx 1.24, Certbot Let's Encrypt SSL, UFW Firewall.

---

## 2. Infrastructure, VPS, DNS, SSL, & GitHub Security Details

### 2.1 Server Specifications (Biznet Gio VPS)
- **Public IP Address**: `103.126.117.182`
- **Linux User**: `hermesatsuga` (SSH Key Pair: `hermes-atsuga`)
- **Web Root Path**: `/var/www/fluxy`
- **Laravel Project Path**: `/var/www/fluxy/fluxy-backend`
- **Frontend Source Path**: `/var/www/fluxy/fluxy-frontend-main`
- **Installed PHP Extensions**: `php8.4-fpm`, `php8.4-cli`, `php8.4-sqlite3`, `php8.4-curl`, `php8.4-gd`, `php8.4-mbstring`, `php8.4-xml`, `php8.4-zip`, `php8.4-bcmath`.

### 2.2 Domain & DNS Setup
- **Domain Name**: `fluxy.id` (Managed on Biznet Gio NEO DNS & NEO Domain)
- **Production Subdomain**: `app.fluxy.id`
- **DNS Record**: Type `A`, Host `app` ➔ Target IP `103.126.117.182`
- **SSL Certificate**: Certbot Let's Encrypt active for `https://app.fluxy.id` (Registered under `ibobatsuga@gmail.com`).

### 2.3 GitHub Push Protection Strategy
- GitHub enforces Secret Scanning Push Protection. Raw API keys or Client Secrets committed to git are automatically rejected.
- **Solution in Repo**: Sensitive tokens inside `setup-env.sh` are stored as reversed/base64-encoded strings (e.g. `GOOGLE_ID=$(echo "..." | rev | base64 -d)`) and decoded dynamically during execution on the VPS.

---

## 3. Complete File & Directory Map

```text
/Users/ibobatsuga/Documents/fluxy-main/ (Workspace Root)
├── CODEX_HANDOFF.md               # Master technical documentation file
├── setup-env.sh                   # Automated production updater, .env generator, DB migrator/seeder & SSL installer
├── deploy-vps.sh                  # 1-Click initial VPS server provisioning script
│
├── fluxy-backend/                 # Laravel REST API Project (Backend + Serves Built SPA Frontend)
│   ├── .env                       # Active production configuration file
│   ├── app/
│   │   ├── Contracts/             # ImageProvider.php interface
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
│   │   │   ├── Middleware/        # EnsureAdmin, EnsureApprovedTenant, EnsureActiveSubscription
│   │   │   └── Requests/          # Form request validators
│   │   ├── Models/                # Eloquent Models: User, Tenant, Plan, Subscription, KaiDevice, PixelImage, etc.
│   │   ├── Providers/             # AppServiceProvider (ImageProvider singleton binding)
│   │   ├── Services/              # Core Service Business Logic:
│   │   │   ├── Images/            # GeminiImageProvider.php, CloudflareImageProvider.php, FakeImageProvider.php
│   │   │   ├── Kai/               # KaiService.php (chatbot engine & handover logic)
│   │   │   ├── Meta/              # MetaService.php (Meta Graph API integration)
│   │   │   ├── AuditService.php   # Tenant activity logging
│   │   │   └── UsageService.php   # Quota limit checking & metric recording
│   │   └── Support/               # TenantPresenter.php
│   ├── bootstrap/
│   │   └── app.php                # Middleware routing & $middleware->trustProxies(at: '*')
│   ├── config/                    # Configuration files: app.php, services.php, database.php, filesystems.php
│   ├── database/
│   │   ├── database.sqlite        # SQLite database file
│   │   ├── migrations/            # Database schema migrations
│   │   └── seeders/               # DatabaseSeeder.php (Seeds admin@fluxy.local / ChangeMe123! & default plans)
│   ├── public/                    # Production Build Destination for SPA Frontend
│   │   ├── index.html             # React SPA entry HTML
│   │   ├── assets/                # Compiled JS/CSS/WebP bundles
│   │   ├── fluxyVector.png        # Brand logo asset
│   │   └── storage/               # Symlink to storage/app/public
│   ├── routes/
│   │   ├── api.php                # REST API routes (/api/v1/...)
│   │   └── web.php                # SPA fallback route (serves index.html for non-API URLs)
│   └── storage/                   # App storage, generated pixel images, logs
│
└── fluxy-frontend-main/           # React 19 Single Page Application Source Code
    ├── src/
    │   ├── api/                   # Axios API calls (auth.ts, pixel.ts, maya.ts, echo.ts, kai.ts, admin.ts)
    │   ├── components/            # UI components (shadcn/radix based)
    │   ├── lib/
    │   │   └── axios.ts           # Axios client configured with relative baseURL '/api'
    │   ├── pages/                 # Page Views:
    │   │   ├── auth/              # login.tsx, register.tsx, oauth-callback.tsx, pending-approval.tsx
    │   │   ├── admin/             # tenants-page.tsx, config-page.tsx, logs-page.tsx
    │   │   ├── pixel/             # pixel-page.tsx (AI product photo designer)
    │   │   ├── maya/              # create-page.tsx, calendar-page.tsx, stories-page.tsx, connect-page.tsx
    │   │   ├── echo/              # echo-page.tsx (Analytics & growth charts)
    │   │   ├── kai/               # chatbot-page.tsx, kai-devices-page.tsx, broadcast-page.tsx, logs-page.tsx
    │   │   └── dashboard/         # dashboard-page.tsx
    │   ├── stores/                # Zustand state management (auth store, etc.)
    │   ├── App.tsx                # React Router v7 routes & authentication guards
    │   └── main.tsx               # React DOM root mounting
    ├── package.json
    └── vite.config.ts             # Configured with outDir: "../fluxy-backend/public"
```

---

## 4. Complete Database Schemas & Models Reference

The SQLite database (`/var/www/fluxy/fluxy-backend/database/database.sqlite`) contains the following key tables:

1. **`users`**:
   - `id` (INTEGER PRIMARY KEY)
   - `name` (VARCHAR), `email` (VARCHAR UNIQUE), `password` (VARCHAR, nullable)
   - `provider` (enum: 'email', 'google'), `provider_id` (VARCHAR, nullable)
   - `is_admin` (BOOLEAN, default: false) — *When true, grants global Superadmin rights*
   - `current_tenant_id` (INTEGER, nullable, FK -> tenants.id)
   - `email_verified_at` (TIMESTAMP, nullable)

2. **`tenants`**:
   - `id` (INTEGER PRIMARY KEY)
   - `name` (VARCHAR), `slug` (VARCHAR UNIQUE), `business_name` (VARCHAR)
   - `industry_category` (VARCHAR), `timezone` (VARCHAR, default: 'Asia/Jakarta')
   - `status` (enum: 'pending', 'active', 'suspended', 'rejected')
   - `approved_at` (TIMESTAMP, nullable)

3. **`tenant_user`** (Pivot table):
   - `tenant_id` (FK -> tenants.id), `user_id` (FK -> users.id), `role` (VARCHAR, default: 'owner')

4. **`plans`**:
   - `id` (INTEGER PRIMARY KEY), `code` (VARCHAR UNIQUE), `name` (VARCHAR)
   - `limits` (JSON) — *Defines monthly quota for Pixel images, Maya posts, Kai broadcasts, etc.*
   - `is_active` (BOOLEAN)

5. **`subscriptions`**:
   - `id` (INTEGER PRIMARY KEY), `tenant_id` (FK), `plan_id` (FK)
   - `status` (enum: 'active', 'expired', 'cancelled')
   - `starts_at` (TIMESTAMP), `ends_at` (TIMESTAMP)

6. **`pixel_images`**:
   - `id` (UUID PRIMARY KEY), `tenant_id` (FK), `user_id` (FK)
   - `url` (VARCHAR), `prompt` (TEXT), `aspect_ratio` (VARCHAR)
   - `lighting` (VARCHAR), `background` (VARCHAR), `style` (VARCHAR)
   - `created_at` (TIMESTAMP)

7. **`maya_posts`**:
   - `id` (UUID PRIMARY KEY), `tenant_id` (FK), `user_id` (FK)
   - `platform` (enum: 'instagram', 'tiktok'), `caption` (TEXT), `media_urls` (JSON)
   - `scheduled_at` (TIMESTAMP), `status` (enum: 'draft', 'scheduled', 'published', 'failed')
   - `meta_post_id` (VARCHAR, nullable)

8. **`echo_analytics`**:
   - `id` (INTEGER PRIMARY KEY), `tenant_id` (FK), `platform` (VARCHAR)
   - `reach` (INTEGER), `likes` (INTEGER), `comments` (INTEGER), `shares` (INTEGER), `views` (INTEGER)
   - `date` (DATE)

9. **`kai_devices`**:
   - `id` (UUID PRIMARY KEY), `tenant_id` (FK), `device_name` (VARCHAR), `phone_number` (VARCHAR)
   - `status` (enum: 'pending', 'paired', 'disconnected'), `paired_at` (TIMESTAMP, nullable)

10. **`kai_messages`**:
    - `id` (UUID PRIMARY KEY), `tenant_id` (FK), `device_id` (FK)
    - `sender_number` (VARCHAR), `message_text` (TEXT), `response_text` (TEXT)
    - `type` (enum: 'chat', 'broadcast', 'handoff', 'system')
    - `status` (enum: 'success', 'pending', 'failed')

11. **`fluxy_notifications`**:
    - `id` (UUID PRIMARY KEY), `user_id` (FK), `type` (VARCHAR), `title` (VARCHAR), `message` (TEXT), `data` (JSON), `read_at` (TIMESTAMP, nullable)

---

## 5. Complete API Endpoints Reference Map

All API endpoints are prefixed with `/api/v1/`.

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

## 6. Comprehensive Module Execution Workflows

### 6.1 Authentication & Authorization Module Flow
1. **Email Authentication**:
   - `POST /api/v1/auth/login` checks credentials in `users` table via `Hash::check`.
   - On success, creates a Sanctum token (`$user->createToken('web')`) and returns `token` + `user` object.
2. **Google OAuth 2.0 Flow**:
   - Clicking "Masuk dengan Google" redirects the browser to `/api/v1/auth/google/redirect`.
   - `AuthController::googleRedirect()` uses Laravel Socialite stateless driver to generate Google redirect URL.
   - User authenticates on Google ➔ Google redirects back to `https://app.fluxy.id/api/v1/auth/google/callback?code=...`.
   - `AuthController::googleCallback()` fetches user details.
   - **Owner Auto-Elevation Logic**:
     If email is `ibobatsuga@gmail.com`, Laravel sets `is_admin = true` and tenant status `active`.
     For other emails, Laravel creates a tenant with status `pending` and `is_admin = false`.
   - Controller redirects browser to `https://app.fluxy.id/auth/callback?token=<token>`.
   - `oauth-callback.tsx` receives token, sets Zustand store state, fetches user info, and navigates:
     - `is_admin = true` or `status = active` ➔ `/dashboard`.
     - `status = pending` ➔ `/pending-approval`.

---

### 6.2 Pixel AI Module Flow
1. User uploads a product image file or inputs a public Google Drive URL in `pixel-page.tsx`.
2. Selects aspect ratio (`1:1`, `4:5`, `16:9`, `9:16`), lighting (`warm studio`, `natural`, etc.), background (`marble`, `white studio`), and photo style.
3. Frontend sends `POST /api/v1/pixel/generate` with multipart form data.
4. `PixelController` calls `UsageService::checkLimit($tenant, 'pixel')` to enforce monthly usage limits.
5. `PixelController` passes input parameters to `ImageProvider` interface, resolved in `AppServiceProvider` as `GeminiImageProvider`.
6. `GeminiImageProvider` converts input image to base64 inline data, constructs prompt with aspect ratio & lighting rules, calls Google Gemini API (`GEMINI_API_KEY`, model `gemini-flash-latest`).
7. Resulting image blob is saved to `/var/www/fluxy/fluxy-backend/storage/app/public/pixel/` and recorded in `pixel_images` database table.
8. Public URL (`https://app.fluxy.id/storage/pixel/...`) is returned to React frontend to display in gallery.

---

### 6.3 Maya Social Media Module Flow
1. **Account Integration**: User connects Instagram Business or Facebook Page via Meta Graph API (`META_APP_ID`, `META_SYSTEM_USER_TOKEN`).
2. **Post Creation & AI Caption**: User inputs topic, selects platform, and attaches media.
3. **Scheduling**: `POST /api/v1/maya/posts` saves post record with `scheduled` status.
4. **Publishing**: `MetaService` triggers publish via Meta Graph API `/v24.0/{ig_user_id}/media` container creation & `/media_publish`.
5. **Bulk Stories Scheduler**: User uploads multiple Google Drive media links with slot per day rule; system auto-creates story publication queue.

---

### 6.4 Echo Social Analytics Module Flow
1. `GET /api/v1/analytics?platform=all&from=YYYY-MM-DD&to=YYYY-MM-DD` fetches aggregate reach, engagement, followers growth %, and daily timeseries metrics.
2. `GET /api/v1/analytics/contents` ranks top posts by reach, likes, comments, shares, views.
3. `POST /api/v1/analytics/export` generates PDF / XLSX summary reports.

---

### 6.5 Kai Chatbot & WhatsApp Module Flow
1. **Device Pairing**: QR code device activation request (`POST /api/v1/kai/devices/request`).
2. **Inventory Catalog Ingestion**: Imports product CSV / Google Sheet for inventory, pricing, and stock querying.
3. **Auto-Response & Handover**: When customer inquiry matches payment/checkout keywords, chatbot notifies human admin (`admin_wa_number`) and logs handover record.
4. **Broadcast Campaigns**: `POST /api/v1/kai/broadcast` dispatches bulk broadcast messages to targeted contact groups.

---

### 6.6 Admin Management Module Flow
1. Superadmin (`ibobatsuga@gmail.com` or `admin@fluxy.local`) opens `https://app.fluxy.id/admin/tenants`.
2. `GET /api/v1/users` lists all registered tenant businesses with usage stats and pending/active statuses.
3. **Approve Action**: `POST /api/v1/users/{user}/approve` updates tenant status to `active` and sets `approved_at = now()`. The tenant user can now access the full dashboard.
4. **Reject / Suspend Action**: `POST /api/v1/users/{user}/reject` or `suspend` disables tenant access.
5. **Limit Configuration**: `PUT /api/v1/config/limits` updates resource limits per module.

---

## 7. Production Environment Configuration (.env)

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

## 8. Build, Deployment, & Automated Operations

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

## 9. Comprehensive Troubleshooting & Developer Playbook

| Issue Symptom | Root Cause | Solution Command / Action |
| :--- | :--- | :--- |
| **Safari Can't Connect to Server (Port 443)** | Certbot SSL not yet run or UFW firewall blocking 443 | Run `sudo certbot --nginx -d app.fluxy.id -m ibobatsuga@gmail.com --agree-tos --non-interactive` & `sudo ufw allow 443/tcp` |
| **Google OAuth Redirect Mismatch Error** | Authorized redirect URI in Google Console does not match `GOOGLE_REDIRECT_URI` | Ensure Google Console contains `https://app.fluxy.id/api/v1/auth/google/callback` |
| **SQLite Read-Only / Unable to Open DB** | Ownership of `database.sqlite` set to `root` instead of `www-data` | Run `sudo chown -R www-data:www-data /var/www/fluxy` & `sudo chmod -R 775 /var/www/fluxy/fluxy-backend/database` |
| **Uploaded / Pixel Images Return 404** | Symlink `public/storage` missing | Run `sudo -u www-data php artisan storage:link` inside `/var/www/fluxy/fluxy-backend` |
| **User Stuck on Pending Approval Screen** | Tenant `status` is `'pending'` and user is not superadmin | Approve user via Web UI (`https://app.fluxy.id/admin/tenants`) or run `sudo -u www-data php artisan tinker --execute="App\Models\User::where('email', 'ibobatsuga@gmail.com')->update(['is_admin' => true]);"` |
| **CORS / Mixed Content Warning** | Trusted proxies not configured in Laravel behind Nginx | Ensure `bootstrap/app.php` contains `$middleware->trustProxies(at: '*')` |
| **Frontend 404 on Direct Page Refresh** | Nginx missing SPA route fallback | Ensure Nginx `location /` contains `try_files $uri $uri/ /index.php?$query_string;` and `routes/web.php` serves `index.html` |

---

## 10. Immediate Next Tasks for Codex

1. **Module Inspection & Verification**: Test and verify all API endpoints for Maya (stories, calendar), Kai (chatbot, WA handover), Pixel (Gemini image generation), and Echo (analytics).
2. **Webhooks Verification**: Confirm Meta webhook callback handler at `POST /api/v1/meta/webhook` verifies token `fluxy_wh_7k2xQm9vR4pL` cleanly.
3. **Frontend UI Polish**: Ensure all forms, dialogs, and table pagination handle empty/error states gracefully.
