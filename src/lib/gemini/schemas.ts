import { z } from "zod";

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
