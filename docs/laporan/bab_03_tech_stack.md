# Bab 3: Tech Stack dan Landasan Teknologi

## 3.1 Daftar Teknologi Utama
Berdasarkan audit konfigurasi dependensi pada file `package.json`, konfigurasi `next.config.ts`, `tsconfig.json`, dan file lingkungan `.env.example`, sistem dibangun di atas tumpukan teknologi modern berkinerja tinggi sebagai berikut:

| Kategori | Teknologi | Versi | Fungsi dalam Sistem | Alasan Pemilihan Teknis | Bukti File Sumber |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Framework Utama** | Next.js (App Router) | 16.3.5 | Web framework full-stack, Server Components & Route Handlers | Arsitektur full-stack terpadu, SSR/SSG, kompilasi Turbopack super cepat, dan output standalone untuk Docker | `package.json`, `next.config.ts` |
| **Library UI** | React & React-DOM | 19.2.8 | Antarmuka pengguna reaktif dan rendering berbasis komponen | Fitur React 19 terbaru (Actions, Server Components, Hooks modern) | `package.json` |
| **Bahasa Pemrograman** | TypeScript | ^5.0.0 | Bahasa pemrograman dengan sistem pengetikan statis (*static typing*) | Keamanan tipe menyeluruh (*end-to-end type safety*), meminimalkan runtime error, dan integrasi mulus dengan schema Zod | `tsconfig.json`, `package.json` |
| **Styling & CSS** | TailwindCSS | ^4.0.0 | Framework utility-first CSS | Mesin Tailwind v4 berkecepatan tinggi berbasis PostCSS, tanpa konfigurasi kompleks, ukuran bundle CSS sangat ringkas | `package.json`, `src/app/globals.css` |
| **Validasi Skema** | Zod | ^4.6.5 | Validasi runtime schema dan parsing JSON respons AI | Menjamin output AI sesuai dengan struktur data yang diharapkan aplikasi sebelum dirender | `package.json`, `src/lib/gemini/schemas.ts` |
| **Basis Data & Auth** | Supabase (PostgreSQL) | ^2.116.0 | Database relasional PostgreSQL, Row Level Security (RLS), dan Autentikasi | Basis data relasional enterprise, penyimpanan JSONB fleksibel, serta auth OAuth/OTP terintegrasi | `src/lib/supabase/client.ts`, `supabase_schema.sql` |
| **Supabase SSR** | @supabase/ssr | ^0.12.7 | Manajemen sesi auth berbasis cookie pada Next.js Server & Client | Penanganan autentikasi yang aman di sisi server (Server Actions & Route Handlers) menggunakan cookie HTTP-Only | `package.json`, `src/lib/supabase/server.ts` |
| **AI SDK** | @google/genai & @google/generative-ai | ^2.22.0 / ^0.24.1 | SDK resmi Google Gemini AI | Akses langsung ke model Gemini 2.5, 3.5, dan 3.8 Flash melalui Google AI Studio | `package.json`, `src/lib/gemini/gemini-client.ts` |
| **Visualisasi Diagram** | Mermaid.js | ^12.0.0 | Rendering diagram grafis teknis berbasis sintaks teks deklaratif | Standar de-facto diagram teknis (Flowchart, ERD, Sequence, C4, GitGraph) tanpa ketergantungan server | `package.json`, `src/components/MermaidRenderer.tsx` |
| **Ikonografi** | Lucide React | ^1.46.0 | Koleksi ikon vektor SVG bersih dan konsisten | Standar antarmuka profesional tanpa ketergantungan aset raster, mendukung zero emoji policy | `package.json`, `src/components/Navbar.tsx` |
| **Penyusunan Arsip** | JSZip | ^3.10.2 | Pembuatan file arsip .ZIP di peramban klien | Mengompres starter kit, aturan linter, skema SQL, dan dokumen PRD menjadi satu file unduhan | `package.json`, `src/components/PRDViewer.tsx` |
| **Barcode Generator** | qrcode.react | ^4.2.0 | Rendering barcode QRIS SVG / Canvas interaktif | Menampilkan barcode QRIS dinamis berstandar ASPI EMVCo langsung di modal pembayaran tanpa latensi jaringan | `package.json`, `src/components/PricingModal.tsx` |
| **Efek Animasi** | canvas-confetti | ^1.9.4 | Partikel selebrasi pada canvas | Umpan balik visual yang menyenangkan saat transaksi pembayaran berhasil diverifikasi | `package.json`, `src/app/generator/page.tsx` |

## 3.2 Lingkungan Runtime dan Kontainerisasi
* **Runtime**: Node.js versi 22 LTS (berbasis image Docker `node:22-slim`).
* **Container Engine**: Docker multi-stage build dengan optimasi *standalone output* Next.js, menghasilkan image produksi ringkas (~180 MB) dengan hak akses pengguna non-root (`nextjs:1001`) demi keamanan server.
* **Orkestrasi Deployment**: Kompatibel dengan Coolify, Portainer, Docker Compose, maupun Kubernetes.
