# Bab 16: Analisis Keamanan dan Manajemen Risiko

## 16.1 Mekanisme Keamanan yang Telah Diimplementasikan
Sistem mengintegrasikan serangkaian pertahanan berlapis (*defense-in-depth*) untuk memitigasi risiko keamanan web modern:

1. **Header Keamanan HTTP Standar Industri (`next.config.ts`)**:
   * `X-Frame-Options: SAMEORIGIN`: Mencegah serangan *Clickjacking* dengan melarang situs asing membungkus aplikasi di dalam elemen `<iframe>`.
   * `X-Content-Type-Options: nosniff`: Mencegah eksploitasi *MIME Confusion* atau *MIME Sniffing*.
   * `Referrer-Policy: strict-origin-when-cross-origin`: Menjaga kerahasiaan parameter URL sensitif saat pengguna berpindah ke domain eksternal.
   * `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Mematikan akses peramban ke perangkat keras yang tidak relevan secara eksplisit.
   * `Strict-Transport-Security (HSTS)`: Memaksa koneksi peramban selalu menggunakan jalur HTTPS terenkripsi selama 2 tahun (`max-age=63072000; includeSubDomains; preload`).
2. **Validasi Kriptografi Webhook Mandiri (HMAC-SHA256)**:
   * Pada `src/app/api/webhook/payment-success/route.ts`, setiap notifikasi pembayaran dari gateway MPG wajib menyertakan header `X-Signature`. Sistem menghitung nilai digest hash:
     ```typescript
     const expectedSignature = crypto
       .createHmac('sha256', webhookSecret)
       .update(rawBody)
       .digest('hex');
     ```
   * Jika nilai hash tidak cocok persis dengan header yang dikirimkan, request langsung ditolak dengan status HTTP 401 Unauthorized, mencegah serangan pemalsuan status transaksi (*Payment Spoofing*).
3. **Idempotensi Pemrosesan Pembayaran**:
   * Handler webhook memeriksa status pesanan di basis data sebelum melakukan eskalasi hak akun. Jika pesanan sudah berstatus `approved` atau `paid`, handler segera mengembalikan HTTP 200 tanpa memicu perpanjangan ganda (*Double Spending / Replay Attack Mitigation*).
4. **Pencegahan SQL Injection**:
   * Seluruh interaksi basis data menggunakan pustaka Supabase Client yang memanfaatkan kueri berparameter (*parameterized queries / prepared statements*) bawaan PostgREST, meniadakan risiko injeksi perintah SQL mentah dari masukan pengguna.
5. **Penegakan Skema Ketat dengan Zod (Input & Output Sanitization)**:
   * Seluruh data yang masuk dari pengguna maupun respons JSON yang kembali dari model AI divalidasi secara struktural menggunakan pustaka *Zod* di `src/lib/gemini/schemas.ts`, memastikan tidak ada injeksi skrip berbahaya (*XSS*) atau struktur data anomali yang dapat merusak aplikasi.

## 16.2 Temuan Risiko Keamanan dan Rekomendasi Mitigasi
Dari hasil audit mendalam terhadap kode sumber, ditemukan beberapa hal penting yang perlu dicatat dan ditingkatkan:

1. **Verifikasi Passcode Admin Sederhana pada `/api/admin`**:
   * *Temuan*: Rute administrasi memvalidasi akses melalui header `x-admin-passcode` yang dicocokkan dengan teks statis di tabel `system_settings.admin_passcode` atau `ADMIN_PASSCODE` (lihat: `src/app/api/admin/route.ts`).
   * *Risiko*: Rentan terhadap serangan tebak kata sandi (*Brute Force Attack*) jika penyerang mengetahui endpoint tersebut.
   * *Rekomendasi*: Terapkan rate limiting ketat berbasis IP (misal via Upstash Redis) pada rute `/api/admin`, serta tambahkan autentikasi multi-faktor (MFA / TOTP) untuk akun Super Administrator.
2. **Ketiadaan Rate Limiting Bawaan di Route Publik API**:
   * *Temuan*: Endpoint publik seperti `POST /api/enrich-idea` dan `POST /api/generate-clarifications` belum dilengkapi dengan middleware *rate limiting* berbasis IP (seperti `@upstash/ratelimit`).
   * *Risiko*: Risiko pemborosan kuota API Gemini (*Denial of Wallet / API Quota Exhaustion*) jika ada pihak yang melakukan panggilan HTTP secara masif menggunakan skrip otomatis (*bot abuse*).
   * *Rekomendasi*: Pasang layer rate limiting berbasis Cloudflare WAF di tingkat DNS atau implementasikan middleware Redis token-bucket pada Next.js middleware.
