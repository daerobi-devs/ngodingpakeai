# Bab 9: Arsitektur Backend dan Spesifikasi API

## 9.1 Arsitektur Backend
Backend sistem dibangun menggunakan arsitektur **Next.js 16 Route Handlers** yang beroperasi di lingkungan Node.js 22 runtime. Pola perancangan backend mematuhi prinsip-prinsip *Clean Architecture* dan *Separation of Concerns*:
* Setiap rute endpoint didefinisikan secara independen di direktori `src/app/api/<endpoint>/route.ts`.
* Operasi basis data yang memerlukan hak akses administratif dieksekusi melalui *Supabase Admin Client* berprivilese *Service Role Key* yang tidak pernah terekspos ke klien.
* Penanganan kesalahan (*error handling*) dibungkus dalam blok `try/catch` komprehensif dengan respons format JSON terstandarisasi.

## 9.2 Katalog Lengkap Endpoint API
Tabel berikut mendokumentasikan seluruh 13 rute endpoint API yang beroperasi di dalam sistem:

| Method | Path Endpoint | Fungsi & Deskripsi | Format Request Body | Format Response | Aturan Autentikasi | File Sumber |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/admin` | Mengambil statistik sistem, daftar slot kunci, antrean pesanan, dan daftar pengguna | Tidak ada (Query parameters) | JSON data administratif lengkap | Wajib Header Passcode Admin | `src/app/api/admin/route.ts` |
| **POST** | `/api/admin` | Mengeksekusi mutasi admin: simpan setting, rotasi slot, verifikasi order, ban user, hapus PRD log | JSON `{ action, payload }` | JSON `{ success: true }` | Wajib Header Passcode Admin | `src/app/api/admin/route.ts` |
| **POST** | `/api/assist-section` | Merevisi atau memperluas konten seksi spesifik dari PRD menggunakan AI | JSON `{ sectionKey, prompt, currentPRD }` | JSON `{ success: true, updatedContent }` | Sesi Login / BYOK Key | `src/app/api/assist-section/route.ts` |
| **POST** | `/api/autofill-prd` | Melengkapi formulir PRD klasik secara otomatis berdasarkan ide ringkas | JSON `{ idea, templateId }` | JSON `{ success: true, formFields }` | Publik / Free Trial | `src/app/api/autofill-prd/route.ts` |
| **POST** | `/api/enrich-idea` | Mentransformasikan ide mentah menjadi 4 pilar arsitektur lengkap via Gemini Flash (budget 0) | JSON `{ userIdea, language, templateId }` | JSON `{ success: true, enrichedIdea }` | Publik / BYOK / Server Key | `src/app/api/enrich-idea/route.ts` |
| **POST** | `/api/generate-clarifications`| Menganalisis ide, mendeteksi domain, dan menghasilkan opsi pertanyaan berbadge rekomendasi | JSON `{ userIdea, language }` | JSON `{ success: true, questions: [...] }` | Publik / Free Trial | `src/app/api/generate-clarifications/route.ts` |
| **POST** | `/api/generate-prd` | Endpoint inti pembuatan PRD lengkap, 8 diagram Mermaid, dan audit log pemakaian kuota | JSON `{ idea, answers, templateId, customStack }` | JSON `{ success: true, prd: PRDOutput }` | Evaluasi Kuota / Token Server | `src/app/api/generate-prd/route.ts` |
| **GET** | `/api/orders` | Memeriksa status pesanan langganan berdasarkan kode order | Query `?code=ORDER_CODE` | JSON `{ status: 'pending'/'approved' }` | Publik / Pembeli | `src/app/api/orders/route.ts` |
| **POST** | `/api/orders` | Menerbitkan pesanan pembayaran baru via gateway MPG (Headless/Hosted/Manual) | JSON `{ tierId, checkoutMode, userEmail }` | JSON `{ success: true, qr_string, checkout_url }` | Sesi Pengguna Terautentikasi | `src/app/api/orders/route.ts` |
| **GET** | `/api/profile` | Mengambil rincian profil pengguna aktif, sisa kuota PRD, dan status kedaluwarsa Pro | Tidak ada (Cookie Session) | JSON `{ profile, usageToday, remainingQuota }`| Sesi Cookie Supabase | `src/app/api/profile/route.ts` |
| **GET** | `/api/settings` | Mengambil konfigurasi publik sistem (mode auth, opsi bayar, pricing tiers, banner) | Tidak ada | JSON `{ settings: SystemSettings }` | Publik Terbuka | `src/app/api/settings/route.ts` |
| **GET** | `/api/stats` | Mengambil statistik ringkasan agregat komunitas (total PRD, pengguna aktif) dengan cache server | Tidak ada | JSON `{ totalPRDs, totalUsers, cachedAt }` | Publik Terbuka | `src/app/api/stats/route.ts` |
| **GET** | `/api/user-prds` | Mengambil daftar riwayat dokumen PRD yang pernah dibuat oleh pengguna terautentikasi | Tidak ada (Cookie Session) | JSON `{ prds: [...] }` | Sesi Cookie Supabase | `src/app/api/user-prds/route.ts` |
| **POST** | `/api/validate-key` | Menguji keabsahan dan kuota kunci API Google Gemini pribadi (BYOK) | JSON `{ apiKey }` | JSON `{ valid: boolean, models: [...] }` | Publik / BYOK | `src/app/api/validate-key/route.ts` |
| **POST** | `/api/webhook/payment-success`| Menerima notifikasi mutasi transfer lunas dari server MPG dengan verifikasi signature HMAC | Raw JSON Webhook Payload | JSON `{ success: true, status: 'ok' }` | Verifikasi HMAC-SHA256 Secret | `src/app/api/webhook/payment-success/route.ts` |

---

### Gambar 8: UML Sequence Diagram - Alur Generate PRD
![Gambar 8: UML Sequence Diagram - Alur Generate PRD](../diagrams/08_sequence_generate_prd.png)
*Gambar 8: UML Sequence Diagram - Alur Generate PRD*

* **Cara Membaca Diagram**: Diagram Sequence di atas memperlihatkan urutan pertukaran pesan asinkron antara Pengguna, Frontend, Backend API, Basis Data Supabase, dan Google Gemini API selama proses pembuatan PRD.

---

### Gambar 9: UML Sequence Diagram - Alur Pembayaran & Webhook MPG
![Gambar 9: UML Sequence Diagram - Alur Pembayaran & Webhook MPG](../diagrams/09_sequence_payment_webhook.png)
*Gambar 9: UML Sequence Diagram - Alur Pembayaran & Webhook MPG*

* **Cara Membaca Diagram**: Diagram di atas mengilustrasikan urutan panggilan API saat pembuatan invoice QRIS dinamis, penerimaan notifikasi bank oleh gateway MPG, pemanggilan webhook ke Next.js API, serta verifikasi kriptografi HMAC-SHA256 untuk memvalidasi integritas pesan sebelum memperbarui status transaksi.

---

### Gambar 10: UML Sequence Diagram - Autentikasi OAuth & Magic Link
![Gambar 10: UML Sequence Diagram - Autentikasi OAuth & Magic Link](../diagrams/10_sequence_auth_flow.png)
*Gambar 10: UML Sequence Diagram - Autentikasi OAuth & Magic Link*

* **Cara Membaca Diagram**: Diagram di atas menunjukkan dua alur masuk pengguna: Google OAuth 2.0 dan email Magic Link OTP melalui Supabase GoTrue Auth dan rute pertukaran token `/auth/callback`.
