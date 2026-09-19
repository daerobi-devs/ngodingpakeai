'use client';

import React from 'react';
import {
  Layers,
  Workflow,
  Database,
  Cpu,
  GitBranch,
  FileCode2,
  Sparkles,
} from 'lucide-react';

interface BlueprintItem {
  number: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  description: string;
  format: string;
  highlight: string;
}

const BLUEPRINT_LIST: BlueprintItem[] = [
  {
    number: '01',
    title: 'System Architecture (C4)',
    badge: 'C4 MODEL',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    icon: Layers,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/30',
    description:
      'Pemetaan komponen aplikasi dari Client Tier, Next.js Server Actions, database PostgreSQL, hingga integrasi webhook eksternal.',
    format: 'graph TD',
    highlight: 'Topologi & Boundary',
  },
  {
    number: '02',
    title: 'Sequence Flow Diagram',
    badge: 'SEQUENCE',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    icon: Workflow,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    description:
      'Alur kronologis interaksi request pengguna, penguncian transaksi atomic, autentikasi, hingga konfirmasi respon sistem.',
    format: 'sequenceDiagram',
    highlight: 'Alur Request & Transaksi',
  },
  {
    number: '03',
    title: 'Database Relational ERD',
    badge: 'POSTGRES ERD',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
    icon: Database,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/30',
    description:
      'Skema relasional tabel database lengkap dengan tipe data kolom, primary key, foreign key, dan indeks query.',
    format: 'erDiagram',
    highlight: 'Skema Tabel & Foreign Keys',
  },
  {
    number: '04',
    title: 'State Machine Diagram',
    badge: 'STATE MACHINE',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    icon: Cpu,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/30',
    description:
      'Pemodelan siklus hidup data dan transisi status sistem dari tahap draft, sedang diproses, aktif, hingga tuntas.',
    format: 'stateDiagram',
    highlight: 'Transisi Status & Siklus Data',
  },
  {
    number: '05',
    title: 'Feature Mindmap Tree',
    badge: 'SCOPE MAP',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    icon: GitBranch,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    description:
      'Dekomposisi pohon modul fitur MVP prioritas P0 (wajib) dan P1 (tahap lanjutan) agar ruang lingkup proyek terarah.',
    format: 'mindmap',
    highlight: 'Dekomposisi Prioritas P0/P1',
  },
  {
    number: '06',
    title: 'Format Standar .mmd',
    badge: 'PORTABLE',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    icon: FileCode2,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/30',
    description:
      'Seluruh diagram diekspor dalam format Mermaid (.mmd) murni — langsung dirender di Cursor, GitHub, dan Notion.',
    format: 'docs/diagrams/*.mmd',
    highlight: 'Kompatibel Cursor & Git',
  },
];

export const InteractiveBlueprintStudio: React.FC<{ theme?: 'dark' | 'light' }> = ({
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <p
          className={`text-xs font-mono uppercase tracking-widest ${
            isLight ? 'text-slate-400' : 'text-zinc-500'
          }`}
        >
          Output Otomatis
        </p>
        <h2
          className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          5 Diagram Arsitektur
        </h2>
        <p
          className={`text-sm leading-relaxed ${
            isLight ? 'text-slate-500' : 'text-zinc-400'
          }`}
        >
          Setiap PRD dilengkapi diagram standar Mermaid{' '}
          <code
            className={`font-mono text-xs px-1.5 py-0.5 rounded ${
              isLight ? 'bg-slate-100 text-slate-800' : 'bg-zinc-800 text-amber-300'
            }`}
          >
            .mmd
          </code>{' '}
          yang kompatibel dengan Cursor, GitHub, dan Notion.
        </p>
      </div>

      {/* Modern Vibrant Cards Grid with Floating Borders & Glow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {BLUEPRINT_LIST.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.number}
              className={`group relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 cursor-default overflow-hidden ${
                isLight
                  ? 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/10'
                  : 'bg-[#121216] hover:bg-[#17171d] border-zinc-800/80 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10'
              }`}
            >
              {/* Top Edge Glow Beam on hover */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Ambient radial glow in background */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-500 pointer-events-none" />

              <div className="relative space-y-3.5 z-10">
                {/* Top row: Icon + Number + Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border ${item.iconBg} ${item.iconColor} shadow-xs group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-xs font-mono font-bold tracking-widest ${
                        isLight ? 'text-slate-400' : 'text-zinc-500'
                      } group-hover:text-amber-400 transition-colors`}
                    >
                      {item.number}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className={`font-bold text-base leading-snug tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  } group-hover:text-amber-300 transition-colors`}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  {item.description}
                </p>
              </div>

              {/* Bottom row: Format code & Highlight */}
              <div className="relative z-10 pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono">
                <code className="px-2 py-0.5 rounded-md bg-black/60 border border-zinc-800 text-emerald-400 text-[10px] font-semibold group-hover:border-emerald-500/40 transition-colors">
                  {item.format}
                </code>
                <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                  {item.highlight}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
