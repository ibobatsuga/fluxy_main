# Fluxy CRM WhatsApp AI

Monorepo baru untuk CRM WhatsApp AI (menggantikan modul KAI lama secara bertahap).
Independen dari `fluxy-backend/` dan `fluxy-frontend-main/` — beda stack, beda database,
beda proses. Lihat `PROGRESS_AND_ROADMAP.md` untuk konteks produk lama.

**Status:** Fase 0 (fondasi — auth + isolasi tenant). Belum ada WhatsApp/AI.

## Struktur

```
apps/api       Express + TypeScript — REST API
apps/web       Next.js — dashboard
packages/db    Prisma schema, dipakai bersama oleh apps/api
docker-compose.yml   Postgres, Redis, WAHA (WAHA dev-only, belum dipakai sampai Fase 1), api, web
```

## Menjalankan (Docker — cara yang direkomendasikan)

```bash
cp .env.example .env        # isi JWT_SECRET dengan nilai acak untuk non-local: openssl rand -base64 32
docker compose up --build
```

- Web: http://localhost:3001
- API: http://localhost:4000
- Postgres: localhost:5433 (host) — di dalam Docker network, service `postgres` di port 5432
- Redis: localhost:6380 — belum dipakai di Fase 0, disiapkan untuk BullMQ di Fase 1
- WAHA: http://localhost:3000 — belum diintegrasikan, disiapkan untuk Fase 1

Migrasi database (`prisma migrate deploy`) jalan otomatis setiap kali container `api` start.

## Menjalankan tanpa Docker (dev lokal langsung)

Butuh Postgres sendiri yang jalan, arahkan `DATABASE_URL` ke situ.

```bash
npm install
npm run generate --workspace=@fluxy-crm/db
npm run migrate:deploy --workspace=@fluxy-crm/db   # atau migrate:dev untuk bikin migration baru
npm run dev --workspace=@fluxy-crm/api             # :4000
npm run dev --workspace=@fluxy-crm/web             # :3001
```

## Testing

```bash
# Butuh Postgres nyala (docker compose up postgres, atau Postgres lokal) dan
# DATABASE_URL + JWT_SECRET ter-set di environment / .env
npm run test --workspace=@fluxy-crm/api
```

Test isolasi tenant ada di `apps/api/src/__tests__/tenant-isolation.test.ts` — membuktikan
Tenant B tidak bisa baca/ubah/hapus Product milik Tenant A lewat API (bukan cuma "tidak
kelihatan di UI"), plus alur register/login dasar.

## Manual test alur register → login

1. Buka http://localhost:3001/register, isi nama toko + email + password (min 8 karakter) → submit.
2. Otomatis masuk ke `/dashboard`, menampilkan nama toko dan email yang login (role `OWNER`).
3. Logout dengan menghapus cookie `session` lewat devtools browser (belum ada tombol logout di
   Fase 0 — lihat catatan di laporan Fase 0), lalu buka http://localhost:3001/login dan login ulang
   dengan kredensial yang sama.

## Environment variables

Lihat `.env.example` di root. Semua kredensial via env, tidak ada yang di-hardcode.
