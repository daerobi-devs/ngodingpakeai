'use client';

import React, { useState } from 'react';
import { PRDOutput } from '@/types/prd';
import { generateAgentMasterPrompt } from './studio-markdown';
import {
  X,
  FileText,
  FolderArchive,
  Bot,
  Copy,
  Check,
  ArrowLeft,
  Terminal,
  Loader2,
  ChevronRight,
  Download,
  ListTodo,
} from 'lucide-react';

interface ImplementationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prd: PRDOutput;
  versionNumber?: number;
  onDownloadPrd: () => void;
  onDownloadPrdAndTasks?: () => void;
  onDownloadZip: () => void;
  isExportingZip?: boolean;
  theme?: 'dark' | 'light';
  taskCompletion?: Record<string, boolean>;
}

export const ImplementationModal: React.FC<ImplementationModalProps> = ({
  isOpen,
  onClose,
  prd,
  versionNumber = 1,
  onDownloadPrd,
  onDownloadPrdAndTasks,
  onDownloadZip,
  isExportingZip = false,
  theme = 'dark',
  taskCompletion,
}) => {
  const [view, setView] = useState<'options' | 'prompt'>('options');
  const [copied, setCopied] = useState(false);
  const [selectedCli, setSelectedCli] = useState<'claude' | 'cursor' | 'aider'>('claude');

  if (!isOpen) return null;

  const isLight = theme === 'light';
  const masterPrompt = generateAgentMasterPrompt(prd, taskCompletion);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(masterPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all relative ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#121722] border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="space-y-1">
            {view === 'prompt' ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('options')}
                  className="p-1 -ml-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Kembali"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  Prompt AI Agent (CLI)
                </h3>
              </div>
            ) : (
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                Mulai implementasi
              </h3>
            )}
            <p className="text-xs text-zinc-400">
              {view === 'prompt'
                ? 'Salin prompt eksekusi lengkap dengan seluruh task untuk AI Coding Agent.'
                : 'Pilih cara membawa rencana ini ke proses development.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* View 1: 3 Options (Matching Image 2) */}
        {view === 'options' ? (
          <div className="p-5 pt-2 space-y-3">
            {/* Option 1: Download PRD */}
            <button
              type="button"
              onClick={() => {
                onDownloadPrd();
                onClose();
              }}
              className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all cursor-pointer group ${
                isLight
                  ? 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300'
                  : 'border-zinc-800/80 bg-[#161d2b]/80 hover:bg-[#1a2334] hover:border-zinc-700'
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#ea580c] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold group-hover:text-amber-400 transition-colors flex items-center justify-between">
                  <span>Download PRD</span>
                  <Download className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Cuma dokumen PRD (.md).
                </p>
              </div>
            </button>

            {/* Option 2: Download PRD & Task */}
            <button
              type="button"
              onClick={() => {
                onDownloadPrdAndTasks?.();
                onClose();
              }}
              className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all cursor-pointer group ${
                isLight
                  ? 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300'
                  : 'border-zinc-800/80 bg-[#161d2b]/80 hover:bg-[#1a2334] hover:border-zinc-700'
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#ea580c] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ListTodo className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold group-hover:text-amber-400 transition-colors flex items-center justify-between">
                  <span>Download PRD &amp; Task</span>
                  <Download className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Dokumen PRD (.md) + checklist TASKS.md.
                </p>
              </div>
            </button>

            {/* Option 3: Download ZIP */}
            <button
              type="button"
              onClick={onDownloadZip}
              disabled={isExportingZip}
              className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all cursor-pointer group ${
                isLight
                  ? 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300'
                  : 'border-zinc-800/80 bg-[#161d2b]/80 hover:bg-[#1a2334] hover:border-zinc-700'
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#ea580c] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {isExportingZip ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <FolderArchive className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold group-hover:text-amber-400 transition-colors flex items-center justify-between">
                  <span>Download ZIP</span>
                  <Download className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  PRD + spesifikasi fitur &amp; task (.zip).
                </p>
              </div>
            </button>

            {/* Option 3: Prompt AI Agent */}
            <button
              type="button"
              onClick={() => setView('prompt')}
              className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all cursor-pointer group ${
                isLight
                  ? 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300'
                  : 'border-zinc-800/80 bg-[#161d2b]/80 hover:bg-[#1a2334] hover:border-zinc-700'
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#ea580c] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold group-hover:text-amber-400 transition-colors flex items-center justify-between">
                  <span>Prompt AI agent</span>
                  <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Suruh AI agent kerjakan semua task lewat CLI.
                </p>
              </div>
            </button>
          </div>
        ) : (
          /* View 2: Prompt AI Agent Inspector */
          <div className="p-5 pt-2 space-y-4">
            {/* CLI Selector Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCli('claude')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition cursor-pointer text-center ${
                  selectedCli === 'claude'
                    ? 'bg-[#ea580c] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Claude Code
              </button>
              <button
                type="button"
                onClick={() => setSelectedCli('cursor')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition cursor-pointer text-center ${
                  selectedCli === 'cursor'
                    ? 'bg-[#ea580c] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Cursor / Windsurf
              </button>
              <button
                type="button"
                onClick={() => setSelectedCli('aider')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition cursor-pointer text-center ${
                  selectedCli === 'aider'
                    ? 'bg-[#ea580c] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Aider CLI
              </button>
            </div>

            {/* Quick Command Hint */}
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 flex items-center justify-between">
              <span className="truncate">
                {selectedCli === 'claude'
                  ? 'claude  # Jalankan di terminal lalu paste prompt'
                  : selectedCli === 'cursor'
                  ? 'Buka Cursor Composer (Ctrl+I / Cmd+I) lalu paste prompt'
                  : 'aider --message "<paste prompt>"'}
              </span>
              <Terminal className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-2" />
            </div>

            {/* Prompt Preview Code Box */}
            <div className="relative rounded-xl border border-zinc-800 bg-[#0a0e16] p-3 text-xs font-mono text-zinc-300 h-52 overflow-y-auto leading-relaxed select-text">
              <pre className="whitespace-pre-wrap">{masterPrompt}</pre>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#d94e08] text-white text-xs font-bold transition shadow-md shadow-orange-950/40 cursor-pointer active:scale-95"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Prompt Berhasil Disalin!' : 'Salin Master Prompt'}</span>
              </button>

              <button
                type="button"
                onClick={() => setView('options')}
                className="px-3.5 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition cursor-pointer"
              >
                Kembali
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer Note */}
        <div className="p-4 pt-2 border-t border-zinc-800/60 bg-zinc-950/30 text-center">
          <p className="text-[11px] text-zinc-500">
            Task breakdown dari Pohon Fitur otomatis disertakan dalam file TASKS.md &amp; Master Prompt.
          </p>
        </div>
      </div>
    </div>
  );
};
