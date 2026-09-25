'use client';

import React, { useState, useMemo } from 'react';
import { X, Check, Copy, Terminal, FileCode, SlidersHorizontal, KeyRound, Download } from 'lucide-react';
import { PRDOutput } from '@/types/prd';

interface StudioAgentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  prd: PRDOutput | null;
}

type ConfigTab = 'cursor' | 'claude' | 'windsurf' | 'env';

export const StudioAgentConfigModal: React.FC<StudioAgentConfigModalProps> = ({
  isOpen,
  onClose,
  prd,
}) => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('cursor');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const configs = useMemo(() => {
    if (!prd) {
      return {
        cursor: '',
        claude: '',
        windsurf: '',
        env: '',
      };
    }

    const title = prd.title || 'Enterprise Application';
    const overview = prd.opportunity_framing?.working_hypothesis || prd.opportunity_framing?.core_problem || '';
    const tech = prd.tech_stack || {};
    const frontend = tech.frontend || 'Next.js 15 (App Router), React 19, TypeScript';
    const backend = tech.backend || 'Next.js Server Actions & API Routes';
    const db = tech.database || 'PostgreSQL (Supabase)';
    const styling = 'Tailwind CSS v4, Lucide Icons';

    // Extract feature summary
    const featuresList = (prd.feature_breakdown || [])
      .map((f, i) => `${i + 1}. [${f.priority || 'P0'}] ${f.name}: ${f.user_story || ''}`)
      .join('\n');

    // 1. .cursorrules
    const cursor = `# ${title} - Cursor AI Rules
# Generated automatically by NgodingPakePRD Architect Engine

## Project Context & Overview
${overview}

## Core Tech Stack
- Frontend: ${frontend}
- Backend: ${backend}
- Database: ${db}
- Styling: ${styling}

## Architectural Standards & Coding Rules
1. TypeScript Strictness:
   - Always enforce strict type safety; never use 'any' or untyped parameters.
   - Define domain interfaces in src/types/ and co-locate component props.
2. Architecture Boundaries:
   - Keep Server Components as the default in Next.js App Router.
   - Mark client components with 'use client' only when hooks, state, or event listeners are required.
   - Business logic must reside in dedicated service layers or Server Actions, not embedded inside JSX.
3. Database & Mutations:
   - Respect relational integrity and ACID constraints.
   - Guard against race conditions using row-level locking or atomic transactions when updating critical states.
4. Security & Error Handling:
   - Validate all external inputs with schema validation (Zod).
   - Never leak internal database stack traces to the client. Return structured error responses.

## Key Feature Requirements
${featuresList || 'Lihat dokumen PRD lengkap untuk detail modul 4-layer.'}
`;

    // 2. CLAUDE.md
    const claude = `# CLAUDE.md - Project Guide for Claude Code & Dev Fleet
# Project: ${title}

## Project Summary
${overview}

## Commands & Workflows
- Development server: \`npm run dev\`
- Production build: \`npm run build\`
- Lint check: \`npm run lint\`
- Typecheck: \`npx tsc --noEmit\`
- Run tests: \`npm run test\`

## Tech Stack
- Frontend Framework: ${frontend}
- Backend & API: ${backend}
- Database Engine: ${db}
- Styling System: ${styling}

## Development Guidelines
- Always verify type safety with \`npx tsc --noEmit\` before declaring a milestone done.
- Follow the 4-layer feature architecture:
  1. Lapis 1: Core Value / UX Flow
  2. Lapis 2: Operational Admin & Back-Office
  3. Lapis 3: Trust, Risk Mitigation & Edge-Case Protection
  4. Lapis 4: Automation, Notifications & User Retention
- Zero emoji policy in codebase and UI components unless explicitly requested.
- Maintain clean atomic git commits if git is enabled.

## Key Business Rules & Domain Scope
${featuresList || 'Mengacu pada spesifikasi PRD lengkap.'}
`;

    // 3. .windsurfrules
    const windsurf = `# Windsurf AI Rules - ${title}
# Context: High-performance autonomous engineering

## Persona & Objective
You are a Staff Principal Engineer working on ${title}.
Follow modular clean architecture, defensive programming, and zero-compromise security.

## Tech Stack Guidelines
- Frontend: ${frontend}
- Backend: ${backend}
- Database: ${db}

## Code Generation Invariants
1. Modularity: Each file must focus on a single responsibility.
2. Error Handling: Always wrap async I/O in try-catch with graceful fallback states and informative user feedback.
3. Database Hygiene: Every mutation query must be parameterized.
4. Performance: Avoid unnecessary client re-renders and heavy dependencies.
`;

    // 4. .env.example
    const env = `# Environment Variables Template
# Project: ${title}
# Copy this file to .env.local and fill with your actual credentials

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database & Storage
DATABASE_URL="postgresql://postgres:password@localhost:5432/${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_db"
DIRECT_URL="postgresql://postgres:password@localhost:5432/${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_db"

# Authentication & Security
NEXTAUTH_SECRET=your_super_secret_session_token_32_characters_min
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your_jwt_signing_key_secret

# Third-party Integrations (Configure if used)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# MIDTRANS_SERVER_KEY=your_payment_server_key
# FONNTE_API_TOKEN=your_whatsapp_gateway_token
`;

    return { cursor, claude, windsurf, env };
  }, [prd]);

  if (!isOpen || !prd) return null;

  const currentContent = configs[activeTab];
  const currentFilename =
    activeTab === 'cursor'
      ? '.cursorrules'
      : activeTab === 'claude'
      ? 'CLAUDE.md'
      : activeTab === 'windsurf'
      ? '.windsurfrules'
      : '.env.example';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopiedTab(activeTab);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (err) {
      console.error('Failed to copy configuration', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#0d1117] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="h-14 px-5 border-b border-zinc-800/80 bg-[#161b22]/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#ea580c]/15 text-[#ea580c] border border-[#ea580c]/25">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                Generator Konfigurasi Agent Coding
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  Cursor, Claude, Windsurf
                </span>
              </h2>
              <p className="text-[11px] text-zinc-500">
                Salin file konfigurasi instan agar coding agent Anda langsung memahami arsitektur & aturan PRD ini.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-3 border-b border-zinc-800/60 bg-[#161b22]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('cursor')}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cursor'
                  ? 'border-[#ea580c] text-white bg-[#0d1117]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>.cursorrules</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('claude')}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'claude'
                  ? 'border-[#ea580c] text-white bg-[#0d1117]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>CLAUDE.md</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('windsurf')}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'windsurf'
                  ? 'border-[#ea580c] text-white bg-[#0d1117]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>.windsurfrules</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('env')}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'env'
                  ? 'border-[#ea580c] text-white bg-[#0d1117]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>.env.example</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
              title="Unduh file ke disk"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh File</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                copiedTab === activeTab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#ea580c] hover:bg-[#ea580c]/90 text-white shadow-xs'
              }`}
            >
              {copiedTab === activeTab ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin {currentFilename}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Display */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0a0d12]">
          <pre className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap select-text selection:bg-[#ea580c]/30 selection:text-white">
            {currentContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="h-10 px-5 border-t border-zinc-800/80 bg-[#161b22]/70 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span>Letakkan file ini di root folder proyek Anda sebelum menjalankan Cursor, Claude Code, atau Windsurf.</span>
          <span>Format: UTF-8 Plaintext</span>
        </div>
      </div>
    </div>
  );
};
