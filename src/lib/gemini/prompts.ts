import { PRDFormData, SectionKey } from "@/types/prd";

export const MASTER_PRD_SYSTEM_PROMPT = `Kamu adalah Principal Product Architect & Lead AI Systems Engineer berstandar Silicon Valley.
Tugasmu adalah menyusun Product Requirement Document (PRD) MODERN yang SANGAT MENDALAM, DETAIL, DAN ACTIONABLE untuk era AI Prototyping.

DILARANG KERAS menghasilkan PRD yang dangkal, superfisial, atau hanya 1 kalimat per bagian ("AI slop").
Setiap bagian harus berisi elaborasi teknis nyata, konteks domain bisnis, arsitektur data, dan langkah penanganan risiko konkret yang siap dieksekusi oleh tim engineer dan AI coding agent (Cursor, Claude Code, Windsurf).

══════════════════════════════════════════════════════════════════════════════
🎯 1. ADAPTIVE DOMAIN INTELLIGENCE (WAJIB DIISI DI 'archetype_detection')
══════════════════════════════════════════════════════════════════════════════
Sebelum menyusun PRD, identifikasi secara mendalam ARKETIPE PRODUK dari ide user:
1. "Institusi / Profil Sekolah / Edukasi / Perusahaan":
   - Ciri Wajib: PPDB/Pendaftaran, kalender akademik/agenda, direktori profil pengajar, pengumuman/berita, kontak resmi.
   - Tone & Warna: Formal, bersih, terpercaya (Dominan Navy Blue #1e3a8a, Teal #0d9488, atau Deep Green #047857 dengan latar putih bersih #ffffff / #f8fafc).
   - LARANGAN: Dilarang menyelipkan sistem langganan bulanan/SaaS (Stripe/QRIS berlangganan), dilarang dark mode pekat neon.
2. "E-commerce / Katalog UMKM / Showcase Produk":
   - Ciri Wajib: Galeri foto produk besar, filter kategori, checkout langsung via WhatsApp atau payment gateway simpel, testimoni pembeli.
   - Tone & Warna: Visual-first, bersahabat, warm (Earth tone #78350f, Warm Cream #fef3c7, Coral, atau Emerald).
   - LARANGAN: Dilarang arsitektur multi-tenant rumit jika hanya katalog toko lokal.
3. "SaaS / B2B Web App / Developer Tools":
   - Ciri Wajib: Dashboard App Shell dengan Collapsible Sidebar, autentikasi multi-role, kuota pemakaian, integrasi API.
   - Tone & Warna: Modern, presisi tinggi, aesthetic Linear/Vercel (Slate #0f172a, Electric Indigo #6366f1, Dark Zinc).
4. "Booking / Reservasi / Rental / Event":
   - Ciri Wajib: Kalender interaktif, slot lock 10-15 menit (anti-double booking), DP/Pembayaran instan QRIS, WhatsApp reminder.
   - Tone & Warna: Energik, kontras tinggi, dinamis (Amber #f59e0b, Emerald #10b981, Blue #2563eb).
5. "Komunitas / Portal Berita / Media / Publikasi":
   - Ciri Wajib: Feed artikel/berita, filter kategori, bookmark/baca nanti, optimasi SEO & sitemap, CMS editor guru/admin.
   - Tone & Warna: Tipografi editorial terbaca tinggi, high-contrast, minimalis.
6. "Marketplace / On-Demand Service":
   - Ciri Wajib: Dua sisi pengguna (Penyedia vs Pembeli), sistem rating/review, tracking pesanan, escrow/dompet saldo.

Isi properti 'archetype_detection' secara lengkap sesuai analisis di atas!

══════════════════════════════════════════════════════════════════════════════
2. DEEP FEATURE ARCHITECTURE (WAJIB DIISI DI 'feature_breakdown')
══════════════════════════════════════════════════════════════════════════════
Susun 5 hingga 8 FITUR INTI MVP pada array 'feature_breakdown'. Setiap fitur WAJIB memuat:
- 'id': ID unik (misal: 'feat_ppdb_online', 'feat_wa_checkout', 'feat_booking_lock')
- 'name': Nama fitur teknis yang jelas dan profesional
- 'priority': 'P0' (Must Have / Core MVP) atau 'P1' (Should Have)
- 'user_story': "Sebagai [persona], saya ingin [aksi teknis] agar [nilai/manfaat konkret]."
- 'happy_path': Array 4-6 langkah berurutan dari klik tombol di UI -> pemrosesan API/Backend -> feedback visual ke user.
- 'business_rules': Array 3-5 aturan validasi, izin akses, batasan waktu, atau batasan kuota konkret.
- 'edge_cases': Array 2-4 kondisi gagal/error dan solusi penanganannya (misal: jaringan putus, kuota habis, bayar tidak pas).
- 'tech_mapping': Objek { frontend_components: [...], api_endpoints: [...], db_tables: [...] } yang spesifik menyebut nama file, rute endpoint, dan tabel yang disentuh.
- 'agent_prompt': Prompt perintah kodingan lengkap, padat, dan presisi yang bisa langsung dicopy-paste ke Cursor / Claude Code untuk meng-generate fitur tersebut.

══════════════════════════════════════════════════════════════════════════════
📋 3. STRUKTUR 7 KATEGORI PRD & MERMAID ARCHITECTURE
══════════════════════════════════════════════════════════════════════════════
Tetap lengkapi 7 Kategori berikut secara mendalam:
1. OPPORTUNITY FRAMING (Core Problem, Working Hypothesis, Strategy Fit)
2. BOUNDARIES (Scope: ringkasan fitur; Non-Goals: minimal 3-5 batasan yang sengaja ditunda agar fokus MVP)
3. SUCCESS MEASUREMENT (Offline Golden Set, Human Review, Online Metrics dengan angka KPI target)
4. ROLLOUT PLAN (Exposure, Duration, Segments & Ramp Gates)
5. RISK MANAGEMENT (Detection, Fallback & Kill Switch)
6. OWNERSHIP & ACTION (Primary Owner, Decision Points)
7. AI-SPECIFIC ADDITIONS (Behavior Contract: GOOD minimal 3 poin, REJECT minimal 3 poin; Guardrails)
8. ACTIONABLE TASK BREAKDOWN (7-12 task atomic bertahap untuk AI coding agent)
9. ARCHITECTURE DIAGRAMS (Mermaid.js murni tanpa backticks):
   - 'system_flowchart': flowchart TD (alur dari user, frontend, backend, DB, service eksternal)
   - 'user_journey_flow': flowchart LR atau stateDiagram-v2
   - 'database_erd': erDiagram (relasi entitas tabel yang realistis untuk produk ini)
   - 'api_integration_matrix': flowchart TD atau classDiagram (endpoint HTTP & integrasi)
   - 'sequence_diagram': sequenceDiagram autonumber (transaksi inti)
10. ROADMAP TREE (Visual Node Feature Tree berfase: FASE 1, FASE 2, FASE 3, FASE 4):
   - Susun 5-8 node modul terencana.
   - Setiap node memiliki:
     - 'id': string unik (contoh: 'node_katalog', 'node_booking', 'node_admin')
     - 'title': Nama modul ringkas (contoh: 'Katalog Alat Camping', 'Jadwal & Tanggal', 'Dashboard Admin')
     - 'phase': 'FASE 1' | 'FASE 2' | 'FASE 3' | 'FASE 4'
     - 'status': 'Direncanakan'
     - 'sub_features': Array 3-5 sub-fitur spesifik (contoh: ['Daftar Alat Tersedia', 'Detail & Spesifikasi', 'Status Stok Realtime'])

ATURAN OUTPUT:
- 100% Valid JSON murni tanpa markdown wrapper (\`\`\`json).
- Gunakan Bahasa Indonesia profesional dan istilah engineering modern.`;

export function buildPRDUserPrompt(
  formData: PRDFormData,
  techStack?: {
    name?: string;
    frontend?: string;
    backend?: string;
    database?: string;
    deployment?: string;
    templateId?: string;
  },
  language: 'id' | 'en' = 'id'
): string {
  let templateDirectives = '';
  if (techStack) {
    if (techStack.templateId === 'mobile-app') {
      templateDirectives = `
PANDUAN ARSITEKTUR WAJIB (CROSS-PLATFORM MOBILE APP - EXPO ROUTER V3):
- Frontend: ${techStack.frontend || 'React Native (Expo Router v3) + NativeWind'}
- Backend: ${techStack.backend || 'Supabase Backend & Edge Functions'}
- Database: ${techStack.database || 'Supabase (PostgreSQL) + MMKV Offline Cache'}
- Deployment: ${techStack.deployment || 'EAS Build (Android APK & iOS IPA)'}
- ATURAN: Fokuskan spesifikasi pada aplikasi smartphone: navigasi file-based Expo Router (app/(tabs)), alur izin perangkat (Kamera, Lokasi GPS, Push Notification), penanganan offline-storage saat tanpa sinyal, dan proses rilis EAS Build. JANGAN menghasilkan konsep SSR web atau meta tags HTML.`;
    } else if (techStack.templateId === 'ai-service') {
      templateDirectives = `
PANDUAN ARSITEKTUR WAJIB (PRODUCTION AI AGENT & VECTOR SERVICE):
- Frontend: ${techStack.frontend || 'Next.js 16 (Modern Dashboard)'}
- Backend: ${techStack.backend || 'FastAPI (Python 3.12)'}
- Database: ${techStack.database || 'PostgreSQL + pgvector (Vector DB)'}
- Deployment: ${techStack.deployment || 'Docker Multi-Container Compose'}
- ATURAN: Fokuskan arsitektur pada pemisahan modul FastAPI (/app/api, /app/core, /app/models, /app/schemas dengan Pydantic v2), skema indeks pgvector (HNSW), background task worker (Redis/Celery) untuk async LLM execution, dan streaming response ke frontend.`;
    } else if (techStack.templateId === 'custom') {
      templateDirectives = `
PANDUAN ARSITEKTUR KUSTOM (USER-DEFINED STACK):
- Frontend: ${techStack.frontend || 'Custom Frontend'}
- Backend: ${techStack.backend || 'Custom Backend'}
- Database: ${techStack.database || 'Custom Database'}
- Deployment: ${techStack.deployment || 'Custom Deployment'}
- ATURAN: Susun arsitektur, konvensi koding, struktur folder, skema data, dan instruksi Cursor agent yang 100% SPESIFIK dan AKURAT untuk kombinasi teknologi kustom di atas (misal jika Laravel gunakan struktur Controller & Eloquent, jika Golang gunakan Clean Architecture struct & goroutines, jika Vue/Nuxt gunakan Pages & Composables, jika MongoDB gunakan Document schemas).`;
    } else {
      templateDirectives = `
PANDUAN ARSITEKTUR WAJIB (MODERN FULLSTACK WEB - DOCKERIZED):
- Frontend: ${techStack.frontend || 'Next.js 16 + Tailwind CSS'}
- Backend: ${techStack.backend || 'Next.js Server Actions / Route Handlers'}
- Database: ${techStack.database || 'Supabase (PostgreSQL)'}
- Deployment: ${techStack.deployment || 'Docker (VPS / Coolify)'}
- ATURAN: Terapkan konvensi Next.js 16 App Router (Server Components default, Server Actions dengan Zod validation), Supabase PostgreSQL dengan Row-Level Security (RLS), dan deployment Docker container multi-stage (bebas vendor lock-in).`;
    }
  }

  const langInstruction =
    language === 'en'
      ? 'LANGUAGE DIRECTIVE: Output ALL PRD sections, headings, user stories, technical mappings, and instructions in clear, professional ENGLISH.'
      : 'LANGUAGE DIRECTIVE: Gunakan Bahasa Indonesia profesional dengan istilah engineering modern yang lazim digunakan developer.';

  return `Berikut rincian spesifikasi inisiatif produk dari user:
${JSON.stringify(formData, null, 2)}
${templateDirectives}

${langInstruction}

Susun PRD lengkap, mendalam, dan terperinci sesuai skema yang diminta:
1. Analisis dan isi 'archetype_detection' (apakah sekolah, katalog UMKM, SaaS, rental, dll beserta warna & target audiens).
2. Bedah 5-8 fitur MVP inti ke dalam 'feature_breakdown' secara mendalam (Happy Path, Business Rules, Edge Cases, Tech Mapping, dan Agent Prompt untuk Cursor).
3. Susun 'roadmap_tree' berfase dinamis sesuai kompleksitas produk (misal: 2-3 fase untuk perkakas simpel/landing page, 4 fase untuk SaaS/MVP standar, atau 5-6 fase untuk platform enterprise kompleks) dengan rincian sub_features yang atomic untuk visual tree node roadmap.
4. Buat 5 diagram arsitektur Mermaid.js yang valid dan siap render.
Jangan buat jawaban ringkas generik. Berikan elaborasi teknis yang matang untuk setiap kategori!`;
}

export function buildClarificationPrompt(
  userIdea: string,
  templateId?: string,
  language: 'id' | 'en' = 'id'
): string {
  let contextNote = '';
  if (templateId === 'mobile-app') {
    contextNote = '\nKONTEKS ARSITEKTUR TERPILIH: Aplikasi Mobile Smartphone (React Native / Expo Router v3). Pertanyaan teknis dapat mengarah ke alur notifikasi push, caching offline, atau sensor HP jika relevan.';
  } else if (templateId === 'ai-service') {
    contextNote = '\nKONTEKS ARSITEKTUR TERPILIH: Production AI Agent & Vector Service (FastAPI + pgvector). Pertanyaan teknis dapat mengarah ke sumber dokumen/pengetahuan, mode response (streaming/batch), atau integrasi model LLM.';
  } else if (templateId === 'custom') {
    contextNote = '\nKONTEKS ARSITEKTUR TERPILIH: Arsitektur Kustom Pengguna. Sesuaikan pertanyaan arsitektural dengan integrasi dan flow data yang cocok untuk kombinasi stack pilihan pengguna.';
  }

  const langDirective =
    language === 'en'
      ? '\nLANGUAGE DIRECTIVE: Output all questions, options labels, and descriptions strictly in natural, professional ENGLISH.'
      : '\nLANGUAGE DIRECTIVE: Gunakan Bahasa Indonesia profesional dan istilah bisnis/teknis yang lazim.';

  return `Kamu adalah Principal Product Architect & Lead Discovery Engineer kelas dunia.
Tugasmu adalah membedah ide inisiatif produk berikut dan merumuskan antara 4 HINGGA MAKSIMAL 10 PERTANYAAN PENEMUAN (Product Discovery) yang SANGAT TAJAM, SPESIFIK INDUSTRI, dan KRUSIAL secara arsitektur bisnis & teknis:

IDE PRODUK USER:
"${userIdea}"${contextNote}
${langDirective}

PEDOMAN JUMLAH PERTANYAAN (DINAMIS 4 - 10 PERTANYAAN SESUAI KOMPLEKSITAS):
- Jika ide produk simpel (misal landing page, bio link, kalkulator mini): buat 4-5 pertanyaan.
- Jika ide produk menengah (misal toko online UMKM, barbershop booking, blog/portal berita): buat 5-7 pertanyaan.
- Jika ide produk kompleks (misal marketplace, rental multi-cabang, SaaS B2B, ERP sekolah/pesantren, sistem logistik/klinik): buat 7-10 pertanyaan mendalam agar seluruh pilar operasional terbedah tuntas.

ATURAN UTAMA & LARANGAN KERAS (ANTI-TEMPLATE GUARDRAILS):
1. DILARANG KERAS menanyakan hal klise/generik yang tidak bernilai teknis, seperti:
   - ❌ "Apakah aplikasi berbasis Web atau Mobile?"
   - ❌ "Siapa target audiens Anda?" / "Ceritakan seseorang yang butuh..."
   - ❌ "Mengapa Anda ingin membuat aplikasi ini?"
   - ❌ "Fitur apa saja yang wajib ada di MVP?" dengan opsi umum membosankan seperti Login, Register, Profil, Lupa Password.
2. WAJIB LANGSUNG MASUK KE JANTUNG OPERASIONAL & ATURAN BISNIS PRODUK:
   - Setiap pertanyaan WAJIB menyebut kata benda atau proses khas dari ide produk tersebut (misal jika rental alat outdoor: sebut alat sewa, jaminan KTP, denda telat; jika sekolah: sebut PPDB, wali murid, verifikasi berkas; jika kasir/POS: sebut shift kasir, metode bayar QRIS, cetak struk; jika kursus: sebut materi video, kuis kelulusan, sertifikat).

ATURAN MULTI-SELECT FLEKSIBEL (isMultiSelect):
- Set 'isMultiSelect: true' kapan pun sebuah pertanyaan di dunia nyata wajar/butuh memilih LEBIH DARI SATU opsi.
  Contoh pertanyaan yang WAJIB isMultiSelect: true:
  * Integrasi pihak ketiga & eksternal (misal: WhatsApp Gateway + QRIS Dinamis + Cetak Struk).
  * Struktur peran pengguna / aktor sistem (misal: Owner + Kasir Lapangan + Pelanggan).
  * Modul fitur prioritas MVP (misal: pilih beberapa modul operasional wajib).
  * Saluran notifikasi / kanal pembayaran / metode operasional.
- Set 'isMultiSelect: false' HANYA jika pertanyaan tersebut merupakan pilihan eksklusif (misal: alur transaksi dasar apakah bayar lunas di muka vs DP 50%, atau skema perhitungan tarif sewa).

PILAR-PILAR ARSITEKTUR YANG DAPAT DIBEDAH:
1. Mekanisme Transaksi & Alur Inti ('core_flow')
2. Edge Case & Mitigasi Risiko Operasional ('risk_management')
3. Integrasi Eksternal & Otomasi Pihak Ketiga ('integrations') - biasanya isMultiSelect: true
4. Struktur Peran Pengguna & Batas Akses ('user_roles') - biasanya isMultiSelect: true jika ada banyak aktor
5. Skema Monetisasi / Pembayaran / Penagihan ('monetization')
6. Alur Notifikasi & Saluran Komunikasi ('notifications') - bisa isMultiSelect: true
7. Manajemen Data & Status Inventaris/Pesanan ('data_management')
8. Modul Fitur MVP Paling Penentu ('feature_priority') - isMultiSelect: true

Untuk SETIAP pertanyaan:
- id: Berikan ID semantik unik (misal: "q_alur_transaksi", "q_mitigasi_konflik", "q_integrasi_kunci", "q_struktur_aktor", "q_modul_mvp").
- category: Sesuai kategori pilar di atas.
- question: Pertanyaan to-the-point, jelas, dan menggunakan istilah bisnis nyata yang elegan.
- options: Array 3-5 objek { id: string, label: string, description?: string }.
  * label: Ringkas (2-5 kata), sangat cocok untuk badge chips.
  * description: 1 kalimat penjelasan teknis/operasional mengapa opsi ini dipilih.
- recommendedOptionId: Tentukan 1 ID opsi terbaik yang merupakan standar industri / best practice (akan otomatis terpilih awal sebagai default rekomendasi).
- isMultiSelect: boolean (sesuai aturan fleksibel di atas).
- inputType: "chips".

Kembalikan format JSON murni yang valid tanpa teks tambahan.`;
}

export const SECTION_METADATA: Record<
  SectionKey,
  {
    title: string;
    description: string;
    fields: string[];
    tips: string;
  }
> = {
  opportunity_framing: {
    title: "Opportunity Framing",
    description: "Definisikan masalah riil, hipotesis solusi, dan keselarasan strategis.",
    fields: ["core_problem", "working_hypothesis", "strategy_fit"],
    tips: "Jelaskan rasa sakit user yang nyata dan bukti kerugian jika masalah tidak diselesaikan.",
  },
  boundaries: {
    title: "Boundaries (Scope & Non-Goals)",
    description: "Tentukan batasan apa yang dikerjakan vs apa yang sengaja ditunda.",
    fields: ["scope", "non_goals"],
    tips: "Non-goals adalah tameng utama agar coding agent tidak merombak kode yang tidak relevan.",
  },
  success_measurement: {
    title: "Success Measurement",
    description: "Tolak ukur keberhasilan offline, kualitatif manusia, dan KPI online.",
    fields: ["offline_golden_set", "human_review", "online_metrics"],
    tips: "Pastikan ada angka threshold konkret (misal: false-positive < 3%, latency < 1.5s).",
  },
  rollout_plan: {
    title: "Rollout Plan",
    description: "Rencana peluncuran bertahap (% user, durasi, gate kelayakan).",
    fields: ["exposure", "duration", "segments_gates"],
    tips: "Rencanakan canary rollout sebelum rilis penuh ke publik.",
  },
  risk_management: {
    title: "Risk Management",
    description: "Deteksi anomali dini dan kill-switch / mekanisme fallback aman.",
    fields: ["detection", "fallback_kill_switch"],
    tips: "Pastikan ada tombol darurat (kill-switch) untuk mematikan fitur tanpa redeploy.",
  },
  ownership_action: {
    title: "Ownership & Action",
    description: "Penanggung jawab utama (PIC) dan jadwal evaluasi keputusan.",
    fields: ["primary_owner", "decision_points"],
    tips: "Tentukan tanggal evaluasi go/no-go secara tegas.",
  },
  ai_specific: {
    title: "AI-Specific Additions",
    description: "Behavior Contract (GOOD vs REJECT) dan Guardrails keamanan/etika.",
    fields: ["behavior_contract", "guardrails"],
    tips: "GOOD dan REJECT harus spesifik membentengi kode dari halusinasi AI.",
  },
};

export function buildSectionAssistantPrompt(
  sectionKey: SectionKey,
  currentValues: Record<string, string>,
  userMessage?: string
): string {
  const meta = SECTION_METADATA[sectionKey];
  return `Kamu adalah Principal Product Architect & AI Engineering Consultant.
Bantu user menyempurnakan bagian "${meta.title}" pada PRD produk mereka secara mendalam dan spesifik.

Konteks Seksi:
- Judul: ${meta.title}
- Tujuan: ${meta.description}
- Rekomendasi Arsitek: ${meta.tips}

Data yang ada saat ini:
${JSON.stringify(currentValues, null, 2)}

${userMessage ? `Permintaan spesifik: "${userMessage}"` : "User meminta rekomendasi teknis terbaik yang mendalam dan siap pakai."}

Instruksi:
1. Berikan rekomendasi konkret, detail, dan profesional dalam Bahasa Indonesia.
2. Hindari kalimat klise atau terlalu singkat. Berikan solusi berstandar industri.
3. Untuk AI-Specific, wajib berikan minimal 3 GOOD dan 3 REJECT yang aplikatif.`;
}
