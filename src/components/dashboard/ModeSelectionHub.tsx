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
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-8 px-2 sm:px-4 animate-in fade-in duration-300">
      {/* Top Banner Tagline */}
      <div className="text-center mb-8 sm:mb-10 space-y-3">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium border ${
          isLight
            ? 'bg-zinc-100 border-zinc-200 text-zinc-700'
            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-zinc-500' : 'bg-zinc-400'} animate-pulse`} />
          <span>Platform Arsitektur & Spesifikasi AI Coding</span>
        </div>

        <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
          {userName ? `Halo, ${userName}! ` : ''}Mau bikin apa hari ini?
        </h1>

        <p className={`text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          Pilih alur kerja yang paling sesuai dengan kebutuhanmu. Dari merancang cetak biru PRD terpandu,
          eksekusi koding otonom berbasis Kanban & MCP, hingga menguasai keahlian baru bersama Mentor AI.
        </p>
      </div>

      {/* 3 Main Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        {/* CARD 1: MODE TERPADU (WIZARD) */}
        <div
          onClick={() => onSelectMode('wizard')}
          className={`relative flex flex-col rounded-3xl p-5 sm:p-6 border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-xl ${
            isLight
              ? 'bg-white border-zinc-200 hover:border-zinc-400 shadow-sm'
              : 'bg-[#0e1117] border-zinc-800 hover:border-zinc-600 hover:bg-[#12151e]'
          }`}
        >
          {/* Top Badge */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border ${
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

          {/* Wireframe Illustration Canvas */}
          <div className={`h-36 sm:h-40 rounded-2xl border p-3 mb-5 flex flex-col justify-between relative overflow-hidden transition-colors ${
            isLight
              ? 'bg-zinc-50 border-zinc-200 group-hover:border-zinc-300'
              : 'bg-[#090b10] border-zinc-800/90 group-hover:border-zinc-700'
          }`}>
            {/* Grid Pattern Background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: isLight
                  ? 'radial-gradient(circle, #71717a 1px, transparent 1px)'
                  : 'radial-gradient(circle, #a1a1aa 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Wireframe Elements */}
            <div className={`relative z-10 flex items-center justify-between border-b pb-2 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span className={`text-[10px] font-mono ml-1 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>PRD_WIZARD.md</span>
              </div>
              <FileText className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`} />
            </div>

            <div className="relative z-10 grid grid-cols-5 gap-2 py-1 items-center">
              {/* Left: Idea Bubble */}
              <div className={`col-span-2 p-2 rounded-lg border space-y-1 ${
                isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className={`h-2 w-12 rounded ${isLight ? 'bg-zinc-400' : 'bg-zinc-500'}`} />
                <div className={`h-1.5 w-16 rounded ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
                <div className={`h-1.5 w-10 rounded ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
              </div>

              {/* Center Arrow */}
              <div className="col-span-1 flex items-center justify-center">
                <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ${
                  isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`} />
              </div>

              {/* Right: Spec Document & Architecture */}
              <div className={`col-span-2 p-2 rounded-lg border space-y-1 ${
                isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className={`h-2 w-14 rounded ${isLight ? 'bg-zinc-500' : 'bg-zinc-400'}`} />
                <div className={`h-1.5 w-12 rounded ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
                <div className={`h-1.5 w-16 rounded ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
              </div>
            </div>

            <div className={`relative z-10 flex items-center justify-between text-[10px] font-mono pt-1 border-t ${
              isLight ? 'text-zinc-500 border-zinc-200' : 'text-zinc-400 border-zinc-800/80'
            }`}>
              <span>Mermaid ERD</span>
              <span className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>.cursorrules</span>
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1 flex flex-col">
            <h3 className={`text-base sm:text-lg font-bold mb-1.5 transition-colors ${
              isLight ? 'text-zinc-900 group-hover:text-zinc-700' : 'text-zinc-100 group-hover:text-white'
            }`}>
              Bikin PRD Terpadu
            </h3>

            <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Ubah ide mentah menjadi cetak biru teknis lengkap melalui bimbingan tanya-jawab AI langkah demi langkah.
            </p>

            {/* Checklist Highlights */}
            <div className="space-y-2 mb-5">
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Alur 3 langkah (Konsep, Bedah Kebutuhan, Cetak Biru)
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Lengkap dengan ERD, skema database, dan aturan AI
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Pilihan preset arsitektur (Starter, Mobile, AI Service)
                </span>
              </div>
            </div>

            {/* Target Persona Badge */}
            <div className={`mt-auto pt-3 border-t mb-4 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <span className="text-[11px] text-zinc-500 block">
                <strong className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Pilih ini jika: </strong>
                Kamu punya ide aplikasi baru dan ingin dibimbing merinci fiturnya dari nol.
              </span>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isLight
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  : 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm'
              }`}
            >
              <span>Mulai Mode Terpadu</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 2: MODE STUDIO (SPEC-DRIVEN & KANBAN) */}
        <div
          onClick={() => {
            if (isStudioLocked && onOpenPricing) {
              onOpenPricing();
            } else {
              onSelectMode('studio');
            }
          }}
          className={`relative flex flex-col rounded-3xl p-5 sm:p-6 border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-xl ${
            isLight
              ? 'bg-white border-zinc-200 hover:border-zinc-400 shadow-sm'
              : 'bg-[#0e1117] border-zinc-800 hover:border-zinc-600 hover:bg-[#12151e]'
          }`}
        >
          {/* Top Badge */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border ${
              isLight
                ? 'bg-zinc-100 border-zinc-300 text-zinc-700'
                : 'bg-zinc-850 border-zinc-700 text-zinc-300'
            }`}>
              Untuk AI Coding Agent
            </span>
            {isStudioLocked ? (
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-700 text-zinc-300'
              }`}>
                <Lock className="w-2.5 h-2.5" />
                <span>PLUS/PRO</span>
              </span>
            ) : (
              <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                MCP Server
              </span>
            )}
          </div>

          {/* Wireframe Illustration Canvas */}
          <div className={`h-36 sm:h-40 rounded-2xl border p-3 mb-5 flex flex-col justify-between relative overflow-hidden transition-colors ${
            isLight
              ? 'bg-zinc-50 border-zinc-200 group-hover:border-zinc-300'
              : 'bg-[#090b10] border-zinc-800/90 group-hover:border-zinc-700'
          }`}>
            {/* Grid Pattern Background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: isLight
                  ? 'radial-gradient(circle, #71717a 1px, transparent 1px)'
                  : 'radial-gradient(circle, #a1a1aa 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Wireframe Elements */}
            <div className={`relative z-10 flex items-center justify-between border-b pb-2 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <div className="flex items-center gap-1.5">
                <Kanban className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`} />
                <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Studio Living Spec</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                isLight ? 'bg-zinc-200/80 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-750 text-zinc-300'
              }`}>
                JSON-RPC 2.0
              </span>
            </div>

            {/* Kanban Columns Visual */}
            <div className="relative z-10 grid grid-cols-3 gap-2 py-1">
              <div className={`p-1.5 rounded-lg border space-y-1 ${
                isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className={`text-[9px] font-mono font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>TO DO</div>
                <div className={`h-2 w-full rounded ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
                <div className={`h-2 w-4/5 rounded ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
              </div>
              <div className={`p-1.5 rounded-lg border space-y-1 ${
                isLight ? 'bg-zinc-200/60 border-zinc-300' : 'bg-zinc-850 border-zinc-700'
              }`}>
                <div className={`text-[9px] font-mono font-bold ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>IN PROGRESS</div>
                <div className={`h-2 w-full rounded ${isLight ? 'bg-zinc-500' : 'bg-zinc-400'}`} />
                <div className={`h-2 w-3/5 rounded ${isLight ? 'bg-zinc-300' : 'bg-zinc-600'}`} />
              </div>
              <div className={`p-1.5 rounded-lg border space-y-1 ${
                isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className={`text-[9px] font-mono font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>DONE</div>
                <div className={`h-2 w-full rounded ${isLight ? 'bg-zinc-400' : 'bg-zinc-500'}`} />
                <div className={`h-2 w-2/3 rounded ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
              </div>
            </div>

            <div className={`relative z-10 flex items-center justify-between text-[10px] font-mono pt-1 border-t ${
              isLight ? 'text-zinc-500 border-zinc-200' : 'text-zinc-400 border-zinc-800/80'
            }`}>
              <span className="flex items-center gap-1">
                <Terminal className={`w-3 h-3 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`} />
                <span>Cursor / Claude</span>
              </span>
              <span className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Auto Sync</span>
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1 flex flex-col">
            <h3 className={`text-base sm:text-lg font-bold mb-1.5 transition-colors ${
              isLight ? 'text-zinc-900 group-hover:text-zinc-700' : 'text-zinc-100 group-hover:text-white'
            }`}>
              Studio Spec & Kanban
            </h3>

            <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Rancang dokumen spesifikasi hidup yang terhubung langsung ke Cursor dan Claude Code via Server MCP.
            </p>

            {/* Checklist Highlights */}
            <div className="space-y-2 mb-5">
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Papan tugas Kanban AI (To Do, In Progress, Done)
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Server MCP resmi untuk koding otonom di editor lokal
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Revisi spesifikasi interaktif per bab via Studio Chat
                </span>
              </div>
            </div>

            {/* Target Persona Badge */}
            <div className={`mt-auto pt-3 border-t mb-4 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <span className="text-[11px] text-zinc-500 block">
                <strong className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Pilih ini jika: </strong>
                Kamu ingin koding otonom dengan AI Agent memakai alur tugas Kanban terstruktur.
              </span>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
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
          className={`relative flex flex-col rounded-3xl p-5 sm:p-6 border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-xl ${
            isLight
              ? 'bg-white border-zinc-200 hover:border-zinc-400 shadow-sm'
              : 'bg-[#0e1117] border-zinc-800 hover:border-zinc-600 hover:bg-[#12151e]'
          }`}
        >
          {/* Top Badge */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border ${
              isLight
                ? 'bg-zinc-100 border-zinc-300 text-zinc-700'
                : 'bg-zinc-850 border-zinc-700 text-zinc-300'
            }`}>
              Edukasi & Karier
            </span>
            {isRoadmapLocked ? (
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-700 text-zinc-300'
              }`}>
                <Lock className="w-2.5 h-2.5" />
                <span>PLUS/PRO</span>
              </span>
            ) : (
              <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Universal
              </span>
            )}
          </div>

          {/* Wireframe Illustration Canvas */}
          <div className={`h-36 sm:h-40 rounded-2xl border p-3 mb-5 flex flex-col justify-between relative overflow-hidden transition-colors ${
            isLight
              ? 'bg-zinc-50 border-zinc-200 group-hover:border-zinc-300'
              : 'bg-[#090b10] border-zinc-800/90 group-hover:border-zinc-700'
          }`}>
            {/* Grid Pattern Background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: isLight
                  ? 'radial-gradient(circle, #71717a 1px, transparent 1px)'
                  : 'radial-gradient(circle, #a1a1aa 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Wireframe Elements */}
            <div className={`relative z-10 flex items-center justify-between border-b pb-2 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <div className="flex items-center gap-1.5">
                <GitBranch className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`} />
                <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Skill Tree & Mentor</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                isLight ? 'bg-zinc-200/80 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-750 text-zinc-300'
              }`}>
                1-Click Branch
              </span>
            </div>

            {/* Tree Branching Nodes Visual */}
            <div className="relative z-10 flex items-center justify-around py-2">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                isLight ? 'bg-zinc-200 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-700 text-zinc-300'
              }`}>
                <Compass className="w-4 h-4" />
              </div>
              <div className={`w-6 h-0.5 ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
              <div className="flex flex-col gap-1.5">
                <div className={`w-20 px-1.5 py-1 rounded border text-[9px] font-mono ${
                  isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}>
                  Sub-skill A
                </div>
                <div className={`w-20 px-1.5 py-1 rounded border text-[9px] font-mono ${
                  isLight ? 'bg-zinc-200/70 border-zinc-300 text-zinc-800' : 'bg-zinc-850 border-zinc-700 text-zinc-200'
                }`}>
                  Sub-skill B
                </div>
              </div>
              <div className={`w-4 h-0.5 ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                isLight ? 'bg-zinc-200 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-700 text-zinc-300'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className={`relative z-10 flex items-center justify-between text-[10px] font-mono pt-1 border-t ${
              isLight ? 'text-zinc-500 border-zinc-200' : 'text-zinc-400 border-zinc-800/80'
            }`}>
              <span>Bahasa, Koding, Bisnis</span>
              <span className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Mentor Manusia AI</span>
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1 flex flex-col">
            <h3 className={`text-base sm:text-lg font-bold mb-1.5 transition-colors ${
              isLight ? 'text-zinc-900 group-hover:text-zinc-700' : 'text-zinc-100 group-hover:text-white'
            }`}>
              Roadmap Belajar & Mentor
            </h3>

            <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Susun pohon kurikulum keahlian apa pun dan bedah materinya bersama Mentor AI berpengalaman.
            </p>

            {/* Checklist Highlights */}
            <div className="space-y-2 mb-5">
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Pohon materi interaktif dengan percabangan 1-klik
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Bimbingan langsung Mentor AI dengan tutur manusiawi
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Universal: koding, bahasa asing, bisnis, desain, sains
                </span>
              </div>
            </div>

            {/* Target Persona Badge */}
            <div className={`mt-auto pt-3 border-t mb-4 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <span className="text-[11px] text-zinc-500 block">
                <strong className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Pilih ini jika: </strong>
                Kamu ingin menguasai suatu keahlian atau karier baru dengan kurikulum terarah.
              </span>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
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
