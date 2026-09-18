"use client";

import React, { useState, useMemo } from "react";
import { PRDOutput } from "@/types/prd";
import { MindmapViewer } from "./MindmapViewer";
import { PhasedFeatureTree } from "./PhasedFeatureTree";
import { MermaidRenderer } from "./MermaidRenderer";
import { generateDesignDoc, getDesignPalette } from "@/lib/design-template";
import { BeginnerRoadmap } from "./BeginnerRoadmap";
import {
  FileText,
  GitFork,
  CheckSquare,
  Code2,
  Download,
  Copy,
  Check,
  ArrowLeft,
  Bot,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Cpu,
  BookmarkCheck,
  Zap,
  Network,
  Palette,
  Package,
  Loader2,
  Compass,
  ChevronDown,
  ChevronUp,
  Terminal,
  Layers,
  FolderTree,
} from "lucide-react";

interface PRDViewerProps {
  prd: PRDOutput;
  onBackToEdit: () => void;
  theme?: "dark" | "light";
}

export const PRDViewer: React.FC<PRDViewerProps> = ({
  prd,
  onBackToEdit,
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const [activeTab, setActiveTab] = useState<
    "doc" | "tree" | "design" | "diagrams" | "mindmap" | "tasks" | "roadmap" | "json"
  >("doc");
  const [copiedTaskIndex, setCopiedTaskIndex] = useState<number | null>(null);
  const [copiedAllTasks, setCopiedAllTasks] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedCursorRules, setCopiedCursorRules] = useState(false);
  const [copiedDesign, setCopiedDesign] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(
    prd.feature_breakdown?.[0]?.id || null
  );
  const [copiedFeatureId, setCopiedFeatureId] = useState<string | null>(null);

  const handleCopyFeaturePrompt = (featId: string, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedFeatureId(featId);
    setTimeout(() => setCopiedFeatureId(null), 2000);
  };

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const designMarkdown = useMemo(() => generateDesignDoc(prd), [prd]);
  const palette = useMemo(() => getDesignPalette(prd), [prd]);

  const defaultFlowchart = useMemo(() => {
    return (
      prd.architecture_diagrams?.system_flowchart ||
      `graph TD
  User([User Client]) --> WebApp[Web Frontend]
  WebApp --> API[Backend API Routes]
  API --> Auth[Auth & Security Guardrails]
  API --> Service[Core Business Services]
  Service --> DB[(Primary Database)]
  Service --> Cache[(Redis / In-Memory Cache)]
  Service --> ThirdParty[External Integrations]`
    );
  }, [prd.architecture_diagrams?.system_flowchart]);

  const defaultERD = useMemo(() => {
    return (
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
    datetime updated_at
  }
  LOGS {
    string id PK
    string transaction_id FK
    string event
    datetime timestamp
  }`
    );
  }, [prd.architecture_diagrams?.database_erd]);

  const defaultSequence = useMemo(() => {
    return (
      prd.architecture_diagrams?.sequence_diagram ||
      `sequenceDiagram
  autonumber
  actor User as Pengguna
  participant Client as Frontend Web
  participant API as Backend Gateway
  participant DB as Database / Service

  User->>Client: Lakukan Aksi / Submit Form
  Client->>API: POST /api/request (Validasi Zod)
  API->>DB: Query & Verifikasi State
  DB-->>API: Data Terkonfirmasi
  API-->>Client: Respon Sukses (JSON / Stream)
  Client-->>User: Tampilkan UI Feedback & Notifikasi`
    );
  }, [prd.architecture_diagrams?.sequence_diagram]);

  const defaultUserJourney = useMemo(() => {
    return (
      prd.architecture_diagrams?.user_journey_flow ||
      `flowchart LR
  Start([Pengguna Masuk]) --> Landing[Landing Page / Katalog]
  Landing --> Action[Input Data / Booking Form]
  Action --> Validation{Validasi Input Zod}
  Validation -- Gagal --> ErrorView[Tampilkan Pesan Error]
  ErrorView --> Action
  Validation -- Sukses --> Processing[Proses Transaksi / AI]
  Processing --> Done([Halaman Sukses & Konfirmasi])`
    );
  }, [prd.architecture_diagrams?.user_journey_flow]);

  const defaultApiMatrix = useMemo(() => {
    return (
      prd.architecture_diagrams?.api_integration_matrix ||
      `flowchart TD
  Client[Frontend Client Layer]
  subgraph Endpoints [Core Backend API Routes]
    API1["POST /api/generate (Core Processing)"]
    API2["POST /api/validate (Auth & Zod Check)"]
    API3["GET /api/status (Realtime Polling)"]
  end
  subgraph Integrations [Third-party & Storage]
    AI["AI Model Service"]
    DB[(Database Storage)]
  end
  Client --> API1 & API2 & API3
  API1 --> AI
  API2 --> DB
  API3 --> DB`
    );
  }, [prd.architecture_diagrams?.api_integration_matrix]);

  const handleDownloadBundleZip = async () => {
    setDownloadingZip(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const folderName = `${prd.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-starter-kit`;
      const rootFolder = zip.folder(folderName) || zip;

      // 1. .cursorrules
      rootFolder.file(".cursorrules", generateCursorRulesSnippet());

      // 2. CLAUDE.md
      rootFolder.file("CLAUDE.md", generateCursorRulesSnippet());

      // 3. docs/PRD.md & docs/DESIGN.md
      const docsFolder = rootFolder.folder("docs");
      if (docsFolder) {
        docsFolder.file("PRD.md", formatAsMarkdown());
        docsFolder.file("DESIGN.md", designMarkdown);
      }

      // 4. README.md
      rootFolder.file(
        "README.md",
        `# ${prd.title} — Starter Kit

Paket instruksi koding lengkap untuk AI Coding Agents (Cursor, Claude Code, Windsurf, Antigravity).

## 📂 Struktur File:
- \`.cursorrules\` : Pagar pembatas koding ketat, kontrak GOOD vs REJECT, dan task breakdown.
- \`CLAUDE.md\` : Instruksi untuk Claude Code CLI.
- \`docs/PRD.md\` : Spesifikasi produk 7 kategori lengkap + 5 diagram Mermaid.
- \`docs/DESIGN.md\` : Standar desain frontend anti-AI slop (Dark Zinc 950, 8pt grid, micro-interactions).

## 🚀 Cara Pakai:
1. Buka folder ini di Cursor / VS Code / Antigravity.
2. Di chat AI, ketik:
   > *"Baca docs/PRD.md, patuhi .cursorrules, dan terapkan standar visual di docs/DESIGN.md. Mulai dari Step 1."*
`
      );

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folderName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("ZIP Generation error:", e);
      alert("Gagal membuat file ZIP bundle.");
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleCopyDesignDoc = () => {
    navigator.clipboard.writeText(designMarkdown);
    setCopiedDesign(true);
    setTimeout(() => setCopiedDesign(false), 2000);
  };

  const formatAsMarkdown = (): string => {
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
  prd.feature_breakdown && prd.feature_breakdown.length > 0
    ? `### Deep Feature Architecture (MVP Breakdown)\n` +
      prd.feature_breakdown
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
    : `### Scope (In-Scope Features)\n` + prd.boundaries.scope.map((s) => `- ${s}`).join("\n")
}

### Non-Goals (Explicitly Out of Scope)
${prd.boundaries.non_goals.map((ng) => `- ${ng}`).join("\n")}

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
${prd.ai_specific.behavior_contract.good.map((g) => `- [GOOD] ${g}`).join("\n")}

#### [REJECT] Dilarang Keras:
${prd.ai_specific.behavior_contract.reject.map((r) => `- [REJECT] ${r}`).join("\n")}

### Guardrails
${prd.ai_specific.guardrails.map((gr) => `- ${gr}`).join("\n")}

---

## 8. ACTIONABLE TASK BREAKDOWN (FOR AI CODING AGENTS)
${prd.task_breakdown.map((t, idx) => `- [ ] Step ${idx + 1}: ${t}`).join("\n")}

---

## 9. ARCHITECTURE DIAGRAMS & MINDMAP (MERMAID)
### Visual Taxonomy Mindmap
\`\`\`mermaid
mindmap
  root(("${prd.title.replace(/[()"]/g, "")}"))
    Opportunity Framing
      Problem: ${prd.opportunity_framing.core_problem.slice(0, 45).replace(/[()"]/g, "")}...
      Hypothesis: ${prd.opportunity_framing.working_hypothesis.slice(0, 45).replace(/[()"]/g, "")}...
    Boundaries
      In-Scope (${prd.boundaries.scope.length} Fitur)
      Non-Goals (${prd.boundaries.non_goals.length} Batasan)
    Success Measurement
      Golden Set
      Online KPIs: ${prd.success_measurement.online_metrics.slice(0, 45).replace(/[()"]/g, "")}...
    Rollout Plan
      Exposure: ${prd.rollout_plan.exposure.replace(/[()"]/g, "")}
    Risk Management
      Detection
      Kill-Switch
    Ownership
      PIC: ${prd.ownership_action.primary_owner.replace(/[()"]/g, "")}
    AI Contract
      GOOD Standards
      REJECT Rules
      Guardrails
\`\`\`

### 1. System Data Flowchart
\`\`\`mermaid
${defaultFlowchart}
\`\`\`

### 2. User Journey & Sitemap Flow
\`\`\`mermaid
${defaultUserJourney}
\`\`\`

### 3. Database Schema (ERD)
\`\`\`mermaid
${defaultERD}
\`\`\`

### 4. API & Webhook Integration Matrix
\`\`\`mermaid
${defaultApiMatrix}
\`\`\`

### 5. Core Sequence Flow
\`\`\`mermaid
${defaultSequence}
\`\`\`
`;
  };

  const generateCursorRulesSnippet = (): string => {
    return `# .cursorrules / CLAUDE.md for: ${prd.title}
*Product Archetype: ${prd.archetype_detection?.archetype || "Modern Web Application"}*
*Target Audience: ${prd.archetype_detection?.target_audience || "End Users & Operators"}*

## Role & Mission
You are an expert fullstack software architect implementing: "${prd.title}".
Strictly follow the Behavior Contract, Guardrails, and Deep Feature Architecture below.

## Behavior Contract (Strict Enforcement)
### GOOD (Always Do):
${prd.ai_specific.behavior_contract.good.map((g) => `- ${g}`).join("\n")}

### REJECT (Never Do):
${prd.ai_specific.behavior_contract.reject.map((r) => `- ${r}`).join("\n")}

## Core MVP Features to Implement:
${
  prd.feature_breakdown && prd.feature_breakdown.length > 0
    ? prd.feature_breakdown
        .map(
          (f, idx) => `### ${idx + 1}. [${f.priority}] ${f.name}
- Story: ${f.user_story}
- Components: ${(f.tech_mapping?.frontend_components || []).join(", ") || "Main Component"}
- Endpoints: ${(f.tech_mapping?.api_endpoints || []).join(", ") || "API Route"}
- Tables: ${(f.tech_mapping?.db_tables || []).join(", ") || "Database Table"}
- Key Rules: ${f.business_rules.slice(0, 3).join("; ")}`
        )
        .join("\n\n")
    : prd.boundaries.scope.map((s) => `- ${s}`).join("\n")
}

## Non-Goals (DO NOT IMPLEMENT / AVOID SCOPE CREEP):
${prd.boundaries.non_goals.map((ng) => `- ${ng}`).join("\n")}

## Guardrails:
${prd.ai_specific.guardrails.map((gr) => `- ${gr}`).join("\n")}

## Database Strategy:
Generate clean database migration tables, indexes, and models dynamically as needed based on the specifications in docs/PRD.md and architecture diagrams.

## Implementation Tasks (Execute in Order):
${prd.task_breakdown.map((t, idx) => `${idx + 1}. ${t}`).join("\n")}
`;
  };

  const handleDownloadMarkdown = () => {
    const text = formatAsMarkdown();
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prd.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-prd.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const text = JSON.stringify(prd, null, 2);
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prd.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-prd.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(formatAsMarkdown());
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleCopyCursorRules = () => {
    navigator.clipboard.writeText(generateCursorRulesSnippet());
    setCopiedCursorRules(true);
    setTimeout(() => setCopiedCursorRules(false), 2000);
  };

  const handleCopyAllTasks = () => {
    const tasksPrompt = `Berikut checklist task implementasi dari PRD "${prd.title}":\n\n${prd.task_breakdown
      .map((t, i) => `${i + 1}. ${t}`)
      .join("\n")}\n\nMohon selesaikan task di atas secara bertahap dan patuhi Behavior Contract serta Guardrails PRD.`;
    navigator.clipboard.writeText(tasksPrompt);
    setCopiedAllTasks(true);
    setTimeout(() => setCopiedAllTasks(false), 2000);
  };

  const handleCopySingleTask = (task: string, index: number) => {
    navigator.clipboard.writeText(task);
    setCopiedTaskIndex(index);
    setTimeout(() => setCopiedTaskIndex(null), 2000);
  };

  const renderTextWithAssumption = (text: string) => {
    if (!text) return <span>—</span>;
    if (text.includes("[asumsi]") || text.includes("[asumsi] ") || text.includes("[assumption]")) {
      const clean = text.replace(/\[asumsi\]\s*|\[assumption\]\s*/gi, "");
      return (
        <span className="inline">
          <span className={`mr-1.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${
            isLight
              ? "bg-amber-100 text-amber-800 border-amber-300"
              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
          }`}>
            [Asumsi AI]
          </span>
          <span>{clean}</span>
        </span>
      );
    }
    return <span>{text}</span>;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Bar with metadata and action buttons */}
      <div className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 transition-colors ${
        isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"
      }`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToEdit}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isLight
                ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali Edit</span>
          </button>
          <div>
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> PRD MENDALAM SIAP IMPLEMENTASI
            </span>
            <h1 className={`text-base sm:text-lg font-bold line-clamp-1 mt-0.5 ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              {prd.title}
            </h1>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {prd.metadata && (
            <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-mono font-semibold ${
              isLight
                ? "border-slate-300 bg-slate-100 text-slate-600"
                : "border-zinc-800 bg-zinc-900 text-zinc-300"
            }`}>
              <Cpu className="h-3 w-3 text-zinc-400" />
              <span>{prd.metadata.modelUsed}</span>
            </div>
          )}

          {/* Unduh Full Bundle (.ZIP) */}
          <button
            type="button"
            onClick={handleDownloadBundleZip}
            disabled={downloadingZip}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50"
            title="Unduh paket lengkap (.ZIP): .cursorrules, CLAUDE.md, docs/PRD.md, docs/DESIGN.md"
          >
            {downloadingZip ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Package className="h-3.5 w-3.5" />
            )}
            <span>{downloadingZip ? "Membuat ZIP..." : "Unduh Starter Kit (.ZIP)"}</span>
          </button>

          {/* Copy DESIGN.md */}
          <button
            type="button"
            onClick={handleCopyDesignDoc}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isLight
                ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                : "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:text-white"
            }`}
            title="Salin Standar Desain Frontend (DESIGN.md)"
          >
            {copiedDesign ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">DESIGN.md Tersalin!</span>
              </>
            ) : (
              <>
                <Palette className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copy DESIGN.md</span>
              </>
            )}
          </button>

          {/* Copy Cursor Rules */}
          <button
            type="button"
            onClick={handleCopyCursorRules}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isLight
                ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                : "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:text-white"
            }`}
            title="Salin snippet .cursorrules / CLAUDE.md"
          >
            {copiedCursorRules ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Rules Tersalin!</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Copy .cursorrules</span>
              </>
            )}
          </button>

          {/* Salin MD */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isLight
                ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                : "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:text-white"
            }`}
          >
            {copiedMarkdown ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                <span>Salin Markdown</span>
              </>
            )}
          </button>

          {/* Unduh .MD */}
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Unduh .MD</span>
          </button>

          {/* Unduh .JSON */}
          <button
            type="button"
            onClick={handleDownloadJSON}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isLight
                ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                : "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:text-white"
            }`}
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span>Unduh .JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={`flex flex-wrap border rounded-xl p-1 gap-1 transition-colors ${
        isLight ? "bg-slate-100 border-slate-200" : "bg-[#121215] border-zinc-800"
      }`}>
        <button
          type="button"
          onClick={() => setActiveTab("doc")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === "doc"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Dokumen PRD Lengkap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tree")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === "tree"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <FolderTree className="h-4 w-4 text-amber-400" />
          <span>Pohon Fitur (Fase 1-4)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("design")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === "design"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <Palette className="h-4 w-4 text-emerald-500" />
          <span>Standar Desain (DESIGN.md)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("diagrams")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === "diagrams"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <Network className="h-4 w-4 text-amber-500" />
          <span>Diagram Arsitektur (5 Mermaid)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mindmap")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === "mindmap"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <GitFork className="h-4 w-4 text-blue-500" />
          <span>Visual Mindmap (Infografis)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === "tasks"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <CheckSquare className="h-4 w-4 text-purple-500" />
          <span>Coding Task Checklist ({prd.task_breakdown.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("roadmap")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === "roadmap"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <Compass className="h-4 w-4 text-amber-500" />
          <span>Roadmap Pemula (Panduan AI)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("json")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === "json"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>Raw JSON</span>
        </button>
      </div>

      {/* TAB: Phased Feature Tree (Roadmap Visual Berfase FASE 1 - 4) */}
      {activeTab === "tree" && <PhasedFeatureTree prd={prd} theme={theme} />}

      {/* TAB 1: Formatted Document */}
      {activeTab === "doc" && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className={`rounded-xl border p-6 space-y-4 ${
            isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"
          }`}>
            <div className="flex items-center gap-2">
              <BookmarkCheck className="h-4 w-4 text-amber-500" />
              <h2 className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                Executive Architecture Overview
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`font-semibold text-[11px] uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  🎯 Inisiatif Utama
                </span>
                <p className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>{prd.title}</p>
                {prd.archetype_detection && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      🏛️ {prd.archetype_detection.archetype}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Target: <strong className={isLight ? "text-slate-700" : "text-zinc-200"}>{prd.archetype_detection.target_audience}</strong>
                    </span>
                  </div>
                )}
              </div>
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`font-semibold text-[11px] uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  👤 Primary Owner & Review Cadence
                </span>
                <p className={`font-medium ${isLight ? "text-slate-800" : "text-white"}`}>
                  {renderTextWithAssumption(prd.ownership_action.primary_owner)} (
                  {renderTextWithAssumption(prd.ownership_action.decision_points)})
                </p>
                {prd.archetype_detection?.ui_personality && (
                  <div className="mt-2 text-[11px] text-zinc-400">
                    <span className="font-semibold text-zinc-500">Design Mood: </span>
                    <span className="italic">{prd.archetype_detection.ui_personality}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 1. Opportunity Framing */}
          <div className={`rounded-xl border p-6 ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"}`}>
            <div className="mb-4 flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold border ${
                isLight ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-zinc-800 text-zinc-300 border-zinc-700"
              }`}>
                1
              </span>
              <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                Opportunity Framing
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Core Problem
                </span>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {renderTextWithAssumption(prd.opportunity_framing.core_problem)}
                </p>
              </div>
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Working Hypothesis
                </span>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {renderTextWithAssumption(prd.opportunity_framing.working_hypothesis)}
                </p>
              </div>
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Strategy Fit
                </span>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {renderTextWithAssumption(prd.opportunity_framing.strategy_fit)}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Boundaries & Deep Feature Architecture */}
          <div className={`rounded-xl border p-6 space-y-6 ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-zinc-800/40">
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold border ${
                  isLight ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-zinc-800 text-zinc-300 border-zinc-700"
                }`}>
                  2
                </span>
                <div>
                  <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                    Boundaries & Deep Feature Architecture
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Spesifikasi fitur MVP dibedah tuntas: Alur Happy Path, Aturan Bisnis, Edge Cases, dan Prompt Cursor.
                  </p>
                </div>
              </div>
              {prd.feature_breakdown && prd.feature_breakdown.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {prd.feature_breakdown.filter((f) => f.priority === "P0").length} Fitur P0 (Core MVP)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {prd.feature_breakdown.filter((f) => f.priority === "P1").length} Fitur P1
                  </span>
                </div>
              )}
            </div>

            {/* Deep Feature Cards / Accordion */}
            {prd.feature_breakdown && prd.feature_breakdown.length > 0 ? (
              <div className="space-y-4">
                {prd.feature_breakdown.map((feat, idx) => {
                  const isExpanded = expandedFeatureId === feat.id;
                  const isP0 = feat.priority === "P0";

                  return (
                    <div
                      key={feat.id || idx}
                      className={`rounded-xl border transition-all ${
                        isLight
                          ? isExpanded
                            ? "bg-slate-50/80 border-slate-300 shadow-sm"
                            : "bg-white border-slate-200 hover:border-slate-300"
                          : isExpanded
                          ? "bg-zinc-900/90 border-zinc-700 shadow-lg"
                          : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {/* Feature Card Header */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div
                          className="flex items-start gap-3 cursor-pointer flex-1"
                          onClick={() => setExpandedFeatureId(isExpanded ? null : feat.id)}
                        >
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border shrink-0 mt-0.5 ${
                              isP0
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {feat.priority}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                                #{idx + 1}. {feat.name}
                              </h4>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1 italic">
                              "{feat.user_story}"
                            </p>
                          </div>
                        </div>

                        {/* Actions: Copy Prompt & Expand */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyFeaturePrompt(feat.id, feat.agent_prompt || feat.name);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              copiedFeatureId === feat.id
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : isLight
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                            }`}
                            title="Salin prompt spesifik untuk di-paste langsung ke Cursor / Claude Code"
                          >
                            {copiedFeatureId === feat.id ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Prompt Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Terminal className="h-3.5 w-3.5 text-amber-400" />
                                <span>Salin Prompt AI</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setExpandedFeatureId(isExpanded ? null : feat.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Feature Details */}
                      {isExpanded && (
                        <div className={`p-4 pt-0 border-t space-y-4 text-xs ${isLight ? "border-slate-200" : "border-zinc-800/80"}`}>
                          {/* User Story */}
                          <div className={`p-3 rounded-lg border mt-3 ${isLight ? "bg-white border-slate-200" : "bg-zinc-950/80 border-zinc-800"}`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block mb-1">
                              🎯 User Story
                            </span>
                            <p className={`leading-relaxed ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
                              {feat.user_story}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Happy Path */}
                            <div className={`p-3 rounded-lg border ${isLight ? "bg-white border-slate-200" : "bg-zinc-950/80 border-zinc-800"}`}>
                              <div className="flex items-center gap-1.5 mb-2 font-bold text-emerald-500">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span className="uppercase tracking-wider text-[10px]">Alur Kerja (Happy Path)</span>
                              </div>
                              <ol className="space-y-1.5 list-decimal list-inside text-zinc-300">
                                {(feat.happy_path || []).map((step, sIdx) => (
                                  <li key={sIdx} className="leading-relaxed">
                                    <span className={isLight ? "text-slate-700" : "text-zinc-300"}>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {/* Business Rules */}
                            <div className={`p-3 rounded-lg border ${isLight ? "bg-white border-slate-200" : "bg-zinc-950/80 border-zinc-800"}`}>
                              <div className="flex items-center gap-1.5 mb-2 font-bold text-amber-500">
                                <Zap className="h-3.5 w-3.5" />
                                <span className="uppercase tracking-wider text-[10px]">Aturan Bisnis & Validasi</span>
                              </div>
                              <ul className="space-y-1.5 text-zinc-300">
                                {(feat.business_rules || []).map((rule, rIdx) => (
                                  <li key={rIdx} className="flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span className={isLight ? "text-slate-700" : "text-zinc-300"}>{rule}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Edge Cases */}
                            <div className={`p-3 rounded-lg border ${isLight ? "bg-white border-slate-200" : "bg-zinc-950/80 border-zinc-800"}`}>
                              <div className="flex items-center gap-1.5 mb-2 font-bold text-rose-400">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                <span className="uppercase tracking-wider text-[10px]">Kondisi Gagal & Error Handling</span>
                              </div>
                              <ul className="space-y-1.5 text-zinc-300">
                                {(feat.edge_cases || []).map((edge, eIdx) => (
                                  <li key={eIdx} className="flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span className={isLight ? "text-slate-700" : "text-zinc-300"}>{edge}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Tech & Data Mapping */}
                            <div className={`p-3 rounded-lg border ${isLight ? "bg-white border-slate-200" : "bg-zinc-950/80 border-zinc-800"}`}>
                              <div className="flex items-center gap-1.5 mb-2 font-bold text-blue-400">
                                <Layers className="h-3.5 w-3.5" />
                                <span className="uppercase tracking-wider text-[10px]">Komponen & Data Mapping</span>
                              </div>
                              <div className="space-y-1.5 text-[11px]">
                                <div>
                                  <span className="text-zinc-500 font-semibold">Komponen UI: </span>
                                  <span className="font-mono text-zinc-300">
                                    {(feat.tech_mapping?.frontend_components || []).join(", ") || "Komponen React/Next"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-zinc-500 font-semibold">API Endpoint: </span>
                                  <span className="font-mono text-zinc-300">
                                    {(feat.tech_mapping?.api_endpoints || []).join(", ") || "API Route Handler"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-zinc-500 font-semibold">Tabel Database: </span>
                                  <span className="font-mono text-zinc-300">
                                    {(feat.tech_mapping?.db_tables || []).join(", ") || "Tabel Terkait"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Agent Prompt Block */}
                          {feat.agent_prompt && (
                            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                                  <Terminal className="h-3 w-3 text-amber-400" />
                                  Prompt Siap Eksekusi (Cursor / Claude Code):
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyFeaturePrompt(feat.id, feat.agent_prompt)}
                                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                                >
                                  <Copy className="h-3 w-3" />
                                  Salin
                                </button>
                              </div>
                              <p className="font-mono text-[11px] text-zinc-300 leading-relaxed bg-black/40 p-2.5 rounded border border-zinc-800/80 whitespace-pre-wrap">
                                {feat.agent_prompt}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback for legacy PRDs without feature_breakdown */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`rounded-lg border p-4 ${
                  isLight ? "bg-emerald-50/50 border-emerald-200" : "bg-emerald-950/10 border-emerald-900/40"
                }`}>
                  <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Scope (Fitur yang Dikerjakan)</span>
                  </div>
                  <ul className={`space-y-2 text-xs ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                    {prd.boundaries.scope.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{renderTextWithAssumption(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Non-Goals (Explicitly Out of Scope) */}
            <div className={`rounded-lg border p-4 ${
              isLight ? "bg-rose-50/50 border-rose-200" : "bg-rose-950/10 border-rose-900/40"
            }`}>
              <div className="flex items-center gap-2 mb-2 text-rose-500 font-bold text-xs">
                <XCircle className="h-4 w-4" />
                <span>Non-Goals (DILARANG / SENGAJA DITUNDA PADA MVP)</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-2">
                Pagar pembatas mutlak agar tim dan coding agent tidak melakukan over-engineering atau scope creep.
              </p>
              <ul className={`space-y-2 text-xs ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                {prd.boundaries.non_goals.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{renderTextWithAssumption(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Success Measurement */}
          <div className={`rounded-xl border p-6 ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"}`}>
            <div className="mb-4 flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold border ${
                isLight ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-zinc-800 text-zinc-300 border-zinc-700"
              }`}>
                3
              </span>
              <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                Success Measurement
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Offline Golden Set
                </span>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {renderTextWithAssumption(prd.success_measurement.offline_golden_set)}
                </p>
              </div>
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Human Review
                </span>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {renderTextWithAssumption(prd.success_measurement.human_review)}
                </p>
              </div>
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Online Metrics
                </span>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {renderTextWithAssumption(prd.success_measurement.online_metrics)}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Rollout Plan */}
          <div className={`rounded-xl border p-6 ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"}`}>
            <div className="mb-4 flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold border ${
                isLight ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-zinc-800 text-zinc-300 border-zinc-700"
              }`}>
                4
              </span>
              <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                Rollout Plan
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Exposure
                </span>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {renderTextWithAssumption(prd.rollout_plan.exposure)}
                </p>
              </div>
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Duration
                </span>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {renderTextWithAssumption(prd.rollout_plan.duration)}
                </p>
              </div>
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Segments & Gates
                </span>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {renderTextWithAssumption(prd.rollout_plan.segments_gates)}
                </p>
              </div>
            </div>
          </div>

          {/* 5. Risk Management */}
          <div className={`rounded-xl border p-6 ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"}`}>
            <div className="mb-4 flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold border ${
                isLight ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-zinc-800 text-zinc-300 border-zinc-700"
              }`}>
                5
              </span>
              <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                Risk Management
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Detection Mechanism
                </span>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {renderTextWithAssumption(prd.risk_management.detection)}
                </p>
              </div>
              <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Fallback & Kill Switch
                </span>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {renderTextWithAssumption(prd.risk_management.fallback_kill_switch)}
                </p>
              </div>
            </div>
          </div>

          {/* 6. AI-Specific Additions */}
          <div className={`rounded-xl border p-6 space-y-4 ${
            isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"
          }`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-purple-500" />
              <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                Behavior Contract & Guardrails untuk AI Agent
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`rounded-lg border p-4 ${
                isLight ? "bg-emerald-50/50 border-emerald-200" : "bg-emerald-950/10 border-emerald-900/40"
              }`}>
                <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block mb-2">
                  [GOOD] Standar Implementasi Wajib
                </span>
                <ul className={`space-y-1.5 text-xs ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {prd.ai_specific.behavior_contract.good.map((g, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{renderTextWithAssumption(g)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`rounded-lg border p-4 ${
                isLight ? "bg-rose-50/50 border-rose-200" : "bg-rose-950/10 border-rose-900/40"
              }`}>
                <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block mb-2">
                  [REJECT] Pantangan & Larangan Keras
                </span>
                <ul className={`space-y-1.5 text-xs ${isLight ? "text-slate-700" : "text-zinc-200"}`}>
                  {prd.ai_specific.behavior_contract.reject.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{renderTextWithAssumption(r)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={`rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider block mb-2 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Technical & Ethical Guardrails
              </span>
              <div className="flex flex-wrap gap-2">
                {prd.ai_specific.guardrails.map((gr, i) => (
                  <span
                    key={i}
                    className={`rounded-md border px-2.5 py-1 text-xs ${
                      isLight
                        ? "border-slate-200 bg-white text-slate-700 shadow-2xs"
                        : "border-zinc-800 bg-zinc-900 text-zinc-200"
                    }`}
                  >
                    🛡️ {renderTextWithAssumption(gr)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Standar Desain Frontend (DESIGN.md) */}
      {activeTab === "design" && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className={`rounded-xl border p-5 flex flex-wrap items-center justify-between gap-4 ${
            isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-emerald-500" />
                <h3 className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                  DESIGN.md — Kontrak Desain Anti-AI Slop & UI/UX Standar Tinggi
                </h3>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Menggabungkan struktur <code>awesome-design-md</code> dengan standar kualitas <strong>Taste Skill</strong> (Linear/Vercel/Apple polish).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyDesignDoc}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white transition-colors"
              >
                {copiedDesign ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedDesign ? "DESIGN.md Tersalin!" : "Salin DESIGN.md"}</span>
              </button>
            </div>
          </div>

          {/* Core Visual Rules: Banned vs Enforced */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`rounded-xl border p-5 space-y-3 ${
              isLight ? "bg-rose-50/50 border-rose-200" : "bg-rose-950/10 border-rose-900/40"
            }`}>
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
                <XCircle className="h-4 w-4" />
                <span>Banned (AI Slop Tropes — Dilarang Keras)</span>
              </div>
              <ul className={`text-xs space-y-2 list-disc pl-4 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                <li><strong>NO purple/cyan neon glows</strong> pada background hitam polos.</li>
                <li><strong>NO uncalibrated border radius</strong> (misal modal `rounded-2xl` tapi tombol `rounded-none`).</li>
                <li><strong>NO washed-out low-contrast gray text</strong> yang sulit dibaca di layar HP/monitor.</li>
                <li><strong>NO giant meaningless floating blobs</strong> yang hanya menghabiskan ruang visual.</li>
                <li><strong>NO pure black `rgb(0,0,0)`</strong> yang membuat mata cepat lelah tanpa depth.</li>
              </ul>
            </div>

            <div className={`rounded-xl border p-5 space-y-3 ${
              isLight ? "bg-emerald-50/50 border-emerald-200" : "bg-emerald-950/10 border-emerald-900/40"
            }`}>
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                <span>Enforced (Taste & Precision — Standar Wajib)</span>
              </div>
              <ul className={`text-xs space-y-2 list-disc pl-4 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                <li><strong>Concentric Radius</strong>: <code>outer_radius = inner_radius + padding</code> (sudut rapi dan harmonis).</li>
                <li><strong>Dark Zinc 950 Aesthetic</strong>: Base canvas <code>#09090b</code>, Surface <code>#121215</code>, Border <code>#27272a</code>.</li>
                <li><strong>8pt Spatial Grid</strong>: Margin & padding kelipatan 4px/8px (p-2, p-4, p-6, gap-4).</li>
                <li><strong>Deliberate Micro-interactions</strong>: Hover subtle scale/tint (150ms ease-out), active click feedback.</li>
                <li><strong>High Data Density & Tabular Numbers</strong>: Font mono untuk angka statistik dan harga.</li>
              </ul>
            </div>
          </div>

          {/* Color Palette Swatches */}
          <div className={`rounded-xl border p-5 space-y-4 ${
            isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-zinc-800/60 dark:border-zinc-800">
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
                  <Palette className="h-4 w-4 text-amber-500" />
                  <span>🎨 Palet Warna Terkalibrasi (Design Tokens)</span>
                </h4>
                <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  {palette.moodDescription}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-500">
                  <Palette className="h-3 w-3" />
                  {palette.domain.toUpperCase()}
                </span>
                {palette.hasDashboard && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-[11px] font-bold text-blue-400">
                    <Layers className="h-3 w-3" /> Dashboard App Shell
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-1">
              {/* Primary Accent */}
              <div className={`rounded-lg border p-2.5 transition-all shadow-xs ${
                isLight ? "border-slate-200 bg-slate-50" : "border-zinc-800 bg-[#18181b]"
              }`}>
                <div
                  className="h-9 rounded-md mb-2 shadow-inner border border-black/10"
                  style={{ backgroundColor: palette.primaryHex }}
                />
                <p className={`text-[11px] font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                  Primary Brand
                </p>
                <p className="text-[10px] font-mono opacity-80 mt-0.5">{palette.primaryHex}</p>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{palette.primaryTailwind}</p>
              </div>

              {/* Secondary Accent */}
              <div className={`rounded-lg border p-2.5 transition-all shadow-xs ${
                isLight ? "border-slate-200 bg-slate-50" : "border-zinc-800 bg-[#18181b]"
              }`}>
                <div
                  className="h-9 rounded-md mb-2 shadow-inner border border-black/10"
                  style={{ backgroundColor: palette.accentHex }}
                />
                <p className={`text-[11px] font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                  Secondary Accent
                </p>
                <p className="text-[10px] font-mono opacity-80 mt-0.5">{palette.accentHex}</p>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Highlight</p>
              </div>

              {/* Canvas Base */}
              <div className={`rounded-lg border p-2.5 transition-all shadow-xs ${
                isLight ? "border-slate-200 bg-slate-50" : "border-zinc-800 bg-[#18181b]"
              }`}>
                <div
                  className={`h-9 rounded-md mb-2 border ${
                    isLight ? "bg-slate-50 border-slate-300" : "bg-[#09090b] border-zinc-700"
                  }`}
                />
                <p className={`text-[11px] font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                  Canvas Base
                </p>
                <p className="text-[10px] font-mono opacity-80 mt-0.5">{isLight ? "#f8fafc" : "#09090b"}</p>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{isLight ? "slate-50" : "zinc-950"}</p>
              </div>

              {/* Card Surface */}
              <div className={`rounded-lg border p-2.5 transition-all shadow-xs ${
                isLight ? "border-slate-200 bg-slate-50" : "border-zinc-800 bg-[#18181b]"
              }`}>
                <div
                  className={`h-9 rounded-md mb-2 border ${
                    isLight ? "bg-white border-slate-300" : "bg-[#121215] border-zinc-700"
                  }`}
                />
                <p className={`text-[11px] font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                  Card Surface
                </p>
                <p className="text-[10px] font-mono opacity-80 mt-0.5">{isLight ? "#ffffff" : "#121215"}</p>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{isLight ? "white" : "zinc-900"}</p>
              </div>

              {/* Border Subtle */}
              <div className={`rounded-lg border p-2.5 transition-all shadow-xs ${
                isLight ? "border-slate-200 bg-slate-50" : "border-zinc-800 bg-[#18181b]"
              }`}>
                <div
                  className={`h-9 rounded-md mb-2 border ${
                    isLight ? "bg-slate-200 border-slate-300" : "bg-[#27272a] border-zinc-600"
                  }`}
                />
                <p className={`text-[11px] font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                  Border Subtle
                </p>
                <p className="text-[10px] font-mono opacity-80 mt-0.5">{isLight ? "#e2e8f0" : "#27272a"}</p>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{isLight ? "slate-200" : "zinc-800"}</p>
              </div>

              {/* Success / Valid */}
              <div className={`rounded-lg border p-2.5 transition-all shadow-xs ${
                isLight ? "border-slate-200 bg-slate-50" : "border-zinc-800 bg-[#18181b]"
              }`}>
                <div className="h-9 rounded-md mb-2 bg-emerald-500 border border-emerald-600/30" />
                <p className={`text-[11px] font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                  Success / Active
                </p>
                <p className="text-[10px] font-mono opacity-80 mt-0.5">#10b981</p>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">emerald-500</p>
              </div>

              {/* Danger / Warning */}
              <div className={`rounded-lg border p-2.5 transition-all shadow-xs ${
                isLight ? "border-slate-200 bg-slate-50" : "border-zinc-800 bg-[#18181b]"
              }`}>
                <div className="h-9 rounded-md mb-2 bg-rose-500 border border-rose-600/30" />
                <p className={`text-[11px] font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                  Alert / Danger
                </p>
                <p className="text-[10px] font-mono opacity-80 mt-0.5">#ef4444</p>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">rose-500</p>
              </div>
            </div>
          </div>

          {/* Full Markdown Document Preview */}
          <div className={`relative rounded-xl border p-5 font-mono text-xs overflow-x-auto ${
            isLight ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-zinc-950 text-zinc-200 border-zinc-800"
          }`}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
              <span className="text-zinc-400 text-xs font-bold font-sans">docs/DESIGN.md Full Contract</span>
              <button
                type="button"
                onClick={handleCopyDesignDoc}
                className="flex items-center gap-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-xs text-zinc-200 transition-colors font-sans"
              >
                {copiedDesign ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedDesign ? "Tersalin!" : "Salin Isi File"}</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">{designMarkdown}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: Diagram Arsitektur & ERD (5 Mermaid) */}
      {activeTab === "diagrams" && (
        <div className="space-y-6">
          <div className={`rounded-xl border p-5 flex flex-wrap items-center justify-between gap-4 ${
            isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"
          }`}>
            <div>
              <h3 className={`font-semibold text-sm flex items-center gap-2 ${
                isLight ? "text-slate-900" : "text-white"
              }`}>
                <Network className="h-4 w-4 text-amber-500" />
                <span>5 Blueprint Arsitektur Sistem & Interaksi (Mermaid.js)</span>
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Diagram interaktif alur sistem, user journey sitemap, skema database, matriks API, dan sequence diagram siap pakai untuk AI & engineer.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-500">
                <CheckCircle2 className="h-3 w-3" /> Live Render SVG (Tanpa Kedip)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diagram 1: System Flowchart */}
            <div className="lg:col-span-2">
              <MermaidRenderer
                chart={defaultFlowchart}
                title="1. Alur Data & Arsitektur Sistem (System Data Flowchart)"
                theme={theme}
              />
            </div>

            {/* Diagram 2: User Journey & Sitemap Flow */}
            <div className="lg:col-span-2">
              <MermaidRenderer
                chart={defaultUserJourney}
                title="2. Alur Pengguna & Peta Navigasi Halaman (User Journey & Sitemap Flow)"
                theme={theme}
              />
            </div>

            {/* Diagram 3: Database Schema ERD */}
            <div>
              <MermaidRenderer
                chart={defaultERD}
                title="3. Skema Relasi Database (Entity Relationship Diagram)"
                theme={theme}
              />
            </div>

            {/* Diagram 4: API & Webhook Integration Matrix */}
            <div>
              <MermaidRenderer
                chart={defaultApiMatrix}
                title="4. Matriks Integrasi API & Webhook (API Routes Matrix)"
                theme={theme}
              />
            </div>

            {/* Diagram 5: Sequence Flow */}
            <div className="lg:col-span-2">
              <MermaidRenderer
                chart={defaultSequence}
                title="5. Alur Sekuensial Interaksi Transaksi (Core Sequence Flow)"
                theme={theme}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Visual Mindmap (Recreated Aakash Gupta Infographic) */}
      {activeTab === "mindmap" && <MindmapViewer prd={prd} />}

      {/* TAB 5: Actionable Coding Task Checklist */}
      {activeTab === "tasks" && (
        <div className={`rounded-xl border p-6 space-y-5 ${
          isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"
        }`}>
          <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${
            isLight ? "border-slate-200" : "border-zinc-800"
          }`}>
            <div>
              <h3 className={`font-bold text-base flex items-center gap-2 ${
                isLight ? "text-slate-900" : "text-white"
              }`}>
                <Bot className="h-4 w-4 text-amber-500" />
                <span>Task Breakdown untuk AI Coding Agent</span>
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Checklist task atomic & actionable siap dieksekusi secara berurutan di Cursor, Claude Code, atau Windsurf.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyCursorRules}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isLight
                    ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                    : "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {copiedCursorRules ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span>Copy Cursor Prompt</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyAllTasks}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition-colors"
              >
                {copiedAllTasks ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Semua Task Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin Semua Task</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {prd.task_breakdown.map((task, idx) => (
              <div
                key={idx}
                onClick={() => toggleTask(idx)}
                className={`group flex items-start justify-between gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${
                  completedTasks[idx]
                    ? isLight
                      ? "border-emerald-300 bg-emerald-50/70 opacity-80"
                      : "border-emerald-500/30 bg-emerald-950/10 opacity-75"
                    : isLight
                    ? "border-slate-200 bg-slate-50/60 hover:border-slate-300"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border mt-0.5 transition-colors ${
                      completedTasks[idx]
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isLight
                        ? "border-slate-300 bg-white"
                        : "border-zinc-700 bg-zinc-900"
                    }`}
                  >
                    {completedTasks[idx] && <Check className="h-3 w-3 font-bold" />}
                  </div>
                  <div>
                    <span className={`text-[10px] font-mono font-bold block mb-0.5 ${
                      isLight ? "text-slate-400" : "text-zinc-400"
                    }`}>
                      STEP ${idx + 1}
                    </span>
                    <p
                      className={`text-xs leading-relaxed ${
                        completedTasks[idx]
                          ? isLight
                            ? "line-through text-slate-400"
                            : "line-through text-zinc-500"
                          : isLight
                          ? "text-slate-800"
                          : "text-zinc-200"
                      }`}
                    >
                      {renderTextWithAssumption(task)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopySingleTask(task, idx);
                  }}
                  className={`rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-colors shrink-0 ${
                    isLight
                      ? "text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                      : "text-zinc-500 hover:bg-zinc-800 hover:text-white"
                  }`}
                  title="Salin task ini"
                >
                  {copiedTaskIndex === idx ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Roadmap Pemula & Panduan AI */}
      {activeTab === "roadmap" && (
        <div className={`rounded-xl border p-6 space-y-6 ${
          isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"
        }`}>
          <BeginnerRoadmap theme={theme} />
        </div>
      )}

      {/* TAB 6: Raw JSON */}
      {activeTab === "json" && (
        <div className={`relative rounded-xl border p-5 font-mono text-xs overflow-x-auto ${
          isLight ? "border-slate-200 bg-white text-slate-800" : "border-zinc-800 bg-zinc-950 text-zinc-300"
        }`}>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(prd, null, 2));
            }}
            className={`absolute right-5 top-5 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isLight
                ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                : "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:text-white"
            }`}
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Salin JSON</span>
          </button>
          <pre className="p-2">{JSON.stringify(prd, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
