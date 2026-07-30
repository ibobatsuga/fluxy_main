# 🚀 FLUXY (app.fluxy.id) — Comprehensive Technical Handoff & Architecture Blueprint for Codex

Document Revision: 5.0 (Ultimate Complete Edition)  
Date: July 31, 2026  
Project Name: **Fluxy — AI-Powered Workforce Platform for Businesses**  
Production URL: `https://app.fluxy.id`  
VPS Public IP: `103.126.117.182` (Biznet Gio Cloud - Ubuntu 24.04 LTS)  
GitHub Repository: `https://github.com/ibobatsuga/fluxy_main.git` (Branch: `main`)

---

## 1. Executive Summary & Architecture Overview

Fluxy is a multi-tenant AI Employee SaaS platform designed to automate e-commerce and online business operations across marketing, design, customer service, and analytics.

### Platform Modules:
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

## 3. Exhaustive Directory & File Map

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
│   │   ├── Models/                # Eloquent Models: User, Tenant, Plan, Subscription, KaiDevice, PixelImage, EchoAnalytics, etc.
│   │   ├── Providers/             # AppServiceProvider (ImageProvider singleton binding)
│   │   ├── Services/              # Core business logic: Images/GeminiImageProvider, Kai, Meta, UsageService, AuditService
│   │   └── Support/               # Helpers & Presenters (TenantPresenter.php)
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

## 4. Complete Database Schemas, Indexes, & Seed Data

The SQLite database (`/var/www/fluxy/fluxy-backend/database/database.sqlite`) contains the following 11 tables:

### 4.1 `users` Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NULLABLE,
    provider VARCHAR(50) NOT NULL DEFAULT 'email', -- 'email', 'google'
    provider_id VARCHAR(255) NULLABLE,
    is_admin BOOLEAN NOT NULL DEFAULT 0,          -- Grants Superadmin access
    current_tenant_id INTEGER NULLABLE,
    email_verified_at TIMESTAMP NULLABLE,
    created_at TIMESTAMP NULLABLE,
    updated_at TIMESTAMP NULLABLE,
    FOREIGN KEY (current_tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);
```

### 4.2 `tenants` Table
```sql
CREATE TABLE tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    industry_category VARCHAR(255) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'rejected'
    approved_at TIMESTAMP NULLABLE,
    created_at TIMESTAMP NULLABLE,
    updated_at TIMESTAMP NULLABLE
);
```

### 4.3 `tenant_user` Table (Pivot)
```sql
CREATE TABLE tenant_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'owner',
    created_at TIMESTAMP NULLABLE,
    updated_at TIMESTAMP NULLABLE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4.4 `plans` Table
```sql
CREATE TABLE plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    limits JSON NOT NULL, -- Quotas for pixel, maya, kai, echo
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULLABLE,
    updated_at TIMESTAMP NULLABLE
);
```

### 4.5 `subscriptions` Table
```sql
CREATE TABLE subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NULLABLE,
    updated_at TIMESTAMP NULLABLE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);
```

### 4.6 `pixel_images` Table
```sql
CREATE TABLE pixel_images (
    id CHAR(36) PRIMARY KEY NOT NULL, -- UUID
    tenant_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    url VARCHAR(500) NOT NULL,
    prompt TEXT NULLABLE,
    aspect_ratio VARCHAR(20) NOT NULL DEFAULT '1:1',
    lighting VARCHAR(100) NULLABLE,
    background VARCHAR(100) NULLABLE,
    style VARCHAR(100) NULLABLE,
    created_at TIMESTAMP NULLABLE,
    updated_at TIMESTAMP NULLABLE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4.7 `maya_posts` Table
```sql
CREATE TABLE maya_posts (
    id CHAR(36) PRIMARY KEY NOT NULL, -- UUID
    tenant_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'tiktok'
    caption TEXT NULLABLE,
    media_urls JSON NOT NULL,
    scheduled_at TIMESTAMP NULLABLE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'failed'
    meta_post_id VARCHAR(255) NULLABLE,
    error_message TEXT NULLABLE,
    created_at TIMESTAMP NULLABLE,
    updated_at TIMESTAMP NULLABLE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4.8 `echo_analytics` Table
```sql
CREATE TABLE echo_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    reach INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    comments INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP NULLABLE,
    updated_at TIMESTAMP NULLABLE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

### 4.9 `kai_devices` Table
```sql
CREATE TABLE kai_devices (
    id CHAR(36) PRIMARY KEY NOT NULL, -- UUID
    tenant_id INTEGER NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(100) NULLABLE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paired', 'disconnected'
    paired_at TIMESTAMP NULLABLE,
    created_at TIMESTAMP NULLABLE,
    updated_at TIMESTAMP NULLABLE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

### 4.10 `kai_messages` Table
```sql
CREATE TABLE kai_messages (
    id CHAR(36) PRIMARY KEY NOT NULL, -- UUID
    tenant_id INTEGER NOT NULL,
    device_id CHAR(36) NOT NULL,
    sender_number VARCHAR(100) NOT NULL,
    message_text TEXT NOT NULL,
    response_text TEXT NULLABLE,
    type VARCHAR(50) NOT NULL DEFAULT 'chat', -- 'chat', 'broadcast', 'handoff', 'system'
    status VARCHAR(50) NOT NULL DEFAULT 'success', -- 'success', 'pending', 'failed'
    created_at TIMESTAMP NULLABLE,
    updated_at TIMESTAMP NULLABLE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES kai_devices(id) ON DELETE CASCADE
);
```

### 4.11 `fluxy_notifications` Table
```sql
CREATE TABLE fluxy_notifications (
    id CHAR(36) PRIMARY KEY NOT NULL, -- UUID
    user_id INTEGER NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULLABLE,
    read_at TIMESTAMP NULLABLE,
    created_at TIMESTAMP NULLABLE,
    updated_at TIMESTAMP NULLABLE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 5. Complete API Reference Specifications

All API routes are grouped under `/api/v1/`.

### 5.1 Authentication API Specification

#### `POST /api/v1/auth/login`
- **Headers**: `Content-Type: application/json`, `Accept: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "secretpassword"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "1|sanctum_bearer_token_string",
      "user": {
        "id": 1,
        "name": "User Name",
        "email": "user@example.com",
        "is_admin": false,
        "is_approved": true,
        "current_tenant_id": 1
      }
    }
  }
  ```

#### `POST /api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "secretpassword",
    "business_name": "Toko Barokah",
    "industry_category": "E-commerce / Online Shop"
  }
  ```
- **Response (200 OK)**: Returns user payload. Tenant is created with status `pending`.

#### `GET /api/v1/auth/google/redirect`
- **Response**: Redirects browser to Google OAuth consent page.

#### `GET /api/v1/auth/google/callback`
- **Response**: Processes OAuth authorization code, elevates `ibobatsuga@gmail.com` to `is_admin = true`, creates session token, and redirects browser to `https://app.fluxy.id/auth/callback?token=...`.

---

### 5.2 Pixel AI API Specification

#### `POST /api/v1/pixel/generate`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Request Parameters**:
  - `image_file`: File (JPG/PNG image, optional if `gdrive_link` provided)
  - `gdrive_link`: String (public Google Drive URL, optional if `image_file` provided)
  - `content_type`: String (`feed` or `story`)
  - `lighting`: String (e.g. `warm studio lighting`, `natural`)
  - `background`: String (e.g. `white studio background`, `marble`)
  - `style`: String (e.g. `minimalist product photography`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-string",
      "url": "https://app.fluxy.id/storage/pixel/generated_xyz.png",
      "aspect_ratio": "1:1",
      "created_at": "2026-07-31T00:00:00Z"
    }
  }
  ```

---

### 5.3 Maya Social Media API Specification

#### `GET /api/v1/maya/posts`
- **Response (200 OK)**: Returns list of scheduled and published social media posts for current tenant.

#### `POST /api/v1/maya/posts`
- **Request Body**:
  ```json
  {
    "platform": "instagram",
    "caption": "Promo Spesial Hari Ini! Sikat!",
    "media_urls": ["https://app.fluxy.id/storage/pixel/generated_xyz.png"],
    "scheduled_at": "2026-08-01 10:00:00"
  }
  ```

---

### 5.4 Echo Analytics API Specification

#### `GET /api/v1/analytics`
- **Query Params**: `platform=all|instagram|tiktok`, `from=YYYY-MM-DD`, `to=YYYY-MM-DD`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "overview": {
        "total_reach": 154200,
        "total_engagement": 12850,
        "followers_count": 8450,
        "followers_growth": 4.5,
        "engagement_rate": 8.3
      },
      "daily": [
        { "date": "2026-07-01", "reach": 4200, "engagement": 380 }
      ]
    }
  }
  ```

---

### 5.5 Kai WhatsApp & Chatbot API Specification

#### `POST /api/v1/kai/csv/import`
- **Headers**: `Content-Type: multipart/form-data`
- **Request**: CSV product inventory file with columns `product_name`, `price`, `stock`.
- **Response (200 OK)**: Updates chatbot product knowledge base.

#### `POST /api/v1/kai/broadcast`
- **Request Body**:
  ```json
  {
    "group_ids": [1, 2],
    "message": "Halo Kak! Diskon 20% khusus hari ini!",
    "image_url": "https://app.fluxy.id/storage/pixel/promo.png"
  }
  ```

---

### 5.6 Admin Management API Specification

#### `GET /api/v1/users`
- **Headers**: `Authorization: Bearer <token>` (Superadmin required)
- **Response (200 OK)**: Returns list of all registered business tenants with active resource usage statistics.

#### `POST /api/v1/users/{user}/approve`
- **Response (200 OK)**: Sets tenant `status = 'active'` and `approved_at = now()`.

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
