'use client';

import React from 'react';
import {
  FileText,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Lock,
  Compass,
  Network,
  GraduationCap,
} from 'lucide-react';

interface ModeSelectionHubProps {
  onSelectMode: (mode: 'prd' | 'roadmap' | 'wizard' | 'studio' | 'architect') => void;
  userName?: string;
  theme?: 'dark' | 'light';
  isStudioLocked?: boolean;
  isRoadmapLocked?: boolean;
  isArchitectLocked?: boolean;
  onOpenPricing?: () => void;
}

export function ModeSelectionHub({
  onSelectMode,
  userName,
  theme = 'dark',
  isRoadmapLocked = false,
  isArchitectLocked = false,
  onOpenPricing,
}: ModeSelectionHubProps) {
  const isLight = theme === 'light';

  return (
    <div className="w-full max-w-6xl mx-auto my-auto py-6 sm:py-10 px-3 sm:px-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="text-center mb-6 sm:mb-8 space-y-2">
        <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
          {userName ? `Halo, ${userName}! ` : ''}Mau ngapain hari ini?
        </h1>

        <p className={`text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          Pilih workspace yang kamu butuhkan. Rancang dokumen spesifikasi hidup, eksplorasi kurikulum keahlian, atau rancang diagram UML &amp; naskah Bab 3 skripsi.
        </p>
      </div>

      {/* 3 Main Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        {/* CARD 1: BIKIN PRD */}
        <div
          onClick={() => onSelectMode('prd')}
          className={`relative flex flex-col rounded-2xl p-5 border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-xl ${
            isLight
              ? 'bg-white border-zinc-200 hover:border-amber-400/80 shadow-xs'
              : 'bg-[#0e1117] border-zinc-800 hover:border-amber-500/50 hover:bg-[#12151e]'
          }`}
        >
          {/* Top Badge */}
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
              isLight
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              Update Baru
            </span>
            <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
              3 Langkah
            </span>
          </div>

          {/* Wireframe Illustration Canvas */}
          <div className={`h-28 rounded-xl border p-2.5 mb-4 flex flex-col justify-between relative overflow-hidden transition-colors ${
            isLight
              ? 'bg-zinc-50 border-zinc-200 group-hover:border-amber-200'
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
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="text-[9px] font-mono ml-1 text-zinc-500">SPEC_KANBAN.md</span>
              </div>
              <FileText className={`w-3 h-3 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
            </div>

            {/* Middle flow */}
            <div className="relative z-10 grid grid-cols-5 gap-1.5 py-0.5 items-center">
              <div className={`col-span-2 p-1.5 rounded border space-y-1 ${
                isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className={`h-1.5 w-10 rounded ${isLight ? 'bg-amber-500' : 'bg-amber-400'}`} />
                <div className={`h-1 w-14 rounded ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
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
              isLight ? 'text-zinc-500 border-zinc-200' : 'text-zinc-500 border-zinc-800/80'
            }`}>
              <span>Living Spec Studio</span>
              <span className="text-amber-400 font-semibold">MCP Sync</span>
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1 flex flex-col">
            <h3 className={`text-base font-bold mb-1 transition-colors ${
              isLight ? 'text-zinc-900 group-hover:text-amber-600' : 'text-zinc-100 group-hover:text-white'
            }`}>
              Bikin PRD
            </h3>

            <p className={`text-[11px] leading-relaxed mb-3.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Panduan interaktif 3 langkah dari ide dasar ke living spec arsitektur siap koding dengan AI Agent.
            </p>

            {/* Checklist Highlights */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Tanya jawab klarifikasi ide & stack
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Pohon fitur & modul sebelum generate
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Papan MCP Kanban (Cursor & Claude)
                </span>
              </div>
            </div>

            {/* Target Persona Badge */}
            <div className={`mt-auto pt-2.5 border-t mb-3.5 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <span className="text-[10px] text-zinc-500 block leading-tight">
                <strong className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Cocok untuk: </strong>
                Developer & PM yang ingin cetak biru presisi tanpa halusinasi.
              </span>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                isLight
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-600 shadow-sm'
                  : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-400 shadow-sm'
              }`}
            >
              <span>Mulai Bikin PRD</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 2: ROADMAP PINTAR */}
        <div
          onClick={() => {
            if (isRoadmapLocked && onOpenPricing) {
              onOpenPricing();
            } else {
              onSelectMode('roadmap');
            }
          }}
          className={`relative flex flex-col rounded-2xl p-5 border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-xl ${
            isLight
              ? 'bg-white border-zinc-200 hover:border-emerald-400/80 shadow-xs'
              : 'bg-[#0e1117] border-zinc-800 hover:border-emerald-500/50 hover:bg-[#12151e]'
          }`}
        >
          {/* Top Badge */}
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
              isLight
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              Mind Map & Belajar
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
                Interaktif
              </span>
            )}
          </div>

          {/* Wireframe Illustration Canvas */}
          <div className={`h-28 rounded-xl border p-2.5 mb-4 flex flex-col justify-between relative overflow-hidden transition-colors ${
            isLight
              ? 'bg-zinc-50 border-zinc-200 group-hover:border-emerald-200'
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
                <GitBranch className={`w-3 h-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                <span className={`text-[9px] font-mono font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Skill Tree Mind Map</span>
              </div>
              <span className={`px-1 py-0.2 rounded text-[8px] font-mono border ${
                isLight ? 'bg-zinc-200/80 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-750 text-zinc-300'
              }`}>
                Auto Branch
              </span>
            </div>

            {/* Tree Branching Nodes Visual */}
            <div className="relative z-10 flex items-center justify-around py-0.5">
              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
              }`}>
                <Compass className="w-3 h-3" />
              </div>
              <div className={`w-4 h-0.5 ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
              <div className="flex flex-col gap-1">
                <div className={`w-16 px-1 py-0.5 rounded border text-[8px] font-mono ${
                  isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}>
                  Dasar Sintaks
                </div>
                <div className={`w-16 px-1 py-0.5 rounded border text-[8px] font-mono ${
                  isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-emerald-900/40 border-emerald-700 text-emerald-300'
                }`}>
                  Proyek Riil
                </div>
              </div>
              <div className={`w-3 h-0.5 ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                isLight ? 'bg-zinc-200 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-700 text-zinc-300'
              }`}>
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              </div>
            </div>

            {/* Bottom bar */}
            <div className={`relative z-10 flex items-center justify-between text-[9px] font-mono pt-1 border-t ${
              isLight ? 'text-zinc-500 border-zinc-200' : 'text-zinc-500 border-zinc-800/80'
            }`}>
              <span>Kurikulum Terstruktur</span>
              <span className="text-emerald-400 font-semibold">AI Mentor</span>
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1 flex flex-col">
            <h3 className={`text-base font-bold mb-1 transition-colors ${
              isLight ? 'text-zinc-900 group-hover:text-emerald-600' : 'text-zinc-100 group-hover:text-white'
            }`}>
              Roadmap Pintar
            </h3>

            <p className={`text-[11px] leading-relaxed mb-3.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Susun pohon kurikulum keahlian dan visualisasi mind map interaktif bersama Mentor AI.
            </p>

            {/* Checklist Highlights */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5 text-emerald-400" />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Mind map pohon materi interaktif 1-klik
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5 text-emerald-400" />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Mentor AI interaktif bertutur manusiawi
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5 text-emerald-400" />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Universal untuk koding, karier & bisnis
                </span>
              </div>
            </div>

            {/* Target Persona Badge */}
            <div className={`mt-auto pt-2.5 border-t mb-3.5 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <span className="text-[10px] text-zinc-500 block leading-tight">
                <strong className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Cocok untuk: </strong>
                Pelajar & profesional yang ingin menguasai skill secara runut.
              </span>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-zinc-100 text-zinc-900 border-2 border-emerald-500 hover:border-emerald-600 shadow-xs'
                  : 'bg-zinc-900 hover:bg-zinc-850 text-white border border-emerald-500/60 hover:border-emerald-400 group-hover:border-zinc-300 shadow-xs'
              }`}
            >
              <span>Buka Roadmap Pintar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-emerald-400" />
            </button>
          </div>
        </div>

        {/* CARD 3: STUDIO ARSITEK & BAB 3 */}
        <div
          onClick={() => {
            if (isArchitectLocked && onOpenPricing) {
              onOpenPricing();
            } else {
              onSelectMode('architect');
            }
          }}
          className={`relative flex flex-col rounded-2xl p-5 border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-xl ${
            isLight
              ? 'bg-white border-zinc-200 hover:border-purple-400/80 shadow-xs'
              : 'bg-[#0e1117] border-zinc-800 hover:border-purple-500/50 hover:bg-[#12151e]'
          }`}
        >
          {/* Top Badge */}
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
              isLight
                ? 'bg-purple-50 border-purple-300 text-purple-800'
                : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
            }`}>
              UML &amp; Bab 3
            </span>
            {isArchitectLocked ? (
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-700 text-zinc-300'
              }`}>
                <Lock className="w-2.5 h-2.5" />
                <span>PLUS</span>
              </span>
            ) : (
              <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Skripsi Ready
              </span>
            )}
          </div>

          {/* Wireframe Illustration Canvas */}
          <div className={`h-28 rounded-xl border p-2.5 mb-4 flex flex-col justify-between relative overflow-hidden transition-colors ${
            isLight
              ? 'bg-zinc-50 border-zinc-200 group-hover:border-purple-200'
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
                <Network className={`w-3 h-3 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                <span className={`text-[9px] font-mono font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>DIAGRAM_BAB3.docx</span>
              </div>
              <span className={`px-1 py-0.2 rounded text-[8px] font-mono border ${
                isLight ? 'bg-zinc-200/80 border-zinc-300 text-zinc-700' : 'bg-zinc-850 border-zinc-750 text-zinc-300'
              }`}>
                UML 2.5
              </span>
            </div>

            {/* Diagram Flow Visual */}
            <div className="relative z-10 grid grid-cols-3 gap-1 py-0.5 text-center">
              <div className={`p-1 rounded border text-[7.5px] font-mono ${
                isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-800 text-purple-300'
              }`}>
                Use Case &amp; ERD
              </div>
              <div className={`p-1 rounded border text-[7.5px] font-mono ${
                isLight ? 'bg-purple-50 border-purple-300 text-purple-800 font-bold' : 'bg-purple-900/40 border-purple-700 text-purple-300'
              }`}>
                Sequence &amp; Act
              </div>
              <div className={`p-1 rounded border text-[7.5px] font-mono ${
                isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-800 text-emerald-400'
              }`}>
                Dosen AI
              </div>
            </div>

            {/* Bottom bar */}
            <div className={`relative z-10 flex items-center justify-between text-[9px] font-mono pt-1 border-t ${
              isLight ? 'text-zinc-500 border-zinc-200' : 'text-zinc-500 border-zinc-800/80'
            }`}>
              <span>Standar DIKTI/Fasilkom</span>
              <span className="text-purple-400 font-semibold">Word DOCX</span>
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1 flex flex-col">
            <h3 className={`text-base font-bold mb-1 transition-colors ${
              isLight ? 'text-zinc-900 group-hover:text-purple-600' : 'text-zinc-100 group-hover:text-white'
            }`}>
              Studio Arsitek &amp; Bab 3
            </h3>

            <p className={`text-[11px] leading-relaxed mb-3.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Ekstraksi cetak biru arsitektur, 6 diagram UML &amp; ERD presisi, naskah Bab 3 skripsi DOCX, dan simulasi kisi sidang.
            </p>

            {/* Checklist Highlights */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5 text-purple-400" />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  6 Diagram UML 2.5 &amp; ERD (Mermaid HD)
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5 text-purple-400" />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  Ekspor Word Bab 3 resmi (Margin 4-4-3-3)
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5 text-purple-400" />
                <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  AI Dosen Penguji &amp; Traceability Matrix
                </span>
              </div>
            </div>

            {/* Target Persona Badge */}
            <div className={`mt-auto pt-2.5 border-t mb-3.5 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <span className="text-[10px] text-zinc-500 block leading-tight">
                <strong className={`font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Cocok untuk: </strong>
                Mahasiswa skripsi, peneliti, &amp; arsitek sistem yang butuh naskah formal.
              </span>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                isArchitectLocked
                  ? isLight
                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300 shadow-xs'
                    : 'bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-500/40 shadow-xs'
                  : isLight
                  ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-700 shadow-sm'
                  : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500/60 shadow-sm'
              }`}
            >
              <span>{isArchitectLocked ? 'Buka Kunci Akses' : 'Buka Studio Arsitek'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
