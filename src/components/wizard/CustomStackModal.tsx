'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Layers,
  Server,
  Database,
  Cloud,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { TechStackConfig } from './WizardHeroInput';
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

interface CustomStackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStack: TechStackConfig;
  onSaveCustomStack: (newStack: TechStackConfig) => void;
  theme?: 'dark' | 'light';
}

// 1. Preset Options for Frontend
const FRONTEND_OPTIONS = [
  { label: 'Next.js 16 + Tailwind CSS', desc: 'React 19, App Router, SSR & SEO optimal', icon: <NextJsLogo className="h-4 w-4" /> },
  { label: 'React (Vite) + Tailwind', desc: 'Single Page Application (SPA) ringan & cepat', icon: <ReactLogo className="h-4 w-4" /> },
  { label: 'Vue 3 / Nuxt 3', desc: 'Progressive framework, Composition API & Pinia', icon: <VueLogo className="h-4 w-4" /> },
  { label: 'Svelte / SvelteKit', desc: 'Zero runtime bundle, super hemat memory', icon: <SvelteLogo className="h-4 w-4" /> },
  { label: 'Astro', desc: 'Islands architecture, ultra-fast static & content web', icon: <AstroLogo className="h-4 w-4" /> },
  { label: 'Flutter (Google)', desc: 'Cross-platform mobile Android, iOS & Desktop', icon: <FlutterLogo className="h-4 w-4" /> },
  { label: 'React Native (Expo Router)', desc: 'Mobile app file-based navigation & NativeWind', icon: <ReactLogo className="h-4 w-4" /> },
];

// 2. Preset Options for Backend
const BACKEND_OPTIONS = [
  { label: 'Next.js Server Actions', desc: 'Fullstack unified RPC tanpa server terpisah', icon: <NextJsLogo className="h-4 w-4" /> },
  { label: 'Node.js (Express / Hono / NestJS)', desc: 'REST & GraphQL API standar industri', icon: <NodeJsLogo className="h-4 w-4" /> },
  { label: 'Golang (Gin / Fiber)', desc: 'High concurrency, low latency & microservices', icon: <GoLogo className="h-4 w-4" /> },
  { label: 'Python (FastAPI / Django)', desc: 'Pydantic v2, async API, AI & data processing', icon: <PythonLogo className="h-4 w-4" /> },
  { label: 'Laravel (PHP)', desc: 'Eloquent ORM, routing elegan, ekosistem kaya', icon: <LaravelLogo className="h-4 w-4" /> },
  { label: 'Supabase Edge Functions (Deno)', desc: 'Serverless TypeScript di jaringan global', icon: <SupabaseLogo className="h-4 w-4" /> },
];

// 3. Preset Options for Database
const DATABASE_OPTIONS = [
  { label: 'Supabase (PostgreSQL)', desc: 'Postgres dengan Auth, Storage, & RLS Security', icon: <SupabaseLogo className="h-4 w-4" /> },
  { label: 'PostgreSQL Murni (Neon / AWS RDS)', desc: 'Relasional database enterprise ACID compliant', icon: <PostgresLogo className="h-4 w-4" /> },
  { label: 'MySQL / MariaDB', desc: 'Standar database web relasional yang fleksibel', icon: <MySqlLogo className="h-4 w-4" /> },
  { label: 'MongoDB', desc: 'NoSQL dokumen JSON fleksibel untuk skema dinamis', icon: <MongoLogo className="h-4 w-4" /> },
  { label: 'SQLite / Turso (libSQL)', desc: 'Embedded edge database super cepat & ringan', icon: <SqliteLogo className="h-4 w-4" /> },
  { label: 'Redis / Upstash', desc: 'In-memory key-value cache, session, & queue', icon: <RedisLogo className="h-4 w-4" /> },
];

// 4. Preset Options for Deployment
const DEPLOYMENT_OPTIONS = [
  { label: 'Docker (VPS / Coolify / Dokploy)', desc: 'Self-hosted container, hemat biaya & anti vendor lock-in', icon: <DockerLogo className="h-4 w-4" /> },
  { label: 'Cloudflare Pages / Workers', desc: 'Edge serverless global CDN distributed', icon: <CloudflareLogo className="h-4 w-4" /> },
  { label: 'AWS / Google Cloud / DigitalOcean', desc: 'Infrastruktur cloud enterprise skalabel', icon: <AwsLogo className="h-4 w-4" /> },
  { label: 'Vercel / Netlify', desc: 'PaaS deployment instan berbasis Git push', icon: <NextJsLogo className="h-4 w-4" /> },
  { label: 'EAS Build (Play Store & App Store)', desc: 'Khusus kompilasi aplikasi mobile smartphone', icon: <EasLogo className="h-4 w-4" /> },
];

export const CustomStackModal: React.FC<CustomStackModalProps> = ({
  isOpen,
  onClose,
  currentStack,
  onSaveCustomStack,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'frontend' | 'backend' | 'database' | 'deployment'>('frontend');
  const [frontend, setFrontend] = useState(currentStack.frontend || FRONTEND_OPTIONS[0].label);
  const [backend, setBackend] = useState(currentStack.backend || BACKEND_OPTIONS[0].label);
  const [database, setDatabase] = useState(currentStack.database || DATABASE_OPTIONS[0].label);
  const [deployment, setDeployment] = useState(currentStack.deployment || DEPLOYMENT_OPTIONS[0].label);

  const [isCustomFrontend, setIsCustomFrontend] = useState(false);
  const [isCustomBackend, setIsCustomBackend] = useState(false);
  const [isCustomDatabase, setIsCustomDatabase] = useState(false);
  const [isCustomDeployment, setIsCustomDeployment] = useState(false);

  const handleSave = () => {
    const updated: TechStackConfig = {
      ...currentStack,
      name: 'custom',
      version: 'Kustom Pengguna',
      description: 'Arsitektur Kustom Racikan Sendiri',
      frontend: frontend.trim() || 'Next.js 16 + Tailwind CSS',
      backend: backend.trim() || 'Next.js Server Actions',
      database: database.trim() || 'Supabase (PostgreSQL)',
      deployment: deployment.trim() || 'Docker (VPS / Coolify)',
      templateId: 'custom',
    };
    onSaveCustomStack(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#0F1219] text-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-[#141822]">
          <div>
            <h2 className="text-sm font-bold text-white">Racik Custom Tech Stack</h2>
            <p className="text-[11px] text-zinc-400">Tentukan kombinasi teknologi sesuai kebutuhan arsitektur Anda</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-zinc-800/80 bg-[#0d1017] px-4">
          <button
            type="button"
            onClick={() => setActiveTab('frontend')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'frontend'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Frontend</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backend')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'backend'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            <span>Backend</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'database'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Database</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deployment')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'deployment'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="h-3.5 w-3.5" />
            <span>Deployment</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {activeTab === 'frontend' && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                Pilih Framework / Library Frontend:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FRONTEND_OPTIONS.map((item) => {
                  const isSelected = frontend === item.label && !isCustomFrontend;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setFrontend(item.label);
                        setIsCustomFrontend(false);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-white shadow-xs'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{item.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate flex items-center justify-between">
                          <span>{item.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Free Text Input */}
              <div className="pt-2">
                <span className="text-[11px] text-zinc-400 mb-1 block">Atau ketik teknologi kustom sendiri:</span>
                <input
                  type="text"
                  value={frontend}
                  onChange={(e) => {
                    setFrontend(e.target.value);
                    setIsCustomFrontend(true);
                  }}
                  placeholder="Contoh: SolidJS + Tailwind, Angular 18, Qwik..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                Pilih Framework / Runtime Backend:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BACKEND_OPTIONS.map((item) => {
                  const isSelected = backend === item.label && !isCustomBackend;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setBackend(item.label);
                        setIsCustomBackend(false);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-white shadow-xs'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{item.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate flex items-center justify-between">
                          <span>{item.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Free Text Input */}
              <div className="pt-2">
                <span className="text-[11px] text-zinc-400 mb-1 block">Atau ketik teknologi kustom sendiri:</span>
                <input
                  type="text"
                  value={backend}
                  onChange={(e) => {
                    setBackend(e.target.value);
                    setIsCustomBackend(true);
                  }}
                  placeholder="Contoh: Rust (Axum), Spring Boot Java, Ruby on Rails..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                Pilih Database Engine:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DATABASE_OPTIONS.map((item) => {
                  const isSelected = database === item.label && !isCustomDatabase;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setDatabase(item.label);
                        setIsCustomDatabase(false);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-white shadow-xs'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{item.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate flex items-center justify-between">
                          <span>{item.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Free Text Input */}
              <div className="pt-2">
                <span className="text-[11px] text-zinc-400 mb-1 block">Atau ketik database kustom sendiri:</span>
                <input
                  type="text"
                  value={database}
                  onChange={(e) => {
                    setDatabase(e.target.value);
                    setIsCustomDatabase(true);
                  }}
                  placeholder="Contoh: ClickHouse, Cassandra, CockroachDB..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeTab === 'deployment' && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                Pilih Target Deployment:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEPLOYMENT_OPTIONS.map((item) => {
                  const isSelected = deployment === item.label && !isCustomDeployment;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setDeployment(item.label);
                        setIsCustomDeployment(false);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-white shadow-xs'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{item.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate flex items-center justify-between">
                          <span>{item.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Free Text Input */}
              <div className="pt-2">
                <span className="text-[11px] text-zinc-400 mb-1 block">Atau ketik target deployment kustom:</span>
                <input
                  type="text"
                  value={deployment}
                  onChange={(e) => {
                    setDeployment(e.target.value);
                    setIsCustomDeployment(true);
                  }}
                  placeholder="Contoh: Kubernetes Cluster, Railway, Fly.io..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Action */}
        <div className="p-4 border-t border-zinc-800/80 bg-[#141822] flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block leading-none">Ringkasan Stack:</span>
            <span className="text-xs font-semibold text-amber-300 truncate block mt-1">
              {frontend} • {backend} • {database} • {deployment}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-2.5 text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <span>Terapkan Custom Stack</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
