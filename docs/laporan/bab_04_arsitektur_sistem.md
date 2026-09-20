# Bab 4: Arsitektur Sistem dan Pola Desain

## 4.1 Pola Arsitektur Keseluruhan
Sistem NgodingPakePRD mengadopsi pola arsitektur **Modern Full-Stack Jamstack / Serverless-Ready Architecture** berbasis Next.js App Router yang terdistribusi ke dalam 4 tingkatan (*4-tier architecture*):
1. **Presentation Tier (Client Side)**: Berjalan di browser pengguna menggunakan React 19 Client Components, mengelola *client state* lokal, *optimistic UI updates*, interaktivitas visualisasi grafis SVG, serta rendering diagram *Mermaid.js*.
2. **Application & Routing Tier (Server Side)**: Berjalan di Node.js 22 runtime sebagai Next.js Server Components dan API Route Handlers, menangani validasi keamanan, pemeriksaan otorisasi sesi, orkestrasi panggilan model AI, dan manajemen *webhook*.
3. **Data & Persistence Tier (Database Side)**: Layanan terkelola Supabase PostgreSQL yang dilindungi oleh *Row Level Security* (RLS), menangani integritas referensial, tabel relasional, serta pencatatan log audit bertipe JSONB.
4. **External Services Tier (Cloud Integrations)**: Endpoint REST eksternal Google AI Studio (Gemini Language API) dan gateway pembayaran Mandiri Private Gateway (MPG).

## 4.2 Diagram Arsitektur C4 Model
Untuk mendokumentasikan arsitektur sistem secara komprehensif berstandar internasional, arsitektur diuraikan menggunakan pendekatan **C4 Model** (Context, Container, Component):

### Gambar 1: C4 Model Level 1 - System Context Diagram
![Gambar 1: C4 Model Level 1 - System Context Diagram](../diagrams/01_c4_system_context.png)
*Gambar 1: C4 Model Level 1 - System Context Diagram*

* **Cara Membaca Diagram**: Diagram di atas menggambarkan batasan sistem NgodingPakePRD dalam hubungannya dengan tiga aktor pengguna (Pengguna Umum, Pengguna Pro/Unlimited, dan Super Administrator) serta tiga layanan eksternal utama (Google Gemini API, Gateway Pembayaran MPG, dan Layanan Cloud Supabase).
* **Penjelasan Naratif**: Pengguna umum dan pro berinteraksi dengan sistem untuk membuat spesifikasi teknis dan melakukan transaksi pembayaran QRIS. Super Administrator berinteraksi untuk mengontrol sistem switchboard dan alokasi kuota. Sistem secara otonom meneruskan prompt ke Google Gemini, memvalidasi pembayaran ke MPG, dan menyimpan status pengguna di Supabase.

---

### Gambar 2: C4 Model Level 2 - Container Diagram
![Gambar 2: C4 Model Level 2 - Container Diagram](../diagrams/02_c4_container.png)
*Gambar 2: C4 Model Level 2 - Container Diagram*

* **Cara Membaca Diagram**: Diagram Container menguraikan unit-unit perangkat lunak independen yang dapat dieksekusi di dalam sistem.
* **Penjelasan Naratif**: Container utama adalah Next.js 16 Application Server (Node.js 22) yang membungkus antarmuka SPA Frontend React 19, API Route Handlers, dan Supabase SSR Cookie Auth Handler. Container basis data berada di Supabase (PostgreSQL + GoTrue Auth), sedangkan layanan eksternal dihubungkan via koneksi HTTPS terenkripsi TLS 1.3.

---

### Gambar 3: C4 Model Level 3 - Component Diagram
![Gambar 3: C4 Model Level 3 - Component Diagram](../diagrams/03_c4_component.png)
*Gambar 3: C4 Model Level 3 - Component Diagram*

* **Cara Membaca Diagram**: Diagram Komponen membedah modul internal di dalam container Next.js API Routes dan pustaka inti (*src/lib/*).
* **Penjelasan Naratif**: Modul API (`enrich-idea`, `generate-clarifications`, `generate-prd`, `orders`, `webhook`, `admin`) bertindak sebagai pengontrol yang mengonsumsi pustaka modular: `gemini-client.ts` untuk manajemen ladder model dan rotasi kunci, `prompts.ts` untuk rekayasa instruksi, `schemas.ts` untuk penegakan kontrak Zod, `client.ts` untuk integrasi gateway MPG, dan `admin.ts` untuk klien Supabase dengan Service Role privileges.

---

### Gambar 4: Diagram Arsitektur Sistem Keseluruhan
![Gambar 4: Diagram Arsitektur Sistem Keseluruhan](../diagrams/04_system_architecture.png)
*Gambar 4: Diagram Arsitektur Sistem Keseluruhan*

* **Cara Membaca Diagram**: Diagram di atas memperlihatkan interaksi komprehensif antara Client Presentation Tier, Server Application Tier, Data Persistence Tier, dan External Infrastructure Tier secara vertikal.
