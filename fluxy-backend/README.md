# Fluxy Backend

Backend REST API untuk Fluxy.id, dibangun dengan Laravel, PostgreSQL-ready, Sanctum, queue, dan penyimpanan media yang dapat dipindahkan ke S3.

## Status implementasi

- Auth: registrasi, login, logout, current user, password, Google OAuth.
- SaaS core: tenant, future-ready tenant membership, approval, subscription, usage limit, notification, audit log.
- Admin: tenant lifecycle, aggregate usage, activity log, default limits, encrypted platform credentials, Kai device approval.
- Pixel: upload, gallery, content CRUD, caption, dan produksi gambar melalui Cloudflare Workers AI FLUX.
- Maya: sinkronisasi akun Meta, publikasi Facebook/Instagram now/schedule, edit/cancel/retry, bulk stories, queue slots.
- Echo: persisted metric aggregation, content performance, export contract.
- Kai: webhook dan balasan lead WhatsApp/Facebook/Instagram, device request, broadcast development, chatbot settings, CSV sync state, conversations, resume, logs.

Provider TikTok, broadcast WhatsApp, report generation, dan CSV product ingestion masih memakai development behavior dan harus dipasang melalui adapter tanpa mengubah kontrak frontend.

Facebook dan Instagram memakai Meta Graph API resmi. TikTok masih memakai development behavior. Pemisahan per-platform ini menjaga domain dan kontrak frontend tetap netral terhadap provider.

## Menjalankan lokal

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
composer run dev
```

Frontend:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK=false
```

Pixel Cloudflare Workers AI:

```env
PIXEL_IMAGE_PROVIDER=cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_AI_TOKEN=
CLOUDFLARE_IMAGE_MODEL=@cf/black-forest-labs/flux-1-schnell
CLOUDFLARE_IMAGE_STEPS=4
```

Gunakan API token khusus dengan permission Account `Workers AI - Read` dan `Workers AI - Edit`. Token hanya disimpan di backend dan tidak pernah dikirim ke frontend.

Meta Graph API:

```env
META_GRAPH_VERSION=v24.0
META_APP_ID=
META_APP_SECRET=
META_BUSINESS_ID=
META_SYSTEM_USER_TOKEN=
META_WEBHOOK_VERIFY_TOKEN=
```

Panduan konfigurasi, webhook, publishing, dan batas SaaS multi-tenant tersedia di [docs/META_INTEGRATION.md](docs/META_INTEGRATION.md).

Akun development dari seeder:

- Admin: `admin@fluxy.local`
- Tenant: `demo@fluxy.local`

Password dibaca dari `SEED_ADMIN_PASSWORD` dan `SEED_TENANT_PASSWORD`. Nilai bawaan hanya untuk development dan wajib diganti di environment lain.

## Quality checks

```bash
vendor/bin/pint --test
php artisan test
php artisan route:list --path=api/v1
```

## Konvensi API

- Base path: `/api/v1`
- Auth: Bearer token Laravel Sanctum.
- Success: `{ "data": ... }`, opsional dengan `meta`.
- Validation: HTTP 422 dengan `message` dan `errors`.
- Semua data modul selalu dibatasi oleh tenant dari token; `tenant_id` dari request body tidak dipercaya.
- Operasi berbiaya mendukung `Idempotency-Key` dan usage limit server-side.

Lihat [docs/architecture.md](docs/architecture.md) untuk desain, keamanan, batas production, dan urutan pekerjaan selanjutnya.
