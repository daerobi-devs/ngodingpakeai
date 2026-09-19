'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TEMPLATE_ARCHETYPES,
  TemplateArchetype,
  DEFAULT_ARCHETYPE_ID,
} from '@/lib/templates/archetypes';
import {
  NextJsLogo,
  NodeJsLogo,
  SupabaseLogo,
  DockerLogo,
  ReactLogo,
  FastApiLogo,
  PostgresLogo,
  EasLogo,
  VueLogo,
  SvelteLogo,
  AstroLogo,
  FlutterLogo,
  GoLogo,
  PythonLogo,
  LaravelLogo,
  MySqlLogo,
  MongoLogo,
  SqliteLogo,
  RedisLogo,
  CloudflareLogo,
  AwsLogo,
  K8sLogo,
} from '@/components/icons/TechIcons';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface LandingTemplateShowcaseProps {
  theme?: 'dark' | 'light';
}

export const LandingTemplateShowcase: React.FC<LandingTemplateShowcaseProps> = ({
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [activeTemplateId, setActiveTemplateId] = useState<string>(DEFAULT_ARCHETYPE_ID);

  const currentArch: TemplateArchetype =
    TEMPLATE_ARCHETYPES[activeTemplateId] || TEMPLATE_ARCHETYPES[DEFAULT_ARCHETYPE_ID];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="text-center space-y-2.5 max-w-3xl mx-auto">
        <h2
          className={`text-2xl sm:text-4xl font-black tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Pilih Fondasi Standar Industri untuk PRD & AI Coding
        </h2>
        <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
          Bukan sekadar teks biasa. Setiap template menghasilkan spesifikasi teknis lengkap, token desain, diagram arsitektur visual, dan starter kit siap lempar ke AI coding pilihanmu.
        </p>
      </div>

      {/* 2. Interactive Template Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.values(TEMPLATE_ARCHETYPES).map((arch) => {
          const isSelected = activeTemplateId === arch.id;
          return (
            <button
              key={arch.id}
              type="button"
              onClick={() => setActiveTemplateId(arch.id)}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  : 'bg-[#141418] border-zinc-800/90 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono font-bold text-sm text-white">{arch.name}</span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {arch.badge}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-snug line-clamp-2">
                  {arch.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>{arch.title}</span>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 ml-1" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. High-Fidelity macOS Window Card */}
      <div
        className={`rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'border-slate-300 bg-white shadow-slate-300/50'
            : 'border-zinc-800 bg-[#121215] shadow-black/80'
        }`}
      >
        {/* Window Top Bar (macOS style) */}
        <div
          className={`flex items-center justify-between border-b px-4 py-3 ${
            isLight ? 'border-slate-200 bg-slate-100/70' : 'border-zinc-800 bg-zinc-950/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
            <span
              className={`ml-3 text-[11px] font-mono font-medium truncate ${
                isLight ? 'text-slate-500' : 'text-zinc-400'
              }`}
            >
              workspace / PRD-{currentArch.name}-Starter-Kit.zip
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">
              EXPORT READY (.ZIP)
            </span>
          </div>
        </div>

        {/* Window Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Inside Window: Title, Badge, Description, and CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Preset: {currentArch.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
                  {currentArch.badge}
                </span>
              </div>
              <h3
                className={`text-xl sm:text-2xl font-bold tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {currentArch.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {currentArch.description}
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href={`/generator?template=${currentArch.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-3 text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <span>Mulai Buat PRD dengan {currentArch.name}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Technology Stack Grid with Official Vector Logos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-zinc-400">
                Arsitektur & Komponen Teknologi Bawaan:
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Siap Produksi
              </span>
            </div>

            {activeTemplateId !== 'custom' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Frontend */}
                <div
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                    isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/70 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black border border-zinc-800 p-2 shadow-inner">
                      {currentArch.tech.frontend.iconType === 'nextjs' && (
                        <NextJsLogo className="h-7 w-7" />
                      )}
                      {currentArch.tech.frontend.iconType === 'react' && (
                        <ReactLogo className="h-7 w-7" />
                      )}
                      {currentArch.tech.frontend.iconType === 'expo' && (
                        <EasLogo className="h-7 w-7" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono font-semibold">
                        Frontend
                      </span>
                      <span className="font-bold text-zinc-100 block text-xs">
                        {currentArch.tech.frontend.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {currentArch.tech.frontend.sublabel}
                  </p>
                </div>

                {/* Backend */}
                <div
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                    isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/70 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black border border-zinc-800 p-2 shadow-inner">
                      {currentArch.tech.backend.iconType === 'nodejs' && (
                        <NodeJsLogo className="h-7 w-7" />
                      )}
                      {currentArch.tech.backend.iconType === 'fastapi' && (
                        <FastApiLogo className="h-7 w-7" />
                      )}
                      {currentArch.tech.backend.iconType === 'supabase' && (
                        <SupabaseLogo className="h-7 w-7" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono font-semibold">
                        Backend
                      </span>
                      <span className="font-bold text-zinc-100 block text-xs">
                        {currentArch.tech.backend.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {currentArch.tech.backend.sublabel}
                  </p>
                </div>

                {/* Database */}
                <div
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                    isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/70 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black border border-zinc-800 p-2 shadow-inner">
                      {currentArch.tech.database.iconType === 'supabase' && (
                        <SupabaseLogo className="h-7 w-7" />
                      )}
                      {currentArch.tech.database.iconType === 'postgres' && (
                        <PostgresLogo className="h-7 w-7" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono font-semibold">
                        Database
                      </span>
                      <span className="font-bold text-zinc-100 block text-xs">
                        {currentArch.tech.database.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {currentArch.tech.database.sublabel}
                  </p>
                </div>

                {/* Deployment */}
                <div
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                    isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/70 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black border border-zinc-800 p-2 shadow-inner">
                      {currentArch.tech.deployment.iconType === 'docker' && (
                        <DockerLogo className="h-7 w-7" />
                      )}
                      {currentArch.tech.deployment.iconType === 'eas' && (
                        <EasLogo className="h-7 w-7" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono font-semibold">
                        Deployment
                      </span>
                      <span className="font-bold text-zinc-100 block text-xs">
                        {currentArch.tech.deployment.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {currentArch.tech.deployment.sublabel}
                  </p>
                </div>
              </div>
            ) : (
              /* Custom Architecture Ecosystem Multi-Logo View */
              <div
                className={`rounded-xl border p-5 space-y-4 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/70 border-zinc-800'
                }`}
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                    Frontend Layer:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <NextJsLogo className="h-4 w-4" /> Next.js
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <ReactLogo className="h-4 w-4" /> React
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <VueLogo className="h-4 w-4" /> Vue
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <SvelteLogo className="h-4 w-4" /> Svelte
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <AstroLogo className="h-4 w-4" /> Astro
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <FlutterLogo className="h-4 w-4" /> Flutter
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-800/40">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                    Backend Layer:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <NodeJsLogo className="h-4 w-4" /> Node.js
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <GoLogo className="h-4 w-4" /> Golang
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <PythonLogo className="h-4 w-4" /> Python
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <FastApiLogo className="h-4 w-4" /> FastAPI
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <LaravelLogo className="h-4 w-4" /> Laravel
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <SupabaseLogo className="h-4 w-4" /> Supabase
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-800/40">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                    Database & Storage Layer:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <PostgresLogo className="h-4 w-4" /> PostgreSQL
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <MySqlLogo className="h-4 w-4" /> MySQL
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <MongoLogo className="h-4 w-4" /> MongoDB
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <SqliteLogo className="h-4 w-4" /> SQLite
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <RedisLogo className="h-4 w-4" /> Redis
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-800/40">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                    Deployment & Cloud:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <DockerLogo className="h-4 w-4" /> Docker
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <CloudflareLogo className="h-4 w-4" /> Cloudflare
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <AwsLogo className="h-4 w-4" /> AWS
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <K8sLogo className="h-4 w-4" /> Kubernetes
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 font-mono">
                      <EasLogo className="h-4 w-4" /> EAS Build
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Directives / Jaminan Arsitektur */}
          <div
            className={`rounded-xl p-4 border space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/40 border-zinc-800/60'
            }`}
          >
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">
              Jaminan Arsitektur yang Otomatis Ditanamkan ke PRD & Coding Agent:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-zinc-300">
              {currentArch.architectDirectives.slice(0, 3).map((dir, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed line-clamp-3">{dir}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
