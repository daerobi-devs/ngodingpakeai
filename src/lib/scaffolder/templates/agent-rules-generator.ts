import type { PRDOutput } from "@/types/prd";

export interface AgentRulesOutput {
  cursorrules: string;
  claudeMd: string;
  cursorRulesFiles: Record<string, string>;
  mcpJson: string;
}

/**
 * Generates modular .cursor/rules/*.mdc files, .cursorrules, CLAUDE.md, and mcp.json
 * strictly tailored to the resolved stack with zero-emoji policy and Linear/Vercel standards.
 */
export function generateAgentRules(prd: PRDOutput, stackName: string = "nextjs"): AgentRulesOutput {
  const archetype = prd.archetype_detection?.archetype || "Modern Web Application";
  const audience = prd.archetype_detection?.target_audience || "End Users and Administrators";
  const goodBehaviors = prd.ai_specific?.behavior_contract?.good || [];
  const rejectBehaviors = prd.ai_specific?.behavior_contract?.reject || [];
  const guardrails = prd.ai_specific?.guardrails || [];

  const coreRuleContent = `# Autonomous Agent Protocol: ${prd.title}
Archetype: ${archetype}
Target Audience: ${audience}
Stack Architecture: ${stackName}

## 1. Core Mission
You are an expert autonomous software engineer and principal architect building this project to production standard.
Your primary sources of truth are:
- Feature Specifications & Requirements: \`docs/PRD.md\`
- Visual & Design Standards: \`docs/DESIGN.md\`
- Architecture Diagrams: \`docs/diagrams/\`

## 2. Autonomous Execution Directive (Zero Micro-Halts)
- Execute features continuously without pausing to request permission for routine implementation decisions (e.g. utility functions, styling tokens, database migrations, or unit tests).
- Work methodically through core requirements. Stop only if an irreconcilable business logic conflict is detected.
- Implement the comprehensive UI and user journey with interactive state handlers and realistic mock data first before wiring external database connections.

## 3. Behavior Contract
### Mandatory Practices (GOOD):
${goodBehaviors.length > 0 ? goodBehaviors.map((g) => `- [GOOD] ${g}`).join("\n") : "- [GOOD] Write clean, type-safe, and self-documenting code.\n- [GOOD] Follow the component blueprints and design system in docs/DESIGN.md.\n- [GOOD] Ensure all interactive elements have responsive hover, active, and focus states."}

### Strictly Forbidden (REJECT):
${rejectBehaviors.length > 0 ? rejectBehaviors.map((r) => `- [REJECT] ${r}`).join("\n") : "- [REJECT] Never write monolithic single-file components exceeding 250 lines.\n- [REJECT] Never use inline hardcoded styles instead of CSS utility classes.\n- [REJECT] Never bypass strict TypeScript typing with 'any'."}

## 4. Safety & Operational Guardrails
${guardrails.length > 0 ? guardrails.map((g) => `- ${g}`).join("\n") : "- Validate all incoming client data using strict schema validation (e.g. Zod or Pydantic).\n- Protect sensitive routes with role-based access control (RBAC).\n- Prevent data leaks by stripping internal stack traces in user-facing error responses."}
`;

  const uiRuleContent = `---
description: Visual and design standards for UI components, layouts, and typography
globs: "**/*.{tsx,jsx,vue,svelte,html,css}"
---

# UI & UX Standards: Linear & Vercel Design System

## 1. Strict Zero-Emoji Policy
- NEVER use raw unicode emojis (such as sparkles, rockets, fire, lightbulbs, or robot faces) in JSX/HTML, headings, button labels, badge text, or alert banners.
- ALL icons must strictly use monochrome vector SVGs from Lucide React (\`lucide-react\`) sized precisely between 16px and 20px.
- No decorative sparkle effects, no floating particle blobs, no glowing fuzzy circles.

## 2. Deep Dark Mode Palette & Surfaces
- Canvas Background: Deep zinc \`#09090b\` (bg-zinc-950) or pure subtle dark. Never use washed-out grey.
- Card & Panel Background: Elevated zinc \`#121215\` or \`#18181b\` (bg-zinc-900/60) with subtle 1px border (\`border-zinc-800\`).
- Typography Hierarchy:
  - Heading: High-contrast white (\`text-zinc-100\`), semibold/bold tracking-tight.
  - Body: Readable muted zinc (\`text-zinc-400\`).
  - Meta/Subtext: Subtle zinc (\`text-zinc-500\`), text-xs.

## 3. Layout Engineering & Spacing
- Strict 8pt Grid: All padding, margins, and gaps must follow multi-scale tokens (8px, 16px, 24px, 32px, 48px).
- Concentric Radius: Child elements must have an optical radius equal to outer radius minus container padding (\`r_inner = r_outer - p\`).
- Tabular Numbers: Apply \`tabular-nums\` or \`font-mono\` on all metrics, counters, tables, currency, and IDs to eliminate visual layout shifts during updates.
- Tactile Press States: Interactive buttons must incorporate subtle scale transition (\`active:scale-[0.98]\` or \`active:scale-95\`) and clear focus rings (\`focus-visible:ring-2 focus-visible:ring-zinc-400\`).
`;

  const architectureRuleContent = `---
description: Architecture boundaries, route groups, and domain separation
globs: "**/*"
---

# Architecture Boundaries & Modular Layouts

## 1. Application Layout & Domain Separation
Organize routes and layouts directly matching the PRD specification:
1. Root Application Shell (\`src/app/\`):
   - Entry point: \`src/app/page.tsx\` directly represents the core application interface or dashboard.
   - Distinct role portals (\`src/app/([role])/\`) are used ONLY when the PRD explicitly specifies multiple distinct user personas.
   - Do NOT create unnecessary or irrelevant route groups (e.g. do NOT create a marketing folder for developer tools, internal engines, or dashboards).
2. Navigation & Shell:
   - Sidebar or Header with dynamic feature links derived directly from \`feature_breakdown\` in the PRD.
   - Breadcrumbs, Search, and Status chips for active modules.

## 2. Component Layering
- \`components/ui/\`: Primitives (Button, Input, Card, Dialog, Badge, Table).
- \`components/features/\`: Domain-specific components mapped to PRD features.
- \`components/layout/\`: App shells, Sidebars, Headers, and Breadcrumbs.
- \`lib/utils.ts\`: Pure utility helpers (cn, formatters, date helpers).
`;

  const databaseRuleContent = `---
description: Data models, validation, and schema persistence rules
globs: "**/{models,schemas,db,migrations,entities}/**/*"
---

# Database Proactivity & Data Integrity

## 1. Schema Authority
- Base schema designs on the Entity Relationship Diagram located in \`docs/diagrams/03-database-erd.mmd\`.
- If the PRD omits necessary database columns (such as created_at, updated_at, deleted_at, uuid primary keys, or foreign key cascades), proactively add them.
- Always apply indexed lookups on frequently queried columns and foreign keys.

## 2. Validation & Security
- Never trust user input. Validate all incoming request payloads using strict runtime schema validation.
- Enforce Row-Level Security (RLS) policies or tenant isolation guards on all database access methods.
`;

  const mcpJsonContent = JSON.stringify(
    {
      mcpServers: {
        ngodingpakeprd: {
          command: "node",
          args: ["./mcp/server.js"],
          env: {
            PRD_PATH: "./docs/PRD.md",
            DESIGN_PATH: "./docs/DESIGN.md",
          },
        },
      },
    },
    null,
    2
  );

  return {
    cursorrules: coreRuleContent,
    claudeMd: coreRuleContent,
    cursorRulesFiles: {
      "00-core.mdc": coreRuleContent,
      "01-ui.mdc": uiRuleContent,
      "02-architecture.mdc": architectureRuleContent,
      "03-database.mdc": databaseRuleContent,
    },
    mcpJson: mcpJsonContent,
  };
}

/**
 * Writes all generated agent rules to the specified JSZip root folder.
 */
export function packAgentRulesToZip(rootFolder: any, prd: PRDOutput, stackName: string = "nextjs"): void {
  const rules = generateAgentRules(prd, stackName);

  // Root rule files
  rootFolder.file(".cursorrules", rules.cursorrules);
  rootFolder.file("CLAUDE.md", rules.claudeMd);
  rootFolder.file(".cursor/mcp.json", rules.mcpJson);

  // Modular .cursor/rules/*.mdc
  const cursorRulesFolder = rootFolder.folder(".cursor/rules");
  if (cursorRulesFolder) {
    for (const [filename, content] of Object.entries(rules.cursorRulesFiles)) {
      cursorRulesFolder.file(filename, content);
    }
  }
}
