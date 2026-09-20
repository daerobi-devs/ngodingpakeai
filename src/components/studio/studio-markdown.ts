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

export function generateStudioFullMarkdown(prd: PRDOutput): string {
  const defaultFlowchart =
    prd.architecture_diagrams?.system_flowchart ||
    `graph TD
  User([User Client]) --> WebApp[Web Frontend]
  WebApp --> API[Backend API Routes]
  API --> Auth[Auth & Security Guardrails]
  API --> Service[Core Business Services]
  Service --> DB[(Primary Database)]
  Service --> Cache[(Redis / In-Memory Cache)]
  Service --> ThirdParty[External Integrations]`;

  const defaultUserJourney =
    prd.architecture_diagrams?.user_journey_flow ||
    `flowchart TD
  Start([Pengunjung Masuk]) --> Landing[Landing Page]
  Landing --> AuthCheck{Punya Akun?}
  AuthCheck -- Belum --> Register[Registrasi & Verifikasi]
  AuthCheck -- Sudah --> Login[Login Akun]
  Register --> Onboarding[Lengkapi Profil]
  Login --> Dashboard[Dashboard Utama]
  Onboarding --> Dashboard
  Dashboard --> CoreAction[Gunakan Fitur Utama]
  CoreAction --> Feedback[Status & Hasil]`;

  const defaultERD =
    prd.architecture_diagrams?.database_erd ||
    `erDiagram
  USERS ||--o{ TRANSACTIONS : initiates
  USERS {
    string id PK
    string email
    string name
    string role
    datetime created_at
  }
  TRANSACTIONS ||--|{ LOGS : generates
  TRANSACTIONS {
    string id PK
    string user_id FK
    string status
    float amount
    datetime created_at
  }
  LOGS {
    string id PK
    string transaction_id FK
    string event
    datetime timestamp
  }`;

  let md = `# PRD — ${prd.title || 'Project Requirements Document'}\n\n`;

  // 1. Overview
  md += `## 1. Overview\n\n`;
  if (prd.opportunity_framing?.core_problem) {
    md += `${prd.opportunity_framing.core_problem}\n\n`;
  }
  if (prd.opportunity_framing?.working_hypothesis) {
    md += `Hipotesis Kerja: ${prd.opportunity_framing.working_hypothesis}\n\n`;
  }

  // 2. Requirements (In Scope & Out of Scope)
  md += `## 2. Requirements\n\n`;
  if (prd.boundaries?.scope && prd.boundaries.scope.length > 0) {
    prd.boundaries.scope.forEach((item) => {
      md += `- ${item}\n`;
    });
    md += `\n`;
  }
  if (prd.boundaries?.non_goals && prd.boundaries.non_goals.length > 0) {
    md += `Batasan / Non-Goals:\n`;
    prd.boundaries.non_goals.forEach((item) => {
      md += `- [Bukan Tujuan MVP] ${item}\n`;
    });
    md += `\n`;
  }

  // 3. Core Features
  md += `## 3. Core Features\n\n`;
  if (prd.feature_breakdown && prd.feature_breakdown.length > 0) {
    prd.feature_breakdown.forEach((feat, idx) => {
      md += `### 3.${idx + 1} ${feat.name} (${feat.priority || 'P0'})\n\n`;
      md += `${feat.user_story}\n\n`;
      if (feat.happy_path && feat.happy_path.length > 0) {
        md += `Alur Eksekusi (Happy Path):\n`;
        feat.happy_path.forEach((step, sIdx) => {
          md += `${sIdx + 1}. ${step}\n`;
        });
        md += `\n`;
      }
      if (feat.business_rules && feat.business_rules.length > 0) {
        md += `Aturan Bisnis & Validasi:\n`;
        feat.business_rules.forEach((rule) => {
          md += `- ${rule}\n`;
        });
        md += `\n`;
      }
      if (feat.edge_cases && feat.edge_cases.length > 0) {
        md += `Penanganan Edge Cases:\n`;
        feat.edge_cases.forEach((edge) => {
          md += `- ${edge}\n`;
        });
        md += `\n`;
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

  // 6. Database Schema
  md += `## 6. Database Schema\n\n`;
  md += `\`\`\`mermaid\n${defaultERD}\n\`\`\`\n\n`;

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
