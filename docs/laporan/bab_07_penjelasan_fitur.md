# Bab 7: Penjelasan Mendalam Fitur Sistem

## 7.1 Fitur 1: Perkaya Ide Otomatis AI (Auto-Enrichment Concept)
* **Tujuan**: Mengatasi kendala input minimalis pengguna (*Garbage In*) dengan merekonstruksi kalimat ide singkat (contoh: "Aksara Dashboard" atau "rental kamera") menjadi cetak biru konsep perangkat lunak 4 pilar arsitektur yang berbobot (250 - 450 kata).
* **Alur Sisi Pengguna (User Flow)**:
  1. Pengguna mengetikkan ide singkat pada kotak textarea di rute `/generator`.
  2. Pengguna mengklik tombol "Perkaya Ide (AI)" berikon *Sparkles*.
  3. Indikator putaran *loading spinner* muncul selama ~2 detik.
  4. Kotak teks otomatis terisi deskripsi arsitektur 4 bagian yang terstruktur rapi. Tombol "Urungkan" (Undo) muncul di sisi kanan bawah bilah aksi.
* **Alur Sisi Frontend**:
  * Komponen `WizardHeroInput.tsx` menangani event `handleEnrichIdea`. State `originalIdea` dicatat untuk mendukung fungsi pembatalan. Request HTTP POST dikirimkan ke `/api/enrich-idea` dengan payload `{ userIdea, language, templateId }`.
* **Alur Sisi Backend**:
  * Endpoint `src/app/api/enrich-idea/route.ts` memuat pengaturan sistem dari Supabase `system_settings`.
  * Mengambil kunci API dari pool server atau header BYOK.
  * Memanggil Google Gemini API menggunakan model `gemini-2.5-flash` dengan konfigurasi krusial:
    ```typescript
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 3500,
      thinkingConfig: { thinkingBudget: 0 }
    }
    ```
  * Penonaktifan *thinkingBudget* menjamin tidak ada kuota token yang terbuang untuk penalaran internal (*thoughtsTokenCount = 0*), sehingga respon selesai utuh tanpa terpotong di tengah jalan.
  * Melakukan sanitasi tanda kutip dan karakter emoji, lalu mengembalikan string hasil elaborasi.
* **Alur Sisi Basis Data**: Tidak ada mutasi basis data pada tahap ini (operasi murni *stateless compute*).
* **File Terkait**: `src/components/wizard/WizardHeroInput.tsx`, `src/app/api/enrich-idea/route.ts`.

---

## 7.2 Fitur 2: Penemuan Domain & Pertanyaan Klarifikasi Cerdas
* **Tujuan**: Menggali batasan operasional dan preferensi arsitektur pengguna sebelum dokumen PRD dibuat, sekaligus memandu pengguna memilih opsi terbaik lewat lencana rekomendasi teknis.
* **Alur Sisi Pengguna**:
  1. Setelah mengisi ide, pengguna mengklik "Lanjut: Analisis Kebutuhan".
  2. Sistem membuka antarmuka langkah penemuan (*Discovery Step*) yang menampilkan 3 hingga 4 kartu pertanyaan.
  3. Setiap pertanyaan menampilkan chip opsi jawaban, di mana opsi paling direkomendasikan telah ditandai lencana kontras `[Rekomendasi]` dan terpilih secara otomatis (*pre-selected*).
  4. Pengguna dapat mengubah pilihan secara bebas atau langsung menekan tombol "Buat PRD Lengkap".
* **Alur Sisi Frontend**:
  * Komponen `WizardDiscoveryStep.tsx` menerima data pertanyaan dari hook generator atau memicu fetch ke `/api/generate-clarifications`.
  * Saat data diterima, efek `useEffect` mengumpulkan seluruh `recommendedOptionIds` dan memasukkannya ke state `selectedAnswers`.
* **Alur Sisi Backend**:
  * Endpoint `src/app/api/generate-clarifications/route.ts` menganalisis teks ide pengguna.
  * Memanggil modul `buildClarificationPrompt` di `src/lib/gemini/prompts.ts` dengan response schema `clarificationResponseSchema` di `src/lib/gemini/schemas.ts`.
  * Jika koneksi AI gagal atau waktu habis, modul `domain-discovery.ts` mengeksekusi *fallback* instan (< 5 ms) dengan preset domain terverifikasi (Rental, E-commerce, Kos, Kasir POS, Absensi, SaaS, PPDB).
* **File Terkait**: `src/components/wizard/WizardDiscoveryStep.tsx`, `src/app/api/generate-clarifications/route.ts`, `src/lib/gemini/domain-discovery.ts`, `src/lib/gemini/schemas.ts`.

---

## 7.3 Fitur 3: Sintesis Dokumen PRD Utama & 8 Diagram Arsitektur
* **Tujuan**: Mengompilasi seluruh spesifikasi produk menjadi dokumen rekayasa perangkat lunak standar industri yang siap pakai.
* **Alur Sisi Pengguna**:
  1. Pengguna menekan tombol "Buat PRD Lengkap".
  2. Layar menampilkan animasi pipa kerja visual (*Visual Workflow Pipeline*) yang memvisualisasikan tahapan rekayasa: Inisialisasi -> Analisis Kebutuhan -> Sintesis Arsitektur -> Validasi Schema -> Finalisasi Dokumen.
  3. Dokumen PRD lengkap muncul dalam format alir tipografi bersih Notion-style dengan panel TOC samping, visualisasi pohon fitur kurva Bezier, dan tab interaktif 8 diagram arsitektur.
* **Alur Sisi Backend**:
  * Endpoint `src/app/api/generate-prd/route.ts` memeriksa kuota akun di tabel `profiles`.
  * Merakit instruksi sistem (*systemInstruction*) dan prompt komprehensif dari `src/lib/gemini/prompts.ts`.
  * Mengeksekusi fungsi `generateStructuredPRD` di `src/lib/gemini/gemini-client.ts` melalui *Model Ladder* bertingkat (`gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-flash-latest` -> `gemini-2.5-flash`).
  * Memvalidasi hasil JSON dengan `PRDOutputZodSchema` di `src/lib/gemini/schemas.ts`.
  * Menyimpan salinan dokumen ke tabel `prd_history` dan menaikkan nilai `trial_count` di tabel `profiles`.
* **File Terkait**: `src/app/api/generate-prd/route.ts`, `src/components/PRDViewer.tsx`, `src/components/PhasedFeatureTree.tsx`, `src/components/MermaidRenderer.tsx`.

---

## 7.4 Fitur 4: Pembayaran QRIS Dinamis Mandiri Private Gateway (MPG)
* **Tujuan**: Memungkinkan monetisasi mandiri dengan penerimaan dana langsung masuk ke rekening pemilik tanpa potongan komisi pihak ketiga (*0% MDR*) dan aktivasi langganan instan.
* **Alur Sisi Pengguna**:
  1. Pengguna membuka modal langganan via tombol "Upgrade Paket" di bilah navigasi atau saat terhalang kuota.
  2. Memilih paket (*Plus* seharga Rp 29.000 atau *Pro* seharga Rp 49.000) dan memilih mode pembayaran "Opsi B: Headless Pop-up".
  3. Modal menampilkan barcode QRIS dinamis ASPI EMVCo, nominal presisi dengan 3-digit kode unik, serta *countdown timer* 15 menit.
  4. Pengguna memindai QRIS menggunakan aplikasi perbankan (BCA, Mandiri, BRI, BNI) atau dompet digital (GoPay, OVO, Dana, ShopeePay).
  5. Begitu transfer berhasil, layar pop-up secara otomatis berubah menampilkan animasi sukses, memicu letupan selebrasi confetti, dan akun langsung berstatus Pro.
* **Alur Sisi Backend & Webhook**:
  * `POST /api/orders` berkomunikasi dengan server MPG di `https://pyamentgateway.daeroom.my.id/api/v1/invoice` untuk menghasilkan tagihan dengan parameter `auto_unique_code: true`. Data disimpan di tabel `payment_orders` dengan status `pending`.
  * Ketika aplikasi perbankan mengonfirmasi mutasi ke kasir Android MPG, server MPG mengirimkan HTTP POST ke `/api/webhook/payment-success` membawa header `X-Signature` / `X-Callback-Signature`.
  * Handler webhook menghitung tanda tangan HMAC-SHA256 dari *body* request dan membandingkannya dengan `MPG_WEBHOOK_SECRET`.
  * Jika valid dan pesanan masih berstatus *pending*, transaksi diperbarui menjadi `approved`, `paid_at` dicatat, dan masa aktif pengguna di tabel `profiles` diperpanjang +30 hari.
  * Polling frontend mendeteksi perubahan status dan memperbarui UI seketika.
* **File Terkait**: `src/components/PricingModal.tsx`, `src/app/api/orders/route.ts`, `src/app/api/webhook/payment-success/route.ts`, `src/lib/mpg/client.ts`.

---

## 7.5 Fitur 5: Master Admin Control Center (Dashboard 6 Tab)
* **Tujuan**: Memberikan visibilitas dan kendali penuh kepada pengelola aplikasi atas operasional bisnis, kunci AI, pengguna, dan transaksi keuangan.
* **Fitur per Tab**:
  1. **Tab 1 (Overview & Metrik)**: Menampilkan metrik ringkasan (total PRD, pengguna terdaftar, omzet QRIS, token server) dan tabel live feed generasi PRD dengan kotak pencarian instan dan tombol hapus log.
  2. **Tab 2 (Kunci API & Slot Router)**: Konfigurasi multi-slot kunci Gemini (10 slot kartu independen), penentuan model pilihan per slot, dan fitur uji koneksi latensi kunci real-time.
  3. **Tab 3 (Manajemen User & Gating)**: Tabel direktori pengguna terdaftar, pencarian instan, tombol eskalasi tier (*Free*, *Pro*, *Unlimited*), tombol override batas kuota harian, dan tombol blokir akun (*Banned*).
  4. **Tab 4 (Antrean Pesanan GoBiz & MPG)**: Kartu ringkasan antrean pesanan, filter tab status (*Pending*, *Approved*, *Rejected*), tombol approve/reject manual, dan tombol hapus pesanan kadaluarsa.
  5. **Tab 5 (Switchboard Fitur & Kuota)**: Toggle global mode autentikasi (*Free Access*, *Hybrid*, *Strict Login*), mode monetisasi (*Freemium*, *Paywall*), dan penyunting teks pengumuman banner global.
  6. **Tab 6 (Pengaturan QRIS & Harga)**: Tata letak padat kartu tier paket (*Free*, *Plus*, *Pro*) dengan kontrol harga dan toggle 4 pilar fitur, selektor 3 mode checkout MPG, konfigurasi URL API, API Key, Webhook Secret, dan upload QRIS GoBiz statis.
* **File Terkait**: `src/app/admin/page.tsx`, `src/app/api/admin/route.ts`.

---

### Gambar 6: UML Activity Diagram - Alur Pembuatan PRD
![Gambar 6: UML Activity Diagram - Alur Pembuatan PRD](../diagrams/06_activity_generate_prd.png)
*Gambar 6: UML Activity Diagram - Alur Pembuatan PRD*

* **Cara Membaca Diagram**: Diagram aktivitas di atas memperlihatkan alur kerja sistematis pengguna dari penulisan ide awal, percabangan eksekusi enrich-idea AI, langkah penemuan kebutuhan, pemeriksaan kuota akun, hingga iterasi model ladder dan perenderan akhir dokumen PRD.

---

### Gambar 7: UML Activity Diagram - Alur Pembayaran MPG QRIS
![Gambar 7: UML Activity Diagram - Alur Pembayaran MPG QRIS](../diagrams/07_activity_payment_flow.png)
*Gambar 7: UML Activity Diagram - Alur Pembayaran MPG QRIS*

* **Cara Membaca Diagram**: Diagram di atas menggambarkan alur verifikasi transaksi pembayaran dari pemilihan paket di PricingModal, penerbitan barcode dynamic QRIS oleh MPG, verifikasi kriptografi HMAC pada webhook callback, hingga eskalasi hak akses profil pengguna secara otomatis.
