import { PRDOutput } from '@/types/prd';
import { TEMPLATE_ARCHETYPES } from '@/lib/templates/archetypes';

export interface StudioOutlineItem {
  id: string;
  number: string;
  title: string;
}

export const STUDIO_OUTLINE_SECTIONS: StudioOutlineItem[] = [
  { id: 'section-overview', number: '1', title: 'Overview' },
  { id: 'section-requirements', number: '2', title: 'Requirements' },
  { id: 'section-features', number: '3', title: 'Core Features' },
  { id: 'section-user-flow', number: '4', title: 'User Flow' },
  { id: 'section-architecture', number: '5', title: 'Architecture' },
  { id: 'section-database', number: '6', title: 'Database Schema' },
  { id: 'section-tech-stack', number: '7', title: 'Tech Stack' },
];

export function resolvePrdTechStack(prd: PRDOutput) {
  const stack = prd.tech_stack;
  const templateId = stack?.templateId || 'starter';
  const archetype = TEMPLATE_ARCHETYPES[templateId] || TEMPLATE_ARCHETYPES['starter'];

  const frontend = stack?.frontend || archetype?.tech?.frontend?.name || 'Next.js 16 (App Router), React 19, Tailwind CSS, TypeScript';
  const backend = stack?.backend || archetype?.tech?.backend?.name || 'Next.js Route Handlers & Server Actions, Validasi Zod';
  const database = stack?.database || archetype?.tech?.database?.name || 'Supabase (PostgreSQL) dengan Row Level Security (RLS)';
  const deployment = stack?.deployment || archetype?.tech?.deployment?.name || 'Docker (VPS / Coolify)';

  let auth = 'Role-Based Access Control (RBAC) & Secure Session';
  if (templateId === 'mobile-app') {
    auth = 'Supabase Auth & Biometric / Secure Keystore Session';
  } else if (templateId === 'ai-service') {
    auth = 'API Key Authentication & JWT Bearer Token Guard';
  }

  // Only include AI Integration if template is explicitly 'ai-service'
  // OR if title/stack explicitly mentions AI/LLM models as distinct whole words
  const aiRegex = /\b(ai|llm|gpt|openai|gemini|claude|deepseek|machine learning|deep learning|artificial intelligence)\b/i;
  const isAiService =
    templateId === 'ai-service' ||
    Boolean(
      aiRegex.test(prd.title || '') ||
      (stack?.name && aiRegex.test(stack.name))
    );

  const aiIntegration = isAiService ? 'Multi-provider LLM API (Google Gemini / OpenRouter)' : null;

  return {
    templateId,
    name: stack?.name || archetype?.title || 'Modern Architecture',
    frontend,
    backend,
    database,
    deployment,
    auth,
    aiIntegration,
  };
}

import { synthesizeDynamicArchitectureDiagrams } from '@/lib/gemini/schemas';

export function generateStudioFullMarkdown(prd: PRDOutput): string {
  const diagrams = synthesizeDynamicArchitectureDiagrams(
    prd.title || 'App',
    prd.archetype_detection,
    prd.feature_breakdown || [],
    prd.architecture_diagrams
  );

  const defaultFlowchart = diagrams.system_flowchart;
  const defaultUserJourney = diagrams.user_journey_flow;
  const defaultERD = diagrams.database_erd;

  let md = `# PRD — ${prd.title || 'Project Requirements Document'}\n\n`;

  // 1. Overview
  md += `## 1. Overview\n\n`;
  if (prd.opportunity_framing?.core_problem) {
    md += `### 1.1 Problem Statement & Konteks Lapangan\n${prd.opportunity_framing.core_problem}\n\n`;
  }
  if (prd.opportunity_framing?.working_hypothesis) {
    md += `### 1.2 Hipotesis Solusi & Alur Kunci\n${prd.opportunity_framing.working_hypothesis}\n\n`;
  }
  if (prd.opportunity_framing?.strategy_fit) {
    md += `### 1.3 Keunggulan Strategis & Keselarasan Solusi\n${prd.opportunity_framing.strategy_fit}\n\n`;
  }
  if (prd.archetype_detection?.target_audience) {
    md += `### 1.4 Target Persona & Pengguna Sistem\n${prd.archetype_detection.target_audience}\n\n`;
  }
  if (prd.success_measurement?.online_metrics) {
    md += `### 1.5 Target Metrik & KPI Produksi\n`;
    md += `- **Metrik Operasional / Online**: ${prd.success_measurement.online_metrics}\n`;
    if (prd.success_measurement.offline_golden_set) {
      md += `- **Validasi Fungsional / Golden Set**: ${prd.success_measurement.offline_golden_set}\n`;
    }
    md += `\n`;
  }

  // 2. Requirements (In Scope, Non-Goals, Non-Functional)
  md += `## 2. Requirements\n\n`;
  md += `### 2.1 Functional Requirements (Lingkup MVP)\n\n`;
  if (prd.boundaries?.scope && prd.boundaries.scope.length > 0) {
    prd.boundaries.scope.forEach((item, idx) => {
      if (item.startsWith('[REQ-') || item.startsWith('REQ-')) {
        md += `- ${item}\n`;
      } else {
        const reqCode = `[REQ-${String(idx + 1).padStart(2, '0')}]`;
        md += `- **${reqCode}** ${item}\n`;
      }
    });
    md += `\n`;
  }

  if (prd.boundaries?.non_goals && prd.boundaries.non_goals.length > 0) {
    md += `### 2.2 Batasan & Non-Goals (Out of Scope MVP)\n\n`;
    prd.boundaries.non_goals.forEach((item) => {
      md += `- **[OUT-OF-SCOPE]** ${item}\n`;
    });
    md += `\n`;
  }

  if (prd.ai_specific?.guardrails || prd.risk_management?.detection || prd.risk_management?.fallback_kill_switch) {
    md += `### 2.3 Non-Functional Requirements (NFR & Keamanan)\n\n`;
    if (prd.ai_specific?.guardrails && prd.ai_specific.guardrails.length > 0) {
      md += `- **Keamanan & Validasi**: ${prd.ai_specific.guardrails.join(', ')}\n`;
    }
    if (prd.risk_management?.detection) {
      md += `- **Pemantauan & Audit**: ${prd.risk_management.detection}\n`;
    }
    if (prd.risk_management?.fallback_kill_switch) {
      md += `- **Mitigasi & Failover**: ${prd.risk_management.fallback_kill_switch}\n`;
    }
    md += `\n`;
  }

  // 3. Core Features
  md += `## 3. Core Features\n\n`;
  if (prd.feature_breakdown && prd.feature_breakdown.length > 0) {
    prd.feature_breakdown.forEach((feat, idx) => {
      md += `### 3.${idx + 1} ${feat.name} (${feat.priority || 'P0'})\n\n`;
      md += `**User Story:** ${feat.user_story}\n\n`;

      if (feat.happy_path && feat.happy_path.length > 0) {
        md += `**Alur Eksekusi (Happy Path):**\n`;
        feat.happy_path.forEach((step, sIdx) => {
          md += `${sIdx + 1}. ${step}\n`;
        });
        md += `\n`;
      }

      if (feat.business_rules && feat.business_rules.length > 0) {
        md += `**Aturan Bisnis & Validasi:**\n`;
        feat.business_rules.forEach((rule) => {
          md += `- ${rule}\n`;
        });
        md += `\n`;
      }

      if (feat.edge_cases && feat.edge_cases.length > 0) {
        md += `**Penanganan Edge Cases:**\n`;
        feat.edge_cases.forEach((edge) => {
          md += `- ${edge}\n`;
        });
        md += `\n`;
      }

      if (feat.tech_mapping) {
        md += `**Technical Mapping:**\n`;
        if (feat.tech_mapping.frontend_components && feat.tech_mapping.frontend_components.length > 0) {
          md += `- *Frontend Components*: \`${feat.tech_mapping.frontend_components.join('`, `')}\`\n`;
        }
        if (feat.tech_mapping.api_endpoints && feat.tech_mapping.api_endpoints.length > 0) {
          md += `- *API Endpoints*: \`${feat.tech_mapping.api_endpoints.join('`, `')}\`\n`;
        }
        if (feat.tech_mapping.db_tables && feat.tech_mapping.db_tables.length > 0) {
          md += `- *Database Tables*: \`${feat.tech_mapping.db_tables.join('`, `')}\`\n`;
        }
        md += `\n`;
      }

      if (feat.agent_prompt) {
        md += `**AI Coding Agent Prompt:**\n\n`;
        md += `\`\`\`text\n${feat.agent_prompt}\n\`\`\`\n\n`;
      }

      md += `\n`;
    });
  } else {
    md += `Fitur utama terinci mencakup alur registrasi, dashboard manajemen, dan integrasi data.\n\n`;
  }

  // 4. User Flow
  md += `## 4. User Flow\n\n`;
  md += `\`\`\`mermaid\n${defaultUserJourney}\n\`\`\`\n\n`;

  // 5. Architecture
  md += `## 5. Architecture\n\n`;
  md += `\`\`\`mermaid\n${defaultFlowchart}\n\`\`\`\n\n`;

  // 6. Database Schema & SQL Migration
  md += `## 6. Database Schema & SQL Migration\n\n`;
  md += `### 6.1 Entity-Relationship Diagram (ERD)\n\n`;
  md += `\`\`\`mermaid\n${defaultERD}\n\`\`\`\n\n`;

  const defaultSql = diagrams.sql_migration_script || prd.sql_migration_script || '';
  if (defaultSql) {
    md += `### 6.2 Skrip Migrasi Database (PostgreSQL / Supabase DDL)\n\n`;
    md += `\`\`\`sql\n${defaultSql}\n\`\`\`\n\n`;
  }

  // 7. Tech Stack
  const resolvedStack = resolvePrdTechStack(prd);
  md += `## 7. Tech Stack\n\n`;
  md += `- **Frontend**: ${resolvedStack.frontend}\n`;
  md += `- **Backend & API**: ${resolvedStack.backend}\n`;
  md += `- **Database**: ${resolvedStack.database}\n`;
  if (resolvedStack.aiIntegration) {
    md += `- **AI Integration**: ${resolvedStack.aiIntegration}\n`;
  }
  md += `- **Authentication**: ${resolvedStack.auth}\n`;
  md += `- **Deployment**: ${resolvedStack.deployment}\n`;

  return md;
}
