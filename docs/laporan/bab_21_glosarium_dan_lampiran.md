# Bab 21: Glosarium Istilah dan Lampiran Dokumen

## 21.1 Glosarium Istilah Teknis
* **PRD (Product Requirement Document)**: Dokumen formal yang menguraikan seluruh tujuan, nilai bisnis, fitur fungsional, batasan arsitektur, dan kriteria penerimaan dari suatu produk perangkat lunak.
* **BYOK (Bring Your Own Key)**: Model operasional di mana pengguna menyediakan kunci API kecerdasan buatan milik mereka sendiri untuk membiayai komputasi LLM secara langsung.
* **Model Ladder**: Pola arsitektur toleransi kegagalan (*failover mechanism*) yang secara berurutan mencoba memanggil model AI dari tingkatan performa tertinggi hingga model cadangan yang lebih ringan jika terjadi pembatasan kuota (HTTP 429).
* **Thinking Budget**: Konfigurasi parameter pada Google Gemini 2.5 Flash yang mengontrol alokasi token yang digunakan model untuk proses penalaran internal (*chain-of-thought*) sebelum memproduksi teks keluaran.
* **HMAC (Hash-based Message Authentication Code)**: Mekanisme otentikasi pesan kriptografis yang menggabungkan fungsi hash SHA-256 dengan kunci rahasia bersama untuk menjamin keaslian payload webhook.
* **Idempotent**: Karakteristik suatu operasi API di mana pemanggilan ganda atau berulang dengan data yang sama tidak akan mengubah status sistem lebih dari satu kali (*safe against duplicate execution*).
* **MDR (Merchant Discount Rate)**: Biaya potongan komisi yang dikenakan oleh penyedia gateway pembayaran untuk setiap transaksi yang berhasil. Sistem MPG pada platform ini memiliki MDR 0%.
* **EMVCo ASPI QRIS**: Standar nasional Quick Response Code pembayaran terintegrasi yang ditetapkan oleh Bank Indonesia dan Asosiasi Sistem Pembayaran Indonesia (ASPI).
* **RLS (Row Level Security)**: Fitur keamanan tingkat lanjut pada PostgreSQL yang membatasi hak akses baris data secara granular berdasarkan identitas otentikasi sesi pengguna.
* **Turbopack**: Bundler generasi berikutnya untuk JavaScript dan TypeScript yang ditulis dalam bahasa Rust, terintegrasi langsung di Next.js untuk mempercepat waktu kompilasi.

## 21.2 Lampiran: Daftar Berkas Inti Sistem
* `src/app/generator/page.tsx`: Titik masuk ruang kerja generator PRD.
* `src/app/admin/page.tsx`: Pusat kendali administrasi 6 tab.
* `src/app/api/generate-prd/route.ts`: Handler orkestrasi sintesis dokumen arsitektur.
* `src/app/api/enrich-idea/route.ts`: Handler elaborasi ide cepat 4 pilar (thinkingBudget 0).
* `src/app/api/webhook/payment-success/route.ts`: Handler verifikasi webhook pembayaran MPG.
* `src/lib/gemini/gemini-client.ts`: Klien SDK Google Gemini dan rotasi slot kunci.
* `src/lib/gemini/prompts.ts`: Rekayasa instruksi sistem 8-diagram dan spesifikasi PRD.
* `src/lib/gemini/schemas.ts`: Skema validasi runtime Zod dan kontrak respons Gemini.
* `src/lib/mpg/client.ts`: Klien integrasi Mandiri Private Gateway (MPG).
* `src/components/PRDViewer.tsx`: Komponen penampil dokumen alir bersih dan ekspor ZIP.
* `src/components/PhasedFeatureTree.tsx`: Visualisasi pohon fitur berbasis kurva Bezier SVG.
* `src/components/MermaidRenderer.tsx`: Renderer 8-diagram teknis interaktif.
* `Dockerfile`: Konfigurasi multi-stage build kontainer produksi minimalis.
