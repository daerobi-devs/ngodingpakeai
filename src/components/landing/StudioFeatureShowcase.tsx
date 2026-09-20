'use client';

import React from 'react';
import {
  Cpu,
  Workflow,
  Bot,
  Terminal,
} from 'lucide-react';

interface StudioFeatureShowcaseProps {
  theme?: 'dark' | 'light';
}

export const StudioFeatureShowcase: React.FC<StudioFeatureShowcaseProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  const features = [
    {
      id: 'mcp-server',
      title: 'Server MCP Terisolasi',
      tag: 'JSON-RPC 2.0',
      icon: Cpu,
      desc: 'Hubungkan Cursor, Antigravity, dan Claude Code langsung ke spesifikasi proyek Anda.',
    },
    {
      id: 'kanban-agent',
      title: 'Papan Kanban Otonom',
      tag: 'Live Sync',
      icon: Workflow,
      desc: 'Pantau pergerakan tugas coding agen AI secara real-time dari To Do hingga Done.',
    },
    {
      id: 'studio-reviser',
      title: 'AI Co-Pilot & Revisi',
      tag: 'Dual Mode',
      icon: Bot,
      desc: 'Diskusi ide arsitektur secara bebas atau perbarui isi dokumen PRD dalam sekali klik.',
    },
    {
      id: 'prompt-cheatsheet',
      title: 'Contekan Prompt Instan',
      tag: '1-Click Copy',
      icon: Terminal,
      desc: 'Salin instruksi lengkap siap tempel untuk memandu agen koding bekerja secara mandiri.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-2.5 max-w-2xl mx-auto">
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${
            isLight
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-800'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
        >
          <span>Fitur Studio &amp; MCP Protocol</span>
        </div>

        <h2
          className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Spesifikasi Hidup untuk Coding Agent
        </h2>

        <p
          className={`text-xs sm:text-sm leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-zinc-400'
          }`}
        >
          Hubungkan PRD, backlog Kanban, dan arsitektur langsung ke AI agent melalui protokol MCP resmi.
        </p>
      </div>

      {/* 4 Clean, Compact & Simple Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              className={`rounded-xl p-4 sm:p-5 border flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 ${
                isLight
                  ? 'bg-white border-slate-200 shadow-xs hover:border-amber-400/60 hover:shadow-sm'
                  : 'bg-zinc-950/60 border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900/30'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                      isLight
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-700'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                  </div>

                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-600'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3
                    className={`text-sm font-bold tracking-tight ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${
                      isLight ? 'text-slate-600' : 'text-zinc-400'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

