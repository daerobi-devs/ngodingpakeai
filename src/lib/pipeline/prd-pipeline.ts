import { PRDFormData, TechStackInfo, PRDOutput, DeepFeature } from "@/types/prd";
import { KeyPoolManager, GeminiSlotTarget, executeGeminiStageJson } from "@/lib/gemini/gemini-client";
import {
  Stage1Output,
  Stage2Output,
  Stage3Output,
  PipelineProgressCallback,
} from "@/types/pipeline";
import {
  stage1ResponseSchema,
  Stage1ZodSchema,
  stage2ResponseSchema,
  Stage2ZodSchema,
  stage3ResponseSchema,
  Stage3ZodSchema,
} from "@/lib/gemini/pipeline-schemas";
import {
  STAGE_1_SYSTEM_PROMPT,
  buildStage1UserPrompt,
  STAGE_2_SYSTEM_PROMPT,
  buildStage2UserPrompt,
  STAGE_3_SYSTEM_PROMPT,
  buildStage3UserPrompt,
} from "@/lib/gemini/pipeline-prompts";

import {
  validateStage2Output,
  validateStage3Output,
  runGeminiCriticEvaluation,
  ValidationReport,
  ValidationViolation,
  CriticRubricScores,
} from "./validator";

export interface PipelineExecutionOptions {
  formData: PRDFormData;
  techStack?: TechStackInfo;
  selectedModules?: any[];
  language?: "id" | "en";
  apiKeyPool: KeyPoolManager;
  preferredModel?: string;
  slotTargets?: GeminiSlotTarget[];
  signal?: AbortSignal;
  onProgress?: PipelineProgressCallback;
  enableCritic?: boolean;
}

export async function executePipelineStage1(
  options: PipelineExecutionOptions
): Promise<{ stage1: Stage1Output; modelUsed: string; slotUsed: string }> {
  const {
    formData,
    techStack,
    selectedModules,
    language = "id",
    apiKeyPool,
    preferredModel,
    slotTargets,
    signal,
    onProgress,
  } = options;

  if (onProgress) {
    onProgress(1, "Product Brief & SSOT", "Menganalisis ide produk dan mengunci Single Source of Truth...");
  }

  const systemPrompt = STAGE_1_SYSTEM_PROMPT;
  const userPrompt = buildStage1UserPrompt(formData, techStack, selectedModules, language);

  const res = await executeGeminiStageJson<Stage1Output>({
    apiKeyPool,
    systemPrompt,
    userPrompt,
    responseSchema: stage1ResponseSchema,
    zodSchema: Stage1ZodSchema,
    stageName: "Tahap 1 - Product Brief & SSOT",
    preferredModel,
    slotTargets,
    signal,
    maxOutputTokens: 8192,
  });

  return {
    stage1: res.data,
    modelUsed: res.modelUsed,
    slotUsed: res.slotUsed,
  };
}

export async function executePipelineStage2(
  stage1: Stage1Output,
  options: PipelineExecutionOptions,
  correctionFeedback?: string
): Promise<{ stage2: Stage2Output; modelUsed: string; slotUsed: string }> {
  const { formData, language = "id", apiKeyPool, preferredModel, slotTargets, signal, onProgress } = options;

  if (onProgress) {
    onProgress(
      2,
      correctionFeedback ? "Requirements & Features (Revisi)" : "Requirements & Features",
      correctionFeedback
        ? "Memperbaiki persyaratan dan fitur berdasarkan temuan validator..."
        : "Menyusun persyaratan fungsional dan spesifikasi fitur mendalam..."
    );
  }

  const systemPrompt = STAGE_2_SYSTEM_PROMPT;
  let userPrompt = buildStage2UserPrompt(stage1, formData, language);
  if (correctionFeedback) {
    userPrompt += `\n\n══════════════════════════════════════════════════════════════════════════════\nPERINGATAN PERBAIKAN VALIDATOR:\nHasil sebelumnya ditolak karena pelanggaran aturan kualitas berikut:\n${correctionFeedback}\n\nPERBAIKI SEPENUHNYA: Pastikan TIDAK ADA istilah terlarang (banned_terms), TIDAK ADA frasa klise/generik, format User Story wajib "Sebagai [persona], saya ingin [aksi] agar [dampak]", dan sub-bagian Asumsi [Termasuk dalam MVP] & Batasan [Di Luar Cakupan] terisi lengkap!\n══════════════════════════════════════════════════════════════════════════════`;
  }

  const res = await executeGeminiStageJson<Stage2Output>({
    apiKeyPool,
    systemPrompt,
    userPrompt,
    responseSchema: stage2ResponseSchema,
    zodSchema: Stage2ZodSchema,
    stageName: "Tahap 2 - Requirements & Core Features",
    preferredModel,
    slotTargets,
    signal,
    maxOutputTokens: 16384,
  });

  return {
    stage2: res.data,
    modelUsed: res.modelUsed,
    slotUsed: res.slotUsed,
  };
}

export async function executePipelineStage3(
  stage1: Stage1Output,
  stage2: Stage2Output,
  options: PipelineExecutionOptions,
  correctionFeedback?: string
): Promise<{ stage3: Stage3Output; modelUsed: string; slotUsed: string }> {
  const { language = "id", apiKeyPool, preferredModel, slotTargets, signal, onProgress } = options;

  if (onProgress) {
    onProgress(
      3,
      correctionFeedback ? "Architecture & Database (Revisi)" : "Architecture & Database",
      correctionFeedback
        ? "Memperbaiki skema database dan sinkronisasi arsitektur..."
        : "Merancang alur navigasi, diagram Mermaid, dan skema database relasional..."
    );
  }

  const systemPrompt = STAGE_3_SYSTEM_PROMPT;
  let userPrompt = buildStage3UserPrompt(stage1, stage2, language);
  if (correctionFeedback) {
    userPrompt += `\n\n══════════════════════════════════════════════════════════════════════════════\nPERINGATAN PERBAIKAN VALIDATOR:\nHasil sebelumnya ditolak karena pelanggaran arsitektur berikut:\n${correctionFeedback}\n\nPERBAIKI SEPENUHNYA: Pastikan seluruh tabel fitur P0 (${stage2.feature_breakdown.map((f) => f.name).join(', ')}) memiliki tabel di database_erd & sql_migration_script, dan nomor fase sinkron dengan "${stage1.key_decisions.phase_strategy.mvp_phase_name}"!\n══════════════════════════════════════════════════════════════════════════════`;
  }

  const res = await executeGeminiStageJson<Stage3Output>({
    apiKeyPool,
    systemPrompt,
    userPrompt,
    responseSchema: stage3ResponseSchema,
    zodSchema: Stage3ZodSchema,
    stageName: "Tahap 3 - User Flow, Architecture & Database",
    preferredModel,
    slotTargets,
    signal,
    maxOutputTokens: 20480,
  });

  return {
    stage3: res.data,
    modelUsed: res.modelUsed,
    slotUsed: res.slotUsed,
  };
}

export function assembleHarmonizedPRD(
  stage1: Stage1Output,
  stage2: Stage2Output,
  stage3: Stage3Output,
  metadata: {
    modelUsed: string;
    slotUsed: string;
  }
): PRDOutput {
  const brief = stage1.product_brief;
  const decisions = stage1.key_decisions;

  // Format assumptions & constraints with mandatory sections
  const formattedAssumptions: string[] = [
    `Skala Pengguna: Dirancang untuk ${brief.target_persona.primary_user} dengan kapasitas data terkelola.`,
    `Batasan Akses: Satu akun pengguna terhubung ke profil/ruang kerja utama pada rilis awal.`,
    `Bahasa Antarmuka: Bahasa Indonesia profesional dengan istilah rekayasa perangkat lunak modern.`,
    ...stage2.assumptions_and_constraints.in_scope_assumptions.map(
      (a) => `[Termasuk dalam MVP] ${a}`
    ),
    ...stage2.assumptions_and_constraints.out_of_scope_constraints.map(
      (o) => `[Di Luar Cakupan / Tahap Berikutnya] ${o}`
    ),
  ];

  // Harmonize task breakdown to adhere to standardized phase prefixes
  const harmonizedTasks = stage3.task_breakdown.map((t) => {
    let clean = t.trim();
    if (!clean.startsWith('[')) {
      clean = `[${decisions.phase_strategy.mvp_phase_name}] ${clean}`;
    }
    return clean;
  });

  // Assemble full PRDOutput
  const prd: PRDOutput = {
    title: brief.app_title,
    archetype_detection: {
      archetype: brief.archetype,
      target_audience: brief.target_persona.primary_user,
      ui_personality: brief.ui_personality,
      color_theme: {
        primary: brief.color_theme.primary,
        secondary: brief.color_theme.secondary,
        accent: brief.color_theme.accent,
        background_mood: brief.color_theme.background_mood,
      },
      has_dashboard: brief.has_dashboard,
    },
    opportunity_framing: {
      core_problem: stage2.opportunity_framing.core_problem,
      working_hypothesis: stage2.opportunity_framing.working_hypothesis,
      strategy_fit: stage2.opportunity_framing.strategy_fit,
    },
    boundaries: {
      scope: [
        ...stage2.boundaries.scope,
        ...stage2.assumptions_and_constraints.in_scope_assumptions.map(
          (a) => `[Termasuk dalam MVP] ${a}`
        ),
      ],
      non_goals: [
        ...stage2.boundaries.non_goals,
        ...stage2.assumptions_and_constraints.out_of_scope_constraints.map(
          (o) => `[Di Luar Cakupan / Tahap Berikutnya] ${o}`
        ),
      ],
    },
    feature_breakdown: stage2.feature_breakdown.map((f, idx) => ({
      ...f,
      phase: f.phase || (f.priority === 'P0' ? decisions.phase_strategy.mvp_phase_name : decisions.phase_strategy.next_phase_name),
    })),
    success_measurement: {
      offline_golden_set: stage2.success_measurement.offline_golden_set,
      human_review: stage2.success_measurement.human_review,
      online_metrics: `${stage2.success_measurement.online_metrics} | SLO Teknis: ${stage2.success_measurement.technical_slos.join('; ')}`,
    },
    rollout_plan: {
      exposure: `Fase 1: Uji coba Alpha terbatas pada target persona (${brief.target_persona.primary_user}). Fase 2: Peluncuran Beta publik 100%.`,
      duration: '14 hari masa evaluasi metrik adopsi dan stabilitas error rate pasca rilis.',
      segments_gates: 'Zero critical error di Sentry/log, tingkat keberhasilan alur utama > 99%, dan latensi p95 sesuai SLO.',
    },
    risk_management: {
      detection: stage2.risk_management.detection,
      fallback_kill_switch: `${stage2.risk_management.fallback_kill_switch}. Mitigasi Layanan: ${stage2.risk_management.third_party_failure_mitigation}. Kebijakan Retensi: ${stage2.risk_management.data_retention_policy}`,
    },
    ownership_action: {
      primary_owner: `Lead Product Architect & PIC Operasional (${brief.domain})`,
      decision_points: `Evaluasi mingguan untuk menentukan kelayakan transisi dari ${decisions.phase_strategy.mvp_phase_name} menuju ${decisions.phase_strategy.next_phase_name}.`,
    },
    ai_specific: {
      behavior_contract: {
        good: [
          `Arsitektur frontend: ${decisions.tech_stack.frontend} dengan Server Components default`,
          `Validasi ketat skema payload request menggunakan Zod di setiap endpoint API`,
          `Proteksi Row Level Security (RLS) aktif pada seluruh tabel di ${decisions.tech_stack.database}`,
          `TypeScript Strict Mode tanpa kompromi tipe data 'any'`,
        ],
        reject: [
          'Dilarang menggunakan inline styling di luar Tailwind CSS',
          'Dilarang menyimpan secret atau API key di sisi client component',
          'Dilarang melakukan mutasi database langsung dari client tanpa melewati server action / API route',
          'ZERO EMOJI POLICY: Dilarang menyelipkan emoji apa pun pada UI komponen, tombol, atau teks sistem',
        ],
      },
      guardrails: [
        'Proteksi SQL Injection dan Sanitasi XSS pada seluruh form input pengguna',
        `Mekanisme rate limiting dan pembatasan kuota pada endpoint API ${brief.app_title}`,
        'Audit trail terenkripsi untuk seluruh mutasi data sensitif dan transaksi pengguna',
        `Penyimpanan berkas media/dokumen aman via ${decisions.storage_system.provider} dengan signed URL sementara`,
      ],
    },
    assumptions_and_constraints: formattedAssumptions,
    task_breakdown: harmonizedTasks,
    roadmap_tree: stage3.roadmap_tree,
    architecture_diagrams: stage3.architecture_diagrams,
    tech_stack: decisions.tech_stack as any,
    metadata: {
      modelUsed: metadata.modelUsed,
      generatedAt: new Date().toISOString(),
      geminiSlotUsed: metadata.slotUsed,
    },
  };

  return prd;
}

/**
 * Master Chained Pipeline Generator:
 * Generates PRDs sequentially in 3 cohesive stages rather than one monolithic shot.
 */
export async function generatePRDPipeline(options: PipelineExecutionOptions): Promise<PRDOutput> {
  const validationLogs: string[] = [];

  // 1. Ekstrak Product Brief & Kunci Keputusan (SSOT)
  const stage1Res = await executePipelineStage1(options);
  validationLogs.push(`Tahap 1 selesai (Model: ${stage1Res.modelUsed}, Slot: ${stage1Res.slotUsed}).`);

  // 2. Susun Requirements, Metrik, & Fitur Utama dengan Validator Otomatis (max 2 retries)
  let stage2Res = await executePipelineStage2(stage1Res.stage1, options);
  let stage2Retries = 0;
  let stage2Violations = validateStage2Output(stage1Res.stage1, stage2Res.stage2);
  let criticalViolationsS2 = stage2Violations.filter((v) => v.severity === 'critical');

  while (criticalViolationsS2.length > 0 && stage2Retries < 2) {
    stage2Retries++;
    const feedback = criticalViolationsS2.map((v) => `- [${v.type}] ${v.message}`).join('\n');
    validationLogs.push(`Tahap 2 Violations (Percobaan #${stage2Retries}): ${criticalViolationsS2.length} pelanggaran kritis. Meregenerasi...`);
    stage2Res = await executePipelineStage2(stage1Res.stage1, options, feedback);
    stage2Violations = validateStage2Output(stage1Res.stage1, stage2Res.stage2);
    criticalViolationsS2 = stage2Violations.filter((v) => v.severity === 'critical');
  }
  validationLogs.push(`Tahap 2 validasi selesai. Pelanggaran tersisa: ${stage2Violations.length} (Kritis: ${criticalViolationsS2.length}).`);

  // 3. Susun User Flow, Database Schema, SQL DDL, & Diagram Arsitektur dengan Validator Otomatis (max 2 retries)
  let stage3Res = await executePipelineStage3(stage1Res.stage1, stage2Res.stage2, options);
  let stage3Retries = 0;
  let stage3Violations = validateStage3Output(stage1Res.stage1, stage2Res.stage2, stage3Res.stage3);
  let criticalViolationsS3 = stage3Violations.filter((v) => v.severity === 'critical');

  while (criticalViolationsS3.length > 0 && stage3Retries < 2) {
    stage3Retries++;
    const feedback = criticalViolationsS3.map((v) => `- [${v.type}] ${v.message}`).join('\n');
    validationLogs.push(`Tahap 3 Violations (Percobaan #${stage3Retries}): ${criticalViolationsS3.length} pelanggaran kritis. Meregenerasi...`);
    stage3Res = await executePipelineStage3(stage1Res.stage1, stage2Res.stage2, options, feedback);
    stage3Violations = validateStage3Output(stage1Res.stage1, stage2Res.stage2, stage3Res.stage3);
    criticalViolationsS3 = stage3Violations.filter((v) => v.severity === 'critical');
  }
  validationLogs.push(`Tahap 3 validasi selesai. Pelanggaran tersisa: ${stage3Violations.length} (Kritis: ${criticalViolationsS3.length}).`);

  // 4. Harmonisasi dan Rakit ke PRDOutput Terpadu
  const finalPrd = assembleHarmonizedPRD(stage1Res.stage1, stage2Res.stage2, stage3Res.stage3, {
    modelUsed: stage3Res.modelUsed,
    slotUsed: stage3Res.slotUsed,
  });

  // 5. Evaluasi AI Critic jika diaktifkan
  let criticScores: CriticRubricScores | undefined = undefined;
  if (options.enableCritic) {
    try {
      options.onProgress?.(4, "AI Quality Critic", "Menjalankan evaluasi independen standar Silicon Valley (Rubrik 1-5)...");
      criticScores = await runGeminiCriticEvaluation({
        prd: finalPrd,
        stage1: stage1Res.stage1,
        apiKeyPool: options.apiKeyPool,
        preferredModel: options.preferredModel,
        slotTargets: options.slotTargets,
      });
      validationLogs.push(`AI Critic Verdict: ${criticScores.verdict} (Rata-rata: ${criticScores.average_score}/5.0).`);
    } catch (err: unknown) {
      validationLogs.push(`AI Critic warning: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 6. Bentuk Laporan Validasi Lengkap
  const allViolations = [...stage2Violations, ...stage3Violations];
  const validationReport: ValidationReport = {
    passed: allViolations.filter((v) => v.severity === 'critical').length === 0,
    score: Math.max(0, 100 - allViolations.length * 10),
    violations: allViolations,
    criticScores,
    retriesPerformed: stage2Retries + stage3Retries,
    logSummary: validationLogs,
  };

  finalPrd.metadata = {
    modelUsed: finalPrd.metadata?.modelUsed || stage3Res.modelUsed,
    generatedAt: finalPrd.metadata?.generatedAt || new Date().toISOString(),
    ...finalPrd.metadata,
    validation_report: validationReport,
  };

  return finalPrd;
}
