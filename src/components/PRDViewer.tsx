"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { PRDOutput } from "@/types/prd";
import { MindmapViewer } from "./MindmapViewer";
import { PhasedFeatureTree } from "./PhasedFeatureTree";
import { MermaidRenderer } from "./MermaidRenderer";
import { generateDesignDoc, getDesignPalette, generateAIHarmonicPalette, DesignPalette } from "@/lib/design-template";
import { generateStarterCodebaseZip, detectStackFromPrd } from "@/lib/scaffolder/codebase-scaffolder";
import { BeginnerRoadmap } from "./BeginnerRoadmap";
import { CustomPaletteModal } from "./CustomPaletteModal";
import { synthesizeDynamicArchitectureDiagrams } from "@/lib/gemini/schemas";
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
  Sparkles,
  SlidersHorizontal,
  Lock,
  X,
  ListOrdered,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { hasTierFeature } from "@/lib/supabase/types";

interface PRDViewerProps {
  prd: PRDOutput;
  onBackToEdit: () => void;
  theme?: "dark" | "light";
  onRequireUpgrade?: () => void;
}

export const PRDViewer: React.FC<PRDViewerProps> = ({
  prd,
  onBackToEdit,
  theme = "dark",
  onRequireUpgrade,
}) => {
  const isLight = theme === "light";
  const { profile, systemSettings } = useAuth();
  const userTier = profile?.subscription_tier || 'free';
  const isAdmin = Boolean(profile?.is_admin);

  const canExportZip = hasTierFeature(userTier, 'export_zip', systemSettings, isAdmin);
  const canViewDiagrams = hasTierFeature(userTier, 'architecture_diagrams', systemSettings, isAdmin);

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
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isZipMenuOpen, setIsZipMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const zipMenuRef = useRef<HTMLDivElement>(null);
  const detectedStack = useMemo(() => detectStackFromPrd(prd), [prd]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setIsExportMenuOpen(false);
      }
      if (
        zipMenuRef.current &&
        !zipMenuRef.current.contains(event.target as Node)
      ) {
        setIsZipMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyFeaturePrompt = (featId: string, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedFeatureId(featId);
    setTimeout(() => setCopiedFeatureId(null), 2000);
  };

  const [isRevisionDrawerOpen, setIsRevisionDrawerOpen] = useState(false);
  const [revisionMessages, setRevisionMessages] = useState<
    Array<{ id: string; role: "user" | "assistant"; text: string }>
  >([]);
  const [revisionInput, setRevisionInput] = useState("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  const handleSendRevision = async (textToSend?: string) => {
    const text = (textToSend || revisionInput).trim();
    if (!text || isSubmittingRevision) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      text,
    };
    setRevisionMessages((prev) => [...prev, userMsg]);
    setRevisionInput("");
    setIsSubmittingRevision(true);

    try {
      const res = await fetch("/api/revise-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: text,
          prdTitle: prd.title,
          userId: profile?.id,
        }),
      });
      const data = await res.json();
      const aiReply = data.message || "Instruksi revisi diterima.";
      setRevisionMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          text: aiReply,
        },
      ]);
    } catch {
      setRevisionMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          text: "Gagal terhubung ke AI. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const defaultPalette = useMemo(() => getDesignPalette(prd), [prd]);
  const [activePalette, setActivePalette] = useState<DesignPalette>(defaultPalette);
  const [isCustomColorModalOpen, setIsCustomColorModalOpen] = useState(false);
  const [isGeneratingAIPalette, setIsGeneratingAIPalette] = useState(false);

  useEffect(() => {
    setActivePalette(getDesignPalette(prd));
  }, [prd]);

  const palette = activePalette;
  const designMarkdown = useMemo(() => generateDesignDoc(prd, activePalette), [prd, activePalette]);

  const handleGenerateAIPalette = () => {
    setIsGeneratingAIPalette(true);
    setTimeout(() => {
      const newAI = generateAIHarmonicPalette(prd, activePalette.primaryHex);
      setActivePalette(newAI);
      setIsGeneratingAIPalette(false);
    }, 200);
  };

  const dynamicDiagrams = useMemo(() => {
    return synthesizeDynamicArchitectureDiagrams(
      prd.title,
      prd.archetype_detection,
      prd.feature_breakdown || [],
      prd.architecture_diagrams
    );
  }, [prd.title, prd.archetype_detection, prd.feature_breakdown, prd.architecture_diagrams]);

  const defaultFlowchart = useMemo(() => {
    return dynamicDiagrams.system_flowchart || `graph TD
  User([Pengguna]) --> WebApp[Web Frontend]
  WebApp --> API[Backend API Routes]
  API --> Auth[Auth & Security Guardrails]
  API --> Service[Core Business Services]
  Service --> DB[(Primary Database)]
  Service --> Cache[(Redis / In-Memory Cache)]
  Service --> ThirdParty[External Integrations]`;
  }, [dynamicDiagrams.system_flowchart]);

  const defaultERD = useMemo(() => {
    return dynamicDiagrams.database_erd;
  }, [dynamicDiagrams.database_erd]);

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
  Client --> API1 & API2 & API3
  API1 --> AI
  API2 --> DB
  API3 --> DB`
    );
  }, [prd.architecture_diagrams?.api_integration_matrix]);

  const defaultInfraTopology = useMemo(() => {
    return (
      prd.architecture_diagrams?.infrastructure_topology ||
      `flowchart LR
  CDN["CDN / Cloudflare\\n(SSL + DDoS Protection)"]
  Nginx["Nginx Reverse Proxy\\n(Port 80/443)"]
  App["App Server\\n(Next.js Docker Container)"]
  DB[(PostgreSQL Database)]
  Redis[(Redis Cache & Queue)]
  Storage["Object Storage\\n(Assets & Media)"]

  CDN --> Nginx
  Nginx --> App
  App --> DB
  App --> Redis
  App --> Storage`
    );
  }, [prd.architecture_diagrams?.infrastructure_topology]);

  const defaultRBAC = useMemo(() => {
    return (
      prd.architecture_diagrams?.rbac_permission_matrix ||
      `flowchart TD
  Root["Peran & Hak Akses (RBAC)"]
  Root --> SA["Super Admin\\n(Akses Penuh Sistem)"]
  Root --> Admin["Manager / Operator\\n(Kelola Operasional)"]
  Root --> User["User Reguler\\n(Akses Layanan Utama)"]
  Root --> Guest["Guest / Tamu\\n(Katalog & Login)"]

  SA --> P1["Konfigurasi Global & API Keys"]
  SA --> P2["Audit Log & Manajemen Pengguna"]
  Admin --> P3["Verifikasi & Proses Transaksi"]
  Admin --> P4["Lihat Laporan & Ringkasan"]
  User --> P5["Buat Transaksi & Input Data"]
  User --> P6["Kelola Profil & Notifikasi"]
  Guest --> P7["Lihat Landing Page & Detail"]`
    );
  }, [prd.architecture_diagrams?.rbac_permission_matrix]);

  const defaultDataPipeline = useMemo(() => {
    return (
      prd.architecture_diagrams?.data_pipeline_flow ||
      `flowchart LR
  Trigger["Trigger Input\\n(User Action / Webhook)"]
  Validate["Validasi & Sanitasi\\n(Zod Schema Guard)"]
  Queue["Message Queue\\n(Asynchronous Job)"]
  Worker["Worker Engine\\n(AI / Data Processing)"]
  Storage["Penyimpanan Data\\n(PostgreSQL + Audit Log)"]
  Output["Notifikasi Output\\n(WA / Email / Realtime Event)"]

  Trigger --> Validate
  Validate --> Queue
  Queue --> Worker
  Worker --> Storage
  Storage --> Output`
    );
  }, [prd.architecture_diagrams?.data_pipeline_flow]);


  const handleDownloadBundleZip = async (mode: "full_starter" | "docs_only" = "full_starter") => {
    if (!canExportZip) {
      if (onRequireUpgrade) onRequireUpgrade();
      return;
    }

    setDownloadingZip(true);
    try {
      const { blob, filename } = await generateStarterCodebaseZip(prd, { mode });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
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
*Design Standards: Vercel Web Interface Guidelines & Linear App Taste System*

## Role & Mission
You are an expert fullstack software architect and senior UI engineer implementing: "${prd.title}".
Your single source of truth for features is \`docs/PRD.md\` and visual system is \`docs/DESIGN.md\`.

## 1. MANDATORY DESIGN SYSTEM & STRICT ZERO-EMOJI POLICY
1. **READ AND ENFORCE \`docs/DESIGN.md\` FIRST**: Before generating any UI component, page, or layout, you MUST read \`docs/DESIGN.md\` and adhere strictly to its color tokens, layout contracts, and component blueprints.
2. **ABSOLUTE ZERO EMOJI POLICY**:
   - NEVER use raw emojis (such as ✨, 🚀, 🌟, 🔥, 💡, 🤖, 📈, 🎉) anywhere in JSX/HTML, page headings, button text, feature cards, or badges.
   - ALL icons must strictly use monochrome vector SVGs from **Lucide React** (\`lucide-react\`) sized precisely between 16px and 20px.
   - No sparkles, no particle orbs, no floating fuzzy dots.
3. **VERCEL & LINEAR TASTE ENGINEERING**:
   - **Deep Dark Mode**: Never use pure \`#000000\`. Use deep zinc \`#09090b\` for canvas and \`#121215\` for cards with crisp 1px \`border-zinc-800\`.
   - **Concentric Radius**: Optical radius formula: outer_radius = inner_radius + padding.
   - **Tabular Numbers**: Apply \`tabular-nums\` or \`font-mono\` on all counters, metrics, tables, currency, and IDs to eliminate layout jitter.
   - **Tactile Press Feedback**: Interactive buttons must use \`active:scale-[0.98]\` and smooth CSS transitions.

## 2. MULTI-SURFACE APP SHELL ARCHITECTURE CONTRACT
If this project involves public visitors, authenticated users, and administrators, you MUST organize code into separated Next.js App Router Route Groups. DO NOT merge everything into a single flat page!
1. **Public Marketing Surface (\`app/(marketing)/page.tsx\`)**:
   - Navbar with brand logo, nav links, and Login/CTA.
   - High-conversion Hero, Feature cards, Social proof / Testimonials, FAQ, and Footer.
2. **User Dashboard Surface (\`app/(dashboard)/layout.tsx\`)**:
   - **MANDATORY Left Collapsible Sidebar**: \`w-64\` on desktop, collapsible to \`w-16\` icon-only mode with active indicator and user profile footer.
   - Sticky Header (\`h-16\`) with Breadcrumbs, Global Search (\`⌘K\`), and notifications.
   - Mobile Sheet Drawer triggered by a hamburger button on screens < md.
3. **Admin Panel Surface (\`app/(admin)/layout.tsx\`)**:
   - Dedicated Admin Sidebar with administrative links and Role-Based Access Guard.
   - Dense data tables with sorting, filtering, and status badges.

## 3. Autonomous Execution & Frontend-First Strategy
- Work continuously through tasks without stopping to ask permission for routine development decisions.
- Build the comprehensive responsive frontend, layout shell, and complete user navigation flow first with realistic mock data before connecting backend databases.
- Proactively architect necessary database tables, RLS policies, indexes, and Zod validations even if omitted from the initial PRD text.

## 4. Behavior Contract (Strict Enforcement)
### GOOD (Always Do):
${prd.ai_specific.behavior_contract.good.map((g) => `- ${g}`).join("\n")}

### REJECT (Never Do):
${prd.ai_specific.behavior_contract.reject.map((r) => `- ${r}`).join("\n")}

## 5. Core MVP Features to Implement:
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

## 6. Non-Goals (DO NOT IMPLEMENT / AVOID SCOPE CREEP):
${prd.boundaries.non_goals.map((ng) => `- ${ng}`).join("\n")}

## 7. Guardrails:
${prd.ai_specific.guardrails.map((gr) => `- ${gr}`).join("\n")}

## 8. Implementation Tasks (Execute in Order):
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3 sm:px-4 sm:py-2.5 transition-colors ${
        isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"
      }`}>
        {/* Left Title & Return button */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBackToEdit}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kembali Edit</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <h1 className={`text-xs sm:text-sm font-bold truncate ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              {prd.title}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="h-2.5 w-2.5" /> SIAP IMPLEMENTASI
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {/* 1. Primary CTA: Unduh Starter Proyek (Split Button) */}
          <div className="relative inline-flex items-center" ref={zipMenuRef}>
            <button
              type="button"
              onClick={() => handleDownloadBundleZip("full_starter")}
              disabled={downloadingZip}
              className={`inline-flex items-center gap-1.5 rounded-l-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs ${
                !canExportZip
                  ? "bg-zinc-900 border border-amber-500/40 text-zinc-200 hover:border-amber-400 hover:text-white"
                  : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20"
              }`}
              title={canExportZip ? `Unduh Starter Proyek (${detectedStack.name}) lengkap dengan kode sumber, PRD, dan rules` : "Fitur unduh Starter Proyek (.ZIP) memerlukan paket langganan"}
            >
              {downloadingZip ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : !canExportZip ? (
                <Lock className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Package className="h-3.5 w-3.5" />
              )}
              <span>{downloadingZip ? "Membuat ZIP..." : "Starter Proyek (.ZIP)"}</span>
              {!canExportZip && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  PRO
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsZipMenuOpen(!isZipMenuOpen)}
              disabled={downloadingZip}
              className={`border-l border-emerald-600/30 rounded-r-xl px-1.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                !canExportZip
                  ? "bg-zinc-900 border-amber-500/40 text-zinc-200 hover:text-white"
                  : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
              }`}
              title="Opsi Unduh Kode / Dokumen"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${isZipMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isZipMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-zinc-800 bg-[#0c0c0e]/95 backdrop-blur-md p-1.5 text-xs shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setIsZipMenuOpen(false);
                    handleDownloadBundleZip("full_starter");
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer flex flex-col items-start"
                >
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-emerald-400" />
                    Starter Proyek (.ZIP)
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                    Repo koding utuh ({detectedStack.name}) + rules + PRD + diagram
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsZipMenuOpen(false);
                    handleDownloadBundleZip("docs_only");
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer border-t border-zinc-800/80 mt-1 flex flex-col items-start"
                >
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-400" />
                    Dokumen Saja (.ZIP)
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                    Hanya berkas PRD.md, DESIGN.md, diagram .mmd, dan rules
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Salin PRD Markdown */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              copiedMarkdown
                ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                : isLight
                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                : "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800"
            }`}
            title="Salin seluruh isi dokumen PRD dalam format Markdown"
          >
            {copiedMarkdown ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Salin PRD</span>
              </>
            )}
          </button>

          {/* 4. Ekspor & Rules Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                isExportMenuOpen
                  ? "border-zinc-600 bg-zinc-800 text-white"
                  : isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800"
              }`}
              title="Opsi Ekspor & Salin Rules"
            >
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Ekspor & Rules</span>
              <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${isExportMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-800 bg-[#0c0c0e]/95 backdrop-blur-md p-1.5 text-xs shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    handleCopyCursorRules();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-zinc-200 hover:bg-zinc-800/80 hover:text-white transition-colors cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Copy .cursorrules</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCopyDesignDoc();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-zinc-200 hover:bg-zinc-800/80 hover:text-white transition-colors cursor-pointer"
                >
                  <Palette className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copy DESIGN.md</span>
                </button>
                <div className="h-px bg-zinc-800 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadMarkdown();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-zinc-200 hover:bg-zinc-800/80 hover:text-white transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-amber-400" />
                  <span>Unduh Markdown (.MD)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadJSON();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-zinc-200 hover:bg-zinc-800/80 hover:text-white transition-colors cursor-pointer"
                >
                  <Code2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Unduh Raw JSON (.JSON)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Single Row with Smooth Horizontal Scroll) */}
      <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto no-scrollbar transition-colors ${
        isLight ? "bg-slate-100/80 border-slate-200" : "bg-[#101216]/90 border-zinc-800/80 backdrop-blur-md"
      }`}>
        <button
          type="button"
          onClick={() => setActiveTab("doc")}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "doc"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs border border-zinc-700/60"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-amber-400" />
          <span>Dokumen PRD</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tree")}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "tree"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs border border-zinc-700/60"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <FolderTree className="h-3.5 w-3.5 text-amber-400" />
          <span>Pohon Fitur</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("design")}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "design"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs border border-zinc-700/60"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Palette className="h-3.5 w-3.5 text-emerald-400" />
          <span>Standar Desain</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("diagrams")}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "diagrams"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs border border-zinc-700/60"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Network className="h-3.5 w-3.5 text-amber-400" />
          <span>Diagram Arsitektur</span>
          {!canViewDiagrams && <Lock className="h-3 w-3 text-amber-400 shrink-0" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mindmap")}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "mindmap"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs border border-zinc-700/60"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <GitFork className="h-3.5 w-3.5 text-blue-400" />
          <span>Visual Mindmap</span>
          {!canViewDiagrams && <Lock className="h-3 w-3 text-amber-400 shrink-0" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "tasks"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs border border-zinc-700/60"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5 text-purple-400" />
          <span>Coding Checklist ({prd.task_breakdown.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("roadmap")}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "roadmap"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs border border-zinc-700/60"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Compass className="h-3.5 w-3.5 text-amber-400" />
          <span>Panduan AI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("json")}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "json"
              ? isLight
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "bg-zinc-800 text-white shadow-xs border border-zinc-700/60"
              : isLight
              ? "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
          }`}
        >
          <Code2 className="h-3.5 w-3.5 text-zinc-400" />
          <span>Raw JSON</span>
        </button>
      </div>

      {/* TAB: Phased Feature Tree (Roadmap Visual Berfase FASE 1 - 4) */}
      {activeTab === "tree" && <PhasedFeatureTree prd={prd} theme={theme} />}

      {/* TAB 1: Formatted Document */}
      {activeTab === "doc" && (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sticky TOC Navigation (Desktop) */}
          <div className={`hidden lg:block w-52 shrink-0 sticky top-6 rounded-2xl border p-4 space-y-1.5 ${
            isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest block mb-2 px-1 ${
              isLight ? "text-slate-400" : "text-zinc-500"
            }`}>
              Daftar Isi PRD
            </span>
            {[
              { id: "sec-overview", label: "1. Overview & Inisiatif" },
              { id: "sec-opportunity", label: "2. Opportunity Framing" },
              { id: "sec-boundaries", label: "3. Scope & Non-Goals" },
              { id: "sec-features", label: "4. Rincian Fitur Inti" },
              { id: "sec-success", label: "5. Ukuran Keberhasilan" },
              { id: "sec-rollout", label: "6. Rencana Rollout" },
              { id: "sec-risk", label: "7. Manajemen Risiko" },
              { id: "sec-ai", label: "8. Kontrak Koding AI" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block text-xs py-1.5 px-2.5 rounded-lg transition-colors font-medium ${
                  isLight
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Main Clean Document Flow (Notion / Stripe Docs Style) */}
          <div className={`flex-1 min-w-0 rounded-2xl border p-6 sm:p-10 space-y-10 ${
            isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-[#0f1117] border-zinc-800 text-zinc-100 shadow-xl"
          }`}>
            {/* Header Document */}
            <div id="sec-overview" className="space-y-4 pb-8 border-b border-zinc-800/80">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-amber-500 font-bold uppercase tracking-widest text-[11px]">
                  PRD Spesifikasi Teknis
                </span>
                {prd.archetype_detection && (
                  <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Arketipe: {prd.archetype_detection.archetype}
                  </span>
                )}
                {prd.archetype_detection?.ui_personality && (
                  <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] text-zinc-400 bg-zinc-800/60 border border-zinc-700/60">
                    Aesthetic: {prd.archetype_detection.ui_personality}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {prd.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Primary Owner</span>
                  <p className="font-semibold text-zinc-200">{renderTextWithAssumption(prd.ownership_action.primary_owner)}</p>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Decision Points</span>
                  <p className="text-zinc-300">{renderTextWithAssumption(prd.ownership_action.decision_points)}</p>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Target Audience</span>
                  <p className="text-zinc-300">{prd.archetype_detection?.target_audience || "Pengembang & Pengguna Akhir"}</p>
                </div>
              </div>
            </div>

            {/* 1. Opportunity Framing */}
            <section id="sec-opportunity" className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/60">
                <span className="text-xs font-mono font-bold text-amber-400">01</span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Opportunity Framing
                </h2>
              </div>
              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Masalah Utama (Core Problem)
                  </h4>
                  <p className={`text-xs ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                    {renderTextWithAssumption(prd.opportunity_framing.core_problem)}
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Hipotesis Kerja (Working Hypothesis)
                  </h4>
                  <p className={`text-xs ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                    {renderTextWithAssumption(prd.opportunity_framing.working_hypothesis)}
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Kesesuaian Strategis (Strategy Fit)
                  </h4>
                  <p className={`text-xs ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                    {renderTextWithAssumption(prd.opportunity_framing.strategy_fit)}
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Scope & Non-Goals */}
            <section id="sec-boundaries" className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/60">
                <span className="text-xs font-mono font-bold text-amber-400">02</span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Scope & Non-Goals
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Ruang Lingkup (Scope MVP)</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {prd.boundaries.scope.map((item, i) => (
                      <li key={i} className={`flex items-start gap-2 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{renderTextWithAssumption(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Di Luar Cakupan (Non-Goals)</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {prd.boundaries.non_goals.map((item, i) => (
                      <li key={i} className={`flex items-start gap-2 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{renderTextWithAssumption(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Deep Feature Architecture */}
            <section id="sec-features" className="space-y-4">
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-amber-400">03</span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                    Rincian Fitur Inti (Feature Breakdown)
                  </h2>
                </div>
                {prd.feature_breakdown && prd.feature_breakdown.length > 0 && (
                  <span className="text-[10px] font-mono text-zinc-400">
                    {prd.feature_breakdown.length} modul terencana
                  </span>
                )}
              </div>

              {prd.feature_breakdown && prd.feature_breakdown.length > 0 ? (
                <div className="space-y-3">
                  {prd.feature_breakdown.map((feat, idx) => {
                    const isExpanded = expandedFeatureId === feat.id;
                    return (
                      <div
                        key={feat.id || idx}
                        className={`rounded-xl border transition-all ${
                          isLight
                            ? "border-slate-200 bg-slate-50/50"
                            : "border-zinc-800 bg-zinc-900/40"
                        }`}
                      >
                        <div
                          onClick={() => setExpandedFeatureId(isExpanded ? null : feat.id)}
                          className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                              feat.priority === "P0"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            }`}>
                              {feat.priority || "P0"}
                            </span>
                            <h4 className={`text-xs font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                              {feat.name}
                            </h4>
                          </div>
                          <button
                            type="button"
                            className="text-zinc-500 hover:text-white p-1"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className={`p-4 pt-0 border-t space-y-3 text-xs ${
                            isLight ? "border-slate-200 text-slate-700" : "border-zinc-800/80 text-zinc-300"
                          }`}>
                            <p className="italic text-zinc-400 text-[11px] pt-3">
                              "{feat.user_story}"
                            </p>

                            {feat.happy_path && feat.happy_path.length > 0 && (
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                                  Happy Path
                                </span>
                                <ul className="space-y-1 pl-3 border-l border-emerald-500/30">
                                  {feat.happy_path.map((step, si) => (
                                    <li key={si}>{renderTextWithAssumption(step)}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {feat.business_rules && feat.business_rules.length > 0 && (
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                                  Aturan Bisnis
                                </span>
                                <ul className="space-y-1 pl-3 border-l border-amber-500/30">
                                  {feat.business_rules.map((rule, ri) => (
                                    <li key={ri}>{renderTextWithAssumption(rule)}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {feat.agent_prompt && (
                              <div className="pt-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                                    Prompt Coding Agent
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyFeaturePrompt(feat.id, feat.agent_prompt || "");
                                    }}
                                    className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white"
                                  >
                                    {copiedFeatureId === feat.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                    <span>{copiedFeatureId === feat.id ? "Tersalin!" : "Salin Prompt"}</span>
                                  </button>
                                </div>
                                <pre className="p-2.5 rounded-lg bg-black/40 border border-zinc-800 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap">
                                  {feat.agent_prompt}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {prd.boundaries.scope.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{renderTextWithAssumption(s)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* 4. Success Measurement */}
            <section id="sec-success" className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/60">
                <span className="text-xs font-mono font-bold text-amber-400">04</span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Ukuran Keberhasilan (Success Measurement)
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Offline Golden Set
                  </span>
                  <p className={isLight ? "text-slate-700" : "text-zinc-300"}>
                    {renderTextWithAssumption(prd.success_measurement.offline_golden_set)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Human Review
                  </span>
                  <p className={isLight ? "text-slate-700" : "text-zinc-300"}>
                    {renderTextWithAssumption(prd.success_measurement.human_review)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Online Metrics
                  </span>
                  <p className={isLight ? "text-slate-700" : "text-zinc-300"}>
                    {renderTextWithAssumption(prd.success_measurement.online_metrics)}
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Rollout Plan */}
            <section id="sec-rollout" className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/60">
                <span className="text-xs font-mono font-bold text-amber-400">05</span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Rencana Rollout & Peluncuran
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Target Exposure
                  </span>
                  <p className={isLight ? "text-slate-700" : "text-zinc-300"}>
                    {renderTextWithAssumption(prd.rollout_plan.exposure)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Durasi
                  </span>
                  <p className={isLight ? "text-slate-700" : "text-zinc-300"}>
                    {renderTextWithAssumption(prd.rollout_plan.duration)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Segmentasi & Ramp Gates
                  </span>
                  <p className={isLight ? "text-slate-700" : "text-zinc-300"}>
                    {renderTextWithAssumption(prd.rollout_plan.segments_gates)}
                  </p>
                </div>
              </div>
            </section>

            {/* 6. Risk Management */}
            <section id="sec-risk" className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/60">
                <span className="text-xs font-mono font-bold text-amber-400">06</span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Manajemen Risiko & Mitigasi
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Mekanisme Deteksi (Detection)
                  </span>
                  <p className={isLight ? "text-slate-700" : "text-zinc-300"}>
                    {renderTextWithAssumption(prd.risk_management.detection)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Fallback & Kill Switch
                  </span>
                  <p className={isLight ? "text-slate-700" : "text-zinc-300"}>
                    {renderTextWithAssumption(prd.risk_management.fallback_kill_switch)}
                  </p>
                </div>
              </div>
            </section>

            {/* 7. AI Behavior Contract */}
            <section id="sec-ai" className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/60">
                <span className="text-xs font-mono font-bold text-amber-400">07</span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Kontrak Perilaku AI Agent (Behavior Contract & Guardrails)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Standar Wajib [GOOD]</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {prd.ai_specific.behavior_contract.good.map((g, i) => (
                      <li key={i} className={`flex items-start gap-2 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{renderTextWithAssumption(g)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Larangan Keras [REJECT]</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {prd.ai_specific.behavior_contract.reject.map((r, i) => (
                      <li key={i} className={`flex items-start gap-2 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                        <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{renderTextWithAssumption(r)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {prd.ai_specific.guardrails && prd.ai_specific.guardrails.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                    Technical Guardrails
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {prd.ai_specific.guardrails.map((gr, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-mono ${
                          isLight
                            ? "border-slate-300 bg-slate-100 text-slate-800"
                            : "border-zinc-800 bg-zinc-900 text-zinc-300"
                        }`}
                      >
                        {renderTextWithAssumption(gr)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-zinc-800/60 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
                    <Palette className="h-4 w-4 text-amber-500" />
                    <span>Palet Warna Terkalibrasi (Design Tokens)</span>
                  </h4>
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-500 font-mono">
                    {palette.primaryColorName || palette.domain.toUpperCase()}
                  </span>
                  {palette.hasDashboard && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 font-mono">
                      <Layers className="h-3 w-3" /> Dashboard Shell
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 max-w-xl ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  {palette.moodDescription}
                </p>
              </div>

              {/* Action Buttons: AI Roll & Custom Color Picker */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleGenerateAIPalette}
                  disabled={isGeneratingAIPalette}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  title="Minta AI meracikkan kombinasi warna baru yang terkalibrasi"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isGeneratingAIPalette ? "animate-spin" : ""}`} />
                  <span>{isGeneratingAIPalette ? "Meracik..." : "Racik Palet AI"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCustomColorModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isLight
                      ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      : "border-zinc-800 bg-zinc-900/90 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800"
                  }`}
                  title="Pilih dan sesuaikan kode warna primer dan aksen secara kustom"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Kustomisasi Warna</span>
                </button>
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

      {/* TAB 3: Diagram Arsitektur & ERD (8 Mermaid) */}
      {activeTab === "diagrams" && (
        !canViewDiagrams ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 text-center max-w-lg mx-auto space-y-4 my-8 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">
                8 Blueprint Arsitektur & Database ERD Terkunci
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Akses visual 8 diagram arsitektur interaktif (System Flowchart, User Journey, Database ERD, API Matrix, Sequence Flow, Topologi Infrastruktur, Matriks RBAC, dan Pipeline Data) dikhususkan untuk paket yang memiliki izin akses.
              </p>
            </div>
            {onRequireUpgrade && (
              <button
                type="button"
                onClick={onRequireUpgrade}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Buka Akses dengan Upgrade Paket</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`rounded-xl border p-5 flex flex-wrap items-center justify-between gap-4 ${
              isLight ? "bg-white border-slate-200 shadow-xs" : "bg-[#121215] border-zinc-800"
            }`}>
              <div>
                <h3 className={`font-semibold text-sm flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  <Network className="h-4 w-4 text-amber-500" />
                  <span>8 Blueprint Arsitektur Sistem & Interaksi (Mermaid.js)</span>
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Diagram interaktif alur sistem, user journey sitemap, skema database, matriks API, sequence flow, topologi cloud infra, matriks izin akses RBAC, dan data pipeline siap pakai.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-500">
                  <CheckCircle2 className="h-3 w-3" /> Live Render SVG (8 Blueprint)
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

              {/* Diagram 6: Infrastructure & Cloud Topology */}
              <div>
                <MermaidRenderer
                  chart={defaultInfraTopology}
                  title="6. Topologi Infrastruktur & Deployment (Cloud & Server Topology)"
                  theme={theme}
                />
              </div>

              {/* Diagram 7: RBAC Permission Matrix */}
              <div>
                <MermaidRenderer
                  chart={defaultRBAC}
                  title="7. Matriks Peran & Hak Akses (Role-Based Access Control)"
                  theme={theme}
                />
              </div>

              {/* Diagram 8: Data Pipeline & Processing Flow */}
              <div className="lg:col-span-2">
                <MermaidRenderer
                  chart={defaultDataPipeline}
                  title="8. Pipeline Pemrosesan Data & Event (Data Processing Pipeline)"
                  theme={theme}
                />
              </div>
            </div>
          </div>
        )
      )}

      {/* TAB 4: Visual Mindmap (Recreated Aakash Gupta Infographic) */}
      {activeTab === "mindmap" && (
        !canViewDiagrams ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 text-center max-w-lg mx-auto space-y-4 my-8 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">
                Visual Mindmap Arsitektur Terkunci
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Akses visual peta pikiran interaktif dikhususkan untuk paket yang memiliki izin akses.
              </p>
            </div>
            {onRequireUpgrade && (
              <button
                type="button"
                onClick={onRequireUpgrade}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Buka Akses dengan Upgrade Paket</span>
              </button>
            )}
          </div>
        ) : (
          <MindmapViewer prd={prd} />
        )
      )}

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
      {/* Custom Palette Modal */}
      <CustomPaletteModal
        isOpen={isCustomColorModalOpen}
        onClose={() => setIsCustomColorModalOpen(false)}
        currentPalette={activePalette}
        onApplyPalette={(newPal) => setActivePalette(newPal)}
        onResetDefault={() => setActivePalette(defaultPalette)}
      />
    </div>
  );
};
