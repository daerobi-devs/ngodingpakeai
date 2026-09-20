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

const ARCHETYPE_PREVIEW_ICONS: Record<string, React.FC<{ className?: string }>[]> = {
  starter: [NextJsLogo, NodeJsLogo, SupabaseLogo, DockerLogo],
  'mobile-app': [ReactLogo, EasLogo, SupabaseLogo],
  'ai-service': [FastApiLogo, PythonLogo, PostgresLogo, DockerLogo],
  custom: [VueLogo, GoLogo, LaravelLogo, FlutterLogo, RedisLogo],
};

const CUSTOM_TECH_ECOSYSTEM: { name: string; Icon: React.FC<{ className?: string }> }[] = [
  { name: 'Next.js', Icon: NextJsLogo },
  { name: 'React', Icon: ReactLogo },
  { name: 'Vue.js', Icon: VueLogo },
  { name: 'Svelte', Icon: SvelteLogo },
  { name: 'Flutter', Icon: FlutterLogo },
  { name: 'Python', Icon: PythonLogo },
  { name: 'FastAPI', Icon: FastApiLogo },
  { name: 'Node.js', Icon: NodeJsLogo },
  { name: 'Golang', Icon: GoLogo },
  { name: 'Laravel', Icon: LaravelLogo },
  { name: 'Supabase', Icon: SupabaseLogo },
  { name: 'PostgreSQL', Icon: PostgresLogo },
  { name: 'MySQL', Icon: MySqlLogo },
  { name: 'MongoDB', Icon: MongoLogo },
  { name: 'Redis', Icon: RedisLogo },
  { name: 'Docker', Icon: DockerLogo },
  { name: 'Cloudflare', Icon: CloudflareLogo },
  { name: 'AWS', Icon: AwsLogo },
];

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
          const previewIcons = ARCHETYPE_PREVIEW_ICONS[arch.id] || [];
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

                {/* Tech preview SVG icons */}
                <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-zinc-800/40">
                  {previewIcons.map((IconComp, idx) => (
                    <div
                      key={idx}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 border border-zinc-800/90 p-1 shadow-xs"
                    >
                      <IconComp className="h-3.5 w-3.5 shrink-0" />
                    </div>
                  ))}
                  {arch.id === 'custom' && (
                    <span className="text-[10px] font-mono text-amber-400 font-bold ml-0.5">+13 Lainnya</span>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>{arch.title}</span>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 ml-1" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Compact Architecture Details Card */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all space-y-5 ${
          isLight
            ? 'border-slate-200 bg-white shadow-xs'
            : 'border-zinc-800/80 bg-zinc-950/60 shadow-md'
        }`}
      >
        {/* Top summary row: Preset Name, Title, and Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/60">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
                {currentArch.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                {currentArch.badge}
              </span>
            </div>
            <h3 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {currentArch.title}
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {currentArch.description}
            </p>
          </div>

          <Link
            href={`/generator?template=${currentArch.id}`}
            className="self-start sm:self-auto shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2.5 text-xs shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <span>Pilih {currentArch.name}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Compact Tech Stack Pills */}
        {activeTemplateId !== 'custom' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Frontend */}
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/50 border-zinc-800/80'
            }`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black border border-zinc-800 p-1.5 shadow-xs">
                {currentArch.tech.frontend.iconType === 'nextjs' && <NextJsLogo className="h-5 w-5" />}
                {currentArch.tech.frontend.iconType === 'react' && <ReactLogo className="h-5 w-5" />}
                {currentArch.tech.frontend.iconType === 'expo' && <EasLogo className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Frontend</span>
                <span className="font-bold text-xs truncate block text-zinc-200">{currentArch.tech.frontend.name}</span>
              </div>
            </div>

            {/* Backend */}
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/50 border-zinc-800/80'
            }`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black border border-zinc-800 p-1.5 shadow-xs">
                {currentArch.tech.backend.iconType === 'nodejs' && <NodeJsLogo className="h-5 w-5" />}
                {currentArch.tech.backend.iconType === 'fastapi' && <FastApiLogo className="h-5 w-5" />}
                {currentArch.tech.backend.iconType === 'supabase' && <SupabaseLogo className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Backend</span>
                <span className="font-bold text-xs truncate block text-zinc-200">{currentArch.tech.backend.name}</span>
              </div>
            </div>

            {/* Database */}
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/50 border-zinc-800/80'
            }`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black border border-zinc-800 p-1.5 shadow-xs">
                {currentArch.tech.database.iconType === 'supabase' && <SupabaseLogo className="h-5 w-5" />}
                {currentArch.tech.database.iconType === 'postgres' && <PostgresLogo className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Database</span>
                <span className="font-bold text-xs truncate block text-zinc-200">{currentArch.tech.database.name}</span>
              </div>
            </div>

            {/* Deployment */}
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/50 border-zinc-800/80'
            }`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black border border-zinc-800 p-1.5 shadow-xs">
                {currentArch.tech.deployment.iconType === 'docker' && <DockerLogo className="h-5 w-5" />}
                {currentArch.tech.deployment.iconType === 'eas' && <EasLogo className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Deploy</span>
                <span className="font-bold text-xs truncate block text-zinc-200">{currentArch.tech.deployment.name}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 4 Pillars for Custom with Real SVGs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Frontend */}
              <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/50 border-zinc-800/80'
              }`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black border border-zinc-800 p-1.5 shadow-xs">
                  <ReactLogo className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Frontend</span>
                  <span className="font-bold text-xs truncate block text-zinc-200">Bebas Pilih Framework</span>
                </div>
              </div>

              {/* Backend */}
              <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/50 border-zinc-800/80'
              }`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black border border-zinc-800 p-1.5 shadow-xs">
                  <GoLogo className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Backend</span>
                  <span className="font-bold text-xs truncate block text-zinc-200">Bebas Pilih Backend</span>
                </div>
              </div>

              {/* Database */}
              <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/50 border-zinc-800/80'
              }`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black border border-zinc-800 p-1.5 shadow-xs">
                  <PostgresLogo className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Database</span>
                  <span className="font-bold text-xs truncate block text-zinc-200">Bebas Pilih Database</span>
                </div>
              </div>

              {/* Deployment */}
              <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/50 border-zinc-800/80'
              }`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black border border-zinc-800 p-1.5 shadow-xs">
                  <DockerLogo className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Deploy</span>
                  <span className="font-bold text-xs truncate block text-zinc-200">Bebas Pilih Target</span>
                </div>
              </div>
            </div>

            {/* Complete Tech Ecosystem Badges with SVGs */}
            <div className="pt-2 border-t border-zinc-800/60">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
                  Dukungan Penuh Stack & Arsitektur (Bisa Dirik Sendiri):
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {CUSTOM_TECH_ECOSYSTEM.map(({ name, Icon }) => (
                  <span
                    key={name}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-[11px] transition-colors ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
