'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Globe,
  CheckCircle2,
  Box,
  ChevronDown,
  Loader2,
  Lightbulb,
} from 'lucide-react';

export interface TechStackConfig {
  name: string;
  version: string;
  description: string;
  frontend: string;
  backend: string;
  database: string;
  deployment: string;
}

export const DEFAULT_TECH_STACK: TechStackConfig = {
  name: 'starter',
  version: 'Versi 0.1.0',
  description: 'Template Fullstack Modern Web Application',
  frontend: 'Next.js 16 + Tailwind CSS',
  backend: 'Next.js Server Actions / Route Handlers',
  database: 'Supabase (PostgreSQL)',
  deployment: 'Vercel / Docker',
};

// 1. Official Next.js Vector Logo
const NextJsLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 180 180" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="90" cy="90" r="90" fill="#000000" />
    <path
      d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
      fill="#FFFFFF"
    />
    <path d="M115 54H127.142V126H115V54Z" fill="#FFFFFF" />
  </svg>
);

// 2. Official Node.js Hexagon Vector Logo
const NodeJsLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 256 289" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M128 0L256 73.9V215.1L128 289L0 215.1V73.9L128 0Z" fill="#5FA04E" />
    <path d="M128 73.9L192 110.8V178.2L128 215.1L64 178.2V110.8L128 73.9Z" fill="#FFFFFF" />
    <path d="M128 100L168 123V169L128 192L88 169V123L128 100Z" fill="#5FA04E" />
  </svg>
);

// 3. Official Supabase Lightning Vector Logo
const SupabaseLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 109 113" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M63.7076 110.284C60.8481 113.885 55.0703 111.905 54.9809 107.314L53.9739 55.541H97.1065C104.992 55.541 109.194 64.8327 103.957 70.7397L63.7076 110.284Z"
      fill="#3ECF8E"
    />
    <path
      d="M45.297 2.71603C48.1565 -0.884877 53.9343 1.09503 54.0237 5.68593L55.0307 57.459H11.8981C4.0127 57.459 -0.189569 48.1673 5.04781 42.2603L45.297 2.71603Z"
      fill="#249361"
    />
  </svg>
);

// 4. Official Vercel Triangle Vector Logo
const VercelLogo: React.FC<{ className?: string; isLight?: boolean }> = ({ className = 'h-5 w-5', isLight = false }) => (
  <svg viewBox="0 0 76 65" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill={isLight ? '#000000' : '#FFFFFF'} />
  </svg>
);

// Quick suggestions for universal ideas
const QUICK_SUGGESTIONS = [
  {
    label: '🏫 Web Profil Sekolah',
    idea: 'Bikin website profil sekolah modern lengkap dengan pendaftaran PPDB online, direktori guru, dan pengumuman kegiatan siswa.',
  },
  {
    label: '🛒 Toko Online UMKM',
    idea: 'Bikin toko online e-commerce katalog produk UMKM dengan keranjang belanja, integrasi ongkir, dan checkout langsung ke WhatsApp.',
  },
  {
    label: '⛺ Sewa Alat & Rental',
    idea: 'Bikin web sewa alat camping dan booking tenda otomatis ada kalender tanggal ketersediaan dan dashboard admin.',
  },
  {
    label: '📊 Kasir & POS',
    idea: 'Bikin aplikasi kasir POS toko dengan pembayaran QRIS, cetak struk thermal, manajemen stok, dan laporan omzet harian.',
  },
  {
    label: '💼 SaaS Web App',
    idea: 'Bikin platform SaaS manajemen tugas tim dan kolaborasi proyek dengan dashboard analitik dan subscription billing.',
  },
];

interface WizardHeroInputProps {
  initialIdea?: string;
  onSubmitIdea: (idea: string, stack: TechStackConfig) => void;
  isLoading?: boolean;
  theme?: 'dark' | 'light';
}

export const WizardHeroInput: React.FC<WizardHeroInputProps> = ({
  initialIdea = '',
  onSubmitIdea,
  isLoading = false,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [idea, setIdea] = useState(initialIdea);
  const [techStack, setTechStack] = useState<TechStackConfig>(DEFAULT_TECH_STACK);
  const [showStackModal, setShowStackModal] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!idea.trim()) {
      setCustomError('Silakan ketikkan ide produk atau aplikasi yang ingin kamu buat.');
      return;
    }
    setCustomError(null);
    onSubmitIdea(idea.trim(), techStack);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectSuggestion = (suggestedIdea: string) => {
    setIdea(suggestedIdea);
    if (customError) setCustomError(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 px-4">
      {/* 1. Step Progress Indicator */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-10 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
          <span>Input ide</span>
        </div>
        <div className="h-px w-8 sm:w-16 bg-zinc-800" />
        <div className="flex items-center gap-2 text-zinc-500">
          <span className="flex h-2 w-2 rounded-full bg-zinc-700" />
          <span>Klarifikasi kebutuhan</span>
        </div>
        <div className="h-px w-8 sm:w-16 bg-zinc-800" />
        <div className="flex items-center gap-2 text-zinc-500">
          <span className="flex h-2 w-2 rounded-full bg-zinc-700" />
          <span>Blueprint & Roadmap</span>
        </div>
      </div>

      {/* 2. Hero Headline */}
      <div className="text-center space-y-3 mb-6">
        <div className="inline-flex items-center justify-center gap-2.5">
          <h1 className={`text-3xl sm:text-5xl font-black tracking-tight ${
            isLight ? 'text-zinc-900' : 'text-white'
          }`}>
            Mau bikin apa?
          </h1>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Box className="h-5 w-5" />
          </div>
        </div>
        <p className={`text-sm sm:text-base max-w-lg mx-auto ${
          isLight ? 'text-zinc-600' : 'text-zinc-400'
        }`}>
          Ubah ide kamu menjadi rencana teknis yang bisa dipahami AI tools pilihanmu (Cursor, Claude Code, Antigravity, Windsurf).
        </p>

        {/* Quick Suggestion Chips */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 max-w-2xl mx-auto">
          <span className="text-[11px] text-zinc-500 font-medium mr-1 flex items-center gap-1">
            <Lightbulb className="h-3 w-3 text-amber-400" /> Inspirasi:
          </span>
          {QUICK_SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSuggestion(item.idea)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                idea === item.idea
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold'
                  : isLight
                  ? 'border-zinc-300 bg-white text-zinc-700 hover:border-amber-400'
                  : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Input Box Container */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className={`relative rounded-2xl border transition-all duration-200 shadow-xl overflow-hidden ${
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
              rows={4}
              placeholder="Jelaskan aplikasi yang ingin kamu buat... (Contoh: Web profil sekolah & PPDB, Toko online e-commerce UMKM, Sistem sewa alat camping, Aplikasi kasir POS, atau Platform booking tiket reservasi...)"
              className={`w-full resize-none bg-transparent text-sm sm:text-base placeholder:text-zinc-500 focus:outline-hidden leading-relaxed ${
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
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tech Stack Chip Pill */}
              <button
                type="button"
                onClick={() => setShowStackModal(!showStackModal)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold transition-colors ${
                  isLight
                    ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                }`}
                title="Lihat template tech stack"
              >
                <Box className="h-3.5 w-3.5 text-amber-400" />
                <span>{techStack.name}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {/* Language Pill */}
              <div className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium ${
                isLight
                  ? 'border-zinc-300 bg-white text-zinc-700'
                  : 'border-zinc-800 bg-zinc-900/80 text-zinc-300'
              }`}>
                <Globe className="h-3 w-3 text-zinc-400" />
                <span>Bahasa Indonesia</span>
              </div>
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

        {customError && (
          <p className="text-xs text-red-400 px-2 font-medium">{customError}</p>
        )}

        {/* 4. Tech Stack Card with Official Vector Logos */}
        <div className={`rounded-2xl border p-5 transition-all ${
          isLight
            ? 'bg-zinc-50 border-zinc-300 shadow-xs'
            : 'bg-[#12151D] border-zinc-800/80'
        }`}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Box className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Template terpilih
                  </span>
                </div>
                <h3 className={`text-base font-bold mt-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {techStack.name}
                </h3>
                <p className="text-xs text-zinc-400">{techStack.version} — {techStack.description}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/60 pt-4">
            <span className="text-xs font-semibold text-zinc-400 mb-3 block">
              Teknologi bawaan yang akan dipersiapkan untuk PRD:
            </span>

            {/* Official Logo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Frontend: Official Next.js */}
              <div className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
              }`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/80 border border-zinc-700/80 shadow-xs">
                  <NextJsLogo className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono">Frontend</span>
                  <span className="font-semibold text-zinc-200 truncate block">{techStack.frontend}</span>
                </div>
              </div>

              {/* Backend: Official Node.js */}
              <div className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
              }`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5FA04E]/15 border border-[#5FA04E]/30 shadow-xs">
                  <NodeJsLogo className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono">Backend</span>
                  <span className="font-semibold text-zinc-200 truncate block">{techStack.backend}</span>
                </div>
              </div>

              {/* Database: Official Supabase */}
              <div className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
              }`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3ECF8E]/15 border border-[#3ECF8E]/30 shadow-xs">
                  <SupabaseLogo className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono">Database</span>
                  <span className="font-semibold text-zinc-200 truncate block">{techStack.database}</span>
                </div>
              </div>

              {/* Deployment: Official Vercel */}
              <div className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
              }`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/90 border border-zinc-700/80 shadow-xs">
                  <VercelLogo className="h-4 w-4" isLight={isLight} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono">Deployment</span>
                  <span className="font-semibold text-zinc-200 truncate block">{techStack.deployment}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-800/40 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !idea.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-2.5 text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menganalisis kebutuhan...</span>
                </>
              ) : (
                <>
                  <span>Lanjut ke Pertanyaan Kebutuhan</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
