# Fluxy.id — Product Requirements Document

**Your AI-Powered Workforce Starts Here.**

Platform AI Employees untuk Social Media, Content Marketing, Lead Generation, dan Sales Automation bagi UMKM & E-commerce

| | |
|---|---|
| **Versi Dokumen** | 1.1 (Draft) — revisi: integrasi API langsung, tanpa Blotato/Ping.co.id (Zernio) |
| **Tanggal** | 6 Juli 2026 |
| **Status** | Draft — untuk direview |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Tujuan](#2-latar-belakang--tujuan)
3. [Target Pengguna & Peran](#3-target-pengguna--peran)
4. [Ruang Lingkup Produk](#4-ruang-lingkup-produk)
5. [Model Bisnis & Monetisasi](#5-model-bisnis--monetisasi)
6. [Arsitektur & Tech Stack](#6-arsitektur--tech-stack)
7. [Sistem Multi-Tenant](#7-sistem-multi-tenant)
8. [Alur Autentikasi & Onboarding](#8-alur-autentikasi--onboarding)
9. [Modul Fungsional — AI Employees](#9-modul-fungsional--ai-employees)
10. [Panel Admin Fluxy](#10-panel-admin-fluxy)
11. [Batasan Layanan (Usage Limits)](#11-batasan-layanan-usage-limits)
12. [Kebutuhan Non-Fungsional](#12-kebutuhan-non-fungsional)
13. [Asumsi & Ketergantungan](#13-asumsi--ketergantungan)
14. [Di Luar Ruang Lingkup (Out of Scope) & Roadmap](#14-di-luar-ruang-lingkup-out-of-scope--roadmap)
15. [Lampiran: Daftar Fungsionalitas Lengkap](#15-lampiran-daftar-fungsionalitas-lengkap)

---

## 1. Ringkasan Eksekutif

Fluxy.id adalah platform SaaS multi-tenant yang menghadirkan "AI Employees" — asisten AI yang berperan sebagai karyawan digital untuk membantu bisnis, khususnya UMKM, pelaku e-commerce, dan social media specialist, dalam menjalankan operasional social media, content marketing, lead generation, dan sales automation.

Pada versi pertama (MVP), Fluxy.id akan menghadirkan 4 AI Employee dengan peran spesifik masing-masing:

- **Pixel** — Desainer Kreatif: mengedit dan menggenerate foto produk untuk kebutuhan feed & story.
- **Maya** — Manajer & Publisher Media Sosial: menjadwalkan dan mempublikasikan konten ke Instagram & TikTok.
- **Echo** — Analis Media Sosial: menyajikan data analitik performa konten dan akun.
- **Kai** — Sales Development Representative: menjalankan broadcast WhatsApp dan chatbot sales otomatis.

Platform dibangun dengan arsitektur multi-tenant (1 tenant = 1 user/bisnis) dengan model bisnis subscription bulanan yang diaktifkan secara manual oleh Admin Fluxy, tanpa payment gateway otomatis pada versi ini.

---

## 2. Latar Belakang & Tujuan

### 2.1 Latar Belakang

UMKM dan pelaku e-commerce di Indonesia menghadapi keterbatasan sumber daya (waktu, tenaga, keahlian) untuk mengelola kebutuhan digital marketing secara konsisten — mulai dari membuat konten visual, menjadwalkan posting, menganalisis performa, hingga menindaklanjuti calon pelanggan. Merekrut tim khusus untuk tiap fungsi ini seringkali tidak efisien dari segi biaya.

Fluxy.id hadir sebagai solusi dengan menawarkan "tenaga kerja digital" berbasis AI yang dapat disewa secara langganan, menggantikan atau mendampingi fungsi-fungsi tersebut dengan biaya yang jauh lebih terjangkau.

### 2.2 Tujuan Produk

1. Menyediakan platform terpusat di mana bisnis dapat "mempekerjakan" AI Employee sesuai kebutuhan fungsional mereka.
2. Mengotomatisasi proses pembuatan konten visual, publikasi media sosial, analisis performa, dan sales follow-up.
3. Memungkinkan Admin Fluxy mengelola dan memonitor seluruh tenant secara terpusat.
4. Membangun fondasi arsitektur yang scalable untuk penambahan AI Employee baru di masa depan.

---

## 3. Target Pengguna & Peran

### 3.1 Segmen Target Pengguna

- UMKM (Usaha Mikro, Kecil, dan Menengah)
- Pelaku E-commerce
- Social Media Specialist / Freelancer yang mengelola akun sosial media klien

### 3.2 Peran (Role) dalam Sistem

| Role | Deskripsi | Akses Utama |
|---|---|---|
| **Admin Fluxy** | Pengelola internal platform Fluxy.id | Approve/reject pendaftaran tenant, monitoring seluruh tenant, mengatur status & masa aktif subscription, konfigurasi batasan (limit) layanan, melihat log penggunaan seluruh AI Employee |
| **User (Tenant)** | Pengguna bisnis yang berlangganan Fluxy.id (1 tenant = 1 user/bisnis) | Akses penuh ke 4 AI Employee dalam workspace tenant miliknya sendiri (data terisolasi dari tenant lain) |

> Catatan: Pada versi ini, struktur tenant bersifat 1 tenant = 1 user (belum ada multi-user/sub-akun dalam satu tenant). Kebutuhan multi-user per tenant dapat menjadi pertimbangan pengembangan berikutnya.

---

## 4. Ruang Lingkup Produk

### 4.1 Dalam Ruang Lingkup (In Scope) — Versi 1.0

- Sistem autentikasi & onboarding dengan approval manual oleh Admin Fluxy
- Panel Admin Fluxy untuk mengelola tenant, subscription, dan monitoring
- Workspace tenant dengan 4 AI Employee: Pixel, Maya, Echo, Kai
- Integrasi langsung ke API resmi masing-masing platform: Instagram Graph API & TikTok API (Maya, Echo), WhatsApp Cloud API (Kai), dan AI Image Generation API pihak ketiga (Pixel) — tanpa wrapper/whitelabel pihak ketiga
- Sistem batasan penggunaan (usage limit) per tenant berdasarkan status subscription

### 4.2 Di Luar Ruang Lingkup (Out of Scope) — Versi 1.0

- Payment gateway otomatis (pembayaran & perpanjangan subscription dilakukan manual oleh Admin Fluxy)
- Multi-user dalam satu tenant (sub-akun/staff dalam satu bisnis)
- AI Employee tambahan di luar Pixel, Maya, Echo, Kai
- Dukungan platform media sosial selain Instagram dan TikTok
- Aplikasi mobile native (versi 1.0 fokus pada web)

---

## 5. Model Bisnis & Monetisasi

Fluxy.id menggunakan model subscription bulanan. Pada versi ini, aktivasi dan perpanjangan subscription dilakukan secara manual oleh Admin Fluxy — belum ada integrasi payment gateway.

- Satu paket subscription mencakup akses ke seluruh 4 AI Employee (Pixel, Maya, Echo, Kai) dengan batasan (limit) penggunaan tertentu per bulan.
- Admin Fluxy bertanggung jawab mengatur tanggal aktif dan tanggal kedaluwarsa (expired date) subscription tiap tenant.
- Jika subscription tenant kedaluwarsa, akses ke seluruh AI Employee otomatis dinonaktifkan (status: expired) sampai diperpanjang kembali oleh Admin Fluxy.
- Struktur ini disiapkan agar mudah dikembangkan menjadi model tiering (Basic/Pro/Enterprise) dan payment gateway otomatis di masa depan.

---

## 6. Arsitektur & Tech Stack

| Komponen | Teknologi | Keterangan |
|---|---|---|
| Backend | Laravel (PHP) | REST API, business logic, job queue untuk proses async (scheduling, broadcast) |
| Database | PostgreSQL | Data relasional dengan isolasi data per tenant |
| Frontend | React | Web app (SPA) untuk Admin Fluxy & User Tenant |
| Integrasi Maya & Echo | Instagram Graph API (Meta) & TikTok API (Content Posting + Analytics) | Koneksi akun via OAuth resmi, publish/scheduling internal, dan data analitik langsung dari tiap platform |
| Integrasi Kai (SDR) | WhatsApp Cloud API (Meta, langsung) | Koneksi WABA via Meta Business, broadcast WhatsApp, chatbot sales — tanpa BSP pihak ketiga |
| Integrasi Pixel | AI Image Generation API pihak ketiga (mis. Google Gemini/Imagen) | Generate/edit gambar produk sesuai rasio yang diminta |

### 6.1 Pertimbangan Arsitektur

- Setiap request ke Instagram Graph API, TikTok API, WhatsApp Cloud API, dan AI Image Generation API disimpan referensinya (log/history) di database internal agar data tetap tersedia meski API pihak ketiga mengalami perubahan atau downtime.
- Proses yang bersifat asinkron (generate gambar, publish terjadwal, broadcast WA) dijalankan melalui job queue agar tidak memblokir request utama.
- Karena Instagram dan TikTok tidak menyediakan native scheduling penuh melalui API-nya, Fluxy.id membangun scheduler internal (job queue + cron) yang memicu pemanggilan API publish tepat pada waktu yang dijadwalkan Maya.
- Business Verification Meta (untuk Instagram Graph API & WhatsApp Cloud API) serta App Audit TikTok wajib diselesaikan sebelum fitur publikasi/broadcast dapat digunakan secara production — proses ini butuh dokumentasi use-case, screencast, dan waktu review dari pihak platform.
- Access token OAuth (Instagram, TikTok) dan token WhatsApp Business memiliki masa berlaku terbatas; sistem perlu mekanisme refresh token otomatis dan notifikasi ke tenant bila re-autentikasi manual diperlukan.
- Rate limit tiap platform (misalnya TikTok API dibatasi sekitar 6 request/menit/user, serta rate limit bertingkat pada Meta Graph API) ditangani melalui throttling dan retry di level job queue.
- Kredensial pihak ketiga (access token Meta, TikTok, WhatsApp Business, API key AI Image Generation) disimpan terenkripsi dan diasosiasikan per tenant.

---

## 7. Sistem Multi-Tenant

- Struktur: 1 tenant = 1 user/bisnis. Setiap tenant memiliki data yang terisolasi penuh (gambar, jadwal konten, data analitik, lead, riwayat chat) dan tidak dapat diakses oleh tenant lain.
- Admin Fluxy memiliki akses lintas tenant untuk keperluan monitoring dan pengelolaan, namun tidak mengubah/menghapus data operasional tenant tanpa keperluan support.
- Setiap tenant memiliki konfigurasi kredensial integrasi masing-masing (akun Instagram/TikTok yang terhubung via OAuth resmi, nomor WABA yang terhubung langsung ke WhatsApp Cloud API/Meta Business).

### 7.1 Kontrol Admin Fluxy per Tenant

- Melihat daftar seluruh tenant beserta status (pending, active, expired, suspended)
- Approve / reject pendaftaran tenant baru
- Mengatur tanggal mulai & kedaluwarsa subscription
- Menonaktifkan (suspend) tenant secara manual jika diperlukan
- Melihat ringkasan penggunaan (usage) tiap tenant terhadap limit yang berlaku

---

## 8. Alur Autentikasi & Onboarding

### 8.1 Metode Login

- Email & password
- Login sosial via Google (Google OAuth)

### 8.2 Alur Registrasi Tenant Baru

1. User mengisi form registrasi: nama bisnis, kategori industri, email, password (atau daftar via Google), dan data kontak dasar.
2. Setelah submit, akun berstatus "Pending Approval" — user diarahkan ke halaman "Menunggu Persetujuan" dan tidak dapat mengakses workspace/AI Employee.
3. Admin Fluxy menerima notifikasi pendaftaran baru di panel admin dan meninjau data tenant.
4. Admin Fluxy melakukan Approve (mengatur tanggal aktif & expired subscription) atau Reject (dengan alasan) pendaftaran tersebut.
5. Jika di-approve, user menerima notifikasi (email) dan dapat login untuk mulai menggunakan workspace beserta 4 AI Employee-nya.
6. Jika di-reject, user menerima notifikasi beserta alasan penolakan (opsional dapat mendaftar ulang).

---

## 9. Modul Fungsional — AI Employees

### 9.1 Pixel — Desainer Kreatif

Peran: membantu tenant mengedit dan menggenerate ulang foto produk untuk kebutuhan konten feed dan story, memanfaatkan AI Image Generation API pihak ketiga secara langsung (tanpa wrapper).

**Input dari User**
- Bahan foto produk (upload gambar)
- Deskripsi gaya desain yang diinginkan (prompt/brief gaya visual)
- Pilihan rasio output: 1:1 (feed) atau 9:16 (story)

**Proses**
- Sistem mengirim foto + brief gaya ke AI Image Generation API pihak ketiga untuk diproses (generate/edit gambar berbasis AI)
- Hasil yang diterima dari API disimpan ke storage internal dan diasosiasikan ke tenant terkait

**Output**
- Gambar produk hasil edit AI (foto produk maupun materi iklan) sesuai rasio yang dipilih
- Riwayat/gallery seluruh hasil generate per tenant, dapat diakses & diunduh kembali kapan saja

**Fungsionalitas Detail**
- Upload foto produk (single/multiple)
- Input brief/gaya desain (teks)
- Pilih rasio output (1:1 / 9:16)
- Generate/edit gambar via AI Image Generation API pihak ketiga
- Simpan otomatis ke gallery per tenant
- Lihat, unduh, dan hapus hasil dari gallery
- Generate ulang (regenerate) dengan brief baru dari foto yang sama

### 9.2 Maya — Manajer & Publisher Media Sosial

Peran: mengelola penjadwalan dan publikasi konten ke akun Instagram dan TikTok tenant, langsung melalui Instagram Graph API (Meta) dan TikTok Content Posting API.

**Fungsionalitas Detail**
- Hubungkan akun Instagram dan/atau TikTok tenant via OAuth resmi masing-masing platform (Meta Login for Business, TikTok Login Kit)
- Upload/pilih konten (gambar dari Pixel atau upload manual) beserta caption
- Posting langsung (post now) ke platform yang dipilih
- Penjadwalan kustom: memilih tanggal & jam posting untuk beberapa hari sekaligus (tidak berulang/non-recurring)
- Kalender konten: tampilan kalender yang menunjukkan seluruh konten terjadwal per tanggal
- Edit atau batalkan jadwal konten yang belum terpublikasi
- Status publikasi per konten (terjadwal, terpublikasi, gagal)

**Batasan Versi Ini**
- Platform yang didukung: Instagram dan TikTok saja
- Penjadwalan bersifat non-recurring (tidak ada pengulangan otomatis)

### 9.3 Echo — Analis Media Sosial

Peran: menyajikan data analitik performa akun dan konten tenant, diambil langsung dari Instagram Graph API (Insights) dan TikTok Analytics API.

**Fungsionalitas Detail**
- Dashboard analitik per platform (Instagram, TikTok)
- Metrik performa per konten (contoh: reach, likes, comments, shares, views — sesuai data yang tersedia dari Instagram Insights API dan TikTok Analytics API)
- Metrik performa akun secara keseluruhan (ringkasan periode tertentu)
- Filter data berdasarkan rentang tanggal dan platform
- Export laporan analitik dalam format PDF dan Excel

### 9.4 Kai — Sales Development Representative

Peran: menjalankan broadcast WhatsApp dan chatbot sales otomatis untuk menindaklanjuti calon pelanggan, langsung melalui WhatsApp Cloud API (Meta), tanpa BSP/whitelabel pihak ketiga.

**Input dari User**
- Nomor WABA (WhatsApp Business Account) milik tenant, dihubungkan ke sistem melalui Meta Embedded Signup dan proses Business Verification
- File CSV data produk berisi kolom: nama produk, stok, dan harga (referensi/link CSV dapat berubah sewaktu-waktu dan sistem perlu menyesuaikan)

**Fitur Broadcast**
- Kirim pesan broadcast ke satu atau beberapa grup/daftar kontak sekaligus
- Riwayat broadcast yang telah dikirim (status terkirim/gagal)

**Fitur Chatbot Sales**
- Chatbot generatif yang dapat menjawab pertanyaan pelanggan terkait produk secara kontekstual (mengacu pada data CSV produk)
- Kombinasi dengan skenario/flow tertentu untuk alur percakapan yang lebih terstruktur (contoh: penyapaan, penawaran, FAQ)
- Chatbot menjawab pertanyaan produk sampai sebelum tahap pembayaran
- Human handover: saat percakapan mencapai tahap sebelum payment, sistem mengirim notifikasi ke user/admin tenant agar dapat melanjutkan follow-up secara manual
- Riwayat percakapan chatbot per lead/kontak

---

## 10. Panel Admin Fluxy

### 10.1 Manajemen Tenant

- Daftar seluruh tenant beserta status (pending, active, expired, suspended)
- Detail tenant: data bisnis, kontak, riwayat subscription, riwayat penggunaan
- Approve / Reject pendaftaran tenant baru
- Set / update tanggal aktif & kedaluwarsa subscription
- Suspend / reaktivasi tenant

### 10.2 Monitoring

- Ringkasan penggunaan tiap AI Employee per tenant terhadap limit yang berlaku
- Log aktivitas tenant (generate gambar, publikasi, broadcast, dsb.)

### 10.3 Konfigurasi

- Pengaturan batasan (limit) penggunaan default per AI Employee
- Pengelolaan kredensial integrasi tingkat platform (App ID/Secret Meta untuk Instagram & WhatsApp Cloud API, App credentials TikTok, API key AI Image Generation)

---

## 11. Batasan Layanan (Usage Limits)

Karena belum terdapat payment gateway otomatis dan sistem masih menggunakan satu paket subscription untuk seluruh 4 AI Employee, berikut usulan batasan default per tenant per bulan. Nilai ini dapat dikonfigurasi oleh Admin Fluxy melalui panel admin (bukan angka final/hardcode):

| AI Employee | Batasan Default / Bulan | Catatan |
|---|---|---|
| Pixel | 50 generate/edit gambar | Reset di awal siklus subscription; dapat disesuaikan Admin Fluxy per tenant |
| Maya | 60 post terjadwal/terpublikasi | Berlaku gabungan untuk Instagram + TikTok |
| Echo | Unlimited (view & export) | Analitik bersifat pelaporan, tidak menimbulkan beban biaya API signifikan |
| Kai | 1.000 pesan broadcast | Berlaku gabungan seluruh grup/daftar kontak; chatbot balasan tidak dibatasi secara ketat namun dimonitor |

Jika limit tercapai sebelum akhir periode, sistem menampilkan notifikasi kepada user bahwa kuota bulan berjalan telah habis, dan mengarahkan untuk menghubungi Admin Fluxy jika membutuhkan penyesuaian.

---

## 12. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| Skalabilitas | Arsitektur mendukung pertumbuhan jumlah tenant dari skala kecil di awal menuju skala menengah/besar tanpa perombakan struktur data |
| Keamanan Data | Isolasi data antar tenant, enkripsi kredensial pihak ketiga (API key, token WABA), enkripsi password, HTTPS untuk seluruh komunikasi |
| Ketersediaan | Proses kritikal (publikasi terjadwal, broadcast) menggunakan job queue dengan retry mechanism jika API pihak ketiga gagal sementara |
| Auditability | Log aktivitas penting (approval tenant, perubahan limit, aktivitas AI Employee) tersimpan untuk kebutuhan audit |
| Performa | Waktu respon halaman utama & dashboard < 2 detik pada kondisi jaringan normal |

---

## 13. Asumsi & Ketergantungan

- Kapabilitas generate/edit gambar bergantung pada ketersediaan dan kebijakan AI Image Generation API pihak ketiga yang dipilih tim (mis. Google Gemini/Imagen).
- Kapabilitas publikasi dan analitik media sosial bergantung sepenuhnya pada ketersediaan, kebijakan, dan rate limit resmi dari Instagram Graph API (Meta) dan TikTok API — termasuk perubahan kebijakan sepihak dari kedua platform yang di luar kendali Fluxy.id.
- Kapabilitas WhatsApp (broadcast & chatbot) bergantung pada ketersediaan WhatsApp Cloud API (Meta) dan status Business Verification serta koneksi WABA milik tenant.
- Proses Business Verification Meta (Instagram Graph API & WhatsApp Cloud API) dan App Audit TikTok adalah prasyarat sebelum fitur publikasi/broadcast dapat digunakan secara production; estimasi waktu proses ini (dapat memakan beberapa minggu, termasuk risiko penolakan/resubmit) perlu dialokasikan dalam timeline pengembangan.
- Format dan struktur data CSV produk mengikuti ketentuan yang ditetapkan sistem (nama produk, stok, harga); perubahan struktur oleh user perlu penyesuaian ulang.
- Perpanjangan/pengaktifan subscription bergantung pada proses manual Admin Fluxy di luar sistem (misal konfirmasi pembayaran melalui transfer bank/kanal lain).
- Nilai batasan (limit) pada Bab 11 adalah usulan awal dan dapat berubah setelah diskusi lebih lanjut dengan tim bisnis.

---

## 14. Di Luar Ruang Lingkup (Out of Scope) & Roadmap

### 14.1 Roadmap Selanjutnya (Indikatif)

- Integrasi payment gateway otomatis (Midtrans/Xendit) untuk aktivasi & perpanjangan subscription mandiri
- Model tiering paket subscription (Basic/Pro/Enterprise) dengan limit berbeda
- Dukungan multi-user dalam satu tenant (role staff/admin internal tenant)
- Penambahan AI Employee baru sesuai kebutuhan bisnis
- Dukungan platform media sosial tambahan (Facebook, LinkedIn, dll.)
- Penjadwalan konten berulang (recurring schedule) pada Maya
- Aplikasi mobile

---

## 15. Lampiran: Daftar Fungsionalitas Lengkap

### 15.1 Autentikasi & Onboarding

| No | Fungsionalitas | Aktor |
|---|---|---|
| 1 | Registrasi akun tenant baru (form: nama bisnis, kategori industri, email, password) | User |
| 2 | Login via Google OAuth | User |
| 3 | Login via email & password | User / Admin |
| 4 | Halaman "Pending Approval" pasca registrasi | User |
| 5 | Notifikasi pendaftaran baru masuk | Admin Fluxy |
| 6 | Approve pendaftaran tenant | Admin Fluxy |
| 7 | Reject pendaftaran tenant (dengan alasan) | Admin Fluxy |
| 8 | Notifikasi hasil approval/reject ke user | Sistem |

### 15.2 Panel Admin Fluxy

| No | Fungsionalitas | Aktor |
|---|---|---|
| 9 | Lihat daftar seluruh tenant & status | Admin Fluxy |
| 10 | Lihat detail tenant (data bisnis, riwayat, penggunaan) | Admin Fluxy |
| 11 | Set/update tanggal aktif & expired subscription | Admin Fluxy |
| 12 | Suspend / reaktivasi tenant | Admin Fluxy |
| 13 | Lihat ringkasan penggunaan tiap AI Employee per tenant | Admin Fluxy |
| 14 | Lihat log aktivitas tenant | Admin Fluxy |
| 15 | Konfigurasi batasan (limit) default per AI Employee | Admin Fluxy |
| 16 | Kelola kredensial integrasi tingkat platform | Admin Fluxy |

### 15.3 Pixel — Desainer Kreatif

| No | Fungsionalitas | Aktor |
|---|---|---|
| 17 | Upload foto produk (single/multiple) | User |
| 18 | Input brief/gaya desain (teks) | User |
| 19 | Pilih rasio output (1:1 / 9:16) | User |
| 20 | Generate/edit gambar via AI Image Generation API | Sistem |
| 21 | Simpan hasil ke gallery per tenant | Sistem |
| 22 | Lihat, unduh, hapus hasil dari gallery | User |
| 23 | Regenerate dengan brief baru dari foto yang sama | User |

### 15.4 Maya — Manajer & Publisher Media Sosial

| No | Fungsionalitas | Aktor |
|---|---|---|
| 24 | Hubungkan akun Instagram/TikTok via OAuth resmi (Meta & TikTok) | User |
| 25 | Upload/pilih konten & tulis caption | User |
| 26 | Post sekarang (post now) | User |
| 27 | Jadwalkan posting kustom (multi-hari, non-recurring) | User |
| 28 | Tampilan kalender konten terjadwal | User |
| 29 | Edit/batalkan jadwal yang belum tayang | User |
| 30 | Lihat status publikasi (terjadwal/terpublikasi/gagal) | User |

### 15.5 Echo — Analis Media Sosial

| No | Fungsionalitas | Aktor |
|---|---|---|
| 31 | Dashboard analitik per platform | User |
| 32 | Metrik performa per konten | User |
| 33 | Metrik performa akun (ringkasan periode) | User |
| 34 | Filter data berdasarkan tanggal & platform | User |
| 35 | Export laporan ke PDF | User |
| 36 | Export laporan ke Excel | User |

### 15.6 Kai — Sales Development Representative

| No | Fungsionalitas | Aktor |
|---|---|---|
| 37 | Hubungkan nomor WABA ke sistem | User |
| 38 | Upload/atur link CSV data produk (nama, stok, harga) | User |
| 39 | Kirim broadcast ke satu/beberapa grup kontak | User |
| 40 | Lihat riwayat broadcast (status terkirim/gagal) | User |
| 41 | Chatbot menjawab pertanyaan produk secara generatif + flow | Sistem |
| 42 | Human handover: notifikasi ke user/admin tenant sebelum tahap payment | Sistem |
| 43 | Lihat riwayat percakapan chatbot per lead | User |

### 15.7 Sistem Batasan & Langganan

| No | Fungsionalitas | Aktor |
|---|---|---|
| 44 | Enforce limit penggunaan bulanan per AI Employee | Sistem |
| 45 | Notifikasi kuota hampir/telah habis | Sistem |
| 46 | Nonaktifkan akses otomatis saat subscription expired | Sistem |

### 15.8 Manajemen Integrasi Platform Langsung

| No | Fungsionalitas | Aktor |
|---|---|---|
| 47 | Refresh otomatis access token OAuth (Instagram, TikTok) sebelum kedaluwarsa | Sistem |
| 48 | Notifikasi ke tenant bila re-autentikasi manual diperlukan (token gagal refresh) | Sistem |
| 49 | Webhook receiver status pengiriman/publikasi per platform (delivered/failed) | Sistem |
| 50 | Retry & throttling otomatis saat terkena rate limit platform | Sistem |
| 51 | Tracking status Business Verification (Meta) & App Audit (TikTok) per tenant | Admin Fluxy |
