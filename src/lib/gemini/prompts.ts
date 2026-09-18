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

export function buildPRDUserPrompt(formData: PRDFormData): string {
  return `Berikut rincian spesifikasi inisiatif produk dari user:
${JSON.stringify(formData, null, 2)}

Susun PRD lengkap, mendalam, dan terperinci sesuai skema yang diminta:
1. Analisis dan isi 'archetype_detection' (apakah sekolah, katalog UMKM, SaaS, rental, dll beserta warna & target audiens).
2. Bedah 5-8 fitur MVP inti ke dalam 'feature_breakdown' secara mendalam (Happy Path, Business Rules, Edge Cases, Tech Mapping, dan Agent Prompt untuk Cursor).
3. Susun 'roadmap_tree' berfase 1 s/d 4 (FASE 1 s/d FASE 4) dengan rincian sub_features yang atomic untuk visual tree node roadmap.
4. Buat 5 diagram arsitektur Mermaid.js yang valid dan siap render.
Jangan buat jawaban ringkas generik. Berikan elaborasi teknis yang matang untuk setiap kategori!`;
}

export function buildClarificationPrompt(userIdea: string): string {
  return `Kamu adalah Senior Product Architect & Lead Discovery Engineer. User ingin membuat aplikasi/produk dengan ide:
"${userIdea}"

Tugasmu:
Buat 4-5 pertanyaan interaktif (Smart Discovery) yang SANGAT SPESIFIK dan KONTEKSTUAL untuk ide produk di atas, lengkap dengan opsi jawaban berbentuk badge chips yang realistis dan relevan:

1. Pertanyaan 1 (Target User & Masalah Nyata):
   - Kategori: "target_user"
   - Tanya siapa yang paling butuh aplikasi ini dan bagaimana cara manual mereka mengatasi masalah saat ini.
   - isMultiSelect: false
   - Berikan 4-5 pilihan chip jawaban spesifik bidang produk tersebut.

2. Pertanyaan 2 (First-Time User Core Action):
   - Kategori: "core_flow"
   - Tanya 1 hal utama yang wajib diselesaikan user saat pertama kali buka aplikasi sebelum menutupnya.
   - isMultiSelect: false
   - Berikan 4-5 pilihan chip jawaban konkret.

3. Pertanyaan 3 (Prioritas Fitur Wajib MVP):
   - Kategori: "feature_priority"
   - Tanya 3 fitur yang paling wajib ada di aplikasi ini untuk rilis awal.
   - isMultiSelect: true
   - Berikan 5-7 pilihan chip fitur yang sangat spesifik untuk ide produk tersebut (misal jika rental tenda: katalog alat, filter & cari, jadwal & tanggal, kirim order ke WA, dashboard admin).

4. Pertanyaan 4 (Diferensiasi & Keunggulan):
   - Kategori: "value_proposition"
   - Tanya apa keunggulan utama aplikasi ini dibanding cara/solusi yang ada sekarang.
   - isMultiSelect: false
   - Berikan 4-5 pilihan chip keunggulan konkret.

5. Pertanyaan 5 (Retensi & Alasan Balik Lagi):
   - Kategori: "retention_trigger"
   - Tanya apa yang membuat user akan kembali menggunakan aplikasi ini secara berulang.
   - isMultiSelect: false
   - Berikan 4-5 pilihan chip alasan retensi yang relevan.

Untuk SETIAP pertanyaan:
- Berikan 'id' unik (contoh: 'q_target_user', 'q_first_action', 'q_core_features', 'q_differentiator', 'q_retention').
- Berikan 'question' yang jelas, bersahabat, dan tidak teknikal berlebihan.
- Berikan 'options': array objek { id: string, label: string, description?: string } di mana 'label' ringkas (2-5 kata) untuk badge chip yang enak dibaca.
- Tentukan 'recommendedOptionId'.
- Format JSON murni valid sesuai schema.`;
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
