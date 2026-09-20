"use client";

import React, { useState } from "react";
import {
  Download,
  Copy,
  Check,
  ArrowRight,
  Terminal,
  Laptop,
  CheckCircle2,
  Code2,
  Layers,
  Bot,
  Zap,
  BookOpen,
  FolderArchive,
  PlayCircle,
  HelpCircle,
  Cpu,
  Workflow,
  Compass,
  Monitor,
  FolderOpen,
  Play,
  ArrowUpRight,
} from "lucide-react";

import {
  CursorLogo,
  AntigravityLogo,
  ClaudeLogo,
} from "@/components/icons/AgentIcons";

interface BeginnerRoadmapProps {
  theme?: "dark" | "light";
}

export const BeginnerRoadmap: React.FC<BeginnerRoadmapProps> = ({ theme = "dark" }) => {
  const isLight = theme === "light";
  const [activeGuide, setActiveGuide] = useState<"cursor" | "antigravity" | "claude">("cursor");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const goldenPrompt = `Halo AI! Saya telah menyiapkan spesifikasi proyek ini:
1. Hubungkan ke server MCP proyek (get_prd_spec) atau baca dokumen docs/PRD.md & docs/DESIGN.md.
2. Ambil tugas pertama dari backlog Kanban (get_next_task) dan patuhi aturan arsitektur.
3. Pasang dependency yang dibutuhkan (npm install), susun struktur kode, dan jalankan dev server lokal (npm run dev).
4. Tandai progres ke Kanban (update_task_status) saat setiap modul terverifikasi.
Tolong jelaskan secara singkat rencana eksekusimu lalu mulai rakit kode sampai siap diuji di browser!`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(goldenPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="space-y-14 py-4">
      {/* 1. Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-bold tracking-wider uppercase transition-colors ${
          isLight
            ? "border-amber-500/30 bg-amber-500/10 text-amber-800 shadow-xs"
            : "border-amber-500/30 bg-amber-500/10 text-amber-400"
        }`}>
          <Compass className="h-3.5 w-3.5 text-amber-500" />
          <span>Roadmap Praktis</span>
        </div>
        <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${
          isLight ? "text-slate-900" : "text-white"
        }`}>
          Dari PRD Menjadi Web Aktif
        </h2>
        <p className={`text-sm sm:text-base leading-relaxed ${
          isLight ? "text-slate-600" : "text-zinc-400"
        }`}>
          Panduan ringkas menjalankan proyek hasil generator bersama AI coding agent resmi.
        </p>
      </div>

      {/* 2. Quick Download Hub: 3 Modern AI Coding Platforms */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
          <div>
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              <Laptop className="h-4 w-4 text-amber-500" />
              <span>Tahap 0: Pasang Salah Satu AI Coding Tool</span>
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Pilih satu yang Anda sukai. Ketiganya kompatibel membaca Starter Kit (.ZIP) dari web ini.
            </p>
          </div>
          <span className={`text-[11px] font-mono self-start sm:self-auto px-2.5 py-0.5 rounded-full border ${
            isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-zinc-900 border-zinc-800 text-zinc-400"
          }`}>
            Official Tools
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Cursor IDE */}
          <a
            href="https://www.cursor.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`group rounded-xl border p-3.5 flex items-center justify-between gap-3 transition-all duration-150 hover:-translate-y-0.5 ${
              isLight
                ? "bg-white border-slate-200 shadow-xs hover:border-amber-400/60 hover:shadow-sm"
                : "bg-zinc-950/60 border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900/40"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black border border-zinc-800 p-2 shadow-inner text-white group-hover:border-amber-500/40 transition-colors">
                <CursorLogo className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className={`text-sm font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                    Cursor IDE
                  </h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                    Popular
                  </span>
                </div>
                <p className={`text-[11px] truncate ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  cursor.com (VS Code AI)
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-400 transition-colors shrink-0" />
          </a>

          {/* Card 2: Antigravity by Google */}
          <a
            href="https://antigravity.google"
            target="_blank"
            rel="noopener noreferrer"
            className={`group rounded-xl border p-3.5 flex items-center justify-between gap-3 transition-all duration-150 hover:-translate-y-0.5 ${
              isLight
                ? "bg-white border-slate-200 shadow-xs hover:border-purple-400/60 hover:shadow-sm"
                : "bg-zinc-950/60 border-zinc-800/80 hover:border-purple-500/40 hover:bg-zinc-900/40"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black border border-zinc-800 p-1.5 shadow-inner group-hover:border-purple-500/40 transition-colors">
                <AntigravityLogo className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className={`text-sm font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                    Antigravity
                  </h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                    DeepMind
                  </span>
                </div>
                <p className={`text-[11px] truncate ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  antigravity.google
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-purple-400 transition-colors shrink-0" />
          </a>

          {/* Card 3: Claude Code */}
          <a
            href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview"
            target="_blank"
            rel="noopener noreferrer"
            className={`group rounded-xl border p-3.5 flex items-center justify-between gap-3 transition-all duration-150 hover:-translate-y-0.5 ${
              isLight
                ? "bg-white border-slate-200 shadow-xs hover:border-orange-400/60 hover:shadow-sm"
                : "bg-zinc-950/60 border-zinc-800/80 hover:border-orange-500/40 hover:bg-zinc-900/40"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black border border-zinc-800 p-2 shadow-inner group-hover:border-orange-500/40 transition-colors">
                <ClaudeLogo className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className={`text-sm font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                    Claude Code
                  </h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold">
                    CLI Agent
                  </span>
                </div>
                <p className={`text-[11px] truncate ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Anthropic Terminal
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-orange-400 transition-colors shrink-0" />
          </a>
        </div>
      </div>

      {/* 3. Starter Prompt & Tool Guidance */}
      <div className="space-y-6 pt-2">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 transition-colors ${
          isLight ? "border-slate-200" : "border-zinc-800/80"
        }`}>
          <div>
            <h3 className={`text-lg sm:text-xl font-extrabold tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Starter Prompt &amp; Petunjuk Eksekusi
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Salin prompt di bawah ke AI coding agent favorit Anda untuk mulai merakit kode secara mandiri.
            </p>
          </div>

          {/* Interactive Tool Instruction Tabs */}
          <div className={`flex items-center rounded-xl p-1 border ${
            isLight ? "bg-slate-100 border-slate-200" : "bg-zinc-900 border-zinc-800"
          }`}>
              <button
              type="button"
              onClick={() => setActiveGuide("cursor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeGuide === "cursor"
                  ? "bg-amber-500 text-zinc-950 shadow-sm"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
              }`}
            >
              <CursorLogo className="h-3.5 w-3.5" />
              <span>Cursor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveGuide("antigravity")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeGuide === "antigravity"
                  ? "bg-purple-600 text-white shadow-sm"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
              }`}
            >
              <AntigravityLogo className="h-3.5 w-3.5" />
              <span>Antigravity</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveGuide("claude")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeGuide === "claude"
                  ? "bg-[#D97757] text-white shadow-sm"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
              }`}
            >
              <ClaudeLogo className="h-3.5 w-3.5" />
              <span>Claude Code</span>
            </button>
          </div>
        </div>

        {/* The Card with Tip & Prompt */}
        <div className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
          isLight
            ? "bg-white border-slate-200/90 shadow-sm"
            : "bg-gradient-to-b from-zinc-900/40 to-[#121215] border-zinc-800/90"
        }`}>
          <div className="space-y-4">
            {/* Active tool guidance note */}
            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-center gap-3 ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-700"
                : "bg-zinc-900/60 border-zinc-800 text-zinc-300"
            }`}>
              <div className="shrink-0">
                {activeGuide === "cursor" && <CursorLogo className="h-4 w-4 text-amber-500" />}
                {activeGuide === "antigravity" && <AntigravityLogo className="h-4 w-4" />}
                {activeGuide === "claude" && <ClaudeLogo className="h-4 w-4" />}
              </div>
              <p>
                {activeGuide === "cursor" && (
                  <>
                    Tambahkan server MCP proyek di <code>Settings &gt; MCP</code> (atau buka folder .ZIP). Buka AI Chat (<code>Ctrl + L</code> / Agent Mode), lalu tempel prompt di bawah.
                  </>
                )}
                {activeGuide === "antigravity" && (
                  <>
                    Buka direktori proyek sebagai active workspace di Google Antigravity, sambungkan server MCP atau spesifikasi PRD, lalu kirimkan prompt di bawah ke agent.
                  </>
                )}
                {activeGuide === "claude" && (
                  <>
                    Buka terminal di dalam folder proyek, jalankan perintah <code>claude</code>, lalu kirimkan starter prompt di bawah untuk menjalankan koding mandiri.
                  </>
                )}
              </p>
            </div>

            {/* Golden Starter Prompt Box */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Starter Prompt Siap Pakai:</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3 py-1 text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  {copiedPrompt ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedPrompt ? "Tersalin!" : "Salin Prompt"}</span>
                </button>
              </div>
              <pre className={`p-4 rounded-xl border font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto ${
                isLight ? "bg-slate-900 text-slate-100 border-slate-700/80" : "bg-zinc-950 text-zinc-200 border-zinc-800"
              }`}>
                {goldenPrompt}
              </pre>
            </div>

            {/* Dev Server & Terminal Live Status Badge */}
            <div className={`flex flex-wrap items-center justify-between gap-2.5 rounded-xl p-3.5 border text-xs font-mono transition-colors ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-700"
                : "bg-black/50 border-zinc-800/90 text-zinc-300"
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-500 font-bold">Hasil Akhir:</span>
                <span className={`text-[11px] ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  AI Agent menulis kode &amp; menjalankan server dev secara mandiri
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 hidden sm:inline">Preview:</span>
                <code className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  isLight
                    ? "bg-emerald-100/80 text-emerald-800 border border-emerald-300/60"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                }`}>
                  http://localhost:3000
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
