'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Globe,
  CheckCircle2,
  Box,
  ChevronDown,
  Loader2,
  Check,
  SlidersHorizontal,
  Wrench,
  Lock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import {
  TEMPLATE_ARCHETYPES,
  DEFAULT_ARCHETYPE_ID,
  TemplateArchetype,
  LanguageOption,
} from '@/lib/templates/archetypes';
import { useAuth } from '@/context/AuthContext';
import { hasTierFeature } from '@/lib/supabase/types';
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
import { CustomStackModal } from './CustomStackModal';

export interface TechStackConfig {
  name: string;
  version: string;
  description: string;
  frontend: string;
  backend: string;
  database: string;
  deployment: string;
  templateId?: string;
  language?: LanguageOption;
}

export const DEFAULT_TECH_STACK: TechStackConfig = {
  name: 'starter',
  version: 'Versi 0.1.0',
  description: 'Template Fullstack Modern Web Application',
  frontend: 'Next.js 16 + Tailwind CSS',
  backend: 'Next.js Server Actions / Route Handlers',
  database: 'Supabase (PostgreSQL)',
  deployment: 'Docker (VPS / Coolify)',
  templateId: 'starter',
  language: 'id',
};

interface WizardHeroInputProps {
  initialIdea?: string;
  userName?: string;
  onSubmitIdea: (idea: string, stack: TechStackConfig, language?: LanguageOption) => void;
  isLoading?: boolean;
  theme?: 'dark' | 'light';
  initialTemplateId?: string;
  onRequireUpgrade?: () => void;
}

export const WizardHeroInput: React.FC<WizardHeroInputProps> = ({
  initialIdea = '',
  userName = '',
  onSubmitIdea,
  isLoading = false,
  theme = 'dark',
  initialTemplateId,
  onRequireUpgrade,
}) => {
  const isLight = theme === 'light';
  const { profile, systemSettings } = useAuth();
  const userTier = profile?.subscription_tier || 'free';
  const isAdmin = Boolean(profile?.is_admin);

  const isTemplateLocked = (templateId: string): boolean => {
    if (isAdmin || userTier === 'unlimited') return false;

    // Starter selalu gratis
    if (templateId === 'starter') return false;

    // Custom Stack
    if (templateId === 'custom') {
      return !hasTierFeature(userTier, 'custom_stack', systemSettings, isAdmin);
    }

    // Advanced Templates (Mobile App & AI Service)
    if (templateId === 'mobile-app' || templateId === 'ai-service') {
      return !hasTierFeature(userTier, 'advanced_templates', systemSettings, isAdmin);
    }

    return false;
  };

  const [idea, setIdea] = useState(initialIdea);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplateId && TEMPLATE_ARCHETYPES[initialTemplateId] ? initialTemplateId : DEFAULT_ARCHETYPE_ID
  );
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('id');
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // Auto-enrich idea states
  const [isEnriching, setIsEnriching] = useState(false);
  const [originalIdea, setOriginalIdea] = useState<string | null>(null);
  const [enrichNotification, setEnrichNotification] = useState<string | null>(null);

  const handleEnrichIdea = async () => {
    if (!idea.trim() || isEnriching) return;
    try {
      setIsEnriching(true);
      setEnrichNotification(null);
      setOriginalIdea(idea);

      const res = await fetch('/api/enrich-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIdea: idea.trim(),
          language: selectedLanguage,
          templateId: selectedTemplateId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.enrichedIdea) {
        setIdea(data.enrichedIdea);
        setEnrichNotification('Ide berhasil diperkaya dengan konsep arsitektur modern!');
        setTimeout(() => setEnrichNotification(null), 5000);
      } else {
        setEnrichNotification('Gagal memperkaya ide. Silakan coba lagi.');
        setTimeout(() => setEnrichNotification(null), 3000);
      }
    } catch (e) {
      console.error('Enrich idea error:', e);
      setEnrichNotification('Terjadi kendala saat menghubungi server.');
      setTimeout(() => setEnrichNotification(null), 3000);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleUndoEnrich = () => {
    if (originalIdea !== null) {
      setIdea(originalIdea);
      setOriginalIdea(null);
      setEnrichNotification(null);
    }
  };

  useEffect(() => {
    if (initialTemplateId && TEMPLATE_ARCHETYPES[initialTemplateId]) {
      setSelectedTemplateId(initialTemplateId);
    }
  }, [initialTemplateId]);

  // Typewriter effect for personalized greeting (smooth, runs once on mount/user change)
  const [typedGreeting, setTypedGreeting] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const greetingText = userName ? `Halo, ${userName}!` : 'Halo!';
    let currentIndex = 0;
    setTypedGreeting('');
    setIsTyping(true);

    const timer = setInterval(() => {
      if (currentIndex < greetingText.length) {
        setTypedGreeting(greetingText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 45);

    return () => clearInterval(timer);
  }, [userName]);

  // Custom Stack overrides
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

  const templateMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(event.target as Node)) {
        setIsTemplateMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTemplate: TemplateArchetype =
    TEMPLATE_ARCHETYPES[selectedTemplateId] || TEMPLATE_ARCHETYPES[DEFAULT_ARCHETYPE_ID];

  const isCustomActive = selectedTemplateId === 'custom';

  // Effective tech stack values
  const effectiveFrontend = isCustomActive ? customTechConfig.frontend : currentTemplate.tech.frontend.name;
  const effectiveBackend = isCustomActive ? customTechConfig.backend : currentTemplate.tech.backend.name;
  const effectiveDatabase = isCustomActive ? customTechConfig.database : currentTemplate.tech.database.name;
  const effectiveDeployment = isCustomActive ? customTechConfig.deployment : currentTemplate.tech.deployment.name;

  const techStack: TechStackConfig = {
    name: isCustomActive ? 'custom' : currentTemplate.name,
    version: isCustomActive ? 'Kustom Pengguna' : currentTemplate.version,
    description: isCustomActive ? 'Arsitektur Kustom Racikan Sendiri' : currentTemplate.description,
    frontend: effectiveFrontend,
    backend: effectiveBackend,
    database: effectiveDatabase,
    deployment: effectiveDeployment,
    templateId: isCustomActive ? 'custom' : currentTemplate.id,
    language: selectedLanguage,
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!idea.trim()) {
      setCustomError('Silakan ketikkan ide produk atau aplikasi yang ingin kamu buat.');
      return;
    }
    setCustomError(null);
    onSubmitIdea(idea.trim(), techStack, selectedLanguage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // SMART SVG ICON MATCHING (Akut & Tidak Ada yang Miss)
  const renderSmartIcon = (text: string, category: 'frontend' | 'backend' | 'database' | 'deployment', sizeClass = 'h-5 w-5') => {
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
    <div className="w-full max-w-3xl mx-auto pt-2 sm:pt-4 pb-8 px-4">
      {/* 1. Step Progress Indicator */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm font-medium">
        {/* Step 1: Konsep Ide */}
        <div className={`flex items-center gap-2 transition-all ${
          isLoading ? 'text-zinc-400 font-medium' : 'text-amber-400 font-semibold'
        }`}>
          {isLoading ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
          )}
          <span>Konsep Ide</span>
        </div>

        {/* Connector 1 -> 2 with Flowing Beam when loading */}
        <div className="relative h-0.5 w-10 sm:w-20 bg-zinc-800 rounded-full overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent w-full animate-beam-flow shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          ) : (
            <div className="h-full w-full bg-zinc-800" />
          )}
        </div>

        {/* Step 2: Bedah Kebutuhan */}
        <div className={`flex items-center gap-2 transition-all ${
          isLoading ? 'text-amber-400 font-semibold' : 'text-zinc-500'
        }`}>
          {isLoading ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 ring-2 ring-amber-400/30" />
            </span>
          ) : (
            <span className="flex h-2 w-2 rounded-full bg-zinc-700" />
          )}
          <span>Bedah Kebutuhan</span>
          {isLoading && (
            <span className="text-[10px] font-mono text-amber-400/80 animate-pulse hidden sm:inline">
              (Menganalisis...)
            </span>
          )}
        </div>

        {/* Connector 2 -> 3 */}
        <div className="h-0.5 w-10 sm:w-20 bg-zinc-800 rounded-full" />

        {/* Step 3: Cetak Biru & Roadmap */}
        <div className="flex items-center gap-2 text-zinc-500">
          <span className="flex h-2 w-2 rounded-full bg-zinc-700" />
          <span>Cetak Biru & Roadmap</span>
        </div>
      </div>

      {/* 2. Hero Headline */}
      <div className="text-center space-y-2 mb-6">
        {userName && (
          <div className="inline-flex items-center gap-1.5 text-base sm:text-xl font-bold tracking-tight text-amber-400 font-mono mb-1">
            <span>{typedGreeting}</span>
            {isTyping && <span className="inline-block w-2 h-4 sm:h-5 bg-amber-400 animate-pulse rounded-xs" />}
          </div>
        )}
        <h1 className={`text-3xl sm:text-5xl font-black tracking-tight ${
          isLight ? 'text-zinc-900' : 'text-white'
        }`}>
          Mau bikin apa hari ini?
        </h1>
        <p className={`text-sm sm:text-base max-w-lg mx-auto ${
          isLight ? 'text-zinc-600' : 'text-zinc-400'
        }`}>
          Ubah ide kamu menjadi rencana arsitektur teknis kelas dunia yang siap dipahami AI Coding pilihanmu.
        </p>
      </div>

      {/* 3. Main Input Box Container */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className={`relative rounded-2xl border transition-all duration-200 shadow-xl overflow-visible ${
            isLight
              ? 'bg-white border-zinc-300 focus-within:border-amber-500/80 focus-within:ring-2 focus-within:ring-amber-500/20'
              : 'bg-[#181C26] border-zinc-800/80 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20'
          }`}
        >
          <div className="p-4 sm:p-5">
            <textarea
              value={idea}
              onChange={(e) => {
                setIdea(e.target.value);
                if (customError) setCustomError(null);
              }}
              onKeyDown={handleKeyDown}
              rows={
                idea.split('\n').length > 4
                  ? Math.min(14, Math.max(7, idea.split('\n').length + 1))
                  : idea.length > 180
                  ? 9
                  : 4
              }
              placeholder="Jelaskan aplikasi yang ingin kamu buat... (Contoh: Web profil sekolah & PPDB, Toko online e-commerce UMKM, Sistem sewa alat camping, Aplikasi kasir POS, atau Platform booking tiket reservasi...)"
              className={`w-full bg-transparent text-sm sm:text-base placeholder:text-zinc-500 focus:outline-hidden leading-relaxed min-h-[110px] max-h-[480px] overflow-y-auto transition-all ${
                isLight ? 'text-zinc-900' : 'text-zinc-100'
              }`}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Bottom Action Bar inside Textarea */}
          <div className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 ${
            isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-zinc-950/40 border-zinc-800/60'
          }`}>
            <div className="flex items-center gap-2 flex-wrap relative z-20">
              {/* Template Selector Dropdown */}
              <div className="relative" ref={templateMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsTemplateMenuOpen(!isTemplateMenuOpen);
                    setIsLangMenuOpen(false);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                    isTemplateMenuOpen
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 ring-2 ring-amber-500/20'
                      : isLight
                      ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  }`}
                  title="Pilih Template Arsitektur Starter"
                >
                  <Box className="h-3.5 w-3.5 text-amber-400" />
                  <span>{techStack.name}</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </button>

                {/* Template Dropdown Popover */}
                {isTemplateMenuOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-72 sm:w-80 rounded-2xl border border-zinc-800 bg-[#0c0c0e]/95 backdrop-blur-md p-2 text-xs shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    <div className="px-2.5 py-1.5 mb-1 border-b border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">Pilih Preset Template</span>
                      <span className="text-[10px] text-amber-400/80 font-mono">Arsitektur</span>
                    </div>

                    <div className="space-y-1">
                      {Object.values(TEMPLATE_ARCHETYPES).map((arch) => {
                        const isSelected = selectedTemplateId === arch.id;
                        const locked = isTemplateLocked(arch.id);
                        return (
                          <button
                            key={arch.id}
                            type="button"
                            onClick={() => {
                              if (locked) {
                                setIsTemplateMenuOpen(false);
                                if (onRequireUpgrade) onRequireUpgrade();
                                return;
                              }
                              setSelectedTemplateId(arch.id);
                              setIsTemplateMenuOpen(false);
                              if (arch.id === 'custom') {
                                setIsCustomModalOpen(true);
                              }
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-xs'
                                : 'hover:bg-zinc-800/80 text-zinc-300 border border-transparent'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-zinc-100 text-xs">{arch.name}</span>
                                {locked ? (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                                    <Lock className="h-2.5 w-2.5" /> PRO
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-amber-500/20 text-amber-400">
                                    {arch.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-400 leading-tight line-clamp-1">{arch.description}</p>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Language Selector Dropdown */}
              <div className="relative" ref={langMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsLangMenuOpen(!isLangMenuOpen);
                    setIsTemplateMenuOpen(false);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer shadow-xs ${
                    isLangMenuOpen
                      ? 'border-zinc-700 bg-zinc-800 text-white'
                      : isLight
                      ? 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
                      : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:text-white'
                  }`}
                  title="Pilih Bahasa Output PRD"
                >
                  <Globe className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{selectedLanguage === 'id' ? 'Bahasa Indonesia' : 'English'}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {/* Language Dropdown Popover */}
                {isLangMenuOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-48 rounded-xl border border-zinc-800 bg-[#0c0c0e]/95 backdrop-blur-md p-1.5 text-xs shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLanguage('id');
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                          selectedLanguage === 'id'
                            ? 'bg-amber-500/15 text-amber-300 font-bold'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">ID</span>
                          <span>Bahasa Indonesia</span>
                        </div>
                        {selectedLanguage === 'id' && <Check className="h-3.5 w-3.5 text-amber-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLanguage('en');
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                          selectedLanguage === 'en'
                            ? 'bg-amber-500/15 text-amber-300 font-bold'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">EN</span>
                          <span>English</span>
                        </div>
                        {selectedLanguage === 'en' && <Check className="h-3.5 w-3.5 text-amber-400" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Button to customize stack if on custom */}
              {isCustomActive && (
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
                  title="Buka pemilih custom stack"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>Ubah Stack</span>
                </button>
              )}

              {/* Tombol Perkaya Ide (AI) */}
              <button
                type="button"
                onClick={handleEnrichIdea}
                disabled={isEnriching || isLoading || !idea.trim()}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isLight
                    ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
                }`}
                title="Sempurnakan ide singkat menjadi konsep arsitektur modern dalam 1 detik"
              >
                {isEnriching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                )}
                <span>{isEnriching ? 'Memperkaya...' : 'Perkaya Ide (AI)'}</span>
              </button>

              {/* Tombol Urungkan jika ide telah diperkaya */}
              {originalIdea !== null && !isEnriching && (
                <button
                  type="button"
                  onClick={handleUndoEnrich}
                  className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    isLight
                      ? 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Kembalikan ke teks ide awal Anda"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Urungkan</span>
                </button>
              )}
            </div>

            {/* Submit Arrow Button */}
            <button
              type="submit"
              disabled={isLoading || !idea.trim()}
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
              title="Lanjut ke Pertanyaan Kebutuhan (Cmd+Enter)"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
              ) : (
                <ArrowRight className="h-4 w-4 text-zinc-950" />
              )}
            </button>
          </div>
        </div>

        {/* Notifikasi Sukses Perkaya Ide */}
        {enrichNotification && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/30 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
            <span>{enrichNotification}</span>
          </div>
        )}

        {customError && (
          <p className="text-xs text-red-400 px-2 font-medium">{customError}</p>
        )}

        {/* 4. Sleek Compact Tech Stack Strip & Action Button */}
        <div className={`rounded-xl border p-3 sm:p-3.5 transition-all shadow-xs ${
          isLight
            ? 'bg-zinc-50 border-zinc-300'
            : 'bg-[#12151D] border-zinc-800/90'
        }`}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Left: Template badge & 4 Compact SVG Pills */}
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 mr-1">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  {techStack.name}
                </span>
                {isCustomActive && (
                  <button
                    type="button"
                    onClick={() => setIsCustomModalOpen(true)}
                    className="text-[10px] text-amber-400 hover:underline font-medium cursor-pointer"
                  >
                    (Ubah)
                  </button>
                )}
              </div>

              {/* 4 Mini SVG Tech Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {/* Frontend */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                    isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
                  }`}
                  title={`Frontend: ${effectiveFrontend}`}
                >
                  <div className="shrink-0">{renderSmartIcon(effectiveFrontend, 'frontend', 'h-3.5 w-3.5')}</div>
                  <span className="truncate max-w-[130px] font-medium">{effectiveFrontend}</span>
                </div>

                {/* Backend */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                    isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
                  }`}
                  title={`Backend: ${effectiveBackend}`}
                >
                  <div className="shrink-0">{renderSmartIcon(effectiveBackend, 'backend', 'h-3.5 w-3.5')}</div>
                  <span className="truncate max-w-[130px] font-medium">{effectiveBackend}</span>
                </div>

                {/* Database */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                    isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
                  }`}
                  title={`Database: ${effectiveDatabase}`}
                >
                  <div className="shrink-0">{renderSmartIcon(effectiveDatabase, 'database', 'h-3.5 w-3.5')}</div>
                  <span className="truncate max-w-[130px] font-medium">{effectiveDatabase}</span>
                </div>

                {/* Deployment */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                    isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
                  }`}
                  title={`Deployment: ${effectiveDeployment}`}
                >
                  <div className="shrink-0">{renderSmartIcon(effectiveDeployment, 'deployment', 'h-3.5 w-3.5')}</div>
                  <span className="truncate max-w-[130px] font-medium">{effectiveDeployment}</span>
                </div>
              </div>
            </div>

            {/* Right: Action Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !idea.trim()}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-2.5 text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <span>Lanjut ke Pertanyaan Kebutuhan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Custom Stack Modal */}
      <CustomStackModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        currentStack={techStack}
        onSaveCustomStack={(newConfig) => {
          setCustomTechConfig({
            frontend: newConfig.frontend,
            backend: newConfig.backend,
            database: newConfig.database,
            deployment: newConfig.deployment,
          });
          setSelectedTemplateId('custom');
        }}
        theme={theme}
      />
    </div>
  );
};
