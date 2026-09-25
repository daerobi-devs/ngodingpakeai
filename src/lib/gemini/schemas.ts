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
        sql_migration_script: { type: "string" },
        api_integration_matrix: { type: "string" },
        sequence_diagram: { type: "string" },
        infrastructure_topology: { type: "string" },
        rbac_permission_matrix: { type: "string" },
        data_pipeline_flow: { type: "string" },
      },
      required: ["system_flowchart", "user_journey_flow", "database_erd"],
    },
    ui_design_prompts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          screen_name: { type: "string" },
          category: { type: "string" },
          description: { type: "string" },
          wireframe_summary: { type: "string" },
          target_roles: { type: "array", items: { type: "string" } },
          v0_prompt: { type: "string" },
          stitch_prompt: { type: "string" },
        },
        required: ["id", "screen_name", "v0_prompt", "stitch_prompt"],
      },
    },
  },
  required: [
    "title",
    "archetype_detection",
    "opportunity_framing",
    "boundaries",
    "feature_breakdown",
    "success_measurement",
    "rollout_plan",
    "risk_management",
    "ownership_action",
    "ai_specific",
    "task_breakdown",
    "roadmap_tree",
    "architecture_diagrams",
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
        sub_features: z.array(z.union([z.string(), z.any()])).default([]),
      })
    )
    .optional(),
  architecture_diagrams: z
    .object({
      system_flowchart: z.string().optional(),
      user_journey_flow: z.string().optional(),
      database_erd: z.string().optional(),
      sql_migration_script: z.string().optional(),
      api_integration_matrix: z.string().optional(),
      sequence_diagram: z.string().optional(),
      infrastructure_topology: z.string().optional(),
      rbac_permission_matrix: z.string().optional(),
      data_pipeline_flow: z.string().optional(),
    })
    .optional(),
  ui_design_prompts: z
    .array(
      z.object({
        id: z.string(),
        screen_name: z.string(),
        category: z.enum(['dashboard', 'core_flow', 'crud_management', 'auth_settings']).or(z.string()),
        description: z.string().optional().default(''),
        wireframe_summary: z.string().optional().default(''),
        target_roles: z.array(z.string()).optional().default([]),
        v0_prompt: z.string(),
        stitch_prompt: z.string(),
      })
    )
    .optional(),
  tech_stack: z
    .object({
      name: z.string().optional(),
      version: z.string().optional(),
      description: z.string().optional(),
      frontend: z.any().optional(),
      backend: z.any().optional(),
      database: z.any().optional(),
      deployment: z.any().optional(),
      templateId: z.string().optional(),
      language: z.string().optional(),
    })
    .passthrough()
    .optional(),
  metadata: z
    .object({
      modelUsed: z.string().optional(),
      generatedAt: z.string().optional(),
      tokenUsage: z.number().optional(),
      tokensUsed: z.number().optional(),
      retries: z.number().optional(),
      fallbackCount: z.number().optional(),
      geminiSlotUsed: z.string().nullable().optional(),
      isServerKey: z.boolean().optional(),
      costEstimateRp: z.number().optional(),
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
                isRecommended: { type: "boolean" },
                recommendationReason: { type: "string" },
              },
              required: ["id", "label"],
            },
          },
          recommendedOptionId: { type: "string" },
          recommendedOptionIds: {
            type: "array",
            items: { type: "string" },
          },
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
          isRecommended: z.boolean().optional(),
          recommendationReason: z.string().optional(),
          badge: z.string().optional(),
        })
      ),
      recommendedOptionId: z.string(),
      recommendedOptionIds: z.array(z.string()).optional(),
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

// Helper untuk menghasilkan skrip SQL Migration PostgreSQL / Supabase tingkat industri
export function synthesizeProductionSqlMigration(
  title: string,
  tables: Array<{ name: string; columns: Array<{ name: string; type: string; isPk?: boolean; isFk?: boolean; refTable?: string }> }>
): string {
  const cleanTitle = title.replace(/[^a-zA-Z0-9_\s]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
  let sql = `-- =====================================================================
-- SKRIP MIGRASI DATABASE PRODUKSI: ${title.toUpperCase()}
-- Generated by NgodingPakePRD Architecture Engine
-- Target Database: PostgreSQL 15+ / Supabase
-- =====================================================================

-- 1. Mengaktifkan Ekstensi UUID Otomatis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

`;

  // 2. Buat tabel-tabel
  tables.forEach((t) => {
    const tableName = t.name.toLowerCase();
    sql += `-- ---------------------------------------------------------------------
-- Tabel: ${tableName}
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.${tableName} (
`;
    const colDefs: string[] = [];

    t.columns.forEach((col) => {
      let pgType = 'VARCHAR(255)';
      const typeLower = col.type.toLowerCase();

      if (col.isPk) {
        colDefs.push(`    id UUID PRIMARY KEY DEFAULT gen_random_uuid()`);
        return;
      }

      if (typeLower.includes('uuid')) {
        pgType = 'UUID';
      } else if (typeLower.includes('int') || typeLower.includes('number')) {
        pgType = 'INTEGER';
      } else if (typeLower.includes('decimal') || typeLower.includes('numeric') || typeLower.includes('price') || typeLower.includes('amount')) {
        pgType = 'NUMERIC(14, 2) DEFAULT 0.00';
      } else if (typeLower.includes('bool')) {
        pgType = 'BOOLEAN DEFAULT false';
      } else if (typeLower.includes('text') || typeLower.includes('desc') || typeLower.includes('content')) {
        pgType = 'TEXT';
      } else if (typeLower.includes('json')) {
        pgType = "JSONB DEFAULT '{}'::jsonb";
      } else if (typeLower.includes('date') || typeLower.includes('time')) {
        pgType = 'TIMESTAMPTZ DEFAULT now()';
      } else if (col.name.includes('status')) {
        pgType = "VARCHAR(50) DEFAULT 'active' NOT NULL";
      } else if (col.name.includes('email')) {
        pgType = 'VARCHAR(255) UNIQUE';
      }

      let line = `    ${col.name.toLowerCase()} ${pgType}`;
      if (col.isFk && col.refTable) {
        line += ` REFERENCES public.${col.refTable.toLowerCase()}(id) ON DELETE CASCADE`;
      }
      colDefs.push(line);
    });

    // Timestamps audit wajib
    if (!t.columns.some((c) => c.name.toLowerCase() === 'created_at')) {
      colDefs.push(`    created_at TIMESTAMPTZ DEFAULT now() NOT NULL`);
    }
    if (!t.columns.some((c) => c.name.toLowerCase() === 'updated_at')) {
      colDefs.push(`    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL`);
    }

    sql += colDefs.join(',\n') + '\n);\n\n';
  });

  // 3. Buat Index Performa
  sql += `-- =====================================================================
-- 3. Indeks Performa Query
-- =====================================================================\n`;
  tables.forEach((t) => {
    const tableName = t.name.toLowerCase();
    t.columns.forEach((col) => {
      if (col.isFk || col.name.includes('status') || col.name.includes('code') || col.name.includes('user_id')) {
        const idxName = `idx_${tableName}_${col.name.toLowerCase()}`;
        sql += `CREATE INDEX IF NOT EXISTS ${idxName} ON public.${tableName} (${col.name.toLowerCase()});\n`;
      }
    });
  });

  // 4. Row Level Security (RLS) Supabase
  sql += `\n-- =====================================================================
-- 4. Pengaktifan Row Level Security (RLS) & Kebijakan Akses
-- =====================================================================\n`;
  tables.forEach((t) => {
    const tableName = t.name.toLowerCase();
    sql += `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\n`;
    sql += `CREATE POLICY "Allow public read ${tableName}" ON public.${tableName} FOR SELECT TO authenticated USING (true);\n`;
    if (t.columns.some((c) => c.name.toLowerCase() === 'user_id')) {
      sql += `CREATE POLICY "Allow user manage own ${tableName}" ON public.${tableName} FOR ALL TO authenticated USING (auth.uid() = user_id);\n`;
    }
    sql += '\n';
  });

  return sql;
}

export function synthesizeDynamicArchitectureDiagrams(
  title: string,
  archetypeDetection: any,
  featureBreakdown: any[],
  existingDiagrams?: any
): Record<string, string> {
  const result: Record<string, string> = { ...(existingDiagrams || {}) };

  // 1. Database ERD & SQL Migration Synthesis
  const hasGenericErd =
    !result.database_erd ||
    (result.database_erd.includes('TRANSACTIONS') &&
      result.database_erd.includes('LOGS') &&
      !title.toLowerCase().includes('transaksi') &&
      !title.toLowerCase().includes('payment'));

  // Ekstraksi tabel dari feature_breakdown
  const detectedTables: Array<{
    name: string;
    columns: Array<{ name: string; type: string; isPk?: boolean; isFk?: boolean; refTable?: string }>;
  }> = [];

  const tableNamesFound: string[] = [];

  featureBreakdown.forEach((f) => {
    if (f.tech_mapping?.db_tables && Array.isArray(f.tech_mapping.db_tables)) {
      f.tech_mapping.db_tables.forEach((t: string) => {
        const clean = t.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (clean && !tableNamesFound.includes(clean)) {
          tableNamesFound.push(clean);
        }
      });
    }
  });

  // Jika belum ada tabel, bangun dari nama fitur
  if (tableNamesFound.length === 0) {
    tableNamesFound.push('users');
    featureBreakdown.slice(0, 5).forEach((f, idx) => {
      const words = f.name?.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
      const name = words && words.length > 0 ? words[words.length - 1].replace(/[^a-z0-9]/g, '') : `modul_${idx + 1}`;
      if (name && !tableNamesFound.includes(name)) tableNamesFound.push(name);
    });
  }

  if (!tableNamesFound.some((t) => t.includes('user') || t.includes('admin') || t.includes('pengguna'))) {
    tableNamesFound.unshift('users');
  }

  const selectedTables = tableNamesFound.slice(0, 6);

  // Buat metadata kolom yang kaya & spesifik domain untuk tiap tabel
  selectedTables.forEach((tName) => {
    const isUserTable = tName.includes('user') || tName.includes('admin') || tName.includes('pengguna');
    const cols: Array<{ name: string; type: string; isPk?: boolean; isFk?: boolean; refTable?: string }> = [
      { name: 'id', type: 'uuid', isPk: true },
    ];

    if (isUserTable) {
      cols.push(
        { name: 'email', type: 'string' },
        { name: 'full_name', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'avatar_url', type: 'string' },
        { name: 'status', type: 'string' }
      );
    } else {
      // Kolom spesifik domain
      cols.push({ name: 'user_id', type: 'uuid', isFk: true, refTable: 'users' });

      if (tName.includes('order') || tName.includes('transaksi') || tName.includes('rental') || tName.includes('booking')) {
        cols.push(
          { name: 'code', type: 'string' },
          { name: 'total_amount', type: 'numeric' },
          { name: 'status', type: 'string' },
          { name: 'payment_method', type: 'string' },
          { name: 'notes', type: 'text' }
        );
      } else if (tName.includes('product') || tName.includes('item') || tName.includes('alat') || tName.includes('layanan') || tName.includes('course')) {
        cols.push(
          { name: 'title', type: 'string' },
          { name: 'description', type: 'text' },
          { name: 'price', type: 'numeric' },
          { name: 'is_active', type: 'boolean' }
        );
      } else if (tName.includes('category') || tName.includes('kategori')) {
        cols.push(
          { name: 'name', type: 'string' },
          { name: 'slug', type: 'string' },
          { name: 'description', type: 'text' }
        );
      } else {
        cols.push(
          { name: 'name', type: 'string' },
          { name: 'status', type: 'string' },
          { name: 'metadata', type: 'json' }
        );
      }
    }

    cols.push({ name: 'created_at', type: 'datetime' });
    detectedTables.push({ name: tName, columns: cols });
  });

  if (hasGenericErd) {
    let erd = `erDiagram\n`;
    for (let i = 1; i < detectedTables.length; i++) {
      const p = detectedTables[0].name.toUpperCase();
      const c = detectedTables[i].name.toUpperCase();
      erd += `  ${p} ||--o{ ${c} : relates_to\n`;
    }
    if (detectedTables.length >= 4) {
      erd += `  ${detectedTables[1].name.toUpperCase()} ||--o{ ${detectedTables[2].name.toUpperCase()} : contains\n`;
    }

    detectedTables.forEach((t) => {
      const u = t.name.toUpperCase();
      erd += `  ${u} {\n`;
      t.columns.forEach((col) => {
        const pk = col.isPk ? ' PK' : col.isFk ? ' FK' : '';
        erd += `    ${col.type} ${col.name}${pk}\n`;
      });
      erd += `  }\n`;
    });
    result.database_erd = erd;
  }

  // Generate / Lengkapi SQL Migration Script jika belum ada
  if (!result.sql_migration_script || result.sql_migration_script.trim().length < 50) {
    result.sql_migration_script = synthesizeProductionSqlMigration(title, detectedTables);
  }

  // 2. User Journey Flow: comprehensive branch-aware journey
  const hasGenericJourney =
    !result.user_journey_flow ||
    (result.user_journey_flow.includes('Punya Akun') &&
      result.user_journey_flow.includes('Gunakan Fitur Utama')) ||
    result.user_journey_flow.trim().length < 100;

  if (hasGenericJourney) {
    const f1 = featureBreakdown[0]?.name?.replace(/["'[\]]/g, '').slice(0, 24) || 'Pilih Layanan';
    const f2 = featureBreakdown[1]?.name?.replace(/["'[\]]/g, '').slice(0, 24) || 'Validasi Data';
    const f3 = featureBreakdown[2]?.name?.replace(/["'[\]]/g, '').slice(0, 24) || 'Konfirmasi Transaksi';

    const journey = `flowchart TD
  Start([Pengunjung Masuk]) --> Landing[Akses Halaman Utama / Landing Page]
  Landing --> RoleCheck{Status Pengguna}
  
  RoleCheck -->|Guest / Pelanggan| Auth[Login / Registrasi Akun]
  RoleCheck -->|Admin / Operator| AdminPanel[Dashboard Back-Office & Rekonsiliasi]

  Auth --> CoreCanvas[Kanvas Kerja: ${f1}]
  CoreCanvas --> FormAction[Form Input & ${f2}]
  FormAction --> Validation{Validasi Data & Kuota}

  Validation -->|Gagal / Bentrok| ErrorHandle[Notifikasi Error & Saran Perbaikan]
  ErrorHandle --> FormAction

  Validation -->|Lolos Validasi| TxModal[${f3}]
  TxModal --> PaymentAction{Eksekusi Aksi / Pembayaran}

  PaymentAction -->|Timeout / Batal| Rollback[Batal & Lepaskan Kunci Slot]
  PaymentAction -->|Berhasil| Success[Status Berhasil & Mutasi Database]

  Success --> DispatchWA[Dispatch Notifikasi Otomatis / Bukti Digital]
  Success --> SyncAdmin[Sinkronisasi Realtime ke Dashboard Pengelola]
  DispatchWA --> Complete([Selesai])
  SyncAdmin --> Complete`;

    result.user_journey_flow = journey;
  }

  // 3. System Flowchart: check if existing is empty
  if (!result.system_flowchart) {
    const archName = archetypeDetection?.archetype || 'Layanan Web Modern';
    result.system_flowchart = `graph TD
  Client([Klien Pengguna]) --> WebUI[Frontend UI Responsif]
  WebUI --> APIRoutes[Backend API Endpoints]
  APIRoutes --> CoreLogic[Logika Bisnis ${archName.slice(0, 20)}]
  CoreLogic --> MainDB[(Database Utama)]
  CoreLogic --> ExtServices[Integrasi Layanan & Notifikasi]`;
  }

  return result;
}

/**
 * Menghasilkan paket prompt desain UI/UX (Stitch AI, v0.dev, Figma AI) yang dinamis,
 * didasarkan pada perpaduan: Core Features, Skema Database SQL, Persona Pengguna, dan Psikologi Warna Industri.
 */
export function synthesizeUIDesignPrompts(prd: any): Array<{
  id: string;
  screen_name: string;
  category: 'dashboard' | 'core_flow' | 'crud_management' | 'auth_settings';
  description: string;
  wireframe_summary: string;
  target_roles: string[];
  v0_prompt: string;
  stitch_prompt: string;
}> {
  const title = prd.title || 'Aplikasi Web Modern';
  const archetype = prd.archetype_detection?.archetype || 'Software Arsitektur Modern';
  const targetAudience = prd.archetype_detection?.target_audience || 'Pengguna profesional dan tim operasional';
  const features: any[] = Array.isArray(prd.feature_breakdown) ? prd.feature_breakdown : [];
  const primaryFeature = features[0]?.name || 'Manajemen Data & Operasi Inti';
  const secondaryFeature = features[1]?.name || 'Detail Transaksi & Riwayat';

  const screens: Array<{
    id: string;
    screen_name: string;
    category: 'dashboard' | 'core_flow' | 'crud_management' | 'auth_settings';
    description: string;
    wireframe_summary: string;
    target_roles: string[];
    v0_prompt: string;
    stitch_prompt: string;
  }> = [
    // 1. Dashboard Utama / Command Center
    {
      id: 'screen_dashboard',
      screen_name: 'Dashboard Utama & Ringkasan Metrik',
      category: 'dashboard',
      description: `Pusat komando operasional ${title} untuk memantau ringkasan metrik real-time, status sistem, dan pintasan alur kerja utama.`,
      wireframe_summary: '[Top Header: Breadcrumb & User Avatar] -> [Stat Cards Grid: 4 Metric Cards] -> [Main Panel: Analytics Chart & Activity Stream] -> [Quick Action Bar]',
      target_roles: ['Pengguna Utama', 'Administrator'],
      v0_prompt: `Build a modern, high-polish web application dashboard for "${title}" (${archetype}).
Framework: Next.js 15 App Router, React 19, Tailwind CSS, Lucide React icons, and shadcn/ui primitives.
Design Style: Premium dark-mode developer aesthetic inspired by Linear and Supabase (#090A0F background, #0E111A card surfaces, subtle 1px border with #27272A).

Page Layout:
1. Header Bar: Sticky top navigation with breadcrumbs, global search (Cmd+K shortcut pill), realtime online status pulse dot (emerald-400), and user profile dropdown.
2. Metrics Overview: 4-column responsive grid featuring key operational stats for ${targetAudience} (Total Volume, Active Records, Pending Actions, Success Rate) with percentage growth badges.
3. Central Analytics Section: Split 2-column view with a smooth area line chart for weekly throughput trends, and a live recent activity feed with timestamp badges and user avatars.
4. Quick Actions: Clean icon buttons to quickly create new entries, export summary reports, or access system settings.

Interactions: Smooth hover lift on cards (-1px), active click feedback, and skeleton shimmer placeholders during data loading. Zero emojis, use Lucide React icons exclusively.`,
      stitch_prompt: `Platform: Stitch AI / Galileo AI / Figma AI
Project: ${title} — Main Dashboard
Domain Archetype: ${archetype}
Target Audience: ${targetAudience}

Design Specifications:
- Canvas Frame: Desktop 1440x900px, 12-column grid layout, 24px gutter, 32px outer padding.
- Color Palette: Dark mode foundation (#07080B canvas, #0C0E14 elevated card surfaces, #27272A subtle borders, #F59E0B primary accent amber, #10B981 success emerald).
- Typography Hierarchy: Inter / Geist Sans. Header H1 (28px bold tracking-tight), Metric Numbers (32px font-mono bold), Body (14px regular text-zinc-300), Captions/Badges (11px font-mono).
- Component Structure:
  * Top Navigation (Height 64px) with logo branding, search field, notifications icon button, and user avatar.
  * 4 Stat Cards Grid displaying numeric KPI metrics with mini sparkline indicators.
  * Main Content Canvas displaying weekly trend charts and recent transactions table.
- Interaction States: Default state, Card hover glow state, and empty-state illustration placeholder.`,
    },

    // 2. Layar Fitur Inti (Core Workflow & Data Management)
    {
      id: 'screen_core_workflow',
      screen_name: `Workspace Fitur: ${primaryFeature}`,
      category: 'core_flow',
      description: `Layar kerja utama untuk mengeksekusi fitur inti "${primaryFeature}" dengan filter data multi-kondisi, tabel interaktif, dan aksi baris.`,
      wireframe_summary: '[Header Bar: Title & "Buat Baru" Button] -> [Filter & Search Toolbar] -> [Interactive Data Table with Status Badges] -> [Row Action Buttons & Pagination]',
      target_roles: ['Operator', 'Pengguna Aktif'],
      v0_prompt: `Build a production-grade data management and workflow interface for "${primaryFeature}" in "${title}".
Framework: Next.js 15, React 19, Tailwind CSS, Lucide React icons, and shadcn/ui (Table, DropdownMenu, Badge, Input, Button).
Design System: Clean dark surface (#090A0F) with high-contrast readable typography and amber-500 accent (#F59E0B).

Layout & Components:
1. Section Header: Title "${primaryFeature}", description subtitle, and primary CTA button ("+ Tambah Baru") in amber-500 with hover shine.
2. Filter & Search Toolbar: Integrated search input with debounce, status filter segmented pills (All, Active, Pending, Completed), and date range picker button.
3. Interactive Data Table:
   - Columns matching database schema: Code/ID (monospace), Name/Title, Assigned User, Amount/Quantity, Status Badge, and Actions (... menu).
   - Status Badges: Color-coded with subtle background (Emerald for Completed/Active, Amber for Pending, Rose for Failed).
   - Hover row highlight effect (bg-white/[0.02]) with checkbox row selection for batch processing.
4. Footer Pagination: Showing 1-10 of total records with previous/next buttons and page size selector.

Interactions: Realtime search filtering, empty state illustrated placeholder when no records match, and toast feedback on row actions.`,
      stitch_prompt: `Platform: Stitch AI / Galileo AI / Figma AI
Project: ${title} — Core Workflow Screen (${primaryFeature})
Archetype: ${archetype}

Design Specifications:
- Canvas Frame: Desktop 1440x900px, responsive data table view.
- Color Tokens: Deep Slate (#090A0F), Card Layer (#0E1118), Border (#27272A), Primary Accent (#F59E0B), Muted Text (#A1A1AA).
- Typography: Geist Sans & Geist Mono. Table headers 12px uppercase font-mono tracking-wider text-zinc-400. Table cells 13px font-medium text-zinc-200.
- Key Screen Elements:
  * Top bar with breadcrumb trail and "+ Tambah Data" primary action.
  * Search bar with filter dropdown chips.
  * Structured data table with 6 realistic populated rows.
  * Batch action floating bar appearing when rows are checked.
- States Required: Populated table state, Empty filter results state, and loading shimmer skeleton rows.`,
    },

    // 3. Layar Modal Aksi / Checkout / Form Input Cepat
    {
      id: 'screen_modal_action',
      screen_name: `Modal Aksi: ${secondaryFeature}`,
      category: 'crud_management',
      description: `Modal dialog interaktif terarah untuk memproses input data atau konfirmasi transaksi pada "${secondaryFeature}".`,
      wireframe_summary: '[Centered Modal Dialog with Backdrop Blur] -> [Form Fields Grid with Validation Rules] -> [Live Calculation Summary Box] -> [Submit & Cancel Actions]',
      target_roles: ['Pengguna', 'Operator'],
      v0_prompt: `Build an elegant, production-grade interactive modal dialog for "${secondaryFeature}" in "${title}".
Framework: Next.js 15, Tailwind CSS, Lucide React icons, and shadcn/ui Dialog/Sheet component.
Design Style: Dark-mode glassmorphic modal overlay (backdrop-blur-md bg-black/80, modal card #0C0E14 border border-zinc-800 rounded-2xl p-6).

Components:
1. Modal Header: Title "${secondaryFeature}", descriptive subtitle, and top-right close icon button (X).
2. Form Fields (2-column layout on desktop):
   - Structured inputs with clear labels, placeholder text, and subtle focus ring (focus:ring-2 focus:ring-amber-500/40).
   - Dropdown select for category/status options with clean chevron indicators.
   - Numeric/Currency field with prefix formatting.
3. Summary & Verification Card: Embedded mini card showing live calculation/breakdown and policy notes (e.g. security verification, processing fee).
4. Footer Actions: Left-aligned secondary "Batal" button and right-aligned primary "Konfirmasi & Simpan" button with spinner loading state on submit.

Form Validation: Clear inline error messages in rose-400 when fields are invalid. Zero emojis.`,
      stitch_prompt: `Platform: Stitch AI / Galileo AI / Figma AI
Project: ${title} — Modal Action & Transaction Flow (${secondaryFeature})
Design Tokens:
- Canvas Frame: 1440x900px with centered modal window (width 560px, rounded-2xl, elevation shadow-2xl).
- Visual Aesthetics: Dark luxury developer theme. Modal background #0C0E14, border #27272A, inputs #12151E, primary button #F59E0B.
- Elements: Modal title, 4 input fields with floating labels, calculation breakdown box, and action buttons.
- States Required: Default form state, Active focused input state, and Validation error message state.`,
    },
  ];

  return screens;
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
  const architecture_diagrams = synthesizeDynamicArchitectureDiagrams(
    title,
    archetype_detection,
    feature_breakdown,
    raw.architecture_diagrams
  );

  // 12. Tech Stack & Metadata preservation with robust extraction
  let tech_stack: any = undefined;
  if (raw.tech_stack && typeof raw.tech_stack === "object") {
    const rawTs = raw.tech_stack;
    const extractName = (val: any): string | undefined => {
      if (!val) return undefined;
      if (typeof val === 'string') return val.trim();
      if (typeof val === 'object') {
        const candidate = val.name || val.title || val.label || val.value;
        if (candidate && typeof candidate === 'string') return candidate.trim();
      }
      return undefined;
    };

    tech_stack = {
      name: typeof rawTs.name === 'string' ? rawTs.name : undefined,
      version: typeof rawTs.version === 'string' ? rawTs.version : undefined,
      description: typeof rawTs.description === 'string' ? rawTs.description : undefined,
      templateId: typeof rawTs.templateId === 'string' ? rawTs.templateId : undefined,
      language: typeof rawTs.language === 'string' ? rawTs.language : undefined,
      frontend: extractName(rawTs.frontend) || (typeof rawTs.frontend === 'string' ? rawTs.frontend : undefined),
      backend: extractName(rawTs.backend) || (typeof rawTs.backend === 'string' ? rawTs.backend : undefined),
      database: extractName(rawTs.database) || (typeof rawTs.database === 'string' ? rawTs.database : undefined),
      deployment: extractName(rawTs.deployment) || (typeof rawTs.deployment === 'string' ? rawTs.deployment : undefined),
    };
  }
  const metadata = raw.metadata && typeof raw.metadata === "object" ? raw.metadata : undefined;

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
    tech_stack,
    metadata,
  };

  try {
    return PRDOutputZodSchema.parse(normalizedPayload);
  } catch (zodErr) {
    console.warn("PRDOutputZodSchema parse warning, applying sanitized payload fallback:", zodErr);
    return normalizedPayload as any;
  }
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

    let recommendedOptionId = typeof q.recommendedOptionId === "string" && q.recommendedOptionId.trim()
      ? q.recommendedOptionId.trim()
      : "";

    const rawRecIds = Array.isArray(q.recommendedOptionIds) ? q.recommendedOptionIds : [];
    const recommendedOptionIdsSet = new Set<string>(rawRecIds.filter((id: any) => typeof id === "string" && id.trim()));
    if (recommendedOptionId) {
      recommendedOptionIdsSet.add(recommendedOptionId);
    }

    const options = rawOptions.map((opt: any, oIdx: number) => {
      if (typeof opt === "string") {
        const fallbackId = `opt_${idx + 1}_${oIdx + 1}`;
        const isRec = oIdx === 0 || recommendedOptionIdsSet.has(fallbackId);
        return {
          id: fallbackId,
          label: opt.trim(),
          description: undefined,
          isRecommended: isRec,
          recommendationReason: isRec ? "Standar Industri" : undefined,
          badge: isRec ? "Rekomendasi" : undefined,
        };
      }
      const optId = typeof opt?.id === "string" && opt.id.trim() ? opt.id.trim() : `opt_${idx + 1}_${oIdx + 1}`;
      const isRec = Boolean(opt?.isRecommended) || recommendedOptionIdsSet.has(optId) || (recommendedOptionId === optId);
      const recReason = typeof opt?.recommendationReason === "string" && opt.recommendationReason.trim()
        ? opt.recommendationReason.trim()
        : isRec ? "Rekomendasi Utama" : undefined;
      const badge = typeof opt?.badge === "string" && opt.badge.trim()
        ? opt.badge.trim()
        : isRec ? (recReason || "Rekomendasi") : undefined;

      return {
        id: optId,
        label: typeof opt?.label === "string" && opt.label.trim() ? opt.label.trim() : `Opsi ${oIdx + 1}`,
        description: typeof opt?.description === "string" && opt.description.trim() ? opt.description.trim() : undefined,
        isRecommended: isRec,
        recommendationReason: recReason,
        badge,
      };
    });

    // Ensure at least 2 options exist
    if (options.length === 0) {
      options.push(
        { id: `opt_${idx + 1}_1`, label: "Opsi Rekomendasi Utama", description: "Pilihan standar industri terbaik", isRecommended: true, recommendationReason: "Standar Industri", badge: "Rekomendasi" },
        { id: `opt_${idx + 1}_2`, label: "Opsi Alternatif Fleksibel", description: "Disesuaikan kebutuhan khusus", isRecommended: false }
      );
    }

    // Set first option as recommended if none is marked
    if (!options.some((o: any) => o.isRecommended)) {
      options[0].isRecommended = true;
      options[0].recommendationReason = "Rekomendasi Utama";
      options[0].badge = "Rekomendasi";
    }

    if (!recommendedOptionId || !options.some((o: any) => o.id === recommendedOptionId)) {
      const firstRec = options.find((o: any) => o.isRecommended) || options[0];
      recommendedOptionId = firstRec.id;
    }

    const finalRecIds = options.filter((o: any) => o.isRecommended).map((o: any) => o.id);

    return {
      id,
      category,
      question,
      isMultiSelect,
      inputType,
      options,
      recommendedOptionId,
      recommendedOptionIds: finalRecIds,
    };
  });

  const parsed = ClarificationOutputZodSchema.parse({ questions: sanitized });
  return parsed.questions;
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE TREE MODULES SCHEMA & SANITIZER
// ─────────────────────────────────────────────────────────────────────────────

export interface FeatureTreeModuleOutput {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'auth' | 'data' | 'integration' | 'admin' | 'ai_agent';
  complexity: 'Rendah' | 'Sedang' | 'Tinggi';
  phase: string;
  subFeatures: string[];
  enabled: boolean;
}

export const geminiFeatureTreeResponseSchema = {
  type: "object",
  properties: {
    modules: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          category: {
            type: "string",
            enum: ["core", "auth", "data", "integration", "admin", "ai_agent"],
          },
          complexity: {
            type: "string",
            enum: ["Rendah", "Sedang", "Tinggi"],
          },
          phase: { type: "string" },
          subFeatures: {
            type: "array",
            items: { type: "string" },
          },
          enabled: { type: "boolean" },
        },
        required: ["id", "name", "description", "category", "complexity", "phase", "subFeatures"],
      },
    },
  },
  required: ["modules"],
};

export function normalizeAndSanitizeFeatureModules(raw: any): FeatureTreeModuleOutput[] {
  let list: any[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && Array.isArray(raw.modules)) {
    list = raw.modules;
  } else if (raw && Array.isArray(raw.data)) {
    list = raw.data;
  }

  if (list.length === 0) {
    return [];
  }

  const validCategories = new Set(['core', 'auth', 'data', 'integration', 'admin', 'ai_agent']);
  const validComplexities = new Set(['Rendah', 'Sedang', 'Tinggi']);

  return list.map((item, idx) => {
    const id = typeof item?.id === 'string' && item.id.trim() ? item.id.trim() : `mod_${idx + 1}`;
    const name = typeof item?.name === 'string' && item.name.trim() ? item.name.trim() : `Modul ${idx + 1}`;
    const description = typeof item?.description === 'string' && item.description.trim()
      ? item.description.trim()
      : `Pengelolaan alur dan fungsi untuk ${name}.`;

    let category = item?.category;
    if (!validCategories.has(category)) {
      if (idx === 0) category = 'auth';
      else if (idx === list.length - 1) category = 'admin';
      else category = 'core';
    }

    let complexity = item?.complexity;
    if (!validComplexities.has(complexity)) {
      complexity = idx === 1 ? 'Tinggi' : 'Sedang';
    }

    let phase = typeof item?.phase === 'string' && item.phase.trim() ? item.phase.trim().toUpperCase() : `FASE ${Math.min(idx + 1, 4)}`;
    if (!phase.startsWith('FASE')) {
      phase = `FASE ${Math.min(idx + 1, 4)}`;
    }

    let subFeatures: string[] = [];
    if (Array.isArray(item?.subFeatures)) {
      subFeatures = item.subFeatures
        .map((s: any) => (typeof s === 'string' ? s.trim() : ''))
        .filter((s: string) => s.length > 0);
    }

    if (subFeatures.length === 0) {
      subFeatures = [
        `Antarmuka ${name} Responsif`,
        `API Handler & Validasi Aturan Bisnis`,
        `Penyimpanan Skema Relasional & Audit Log`,
      ];
    }

    return {
      id,
      name,
      description,
      category: category as any,
      complexity: complexity as any,
      phase,
      subFeatures,
      enabled: item?.enabled !== false,
    };
  });
}

export function synthesizeDomainFeatureModules(
  idea: string,
  answers: Record<string, string[]> = {},
  questions: Array<{ id: string; category: string; question: string }> = []
): FeatureTreeModuleOutput[] {
  // Extract user choices
  const getAns = (keys: string[]): string[] => {
    for (const q of questions) {
      if (keys.some((k) => q.category.toLowerCase().includes(k) || q.id.toLowerCase().includes(k))) {
        const val = answers[q.id];
        if (val && val.length > 0) {
          const filtered = val.filter((a) => a !== '[Dilewati oleh user]');
          if (filtered.length > 0) return filtered;
        }
      }
    }
    return [];
  };

  const coreAns = getAns(['core_flow', 'alur', 'transaksi', 'layanan']);
  const rolesAns = getAns(['user_roles', 'role', 'aktor', 'struktur']);
  const integrasiAns = getAns(['integrations', 'integrasi', 'hardware', 'ekspedisi']);
  const featuresAns = getAns(['feature_priority', 'modul', 'mvp', 'fitur']);

  const modules: FeatureTreeModuleOutput[] = [];

  // FASE 1: Auth & App Shell
  modules.push({
    id: 'mod_auth',
    name: 'Autentikasi & Hak Akses Peran',
    description: `Sistem kredensial aman dengan segregasi peran: ${rolesAns.length > 0 ? rolesAns.join(', ') : 'Admin & Pengguna'}.`,
    category: 'auth',
    complexity: 'Sedang',
    phase: 'FASE 1',
    enabled: true,
    subFeatures: [
      'Login & Registrasi Kredensial (JWT / OAuth Google)',
      `Otorisasi Berjenjang (${rolesAns.length > 0 ? rolesAns.join(', ') : 'Super Admin, Operator, User'})`,
      'Manajemen Sesi Aman & Refresh Token',
      'Profil Pengguna & Keamanan Kata Sandi',
    ],
  });

  // FASE 2: Core Business Workflow (derived directly from idea & answers)
  const coreSubFeatures: string[] = [];
  if (coreAns.length > 0) {
    coreSubFeatures.push(...coreAns.map((a) => `Alur Operasional: ${a}`));
  }
  if (featuresAns.length > 0) {
    coreSubFeatures.push(...featuresAns.slice(0, 2));
  }
  if (coreSubFeatures.length < 3) {
    coreSubFeatures.push(
      `Formulir Pemrosesan & Input Data ${idea.slice(0, 24)}`,
      'Kalkulasi Bisnis & Validasi State Transaksi',
      'Pelacakan Riwayat & Status Real-Time'
    );
  }

  modules.push({
    id: 'mod_core',
    name: `Alur Bisnis Inti (${idea.length > 30 ? idea.slice(0, 27) + '...' : idea})`,
    description: 'Mesin eksekusi proses bisnis utama aplikasi yang menjamin kelancaran transaksi pengguna.',
    category: 'core',
    complexity: 'Tinggi',
    phase: 'FASE 2',
    enabled: true,
    subFeatures: coreSubFeatures.slice(0, 4),
  });

  // FASE 2/3: Data Management
  modules.push({
    id: 'mod_data',
    name: 'Katalog & Manajemen Data Relasional',
    description: 'Pengelolaan entitas master data, pencarian multi-kriteria, dan validasi integritas database.',
    category: 'data',
    complexity: 'Sedang',
    phase: 'FASE 2',
    enabled: true,
    subFeatures: [
      'Pencarian Cepat & Filter Multi-Kriteria',
      'Detail Entitas & Riwayat Modifikasi Data',
      'Validasi Skema Zod & Sanitasi Payload',
      'Integritas Relasi PostgreSQL / Supabase RLS',
    ],
  });

  // FASE 3: Integration & Notifications
  const integrationSubFeatures = integrasiAns.length > 0
    ? integrasiAns.map((i) => `Integrasi: ${i}`)
    : ['Webhook & Dispatch Event Eksternal', 'Notifikasi Email / WhatsApp Realtime', 'Fallback Mode & Log Error Terpusat'];

  modules.push({
    id: 'mod_integration',
    name: 'Pusat Integrasi & Notifikasi Otomatis',
    description: `Konektor layanan pihak ketiga (${integrasiAns.join(', ') || 'Payment & Notifikasi'}) dengan penanganan failover.`,
    category: 'integration',
    complexity: 'Sedang',
    phase: 'FASE 3',
    enabled: true,
    subFeatures: integrationSubFeatures.slice(0, 4),
  });

  // FASE 4: Admin Dashboard & Reports
  modules.push({
    id: 'mod_admin',
    name: 'Dasbor Operator & Laporan Analitik',
    description: 'Pusat kontrol operasional bagi pengelola sistem untuk memantau performa bisnis dan audit log.',
    category: 'admin',
    complexity: 'Sedang',
    phase: 'FASE 4',
    enabled: true,
    subFeatures: [
      'Ringkasan Metrik KPI & Grafik Kinerja',
      'Panel Manajemen Akun & Pengaturan Sistem',
      'Audit Trail Riwayat Mutasi Data Kritis',
      'Ekspor Laporan (Format CSV / PDF)',
    ],
  });

  return modules;
}

