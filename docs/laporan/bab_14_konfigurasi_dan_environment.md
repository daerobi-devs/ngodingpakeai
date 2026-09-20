# Bab 14: Konfigurasi dan Variabel Lingkungan (Environment Variables)

## 14.1 Daftar Variabel Lingkungan
Untuk menjaga integritas dan keamanan sistem, seluruh nilai sensitif dikonfigurasikan melalui variabel lingkungan (*environment variables*). Sesuai aturan wajib audit keamanan, tabel berikut hanya mencantumkan **NAMA VARIABEL** dan fungsinya tanpa membeberkan nilai rahasia:

| Nama Variabel Lingkungan | Ruang Lingkup | Status Keharusan | Fungsi dan Deskripsi Teknis |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Publik (Client & Server) | Wajib | URL endpoint project Supabase untuk inisialisasi client API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publik (Client & Server) | Wajib | Kunci anonim publik Supabase yang dilindungi kebijakan RLS di basis data. |
| `SUPABASE_SERVICE_ROLE_KEY` | Rahasia Privat (Server Saja) | Wajib | Kunci administratif Supabase berhak akses penuh (bypass RLS) untuk operasi server backend. |
| `ADMIN_SECRET_KEY` | Rahasia Privat (Server Saja) | Opsional / Rekomendasi | Kunci rahasia induk otorisasi dasbor Super Administrator. |
| `ADMIN_PASSCODE` | Rahasia Privat (Server Saja) | Wajib | Sandi masukan untuk membuka proteksi modal halaman `/admin`. |
| `MPG_GATEWAY_URL` | Rahasia Privat (Server Saja) | Wajib | Alamat URL server API gateway pembayaran Mandiri Private Gateway (MPG). |
| `MPG_API_KEY` | Rahasia Privat (Server Saja) | Wajib | Bearer API token untuk mengautentikasi penerbitan invoice ke gateway MPG. |
| `MPG_WEBHOOK_SECRET` | Rahasia Privat (Server Saja) | Wajib | Kunci rahasia bersama untuk verifikasi tanda tangan kriptografi HMAC-SHA256 pada webhook MPG. |
| `GEMINI_API_KEY` / `GEMINI_API_KEYS`| Rahasia Privat (Server Saja) | Opsional | Kunci API cadangan Google Gemini di file environment (dapat diisi satu atau beberapa dipisah koma). |

## 14.2 Perbedaan Konfigurasi Development vs Production
1. **Lingkungan Pengembangan (Development)**:
   * Menggunakan server lokal Next.js Turbopack via perintah `npm run dev`.
   * Variabel lingkungan dimuat secara otomatis dari berkas lokal privat `.env.local`.
   * Hot Module Replacement (HMR) aktif untuk pembaruan komponen instan saat kode diedit.
2. **Lingkungan Produksi (Production)**:
   * Menggunakan kompilasi teroptimasi penuh via `npm run build`.
   * Pengaturan `output: 'standalone'` aktif pada `next.config.ts`, menyusun seluruh modul dependensi yang benar-benar digunakan ke dalam folder `.next/standalone`.
   * Dijalankan menggunakan server Node.js minimalis via perintah `node server.js` di dalam kontainer Docker.
   * Seluruh header keamanan HTTP aktif penuh (HSTS, Anti-Clickjacking, No-Sniff, DNS Prefetch).
