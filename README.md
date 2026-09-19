<div align="center">

<img src="public/og-image.jpg" alt="ngodingpakeprd" width="760" />

<br />
<br />

# ngodingpakeprd

**Enterprise AI Architecture Blueprint & Modern PRD Engine**

Transform single-sentence product ideas into complete, production-grade technical PRDs, interactive architecture diagrams, and AI-coding starter kits within seconds.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![QRIS Payment](https://img.shields.io/badge/Gateway-Mandiri_Private_Gateway-f59e0b?style=flat-square)](#sistem-pembayaran-mandiri-private-gateway)
[![License](https://img.shields.io/badge/License-Private-71717a?style=flat-square)](#)

[Live Demo](https://ngodingpakeprd.com) · [Privacy Policy](https://ngodingpakeprd.com/privacy) · [Terms of Service](https://ngodingpakeprd.com/terms)

</div>

---

## Ringkasan Eksekutif

**ngodingpakeprd** adalah sistem arsitektur perangkat lunak berbasis kecerdasan buatan yang dirancang untuk menjembatani ide produk dan eksekusi AI coding modern (seperti Antigravity, Cursor, Claude Code, dan Windsurf).

Platform ini mengeliminasi fase penyusunan dokumen manual yang memakan waktu berhari-hari. Dari satu prompt ide, sistem membedah kebutuhan bisnis secara adaptif, merancang skema basis data relasional, menyusun kontrak perilaku AI, dan mengemas seluruh artefak ke dalam bundle siap pakai.

---

## Pilar Fitur Utama

### 1. Wizard Discovery & Bedah Kebutuhan Adaptif
- Pertanyaan klarifikasi dinamis (4 hingga 10 pertanyaan mendalam) yang disesuaikan secara real-time berdasarkan kompleksitas ide.
- Dukungan pilihan multi-select untuk modul integrasi pihak ketiga, struktur peran pengguna, dan arsitektur database.
- Ekstraksi otomatis jawaban pengguna langsung ke formulir cetak biru arsitektur teknis.

### 2. Lima Diagram Arsitektur Standar Industri (Mermaid .mmd)
- **C4 System Architecture**: Visualisasi batas sistem, API gateway, microservice, dan database.
- **Sequence Flow Diagram**: Alur kerja interaksi komponen saat menangani request kritis.
- **Relational Database ERD**: Struktur entitas, foreign key, index, dan tipe relasi data.
- **State Machine Diagram**: Siklus hidup status transaksi, pesanan, atau entitas utama.
- **Dynamic Phased Feature Tree**: Roadmap pengembangan berfase (Fase 1 hingga Fase 5) yang tersusun rapi.

### 3. Generator Dokumen & Standar Desain Anti-AI Slop
- **PRD Dokumen Lengkap**: Mencakup Problem Hypothesis, Boundaries Scope, User Stories, Tech Stack, dan AI Behavior Contract.
- **DESIGN.md Interaktif**: Sistem token desain UI/UX dengan pemilih palet warna kustom (HEX) atau peracik palet harmonis AI otomatis.
- **AI Agent Context Assets**: Integrasi langsung aturan konteks untuk `.cursorrules`, `CLAUDE.md`, dan `docs/ARCHITECTURE-SEQUENCE.mmd`.
- **1-Click Starter Kit**: Ekspor seluruh cetak biru dalam format arsip `.ZIP` siap ekstrak ke workspace proyek.

### 4. Multi-Tier Langganan & Pelacak Kuota Harian (Fair Usage Policy)
- Tier **Free**: Akses uji coba starter untuk evaluasi ide produk.
- Tier **PLUS**: Kuota 10 PRD per hari, cocok untuk solo developer dan tech builder aktif.
- Tier **PRO**: Kuota 50 PRD per hari, prioritas load-balancing AI, dan akses seluruh diagram lanjutan.
- Pelacakan kuota harian otomatis berbasis zona waktu WIB (reset setiap 00:00).
- Dukungan upgrade mulus dari PLUS ke PRO langsung di antarmuka pengguna.

### 5. Sistem Pembayaran: Mandiri Private Gateway (MPG Headless QRIS)
- **Zero Third-Party Fee**: Pembayaran langsung ke rekening bank/GoPay tanpa potongan biaya admin pihak ketiga.
- **Dynamic QRIS (EMVCo ASPI)**: Pembuatan invoice otomatis dengan nominal unik 3 digit terakhir untuk pencocokan transaksi instan.
- **Headless In-App Modal**: Barcode QRIS SVG interaktif langsung di dalam aplikasi tanpa pengalihan domain (redirect).
- **Automated Webhook & Cryptographic Verification**: Verifikasi tanda tangan HMAC-SHA256 (X-Signature) dengan proteksi idempotensi untuk mencegah perpanjangan langganan ganda.
- **Fail-Safe Fallback**: Beralih otomatis ke mode pembayaran manual jika gateway sedang offline, memastikan proses transaksi pengguna tidak terganggu.

---

## Tech Stack & Infrastruktur

| Komponen | Teknologi |
|---|---|
| Framework Frontend | Next.js 16.3.5 (Turbopack Engine) + React 19 |
| Bahasa Pemrograman | TypeScript 5.x (Strict Type Checking) |
| Desain & Styling | Tailwind CSS 4.x + Lucide Icons |
| Basis Data & Auth | Supabase (PostgreSQL 15+, Row Level Security, Service Role Auth) |
| Mesin AI | Multi-Provider Architecture (Gemini Direct Flash Ladder, OpenRouter, 9Router) |
| Visualisasi Diagram | Mermaid.js v12 |
| Payment Gateway | Mandiri Private Gateway (Headless Dynamic QRIS) + GoBiz QRIS Fallback |
| Kontainerisasi | Docker Multi-Stage Build (Coolify / VPS / Vercel Ready) |

---

## Panduan Instalasi Lokal

### Prasyarat
- Node.js 20.x atau LTS terbaru
- Akun Supabase (project baru atau yang sudah ada)
- Kunci API Google Gemini (dari Google AI Studio)

### Langkah Pemasangan

```bash
# 1. Kloning repositori
git clone https://github.com/daerobi-devs/ngodingpakeai.git
cd ngodingpakeai

# 2. Pasang dependensi
npm install

# 3. Siapkan file konfigurasi lingkungan
cp .env.example .env.local

# 4. Jalankan migrasi database di Supabase SQL Editor:
#    - admin_setup.sql (setup tabel inti dan RLS)
#    - supabase_migration_mpg.sql (setup kolom payment gateway MPG)

# 5. Jalankan server lokal
npm run dev
```

Buka peramban di `http://localhost:3000`.

---

## Konfigurasi Environment Variables

Simpan kredensial pada file `.env.local`:

```env
# Konfigurasi Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Akses Admin Dashboard
ADMIN_PASSCODE=your-secure-admin-passcode
ADMIN_SECRET_KEY=your-admin-secret-key

# Mandiri Private Gateway (Opsional jika dikonfigurasi via Dashboard Admin)
MPG_GATEWAY_URL=http://localhost:3000
MPG_API_KEY=mpg_live_your_api_key_here
MPG_WEBHOOK_SECRET=your-mandiri-private-gateway-hmac-secret
```

---

## Struktur Direktori Proyek

```
src/
├── app/
│   ├── admin/                    # Stealth Admin Control Plane & Monitoring
│   ├── api/
│   │   ├── admin/                # Manajemen user, tier, dan pengujian gateway
│   │   ├── generate-prd/         # Endpoint utama orkestrasi PRD
│   │   ├── generate-clarifications/# Endpoint bedah kebutuhan terpandu
│   │   ├── orders/               # Pengelolaan pesanan & headless MPG invoice
│   │   ├── profile/              # Autoritatif user profile & sisa kuota harian
│   │   ├── settings/             # Pengaturan dinamis sistem & konfigurasi harga
│   │   └── webhook/
│   │       └── payment-success/  # Webhook verifikasi HMAC-SHA256 pembayaran
│   ├── generator/                # Studio Generator Interaktif
│   ├── privacy/                  # Halaman Kebijakan Privasi
│   └── terms/                    # Halaman Syarat & Ketentuan
├── components/
│   ├── landing/                  # Komponen showcase & blueprint landing page
│   ├── wizard/                   # Komponen Wizard Discovery multi-step
│   ├── icons/                    # Kumpulan vektor SVG resmi teknologi
│   ├── Navbar.tsx                # Navigasi utama dengan tier badge & counter kuota
│   ├── PricingModal.tsx          # Modal headless checkout QRIS 2-step
│   └── PRDViewer.tsx             # Penampil PRD komprehensif & ekspor dokumen
└── lib/
    ├── ai/                       # AI Service Layer terpadu multi-provider
    ├── gemini/                   # Prompt arsitektur, skema Zod, & domain discovery
    ├── mpg/                      # Klien HTTP MPG & verifikasi tanda tangan kriptografis
    └── supabase/                 # Supabase client, admin client, dan definisi tipe
```

---

## Deployment Produksi

### Opsi 1: Docker (VPS / Coolify)
Proyek ini dilengkapi `Dockerfile` multi-stage build yang optimal:

```bash
# Build Docker image
docker build -t ngodingpakeprd:latest .

# Jalankan kontainer
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e ADMIN_PASSCODE=... \
  ngodingpakeprd:latest
```

### Opsi 2: Vercel
1. Impor repositori ke Vercel.
2. Tambahkan variabel lingkungan pada menu Settings > Environment Variables.
3. Deploy. Build Turbopack Next.js 16 akan mengompilasi seluruh rute secara otomatis.

---

## Kebijakan & Lisensi

Proyek ini bersifat tertutup (Private Proprietary). Seluruh hak cipta dilindungi undang-undang.

- [Privacy Policy](https://ngodingpakeprd.com/privacy)
- [Terms of Service](https://ngodingpakeprd.com/terms)

<div align="center">
  <sub>Dikembangkan oleh <a href="https://github.com/daerobi-devs">@daerobi-devs</a> · Hak Cipta ngodingpakeprd 2026</sub>
</div>
