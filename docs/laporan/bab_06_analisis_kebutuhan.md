# Bab 6: Analisis Kebutuhan Sistem

## 6.1 Kebutuhan Fungsional (Functional Requirements)
Berdasarkan penelusuran kode sumber pada endpoint API dan komponen antarmuka, sistem memiliki kebutuhan fungsional utama sebagai berikut:

1. **FR-01 (Eksplorasi & Auto-Enrichment Ide)**:
   * Sistem harus mampu menerima masukan ide produk perangkat lunak mentah dari pengguna.
   * Sistem harus menyediakan fungsi perluasan ide otomatis berbasis AI (*POST /api/enrich-idea*) yang mentransformasikan teks singkat menjadi 4 pilar arsitektur komprehensif dalam waktu di bawah 3 detik tanpa terpotong (lihat: `src/app/api/enrich-idea/route.ts`).
   * Sistem harus menyediakan tombol pembatalan (*Undo*) untuk mengembalikan teks ide awal pengguna jika diinginkan (lihat: `src/components/wizard/WizardHeroInput.tsx`).

2. **FR-02 (Penemuan Domain & Pertanyaan Klarifikasi Cerdas)**:
   * Sistem harus mendeteksi secara otomatis domain bisnis dari ide pengguna (misal: E-Commerce, Rental/Booking, Properti/Kos, POS/Kasir, Absensi, SaaS, atau PPDB/Sekolah) (lihat: `src/lib/gemini/domain-discovery.ts`).
   * Sistem harus menghasilkan 3 hingga 4 pertanyaan penemuan teknis tajam dengan 3 hingga 4 opsi jawaban terstruktur.
   * Sistem harus menyertakan lencana rekomendasi arsitektur terbaik (*isRecommended: true*) pada 1-2 opsi per pertanyaan beserta penjelasan rasional teknis ringkas, serta memilihkan opsi rekomendasi tersebut secara otomatis (*auto-selection*) saat antarmuka dimuat (lihat: `src/components/wizard/WizardDiscoveryStep.tsx`).

3. **FR-03 (Sintesis Dokumen PRD & 8 Diagram Visual)**:
   * Sistem harus mampu mengorkestrasi model AI (Google Gemini) untuk menyusun PRD lengkap yang mencakup 10 seksi standar industri (lihat: `src/app/api/generate-prd/route.ts`).
   * Sistem harus menghasilkan sintaks deklaratif untuk 8 diagram arsitektur interaktif (*System Flowchart*, *User Journey Flow*, *Database ERD*, *API REST Matrix*, *Sequence Flow*, *Cloud Infrastructure Topology*, *Role-Based Access Control*, dan *Data Pipeline Flow*) (lihat: `src/lib/gemini/prompts.ts`, `src/types/prd.ts`).
   * Sistem harus memvalidasi output AI menggunakan skema Zod (*ClarificationOutputZodSchema* dan *PRDOutputZodSchema*) untuk menjamin konsistensi format data (lihat: `src/lib/gemini/schemas.ts`).

4. **FR-04 (Visualisasi Pohon Fitur Kurva Bezier SVG)**:
   * Sistem harus memetakan dekomposisi fitur modul PRD ke dalam representasi grafis pohon bertingkat (*Phased Feature Tree*) yang memisahkan modul inti dengan garis lengkung Bezier SVG dari node induk (*Root Node*) ke modul fungsional (*Module Cards*) dan sub-fitur (*Sub-Feature Nodes*) (lihat: `src/components/PhasedFeatureTree.tsx`).
   * Sistem harus melakukan sanitasi terhadap string sampah schema yang mungkin dihasilkan AI secara deterministik.

5. **FR-05 (Ekspor Dokumen & Starter Kit Boilerplate)**:
   * Sistem harus menyediakan fungsi ekspor dokumen ke dalam format Markdown murni (`.md`) dan JSON mentah (lihat: `src/components/PRDViewer.tsx`).
   * Sistem harus menyediakan fungsi pengunduhan paket arsip terkompresi (`.zip`) via *JSZip* yang berisi berkas aturan agen AI `.cursorrules`, panduan desain antarmuka `DESIGN.md`, skrip SQL skema basis data Supabase, serta dokumen PRD lengkap.

6. **FR-06 (Integrasi Pembayaran Dinamis & Manajemen Kuota)**:
   * Sistem harus mendukung 3 opsi pembayaran langganan tier Plus dan Pro: (A) Hosted Checkout Redirect, (B) Headless Pop-up QRIS Dinamis ASPI EMVCo, dan (C) Manual GoBiz QRIS (lihat: `src/components/PricingModal.tsx`, `src/lib/mpg/client.ts`).
   * Sistem harus menangani webhook notifikasi pembayaran masuk dari Mandiri Private Gateway (MPG) dengan verifikasi tanda tangan kriptografi HMAC-SHA256, memperbarui status pesanan menjadi *approved*, serta memperpanjang masa aktif akun selama 30 hari secara otomatis dan *idempotent* (lihat: `src/app/api/webhook/payment-success/route.ts`).

7. **FR-07 (Manajemen dan Switchboard Administrator)**:
   * Sistem harus menyediakan dasbor administrasi terproteksi passcode (*ADMIN_SECRET_KEY* / *admin_passcode*) yang mencakup 6 tab manajemen: Overview & Live Deletion, Kunci API & Slot Router, Manajemen Pengguna & Banned, Antrean Pesanan QRIS, Switchboard Fitur & Kuota, serta Pengaturan QRIS & Harga (lihat: `src/app/admin/page.tsx`, `src/app/api/admin/route.ts`).
   * Dasbor admin harus mendukung pergantian tema dinamis antara Mode Terang (kombinasi warna Biru & Putih) dan Mode Gelap dengan tabel yang beradaptasi penuh.

## 6.2 Kebutuhan Non-Fungsional (Non-Functional Requirements)
1. **NFR-01 (Kinerja & Kecepatan Respons)**:
   * Waktu respons elaborasi ide (*enrich-idea*) tidak boleh melebihi 4 detik pada koneksi internet normal (dioptimalkan via `thinkingBudget: 0`).
   * Pustaka *domain discovery fallback* harus mampu menyajikan pertanyaan rekomendasi instan di bawah 5 milidetik jika koneksi eksternal terganggu.
2. **NFR-02 (Keamanan Data & Privasi)**:
   * Kunci API rahasia (Gemini Master Keys, MPG Webhook Secret, Supabase Service Role Key) tidak boleh pernah terekspos ke sisi klien peramban.
   * Komunikasi antarperamban dan server wajib menggunakan enkripsi TLS 1.3 / HTTPS dengan header keamanan ketat (*Strict-Transport-Security*, *X-Frame-Options: SAMEORIGIN*, *X-Content-Type-Options: nosniff*).
3. **NFR-03 (Skalabilitas & Ketahanan Sistem)**:
   * Sistem menerapkan pola *Model Ladder* bertingkat untuk mengantisipasi batas kuota rate limit (HTTP 429) pada model Gemini tertentu, secara otomatis beralih ke model cadangan.
   * Sistem menerapkan mekanisme cooldown 60 detik pada kunci API yang mengalami pembatasan kuota (*Key Pool Manager*).
4. **NFR-04 (Kesesuaian Desain & Kepatuhan Nol Emoji)**:
   * Seluruh kode sumber, basis data, antarmuka pengguna, dan dokumen sistem wajib mematuhi aturan *Zero Emoji* secara absolut, menggantikan karakter emoji piktografik dengan ikon vektor SVG Lucide yang konsisten.

## 6.3 Aktor Sistem dan Matriks Hak Akses (RBAC)
Sistem membedakan 4 aktor peran pengguna:
1. **Tamu (Guest / Anonymous)**: Pengunjung yang belum melakukan otentikasi. Memiliki kuota 1 kali uji coba pembuatan PRD gratis (*trial_limit = 1*), template starter, dan pratinjau landing page.
2. **Pengguna Terdaftar Free Tier**: Pengguna yang telah login via Google OAuth atau Magic Link. Memiliki kuota harian standar (*trial_count* termonitor), dapat menyimpan riwayat PRD ke basis data, dan menggunakan kunci pribadi (*BYOK*).
3. **Pengguna Berlangganan (Plus & Pro Tier)**: Pengguna yang telah menyelesaikan pembayaran langganan. Memperoleh kuota harian tinggi (hingga 30 PRD/hari atau unlimited), akses penuh ke seluruh template arsitektur lanjutan (*Mobile App*, *AI Service*, *Custom Stack*), 8 diagram arsitektur interaktif, serta unduhan Starter Kit ZIP.
4. **Super Administrator**: Pengelola sistem yang memiliki akses penuh ke rute `/admin`, mampu memanipulasi slot kunci Gemini, menyetujui/menolak pesanan, mengubah harga paket, dan memodifikasi status pengguna.

### Tabel Matriks Hak Akses Pengguna
| Fitur / Modul Sistem | Tamu (Guest) | Free Tier | Plus / Pro Tier | Super Admin | Bukti File Sumber |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Akses Landing Page & Studio** | Ya | Ya | Ya | Ya | `src/app/page.tsx` |
| **Uji Coba PRD Starter (1x Trial)** | Ya | Ya | Ya | Ya | `src/app/generator/page.tsx` |
| **Perkaya Ide Otomatis (AI)** | Ya | Ya | Ya | Ya | `src/app/api/enrich-idea/route.ts` |
| **Simpan Riwayat PRD ke Cloud** | Tidak | Ya | Ya | Ya | `src/app/api/user-prds/route.ts` |
| **Input Kunci Gemini Sendiri (BYOK)** | Ya | Ya | Ya | Ya | `src/components/ApiKeyModal.tsx` |
| **Template Mobile App & AI Service** | Terkunci | Terkunci | Terbuka | Terbuka | `src/components/wizard/WizardHeroInput.tsx` |
| **Peracik Custom Tech Stack** | Terkunci | Terkunci | Terbuka | Terbuka | `src/components/wizard/CustomStackModal.tsx` |
| **Visualisasi 8 Diagram Arsitektur** | Terkunci | Terkunci | Terbuka | Terbuka | `src/components/PRDViewer.tsx` |
| **Unduh Starter Kit ZIP Boilerplate** | Terkunci | Terkunci | Terbuka | Terbuka | `src/components/PRDViewer.tsx` |
| **Transaksi Pembayaran QRIS Dinamis**| Ya | Ya | Ya | Ya | `src/components/PricingModal.tsx` |
| **Akses Dashboard /admin** | Ditolak | Ditolak | Ditolak | Terbuka | `src/app/admin/page.tsx` |

---

### Gambar 5: UML Use Case Diagram
![Gambar 5: UML Use Case Diagram](../diagrams/05_use_case.png)
*Gambar 5: UML Use Case Diagram*

* **Cara Membaca Diagram**: Diagram Use Case menunjukkan pemetaan relasi fungsional antara tiga aktor sistem (Pengguna Umum, Pengguna Pro/Unlimited, dan Super Administrator) dengan dua belas kasus penggunaan utama di dalam batas sistem (*system boundary*).
* **Penjelasan Naratif**: Pengguna umum memiliki akses terbatas pada use case eksplorasi ide, penjawaban klarifikasi, dan pembelian langganan. Pengguna Pro mendapatkan perluasan hak pada akses diagram arsitektur dan unduhan ZIP starter kit. Super Admin memiliki hak istimewa pada manajemen kunci AI, verifikasi antrean pesanan, dan pemantauan pengguna.
