'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  viewMode: 'preview' | 'raw' | 'kanban';
  onToggleViewMode: (mode: 'preview' | 'raw' | 'kanban') => void;
  onExportZip: (mode?: 'full_starter' | 'docs_only') => void;
  onCopyMarkdown: () => void;
  isCopiedMarkdown: boolean;
  isExportingZip: boolean;
  isChatOpen: boolean;
  onToggleChat: () => void;
  onOpenMcpModal?: () => void;
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
  onExportZip,
  onCopyMarkdown,
  isCopiedMarkdown,
  isExportingZip,
  isChatOpen,
  onToggleChat,
  onOpenMcpModal,
  onToggleSidebar,
  onBack,
  theme = 'dark',
}) => {
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsVersionDropdownOpen(false);
      }
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
        setIsDownloadDropdownOpen(false);
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
      {/* Left: Hamburger + Logo + Version selector pill */}
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

        {/* Version dropdown pill matching video: Version 3 ⌄ */}
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
            <span>Version {activeVersion}</span>
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
                          ? 'bg-[#f97316]/20 text-[#f97316] font-semibold'
                          : 'hover:bg-zinc-800/60 text-zinc-300'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span>Version {ver.versionNumber}</span>
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
      </div>

      {/* Right: Action Buttons Grouped: [Eye] [Code] [Kanban] [MCP] [Download] [Copy] [Chat] */}
      <div className="flex items-center gap-1.5">
        {/* Eye Preview button */}
        <button
          type="button"
          onClick={() => onToggleViewMode('preview')}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            viewMode === 'preview'
              ? 'bg-[#ea580c] text-white border-[#ea580c]'
              : 'border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-zinc-200'
          }`}
          title="Tampilan Pratinjau (Preview)"
        >
          <Eye className="h-4 w-4" />
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

        {/* Download ZIP with Starter Repo vs Docs options */}
        <div className="relative" ref={downloadDropdownRef}>
          <div className="inline-flex items-center">
            <button
              type="button"
              onClick={() => onExportZip('full_starter')}
              disabled={isExportingZip}
              className="p-1.5 rounded-l-lg border border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
              title="Download Starter Proyek (.zip) - Repo Koding Utuh"
            >
              <Download className={`h-4 w-4 ${isExportingZip ? 'animate-bounce text-[#f97316]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
              disabled={isExportingZip}
              className="p-1.5 rounded-r-lg border-y border-r border-l-0 border-zinc-800 bg-[#161b22] text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
              title="Opsi Download ZIP"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${isDownloadDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isDownloadDropdownOpen && (
            <div
              className={`absolute right-0 top-full mt-1.5 w-64 rounded-xl border shadow-2xl z-50 overflow-hidden text-left p-1.5 ${
                isLight
                  ? 'border-zinc-200 bg-white text-zinc-800'
                  : 'border-zinc-800 bg-[#161b22] text-zinc-200'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setIsDownloadDropdownOpen(false);
                  onExportZip('full_starter');
                }}
                className="w-full flex flex-col items-start p-2 rounded-lg hover:bg-zinc-800/70 text-left transition cursor-pointer"
              >
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-emerald-400" />
                  Starter Proyek (.ZIP)
                </span>
                <span className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                  Repo koding utuh siap jalankan dev server + PRD + rules + diagram
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDownloadDropdownOpen(false);
                  onExportZip('docs_only');
                }}
                className="w-full flex flex-col items-start p-2 rounded-lg hover:bg-zinc-800/70 text-left transition border-t border-zinc-800/80 mt-1 cursor-pointer"
              >
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  Dokumen Saja (.ZIP)
                </span>
                <span className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                  Hanya berkas PRD.md, DESIGN.md, diagram .mmd, dan rules
                </span>
              </button>
            </div>
          )}
        </div>

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
