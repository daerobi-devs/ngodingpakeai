import { PRDFormData, TechStackInfo } from "@/types/prd";
import { Stage1Output, Stage2Output } from "@/types/pipeline";

// ══════════════════════════════════════════════════════════════════════════════
// TAHAP 1 PROMPT: PRODUCT BRIEF & KEY DECISIONS (SSOT)
// ══════════════════════════════════════════════════════════════════════════════

export const STAGE_1_SYSTEM_PROMPT = `Kamu adalah Principal Product Architect & Lead AI Systems Engineer.
Tugasmu adalah menganalisis ide produk dari user dan mengekstrak PRODUCT BRIEF terstruktur serta KEY DECISIONS (Single Source of Truth / SSOT).

ATURAN WAJIB TAHAP 1:
1. DOMAIN GLOSSARY & BANNED TERMS:
   - Tentukan daftar istilah domain resmi (domain_glossary) yang relevan dengan produk ini.
   - Tentukan daftar ISTILAH TERLARANG (banned_terms), yaitu istilah dari domain lain yang sama sekali TIDAK BOLEH muncul pada PRD ini.
     * Contoh: Jika produk adalah aplikasi kuliah / audio transkrip mahasiswa, banned_terms WAJIB mencakup: ["toko", "barang", "gudang", "stok", "kasir", "fefo", "warung", "retur", "barista", "katalog barang"].
     * Contoh: Jika produk adalah klinik / rekam medis, banned_terms mencakup: ["keranjang", "checkout", "diskon belanja", "meja restoran"].
2. PERSONA PENGGUNA RIIL:
   - Identifikasi siapa pengguna utama (primary_user) dan pengguna sekunder (secondary_user) secara spesifik (misal: "Mahasiswa aktif perguruan tinggi", bukan "Pengguna umum").
3. SINGLE SOURCE OF TRUTH (KEY DECISIONS):
   - Kunci satu paket keputusan teknologi (tech_stack), jenis autentikasi (auth_system), penyimpanan (storage_system), library ekspor, dan strategi penomoran fase ("Fase 1 (MVP)" vs "Fase 2 (Pasca-MVP)").
   - Semua tahapan PRD berikutnya WAJIB tunduk pada keputusan ini.
4. ZERO EMOJI & ZERO AI SLOP:
   - Dilarang menyisipkan emoji apa pun.
   - Output WAJIB 100% Valid JSON murni sesuai schema yang diminta.`;

export function buildStage1UserPrompt(
  formData: PRDFormData,
  techStack?: TechStackInfo,
  selectedModules?: any[],
  language: 'id' | 'en' = 'id'
): string {
  const anyForm = formData as any;
  const appTitle = formData.title || anyForm.appName || anyForm.name || anyForm.app_title || anyForm.idea || 'Inisiatif Aplikasi Baru';
  const coreProblem = formData.opportunity_framing?.core_problem || anyForm.coreProblem || anyForm.problem || anyForm.core_problem || '';
  const solutionIdea = formData.opportunity_framing?.working_hypothesis || anyForm.description || anyForm.workingHypothesis || anyForm.solution || anyForm.idea || '';
  const keyFlow = anyForm.keyFlow || anyForm.core_user_flow || anyForm.flow || '';
  const targetPersona = anyForm.targetAudience || anyForm.target_persona || anyForm.targetUser || '';
  const scope = formData.boundaries?.scope || anyForm.scope || '';
  const nonGoals = formData.boundaries?.non_goals || anyForm.non_goals || anyForm.nonGoals || '';

  const chosenStackText = techStack
    ? `Pilihan Tech Stack User:
- Frontend: ${techStack.frontend || 'Next.js 16 + Tailwind CSS'}
- Backend: ${techStack.backend || 'Next.js Server Actions & Route Handlers'}
- Database: ${techStack.database || 'Supabase (PostgreSQL)'}
- Deployment: ${techStack.deployment || 'Docker / VPS'}`
    : 'Tech Stack Default: Next.js 16 (App Router), Tailwind CSS, Supabase (PostgreSQL), Docker.';

  const modulesText = selectedModules && selectedModules.length > 0
    ? `Modul yang dipilih user:\n${JSON.stringify(selectedModules, null, 2)}`
    : '';

  return `Analisis ide produk berikut dan buat Product Brief serta Key Decisions terstruktur:
Judul / Nama Aplikasi: ${appTitle}
Target Persona Pengguna: ${targetPersona || 'Analisis dari deskripsi masalah dan alur di bawah'}
Masalah Inti yang Dihadapi: ${coreProblem || 'Analisis dari deskripsi ide di bawah'}
Solusi & Deskripsi Ide: ${solutionIdea || '-'}
Alur Inti Interaksi Pengguna (User Flow): ${keyFlow || '-'}
Scope Usulan: ${scope || '-'}
Non-Goals Usulan: ${nonGoals || '-'}

Data Mentah Input Form User:
${JSON.stringify(formData, null, 2)}

${chosenStackText}
${modulesText}

Bahasa Output: ${language === 'en' ? 'English' : 'Bahasa Indonesia profesional'}.
Hasilkan JSON murni sesuai response schema.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// TAHAP 2 PROMPT: REQUIREMENTS, OVERVIEW & CORE FEATURES
// ══════════════════════════════════════════════════════════════════════════════

export const STAGE_2_SYSTEM_PROMPT = `Kamu adalah Principal Product Architect & Lead AI Systems Engineer.
Tugasmu adalah menyusun bagian Overview, Requirements (Fungsional, Non-Fungsional, Asumsi/Batasan, Risiko), dan Core Features (P0 MVP & P1).

ATURAN WAJIB TAHAP 2:
1. PATUHI PRODUCT BRIEF & GLOSARIUM:
   - Gunakan HANYA istilah yang sah dari domain_glossary Product Brief.
   - DILARANG KERAS menggunakan istilah apa pun dari daftar banned_terms!
2. FORMAT FITUR: USER-ACTION-OUTCOME (NO FILLER WORDS / NO AI SLOP):
   - Setiap fitur WAJIB memiliki user_story konkret: "Sebagai [persona], saya ingin [aksi teknis antarmuka interaktif dengan validasi] agar [dampak konkret]."
   - DILARANG menggunakan kalimat pengisi generik seperti "mendukung proses operasional secara cepat dan sistematis".
   - Happy Path WAJIB 5-7 langkah kronologis presisi dari klik UI -> validasi state -> API call -> mutasi atomik DB -> visual feedback.
   - Business Rules WAJIB 4-6 aturan validasi ketat dengan angka/kuota nyata.
   - Edge Cases WAJIB 3-5 penanganan kegagalan spesifik domain ini (koneksi terputus, browser backgrounding, kuota habis, dsb).
3. ASUMSI & BATASAN TEGAS DUA SUB-BAGIAN:
   - in_scope_assumptions: Apa saja yang secara eksplisit TERMASUK dalam versi MVP.
   - out_of_scope_constraints: Apa saja yang secara eksplisit DITUNDA / DI LUAR CAKUPAN rilis awal beserta alasan teknisnya.
4. RISIKO & BATASAN WAJIB:
   - Harus mencakup: biaya & kuota API (api_costs_and_quotas), privasi & keamanan data pengguna (data_privacy_and_security), kebijakan retensi data (data_retention_policy), dan mitigasi kegagalan layanan pihak ketiga (third_party_failure_mitigation).
5. KPI & METRIK SUKSES:
   - product_kpis: Metrik adopsi, aktivasi, dan penyelesaian tugas pengguna.
   - technical_slos: Metrik rekayasa nyata (latensi p95, error rate, offline sync success rate, dsb).
6. ZERO EMOJI POLICY: Dilarang keras menggunakan emoji di seluruh teks.`;

export function buildStage2UserPrompt(
  stage1: Stage1Output,
  formData: PRDFormData,
  language: 'id' | 'en' = 'id'
): string {
  const brief = stage1.product_brief;
  const decisions = stage1.key_decisions;

  return `Berdasarkan Product Brief dan Key Decisions yang telah dikunci berikut:

PRODUCT BRIEF:
- Judul: ${brief.app_title}
- Domain: ${brief.domain}
- Masalah Inti: ${brief.core_problem}
- Persona Utama: ${brief.target_persona.primary_user}
- Alur Inti: ${brief.core_user_flow_summary}
- Glosarium Domain: ${brief.domain_glossary.map((g) => `${g.term} (${g.definition})`).join(', ')}
- BANNED TERMS (DILARANG MUNCUL): ${brief.banned_terms.join(', ')}
- Cakupan MVP: ${brief.mvp_scope.join('; ')}
- Out-of-Scope: ${brief.out_of_scope.join('; ')}

KEY DECISIONS:
- Tech Stack: Frontend=${decisions.tech_stack.frontend}, Backend=${decisions.tech_stack.backend}, DB=${decisions.tech_stack.database}
- Auth: ${decisions.auth_system.provider} (${decisions.auth_system.session_strategy})
- Storage: ${decisions.storage_system.provider} (Retensi: ${decisions.storage_system.retention_policy})
- Penomoran Fase: ${decisions.phase_strategy.mvp_phase_name} dan ${decisions.phase_strategy.next_phase_name}

TUGAS TAHAP 2:
Susun dokumen mendalam untuk:
1. Opportunity Framing (core_problem 2-3 paragraf mendalam, working_hypothesis, strategy_fit)
2. Success Measurement (product_kpis, technical_slos, offline_golden_set, human_review, online_metrics)
3. Boundaries (scope 8-12 item [REQ-01..], non_goals 4-6 item)
4. Assumptions & Constraints (in_scope_assumptions dan out_of_scope_constraints)
5. Risk Management (detection, fallback_kill_switch, api_costs_and_quotas, data_privacy_and_security, data_retention_policy, third_party_failure_mitigation)
6. Feature Breakdown (5-8 fitur lengkap sesuai 4-layer: Core Value, Operational, Trust/Risk, Automation/Retention) dengan format User-Action-Outcome presisi!

Bahasa: ${language === 'en' ? 'English' : 'Bahasa Indonesia'}. Hasilkan JSON murni sesuai schema.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// TAHAP 3 PROMPT: USER FLOW, ARCHITECTURE, DATABASE & TASKS
// ══════════════════════════════════════════════════════════════════════════════

export const STAGE_3_SYSTEM_PROMPT = `Kamu adalah Principal Software Architect & Database Engineer.
Tugasmu adalah merancang User Flow, Diagram Arsitektur Mermaid, Skema Database Relasional Lengkap, Skrip Migrasi SQL DDL PostgreSQL/Supabase, dan Task Breakdown.

ATURAN WAJIB TAHAP 3:
1. SKEMA DATABASE DITURUNKAN 100% DARI FITUR TAHAP 2:
   - DILARANG KERAS menggunakan tabel generik toko/barang/orders jika produknya bukan e-commerce!
   - Setiap alur fitur pada Feature Breakdown Tahap 2 WAJIB memiliki entitas tabel database penampung data yang sesuai domain.
   - SEMUA tabel wajib memiliki kolom:
     * id UUID PRIMARY KEY DEFAULT gen_random_uuid()
     * created_at TIMESTAMPTZ DEFAULT now() NOT NULL
     * updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
   - Tabel anak (child tables) WAJIB memiliki user_id UUID REFERENCES users(id) ON DELETE CASCADE untuk keperluan Row Level Security (RLS).
   - Setiap kolom status WAJIB memiliki CHECK constraint enum status yang lengkap (contoh: CHECK (status IN ('draft', 'recording', 'transcribing', 'completed', 'failed'))).
2. MERMAID ERD SYNTAX:
   - erDiagram Mermaid: Gunakan tipe data bersih tanpa tanda kurung: string, int, boolean, datetime, decimal, uuid. Dilarang varchar(255) atau decimal(10,2).
3. SKRIP MIGRASI SQL DDL:
   - SQL DDL PostgreSQL/Supabase lengkap untuk SEMUA tabel di database_erd.
   - Sertakan CREATE EXTENSION IF NOT EXISTS "uuid-ossp", CREATE TABLE, Foreign Keys ON DELETE CASCADE, Indexes (idx_...), dan ALTER TABLE ... ENABLE ROW LEVEL SECURITY; beserta RLS policies berbasis auth.uid() = user_id.
4. DIAGRAM MERMAID ARSITEKTUR (system_flowchart):
   - Wajib format flowchart TD berstandar Production-Ready / C4 Level 2.
   - DILARANG KERAS membuat diagram pasif/dangkal yang hanya menghubungkan nama teknologi (misal: "User --> Next.js --> Server Actions --> DB"). Diagram seperti itu TIDAK DITERIMA.
   - WAJIB memetakan ALIRAN TRANSAKSI KRITIS (Critical Path) produk dengan panah aksi bernomor urut jelas (minimal 6-9 langkah bernomor: |1. ...|, |2. ...|, |3. ...|).
   - Diagram WAJIB memetakan komponen lintas tingkatan (tiers):
     * Client / User Tier: Aksi pengguna, komponen frontend Next.js, penanganan buffer lokal/offline (misal MediaRecorder & IndexedDB untuk audio/pencatatan, atau form state).
     * Server / Ingestion Tier: Server Actions / Route Handlers, autentikasi sesi, validasi Zod, dan orkestrasi pemrosesan.
     * External AI & Services Tier (jika relevan): Panggilan API pihak ketiga (misal Google Gemini Multimodal Audio API untuk transkripsi, WhatsApp Gateway untuk notifikasi, atau Payment Gateway).
     * Persistence & Storage Tier: Basis data relasional Supabase PostgreSQL (tabel spesifik) dan Object Storage (bucket Supabase Storage).
   - Pastikan setiap label panah menyebutkan data yang dikirim dan hasil yang diterima.
   - user_journey_flow (flowchart LR): Alur navigasi langkah demi langkah dari pendaftaran akun hingga capaian nilai utama.
   - system_components: Array 4-6 komponen arsitektur nyata dengan role dan tech spesifik.
5. PENOMORAN FASE SINKRON:
   - Gunakan nama fase yang sama persis: "Fase 1 (MVP)" dan "Fase 2 (Pasca-MVP)" pada Roadmap Tree dan Task Breakdown.
   - Setiap butir pada task_breakdown WAJIB diawali dengan prefix fase dalam tanda kurung siku, contoh: "[Fase 1 (MVP)] Setup inisialisasi Next.js 16...".
6. ZERO EMOJI POLICY: Dilarang keras menggunakan emoji di diagram, judul, maupun teks.`;

export function buildStage3UserPrompt(
  stage1: Stage1Output,
  stage2: Stage2Output,
  language: 'id' | 'en' = 'id'
): string {
  const brief = stage1.product_brief;
  const decisions = stage1.key_decisions;
  const features = stage2.feature_breakdown;

  const featureSummaries = features.map((f) => ({
    name: f.name,
    priority: f.priority,
    user_story: f.user_story,
    db_tables: f.tech_mapping?.db_tables || [],
    api_endpoints: f.tech_mapping?.api_endpoints || [],
  }));

  return `Berdasarkan Product Brief, Key Decisions, dan Feature Breakdown berikut:

PRODUCT BRIEF:
- Judul: ${brief.app_title}
- Domain: ${brief.domain}
- Persona: ${brief.target_persona.primary_user}
- Glosarium: ${brief.domain_glossary.map((g) => g.term).join(', ')}
- BANNED TERMS: ${brief.banned_terms.join(', ')}

KEY DECISIONS:
- Frontend: ${decisions.tech_stack.frontend}
- Backend: ${decisions.tech_stack.backend}
- Database: ${decisions.tech_stack.database}
- Auth: ${decisions.auth_system.provider}
- Storage: ${decisions.storage_system.provider}
- Fase: ${decisions.phase_strategy.mvp_phase_name} dan ${decisions.phase_strategy.next_phase_name}

FITUR-FITUR TAHAP 2 YANG HARUS DIMODELKAN KE DATABASE & ARSITEKTUR:
${JSON.stringify(featureSummaries, null, 2)}

TUGAS TAHAP 3:
1. User Flow Steps (4-6 langkah naratif terurut mengikuti tahapan adopsi fitur di atas).
2. Database Schema (database_erd) memodelkan 6-8 tabel yang 100% mewadahi fitur di atas.
3. Skrip Migrasi SQL DDL PostgreSQL/Supabase (sql_migration_script) lengkap untuk seluruh tabel dengan UUID, Foreign Keys, Indexes, dan RLS Policies.
4. Architecture Diagrams: system_flowchart (WAJIB flowchart TD multi-tier dengan 6-9 panah bernomor urut alur transaksi kritis |1. ...| s/d |N. ...|, DILARANG diagram kotak pasif generik), user_journey_flow, system_components, api_integration_matrix, sequence_diagram, infrastructure_topology, rbac_permission_matrix, data_pipeline_flow.
5. Roadmap Tree (5-8 modul berfase sinkron).
6. Task Breakdown (10-14 task atomic bertahap).

Bahasa: ${language === 'en' ? 'English' : 'Bahasa Indonesia'}. Hasilkan JSON murni sesuai schema.`;
}
