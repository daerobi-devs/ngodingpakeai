'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Loader2, Box, ChevronDown, Check } from 'lucide-react';
import { TechStackConfig, DEFAULT_TECH_STACK } from '@/components/wizard/WizardHeroInput';
import { TEMPLATE_ARCHETYPES, TemplateArchetype } from '@/lib/templates/archetypes';
import { CustomStackModal } from '@/components/wizard/CustomStackModal';
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
} from '@/components/icons/TechIcons';

interface StudioHeroInputProps {
  initialIdea?: string;
  userName?: string;
  onSubmitIdea: (idea: string, techStack: TechStackConfig) => Promise<void>;
  isLoading: boolean;
  theme?: 'dark' | 'light';
}


export const StudioHeroInput: React.FC<StudioHeroInputProps> = ({
  initialIdea = '',
  onSubmitIdea,
  isLoading,
  theme = 'dark',
}) => {
  const [ideaText, setIdeaText] = useState(initialIdea);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('starter');
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const templateMenuRef = useRef<HTMLDivElement>(null);

  const [customTechConfig, setCustomTechConfig] = useState<{
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  }>({
    frontend: 'Next.js 16 + Tailwind CSS',
    backend: 'Next.js Server Actions',
    database: 'Supabase (PostgreSQL)',
    deployment: 'Docker (VPS / Coolify)',
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(event.target as Node)) {
        setIsTemplateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTemplate: TemplateArchetype =
    TEMPLATE_ARCHETYPES[selectedTemplateId] || TEMPLATE_ARCHETYPES.starter;
  const isCustomActive = selectedTemplateId === 'custom';

  const techStack: TechStackConfig = {
    name: isCustomActive ? 'custom' : currentTemplate.name,
    version: isCustomActive ? 'Kustom Pengguna' : currentTemplate.version,
    description: isCustomActive ? 'Arsitektur Kustom Racikan Sendiri' : currentTemplate.description,
    frontend: isCustomActive ? customTechConfig.frontend : currentTemplate.tech.frontend.name,
    backend: isCustomActive ? customTechConfig.backend : currentTemplate.tech.backend.name,
    database: isCustomActive ? customTechConfig.database : currentTemplate.tech.database.name,
    deployment: isCustomActive ? customTechConfig.deployment : currentTemplate.tech.deployment.name,
    templateId: selectedTemplateId,
    language: 'id',
  };
  const isLight = theme === 'light';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ideaText.trim();
    if (!trimmed || isLoading) return;
    await onSubmitIdea(trimmed, techStack);
  };


  const renderSmartIcon = (text: string, category: 'frontend' | 'backend' | 'database' | 'deployment', sizeClass = 'h-3.5 w-3.5') => {
    const t = (text || '').toLowerCase();

    if (category === 'frontend') {
      if (t.includes('vue') || t.includes('nuxt')) return <VueLogo className={sizeClass} />;
      if (t.includes('svelte')) return <SvelteLogo className={sizeClass} />;
      if (t.includes('astro')) return <AstroLogo className={sizeClass} />;
      if (t.includes('flutter')) return <FlutterLogo className={sizeClass} />;
      if (t.includes('react native') || t.includes('expo') || t.includes('vite') || t.includes('react'))
        return <ReactLogo className={sizeClass} />;
      return <NextJsLogo className={sizeClass} />;
    }

    if (category === 'backend') {
      if (t.includes('go') || t.includes('gin') || t.includes('fiber')) return <GoLogo className={sizeClass} />;
      if (t.includes('fastapi')) return <FastApiLogo className={sizeClass} />;
      if (t.includes('python') || t.includes('django')) return <PythonLogo className={sizeClass} />;
      if (t.includes('laravel') || t.includes('php')) return <LaravelLogo className={sizeClass} />;
      if (t.includes('supabase') || t.includes('deno')) return <SupabaseLogo className={sizeClass} />;
      if (t.includes('next.js') || t.includes('server action')) return <NextJsLogo className={sizeClass} />;
      return <NodeJsLogo className={sizeClass} />;
    }

    if (category === 'database') {
      if (t.includes('postgres') || t.includes('neon') || t.includes('rds')) return <PostgresLogo className={sizeClass} />;
      if (t.includes('mysql') || t.includes('mariadb')) return <MySqlLogo className={sizeClass} />;
      if (t.includes('mongo')) return <MongoLogo className={sizeClass} />;
      if (t.includes('sqlite') || t.includes('turso')) return <SqliteLogo className={sizeClass} />;
      if (t.includes('redis') || t.includes('upstash')) return <RedisLogo className={sizeClass} />;
      return <SupabaseLogo className={sizeClass} />;
    }

    if (category === 'deployment') {
      if (t.includes('cloudflare')) return <CloudflareLogo className={sizeClass} />;
      if (t.includes('aws') || t.includes('amazon')) return <AwsLogo className={sizeClass} />;
      if (t.includes('eas') || t.includes('app store') || t.includes('play store')) return <EasLogo className={sizeClass} />;
      if (t.includes('vercel')) return <NextJsLogo className={sizeClass} />;
      return <DockerLogo className={sizeClass} />;
    }

    return <Box className={`${sizeClass} text-amber-400`} />;
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 px-4 select-none">
      {/* Simple Header without star badge */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          Studio PRD
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Tuliskan konsep atau kebutuhan aplikasi Anda untuk menghasilkan dokumen PRD mengalir lengkap dengan diagram arsitektur.
        </p>
      </div>

      {/* Main Input Form */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all ${
          isLight
            ? 'border-zinc-200 bg-white shadow-md'
            : 'border-zinc-800/80 bg-[#0d1117] shadow-xl'
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              rows={4}
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="Contoh: Buat sistem reservasi konsultasi dokter spesialis online dengan rekam medis elektronik, jadwal dokter real-time, dan pembayaran QRIS..."
              disabled={isLoading}
              className={`w-full rounded-xl border p-3.5 text-xs sm:text-sm leading-relaxed transition-all focus:outline-none ${
                isLight
                  ? 'border-zinc-300 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:border-[#ea580c] focus:bg-white'
                  : 'border-zinc-700/80 bg-[#161b22] text-zinc-100 placeholder-zinc-500 focus:border-[#ea580c] focus:bg-[#161b22]'
              }`}
            />
          </div>

          {/* Sleek Compact Tech Stack Strip for Studio */}
          <div className={`rounded-xl border p-2.5 sm:p-3 transition-all ${
            isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#12151D] border-zinc-800/90'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  {techStack.name}
                </span>
                <span className="text-[11px] text-zinc-400 hidden sm:inline font-mono">
                  ({currentTemplate.badge})
                </span>
                {isCustomActive && (
                  <button
                    type="button"
                    onClick={() => setIsCustomModalOpen(true)}
                    className="text-[10px] text-amber-400 hover:underline font-medium cursor-pointer"
                  >
                    (Ubah Stack)
                  </button>
                )}
              </div>

              {/* 4 Mini SVG Tech Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {/* Frontend */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] ${
                    isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
                  }`}
                  title={`Frontend: ${techStack.frontend}`}
                >
                  <div className="shrink-0">{renderSmartIcon(techStack.frontend, 'frontend')}</div>
                  <span className="truncate max-w-[120px] font-medium">{techStack.frontend}</span>
                </div>

                {/* Backend */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] ${
                    isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
                  }`}
                  title={`Backend: ${techStack.backend}`}
                >
                  <div className="shrink-0">{renderSmartIcon(techStack.backend, 'backend')}</div>
                  <span className="truncate max-w-[120px] font-medium">{techStack.backend}</span>
                </div>

                {/* Database */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] ${
                    isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
                  }`}
                  title={`Database: ${techStack.database}`}
                >
                  <div className="shrink-0">{renderSmartIcon(techStack.database, 'database')}</div>
                  <span className="truncate max-w-[120px] font-medium">{techStack.database}</span>
                </div>

                {/* Deployment */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] ${
                    isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
                  }`}
                  title={`Deployment: ${techStack.deployment}`}
                >
                  <div className="shrink-0">{renderSmartIcon(techStack.deployment, 'deployment')}</div>
                  <span className="truncate max-w-[120px] font-medium">{techStack.deployment}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row: Template Preset Selector & Submit Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-zinc-800/60 pt-3">
            {/* Architecture Preset Dropdown Button */}
            <div className="relative" ref={templateMenuRef}>
              <button
                type="button"
                onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isTemplateMenuOpen
                    ? 'border-[#ea580c] bg-[#ea580c]/15 text-white'
                    : isLight
                    ? 'border-zinc-300 bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                    : 'border-zinc-700/80 bg-[#161b22] text-zinc-200 hover:border-zinc-600 hover:text-white'
                }`}
                title="Pilih Preset Template Arsitektur"
              >
                <Box className="h-4 w-4 text-[#ea580c]" />
                <span className="font-mono">{techStack.name}</span>
                <span className="text-[10px] text-zinc-400 font-normal">({currentTemplate.badge})</span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400 ml-0.5" />
              </button>

              {/* Template Dropdown Popover */}
              {isTemplateMenuOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-72 sm:w-80 rounded-2xl border border-zinc-800 bg-[#0c0c0e]/95 backdrop-blur-md p-2 text-xs shadow-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 mb-1 border-b border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">Pilih Preset Template</span>
                    <span className="text-[10px] text-[#ea580c] font-mono">Arsitektur</span>
                  </div>

                  <div className="space-y-1">
                    {Object.values(TEMPLATE_ARCHETYPES).map((arch) => {
                      const isSelected = selectedTemplateId === arch.id;
                      return (
                        <button
                          key={arch.id}
                          type="button"
                          onClick={() => {
                            setSelectedTemplateId(arch.id);
                            setIsTemplateMenuOpen(false);
                            if (arch.id === 'custom') {
                              setIsCustomModalOpen(true);
                            }
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-[#ea580c]/15 border border-[#ea580c]/40 text-orange-200 shadow-xs'
                              : 'hover:bg-zinc-800/80 text-zinc-300 border border-transparent'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-100 text-xs">{arch.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-[#ea580c]/20 text-[#ea580c]">
                                {arch.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-tight line-clamp-1">{arch.description}</p>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-[#ea580c] shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading || !ideaText.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ea580c] hover:bg-[#ea580c]/90 text-white font-semibold px-6 py-2.5 text-xs sm:text-sm transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-[#ea580c]/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Merancang Dokumen Studio...</span>
                </>
              ) : (
                <>
                  <span>Mulai Studio PRD</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Stack Modal */}
      {isCustomModalOpen && (
        <CustomStackModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          currentStack={techStack}
          onSaveCustomStack={(newStack) => {
            setCustomTechConfig({
              frontend: newStack.frontend,
              backend: newStack.backend,
              database: newStack.database,
              deployment: newStack.deployment,
            });
            setSelectedTemplateId('custom');
            setIsCustomModalOpen(false);
          }}
          theme={theme}
        />
      )}
    </div>
  );
};
