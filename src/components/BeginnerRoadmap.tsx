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

interface BeginnerRoadmapProps {
  theme?: "dark" | "light";
}

// 1. Official Cursor Isometric Cube Logo
const CursorIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 126 144" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M 60.66 0.00 L 64.42 0.00 C 82.67 10.62 100.99 21.12 119.25 31.72 C 121.24 33.01 123.54 34.18 124.72 36.34 C 125.34 39.17 125.06 42.10 125.11 44.98 C 125.07 63.63 125.08 82.28 125.11 100.93 C 125.07 102.84 125.14 104.79 124.73 106.68 C 123.53 108.54 121.50 109.62 119.68 110.77 C 104.03 119.72 88.45 128.80 72.85 137.83 C 69.53 139.68 66.36 141.91 62.74 143.17 C 60.51 142.85 58.57 141.57 56.62 140.54 C 40.81 131.22 24.82 122.22 9.00 112.92 C 5.85 111.16 2.79 109.23 0.00 106.93 L 0.00 36.10 C 3.83 32.32 8.81 30.12 13.34 27.33 C 29.10 18.19 44.82 8.98 60.66 0.00 M 5.62 38.04 C 8.28 40.64 11.88 41.83 14.96 43.80 C 30.60 53.06 46.50 61.89 62.05 71.30 C 62.86 75.82 62.50 80.43 62.55 85.00 C 62.57 100.64 62.51 116.29 62.54 131.93 C 62.54 133.69 62.72 135.44 63.01 137.17 C 64.18 135.60 65.29 133.98 66.24 132.27 C 83.07 103.08 99.93 73.92 116.65 44.67 C 117.89 42.62 118.84 40.42 119.57 38.14 C 113.41 37.65 107.23 37.91 101.06 37.87 C 73.71 37.85 46.35 37.85 18.99 37.87 C 14.54 38.02 10.07 37.53 5.62 38.04 Z" />
  </svg>
);

// 2. Official Google Antigravity Rainbow Arch Logo
const AntigravityIcon: React.FC<{ className?: string }> = ({ className = "h-7 w-7" }) => (
  <img
    src="/antigravity-logo.png"
    alt="Google Antigravity Logo"
    className={`${className} object-contain`}
  />
);

// 3. Official Anthropic Claude 14-Point Starburst Logo
const ClaudeIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 24 24" fill="#D97757" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
  </svg>
);

export const BeginnerRoadmap: React.FC<BeginnerRoadmapProps> = ({ theme = "dark" }) => {
  const isLight = theme === "light";
  const [activeGuide, setActiveGuide] = useState<"cursor" | "antigravity" | "claude">("cursor");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const goldenPrompt = `Halo AI! Saya telah menyiapkan spesifikasi proyek ini:
1. Baca dan pahami seluruh isi docs/PRD.md dan docs/DESIGN.md.
2. Patuhi dengan ketat aturan GOOD vs REJECT pada .cursorrules.
3. Pasang dependency yang dibutuhkan (npm install), susun struktur kode, dan jalankan dev server lokal (npm run dev).
4. Mulai eksekusi Step 1 dari Task Breakdown sekarang.
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Cursor IDE */}
          <div className={`group rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
            isLight
              ? "bg-gradient-to-b from-white via-white to-slate-50/70 border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] hover:border-amber-400/50"
              : "bg-gradient-to-b from-zinc-900/60 to-[#121215] border-zinc-800/80 hover:border-amber-500/40 hover:shadow-xl hover:shadow-black/50"
          }`}>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border p-2 shadow-sm ${
                  isLight ? "bg-slate-900 border-slate-800 text-white" : "bg-black border-zinc-800 text-white"
                }`}>
                  <CursorIcon className="h-5 w-5 text-white" />
                </div>
                <span className="rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                  Paling Populer
                </span>
              </div>
              <div>
                <h4 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  Cursor IDE
                </h4>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  Editor koding berbasis VS Code dengan AI bawaan. Chat via <code>Ctrl+L</code> atau edit baris kode via <code>Ctrl+K</code>.
                </p>
              </div>
            </div>

            <div className={`pt-4 border-t mt-4 space-y-2 ${isLight ? "border-slate-100" : "border-zinc-800/80"}`}>
              <a
                href="https://www.cursor.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2 text-xs font-extrabold transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Unduh Cursor IDE</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <p className={`text-[10px] text-center ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
                cursor.com (Win / Mac / Linux)
              </p>
            </div>
          </div>

          {/* Card 2: Antigravity by Google */}
          <div className={`group rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
            isLight
              ? "bg-gradient-to-b from-white via-white to-purple-50/30 border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(147,51,234,0.08)] hover:border-purple-400/50"
              : "bg-gradient-to-b from-zinc-900/60 to-[#121215] border-zinc-800/80 hover:border-purple-500/40 hover:shadow-xl hover:shadow-black/50"
          }`}>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border p-1.5 shadow-sm ${
                  isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#16161a] border-zinc-800 shadow-sm"
                }`}>
                  <AntigravityIcon className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                  Google DeepMind
                </span>
              </div>
              <div>
                <h4 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  Antigravity (Google)
                </h4>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  Command center agentic AI resmi dari Google DeepMind dengan kemampuan multi-agent workspace dan terminal otomatis.
                </p>
              </div>
            </div>

            <div className={`pt-4 border-t mt-4 space-y-2 ${isLight ? "border-slate-100" : "border-zinc-800/80"}`}>
              <a
                href="https://antigravity.google"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 text-xs font-extrabold transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Unduh Antigravity App</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <p className={`text-[10px] text-center ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
                antigravity.google (Desktop App)
              </p>
            </div>
          </div>

          {/* Card 3: Claude Code */}
          <div className={`group rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
            isLight
              ? "bg-gradient-to-b from-white via-white to-orange-50/30 border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(249,115,22,0.08)] hover:border-orange-400/50"
              : "bg-gradient-to-b from-zinc-900/60 to-[#121215] border-zinc-800/80 hover:border-orange-500/40 hover:shadow-xl hover:shadow-black/50"
          }`}>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border p-2 shadow-sm ${
                  isLight ? "bg-[#D97757]/10 border-[#D97757]/30" : "bg-[#D97757]/15 border-[#D97757]/40"
                }`}>
                  <ClaudeIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                  Anthropic CLI
                </span>
              </div>
              <div>
                <h4 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  Claude Code (Terminal)
                </h4>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  AI coding agent Anthropic yang beroperasi langsung di terminal Anda untuk navigasi kode, edit file, dan commit mandiri.
                </p>
              </div>
            </div>

            <div className={`pt-4 border-t mt-4 space-y-2 ${isLight ? "border-slate-100" : "border-zinc-800/80"}`}>
              <a
                href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2 text-xs font-extrabold transition-all active:scale-[0.98] ${
                  isLight
                    ? "border border-slate-300 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                    : "border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white"
                }`}
              >
                <span>Dokumentasi Claude Code</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <div className={`py-1 px-2 rounded-lg font-mono text-[10px] text-center truncate border ${
                isLight ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-zinc-950 text-zinc-400 border-zinc-800"
              }`}>
                npm i -g @anthropic-ai/claude-code
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The 4-Step Visual Flowchart Roadmap */}
      <div className="space-y-6 pt-2">
        {/* Section Heading & Guide Switcher */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 transition-colors ${
          isLight ? "border-slate-200" : "border-zinc-800/80"
        }`}>
          <div>
            <h3 className={`text-lg sm:text-xl font-extrabold tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Alur 4 Langkah Eksekusi (Zero-Slop)
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Ikuti 4 langkah terarah ini untuk mengeksekusi proyek dari rancangan sampai web live di browser.
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
              <CursorIcon className="h-3.5 w-3.5" />
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
              <AntigravityIcon className="h-3.5 w-3.5" />
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
              <ClaudeIcon className="h-3.5 w-3.5" />
              <span>Claude Code</span>
            </button>
          </div>
        </div>

        {/* 5 Connected Flow Nodes */}
        <div className="space-y-4">
          {/* STEP 1 */}
          <div className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
            isLight
              ? "bg-white border-slate-200/90 shadow-sm"
              : "bg-gradient-to-b from-zinc-900/40 to-[#121215] border-zinc-800/90"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 font-black text-sm shrink-0 shadow-sm ring-4 ${
                isLight ? "ring-amber-500/15" : "ring-amber-500/20"
              }`}>
                01
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-amber-500 uppercase tracking-wider">
                    Langkah 01 • Ideasi
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">Estimasi: 10 Detik</span>
                </div>
                <h4 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  Buat PRD di Studio Generator
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  Buka studio generator, ketikkan 1 kalimat konsep aplikasi Anda, lalu biarkan sistem merumuskan PRD 7 kategori produk dan 5 blueprint visual secara komprehensif.
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Connector */}
          <div className="flex justify-center -my-2 py-0.5">
            <div className={`w-0.5 h-6 rounded-full ${isLight ? "bg-slate-300" : "bg-zinc-800"}`} />
          </div>

          {/* STEP 2 */}
          <div className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
            isLight
              ? "bg-white border-slate-200/90 shadow-sm"
              : "bg-gradient-to-b from-zinc-900/40 to-[#121215] border-zinc-800/90"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white font-black text-sm shrink-0 shadow-sm ring-4 ${
                isLight ? "ring-blue-500/15" : "ring-blue-500/20"
              }`}>
                02
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                    Langkah 02 • Spesifikasi
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">Klarifikasi AI</span>
                </div>
                <h4 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  Kunci Arsitektur via AI Clarifier
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  Jawab pertanyaan pilihan cepat dari AI untuk mengunci pilihan database, integrasi sistem pembayaran/auth, serta batasan cakupan MVP yang realistis.
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Connector */}
          <div className="flex justify-center -my-2 py-0.5">
            <div className={`w-0.5 h-6 rounded-full ${isLight ? "bg-slate-300" : "bg-zinc-800"}`} />
          </div>

          {/* STEP 3 */}
          <div className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
            isLight
              ? "bg-white border-slate-200/90 shadow-sm"
              : "bg-gradient-to-b from-zinc-900/40 to-[#121215] border-zinc-800/90"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-black text-sm shrink-0 shadow-sm ring-4 ${
                isLight ? "ring-emerald-500/15" : "ring-emerald-500/20"
              }`}>
                03
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Langkah 03 • Paket Proyek
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">File .ZIP Siap Pakai</span>
                </div>
                <h4 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  Unduh 1-Click Starter Kit (.ZIP)
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  Tekan tombol unduh untuk mendapatkan file zip berisi <code>.cursorrules</code>, <code>CLAUDE.md</code>, <code>docs/PRD.md</code>, <code>docs/DESIGN.md</code>, dan seluruh diagram arsitektur <code>.mmd</code>. Ekstrak ke direktori komputer Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Connector */}
          <div className="flex justify-center -my-2 py-0.5">
            <div className={`w-0.5 h-6 rounded-full ${isLight ? "bg-slate-300" : "bg-zinc-800"}`} />
          </div>

          {/* STEP 4: AI Autonomous Execution & Dev Server */}
          <div className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
            isLight
              ? "bg-white border-slate-200/90 shadow-sm"
              : "bg-gradient-to-b from-zinc-900/40 to-[#121215] border-zinc-800/90"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white font-black text-sm shrink-0 shadow-sm ring-4 ${
                isLight ? "ring-purple-500/15" : "ring-purple-500/20"
              }`}>
                04
              </div>
              <div className="space-y-3.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                    Langkah 04 • Eksekusi AI & Live Web
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Web Live & Siap Uji
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {activeGuide === "cursor" && <CursorIcon className="h-4 w-4 text-amber-500 shrink-0" />}
                  {activeGuide === "antigravity" && <AntigravityIcon className="h-4 w-4 shrink-0" />}
                  {activeGuide === "claude" && <ClaudeIcon className="h-4 w-4 shrink-0" />}
                  <h4 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {activeGuide === "cursor" && "Buka Folder di Cursor & Biarkan AI Agent Merakit Kode"}
                    {activeGuide === "antigravity" && "Buka Workspace di Antigravity & Jalankan Agentic Assembly"}
                    {activeGuide === "claude" && "Buka Terminal Proyek & Jalankan claude Code"}
                  </h4>
                </div>

                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  {activeGuide === "cursor" && (
                    <>
                      Buka folder hasil ekstrak di Cursor (<code>File → Open Folder</code>), buka panel AI Chat (<code>Ctrl + L</code> / Agent Mode), lalu tempel prompt di bawah. AI akan membaca seluruh arsitektur, menginstal dependencies, merakit modul kode, dan otomatis menyalakan server dev.
                    </>
                  )}
                  {activeGuide === "antigravity" && (
                    <>
                      Buka direktori proyek Anda sebagai active workspace di Google Antigravity, lalu kirimkan prompt di bawah ke agent. Agent akan menganalisa PRD, menyusun seluruh source code, dan menjalankan dev server lokal.
                    </>
                  )}
                  {activeGuide === "claude" && (
                    <>
                      Buka terminal komputer Anda di dalam folder proyek, jalankan perintah <code>claude</code>, lalu kirimkan prompt di bawah. Claude Code akan menginstal package dan mengeksekusi kode hingga tuntas.
                    </>
                  )}
                </p>

                {/* Golden Starter Prompt Box */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5" />
                      <span>Starter Prompt Lengkap (Zero-Slop):</span>
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
                  <pre className={`p-3.5 rounded-xl border font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto ${
                    isLight ? "bg-slate-900 text-slate-100 border-slate-700/80" : "bg-zinc-950 text-zinc-200 border-zinc-800"
                  }`}>
                    {goldenPrompt}
                  </pre>
                </div>

                {/* Dev Server & Terminal Live Status Badge */}
                <div className={`mt-3 flex flex-wrap items-center justify-between gap-2.5 rounded-xl p-3.5 border text-xs font-mono transition-colors ${
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
                      AI Agent menulis kode & menjalankan server dev secara mandiri
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
      </div>
    </div>
  );
};
