# Bab 2: Latar Belakang, Tujuan, dan Ruang Lingkup Sistem

## 2.1 Latar Belakang
Era kecerdasan buatan generatif telah mengubah paradigma rekayasa perangkat lunak. *AI coding assistants* seperti Claude Code, GitHub Copilot, Cursor, dan Windsurf telah mempercepat penulisan kode sumber secara drastis. Namun, efektivitas agen AI tersebut sangat bergantung pada kualitas instruksi awal (*prompt engineering*) dan kejelasan spesifikasi kebutuhan teknis. Fenomena *"Garbage In, Garbage Out"* menjadi hambatan utama: ketika pengguna hanya memberikan instruksi singkat tanpa spesifikasi arsitektur yang matang, kode yang dihasilkan AI cenderung parsial, tidak konsisten, dan rentan terhadap kegagalan integrasi.

Platform NgodingPakePRD hadir untuk menjadi jembatan formal (*formal bridge*) yang mengubah ide abstrak pengguna menjadi cetak biru teknis (*technical blueprint*) tingkat industri yang siap dieksekusi oleh developer manusia maupun agen coding AI otonom.

## 2.2 Tujuan Pengembangan Sistem
Tujuan utama yang dicapai oleh sistem ini meliputi:
1. **Menghilangkan Ambiguitas Kebutuhan**: Mengembangkan modul klarifikasi cerdas yang mampu mengidentifikasi domain bisnis secara otomatis dan mengajukan opsi arsitektur dengan penanda rekomendasi teknis terbaik.
2. **Menyediakan Standardisasi Dokumen PRD**: Menghasilkan dokumen PRD yang memuat 10 bagian wajib standar industri: pernyataan masalah, target audiens, *user stories* bersyarat penerimaan (*acceptance criteria*), rincian modul fitur, 8 diagram arsitektur interaktif, spesifikasi kontrak API REST, skema basis data relasional PostgreSQL, dekomposisi *edge cases*, panduan UI/UX, dan *roadmap* implementasi bertahap.
3. **Menyediakan Visualisasi Grafis Arsitektur Terintegrasi**: Mengeliminasi kebutuhan aplikasi diagram terpisah dengan menyematkan visualisasi *Mermaid.js* dinamis yang mendukung *zoom*, *pan*, dan unduh grafis langsung di peramban.
4. **Membangun Sistem Akses Mandiri yang Fleksibel**: Menyediakan model akses *Freemium* yang adil dengan kuota gratis harian, dukungan kunci pribadi (*BYOK*), serta langganan *Plus* dan *Pro* dengan transaksi instan berbasis QRIS dinamis mandiri tanpa potongan biaya pihak ketiga (*0% MDR*).
5. **Menyediakan Pusat Kendali Administratif Terpadu**: Memberikan fasilitas bagi *Super Administrator* untuk mengelola alokasi kunci API AI (*Gemini Slot Pool*), memantau pemakaian token server, memverifikasi pesanan pembayaran, serta mengatur *switchboard* fitur sistem secara langsung tanpa perlu melakukan redeploy aplikasi.

## 2.3 Ruang Lingkup Sistem
Ruang lingkup yang dicakup oleh sistem NgodingPakePRD meliputi:
* **Ruang Lingkup Pengguna**:
  * Pengguna Publik / Pengunjung: Menjelajahi antarmuka landing page, memanfaatkan *Interactive Blueprint Studio*, melihat simulasi workflow, dan mencoba 1 kali pembuatan PRD percobaan gratis.
  * Pengguna Terdaftar (Free Tier): Masuk menggunakan Google OAuth atau Magic Link OTP, membuat PRD dengan kuota harian standar, melihat pohon fitur, dan menyalin PRD.
  * Pengguna Berlangganan (Plus & Pro): Membuka akses ke template lanjutan (*Mobile App*, *AI Agent & Vector Service*, *Custom Tech Stack*), membuka akses 8 diagram arsitektur, dan mengunduh paket arsip *Starter Kit ZIP*.
* **Ruang Lingkup Fungsional**:
  * Modul *Hero Input* dan *Auto-Enrichment* ide berbasis Gemini Flash (thinking budget dinolkan).
  * Modul *Domain Discovery* dan *Smart Clarification Questions*.
  * Modul Sintesis Dokumen PRD Terstruktur berbasis Zod Schema dan *Model Fallback Ladder*.
  * Modul *Viewer* PRD tipe alir (*clean typography flow*) dengan pohon dekomposisi fitur kurva Bezier SVG.
  * Modul Pembayaran terintegrasi Mandiri Private Gateway (MPG) dengan 3 opsi jalur (Headless QRIS Pop-up, Hosted Redirect, dan Manual GoBiz).
  * Modul Dashboard Administrator 6 Tab dengan tema dinamis (Mode Terang Biru & Putih serta Mode Gelap).
* **Batasan Sistem (Out of Scope)**:
  * Sistem tidak mengeksekusi *compiler* atau menjalankan *runtime* aplikasi yang dirancang; sistem hanya berfokus pada perancangan arsitektur, spesifikasi teknis, dan *scaffolding*.
  * Sistem tidak menyediakan *hosting* bagi aplikasi yang dihasilkan oleh pengguna.
