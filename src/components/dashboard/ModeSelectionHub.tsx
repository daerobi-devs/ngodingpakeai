'use client';

import React from 'react';
import {
  FileText,
  Kanban,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Lock,
  Compass,
  Terminal,
} from 'lucide-react';

interface ModeSelectionHubProps {
  onSelectMode: (mode: 'wizard' | 'studio' | 'roadmap') => void;
  userName?: string;
  theme?: 'dark' | 'light';
  isStudioLocked?: boolean;
  isRoadmapLocked?: boolean;
  onOpenPricing?: () => void;
}

export function ModeSelectionHub({
  onSelectMode,
  userName,
  theme = 'dark',
  isStudioLocked = false,
  isRoadmapLocked = false,
  onOpenPricing,
}: ModeSelectionHubProps) {
  const isLight = theme === 'light';

  return (
    <div className="w-full max-w-5xl mx-auto py-2 sm:py-6 px-2 sm:px-4 animate-in fade-in duration-200">
      {/* Top Header - Compact, No Unnecessary Tagline Pills */}
      <div className="text-center mb-5 sm:mb-7 space-y-1.5">
        <h1 className={`text-xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
          {userName ? `Halo, ${userName}! ` : ''}Mau bikin apa hari ini?
        </h1>

        <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          Pilih alur kerja yang kamu butuhkan. Rancang cetak biru terpandu, koding otonom dengan AI Agent, atau pelajari keahlian baru bersama Mentor AI.
        </p>
      </div>

      {/* 3 Main Workflow Cards - Compact & Sleek */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        {/* CARD 1: MODE TERPADU (WIZARD) */}
        <div
          onClick={() => onSelectMode('wizard')}
          className={`relative flex flex-col rounded-2xl p-4 sm:p-4.5 border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${
            isLight
              ? 'bg-white border-zinc-200 hover:border-zinc-400 shadow-xs'
              : 'bg-[#0e1117] border-zinc-800 hover:border-zinc-600 hover:bg-[#12151e]'
          }`}
        >
          {/* Top Badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${
              isLight
                ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
                : 'bg-zinc-800/90 border-zinc-700 text-zinc-200'
            }`}>
              Paling Populer
            </span>
            <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
              3 Langkah
            </span>
          </div>

          {/* Wireframe Illustration Canvas - Compact */}
          <div className={`h-28 sm:h-30 rounded-xl border p-2.5 mb-3.5 flex flex-col justify-between relative overflow-hidden transition-colors ${
            isLight
              ? 'bg-zinc-50 border-zinc-200 group-hover:border-zinc-300'
              : 'bg-[#090b10] border-zinc-800/90 group-hover:border-zinc-700'
          }`}>
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: isLight
                  ? 'radial-gradient(circle, #71717a 1px, transparent 1px)'
                  : 'radial-gradient(circle, #a1a1aa 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />

            {/* Window bar */}
            <div className={`relative z-10 flex items-center justify-between border-b pb-1.5 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="text-[9px] font-mono ml-1 text-zinc-500">PRD_WIZARD.md</span>
              </div>
              <FileText className={`w-3 h-3 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`} />
            </div>

            {/* Middle flow */}
            <div className="relative z-10 grid grid-cols-5 gap-1.5 py-0.5 items-center">
              <div className={`col-span-2 p-1.5 rounded border space-y-1 ${
                isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className={`h-1.5 w-10 rounded ${isLight ? 'bg-zinc-400' : 'bg-zinc-500'}`} />
                <div className={`h-1 w-14 rounded ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <ArrowRight className={`w-3 h-3 group-hover:translate-x-0.5 transition-transform ${
                  isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`} />
              </div>
              <div className={`col-span-2 p-1.5 rounded border space-y-1 ${
                isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className={`h-1.5 w-12 rounded ${isLight ? 'bg-zinc-500' : 'bg-zinc-400'}`} />
                <div className={`h-1 w-14 rounded ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
              </div>
            </div>

            {/* Bottom bar */}
            <div className={`relative z-10 flex items-center justify-between text-[9px] font-mono pt-1 border-t ${
              isLight ? 'text-zinc-500 border-zinc-200' : 'text-zinc-400 border-zinc-800/80'
            }`}>
              <span>Mermaid ERD</span>
              <span className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>.cursorrules</span>
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1 flex flex-col">
            <h3 className={`text-sm sm:text-base font-bold mb-1 transition-colors ${
              isLight ? 'text-zinc-900 group-hover:text-zinc-700' : 'text-zinc-100 group-hover:text-white'
            }`}>
              Bikin PRD Terpadu
            </h3>

            <p className={`text-[11px] leading-relaxed mb-3 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Ubah ide mentah menjadi cetak biru teknis lengkap melalui bimbingan tanya-jawab AI langkah demi langkah.
            </p>

            {/* Checklist Highlights */}
            <div className="space-y-1.5 mb-3.5">
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Alur 3 langkah (Konsep, Kebutuhan, PRD)
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Lengkap diagram ERD & aturan AI
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Pilihan preset arsitektur siap pakai
                </span>
              </div>
            </div>

            {/* Target Persona Badge */}
            <div className={`mt-auto pt-2.5 border-t mb-3 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <span className="text-[10px] text-zinc-500 block leading-tight">
                <strong className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Cocok untuk: </strong>
                Punya ide baru dan ingin dibimbing merinci fitur dari nol.
              </span>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className={`w-full py-2 px-3.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isLight
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  : 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-xs'
              }`}
            >
              <span>Mulai Mode Terpadu</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 2: MODE STUDIO (SPEC-DRIVEN & KANBAN - WITH CURSOR, CLAUDE, ANTIGRAVITY) */}
        <div
          onClick={() => {
            if (isStudioLocked && onOpenPricing) {
              onOpenPricing();
            } else {
              onSelectMode('studio');
            }
          }}
          className={`relative flex flex-col rounded-2xl p-4 sm:p-4.5 border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${
            isLight
              ? 'bg-white border-zinc-200 hover:border-zinc-400 shadow-xs'
              : 'bg-[#0e1117] border-zinc-800 hover:border-zinc-600 hover:bg-[#12151e]'
          }`}
        >
          {/* Top Badge with Agents */}
          <div className="flex items-center justify-between gap-1.5 mb-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border truncate ${
              isLight
                ? 'bg-zinc-100 border-zinc-300 text-zinc-700'
                : 'bg-zinc-850 border-zinc-700 text-zinc-300'
            }`}>
              Cursor &bull; Claude &bull; Antigravity
            </span>
            {isStudioLocked ? (
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-700 text-zinc-300'
              }`}>
                <Lock className="w-2.5 h-2.5" />
                <span>PLUS</span>
              </span>
            ) : (
              <span className={`text-[11px] font-medium shrink-0 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Server MCP
              </span>
            )}
          </div>

          {/* Wireframe Illustration Canvas - Direct Agent Integration */}
          <div className={`h-28 sm:h-30 rounded-xl border p-2.5 mb-3.5 flex flex-col justify-between relative overflow-hidden transition-colors ${
            isLight
              ? 'bg-zinc-50 border-zinc-200 group-hover:border-zinc-300'
              : 'bg-[#090b10] border-zinc-800/90 group-hover:border-zinc-700'
          }`}>
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: isLight
                  ? 'radial-gradient(circle, #71717a 1px, transparent 1px)'
                  : 'radial-gradient(circle, #a1a1aa 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />

            {/* Window header */}
            <div className={`relative z-10 flex items-center justify-between border-b pb-1.5 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <div className="flex items-center gap-1.5">
                <Kanban className={`w-3 h-3 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`} />
                <span className={`text-[9px] font-mono font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Living Spec & Kanban</span>
              </div>
              <span className={`px-1 py-0.2 rounded text-[8px] font-mono border ${
                isLight ? 'bg-zinc-200/80 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-750 text-zinc-300'
              }`}>
                MCP JSON-RPC
              </span>
            </div>

            {/* Connected Agent Pills Visual */}
            <div className="relative z-10 grid grid-cols-3 gap-1 py-0.5">
              <div className={`p-1 rounded border text-center ${
                isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className="text-[8px] font-mono text-zinc-400 font-bold">Cursor</div>
                <div className="text-[8px] text-zinc-500">Live Sync</div>
              </div>
              <div className={`p-1 rounded border text-center ${
                isLight ? 'bg-zinc-200/60 border-zinc-300' : 'bg-zinc-850 border-zinc-700'
              }`}>
                <div className="text-[8px] font-mono text-zinc-200 font-bold">Claude Code</div>
                <div className="text-[8px] text-zinc-400">Kanban Loop</div>
              </div>
              <div className={`p-1 rounded border text-center ${
                isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className="text-[8px] font-mono text-zinc-300 font-bold">Antigravity</div>
                <div className="text-[8px] text-zinc-500">Auto Task</div>
              </div>
            </div>

            {/* Bottom Bar with Protocol */}
            <div className={`relative z-10 flex items-center justify-between text-[9px] font-mono pt-1 border-t ${
              isLight ? 'text-zinc-500 border-zinc-200' : 'text-zinc-400 border-zinc-800/80'
            }`}>
              <span className="flex items-center gap-1">
                <Terminal className={`w-2.5 h-2.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`} />
                <span>Agent Tools</span>
              </span>
              <span className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Active Sync</span>
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1 flex flex-col">
            <h3 className={`text-sm sm:text-base font-bold mb-1 transition-colors ${
              isLight ? 'text-zinc-900 group-hover:text-zinc-700' : 'text-zinc-100 group-hover:text-white'
            }`}>
              Studio Spec & Kanban
            </h3>

            <p className={`text-[11px] leading-relaxed mb-3 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Spesifikasi hidup yang terhubung langsung ke Cursor, Claude Code, dan Antigravity via Server MCP.
            </p>

            {/* Checklist Highlights */}
            <div className="space-y-1.5 mb-3.5">
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Terhubung ke Cursor, Claude & Antigravity
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Papan tugas Kanban AI (To Do, Doing, Done)
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Revisi spesifikasi interaktif via Studio Chat
                </span>
              </div>
            </div>

            {/* Target Persona Badge */}
            <div className={`mt-auto pt-2.5 border-t mb-3 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <span className="text-[10px] text-zinc-500 block leading-tight">
                <strong className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Cocok untuk: </strong>
                Koding otonom memakai AI Agent di editor lokalmu.
              </span>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className={`w-full py-2 px-3.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                isLight
                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-300'
                  : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-100 border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <span>Masuk ke Mode Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 3: ROADMAP PINTAR & MENTOR AI */}
        <div
          onClick={() => {
            if (isRoadmapLocked && onOpenPricing) {
              onOpenPricing();
            } else {
              onSelectMode('roadmap');
            }
          }}
          className={`relative flex flex-col rounded-2xl p-4 sm:p-4.5 border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${
            isLight
              ? 'bg-white border-zinc-200 hover:border-zinc-400 shadow-xs'
              : 'bg-[#0e1117] border-zinc-800 hover:border-zinc-600 hover:bg-[#12151e]'
          }`}
        >
          {/* Top Badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${
              isLight
                ? 'bg-zinc-100 border-zinc-300 text-zinc-700'
                : 'bg-zinc-850 border-zinc-700 text-zinc-300'
            }`}>
              Edukasi & Karier
            </span>
            {isRoadmapLocked ? (
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-700 text-zinc-300'
              }`}>
                <Lock className="w-2.5 h-2.5" />
                <span>PLUS</span>
              </span>
            ) : (
              <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Universal
              </span>
            )}
          </div>

          {/* Wireframe Illustration Canvas - Compact */}
          <div className={`h-28 sm:h-30 rounded-xl border p-2.5 mb-3.5 flex flex-col justify-between relative overflow-hidden transition-colors ${
            isLight
              ? 'bg-zinc-50 border-zinc-200 group-hover:border-zinc-300'
              : 'bg-[#090b10] border-zinc-800/90 group-hover:border-zinc-700'
          }`}>
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: isLight
                  ? 'radial-gradient(circle, #71717a 1px, transparent 1px)'
                  : 'radial-gradient(circle, #a1a1aa 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />

            {/* Window bar */}
            <div className={`relative z-10 flex items-center justify-between border-b pb-1.5 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <div className="flex items-center gap-1.5">
                <GitBranch className={`w-3 h-3 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`} />
                <span className={`text-[9px] font-mono font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Skill Tree & Mentor</span>
              </div>
              <span className={`px-1 py-0.2 rounded text-[8px] font-mono border ${
                isLight ? 'bg-zinc-200/80 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-750 text-zinc-300'
              }`}>
                1-Click Branch
              </span>
            </div>

            {/* Tree Branching Nodes Visual */}
            <div className="relative z-10 flex items-center justify-around py-0.5">
              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                isLight ? 'bg-zinc-200 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-700 text-zinc-300'
              }`}>
                <Compass className="w-3 h-3" />
              </div>
              <div className={`w-4 h-0.5 ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
              <div className="flex flex-col gap-1">
                <div className={`w-16 px-1 py-0.5 rounded border text-[8px] font-mono ${
                  isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}>
                  Sub-skill A
                </div>
                <div className={`w-16 px-1 py-0.5 rounded border text-[8px] font-mono ${
                  isLight ? 'bg-zinc-200/70 border-zinc-300 text-zinc-800' : 'bg-zinc-850 border-zinc-700 text-zinc-200'
                }`}>
                  Sub-skill B
                </div>
              </div>
              <div className={`w-3 h-0.5 ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                isLight ? 'bg-zinc-200 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-700 text-zinc-300'
              }`}>
                <CheckCircle2 className="w-2.5 h-2.5" />
              </div>
            </div>

            {/* Bottom bar */}
            <div className={`relative z-10 flex items-center justify-between text-[9px] font-mono pt-1 border-t ${
              isLight ? 'text-zinc-500 border-zinc-200' : 'text-zinc-400 border-zinc-800/80'
            }`}>
              <span>Koding, Bisnis, Desain</span>
              <span className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Mentor Manusia AI</span>
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1 flex flex-col">
            <h3 className={`text-sm sm:text-base font-bold mb-1 transition-colors ${
              isLight ? 'text-zinc-900 group-hover:text-zinc-700' : 'text-zinc-100 group-hover:text-white'
            }`}>
              Roadmap Belajar & Mentor
            </h3>

            <p className={`text-[11px] leading-relaxed mb-3 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Susun pohon kurikulum keahlian apa pun dan bedah materinya bersama Mentor AI berpengalaman.
            </p>

            {/* Checklist Highlights */}
            <div className="space-y-1.5 mb-3.5">
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Pohon materi interaktif bercabang 1-klik
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Bimbingan Mentor AI bertutur manusiawi
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Universal untuk koding, bahasa, & bisnis
                </span>
              </div>
            </div>

            {/* Target Persona Badge */}
            <div className={`mt-auto pt-2.5 border-t mb-3 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <span className="text-[10px] text-zinc-500 block leading-tight">
                <strong className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Cocok untuk: </strong>
                Menguasai keahlian atau karier baru dengan kurikulum terarah.
              </span>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className={`w-full py-2 px-3.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                isLight
                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-300'
                  : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-100 border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <span>Eksplorasi Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

