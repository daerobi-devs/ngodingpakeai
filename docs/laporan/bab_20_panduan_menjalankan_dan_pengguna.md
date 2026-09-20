# Bab 20: Panduan Menjalankan Sistem dan Panduan Pengguna

## 20.1 Panduan Pengaturan Lingkungan Lokal (Developer Setup)

### Prasyarat Perangkat Lunak:
* **Node.js**: Versi 20.x atau 22.x LTS (disarankan v22.12+).
* **Git**: Terpasang pada sistem operasi.
* **Akun Supabase**: Proyek Supabase aktif dengan ekstensi `uuid-ossp`.
* **Kunci API Google Gemini**: Kunci API dari Google AI Studio (`aistudio.google.com`).

### Langkah-langkah Instalasi:
1. **Clone Repositori**:
   ```bash
   git clone git@github.com:daerobi-devs/ngodingpakeai.git
   cd ngodingpakeai
   ```
2. **Instalasi Dependensi**:
   ```bash
   npm install --legacy-peer-deps
   ```
3. **Konfigurasi Berkas Lingkungan**:
   Salin berkas `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Isi variabel lingkungan dengan kredensial Supabase dan gateway pembayaran Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_SECRET_KEY=daerobi-hq-2026
   ADMIN_PASSCODE=prdadmin99
   MPG_GATEWAY_URL=https://pyamentgateway.daeroom.my.id
   MPG_API_KEY=your-mpg-api-key
   MPG_WEBHOOK_SECRET=your-mpg-webhook-secret
   GEMINI_API_KEY=your-gemini-api-key
   ```
4. **Migrasi Basis Data**:
   Buka menu **SQL Editor** pada dasbor Supabase Anda, lalu jalankan secara berurutan:
   * `supabase_schema.sql` (Skema master)
   * `supabase_migration_v2.sql` (Slot dan tier)
   * `supabase_migration_mpg.sql` (Integrasi gateway MPG)
   * `admin_setup.sql` (Inisialisasi hak admin)
5. **Menjalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Buka peramban dan akses alamat `http://localhost:3000`.

6. **Kompilasi dan Pengujian Produksi**:
   ```bash
   npx tsc --noEmit
   npm run build
   npm run start
   ```

---

## 20.2 Panduan Pengguna Singkat (User Manual)

### Cara Membuat PRD Pertama Kali:
1. **Buka Ruang Kerja**: Kunjungi `ngodingpakeprd.com/generator`.
2. **Pilih Preset Arsitektur**: Pada bagian kiri bawah bilah aksi, pilih salah satu preset arsitektur:
   * *Web App*: Cocok untuk SaaS, toko online, sistem manajemen kos, dan portal reservasi.
   * *Mobile App*: Cocok untuk aplikasi smartphone Android/iOS (React Native / Expo).
   * *AI Service*: Cocok untuk agen AI, sistem embedding pgvector, dan analitik data.
   * *Custom Stack*: Cocok bagi pengembang yang ingin menentukan tumpukan teknologi secara presisi.
3. **Tuliskan Ide Anda**: Masukkan ide produk Anda pada kotak teks utama.
4. **Perkaya Ide dengan AI**: Klik tombol "Perkaya Ide (AI)" berikon bintang berkilau. Dalam 2-3 detik, ide Anda akan diubah menjadi konsep arsitektur komprehensif 4 pilar.
5. **Jawab Pertanyaan Klarifikasi**: Klik tombol "Lanjut: Analisis Kebutuhan". Sistem akan menyajikan pertanyaan teknis. Anda dapat langsung menggunakan opsi rekomendasi terbaik yang telah terpilih otomatis.
6. **Kompilasi PRD**: Klik tombol "Buat PRD Lengkap". Tunggu pipa visual bekerja hingga dokumen PRD, pohon fitur interaktif, dan 8 diagram arsitektur tersaji secara lengkap.
7. **Ekspor & Implementasi**: Gunakan tombol "Starter Kit (.ZIP)" di bilah atas untuk mengunduh seluruh cetak biru, aturan linter, dan skrip SQL untuk langsung diimpor ke Cursor atau editor kode Anda.
