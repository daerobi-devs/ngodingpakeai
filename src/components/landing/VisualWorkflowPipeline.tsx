'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Tulis 1 Kalimat Ide',
    description:
      'Ketik konsep aplikasi dalam bahasa sehari-hari — tanpa istilah teknis. Sistem akan memahami konteks dan domain proyek secara otomatis.',
    tag: 'Input',
  },
  {
    step: '02',
    title: 'AI Susun Arsitektur',
    description:
      'Sistem merumuskan PRD 7 kategori, skema database relasional, dan 5 blueprint diagram arsitektur dalam hitungan detik.',
    tag: 'Proses',
  },
  {
    step: '03',
    title: 'Unduh & Langsung Koding',
    description:
      'Dapatkan paket .ZIP berisi PRD.md, DESIGN.md, dan .cursorrules yang siap dibuka di Cursor atau Claude Code.',
    tag: 'Output',
  },
];

export const VisualWorkflowPipeline: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <p className={`text-xs font-mono uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
          Cara Kerja
        </p>
        <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          3 Langkah Sederhana
        </h2>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
          Dari ide kasar hingga proyek siap dijalankan bersama AI coding agent.
        </p>
      </div>

      {/* Steps — horizontal connected row */}
      <div className="flex flex-col md:flex-row items-stretch gap-0">
        {steps.map((item, idx) => (
          <React.Fragment key={item.step}>
            <div
              className={`flex-1 rounded-2xl p-6 sm:p-8 flex flex-col gap-4 ${
                isLight
                  ? 'bg-white border border-slate-200 shadow-sm'
                  : 'bg-[#121215] border border-zinc-800/80'
              }`}
            >
              {/* Step number */}
              <span
                className={`text-xs font-mono font-semibold tracking-widest ${
                  isLight ? 'text-slate-400' : 'text-zinc-600'
                }`}
              >
                {item.step}
              </span>

              {/* Tag pill */}
              <span
                className={`self-start text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isLight
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {item.tag}
              </span>

              {/* Content */}
              <div className="space-y-2 flex-1">
                <h3 className={`font-bold text-base leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {item.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {item.description}
                </p>
              </div>
            </div>

            {/* Arrow connector between steps */}
            {idx < steps.length - 1 && (
              <div className={`hidden md:flex items-center px-2 ${isLight ? 'text-slate-300' : 'text-zinc-700'}`}>
                <ArrowRight className="h-5 w-5 flex-shrink-0" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
