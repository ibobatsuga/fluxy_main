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

## 3. Production Environment & Credentials Setup

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

## 4. Key Authentication & Tenant Approval Logic

1. **Owner / Superadmin Auto-Elevation**:
   - In `app/Http/Controllers/Api/V1/AuthController.php`:
     When a user logs in or registers via Google OAuth with email `ibobatsuga@gmail.com`, Laravel automatically sets:
     - `is_admin = true`
     - Tenant status = `active`
   - This ensures `ibobatsuga@gmail.com` immediately bypasses the `/pending-approval` guard and lands on the Dashboard with full Superadmin privileges.

2. **Standard Users & Tenant Approval Workflow**:
   - Other users registering via Email or Google OAuth have `is_admin = false` and tenant status `pending`.
   - Pending users are intercepted by `EnsureApprovedTenant` middleware and redirected to `/pending-approval`.
   - The Owner (`ibobatsuga@gmail.com`) can approve or reject pending tenants via the Web Admin UI at **`https://app.fluxy.id/admin/tenants`** (API endpoint: `POST /api/v1/users/{user}/approve`).

3. **Default Admin Seed Credentials**:
   - `email`: `admin@fluxy.local`
   - `password`: `ChangeMe123!`

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
