'use client';

import React from 'react';
import { ArrowRight, Lightbulb, FileText, Cpu, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Input Ide & Pilih Stack',
    description:
      'Ketikkan konsep produk dalam bahasa sehari-hari dan pilih preset template arsitektur (Next.js, Mobile App, AI Service, atau Kustom).',
    tag: 'Ideasi',
    icon: Lightbulb,
  },
  {
    step: '02',
    title: 'AI Bentuk PRD & Kanban',
    description:
      'AI merumuskan dokumen PRD lengkap, 3 diagram visual Mermaid (flowchart, user journey, skema ERD), dan 8-12 rincian tugas Kanban.',
    tag: 'Spesifikasi',
    icon: FileText,
  },
  {
    step: '03',
    title: 'Koneksikan via MCP Protocol',
    description:
      'Salin URL server MCP atau prompt contekan instan ke Cursor, Google Antigravity, atau Claude Code tanpa perlu setup manual.',
    tag: 'Integrasi',
    icon: Cpu,
  },
  {
    step: '04',
    title: 'Koding Otonom & Live Web',
    description:
      'Agen AI mengeksekusi kartu tugas secara mandiri, mengupdate papan Kanban secara real-time di browser hingga aplikasi siap uji.',
    tag: 'Eksekusi',
    icon: CheckCircle2,
  },
];

export const VisualWorkflowPipeline: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <p className={`text-xs font-mono uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
          Alur Kerja Modern
        </p>
        <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Cara Kerja Studio PRD
        </h2>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
          Dari konsep ide kasar menjadi aplikasi aktif yang dieksekusi oleh agen AI koding secara terarah.
        </p>
      </div>

      {/* Steps Grid — Sleek & Compact with clean SVG icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.step}
              className={`rounded-xl p-5 flex flex-col justify-between border transition-all duration-150 hover:-translate-y-0.5 ${
                isLight
                  ? 'bg-white border-slate-200/90 shadow-xs hover:border-amber-400/50 hover:shadow-md'
                  : 'bg-zinc-950/70 border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900/50'
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-mono font-bold ${
                      isLight
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-800'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {item.step}
                  </span>

                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4 text-amber-500 shrink-0" />
                  <h3 className={`font-bold text-sm leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {item.title}
                  </h3>
                </div>

                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-dashed border-zinc-800/40 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                <span>Fase {idx + 1}</span>
                <ArrowRight className="h-3 w-3 text-zinc-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
