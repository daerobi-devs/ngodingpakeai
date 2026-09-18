"use client";

import React, { useState } from "react";
import { PRDOutput } from "@/types/prd";
import {
  Target,
  Key,
  AlertTriangle,
  ClipboardCheck,
  ShieldAlert,
  Users,
  Bot,
  Copy,
  Check,
  Download,
  Sun,
  Moon,
  Layers,
} from "lucide-react";

interface MindmapViewerProps {
  prd: PRDOutput;
}

export const MindmapViewer: React.FC<MindmapViewerProps> = ({ prd }) => {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  const categories = [
    {
      id: "opportunity",
      title: "Opportunity Framing",
      icon: Target,
      items: [
        { label: "Core Problem", desc: prd.opportunity_framing.core_problem },
        { label: "Working Hypothesis", desc: prd.opportunity_framing.working_hypothesis },
        { label: "Strategy Fit", desc: prd.opportunity_framing.strategy_fit },
      ],
    },
    {
      id: "boundaries",
      title: "Boundaries",
      icon: Key,
      items: [
        { label: "Scope", desc: prd.boundaries.scope.join(" • ") },
        { label: "Non-Goals", desc: prd.boundaries.non_goals.join(" • ") },
      ],
    },
    {
      id: "success",
      title: "Success Measurement",
      icon: AlertTriangle,
      items: [
        { label: "Offline Golden Set", desc: prd.success_measurement.offline_golden_set },
        { label: "Human Review", desc: prd.success_measurement.human_review },
        { label: "Online Metrics", desc: prd.success_measurement.online_metrics },
      ],
    },
    {
      id: "rollout",
      title: "Rollout Plan",
      icon: ClipboardCheck,
      items: [
        { label: "Exposure", desc: prd.rollout_plan.exposure },
        { label: "Duration", desc: prd.rollout_plan.duration },
        { label: "Segments & Ramp Gates", desc: prd.rollout_plan.segments_gates },
      ],
    },
    {
      id: "risk",
      title: "Risk Management",
      icon: ShieldAlert,
      items: [
        { label: "Detection", desc: prd.risk_management.detection },
        { label: "Fallback & Kill Switch", desc: prd.risk_management.fallback_kill_switch },
      ],
    },
    {
      id: "ownership",
      title: "Ownership + Action",
      icon: Users,
      items: [
        { label: "Primary Owner", desc: prd.ownership_action.primary_owner },
        { label: "Decision Points", desc: prd.ownership_action.decision_points },
      ],
    },
    {
      id: "ai_specific",
      title: "AI-Specific Additions",
      icon: Bot,
      items: [
        {
          label: "Behavior Contract",
          desc: `[GOOD]: ${prd.ai_specific.behavior_contract.good.join(", ")} | [REJECT]: ${prd.ai_specific.behavior_contract.reject.join(", ")}`,
        },
        { label: "Guardrails", desc: prd.ai_specific.guardrails.join(" • ") },
      ],
    },
  ];

  const generateMermaidSyntax = () => {
    return `mindmap
  root(("${prd.title.replace(/[()\[\]{}"']/g, " ")}"))
    Opportunity Framing
      ["Core: ${prd.opportunity_framing.core_problem.slice(0, 40)}..."]
      ["Solusi: ${prd.opportunity_framing.working_hypothesis.slice(0, 40)}..."]
    Boundaries
      ["Scope: ${prd.boundaries.scope.length} Fitur"]
      ["Non-Goals: ${prd.boundaries.non_goals.length} Batasan"]
    Success Measurement
      ["KPI: ${prd.success_measurement.online_metrics.slice(0, 40)}..."]
    Rollout Plan
      ["Exposure: ${prd.rollout_plan.exposure}"]
    Risk Management
      ["Kill Switch: ${prd.risk_management.fallback_kill_switch.slice(0, 40)}..."]
    Ownership & Action
      ["Owner: ${prd.ownership_action.primary_owner}"]
    AI-Specific Additions
      ["Behavior Contract GOOD & REJECT"]
      ["Guardrails Security"]`;
  };

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(generateMermaidSyntax());
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 2000);
  };

  const isLight = themeMode === "light";

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#121215] p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-amber-400" />
            <span>Visual Infographic Mindmap (Aakash Gupta Modern PRD Standard)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <div className="flex items-center rounded-lg bg-zinc-950 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => setThemeMode("light")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                isLight ? "bg-zinc-800 text-white shadow-xs" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sun className="h-3 w-3" />
              <span>Infografis Original</span>
            </button>
            <button
              type="button"
              onClick={() => setThemeMode("dark")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                !isLight ? "bg-zinc-800 text-white shadow-xs" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Moon className="h-3 w-3" />
              <span>Dark Mode</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyMermaid}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-200 hover:border-zinc-700 hover:text-white transition-colors"
          >
            {copiedMermaid ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Syntax Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                <span>Salin Mermaid</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Infographic Canvas Recreated Exactly as Reference */}
      <div
        id="mindmap-canvas"
        className={`rounded-2xl border p-6 sm:p-10 transition-colors duration-200 font-sans ${
          isLight
            ? "bg-[#F8FAFC] border-slate-300 text-slate-900 shadow-sm"
            : "bg-[#181C26] border-slate-700/60 text-slate-100 shadow-xl"
        }`}
      >
        {/* Infographic Header */}
        <div className="border-b pb-6 mb-8 flex flex-wrap items-start justify-between gap-4 border-slate-300/80 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Elements of a{" "}
              <span className="text-[#1E5BF8] font-black">
                Great Product Requirements Doc
              </span>{" "}
              (PRD)
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              (In the age of AI Prototyping) —{" "}
              <span className="italic text-slate-700 dark:text-slate-300">
                &ldquo;{prd.title}&rdquo;
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#1E5BF8] px-3.5 py-1 text-xs font-bold text-white shadow-xs">
              Aakash Gupta Standard
            </span>
          </div>
        </div>

        {/* Tree Layout: Root on Left -> 7 Categories Center -> Subitems on Right */}
        <div className="relative flex flex-col lg:flex-row items-stretch lg:items-center gap-8 py-4">
          {/* Root Node: Black rounded pill "Modern PRD" */}
          <div className="flex items-center justify-center shrink-0 lg:w-48">
            <div className="w-full flex flex-col items-center justify-center rounded-2xl bg-[#09090b] p-5 text-white shadow-lg border-2 border-slate-700/80 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 mb-1">
                FRAMEWORK
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Modern PRD
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-tight line-clamp-2">
                {prd.title}
              </p>
            </div>
          </div>

          {/* Connective Bezier Lines SVG (Desktop) */}
          <div className="hidden lg:block w-12 shrink-0 self-stretch relative">
            <svg
              className="w-full h-full text-[#1E5BF8]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              preserveAspectRatio="none"
              viewBox="0 0 50 700"
            >
              {/* 7 curved branches from root center (0, 350) to the 7 categories */}
              <path d="M 0 350 C 25 350, 25 50, 50 50" strokeLinecap="round" />
              <path d="M 0 350 C 25 350, 25 150, 50 150" strokeLinecap="round" />
              <path d="M 0 350 C 25 350, 25 250, 50 250" strokeLinecap="round" />
              <path d="M 0 350 C 25 350, 25 350, 50 350" strokeLinecap="round" />
              <path d="M 0 350 C 25 350, 25 450, 50 450" strokeLinecap="round" />
              <path d="M 0 350 C 25 350, 25 550, 50 550" strokeLinecap="round" />
              <path d="M 0 350 C 25 350, 25 650, 50 650" strokeLinecap="round" />
            </svg>
          </div>

          {/* 7 Categories & Sub-items */}
          <div className="flex-1 space-y-4">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="flex flex-col md:flex-row md:items-center gap-4 rounded-xl p-2 transition-all"
                >
                  {/* Category Box: Royal Blue with Icon & Title */}
                  <div className="flex items-center gap-3 w-full md:w-64 shrink-0 rounded-xl bg-[#1E5BF8] p-4 text-white shadow-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 border border-white/25">
                      <IconComp className="h-4 w-4 text-white" />
                    </div>
                    <div className="font-bold text-sm tracking-tight leading-tight">
                      {cat.title}
                    </div>
                  </div>

                  {/* Curly Bracket Connector / Subitems group */}
                  <div className="flex-1 space-y-2 pl-2 md:pl-4 border-l-2 md:border-l border-slate-300 dark:border-slate-800">
                    {cat.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex flex-col sm:flex-row sm:items-baseline gap-2.5 text-xs"
                      >
                        {/* Soft blue / periwinkle pill for parameter name */}
                        <span
                          className={`shrink-0 rounded-lg px-2.5 py-1 font-bold tracking-tight text-center sm:text-left shadow-xs ${
                            isLight
                              ? "bg-[#DCE7FE] text-[#0A2B75] border border-[#BFD4FD]"
                              : "bg-[#252B3B] text-slate-200 border border-slate-700"
                          }`}
                        >
                          {item.label}
                        </span>

                        {/* Real-world detail text from generated PRD */}
                        <span
                          className={`leading-relaxed text-xs ${
                            isLight ? "text-slate-700" : "text-slate-300"
                          }`}
                        >
                          {item.desc || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom 3 Insight Cards exactly as in Aakash Gupta's Infographic */}
        <div className="mt-12 pt-8 border-t border-slate-300/80 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: PRD vs Prototype */}
          <div
            className={`rounded-xl p-5 border shadow-xs ${
              isLight
                ? "bg-[#EEF2F6] border-slate-300 text-slate-800"
                : "bg-[#242A38] border-slate-700/60 text-slate-200"
            }`}
          >
            <h4 className="font-extrabold text-sm text-[#1E5BF8] dark:text-[#3B82F6] mb-2.5">
              PRD vs Prototype:
            </h4>
            <ul className="space-y-2 text-xs leading-relaxed">
              <li>
                <strong className="text-slate-900 dark:text-white">• PRD:</strong> Items that
                require architectural & team alignment.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">• Prototype:</strong> Visual
                & dynamic representation of the feature.
              </li>
            </ul>
          </div>

          {/* Card 2: Why We Can't Skip PRDs */}
          <div
            className={`rounded-xl p-5 border shadow-xs ${
              isLight
                ? "bg-[#EEF2F6] border-slate-300 text-slate-800"
                : "bg-[#242A38] border-slate-700/60 text-slate-200"
            }`}
          >
            <h4 className="font-extrabold text-sm text-[#1E5BF8] dark:text-[#3B82F6] mb-2.5">
              Why We Can&apos;t Skip PRDs:
            </h4>
            <ol className="space-y-2 text-xs leading-relaxed list-decimal pl-4">
              <li>
                <strong>The Golden Age of Feature Factory:</strong> Mencegah kita cuma melempar
                fitur acak tanpa problem discovery nyata.
              </li>
              <li>
                <strong>Forgets Importance of Problem Discovery:</strong> Jangan lompat ke coding
                sebelum problem terbukti nyata.
              </li>
            </ol>
          </div>

          {/* Card 3: Roles a PRD Plays */}
          <div
            className={`rounded-xl p-5 border shadow-xs ${
              isLight
                ? "bg-[#EEF2F6] border-slate-300 text-slate-800"
                : "bg-[#242A38] border-slate-700/60 text-slate-200"
            }`}
          >
            <h4 className="font-extrabold text-sm text-[#1E5BF8] dark:text-[#3B82F6] mb-2.5">
              Roles a PRD Plays:
            </h4>
            <ol className="space-y-2 text-xs leading-relaxed list-decimal pl-4">
              <li>
                <strong>Align humans before code:</strong> Selaraskan ekspektasi sebelum menulis baris
                kode pertama.
              </li>
              <li>
                <strong>Clarify scope + trade-offs:</strong> Batasi scope agar AI coding agent tidak
                merembet ke mana-mana.
              </li>
              <li>
                <strong>Avoid wasted builds:</strong> Hindari pemborosan waktu sprint dan biaya token.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer citation banner */}
        <div className="mt-8 text-center text-[11px] font-medium text-slate-500">
          Generated with Gemini Flash AI Engine • Modern PRD Framework by Aakash Gupta
        </div>
      </div>
    </div>
  );
};
