import { Stage1Output, Stage2Output, Stage3Output } from "@/types/pipeline";
import { PRDOutput } from "@/types/prd";
import { KeyPoolManager, GeminiSlotTarget, executeGeminiStageJson } from "@/lib/gemini/gemini-client";
import { z } from "zod";

export interface ValidationViolation {
  stage: 2 | 3;
  type:
    | 'domain_leakage'
    | 'generic_filler'
    | 'corrupted_text'
    | 'tech_inconsistency'
    | 'phase_inconsistency'
    | 'missing_db_table';
  severity: 'critical' | 'warning';
  message: string;
  culprit?: string;
  location?: string;
}

export interface CriticRubricScores {
  domain_specificity: number; // 1-5
  consistency: number;        // 1-5
  mvp_viability: number;      // 1-5
  schema_completeness: number;// 1-5
  risk_completeness: number;  // 1-5
  average_score: number;
  critic_feedback: string;
  verdict: 'PASS' | 'NEEDS_REVISION';
}

export interface ValidationReport {
  passed: boolean;
  score: number; // 0 - 100
  violations: ValidationViolation[];
  criticScores?: CriticRubricScores;
  retriesPerformed: number;
  logSummary: string[];
}

// Banned generic filler phrases (AI Slop)
const BANNED_FILLER_PATTERNS = [
  /mendukung proses operasional/i,
  /secara cepat dan sistematis/i,
  /efisien dan efektif/i,
  /berkualitas tinggi dan handal/i,
  /mudah dan nyaman/i,
  /solusi terbaik untuk/i,
  /mempermudah pengguna dalam/i,
  /secara optimal dan terintegrasi/i,
  /dalam era digital saat ini/i,
];

// Placeholder and corrupted text patterns
const CORRUPTED_TEXT_PATTERNS = [
  /\[TODO\]/i,
  /\[INSERT/i,
  /lorem ipsum/i,
  /\bundefined\b/i,
  /\bnull\b/i,
  /\bNaN\b/,
  /\b([a-zA-Z]{3,})\s+\1\b/i, // duplicate consecutive words e.g. "sistem sistem"
];

/**
 * Validasi Deterministik Cepat untuk Tahap 2 (Requirements & Core Features)
 */
export function validateStage2Output(
  stage1: Stage1Output,
  stage2: Stage2Output
): ValidationViolation[] {
  const violations: ValidationViolation[] = [];
  const bannedTerms = stage1.product_brief.banned_terms || [];
  const stage2Json = JSON.stringify(stage2);

  // 1. Kebocoran Domain (Banned Terms)
  for (const term of bannedTerms) {
    if (!term || term.trim().length < 3) continue;
    const regex = new RegExp(`\\b${term.trim()}\\b`, 'gi');
    if (regex.test(stage2Json)) {
      violations.push({
        stage: 2,
        type: 'domain_leakage',
        severity: 'critical',
        message: `Istilah terlarang "${term}" bocor ke dalam Requirements / Fitur Tahap 2.`,
        culprit: term,
      });
    }
  }

  // 2. Kalimat Generik / Filler Clichés
  stage2.feature_breakdown.forEach((feat, idx) => {
    const featStr = `${feat.name} ${feat.user_story} ${(feat.happy_path || []).join(' ')} ${(feat.business_rules || []).join(' ')}`;
    for (const pattern of BANNED_FILLER_PATTERNS) {
      if (pattern.test(featStr)) {
        violations.push({
          stage: 2,
          type: 'generic_filler',
          severity: 'critical',
          message: `Fitur #${idx + 1} (${feat.name}) mengandung frasa pengisi generik (AI slop): "${pattern.source}".`,
          culprit: feat.name,
          location: `feature_breakdown[${idx}]`,
        });
      }
    }

    // 3. Validasi Format User Story (User-Action-Outcome)
    if (feat.user_story) {
      const lowerStory = feat.user_story.toLowerCase();
      const hasSebagai = lowerStory.includes('sebagai') || lowerStory.includes('as a');
      const hasSayaIngin = lowerStory.includes('saya ingin') || lowerStory.includes('i want');
      const hasAgar = lowerStory.includes('agar') || lowerStory.includes('sehingga') || lowerStory.includes('so that');
      if (!hasSebagai || !hasSayaIngin || !hasAgar) {
        violations.push({
          stage: 2,
          type: 'generic_filler',
          severity: 'warning',
          message: `User Story pada fitur "${feat.name}" tidak mematuhi struktur standar "Sebagai [persona], saya ingin [aksi] agar [dampak]".`,
          culprit: feat.user_story,
          location: `feature_breakdown[${idx}].user_story`,
        });
      }
    }

    // 4. Deteksi Teks Rusak / Placeholders
    for (const corruptPattern of CORRUPTED_TEXT_PATTERNS) {
      if (corruptPattern.test(featStr)) {
        violations.push({
          stage: 2,
          type: 'corrupted_text',
          severity: 'critical',
          message: `Fitur #${idx + 1} (${feat.name}) mengandung teks rusak atau placeholder (${corruptPattern.source}).`,
          culprit: feat.name,
          location: `feature_breakdown[${idx}]`,
        });
      }
    }
  });

  // 5. Validasi Asumsi In-Scope vs Out-of-Scope
  if (!stage2.assumptions_and_constraints?.in_scope_assumptions || stage2.assumptions_and_constraints.in_scope_assumptions.length === 0) {
    violations.push({
      stage: 2,
      type: 'generic_filler',
      severity: 'critical',
      message: 'Sub-bagian Asumsi [Termasuk dalam MVP] kosong atau tidak lengkap.',
      location: 'assumptions_and_constraints.in_scope_assumptions',
    });
  }
  if (!stage2.assumptions_and_constraints?.out_of_scope_constraints || stage2.assumptions_and_constraints.out_of_scope_constraints.length === 0) {
    violations.push({
      stage: 2,
      type: 'generic_filler',
      severity: 'critical',
      message: 'Sub-bagian Batasan [Di Luar Cakupan] kosong atau tidak lengkap.',
      location: 'assumptions_and_constraints.out_of_scope_constraints',
    });
  }

  return violations;
}

/**
 * Validasi Deterministik Cepat untuk Tahap 3 (User Flow, Architecture, Database, Tasks)
 */
export function validateStage3Output(
  stage1: Stage1Output,
  stage2: Stage2Output,
  stage3: Stage3Output
): ValidationViolation[] {
  const violations: ValidationViolation[] = [];
  const bannedTerms = stage1.product_brief.banned_terms || [];
  const mvpPhase = stage1.key_decisions.phase_strategy.mvp_phase_name;
  const stage3Json = JSON.stringify(stage3);

  // 1. Kebocoran Domain di Arsitektur / Database
  for (const term of bannedTerms) {
    if (!term || term.trim().length < 3) continue;
    const regex = new RegExp(`\\b${term.trim()}\\b`, 'gi');
    if (regex.test(stage3Json)) {
      violations.push({
        stage: 3,
        type: 'domain_leakage',
        severity: 'critical',
        message: `Istilah terlarang "${term}" muncul di dalam Arsitektur / Skema Database Tahap 3.`,
        culprit: term,
      });
    }
  }

  // 2. Kelengkapan Skema Database: Setiap Fitur P0 Harus Memiliki Tabel
  const erdText = (stage3.architecture_diagrams?.database_erd || '').toLowerCase();
  const sqlText = (stage3.architecture_diagrams?.sql_migration_script || '').toLowerCase();

  const p0Features = stage2.feature_breakdown.filter((f) => f.priority === 'P0');
  p0Features.forEach((feat) => {
    const declaredTables = feat.tech_mapping?.db_tables || [];
    if (declaredTables.length === 0) {
      violations.push({
        stage: 3,
        type: 'missing_db_table',
        severity: 'warning',
        message: `Fitur prioritas P0 "${feat.name}" tidak mencantumkan pemetaan tabel database (tech_mapping.db_tables).`,
        culprit: feat.name,
      });
    } else {
      const isMissingInErd = declaredTables.every(
        (tbl) => !erdText.includes(tbl.toLowerCase()) && !sqlText.includes(tbl.toLowerCase())
      );
      if (isMissingInErd) {
        violations.push({
          stage: 3,
          type: 'missing_db_table',
          severity: 'critical',
          message: `Tabel [${declaredTables.join(', ')}] dari fitur "${feat.name}" tidak ditemukan di dalam diagram database_erd maupun sql_migration_script.`,
          culprit: declaredTables.join(', '),
        });
      }
    }
  });

  // 3. Sinkronisasi Fase Task Breakdown
  stage3.task_breakdown.forEach((task, idx) => {
    if (!task.includes(mvpPhase) && !task.startsWith('[')) {
      violations.push({
        stage: 3,
        type: 'phase_inconsistency',
        severity: 'warning',
        message: `Task breakdown #${idx + 1} "${task.slice(0, 40)}..." tidak memiliki tag fase yang sinkron dengan ${mvpPhase}.`,
        location: `task_breakdown[${idx}]`,
      });
    }
  });

  // 4. Validasi Kualitas System Flowchart (Mencegah Diagram Dangkal Pasif)
  const flowchart = (stage3.architecture_diagrams?.system_flowchart || '').trim();
  if (flowchart) {
    const isTooShort = flowchart.length < 80;
    const arrowCount = (flowchart.match(/-->|---|\|/g) || []).length;
    const hasNumberedSteps = /\b[1-9]\.\s*/i.test(flowchart) || /\|\s*[1-9]\./i.test(flowchart);
    const isShallowGeneric = /User\s*-->\s*Next\.js/i.test(flowchart) && !hasNumberedSteps;

    if (isTooShort || arrowCount < 4 || !hasNumberedSteps || isShallowGeneric) {
      violations.push({
        stage: 3,
        type: 'generic_filler',
        severity: 'critical',
        message: 'Diagram system_flowchart terlalu dangkal atau tidak memiliki alur bernomor. WAJIB memetakan alur transaksi kritis produk dengan panah berlabel nomor urut aksi (|1. ...|, |2. ...|) dari perangkat klien, pemrosesan server, integrasi eksternal, hingga persistensi data.',
        location: 'architecture_diagrams.system_flowchart',
      });
    }
  } else {
    violations.push({
      stage: 3,
      type: 'generic_filler',
      severity: 'critical',
      message: 'Diagram system_flowchart tidak boleh kosong.',
      location: 'architecture_diagrams.system_flowchart',
    });
  }

  return violations;
}

/**
 * AI Critic Schema & Rubric
 */
const criticResponseSchema = {
  type: "object",
  properties: {
    domain_specificity: {
      type: "integer",
      description: "Skor 1-5: Seberapa spesifik istilah domain dan apakah bebas dari istilah asing/toko yang tidak relevan.",
    },
    consistency: {
      type: "integer",
      description: "Skor 1-5: Keselarasan tech stack, penomoran fase, dan alur di seluruh bagian dokumen.",
    },
    mvp_viability: {
      type: "integer",
      description: "Skor 1-5: Ketegasan batasan MVP vs Out-of-scope dan kelayakan eksekusi teknis.",
    },
    schema_completeness: {
      type: "integer",
      description: "Skor 1-5: Keselarasan skema database terhadap alur fitur, ketersediaan UUID PK, status enum, dan relasi.",
    },
    risk_completeness: {
      type: "integer",
      description: "Skor 1-5: Kelengkapan penanganan kuota/biaya API, privasi, retensi, dan kegagalan third-party.",
    },
    critic_feedback: {
      type: "string",
      description: "Ulasan evaluasi kritis komprehensif mengenai kekuatan dan kelemahan spesifikasi PRD ini.",
    },
    verdict: {
      type: "string",
      enum: ["PASS", "NEEDS_REVISION"],
      description: "PASS jika rata-rata >= 4.0 dan tidak ada skor < 3, sebaliknya NEEDS_REVISION.",
    },
  },
  required: [
    "domain_specificity",
    "consistency",
    "mvp_viability",
    "schema_completeness",
    "risk_completeness",
    "critic_feedback",
    "verdict",
  ],
};

const CriticZodSchema = z.object({
  domain_specificity: z.number().int().min(1).max(5),
  consistency: z.number().int().min(1).max(5),
  mvp_viability: z.number().int().min(1).max(5),
  schema_completeness: z.number().int().min(1).max(5),
  risk_completeness: z.number().int().min(1).max(5),
  critic_feedback: z.string(),
  verdict: z.enum(["PASS", "NEEDS_REVISION"]),
});

/**
 * Panggilan Gemini AI Critic Terpisah untuk Evaluasi Akhir Berdasarkan Rubrik 1-5
 */
export async function runGeminiCriticEvaluation(options: {
  prd: PRDOutput;
  stage1: Stage1Output;
  apiKeyPool: KeyPoolManager;
  preferredModel?: string;
  slotTargets?: GeminiSlotTarget[];
}): Promise<CriticRubricScores> {
  const { prd, stage1, apiKeyPool, preferredModel, slotTargets } = options;

  const systemPrompt = `Kamu adalah Lead Quality Auditor & Senior Staff Product Architect.
Tugasmu adalah menguji dan mengkritik PRD hasil generator secara objektif menggunakan 5 rubrik standar industri Silicon Valley:
1. Kekhususan Domain (Domain Specificity - 1-5): Apakah seluruh istilah berasal dari domain yang tepat tanpa ada kebocoran istilah bisnis/toko/gudang lain?
2. Konsistensi Arsitektur (Consistency - 1-5): Apakah tech stack dan fase sinkron di seluruh seksi dokumen?
3. Kelayakan MVP (MVP Viability - 1-5): Apakah pemisahan In-Scope MVP dan Out-of-Scope tegas dan realistis?
4. Kelengkapan Skema DB (Database Completeness - 1-5): Apakah tabel diturunkan langsung dari alur fitur dan memiliki relasi serta status enum lengkap?
5. Kelengkapan Risiko (Risk Mitigation - 1-5): Apakah mencakup biaya API, privasi, retensi, dan mitigasi third party?

Berikan penilaian ketat. Dilarang memberikan nilai 5 jika masih ada deskripsi generik atau istilah yang kurang padu.`;

  const prdSummary = {
    title: prd.title,
    domain: stage1.product_brief.domain,
    banned_terms: stage1.product_brief.banned_terms,
    target_persona: prd.archetype_detection?.target_audience,
    tech_stack: prd.tech_stack,
    features: (prd.feature_breakdown || []).map((f) => ({
      name: f.name,
      priority: f.priority,
      user_story: f.user_story,
      tables: f.tech_mapping?.db_tables,
    })),
    scope: prd.boundaries?.scope?.slice(0, 6),
    non_goals: prd.boundaries?.non_goals?.slice(0, 4),
    database_erd_snippet: prd.architecture_diagrams?.database_erd?.slice(0, 400),
  };

  const userPrompt = `Evaluasi PRD berikut berdasarkan rubrik 1-5:\n${JSON.stringify(prdSummary, null, 2)}`;

  const res = await executeGeminiStageJson<z.infer<typeof CriticZodSchema>>({
    apiKeyPool,
    systemPrompt,
    userPrompt,
    responseSchema: criticResponseSchema,
    zodSchema: CriticZodSchema,
    stageName: "Validator - AI Critic Rubric Evaluation",
    preferredModel,
    slotTargets,
    maxOutputTokens: 2048,
  });

  const raw = res.data;
  const avg = Number(
    (
      (raw.domain_specificity +
        raw.consistency +
        raw.mvp_viability +
        raw.schema_completeness +
        raw.risk_completeness) /
      5
    ).toFixed(2)
  );

  return {
    domain_specificity: raw.domain_specificity,
    consistency: raw.consistency,
    mvp_viability: raw.mvp_viability,
    schema_completeness: raw.schema_completeness,
    risk_completeness: raw.risk_completeness,
    average_score: avg,
    critic_feedback: raw.critic_feedback,
    verdict: avg >= 4.0 && !Object.values(raw).some((v) => typeof v === 'number' && v < 3)
      ? "PASS"
      : "NEEDS_REVISION",
  };
}
