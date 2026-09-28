import { z } from "zod";
import { DeepFeatureZodSchema } from "./schemas";

// ══════════════════════════════════════════════════════════════════════════════
// TAHAP 1: PRODUCT BRIEF & KEY DECISIONS (SSOT)
// ══════════════════════════════════════════════════════════════════════════════

export const stage1ResponseSchema = {
  type: "object",
  properties: {
    product_brief: {
      type: "object",
      properties: {
        app_title: { type: "string" },
        domain: { type: "string" },
        core_problem: { type: "string" },
        target_persona: {
          type: "object",
          properties: {
            primary_user: { type: "string" },
            secondary_user: { type: "string" },
            role_description: { type: "string" },
          },
          required: ["primary_user"],
        },
        core_user_flow_summary: { type: "string" },
        domain_glossary: {
          type: "array",
          items: {
            type: "object",
            properties: {
              term: { type: "string" },
              definition: { type: "string" },
            },
            required: ["term", "definition"],
          },
        },
        banned_terms: {
          type: "array",
          items: { type: "string" },
        },
        mvp_scope: {
          type: "array",
          items: { type: "string" },
        },
        out_of_scope: {
          type: "array",
          items: { type: "string" },
        },
        explicit_assumptions: {
          type: "array",
          items: { type: "string" },
        },
        archetype: { type: "string" },
        ui_personality: { type: "string" },
        color_theme: {
          type: "object",
          properties: {
            primary: { type: "string" },
            secondary: { type: "string" },
            accent: { type: "string" },
            background_mood: { type: "string" },
          },
          required: ["primary", "secondary", "accent", "background_mood"],
        },
        has_dashboard: { type: "boolean" },
      },
      required: [
        "app_title",
        "domain",
        "core_problem",
        "target_persona",
        "core_user_flow_summary",
        "domain_glossary",
        "banned_terms",
        "mvp_scope",
        "out_of_scope",
        "explicit_assumptions",
        "archetype",
        "ui_personality",
        "color_theme",
        "has_dashboard",
      ],
    },
    key_decisions: {
      type: "object",
      properties: {
        tech_stack: {
          type: "object",
          properties: {
            frontend: { type: "string" },
            backend: { type: "string" },
            database: { type: "string" },
            deployment: { type: "string" },
            styling: { type: "string" },
            package_manager: { type: "string" },
          },
          required: ["frontend", "backend", "database", "deployment", "styling", "package_manager"],
        },
        auth_system: {
          type: "object",
          properties: {
            provider: { type: "string" },
            session_strategy: { type: "string" },
            user_table_id_type: { type: "string" },
          },
          required: ["provider", "session_strategy", "user_table_id_type"],
        },
        storage_system: {
          type: "object",
          properties: {
            provider: { type: "string" },
            codec_or_format: { type: "string" },
            retention_policy: { type: "string" },
          },
          required: ["provider", "retention_policy"],
        },
        export_libraries: {
          type: "array",
          items: { type: "string" },
        },
        phase_strategy: {
          type: "object",
          properties: {
            mvp_phase_name: { type: "string" },
            next_phase_name: { type: "string" },
          },
          required: ["mvp_phase_name", "next_phase_name"],
        },
      },
      required: ["tech_stack", "auth_system", "storage_system", "export_libraries", "phase_strategy"],
    },
  },
  required: ["product_brief", "key_decisions"],
};

export const Stage1ZodSchema = z.object({
  product_brief: z.object({
    app_title: z.string(),
    domain: z.string(),
    core_problem: z.string(),
    target_persona: z.object({
      primary_user: z.string(),
      secondary_user: z.string().optional().default(""),
      role_description: z.string().optional().default(""),
    }),
    core_user_flow_summary: z.string(),
    domain_glossary: z.array(
      z.object({
        term: z.string(),
        definition: z.string(),
      })
    ).default([]),
    banned_terms: z.array(z.string()).default([]),
    mvp_scope: z.array(z.string()).default([]),
    out_of_scope: z.array(z.string()).default([]),
    explicit_assumptions: z.array(z.string()).default([]),
    archetype: z.string(),
    ui_personality: z.string(),
    color_theme: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
      background_mood: z.string(),
    }),
    has_dashboard: z.boolean().default(false),
  }),
  key_decisions: z.object({
    tech_stack: z.object({
      frontend: z.string(),
      backend: z.string(),
      database: z.string(),
      deployment: z.string(),
      styling: z.string().default("Tailwind CSS"),
      package_manager: z.string().default("npm / bun"),
    }),
    auth_system: z.object({
      provider: z.string(),
      session_strategy: z.string(),
      user_table_id_type: z.string().default("uuid"),
    }),
    storage_system: z.object({
      provider: z.string(),
      codec_or_format: z.string().optional().default(""),
      retention_policy: z.string(),
    }),
    export_libraries: z.array(z.string()).default([]),
    phase_strategy: z.object({
      mvp_phase_name: z.string().default("Fase 1 (MVP)"),
      next_phase_name: z.string().default("Fase 2 (Pasca-MVP)"),
    }),
  }),
});

// ══════════════════════════════════════════════════════════════════════════════
// TAHAP 2: REQUIREMENTS, OVERVIEW & CORE FEATURES
// ══════════════════════════════════════════════════════════════════════════════

export const stage2ResponseSchema = {
  type: "object",
  properties: {
    opportunity_framing: {
      type: "object",
      properties: {
        core_problem: { type: "string" },
        working_hypothesis: { type: "string" },
        strategy_fit: { type: "string" },
      },
      required: ["core_problem", "working_hypothesis", "strategy_fit"],
    },
    success_measurement: {
      type: "object",
      properties: {
        product_kpis: { type: "array", items: { type: "string" } },
        technical_slos: { type: "array", items: { type: "string" } },
        offline_golden_set: { type: "string" },
        human_review: { type: "string" },
        online_metrics: { type: "string" },
      },
      required: ["product_kpis", "technical_slos", "offline_golden_set", "human_review", "online_metrics"],
    },
    boundaries: {
      type: "object",
      properties: {
        scope: { type: "array", items: { type: "string" } },
        non_goals: { type: "array", items: { type: "string" } },
      },
      required: ["scope", "non_goals"],
    },
    assumptions_and_constraints: {
      type: "object",
      properties: {
        in_scope_assumptions: { type: "array", items: { type: "string" } },
        out_of_scope_constraints: { type: "array", items: { type: "string" } },
      },
      required: ["in_scope_assumptions", "out_of_scope_constraints"],
    },
    risk_management: {
      type: "object",
      properties: {
        detection: { type: "string" },
        fallback_kill_switch: { type: "string" },
        api_costs_and_quotas: { type: "string" },
        data_privacy_and_security: { type: "string" },
        data_retention_policy: { type: "string" },
        third_party_failure_mitigation: { type: "string" },
      },
      required: [
        "detection",
        "fallback_kill_switch",
        "api_costs_and_quotas",
        "data_privacy_and_security",
        "data_retention_policy",
        "third_party_failure_mitigation",
      ],
    },
    feature_breakdown: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          phase: { type: "string" },
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
            required: ["frontend_components", "api_endpoints", "db_tables"],
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
          "tech_mapping",
          "agent_prompt",
        ],
      },
    },
  },
  required: [
    "opportunity_framing",
    "success_measurement",
    "boundaries",
    "assumptions_and_constraints",
    "risk_management",
    "feature_breakdown",
  ],
};

export const Stage2ZodSchema = z.object({
  opportunity_framing: z.object({
    core_problem: z.string(),
    working_hypothesis: z.string(),
    strategy_fit: z.string(),
  }),
  success_measurement: z.object({
    product_kpis: z.array(z.string()).default([]),
    technical_slos: z.array(z.string()).default([]),
    offline_golden_set: z.string(),
    human_review: z.string(),
    online_metrics: z.string(),
  }),
  boundaries: z.object({
    scope: z.array(z.string()).default([]),
    non_goals: z.array(z.string()).default([]),
  }),
  assumptions_and_constraints: z.object({
    in_scope_assumptions: z.array(z.string()).default([]),
    out_of_scope_constraints: z.array(z.string()).default([]),
  }),
  risk_management: z.object({
    detection: z.string(),
    fallback_kill_switch: z.string(),
    api_costs_and_quotas: z.string().default(""),
    data_privacy_and_security: z.string().default(""),
    data_retention_policy: z.string().default(""),
    third_party_failure_mitigation: z.string().default(""),
  }),
  feature_breakdown: z.array(DeepFeatureZodSchema),
});

// ══════════════════════════════════════════════════════════════════════════════
// TAHAP 3: USER FLOW, ARCHITECTURE, DATABASE SCHEMA & TASK BREAKDOWN
// ══════════════════════════════════════════════════════════════════════════════

export const stage3ResponseSchema = {
  type: "object",
  properties: {
    user_flow_steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          step: { type: "integer" },
          title: { type: "string" },
          phase_tag: { type: "string" },
          description: { type: "string" },
        },
        required: ["step", "title", "phase_tag", "description"],
      },
    },
    roadmap_tree: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          phase: { type: "string" },
          status: { type: "string" },
          sub_features: { type: "array", items: { type: "string" } },
        },
        required: ["id", "title", "phase", "status", "sub_features"],
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
        system_components: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              role: { type: "string" },
              tech: { type: "string" },
              type: { type: "string" },
            },
            required: ["name", "role", "tech", "type"],
          },
        },
      },
      required: [
        "system_flowchart",
        "user_journey_flow",
        "database_erd",
        "sql_migration_script",
        "system_components",
      ],
    },
    task_breakdown: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "user_flow_steps",
    "roadmap_tree",
    "architecture_diagrams",
    "task_breakdown",
  ],
};

export const Stage3ZodSchema = z.object({
  user_flow_steps: z.array(
    z.object({
      step: z.number(),
      title: z.string(),
      phase_tag: z.string().default("Fase 1 (MVP)"),
      description: z.string(),
    })
  ).default([]),
  roadmap_tree: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      phase: z.string(),
      status: z.string().default("Direncanakan"),
      sub_features: z.array(z.string()).default([]),
    })
  ).default([]),
  architecture_diagrams: z.object({
    system_flowchart: z.string().optional().default(""),
    user_journey_flow: z.string().optional().default(""),
    database_erd: z.string().optional().default(""),
    sql_migration_script: z.string().optional().default(""),
    api_integration_matrix: z.string().optional().default(""),
    sequence_diagram: z.string().optional().default(""),
    infrastructure_topology: z.string().optional().default(""),
    rbac_permission_matrix: z.string().optional().default(""),
    data_pipeline_flow: z.string().optional().default(""),
    system_components: z.array(
      z.object({
        name: z.string(),
        role: z.string(),
        tech: z.string(),
        type: z.string().default("backend"),
      })
    ).default([]),
  }),
  task_breakdown: z.array(z.string()).default([]),
});
