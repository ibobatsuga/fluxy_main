# Fluxy — Progress & Roadmap

_Terakhir diperbarui: 1 Agustus 2026_

Dokumen ini merangkum pekerjaan yang sudah selesai di sesi pengembangan terbaru (commit `f74664b` s.d. `ae4e76d`) dan rencana lanjutan. Untuk dokumentasi teknis lengkap (skema DB, arsitektur, VPS), lihat [`CODEX_HANDOFF.md`](CODEX_HANDOFF.md).

---

## 1. Yang Sudah Dilakukan

### 1.1 Audit & Hardening Produksi
- Audit menyeluruh backend (Laravel) + frontend (React/Vite), 39→46 test lulus sepanjang sesi.
- Perbaikan race condition idempotency pada Pixel image generation & usage recording (row-level locking).
- CSP header + middleware `EnforceTrustedCorsOrigin` (defense-in-depth, strip CORS header untuk origin tak dikenal).
- Tuning SQLite untuk concurrent write (WAL mode, busy timeout, transaction mode).
- Live health probing untuk integrasi eksternal (Gemini, Meta) di `/api/v1/health`.
- Backup DB otomatis (cron, lock-guarded, integrity-checked) — sempat hilang saat deploy pertama, sudah diperbaiki & diverifikasi stabil.
- Perbaikan nginx: SPA routing (index.html langsung, bukan lewat PHP untuk setiap request) + fix regresi security header yang sempat hilang dari halaman utama akibat perubahan itu.
- `hermes-atsuga.pem` (SSH key VPS) ditambahkan ke `.gitignore` — sempat tidak ter-ignore.

### 1.2 Internationalization (i18n)
- Infrastruktur `react-i18next` + store bahasa persisten (zustand, pola sama seperti theme store).
- Bahasa Indonesia & English, mencakup halaman **Settings, Dashboard, Login, Register** (termasuk pesan validasi form & format tanggal `date-fns`).
- Switcher bahasa di halaman Settings — sebelumnya cuma dekorasi (state lokal, tidak benar-benar mengubah UI), sekarang benar-benar berfungsi.

### 1.3 Pixel — AI Photo Studio (27 tools)
- Pixel diperluas dari 1 fitur (product photo) menjadi katalog **27 AI tools** setara `fluxy_studio`: hapus background, retouch, face swap, virtual try-on, product mockup, banner, carousel, image-to-prompt, tema spesial (prewedding, maternity, dll), dsb.
- Backend: `PixelFeatureCatalog` (satu sumber kebenaran prompt per tool), dukungan multi-gambar referensi (sebelumnya hanya 1), endpoint `GET /v1/ai/features`.
- Frontend: katalog tool dengan pencarian & filter kategori + workspace per tool (upload multi-gambar, instruksi, hasil langsung).
- **Bug produksi ditemukan & diperbaiki**: `GEMINI_MODEL` & `GEMINI_TEXT_MODEL` menunjuk ke model yang sudah tidak tersedia/bukan model gambar — Pixel generate image & fitur caption sempat rusak di produksi tanpa disadari.

### 1.4 Motion — AI Employee baru (Content Production Specialist)
- Replikasi fungsi **BikinIklan.ai** 1:1: brief produk lengkap (nama, deskripsi, target market, jenis konten, platform, tujuan iklan, bahasa, gaya bahasa) + pengaturan produksi visual (aspect ratio, color grading, karakter, durasi, hook style, pace editing, setting, gender karakter, musik, transisi, toggle text overlay/efek kamera, CTA eksplisit, negative prompt).
- Output: creative brief video terstruktur (Concept → Hook → Scene-by-scene → Visual Style → Audio → CTA) via Gemini.
- Kuota baru `motion` (default 30/bulan), terintegrasi ke dashboard, settings, admin config limits.

### 1.5 Luna — AI Employee baru (Lead Generation Specialist)
- Pencarian leads nyata via **Apify**, 3 mode:
  1. **Business Leads** (Google Maps) — ✅ **teruji live**, hasil nyata (nama, alamat, telepon, email, website, kategori, rating).
  2. **Company Employees** (LinkedIn) — dibangun & tervalidasi struktur request-nya, tapi terblokir oleh limit akun Apify (lihat §2).
  3. **People Search** (LinkedIn) — sama seperti di atas.
- Leads **disimpan** (beda dari Motion yang stateless) — ada riwayat, hapus per-lead, export CSV.
- Kemampuan CRM sengaja **tidak** dimasukkan sesuai arahan — akan jadi AI Employee terpisah nanti.
- Kuota baru `luna` (default 100 leads/bulan).

---

## 2. Isu Terbuka / Perlu Perhatian

| Isu | Status | Tindakan |
|---|---|---|
| Luna — mode LinkedIn (Company Employees & People Search) | Terblokir: Apify mengembalikan `"free user run limit exceeded"` | Perlu upgrade plan/tambah metode pembayaran di akun Apify (console.apify.com) — bukan bug kode. |
| Kerentanan `react-router` (CSRF bypass mode RSC) | Belum ditangani | Terdeteksi lewat `npm audit`, kemungkinan tidak eksploitable (app ini SPA client-only, bukan RSC), tapi perlu keputusan: downgrade (breaking change) atau terima risiko. |
| i18n belum mencakup semua halaman | Sebagian | Pixel, Motion, Luna, dan halaman admin masih hardcoded Bahasa Indonesia. |
| Bundle size warning (`index.js` ~500KB+) | Belum ditangani | Vite menyarankan code-splitting lebih agresif; belum berdampak nyata ke pengguna, prioritas rendah. |
| `hermes-atsuga.pem` masih ada di root project (lokal) | Aman (gitignored) | Pertimbangkan pindah ke `~/.ssh/` agar tidak tercampur dengan working directory repo. |

---

## 3. Planning ke Depan

### Prioritas dekat
1. **Selesaikan Luna sepenuhnya** — setelah akun Apify di-upgrade, uji ulang mode LinkedIn dengan data nyata (sudah pernah dicoba sekali, gagal karena limit akun, bukan karena kode).
2. **CRM AI Employee** — sesuai arahan, ini kandidat AI Employee berikutnya setelah Luna. Perlu keputusan awal: bangun dari nol (tabel kontak/pipeline sendiri) atau integrasi ke tool CRM eksternal (HubSpot/Pipedrive dsb, mirip pendekatan Luna dengan Apify).
3. **Perluas i18n** ke Pixel, Motion, Luna, dan panel admin — supaya konsisten dengan Settings/Dashboard/Auth yang sudah full bilingual.

### Prioritas menengah
- Evaluasi kerentanan `react-router` dan putuskan langkah remediasi.
- Code-splitting untuk menurunkan ukuran bundle utama.
- Pertimbangkan menambah sumber lead lain di Apify (mis. email finder, website crawler untuk riset kompetitor) jika Business Leads + LinkedIn belum cukup.

### Ide jangka panjang (belum dikonfirmasi, perlu diskusi)
- Riwayat/analytics penggunaan per-AI-Employee yang lebih detail di dashboard (tren bulanan, bukan cuma used/limit).
- Kemungkinan integrasi Motion → Pixel (brief video dari Motion otomatis jadi referensi visual untuk Pixel) atau Luna → CRM (lead otomatis masuk pipeline begitu CRM AI Employee ada).

---

_Dokumen ini dibuat sebagai ringkasan kerja, bukan spesifikasi teknis lengkap. Untuk detail arsitektur/skema, rujuk `CODEX_HANDOFF.md`._
