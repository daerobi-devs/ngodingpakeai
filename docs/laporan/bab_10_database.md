# Bab 10: Basis Data dan Pemodelan Data

## 10.1 Arsitektur Basis Data
Sistem menggunakan basis data relasional **PostgreSQL versi 15** yang di-host di lingkungan terkelola Supabase Cloud. Struktur skema menggabungkan kekuatan integritas referensial relasional (*Foreign Keys*, *Cascading Deletes*, *Unique Constraints*) dengan fleksibilitas kolom dokumen terstruktur (*PostgreSQL JSONB Storage*) untuk menyimpan objek dokumen PRD yang kompleks dan dinamis.

## 10.2 Dokumentasi Skema Tabel
Berdasarkan skrip skema resmi `supabase_schema.sql`, `supabase_migration_v2.sql`, dan `supabase_migration_mpg.sql`, basis data terdiri dari 5 tabel inti:

### 1. Tabel `public.profiles`
Menyimpan profil pengguna yang diekstensi secara relasional 1-to-1 dari tabel otentikasi inti Supabase `auth.users(id)`:
* `id` (UUID, Primary Key, Foreign Key -> `auth.users(id)` ON DELETE CASCADE): ID unik akun pengguna.
* `email` (TEXT): Alamat surat elektronik terdaftar pengguna.
* `full_name` (TEXT): Nama lengkap pengguna dari metadata Google OAuth atau registrasi.
* `avatar_url` (TEXT): Tautan URL foto profil pengguna.
* `subscription_tier` (TEXT, DEFAULT `'free'`): Tingkatan akses akun (`'free'`, `'pro'`, `'unlimited'`).
* `trial_count` (INTEGER, DEFAULT 0): Jumlah generasi PRD yang telah dieksekusi pengguna.
* `is_admin` (BOOLEAN, DEFAULT false): Penanda hak istimewa Super Administrator.
* `pro_expires_at` (TIMESTAMPTZ): Waktu kedaluwarsa masa aktif langganan tier Pro/Plus.
* `assigned_gemini_slot` (TEXT): Alokasi slot kunci Gemini privat yang dipin khusus untuk pengguna ini.
* `is_banned` (BOOLEAN, DEFAULT false): Status pemblokiran akun pengguna dari sistem.
* `daily_limit_override` (INTEGER): Kuota batas harian khusus jika admin memberi dispensasi melebihi batas default.
* `total_server_tokens` (INTEGER, DEFAULT 0): Akumulasi pemakaian token server oleh pengguna.
* `created_at` / `updated_at` (TIMESTAMPTZ): Timestamp jejak audit pembuatan dan pembaruan data.

### 2. Tabel `public.system_settings`
Menyimpan konfigurasi terpusat sistem berbasis pola baris tunggal (*Singleton Pattern*) dengan `id = 'default'`:
* `id` (TEXT, Primary Key, DEFAULT `'default'`).
* `auth_mode` (TEXT, DEFAULT `'hybrid'`): Kebijakan akses akun (`'free_access'`, `'hybrid'`, `'strict_login'`).
* `api_key_mode` (TEXT, DEFAULT `'server_managed'`): Mode kunci AI (`'byok_only'`, `'server_managed'`).
* `monetization_mode` (TEXT, DEFAULT `'freemium'`): Kebijakan monetisasi (`'free_forever'`, `'freemium'`, `'paywall_strict'`).
* `ai_provider` (TEXT, DEFAULT `'gemini_direct'`): Penyedia LLM aktif (`'gemini_direct'`, `'nine_router'`, `'openrouter'`).
* `gemini_slots` (JSONB, DEFAULT `'[]'`): Array objek slot kunci Gemini (`[{ id, key, label, isActive, preferredModel }]`).
* `payment_gateway_mode` (TEXT, DEFAULT `'manual_qris'`): Mode checkout pembayaran aktif (`'manual_qris'`, `'mpg_automatic'`, `'mpg_headless'`, `'mpg_hosted'`).
* `mpg_gateway_url` (TEXT): URL server gateway Mandiri Private Gateway (MPG).
* `mpg_api_key` (TEXT): Bearer token API untuk autentikasi ke gateway MPG.
* `mpg_webhook_secret` (TEXT): Secret key tanda tangan kriptografi HMAC-SHA256 untuk memvalidasi webhook masuk.
* `trial_limit` (INTEGER, DEFAULT 1): Batas generasi PRD gratis untuk pengguna tamu/anonim.
* `qris_merchant_name` (TEXT): Nama merchant QRIS GoBiz manual.
* `qris_gopay_number` (TEXT): Nomor telepon akun GoPay manual.
* `qris_image_url` (TEXT): URL gambar barcode QRIS statis.
* `pro_price_rp` (INTEGER, DEFAULT 49000): Harga paket Pro dalam nominal Rupiah.
* `pro_price_formatted` (TEXT, DEFAULT `'Rp 49.000 / Lifetime Access'`).
* `admin_passcode` (TEXT, DEFAULT `'prdadmin99'`): Sandi verifikasi admin dashboard.
* `admin_emails` (TEXT[]): Daftar array email pemilik hak Super Administrator.
* `pricing_tiers` (JSONB): Konfigurasi dinamis kartu paket harga dan fitur gating.
* `announcement_banner` (JSONB): Konfigurasi teks banner pengumuman global dan status aktif.

### 3. Tabel `public.prd_history`
Menyimpan riwayat lengkap dokumen PRD yang dihasilkan pengguna beserta telemetri pemakaian AI:
* `id` (UUID, Primary Key, DEFAULT `uuid_generate_v4()`).
* `user_id` (UUID, Foreign Key -> `auth.users(id)` ON DELETE CASCADE): Pemilik dokumen.
* `title` (TEXT, NOT NULL): Judul proyek atau produk PRD.
* `prd_data` (JSONB, NOT NULL): Objek dokumen PRD lengkap hasil kompilasi AI dan validasi Zod.
* `model_used` (TEXT): Nama model AI yang berhasil mengeksekusi sintesis (misal: `gemini-3.8-flash`).
* `tokens_used` (INTEGER, DEFAULT 0): Estimasi jumlah token yang dikonsumsi untuk generasi.
* `is_server_key` (BOOLEAN, DEFAULT false): Menandai apakah generasi menggunakan kuota kunci server atau kunci BYOK pengguna.
* `gemini_slot_used` (TEXT): Label slot kunci Gemini yang digunakan.
* `created_at` (TIMESTAMPTZ, DEFAULT NOW()).

### 4. Tabel `public.payment_orders`
Mencatat seluruh riwayat transaksi pesanan langganan paket:
* `id` (UUID, Primary Key, DEFAULT `uuid_generate_v4()`).
* `user_id` (UUID, Foreign Key -> `auth.users(id)` ON DELETE CASCADE): Akun pembeli.
* `user_email` (TEXT) / `user_name` (TEXT): Identitas pembeli saat transaksi.
* `order_code` (TEXT, UNIQUE, NOT NULL): Kode referensi transaksi unik (contoh: `ORD-20260920-8912`).
* `amount` (INTEGER, NOT NULL): Nominal pokok transaksi (misal: 49000).
* `final_amount` (INTEGER): Nominal total transaksi setelah penambahan 3-digit kode unik oleh MPG.
* `unique_code` (INTEGER, DEFAULT 0): 3 digit angka unik untuk membedakan transfer perbankan.
* `qr_string` (TEXT): String kode barcode QRIS berstandar EMVCo ASPI yang dikembalikan oleh gateway MPG.
* `checkout_url` (TEXT): URL halaman hosted checkout jika menggunakan Opsi A.
* `payment_method` (TEXT, DEFAULT `'QRIS GoPay'`): Metode pembayaran yang dipilih.
* `status` (TEXT, DEFAULT `'pending'`): Status transaksi (`'pending'`, `'approved'`, `'rejected'`).
* `tier_id` (TEXT, DEFAULT `'pro'`): Paket yang dibeli (`'plus'` atau `'pro'`).
* `gateway_order_id` (TEXT): ID transaksi referensi dari server gateway MPG.
* `detected_bank` (TEXT): Nama bank / instrumen pembayaran yang terdeteksi mentransfer (misal: BCA, Mandiri, GoPay).
* `paid_at` (TIMESTAMPTZ): Waktu pembayaran terkonfirmasi lunas.
* `expired_at` (TIMESTAMPTZ): Waktu kedaluwarsa pesanan (biasanya 15 menit sejak diterbitkan).
* `gateway_payload` (JSONB): Raw payload respons lengkap dari gateway MPG untuk kebutuhan rekonsiliasi audit.

## 10.3 Indeks dan Optimasi Kinerja Basis Data
Untuk menjamin kecepatan query transaksi dan pencarian log pada skala pengguna tinggi, sistem mengimplementasikan indeks relasional:
1. `CREATE INDEX idx_payment_orders_order_code ON public.payment_orders(order_code);`: Mempercepat lookup polling status transaksi dari sisi klien peramban.
2. `CREATE INDEX idx_payment_orders_gateway_order_id ON public.payment_orders(gateway_order_id);`: Mempercepat pencarian data saat webhook masuk dari server MPG.
3. `CREATE INDEX idx_prd_history_user_id ON public.prd_history(user_id);`: Mempercepat pemuatan riwayat dokumen pengguna pada panel samping generator.

---

### Gambar 13: Entity Relationship Diagram (ERD Crow's Foot)
![Gambar 13: Entity Relationship Diagram](../diagrams/13_database_erd.png)
*Gambar 13: Entity Relationship Diagram (ERD Crow's Foot)*

* **Cara Membaca Diagram**: Diagram di atas menampilkan kardinalitas relasional antar-tabel menggunakan notasi Crow's Foot internasional. Tabel `auth_users` berelasi 1-ke-1 opsional dengan `profiles`. Tabel `profiles` berelasi 1-ke-banyak dengan `prd_history` dan `payment_orders`.
