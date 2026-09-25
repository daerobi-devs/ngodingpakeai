'use client';

import React, { useState, useMemo } from 'react';
import { PRDOutput, UIDesignPromptScreen } from '@/types/prd';
import { synthesizeUIDesignPrompts } from '@/lib/gemini/schemas';
import { getDesignPalette } from '@/lib/design-template';
import {
  Palette,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Layout,
  Terminal,
  Info,
  Monitor,
} from 'lucide-react';

interface StudioUIDesignPromptViewProps {
  prd: PRDOutput;
  theme?: 'dark' | 'light';
}

function compileMasterPrompt(
  prd: PRDOutput,
  screens: UIDesignPromptScreen[],
  platformFormat: 'v0' | 'stitch'
): string {
  const palette = getDesignPalette(prd);
  const title = prd.title || 'Aplikasi Web Modern';
  const problem = prd.opportunity_framing?.core_problem || 'Solusi digital berbasis web terintegrasi';

  if (platformFormat === 'v0') {
    return `### MASTER FRONTEND UI/UX DESIGN SYSTEM PROMPT (v0.dev - React 19 & Tailwind CSS)

PRODUK: ${title}
DESKRIPSI: ${problem}

---

## 1. ATURAN DESAIN & AESTHETIC GUIDELINES
- Framework: Next.js 15 (App Router), React 19, TypeScript
- Styling: Tailwind CSS, Shadcn UI component primitives, Lucide React icons
- Mode & Estetika: Modern High-Density Dark Mode (terinspirasi dari Linear, Vercel, dan Raycast)
- Palet Warna & Token Desain:
  * Primary Accent: ${palette.primaryHex} (${palette.primaryColorName})
  * Secondary Accent: ${palette.accentHex}
  * Canvas Background: #09090b (Zinc 950 deep dark)
  * Surface Container: #0f131a / #121620 dengan border white/10
  * Text Heading: #f4f4f5 (High-contrast White/Zinc 100)
  * Text Secondary: #a1a1aa (Muted Zinc 400)
- ZERO EMOJI POLICY: Dilarang keras menggunakan emoji apa pun. Gunakan Lucide React icons yang bersih dan minimalis untuk semua representasi visual.

---

## 2. ARSITEKTUR LAYAR LENGKAP (${screens.length} LAYAR TERINTEGRASI)

${screens
  .map(
    (screen, index) => `### LAYAR ${index + 1}: ${screen.screen_name.toUpperCase()} (${screen.category.toUpperCase()})
- Deskripsi: ${screen.description}
- Target Pengguna: ${screen.target_roles.join(', ')}
- Wireframe & Tata Letak: ${screen.wireframe_summary}

Spesifikasi Komponen Layar:
${screen.v0_prompt}
`
  )
  .join('\n---\n\n')}

---

## 3. PEMETAAN SKEMA DATABASE NYATA KE ELEMEN UI
Komponen UI harus mencerminkan struktur entitas database berikut:
\`\`\`sql
${prd.sql_migration_script ? prd.sql_migration_script : '-- Lihat skema relasi database di dokumen PRD'}
\`\`\`

---

## 4. INSTRUKSI IMPLEMENTASI KOMPONEN UTUH
1. Susun aplikasi ke dalam struktur tata letak responsif yang saling terhubung:
   - Shell Navigasi: Sidebar collapsible dengan tautan ke Dashboard, Workspace Fitur, dan Pengaturan.
   - Tampilan Utama Dashboard: KPI Metrics, filter data, dan tabel data riwayat entitas database utama.
   - Kanvas Kerja Fitur Inti: Alur input interaktif dan visual feedback instan.
   - Dialog Modal Transaksi/Aksi: Form validasi kolom berbasis skema SQL di atas.
2. Sediakan state interaktif lengkap:
   - State buka/tutup modal dialog aksi.
   - State aktif tabs navigasi dan filter tabel data.
   - Simulasi animasi loading state saat submit form utama.
3. Pastikan typography, spacing (8pt grid), border hover micro-interactions, dan responsive breakpoint (Mobile, Tablet, Desktop) diterapkan dengan standar kualitas enterprise.`;
  } else {
    return `### MASTER DESIGN SYSTEM & CANVAS PROMPT (Stitch AI & Figma AI)

PRODUCT NAME: ${title}
SUMMARY: ${problem}

---

## 1. DESIGN TOKENS & CANVAS SETUP
- Platform: Figma Canvas / Stitch AI Vector Auto-Layout
- Canvas Artboards: 1440px Desktop Breakpoint (12-column grid, 24px gutter, 80px margin)
- Color Palette:
  * Primary Accent: ${palette.primaryHex} (${palette.primaryColorName})
  * Secondary Accent: ${palette.accentHex}
  * Dark Canvas: #09090b
  * Surface Card: #0f131a
  * Border Stroke: 1px Solid rgba(255, 255, 255, 0.08)
  * Text Primary: #ffffff
  * Text Muted: #94a3b8
- Typography Hierarchy:
  * Display / H1: Inter Display / SF Pro, Bold 32px / line-height 40px
  * H2 / Section Title: Inter, SemiBold 20px / line-height 28px
  * Body Text: Inter, Regular 14px / line-height 20px
  * Micro / Badges: JetBrains Mono / Inter, Medium 11px
- Zero Emojis: Gunakan icon vektor outline 16x16 / 20x20.

---

## 2. ARTBOARDS & SCREEN SYSTEM (${screens.length} ARTBOARDS)

${screens
  .map(
    (screen, index) => `### ARTBOARD ${index + 1}: ${screen.screen_name} (${screen.category})
- Layout Structure: ${screen.wireframe_summary}
- Target Personas: ${screen.target_roles.join(', ')}

Artboard Details & Layout Constraints:
${screen.stitch_prompt}
`
  )
  .join('\n---\n\n')}

---

## 3. COMPONENT INSTANCES & AUTO-LAYOUT GUIDELINES
1. Terapkan Auto-Layout (Vertical & Horizontal Hug/Fill) pada seluruh cards, tables, dan navigation rails.
2. Setiap tombol aksi primer (CTA) memiliki variant: Default (${palette.primaryHex}), Hover, dan Disabled.
3. Tabel data menampilkan header kolom tebal, baris data berselang-seling halus, dan badge status interaktif.`;
  }
}

export const StudioUIDesignPromptView: React.FC<StudioUIDesignPromptViewProps> = ({
  prd,
  theme = 'dark',
}) => {
  const [platformFormat, setPlatformFormat] = useState<'v0' | 'stitch'>('v0');
  const [scopeMode, setScopeMode] = useState<'all' | 'modular'>('all');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Dapatkan layar-layar prompt desain
  const screens: UIDesignPromptScreen[] = useMemo(() => {
    if (Array.isArray(prd.ui_design_prompts) && prd.ui_design_prompts.length > 0) {
      return prd.ui_design_prompts;
    }
    return synthesizeUIDesignPrompts(prd);
  }, [prd]);

  const masterPromptText = useMemo(() => {
    return compileMasterPrompt(prd, screens, platformFormat);
  }, [prd, screens, platformFormat]);

  const handleCopyPrompt = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2500);
    } catch {
      // fallback
    }
  };

  const isMasterCopied = copiedPromptId === 'master_all';

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-8 space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Section */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-2.5 font-semibold">
            <Palette className="w-3.5 h-3.5" />
            <span>Ekspor Desain Frontend</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Prompt Desain UI/UX (v0.dev / Stitch AI / Figma)
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Salin prompt desain detail yang terhubung langsung dengan Core Features, skema database SQL, dan token warna industri.
          </p>
        </div>

        {/* Format Selector: v0.dev vs Stitch AI / Figma */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start md:self-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setPlatformFormat('v0')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              platformFormat === 'v0'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>v0.dev (React &amp; Tailwind)</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatformFormat('stitch')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              platformFormat === 'stitch'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Stitch AI &amp; Figma</span>
          </button>
        </div>
      </div>

      {/* 2. 1-Click Master All-in-One Banner */}
      <div className="p-5 sm:p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-zinc-900/60 to-zinc-900/90 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500 text-zinc-950 uppercase tracking-wider">
                1-Click Master Copy
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {screens.length} Layar + Skema SQL + Design Tokens
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Salin Semua Layar Sekaligus (Master Full-App Prompt)
            </h3>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Menggabungkan Dashboard Utama, Workspace Fitur Inti, Modal Transaksi, sistem warna, dan skema SQL ke dalam satu paket prompt utuh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Main 1-Click Copy All Button */}
            <button
              type="button"
              onClick={() => handleCopyPrompt('master_all', masterPromptText)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95"
            >
              {isMasterCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Semua Layar Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Semua Layar Sekaligus</span>
                </>
              )}
            </button>

            {/* Quick Open Links */}
            <div className="flex items-center gap-1.5">
              <a
                href="https://v0.dev"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono font-medium border border-zinc-700 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 transition-colors"
                title="Buka v0.dev di tab baru"
              >
                <span>v0.dev</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>

              <a
                href="https://www.figma.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono font-medium border border-zinc-700 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 transition-colors"
                title="Buka Figma di tab baru"
              >
                <span>Figma</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Scope Mode Switcher: Semua Layar vs Per Layar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setScopeMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              scopeMode === 'all'
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span>Semua Layar Sekaligus (Master Prompt)</span>
          </button>
          <button
            type="button"
            onClick={() => setScopeMode('modular')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              scopeMode === 'modular'
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Per Layar Terpisah ({screens.length} Layar)</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 hidden sm:block">
          Format: {platformFormat === 'v0' ? 'React 19 + Tailwind' : 'Figma Auto-Layout'}
        </div>
      </div>

      {/* 4. Content Area Based on Scope Mode */}
      {scopeMode === 'all' ? (
        /* MASTER ALL-IN-ONE VIEW */
        <div className="rounded-2xl border border-zinc-800 bg-[#0c0e14] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Master Full-App Prompt ({screens.length} Layar Terpadu)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Format lengkap mencakup petunjuk arsitektur, token warna, spesifikasi 3 layar kunci, dan skema SQL.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopyPrompt('master_all', masterPromptText)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md active:scale-95 self-start sm:self-auto"
            >
              {isMasterCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Master Prompt</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2 border-b border-zinc-800/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {platformFormat === 'v0'
                    ? 'v0.dev Master Specification'
                    : 'Stitch AI / Figma Master Canvas Specification'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500">
                {masterPromptText.length} karakter
              </span>
            </div>
            <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[520px] overflow-y-auto selection:bg-amber-500/20">
              {masterPromptText}
            </pre>
          </div>
        </div>
      ) : (
        /* MODULAR PER-SCREEN VIEW */
        <div className="space-y-6">
          {screens.map((screen, idx) => {
            const activePromptText =
              platformFormat === 'v0' ? screen.v0_prompt : screen.stitch_prompt;
            const isCopied = copiedPromptId === screen.id;

            return (
              <div
                key={screen.id}
                className="rounded-2xl border border-zinc-800 bg-[#0c0e14] p-5 sm:p-6 shadow-xl space-y-4 transition-all"
              >
                {/* Header Layar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 text-xs font-mono font-bold">
                        {idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {screen.screen_name}
                      </h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase tracking-wider">
                        {screen.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {screen.description}
                    </p>
                  </div>

                  {/* Aksi Salin */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(screen.id, activePromptText)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md active:scale-95"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Prompt Layar {idx + 1}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Wireframe Layout Summary */}
                {screen.wireframe_summary && (
                  <div className="p-2.5 rounded-xl border border-zinc-800/60 bg-zinc-900/60 text-xs flex items-center gap-2 overflow-x-auto text-zinc-300 font-mono">
                    <span className="text-[11px] font-bold text-zinc-400 shrink-0 uppercase tracking-wider">
                      Tata Letak:
                    </span>
                    <span className="truncate text-zinc-300 text-[11px]">
                      {screen.wireframe_summary}
                    </span>
                  </div>
                )}

                {/* Box Prompt */}
                <div className="relative rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2 border-b border-zinc-800/60 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Prompt {platformFormat === 'v0' ? 'v0.dev (React & Tailwind)' : 'Stitch AI / Figma'}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {activePromptText.length} karakter
                    </span>
                  </div>
                  <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto selection:bg-amber-500/20">
                    {activePromptText}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
