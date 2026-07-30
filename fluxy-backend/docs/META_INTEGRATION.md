# Integrasi Meta untuk Fluxy

Integrasi ini menghubungkan Facebook Page, Instagram Professional, dan WhatsApp Cloud API ke tenant Fluxy. Token tidak pernah dikirim ke frontend, disembunyikan dari respons API, dan disimpan memakai enkripsi Laravel.

## Fitur yang sudah tersedia

- Sinkronisasi Facebook Page, Instagram Professional yang terhubung ke Page, WABA, dan nomor WhatsApp dari aset yang ditugaskan ke System User.
- Publikasi Facebook Page berupa feed atau carousel gambar.
- Publikasi Instagram berupa feed, carousel, Story gambar, dan Reel.
- Webhook WhatsApp dengan verifikasi callback, validasi `X-Hub-Signature-256`, dan deduplikasi berdasarkan ID pesan Meta.
- Percakapan WhatsApp, Facebook Messenger, dan Instagram DM masuk tampil di Kai dan dapat dibalas dari thread percakapan.
- Pengiriman terjadwal Maya memakai konektor Meta yang sama.

## Kredensial yang dibutuhkan

Isi melalui **Admin → Konfigurasi → Kredensial Platform** atau secret manager hosting:

| Field | Environment variable | Keterangan |
| --- | --- | --- |
| Meta App ID | `META_APP_ID` | ID App Fluxy di Meta for Developers |
| Meta App Secret | `META_APP_SECRET` | Dipakai untuk `appsecret_proof` dan validasi webhook |
| Meta Business ID | `META_BUSINESS_ID` | Business Portfolio yang memiliki aset |
| Meta System User Token | `META_SYSTEM_USER_TOKEN` | Token `fluxy-bot` dengan aset dan permission yang diperlukan |
| Meta Webhook Verify Token | `META_WEBHOOK_VERIFY_TOKEN` | String acak minimal 16 karakter yang sama dengan konfigurasi webhook Meta |

Graph version dapat diganti lewat `META_GRAPH_VERSION`. Default proyek saat ini `v24.0`.

Permission Instagram yang benar untuk publishing adalah `instagram_content_publish`. Pastikan token juga memiliki permission Page dan WhatsApp yang sesuai sebelum sinkronisasi.

## Aktivasi

1. Jalankan migrasi database: `php artisan migrate`.
2. Simpan lima nilai Meta di panel admin. Jangan commit token ke repository.
3. Pilih tenant tujuan lalu klik **Sinkronkan Meta**. Alternatif server: `php artisan meta:sync-assets {tenant-id-atau-slug}`.
4. Gunakan callback URL publik `https://DOMAIN-BACKEND/api/v1/meta/webhook` di dashboard Meta.
5. Masukkan nilai Webhook Verify Token yang sama, lalu subscribe field `messages` untuk WhatsApp Business Account serta objek messaging Page/Instagram yang dipakai.
6. Kirim pesan percobaan ke WhatsApp, Facebook Page, dan Instagram Professional. Pesan masuk akan membuat atau memperbarui percakapan Kai sesuai kanal.
7. Buat konten Maya dengan akun Facebook atau Instagram hasil sinkronisasi untuk menguji publishing.

Media Instagram harus berupa URL HTTPS publik karena Meta mengambil file tersebut dari server Fluxy. Scheduler Laravel juga harus berjalan di production agar konten terjadwal benar-benar dipublikasikan.

## Batasan penting untuk SaaS multi-tenant

System User Token `fluxy-bot` hanya dapat mengakses aset yang secara eksplisit ditugaskan kepadanya. Mekanisme ini cocok untuk aset internal dan pilot customer yang dikelola di Business Portfolio yang sama.

Untuk onboarding customer SaaS secara mandiri, tahap berikutnya adalah Facebook Login for Business dan WhatsApp Embedded Signup. Setiap customer harus memberi izin sendiri dan Fluxy harus menyimpan token mereka pada tenant masing-masing; jangan membagikan satu System User Token ke semua customer.

WhatsApp Cloud API mengirim pesan ke nomor individual, bukan grup WhatsApp biasa. Pesan bebas juga tunduk pada customer-service window WhatsApp; follow-up di luar window harus memakai message template yang disetujui Meta.

## Pengujian

```bash
php artisan test
```

Test suite memakai HTTP fake dan tidak mengirim konten atau pesan sungguhan ke Meta.
