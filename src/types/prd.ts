export interface PRDFormData {
  title?: string;
  opportunity_framing: {
    core_problem: string;
    working_hypothesis: string;
    strategy_fit?: string;
  };
  boundaries: {
    scope: string; // can be multi-line text in form, will be parsed into string[]
    non_goals: string;
  };
  success_measurement: {
    offline_golden_set?: string;
    human_review?: string;
    online_metrics: string;
  };
  rollout_plan: {
    exposure?: string;
    duration?: string;
    segments_gates?: string;
  };
  risk_management: {
    detection: string;
    fallback_kill_switch: string;
  };
  ownership_action: {
    primary_owner: string;
    decision_points?: string;
  };
  ai_specific: {
    behavior_contract: string; // user can describe good & reject
    guardrails: string;
  };
}

export interface DeepFeature {
  id: string;
  name: string;
  priority: 'P0' | 'P1';
  user_story: string;
  happy_path: string[];
  business_rules: string[];
  edge_cases: string[];
  tech_mapping: {
    frontend_components?: string[];
    api_endpoints?: string[];
    db_tables?: string[];
  };
  agent_prompt: string;
}

export interface ArchetypeDetection {
  archetype: string; // e.g. "Institusi / Profil Sekolah / Edukasi", "E-commerce / Katalog UMKM", "SaaS / B2B Web App", etc.
  target_audience: string;
  ui_personality: string;
  color_theme?: {
    primary: string;
    secondary: string;
    background_mood: string;
    accent: string;
  };
  has_dashboard: boolean;
}

export interface PRDOutput {
  title: string;
  archetype_detection?: ArchetypeDetection;
  opportunity_framing: {
    core_problem: string;
    working_hypothesis: string;
    strategy_fit: string;
  };
  boundaries: {
    scope: string[];
    non_goals: string[];
  };
  feature_breakdown?: DeepFeature[];
  success_measurement: {
    offline_golden_set: string;
    human_review: string;
    online_metrics: string;
  };
  rollout_plan: {
    exposure: string;
    duration: string;
    segments_gates: string;
  };
  risk_management: {
    detection: string;
    fallback_kill_switch: string;
  };
  ownership_action: {
    primary_owner: string;
    decision_points: string;
  };
  ai_specific: {
    behavior_contract: {
      good: string[];
      reject: string[];
    };
    guardrails: string[];
  };
  task_breakdown: string[];
  roadmap_tree?: RoadmapPhaseNode[];
  architecture_diagrams?: {
    system_flowchart?: string;        // Mermaid flowchart TD/LR
    user_journey_flow?: string;       // Mermaid flowchart LR / State diagram
    database_erd?: string;            // Mermaid erDiagram
    sql_migration_script?: string;    // Production-ready DDL SQL migration script
    api_integration_matrix?: string;  // Mermaid flowchart / classDiagram
    sequence_diagram?: string;        // Mermaid sequenceDiagram
    infrastructure_topology?: string; // Mermaid flowchart LR - Cloudflare, Nginx, Docker, DB, Cache
    rbac_permission_matrix?: string;  // Mermaid flowchart TD - RBAC roles & permissions
    data_pipeline_flow?: string;      // Mermaid flowchart LR - Data input, queue, worker, storage
  };
  sql_migration_script?: string;
  ui_design_prompts?: UIDesignPromptScreen[];
  tech_stack?: {
    name?: string;
    version?: string;
    description?: string;
    frontend?: string;
    backend?: string;
    database?: string;
    deployment?: string;
    templateId?: string;
    language?: string;
  };
  metadata?: {
    modelUsed: string;
    generatedAt: string;
    tokenUsage?: number;
    tokensUsed?: number;
    retries?: number;
    fallbackCount?: number;
    geminiSlotUsed?: string | null;
    isServerKey?: boolean;
    costEstimateRp?: number;
  };
}

export interface SubFeatureNode {
  id?: string;
  label: string;
  priority?: 'P0' | 'P1' | 'P2';
  children?: SubFeatureNode[];
}

export interface RoadmapPhaseNode {
  id: string;
  title: string;
  phase: "FASE 1" | "FASE 2" | "FASE 3" | "FASE 4" | string;
  status?: "Direncanakan" | "Sedang Dikerjakan" | "Selesai" | string;
  description?: string;
  icon?: string;
  sub_features: (string | SubFeatureNode)[];
}

export interface ClarificationOption {
  id: string;
  label: string;
  description?: string;
  isRecommended?: boolean;
  recommendationReason?: string;
  badge?: string;
}

export interface ClarificationQuestion {
  id: string;
  category:
    | "tech_stack"
    | "core_flow"
    | "scope_boundary"
    | "target_user"
    | "feature_priority"
    | "value_proposition"
    | "retention_trigger"
    | string;
  question: string;
  options: ClarificationOption[];
  recommendedOptionId: string;
  recommendedOptionIds?: string[];
  isMultiSelect?: boolean;
  inputType?: "chips" | "textarea";
}

export type SectionKey =
  | 'opportunity_framing'
  | 'boundaries'
  | 'success_measurement'
  | 'rollout_plan'
  | 'risk_management'
  | 'ownership_action'
  | 'ai_specific';

export interface UIDesignPromptScreen {
  id: string;
  screen_name: string;
  category: 'dashboard' | 'core_flow' | 'crud_management' | 'auth_settings' | string;
  description: string;
  wireframe_summary: string;
  target_roles: string[];
  v0_prompt: string;
  stitch_prompt: string;
}

