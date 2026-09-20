# Bab 13: Integrasi Layanan Pihak Ketiga

Sistem terhubung secara erat dengan beberapa layanan cloud eksternal dan pustaka pihak ketiga:

## 13.1 Google Generative AI (Gemini Language API)
* **Penyedia**: Google Cloud / Google AI Studio.
* **Fungsi**: Mesin kecerdasan utama untuk analisis ide, penemuan kebutuhan, dan kompilasi PRD arsitektur lengkap.
* **Model yang Digunakan**:
  * `gemini-2.5-flash`: Digunakan untuk elaborasi cepat ide mentah pada `/api/enrich-idea` dengan konfigurasi khusus `thinkingConfig: { thinkingBudget: 0 }` untuk menonaktifkan pemborosan token penalaran.
  * `gemini-3.8-flash` & `gemini-3.5-flash`: Model utama dan sekunder pada *Model Ladder* sintesis PRD lengkap berkat jendela konteks besar dan kemampuan penalaran skema JSON yang tinggi.
  * `gemini-flash-latest`: Model fallback andal jika model generasi 3.x sedang mengalami pemeliharaan.
* **Pola Integrasi**: Menggunakan panggilan REST langsung ke endpoint `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent?key=<apiKey>` dengan dukungan `responseSchema` JSON dan abort controller timeout (lihat: `src/lib/gemini/gemini-client.ts`).

## 13.2 Mandiri Private Gateway (MPG)
* **Penyedia**: Server gateway pembayaran privat mandiri (`pyamentgateway.daeroom.my.id`).
* **Fungsi**: Penerbitan invoice pembayaran otomatis, penghitungan kode unik perbankan, pembuatan barcode QRIS dinamis ASPI EMVCo, serta penerusan mutasi bank ke webhook aplikasi.
* **Pola Integrasi**:
  * **Inisiasi Transaksi**: HTTP POST ke `/api/v1/invoice` dengan *Bearer Authorization Token* (lihat: `src/lib/mpg/client.ts`).
  * **Callback Notifikasi (Webhook)**: Menerima HTTP POST pada `/api/webhook/payment-success` dengan validasi header `X-Signature` atau `X-Callback-Signature` menggunakan algoritma *HMAC-SHA256*.

## 13.3 Supabase Cloud Platform (PostgreSQL & GoTrue)
* **Penyedia**: Supabase Inc.
* **Fungsi**: Penyimpanan data relasional PostgreSQL, manajemen autentikasi pengguna OAuth/OTP, dan penegakan kebijakan keamanan data *Row Level Security* (RLS).
* **Pola Integrasi**: Menggunakan pustaka resmi `@supabase/supabase-js` dan `@supabase/ssr` dengan pemisahan kredensial antara *Anon Key* (sisi peramban) dan *Service Role Key* (sisi server internal).

## 13.4 Pustaka Frontend Eksternal
* **Mermaid.js (v12)**: Digunakan untuk merender 8 jenis diagram grafis teknis langsung di DOM peramban klien tanpa perlu mengirim sintaks teks diagram ke server eksternal, menjamin kerahasiaan diagram arsitektur pengguna.
* **JSZip (v3)**: Mengompres seluruh artefak dokumen PRD, panduan desain, dan skrip SQL menjadi satu file unduhan `.zip` langsung di memori peramban klien.
* **QRCode.react (v4)**: Merender data string QRIS dinamis EMVCo menjadi elemen SVG tajam beresolusi tinggi di layar pop-up tanpa bergantung pada API eksternal pembuat barcode.
