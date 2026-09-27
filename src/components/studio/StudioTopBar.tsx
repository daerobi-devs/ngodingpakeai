'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Eye,
  Code2,
  Kanban,
  Server,
  Download,
  Copy,
  Check,
  MessageSquare,
  ChevronDown,
  Menu,
  Package,
  FileText,
  Palette,
  Terminal,
  FolderTree,
  Columns,
  ListTodo,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export interface DocumentVersionInfo {
  versionNumber: number;
  timestamp: string;
  summary: string;
}

interface StudioTopBarProps {
  title: string;
  versions: DocumentVersionInfo[];
  activeVersion: number;
  onSelectVersion: (versionNumber: number) => void;
  viewMode: 'preview' | 'tree' | 'split' | 'raw' | 'kanban' | 'ui_prompt';
  onToggleViewMode: (mode: 'preview' | 'tree' | 'split' | 'raw' | 'kanban' | 'ui_prompt') => void;
  onBikinTask?: () => void;
  hasGeneratedTasks?: boolean;
  isGeneratingTasks?: boolean;
  onRegenerateTasks?: () => void;
  onExportZip: (mode?: 'full_starter' | 'docs_only') => void;
  onDownloadMarkdown?: () => void;
  onCopyMarkdown: () => void;
  isCopiedMarkdown: boolean;
  isExportingZip: boolean;
  onOpenImplementModal?: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  onOpenMcpModal?: () => void;
  onOpenAgentConfig?: () => void;
  onToggleSidebar?: () => void;
  onBack?: () => void;
  theme?: 'dark' | 'light';
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  title,
  versions,
  activeVersion,
  onSelectVersion,
  viewMode,
  onToggleViewMode,
  onBikinTask,
  hasGeneratedTasks = false,
  isGeneratingTasks = false,
  onRegenerateTasks,
  onExportZip,
  onDownloadMarkdown,
  onCopyMarkdown,
  isCopiedMarkdown,
  isExportingZip,
  onOpenImplementModal,
  isChatOpen,
  onToggleChat,
  onOpenMcpModal,
  onOpenAgentConfig,
  onToggleSidebar,
  onBack,
  theme = 'dark',
}) => {
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  const latestVersionNumber = useMemo(() => {
    return Math.max(...versions.map((v) => v.versionNumber), 1);
  }, [versions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsVersionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`h-12 shrink-0 border-b px-4 flex items-center justify-between z-20 select-none ${
        isLight
          ? 'border-zinc-200 bg-[#f8fafc] text-zinc-900'
          : 'border-zinc-800/80 bg-[#0d1117] text-zinc-100'
      }`}
    >
      {/* Left: Hamburger + Logo + Version selector pill + Bikin Task pill */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Brand Logo matching user brand: ngodingpake + prd */}
        <div className="flex items-center font-bold text-sm tracking-tight">
          <span className="text-white">ngodingpake</span>
          <span className="text-amber-500 font-extrabold">prd</span>
        </div>

        {/* Version dropdown pill matching video: Version 2 (terbaru) ⌄ */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer ${
              isLight
                ? 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
                : 'border-zinc-700/70 bg-[#161b22] text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Pilih Versi PRD"
          >
            <span>
              Version {activeVersion}
              {activeVersion === latestVersionNumber ? ' (terbaru)' : ''}
            </span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </button>

          {isVersionDropdownOpen && (
            <div
              className={`absolute left-0 top-full mt-1.5 w-60 rounded-xl border shadow-2xl z-50 overflow-hidden text-left py-1 ${
                isLight
                  ? 'border-zinc-200 bg-white text-zinc-800'
                  : 'border-zinc-800 bg-[#161b22] text-zinc-200'
              }`}
            >
              <div className="px-3 py-1.5 border-b border-zinc-800/50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Riwayat Versi
              </div>
              <div className="max-h-56 overflow-y-auto py-1 text-xs">
                {versions.map((ver) => {
                  const isCurrent = ver.versionNumber === activeVersion;
                  const isLatest = ver.versionNumber === latestVersionNumber;
                  return (
                    <button
                      key={ver.versionNumber}
                      type="button"
                      onClick={() => {
                        onSelectVersion(ver.versionNumber);
                        setIsVersionDropdownOpen(false);
                      }}
                      className={`w-full flex flex-col items-start px-3 py-1.5 transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#ea580c]/20 text-[#ea580c] font-semibold'
                          : 'hover:bg-zinc-800/60 text-zinc-300'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span>
                          Version {ver.versionNumber} {isLatest ? '(terbaru)' : ''}
                        </span>
                        <span className="text-[10px] text-zinc-500">{ver.timestamp}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 truncate w-full mt-0.5">
                        {ver.summary || 'Draf dokumen'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bikin Task Pill Button */}
        {onBikinTask && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isGeneratingTasks}
              onClick={onBikinTask}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                isGeneratingTasks
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 animate-pulse cursor-wait'
                  : hasGeneratedTasks
                  ? 'border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                  : 'border-amber-500/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 shadow-sm shadow-amber-500/10'
              }`}
              title={
                isGeneratingTasks
                  ? 'Sedang menyusun daftar tugas dari PRD...'
                  : hasGeneratedTasks
                  ? 'Lihat Task di Split View / Pohon Fitur'
                  : 'Bikin Task otomatis dari PRD & tampilkan pohon tugas'
              }
            >
              {isGeneratingTasks ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                  <span>Menyusun Task...</span>
                </>
              ) : hasGeneratedTasks ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Task Siap ({viewMode === 'split' ? 'Split View' : 'Buka Task'})</span>
                </>
              ) : (
                <>
                  <ListTodo className="h-3.5 w-3.5 text-amber-400" />
                  <span>Bikin Task</span>
                </>
              )}
            </button>

            {hasGeneratedTasks && onRegenerateTasks && (
              <button
                type="button"
                onClick={onRegenerateTasks}
                disabled={isGeneratingTasks}
                className="p-1 rounded-full border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                title="Perbarui / Regenerate Task dari PRD terbaru"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right: Action Buttons Grouped: [Eye] [Tree] [Split] [Kanban] [UI Prompt] [Code] [MCP] [Download] [Copy] [Chat] */}
      <div className="flex items-center gap-1.5">
        {/* Eye Preview button (Dokumen PRD) */}
        <button
          type="button"
          onClick={() => onToggleViewMode('preview')}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            viewMode === 'preview'
              ? 'bg-[#ea580c] text-white border-[#ea580c]'
              : 'border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-zinc-200'
          }`}
          title="Tampilan Dokumen PRD"
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* Tree Canvas button (Pohon Fitur) */}
        <button
          type="button"
          onClick={() => onToggleViewMode('tree')}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            viewMode === 'tree'
              ? 'bg-[#ea580c] text-white border-[#ea580c]'
              : 'border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-zinc-200'
          }`}
          title="Pohon Fitur Interaktif (Tree Canvas)"
        >
          <FolderTree className="h-4 w-4" />
        </button>

        {/* Split View button (Dokumen & Pohon Fitur) */}
        <button
          type="button"
          onClick={() => onToggleViewMode('split')}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            viewMode === 'split'
              ? 'bg-[#ea580c] text-white border-[#ea580c]'
              : 'border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-zinc-200'
          }`}
          title="Split View (Dokumen PRD & Pohon Fitur)"
        >
          <Columns className="h-4 w-4" />
        </button>

        {/* Kanban Board button */}
        <button
          type="button"
          onClick={() => onToggleViewMode('kanban')}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            viewMode === 'kanban'
              ? 'bg-[#ea580c] text-white border-[#ea580c]'
              : 'border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-zinc-200'
          }`}
          title="Papan Kanban Pelacakan Agen AI"
        >
          <Kanban className="h-4 w-4" />
        </button>

        {/* UI Design Prompt button */}
        <button
          type="button"
          onClick={() => onToggleViewMode('ui_prompt')}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            viewMode === 'ui_prompt'
              ? 'bg-[#ea580c] text-white border-[#ea580c]'
              : 'border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-zinc-200'
          }`}
          title="Prompt Desain UI (v0 / Stitch / Figma)"
        >
          <Palette className="h-4 w-4" />
        </button>

        {/* Code Markdown button */}
        <button
          type="button"
          onClick={() => onToggleViewMode('raw')}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            viewMode === 'raw'
              ? 'bg-[#ea580c] text-white border-[#ea580c]'
              : 'border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-zinc-200'
          }`}
          title="Tampilan Markdown (Code)"
        >
          <Code2 className="h-4 w-4" />
        </button>

        {/* MCP Server Integration button */}
        {onOpenMcpModal && (
          <button
            type="button"
            onClick={onOpenMcpModal}
            className="p-1.5 rounded-lg border border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-[#ea580c] hover:border-[#ea580c]/50 transition-all cursor-pointer"
            title="Integrasi MCP Server (Antigravity, Cursor, Claude Code)"
          >
            <Server className="h-4 w-4" />
          </button>
        )}

        {/* Coding Agent Config button */}
        {onOpenAgentConfig && (
          <button
            type="button"
            onClick={onOpenAgentConfig}
            className="p-1.5 rounded-lg border border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all cursor-pointer"
            title="Generator Konfigurasi Coding Agent (.cursorrules, CLAUDE.md, .windsurfrules, .env)"
          >
            <Terminal className="h-4 w-4" />
          </button>
        )}

        {/* Implemen Hero Button (matching ngodingpakeai Image 1 & 2) */}
        {onOpenImplementModal && (
          <button
            type="button"
            onClick={onOpenImplementModal}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl bg-[#ea580c] hover:bg-[#d94e08] text-white text-xs font-semibold shadow-md shadow-orange-950/30 transition-all cursor-pointer active:scale-95 shrink-0"
            title="Buka Menu Implementasi (Download PRD, ZIP, & Prompt AI Agent)"
          >
            <span>Implemen</span>
          </button>
        )}

        {/* Copy Markdown button */}
        <button
          type="button"
          onClick={onCopyMarkdown}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            isCopiedMarkdown
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
              : 'border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-zinc-200'
          }`}
          title="Salin Markdown"
        >
          {isCopiedMarkdown ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>

        {/* Chat Toggle button */}
        <button
          type="button"
          onClick={onToggleChat}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ml-1 ${
            isChatOpen
              ? 'bg-[#ea580c] text-white border-[#ea580c]'
              : 'border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-zinc-200'
          }`}
          title={isChatOpen ? 'Tutup AI Assistant' : 'Buka AI Assistant'}
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
