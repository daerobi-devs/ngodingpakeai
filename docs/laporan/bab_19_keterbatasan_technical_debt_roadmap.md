# Bab 19: Keterbatasan Sistem, Technical Debt, dan Roadmap Pengembangan

## 19.1 Keterbatasan Sistem Saat Ini
1. **Ketergantungan Eksternal Pihak Ketiga**:
   * Kualitas dan akurasi konten PRD sangat bergantung pada ketersediaan dan latensi jaringan Google AI Studio dan Supabase Cloud.
2. **Ketiadaan Kolaborasi Real-Time Multi-User**:
   * Dokumen PRD saat ini bersifat individual per sesi pengguna; belum ada fitur penyuntingan bersama secara kolaboratif (*Google Docs style multiplayer editing*) antar-anggota tim.
3. **Simulasi Eksekusi Kode**:
   * Dokumen PRD menghasilkan rancangan arsitektur dan starter kit boilerplate, namun sistem belum memiliki lingkungan eksekusi *cloud sandbox* (seperti WebContainers atau E2B) untuk menjalankan kode langsung di peramban.

## 19.2 Technical Debt yang Perlu Dibenahi
1. **Konsolidasi Komponen Admin yang Sangat Besar**:
   * File `src/app/admin/page.tsx` saat ini memiliki ukuran lebih dari 2.800 baris kode yang mencakup keenam tab administrasi dalam satu berkas tunggal. Disarankan untuk memecah berkas ini ke dalam sub-komponen modular (`AdminOverviewTab.tsx`, `AdminKeysTab.tsx`, `AdminUsersTab.tsx`, `AdminOrdersTab.tsx`, `AdminSwitchboardTab.tsx`, `AdminPricingTab.tsx`) untuk mempermudah pemeliharaan di masa mendatang.
2. **Standarisasi Variabel Lingkungan Gateway MPG**:
   * Port default pada skrip migrasi `supabase_migration_mpg.sql` mencantumkan `http://localhost:3000` sebagai fallback URL gateway MPG. Disarankan memastikan nilai produksi selalu menggunakan URL domain valid `https://pyamentgateway.daeroom.my.id`.

## 19.3 Roadmap Pengembangan Masa Depan
* **Fase 1 (Peningkatan Kolaborasi & Tim)**:
  * Fitur *Workspace Team*: Berbagi akses dokumen PRD dengan rekan satu tim pengembang dengan izin *Viewer* dan *Editor*.
  * Integrasi Langsung ke GitHub Repository: Tombol "Export to GitHub" yang secara otomatis membuat repositori privat baru dan melakukan commit awal untuk starter kit boilerplate.
* **Fase 2 (AI Coding Agent Handoff)**:
  * Integrasi satu-klik ke ekosistem AI Developer Tooling (Cursor, Windsurf, Claude Code, Aider) melalui format `.prompt` dan MCP (Model Context Protocol) Server terstandarisasi.
* **Fase 3 (Multi-Payment & Global Monetization)**:
  * Menambahkan integrasi gateway pembayaran internasional (Stripe / LemonSqueezy) di samping QRIS MPG lokal untuk menjangkau pasar pengembang global.
