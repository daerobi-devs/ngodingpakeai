# Bab 5: Struktur Project dan Penjelasan Kode Sumber

## 5.1 Pohon Struktur Direktori
Berikut adalah pemetaan pohon direktori kode sumber sistem (mengabaikan `node_modules`, `.next`, dan `.git`):

```text
d:/PAKEPRDAJA/
├── .env.example                       # Template variabel lingkungan sistem
├── .env.local                          # Variabel lingkungan lokal privat (tidak di-commit)
├── .gitignore                          # Konfigurasi pengabaian Git
├── Dockerfile                          # Multi-stage Dockerfile (deps, builder, runner)
├── next.config.ts                      # Konfigurasi Next.js 16, security headers & standalone
├── package.json                        # Daftar dependensi, skrip npm, dan metadata proyek
├── postcss.config.mjs                  # Konfigurasi TailwindCSS PostCSS
├── tsconfig.json                       # Konfigurasi compiler TypeScript 5
├── admin_setup.sql                     # Skrip SQL inisialisasi akun Super Administrator
├── supabase_schema.sql                 # Skrip SQL skema master basis data Supabase
├── supabase_migration_v2.sql           # Skrip SQL migrasi slot Gemini dan tier pricing
├── supabase_migration_mpg.sql          # Skrip SQL migrasi Mandiri Private Gateway (MPG)
├── token_and_history_setup.sql         # Skrip SQL migrasi audit kuota & token history
├── docs/                               # Dokumentasi teknis sistem & diagram
│   ├── diagrams/                       # Sumber Mermaid (.mmd) dan hasil render (.svg, .png)
│   ├── laporan/                        # File laporan teknis Bab 1 - 21 & LAPORAN_LENGKAP
│   └── proposal/                       # File proposal bisnis & teknis
├── public/                             # Aset statis publik (favicon, ikon, open-graph)
└── src/
    ├── app/                            # Next.js 16 App Router (Halaman & Endpoint API)
    │   ├── layout.tsx                  # Root Layout, AuthProvider & global theme
    │   ├── page.tsx                    # Landing Page utama & Blueprint Studio
    │   ├── globals.css                 # CSS global, styling utility & scrollbar
    │   ├── admin/                      # Halaman Master Dashboard Admin 6 Tab
    │   │   └── page.tsx                # Implementasi lengkap Admin Control Center
    │   ├── generator/                  # Halaman Ruang Kerja Pembuat PRD
    │   │   └── page.tsx                # Implementasi wizard, viewer, dan visualizer
    │   ├── privacy/page.tsx            # Halaman Kebijakan Privasi
    │   ├── terms/page.tsx              # Halaman Syarat dan Ketentuan Layanan
    │   ├── auth/callback/route.ts      # Handler pertukaran token OAuth / Magic Link
    │   └── api/                        # Next.js Route Handlers (Backend API)
    │       ├── admin/route.ts          # Endpoint kontrol operasi admin
    │       ├── assist-section/route.ts # Endpoint asisten revisi sub-seksi PRD
    │       ├── autofill-prd/route.ts   # Endpoint pelengkap formulir cepat
    │       ├── enrich-idea/route.ts    # Endpoint elaborasi ide konsep 4 pilar
    │       ├── generate-clarifications/# Endpoint penemuan domain & pertanyaan
    │       │   └── route.ts
    │       ├── generate-prd/route.ts   # Endpoint orkestrasi sintesis PRD utama
    │       ├── orders/route.ts         # Endpoint pembuatan invoice pesanan QRIS
    │       ├── profile/route.ts        # Endpoint verifikasi profil & kuota pengguna
    │       ├── settings/route.ts       # Endpoint konfigurasi publik sistem
    │       ├── stats/route.ts          # Endpoint statistik generasi komunitas ter-cache
    │       ├── user-prds/route.ts      # Endpoint riwayat PRD spesifik pengguna
    │       ├── validate-key/route.ts   # Endpoint validasi kunci Gemini BYOK
    │       └── webhook/                # Endpoint penanganan webhook pembayaran
    │           └── payment-success/
    │               └── route.ts        # Handler webhook instan MPG HMAC-SHA256
    ├── components/                     # Komponen Antarmuka Pengguna (UI Components)
    │   ├── AnnouncementBanner.tsx      # Banner pengumuman global dinamis
    │   ├── ApiKeyModal.tsx             # Modal input kunci BYOK Gemini
    │   ├── AuthModal.tsx               # Modal login Google OAuth & Magic Link
    │   ├── BeginnerRoadmap.tsx         # Panduan bertahap untuk pemula
    │   ├── ClarifierModal.tsx          # Modal pertanyaan klarifikasi cepat
    │   ├── CustomPaletteModal.tsx      # Modal pemilihan palet warna UI kustom
    │   ├── GeneratorSidebar.tsx        # Panel samping riwayat generasi pengguna
    │   ├── MermaidRenderer.tsx         # Renderer 8-diagram Mermaid dengan zoom/pan
    │   ├── MindmapViewer.tsx           # Visualisasi diagram mindmap konsep
    │   ├── Navbar.tsx                  # Navigasi utama dengan counter komunitas
    │   ├── OnboardingModal.tsx         # Modal sambutan panduan pengguna baru
    │   ├── PRDForm.tsx                 # Formulir konfigurasi PRD klasik
    │   ├── PRDViewer.tsx               # Penampil dokumen PRD alir bersih & TOC
    │   ├── PhasedFeatureTree.tsx       # Pohon fitur modul kurva kurvatur Bezier SVG
    │   ├── PricingModal.tsx            # Modal paket harga & 3-jalur pembayaran QRIS
    │   ├── SectionAssistantModal.tsx   # Modal asisten penyuntingan seksi PRD
    │   ├── ThemeToggle.tsx             # Switch mode tema terang/gelap
    │   ├── icons/TechIcons.tsx         # Koleksi ikon SVG teknologi (Next, React, dll)
    │   ├── landing/                    # Komponen khusus halaman depan (Landing Page)
    │   │   ├── InteractiveBlueprintStudio.tsx # Studio interaktif pratinjau PRD
    │   │   ├── LandingTemplateShowcase.tsx    # Galeri kartu preset arsitektur
    │   │   └── VisualWorkflowPipeline.tsx     # Alur animasi pipa kerja PRD
    │   └── wizard/                     # Komponen antarmuka wizard pembuatan PRD
    │       ├── CustomStackModal.tsx    # Modal peracik custom stack teknologi
    │       ├── WizardDiscoveryStep.tsx # Langkah interaktif pertanyaan & rekomendasi
    │       └── WizardHeroInput.tsx     # Input ide hero, template picker & enrich AI
    ├── context/                        # React Context State Management
    │   └── AuthContext.tsx             # Global Auth Provider (User, Tier, Settings)
    ├── lib/                            # Pustaka Utilitas & Integrasi Layanan
    │   ├── demo-data.ts                # Data contoh PRD lengkap untuk pratinjau
    │   ├── design-template.ts          # Generator dokumen DESIGN.md starter kit
    │   ├── form-presets.ts             # Preset formulir konfigurasi arsitektur
    │   ├── ai/                         # Pustaka pendukung model AI
    │   │   ├── ai-service.ts           # Abstraksi pemanggilan layanan AI
    │   │   └── openai-compat.ts        # Kompatibilitas format OpenAI / DeepSeek
    │   ├── gemini/                     # Mesin Utama Google Gemini Integration
    │   │   ├── domain-discovery.ts     # Logika deteksi domain & pertanyaan preset
    │   │   ├── gemini-client.ts        # Client SDK, Model Ladder & Key Pool Rotator
    │   │   ├── prompts.ts              # System prompt 8 diagram & rekayasa PRD
    │   │   └── schemas.ts              # Zod schema & Gemini responseSchema validator
    │   ├── mpg/                        # Mandiri Private Gateway (MPG) SDK
    │   │   └── client.ts               # Integrasi invoice, QRIS & verifikasi HMAC
    │   ├── supabase/                   # Supabase Database Client Modules
    │   │   ├── admin.ts                # Client Supabase Service Role (Akses Penuh)
    │   │   ├── client.ts               # Client Supabase Browser (Anon Key)
    │   │   ├── server.ts               # Client Supabase Server Actions & Route Handlers
    │   │   └── types.ts                # Definisi tipe tabel database PostgreSQL
    │   └── templates/archetypes.ts     # Definisi 4 arsitektur starter (Web, Mobile, AI, Custom)
    └── types/
        └── prd.ts                      # Definisi tipe antarmuka PRD & 8 Diagram
```

## 5.2 Peran dan Tanggung Jawab Direktori Kunci
1. **`src/app/api/`**: Bertanggung jawab sebagai *Backend-for-Frontend* (BFF). Seluruh komunikasi data sensitif (seperti pemanggilan kunci API Gemini Master dan verifikasi pembayaran) dieksekusi secara terisolasi di sisi server tanpa mengekspos kredensial ke peramban.
2. **`src/lib/gemini/`**: Jantung kecerdasan sistem. Mengelola toleransi kegagalan jaringan (*network resilience*), rotasi otomatis kunci API (*Key Pool Manager*), eskalasi model bertingkat (*Model Ladder*), serta penegakan validitas format data dengan Zod.
3. **`src/components/wizard/`**: Menangani pengalaman pengguna saat pertama kali menuangkan ide. Mengintegrasikan tombol *Perkaya Ide (AI)* yang sangat responsif, menu dropdown preset arsitektur, dan chip pertanyaan klarifikasi interaktif.
4. **`src/components/PRDViewer.tsx`**: Menangani penyajian dokumen teknis hasil kompilasi AI menggunakan tipografi mengalir bersih (*clean typography flow*) ala Notion atau Stripe Docs, lengkap dengan navigasi TOC *sticky* samping, pohon fitur SVG, dan 8 tab diagram Mermaid.
