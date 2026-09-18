'use client';

import React from 'react';

interface BlueprintItem {
  number: string;
  title: string;
  badge: string;
  description: string;
  format: string;
}

const BLUEPRINT_LIST: BlueprintItem[] = [
  {
    number: '01',
    title: 'System Architecture (C4)',
    badge: 'C4 MODEL',
    description:
      'Pemetaan komponen aplikasi dari Client Tier, Next.js Server Actions, database PostgreSQL, hingga integrasi webhook eksternal.',
    format: 'graph TD',
  },
  {
    number: '02',
    title: 'Sequence Flow Diagram',
    badge: 'SEQUENCE',
    description:
      'Alur kronologis interaksi request pengguna, penguncian transaksi atomic, autentikasi, hingga konfirmasi respon sistem.',
    format: 'sequenceDiagram',
  },
  {
    number: '03',
    title: 'Database Relational ERD',
    badge: 'POSTGRES ERD',
    description:
      'Skema relasional tabel database lengkap dengan tipe data kolom, primary key, foreign key, dan indeks query.',
    format: 'erDiagram',
  },
  {
    number: '04',
    title: 'State Machine Diagram',
    badge: 'STATE MACHINE',
    description:
      'Pemodelan siklus hidup data dan transisi status sistem dari tahap draft, sedang diproses, aktif, hingga tuntas.',
    format: 'stateDiagram',
  },
  {
    number: '05',
    title: 'Feature Mindmap Tree',
    badge: 'SCOPE MAP',
    description:
      'Dekomposisi pohon modul fitur MVP prioritas P0 (wajib) dan P1 (tahap lanjutan) agar ruang lingkup proyek terarah.',
    format: 'mindmap',
  },
  {
    number: '06',
    title: 'Format Standar .mmd',
    badge: 'PORTABLE',
    description:
      'Seluruh diagram diekspor dalam format Mermaid (.mmd) murni — langsung dirender di Cursor, GitHub, dan Notion.',
    format: 'docs/diagrams/*.mmd',
  },
];

export const InteractiveBlueprintStudio: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <p className={`text-xs font-mono uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
          Output Otomatis
        </p>
        <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          5 Diagram Arsitektur
        </h2>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
          Setiap PRD dilengkapi diagram standar Mermaid{' '}
          <code className={`font-mono text-xs px-1 rounded ${isLight ? 'bg-slate-100' : 'bg-zinc-800'}`}>.mmd</code>
          {' '}yang kompatibel dengan Cursor, GitHub, dan Notion.
        </p>
      </div>

      {/* Grid — 2 columns on md+, each row is a numbered row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px">
        {BLUEPRINT_LIST.map((item, idx) => (
          <div
            key={item.number}
            className={`p-6 flex flex-col gap-3 transition-colors duration-150 ${
              isLight
                ? 'bg-white hover:bg-slate-50 border border-slate-200'
                : 'bg-[#121215] hover:bg-zinc-900/80 border border-zinc-800/60'
            } ${
              // Round corners on first and last corners of grid
              idx === 0 ? 'rounded-tl-2xl' :
              idx === 2 ? 'rounded-tr-2xl' :
              idx === 3 ? 'rounded-bl-2xl' :
              idx === 5 ? 'rounded-br-2xl' : ''
            }`}
          >
            {/* Top row: number + badge */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono font-semibold tracking-widest ${isLight ? 'text-slate-400' : 'text-zinc-600'}`}>
                {item.number}
              </span>
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isLight ? 'bg-slate-100 text-slate-500' : 'bg-zinc-800/80 text-zinc-500'
                }`}
              >
                {item.badge}
              </span>
            </div>

            {/* Title */}
            <h3 className={`font-bold text-sm leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {item.title}
            </h3>

            {/* Description */}
            <p className={`text-xs leading-relaxed flex-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {item.description}
            </p>

            {/* Format tag */}
            <p className={`text-[10px] font-mono pt-2 border-t ${
              isLight ? 'border-slate-100 text-slate-400' : 'border-zinc-800/60 text-zinc-600'
            }`}>
              {item.format}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
