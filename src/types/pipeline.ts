import { PRDFormData, TechStackInfo, DeepFeature, RoadmapPhaseNode, ArchitectureDiagrams } from './prd';

export interface TargetPersona {
  primary_user: string;
  secondary_user?: string;
  role_description?: string;
}

export interface DomainGlossaryItem {
  term: string;
  definition: string;
}

export interface ProductBrief {
  app_title: string;
  domain: string;
  core_problem: string;
  target_persona: TargetPersona;
  core_user_flow_summary: string;
  domain_glossary: DomainGlossaryItem[];
  banned_terms: string[];
  mvp_scope: string[];
  out_of_scope: string[];
  explicit_assumptions: string[];
  archetype: string;
  ui_personality: string;
  color_theme: {
    primary: string;
    secondary: string;
    accent: string;
    background_mood: string;
  };
  has_dashboard: boolean;
}

export interface KeyDecisions {
  tech_stack: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
    styling: string;
    package_manager: string;
  };
  auth_system: {
    provider: string;
    session_strategy: string;
    user_table_id_type: string;
  };
  storage_system: {
    provider: string;
    codec_or_format?: string;
    retention_policy: string;
  };
  export_libraries: string[];
  phase_strategy: {
    mvp_phase_name: string;
    next_phase_name: string;
  };
}

export interface Stage1Output {
  product_brief: ProductBrief;
  key_decisions: KeyDecisions;
}

export interface Stage2Output {
  opportunity_framing: {
    core_problem: string;
    working_hypothesis: string;
    strategy_fit: string;
  };
  success_measurement: {
    product_kpis: string[];
    technical_slos: string[];
    offline_golden_set: string;
    human_review: string;
    online_metrics: string;
  };
  boundaries: {
    scope: string[];
    non_goals: string[];
  };
  assumptions_and_constraints: {
    in_scope_assumptions: string[];
    out_of_scope_constraints: string[];
  };
  risk_management: {
    detection: string;
    fallback_kill_switch: string;
    api_costs_and_quotas: string;
    data_privacy_and_security: string;
    data_retention_policy: string;
    third_party_failure_mitigation: string;
  };
  feature_breakdown: DeepFeature[];
}

export interface Stage3Output {
  user_flow_steps: Array<{
    step: number;
    title: string;
    phase_tag: string;
    description: string;
  }>;
  roadmap_tree: RoadmapPhaseNode[];
  architecture_diagrams: ArchitectureDiagrams & {
    system_flowchart?: string;
    user_journey_flow?: string;
    database_erd?: string;
    sql_migration_script?: string;
    api_integration_matrix?: string;
    sequence_diagram?: string;
    infrastructure_topology?: string;
    rbac_permission_matrix?: string;
    data_pipeline_flow?: string;
    system_components?: Array<{
      name: string;
      role: string;
      tech: string;
      type: string;
    }>;
  };
  task_breakdown: string[];
}

export interface PipelineProgressCallback {
  (stage: number, stageName: string, detail: string): void;
}
