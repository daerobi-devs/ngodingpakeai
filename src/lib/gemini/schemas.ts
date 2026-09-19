import { z } from "zod";
import { ClarificationQuestion } from "@/types/prd";

export const geminiPRDResponseSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    archetype_detection: {
      type: "object",
      properties: {
        archetype: { type: "string" },
        target_audience: { type: "string" },
        ui_personality: { type: "string" },
        color_theme: {
          type: "object",
          properties: {
            primary: { type: "string" },
            secondary: { type: "string" },
            background_mood: { type: "string" },
            accent: { type: "string" },
          },
          required: ["primary", "secondary", "background_mood", "accent"],
        },
        has_dashboard: { type: "boolean" },
      },
      required: ["archetype", "target_audience", "ui_personality", "color_theme", "has_dashboard"],
    },
    opportunity_framing: {
      type: "object",
      properties: {
        core_problem: { type: "string" },
        working_hypothesis: { type: "string" },
        strategy_fit: { type: "string" },
      },
      required: ["core_problem", "working_hypothesis", "strategy_fit"],
    },
    boundaries: {
      type: "object",
      properties: {
        scope: { type: "array", items: { type: "string" } },
        non_goals: { type: "array", items: { type: "string" } },
      },
      required: ["scope", "non_goals"],
    },
    feature_breakdown: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          priority: { type: "string", enum: ["P0", "P1"] },
          user_story: { type: "string" },
          happy_path: { type: "array", items: { type: "string" } },
          business_rules: { type: "array", items: { type: "string" } },
          edge_cases: { type: "array", items: { type: "string" } },
          tech_mapping: {
            type: "object",
            properties: {
              frontend_components: { type: "array", items: { type: "string" } },
              api_endpoints: { type: "array", items: { type: "string" } },
              db_tables: { type: "array", items: { type: "string" } },
            },
          },
          agent_prompt: { type: "string" },
        },
        required: [
          "id",
          "name",
          "priority",
          "user_story",
          "happy_path",
          "business_rules",
          "edge_cases",
          "agent_prompt",
        ],
      },
    },
    success_measurement: {
      type: "object",
      properties: {
        offline_golden_set: { type: "string" },
        human_review: { type: "string" },
        online_metrics: { type: "string" },
      },
      required: ["offline_golden_set", "human_review", "online_metrics"],
    },
    rollout_plan: {
      type: "object",
      properties: {
        exposure: { type: "string" },
        duration: { type: "string" },
        segments_gates: { type: "string" },
      },
      required: ["exposure", "duration", "segments_gates"],
    },
    risk_management: {
      type: "object",
      properties: {
        detection: { type: "string" },
        fallback_kill_switch: { type: "string" },
      },
      required: ["detection", "fallback_kill_switch"],
    },
    ownership_action: {
      type: "object",
      properties: {
        primary_owner: { type: "string" },
        decision_points: { type: "string" },
      },
      required: ["primary_owner", "decision_points"],
    },
    ai_specific: {
      type: "object",
      properties: {
        behavior_contract: {
          type: "object",
          properties: {
            good: { type: "array", items: { type: "string" } },
            reject: { type: "array", items: { type: "string" } },
          },
          required: ["good", "reject"],
        },
        guardrails: { type: "array", items: { type: "string" } },
      },
      required: ["behavior_contract", "guardrails"],
    },
    task_breakdown: { type: "array", items: { type: "string" } },
    roadmap_tree: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          phase: { type: "string" },
          status: { type: "string" },
          description: { type: "string" },
          icon: { type: "string" },
          sub_features: { type: "array", items: { type: "string" } },
        },
        required: ["id", "title", "phase", "sub_features"],
      },
    },
    architecture_diagrams: {
      type: "object",
      properties: {
        system_flowchart: { type: "string" },
        user_journey_flow: { type: "string" },
        database_erd: { type: "string" },
        api_integration_matrix: { type: "string" },
        sequence_diagram: { type: "string" },
      },
    },
  },
  required: [
    "title",
    "opportunity_framing",
    "boundaries",
    "success_measurement",
    "rollout_plan",
    "risk_management",
    "ownership_action",
    "ai_specific",
    "task_breakdown",
  ],
};

export const DeepFeatureZodSchema = z.object({
  id: z.string(),
  name: z.string(),
  priority: z.enum(["P0", "P1"]).default("P0"),
  user_story: z.string(),
  happy_path: z.array(z.string()).default([]),
  business_rules: z.array(z.string()).default([]),
  edge_cases: z.array(z.string()).default([]),
  tech_mapping: z
    .object({
      frontend_components: z.array(z.string()).optional(),
      api_endpoints: z.array(z.string()).optional(),
      db_tables: z.array(z.string()).optional(),
    })
    .optional()
    .default({}),
  agent_prompt: z.string().default(""),
});

export const ArchetypeDetectionZodSchema = z.object({
  archetype: z.string(),
  target_audience: z.string(),
  ui_personality: z.string(),
  color_theme: z
    .object({
      primary: z.string(),
      secondary: z.string(),
      background_mood: z.string(),
      accent: z.string(),
    })
    .optional(),
  has_dashboard: z.boolean().default(false),
});

export const PRDOutputZodSchema = z.object({
  title: z.string().min(1),
  archetype_detection: ArchetypeDetectionZodSchema.optional(),
  opportunity_framing: z.object({
    core_problem: z.string(),
    working_hypothesis: z.string(),
    strategy_fit: z.string(),
  }),
  boundaries: z.object({
    scope: z.array(z.string()),
    non_goals: z.array(z.string()),
  }),
  feature_breakdown: z.array(DeepFeatureZodSchema).optional(),
  success_measurement: z.object({
    offline_golden_set: z.string(),
    human_review: z.string(),
    online_metrics: z.string(),
  }),
  rollout_plan: z.object({
    exposure: z.string(),
    duration: z.string(),
    segments_gates: z.string(),
  }),
  risk_management: z.object({
    detection: z.string(),
    fallback_kill_switch: z.string(),
  }),
  ownership_action: z.object({
    primary_owner: z.string(),
    decision_points: z.string(),
  }),
  ai_specific: z.object({
    behavior_contract: z.object({
      good: z.array(z.string()).min(1),
      reject: z.array(z.string()).min(1),
    }),
    guardrails: z.array(z.string()),
  }),
  task_breakdown: z.array(z.string()),
  roadmap_tree: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        phase: z.string(),
        status: z.string().optional().default("Direncanakan"),
        description: z.string().optional(),
        icon: z.string().optional(),
        sub_features: z.array(z.string()).default([]),
      })
    )
    .optional(),
  architecture_diagrams: z
    .object({
      system_flowchart: z.string().optional(),
      user_journey_flow: z.string().optional(),
      database_erd: z.string().optional(),
      api_integration_matrix: z.string().optional(),
      sequence_diagram: z.string().optional(),
    })
    .optional(),
});

export const clarificationResponseSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          category: { type: "string" },
          question: { type: "string" },
          isMultiSelect: { type: "boolean" },
          inputType: { type: "string" },
          options: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                description: { type: "string" },
              },
              required: ["id", "label"],
            },
          },
          recommendedOptionId: { type: "string" },
        },
        required: ["id", "category", "question", "options", "recommendedOptionId"],
      },
    },
  },
  required: ["questions"],
};

export const ClarificationOutputZodSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      question: z.string(),
      isMultiSelect: z.boolean().optional(),
      inputType: z.enum(["chips", "textarea"]).optional(),
      options: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          description: z.string().optional(),
        })
      ),
      recommendedOptionId: z.string(),
    })
  ),
});

/**
 * Helper to safely coerce any value into an array of non-empty strings.
 * Handles strings with newlines, commas, bullet points, or single strings.
 */
function toArrayOfStrings(val: any): string[] {
  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === "string" ? item : typeof item === "object" ? (item?.name || item?.title || JSON.stringify(item)) : String(item)))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.includes("\n")) {
      return trimmed
        .split("\n")
        .map((s) => s.replace(/^[-*•\d.]+\s*/, "").trim())
        .filter(Boolean);
    }
    if (trimmed.includes(";")) {
      return trimmed.split(";").map((s) => s.trim()).filter(Boolean);
    }
    if (trimmed.includes(",")) {
      return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

/**
 * Normalizes raw LLM output from OpenAI-compat models (9Router, OpenRouter, DeepSeek)
 * before Zod parsing, fixing schema discrepancies such as strings where arrays are expected,
 * missing archetype metadata, or undefined task breakdowns.
 */
export function normalizeAndSanitizePRDOutput(raw: any): z.infer<typeof PRDOutputZodSchema> {
  if (!raw || typeof raw !== "object") {
    throw new Error("Respons dari model AI tidak berupa objek JSON yang valid.");
  }

  const title = typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : "Arsitektur Produk PRD";

  // 1. Archetype Detection Sanitization
  const rawArch = raw.archetype_detection || {};
  const archetype_detection = {
    archetype: typeof rawArch.archetype === "string" && rawArch.archetype ? rawArch.archetype : "SaaS",
    target_audience: typeof rawArch.target_audience === "string" && rawArch.target_audience ? rawArch.target_audience : "Pengembang & Pengguna Akhir",
    ui_personality: typeof rawArch.ui_personality === "string" && rawArch.ui_personality ? rawArch.ui_personality : "Modern, Clean, & Intuitive",
    color_theme: {
      primary: rawArch.color_theme?.primary || "#F59E0B",
      secondary: rawArch.color_theme?.secondary || "#18181B",
      background_mood: rawArch.color_theme?.background_mood || "Dark Slate",
      accent: rawArch.color_theme?.accent || "#E11D48",
    },
    has_dashboard: typeof rawArch.has_dashboard === "boolean" ? rawArch.has_dashboard : true,
  };

  // 2. Opportunity Framing
  const rawOpp = raw.opportunity_framing || {};
  const opportunity_framing = {
    core_problem: typeof rawOpp.core_problem === "string" && rawOpp.core_problem ? rawOpp.core_problem : "Masalah utama belum terdokumentasi dengan lengkap.",
    working_hypothesis: typeof rawOpp.working_hypothesis === "string" && rawOpp.working_hypothesis ? rawOpp.working_hypothesis : "Dengan menyediakan arsitektur terstruktur, alur produk menjadi jelas.",
    strategy_fit: typeof rawOpp.strategy_fit === "string" && rawOpp.strategy_fit ? rawOpp.strategy_fit : "Sesuai dengan kebutuhan pasar dan pengembangan MVP.",
  };

  // 3. Boundaries (Scope & Non-Goals) - safely coerce to arrays
  const rawBound = raw.boundaries || {};
  const scope = toArrayOfStrings(rawBound.scope);
  const non_goals = toArrayOfStrings(rawBound.non_goals);
  const boundaries = {
    scope: scope.length > 0 ? scope : ["Implementasi antarmuka pengguna inti", "Integrasi backend & API utama", "Sistem autentikasi dasar"],
    non_goals: non_goals.length > 0 ? non_goals : ["Integrasi sistem legasi yang tidak relevan", "Arsitektur multi-cloud di fase MVP"],
  };

  // 4. Feature Breakdown
  let feature_breakdown: any[] = [];
  if (Array.isArray(raw.feature_breakdown)) {
    feature_breakdown = raw.feature_breakdown.map((f: any, idx: number) => ({
      id: f.id || `feat-${idx + 1}`,
      name: f.name || `Fitur ${idx + 1}`,
      priority: f.priority === "P1" ? "P1" : "P0",
      user_story: f.user_story || `Sebagai pengguna, saya ingin ${f.name || "fitur ini"} agar pekerjaan selesai.`,
      happy_path: toArrayOfStrings(f.happy_path).length > 0 ? toArrayOfStrings(f.happy_path) : ["Pengguna membuka halaman", "Pengguna melakukan aksi", "Sistem merespons dengan sukses"],
      business_rules: toArrayOfStrings(f.business_rules).length > 0 ? toArrayOfStrings(f.business_rules) : ["Input harus valid", "Autentikasi diperlukan"],
      edge_cases: toArrayOfStrings(f.edge_cases).length > 0 ? toArrayOfStrings(f.edge_cases) : ["Koneksi jaringan terputus", "Data input kosong"],
      tech_mapping: {
        frontend_components: toArrayOfStrings(f.tech_mapping?.frontend_components),
        api_endpoints: toArrayOfStrings(f.tech_mapping?.api_endpoints),
        db_tables: toArrayOfStrings(f.tech_mapping?.db_tables),
      },
      agent_prompt: f.agent_prompt || `Implementasikan fitur ${f.name || "ini"} dengan clean code dan penanganan error yang baik.`,
    }));
  }

  // 5. Success Measurement
  const rawSuccess = raw.success_measurement || {};
  const success_measurement = {
    offline_golden_set: typeof rawSuccess.offline_golden_set === "string" && rawSuccess.offline_golden_set ? rawSuccess.offline_golden_set : "Evaluasi fungsional dan pengujian integrasi lulus 100%.",
    human_review: typeof rawSuccess.human_review === "string" && rawSuccess.human_review ? rawSuccess.human_review : "Review kode dan acceptance criteria disetujui tim pengembang.",
    online_metrics: typeof rawSuccess.online_metrics === "string" && rawSuccess.online_metrics ? rawSuccess.online_metrics : "Tingkat keberhasilan tugas pengguna > 90% dan latensi < 1 detik.",
  };

  // 6. Rollout Plan
  const rawRollout = raw.rollout_plan || {};
  const rollout_plan = {
    exposure: typeof rawRollout.exposure === "string" && rawRollout.exposure ? rawRollout.exposure : "Alpha release untuk internal testing lalu beta bertahap.",
    duration: typeof rawRollout.duration === "string" && rawRollout.duration ? rawRollout.duration : "2 minggu fase beta sebelum peluncuran penuh.",
    segments_gates: typeof rawRollout.segments_gates === "string" && rawRollout.segments_gates ? rawRollout.segments_gates : "Error rate < 1% dan feedback pengguna awal positif.",
  };

  // 7. Risk Management
  const rawRisk = raw.risk_management || {};
  const risk_management = {
    detection: typeof rawRisk.detection === "string" && rawRisk.detection ? rawRisk.detection : "Logging terpusat dan monitoring error real-time.",
    fallback_kill_switch: typeof rawRisk.fallback_kill_switch === "string" && rawRisk.fallback_kill_switch ? rawRisk.fallback_kill_switch : "Fitur flag untuk mematikan modul bermasalah secara instan.",
  };

  // 8. Ownership Action
  const rawOwner = raw.ownership_action || {};
  const ownership_action = {
    primary_owner: typeof rawOwner.primary_owner === "string" && rawOwner.primary_owner ? rawOwner.primary_owner : "Lead Engineer / Product Owner",
    decision_points: typeof rawOwner.decision_points === "string" && rawOwner.decision_points ? rawOwner.decision_points : "Persetujuan arsitektur sebelum sprint dimulai.",
  };

  // 9. AI Specific (Guardrails & Behavior Contract)
  const rawAi = raw.ai_specific || {};
  const rawBehavior = rawAi.behavior_contract || {};
  const goodBehavior = toArrayOfStrings(rawBehavior.good);
  const rejectBehavior = toArrayOfStrings(rawBehavior.reject);
  const guardrails = toArrayOfStrings(rawAi.guardrails);

  const ai_specific = {
    behavior_contract: {
      good: goodBehavior.length > 0 ? goodBehavior : ["Gunakan TypeScript strict mode", "Terapkan error boundary", "Tulis instruksi koding modular"],
      reject: rejectBehavior.length > 0 ? rejectBehavior : ["Dilarang hardcode secret / API key", "Dilarang mematikan type checking", "Dilarang membiarkan unhandled rejection"],
    },
    guardrails: guardrails.length > 0 ? guardrails : ["Validasi semua input pengguna", "Sanitasi payload sebelum query", "Batasi rate request API"],
  };

  // 10. Task Breakdown
  let task_breakdown = toArrayOfStrings(raw.task_breakdown);
  if (task_breakdown.length === 0) {
    if (feature_breakdown.length > 0) {
      task_breakdown = feature_breakdown.map((f, i) => `Task ${i + 1}: Kembangkan komponen & API untuk ${f.name}`);
    } else {
      task_breakdown = [
        "Inisialisasi project & konfigurasi tech stack",
        "Buat skema database dan migrasi tabel",
        "Kembangkan endpoint API dan otentikasi",
        "Bangun UI antarmuka dan interaksi form",
        "Pengujian fungsional dan deployment",
      ];
    }
  }

  // 11. Roadmap Tree & Architecture Diagrams
  const roadmap_tree = Array.isArray(raw.roadmap_tree) ? raw.roadmap_tree : undefined;
  const architecture_diagrams = typeof raw.architecture_diagrams === "object" && raw.architecture_diagrams !== null ? raw.architecture_diagrams : undefined;

  const normalizedPayload = {
    title,
    archetype_detection,
    opportunity_framing,
    boundaries,
    feature_breakdown: feature_breakdown.length > 0 ? feature_breakdown : undefined,
    success_measurement,
    rollout_plan,
    risk_management,
    ownership_action,
    ai_specific,
    task_breakdown,
    roadmap_tree,
    architecture_diagrams,
  };

  return PRDOutputZodSchema.parse(normalizedPayload);
}

/**
 * Normalizes and sanitizes raw LLM output for clarification questions.
 * Guarantees well-formed chips, matching recommendedOptionIds, and robust schema compliance.
 */
export function normalizeAndSanitizeClarifications(raw: any): ClarificationQuestion[] {
  let list: any[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === "object" && Array.isArray(raw.questions)) {
    list = raw.questions;
  } else {
    throw new Error("Format output klarifikasi tidak memiliki array pertanyaan yang valid.");
  }

  const sanitized: ClarificationQuestion[] = list.map((q: any, idx: number) => {
    const id = typeof q.id === "string" && q.id.trim() ? q.id.trim() : `q_${idx + 1}`;
    const category = typeof q.category === "string" && q.category.trim() ? q.category.trim() : "core_flow";
    const question = typeof q.question === "string" && q.question.trim() ? q.question.trim() : `Pertanyaan Penting ${idx + 1}`;
    const isMultiSelect = Boolean(q.isMultiSelect);
    const inputType = q.inputType === "textarea" ? "textarea" : "chips";

    let rawOptions = Array.isArray(q.options) ? q.options : [];
    if (rawOptions.length === 0 && typeof q.options === "string") {
      rawOptions = q.options.split("\n").filter(Boolean).map((lbl: string, oIdx: number) => ({
        id: `opt_${idx + 1}_${oIdx + 1}`,
        label: lbl.replace(/^[-*•\d.]+\s*/, "").trim(),
      }));
    }

    const options = rawOptions.map((opt: any, oIdx: number) => {
      if (typeof opt === "string") {
        return {
          id: `opt_${idx + 1}_${oIdx + 1}`,
          label: opt.trim(),
          description: undefined,
        };
      }
      return {
        id: typeof opt?.id === "string" && opt.id.trim() ? opt.id.trim() : `opt_${idx + 1}_${oIdx + 1}`,
        label: typeof opt?.label === "string" && opt.label.trim() ? opt.label.trim() : `Opsi ${oIdx + 1}`,
        description: typeof opt?.description === "string" && opt.description.trim() ? opt.description.trim() : undefined,
      };
    });

    // Ensure at least 2 options exist
    if (options.length === 0) {
      options.push(
        { id: `opt_${idx + 1}_1`, label: "Opsi Rekomendasi Utama", description: "Pilihan standar industri terbaik" },
        { id: `opt_${idx + 1}_2`, label: "Opsi Alternatif Fleksibel", description: "Disesuaikan kebutuhan khusus" }
      );
    }

    let recommendedOptionId = typeof q.recommendedOptionId === "string" && q.recommendedOptionId.trim()
      ? q.recommendedOptionId.trim()
      : options[0].id;

    // Check if recommendedOptionId exists in options
    if (!options.some((o: any) => o.id === recommendedOptionId)) {
      recommendedOptionId = options[0].id;
    }

    return {
      id,
      category,
      question,
      isMultiSelect,
      inputType,
      options,
      recommendedOptionId,
    };
  });

  const parsed = ClarificationOutputZodSchema.parse({ questions: sanitized });
  return parsed.questions;
}
