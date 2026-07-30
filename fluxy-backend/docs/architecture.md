# Fluxy Backend Architecture

## Bounded contexts

1. Identity: users, tenants, tenant members, authentication.
2. Subscription: plans, subscriptions, usage events and limits.
3. Pixel: media assets and image generations.
4. Maya: social accounts, contents and publications.
5. Echo: persisted content metric snapshots.
6. Kai: WhatsApp device, audience groups, broadcasts, chatbot and conversations.
7. Platform operations: notifications, audit logs and encrypted credentials.

## Compatibility policy

Database menggunakan nama netral seperti `provider_account_id`, `provider_publication_id`, dan `provider_phone_number_id`. API sementara juga mengembalikan alias lama `zernio_account_id`, `zernio_post_id`, serta `ping_device_id` agar frontend lama tidak rusak. Alias dihapus setelah tipe frontend bermigrasi.

## Tenant boundary

- Token menentukan user dan `current_tenant_id`.
- Controller tidak menerima tenant ID dari payload untuk operasi tenant.
- Semua lookup resource memeriksa tenant pemilik sebelum read/update/delete.
- Admin adalah platform role terpisah dan tidak menggunakan tenant context.
- `tenant_members` disediakan untuk upgrade multi-user; MVP tetap satu owner per tenant.

## Async processing target

Development provider menyelesaikan beberapa aksi secara langsung supaya frontend dapat digunakan tanpa credential. Production adapter harus memindahkan operasi berikut ke queue:

- image generation;
- social publishing dan status polling;
- scheduled WhatsApp campaigns;
- analytics synchronization;
- report export;
- product-source ingestion.

Setiap job production harus memiliki idempotency key, bounded retry, timeout, provider request ID, dan dead-letter handling.

## Provider adapter target

- `ImageProvider`: submit, status, result.
- `SocialPublisher`: OAuth, refresh token, publish, publication status, insights.
- `WhatsAppProvider`: onboarding, templates/campaigns, inbound/outbound messages, delivery webhooks.
- `ProductSourceImporter`: fetch, validate, version and upsert product catalog.

Routing provider Maya bersifat per-platform: Instagram menggunakan adapter Zernio, sedangkan TikTok menggunakan Login Kit OAuth v2 dan Content Posting API resmi TikTok secara langsung. Token platform tetap disimpan terenkripsi dan tidak diekspos ke frontend.

WhatsApp group delivery harus berada di balik feature flag dan pemeriksaan account eligibility. Jalur standar production adalah kampanye 1:1 berbasis opt-in dan template yang sesuai kebijakan.

## Security requirements

- OAuth token, WABA token, dan platform secrets menggunakan encrypted casts.
- Webhook production wajib memverifikasi signature sebelum persistence.
- Webhook event harus memiliki unique provider event ID.
- Upload production perlu MIME inspection, image re-encode, size/dimension limit, dan malware scan untuk dokumen/video.
- Secrets tidak boleh masuk audit context, application log, exception response, atau telemetry.
- Rate limit diterapkan pada auth dan aksi berbiaya; batas provider diterapkan kembali di worker.

## Production deployment

- Stateless API containers.
- PostgreSQL primary database.
- Redis cache, rate limiter, queue, dan scheduler lock.
- S3-compatible private object storage dengan signed URLs.
- Queue worker dan scheduler sebagai process terpisah.
- Centralized logs, error tracking, metrics, uptime checks, database backup, dan restore drill.

## Remaining production work

1. Ganti development provider dengan adapter Meta, TikTok, dan WhatsApp; adapter Pixel Cloudflare sudah tersedia.
2. Implementasikan webhook registry/signature/idempotency.
3. Ubah output media menjadi private signed URLs.
4. Generate PDF/XLSX lewat queued report jobs.
5. Parse CSV/Google Sheet menjadi versioned product catalog untuk chatbot retrieval.
6. Tambahkan notification events untuk post failure, usage threshold, handover, dan approval.
7. Tambahkan OpenAPI schema rinci dan generated client contract test.
8. Jalankan PostgreSQL integration test, queue failure test, load test, dan restore drill.
