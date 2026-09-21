import type { PRDOutput } from "@/types/prd";
import { getDesignPalette, generateDesignDoc } from "@/lib/design-template";
import { packDiagramsToZip } from "./templates/diagrams-packer";
import { packAgentRulesToZip } from "./templates/agent-rules-generator";
import { resolveNextJsStack } from "./stack-resolvers/nextjs-resolver";
import { resolvePythonFastApiStack } from "./stack-resolvers/python-fastapi-resolver";
import { resolveGolangStack } from "./stack-resolvers/golang-resolver";
import { resolveLaravelStack } from "./stack-resolvers/laravel-resolver";
import { resolveFlutterStack } from "./stack-resolvers/flutter-resolver";
import { resolveMonorepoStack } from "./stack-resolvers/monorepo-resolver";
import { resolveGenericStack } from "./stack-resolvers/generic-resolver";

export interface ScaffolderOptions {
  versionNumber?: number;
  mode?: "full_starter" | "docs_only";
}

export interface GeneratedZipResult {
  blob: Blob;
  filename: string;
  detectedStack: string;
}

/**
 * Serializes PRDOutput into standard Markdown format for documentation export.
 */
export function formatPrdAsMarkdown(prd: PRDOutput): string {
  const deepFeatures = prd.feature_breakdown || [];

  return `# ${prd.title}
*Product Requirements Document (Modern PRD Framework for AI Prototyping)*
${prd.archetype_detection ? `*Arketipe Produk: ${prd.archetype_detection.archetype} | Target Audiens: ${prd.archetype_detection.target_audience}*\n` : ""}
---

## 1. OPPORTUNITY FRAMING
- **Core Problem:** ${prd.opportunity_framing.core_problem}
- **Working Hypothesis:** ${prd.opportunity_framing.working_hypothesis}
- **Strategy Fit:** ${prd.opportunity_framing.strategy_fit}

---

## 2. BOUNDARIES & SCOPE
${
  deepFeatures.length > 0
    ? `### Deep Feature Architecture (MVP Breakdown)\n` +
      deepFeatures
        .map(
          (f, idx) => `#### Fitur #${idx + 1}: [${f.priority}] ${f.name}
- **User Story:** ${f.user_story}
- **Alur Kerja (Happy Path):**
${(f.happy_path || []).map((step, sIdx) => `  ${sIdx + 1}. ${step}`).join("\n")}
- **Aturan Bisnis & Validasi:**
${(f.business_rules || []).map((rule) => `  - ${rule}`).join("\n")}
- **Edge Cases & Solusi Gagal:**
${(f.edge_cases || []).map((edge) => `  - ${edge}`).join("\n")}
- **Komponen Teknis Terkait:**
  - Frontend: ${(f.tech_mapping?.frontend_components || []).join(", ") || "-"}
  - API Endpoints: ${(f.tech_mapping?.api_endpoints || []).join(", ") || "-"}
  - Tabel Database: ${(f.tech_mapping?.db_tables || []).join(", ") || "-"}
- **Prompt Coding Agent (Cursor / Claude Code):**
\`\`\`text
${f.agent_prompt}
\`\`\``
        )
        .join("\n\n")
    : `### Scope (In-Scope Features)\n` + (prd.boundaries?.scope || []).map((s) => `- ${s}`).join("\n")
}

### Non-Goals (Explicitly Out of Scope)
${(prd.boundaries?.non_goals || []).map((ng) => `- ${ng}`).join("\n")}

---

## 3. SUCCESS MEASUREMENT
- **Offline Golden Set (Validation):** ${prd.success_measurement.offline_golden_set}
- **Human Review (Qualitative Audit):** ${prd.success_measurement.human_review}
- **Online Metrics (KPIs & Thresholds):** ${prd.success_measurement.online_metrics}

---

## 4. ROLLOUT PLAN
- **Exposure:** ${prd.rollout_plan.exposure}
- **Duration:** ${prd.rollout_plan.duration}
- **Segments & Ramp Gates:** ${prd.rollout_plan.segments_gates}

---

## 5. RISK MANAGEMENT
- **Detection Mechanism:** ${prd.risk_management.detection}
- **Fallback & Kill Switch:** ${prd.risk_management.fallback_kill_switch}

---

## 6. OWNERSHIP & ACTION
- **Primary Owner (PIC):** ${prd.ownership_action.primary_owner}
- **Decision Points & Cadence:** ${prd.ownership_action.decision_points}

---

## 7. AI-SPECIFIC ADDITIONS
### Behavior Contract
#### [GOOD] Wajib Dilakukan:
${(prd.ai_specific?.behavior_contract?.good || []).map((g) => `- [GOOD] ${g}`).join("\n")}

#### [REJECT] Dilarang Keras:
${(prd.ai_specific?.behavior_contract?.reject || []).map((r) => `- [REJECT] ${r}`).join("\n")}

### Guardrails
${(prd.ai_specific?.guardrails || []).map((gr) => `- ${gr}`).join("\n")}

---

## 8. ACTIONABLE TASK BREAKDOWN (FOR AI CODING AGENTS)
${(prd.task_breakdown || []).map((t, idx) => `- [ ] Step ${idx + 1}: ${t}`).join("\n")}
`;
}

interface DetectedStackInfo {
  type: "nextjs" | "python" | "golang" | "laravel" | "flutter" | "monorepo" | "generic";
  name: string;
  frontendType?: "nextjs" | "flutter" | "generic";
  backendType?: "python" | "golang" | "laravel" | "generic";
}

/**
 * Dynamically detects tech stack from PRD fields.
 */
export function detectStackFromPrd(prd: PRDOutput): DetectedStackInfo {
  const stack = prd.tech_stack || {};
  const fe = (stack.frontend || "").toLowerCase();
  const be = (stack.backend || "").toLowerCase();
  const lang = (stack.language || "").toLowerCase();
  const desc = (stack.description || "").toLowerCase();
  const stackName = (stack.name || "").toLowerCase();
  const combined = `${fe} ${be} ${lang} ${desc} ${stackName}`.toLowerCase();

  // 1. Flutter Mobile Stack
  if (fe.includes("flutter") || combined.includes("flutter") || lang.includes("dart")) {
    if (be.includes("python") || be.includes("fastapi") || be.includes("django")) {
      return { type: "monorepo", frontendType: "flutter", backendType: "python", name: "Flutter + Python FastAPI Monorepo" };
    }
    if (be.includes("go") || be.includes("gin") || be.includes("fiber")) {
      return { type: "monorepo", frontendType: "flutter", backendType: "golang", name: "Flutter + Go Monorepo" };
    }
    return { type: "flutter", name: "Flutter (Dart)" };
  }

  // 2. Monorepo (Split Frontend & Backend)
  const isFrontendWeb =
    fe.includes("next") ||
    fe.includes("react") ||
    fe.includes("vue") ||
    fe.includes("svelte") ||
    combined.includes("next.js") ||
    combined.includes("tailwind");

  const isBackendPython = be.includes("fastapi") || be.includes("django") || be.includes("flask") || (be.includes("python") && !isFrontendWeb);
  const isBackendGo = be.includes("go") || be.includes("gin") || be.includes("fiber") || (lang.includes("go") && !isFrontendWeb);
  const isBackendLaravel = be.includes("laravel") || be.includes("php");

  if (isFrontendWeb && isBackendPython) {
    return { type: "monorepo", frontendType: "nextjs", backendType: "python", name: "Next.js + Python FastAPI Monorepo" };
  }
  if (isFrontendWeb && isBackendGo) {
    return { type: "monorepo", frontendType: "nextjs", backendType: "golang", name: "Next.js + Go Monorepo" };
  }
  if (isFrontendWeb && isBackendLaravel) {
    return { type: "monorepo", frontendType: "nextjs", backendType: "laravel", name: "Next.js + Laravel Monorepo" };
  }

  // 3. Standalone Backends
  if (isBackendPython && !isFrontendWeb) {
    return { type: "python", name: "Python FastAPI" };
  }
  if (isBackendGo && !isFrontendWeb) {
    return { type: "golang", name: "Go (Golang)" };
  }
  if (isBackendLaravel && !isFrontendWeb) {
    return { type: "laravel", name: "PHP Laravel" };
  }

  // 4. Default: Next.js App Router (Fullstack)
  return { type: "nextjs", name: "Next.js App Router (Fullstack)" };
}

/**
 * Generates the starter codebase ZIP bundle directly in the user's browser via JSZip.
 * Always syncs with the live PRD object (including studio revisions).
 */
export async function generateStarterCodebaseZip(
  prd: PRDOutput,
  options?: ScaffolderOptions
): Promise<GeneratedZipResult> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const mode = options?.mode || "full_starter";
  const versionNum = options?.versionNumber;
  const safeTitle = prd.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const folderName = `${safeTitle}-${mode === "docs_only" ? "docs-kit" : "starter-repo"}${versionNum ? `-v${versionNum}` : ""}`;
  const rootFolder = zip.folder(folderName) || zip;

  const stackInfo = detectStackFromPrd(prd);

  // 1. Pack Universal Documentation
  const prdMarkdown = formatPrdAsMarkdown(prd);
  const palette = getDesignPalette(prd);
  const designMarkdown = generateDesignDoc(prd, palette);

  const docsFolder = rootFolder.folder("docs");
  if (docsFolder) {
    docsFolder.file("PRD.md", prdMarkdown);
    docsFolder.file("DESIGN.md", designMarkdown);
  }

  // 2. Pack Architecture Diagrams
  packDiagramsToZip(rootFolder, prd);

  // 3. Pack Agent Protocol & Rules
  packAgentRulesToZip(rootFolder, prd, stackInfo.name);

  // 4. If Full Starter: Scaffold Codebase based on detected stack
  if (mode === "full_starter") {
    switch (stackInfo.type) {
      case "monorepo":
        resolveMonorepoStack(
          rootFolder,
          prd,
          stackInfo.frontendType || "nextjs",
          stackInfo.backendType || "python"
        );
        break;
      case "python":
        resolvePythonFastApiStack(rootFolder, prd);
        break;
      case "golang":
        resolveGolangStack(rootFolder, prd);
        break;
      case "laravel":
        resolveLaravelStack(rootFolder, prd);
        break;
      case "flutter":
        resolveFlutterStack(rootFolder, prd);
        break;
      case "nextjs":
      default:
        resolveNextJsStack(rootFolder, prd);
        break;
    }
  } else {
    // Docs-only README
    rootFolder.file(
      "README.md",
      `# ${prd.title} — Dokumentasi Arsitektur

Paket dokumen spesifikasi produk dan diagram arsitektur untuk AI Coding Agent.

## Daftar Berkas:
- \`docs/PRD.md\` : Spesifikasi produk 7 kategori lengkap.
- \`docs/DESIGN.md\` : Standar desain antarmuka Vercel & Linear (Zero Emoji).
- \`docs/diagrams/\` : Diagram Mermaid arsitektur sistem.
- \`.cursorrules\` & \`CLAUDE.md\` : Aturan koding untuk Cursor dan Claude Code.
`
    );
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const filename = `${folderName}.zip`;

  return {
    blob,
    filename,
    detectedStack: stackInfo.name,
  };
}
