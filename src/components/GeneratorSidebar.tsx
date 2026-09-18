'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  FolderGit2,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Crown,
  Key,
  User,
  LogIn,
  ExternalLink,
  RefreshCw,
  Cpu,
  Layers,
  Search,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PRDOutput } from '@/types/prd';

export interface PrdHistorySummary {
  id: string;
  title: string;
  created_at: string;
  model_used?: string;
  prd_data?: PRDOutput;
}

interface GeneratorSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePrdId: string | null;
  historyItems: PrdHistorySummary[];
  onSelectPrd: (prd: PRDOutput, id: string) => void;
  onNewPrd: () => void;
  onDeletePrd?: (id: string) => void;
  onOpenProChat: () => void;
  isProChatOpen: boolean;
  onOpenSettings: () => void;
  onOpenPricing: () => void;
  onOpenAuth: () => void;
  activeModel: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isLoadingHistory?: boolean;
  onRefreshHistory?: () => void;
}

export const GeneratorSidebar: React.FC<GeneratorSidebarProps> = ({
  isOpen,
  onToggle,
  activePrdId,
  historyItems,
  onSelectPrd,
  onNewPrd,
  onDeletePrd,
  onOpenProChat,
  isProChatOpen,
  onOpenSettings,
  onOpenPricing,
  onOpenAuth,
  activeModel,
  theme,
  onToggleTheme,
  isLoadingHistory = false,
  onRefreshHistory,
}) => {
  const { user, isPro, remainingTrials, systemSettings, logout } = useAuth();
  const isServerManaged = systemSettings?.api_key_mode === 'server_managed';
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredHistory = historyItems.filter((item) =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
      if (diffMin < 1) return 'Baru saja';
      if (diffMin < 60) return `${diffMin}m lalu`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}j lalu`;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDeletePrd) {
      if (window.confirm('Hapus dokumen PRD ini dari riwayat?')) {
        setDeletingId(id);
        onDeletePrd(id);
      }
    }
  };

  if (!isOpen) {
    return (
      <aside className="hidden lg:flex flex-col items-center py-4 w-14 shrink-0 border-r border-zinc-800/80 bg-[#0c0c0e] text-zinc-400 z-30 transition-all">
        <button
          type="button"
          onClick={onToggle}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors mb-4"
          title="Buka Sidebar Workspace"
        >
          <PanelLeft className="h-5 w-5 text-amber-400" />
        </button>

        <button
          type="button"
          onClick={onNewPrd}
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors mb-4 shadow-sm shadow-amber-500/20"
          title="Buat PRD Baru"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={onOpenProChat}
          className={`p-2.5 rounded-xl transition-colors mb-4 ${
            isProChatOpen
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'hover:bg-zinc-800 hover:text-white'
          }`}
          title="AI Architect Chat"
        >
          <MessageSquare className="h-4 w-4" />
        </button>

        <div className="mt-auto flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title={`Model: ${activeModel}`}
          >
            <Key className="h-4 w-4 text-emerald-400" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col w-64 lg:w-72 shrink-0 border-r border-zinc-800/80 bg-[#0c0c0e] text-zinc-300 z-30 h-full select-none transition-all duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-800/70">
        <Link href="/" className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
          <span className="font-black text-sm tracking-tight text-white">
            ngodingpake<span className="text-amber-500 font-extrabold">prd</span>
          </span>
          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold ml-1">
            Studio
          </span>
        </Link>

        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          title="Tutup Sidebar Workspace"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Main Action Section */}
      <div className="p-3 space-y-2 border-b border-zinc-800/60">
        <button
          type="button"
          onClick={onNewPrd}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 py-2.5 px-3 text-xs font-bold text-zinc-950 transition-all shadow-md shadow-amber-500/15 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Buat PRD Baru</span>
        </button>

        {/* AI Architect Quick Nav Button */}
        <button
          type="button"
          onClick={onOpenProChat}
          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
            isProChatOpen
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-xs'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <MessageSquare className="h-3 w-3" />
            </div>
            <span>AI Architect Room</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            PRO
          </span>
        </button>
      </div>

      {/* Projects History Section */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <FolderGit2 className="h-3.5 w-3.5 text-zinc-400" />
            <span>Riwayat Proyek</span>
          </span>

          {onRefreshHistory && (
            <button
              type="button"
              onClick={onRefreshHistory}
              disabled={isLoadingHistory}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
              title="Segarkan Riwayat"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingHistory ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          )}
        </div>

        {/* Search input if history > 3 */}
        {historyItems.length > 3 && (
          <div className="relative mb-2">
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul proyek..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-400 focus:border-amber-500/50 focus:outline-none"
            />
          </div>
        )}

        {/* List of projects */}
        {filteredHistory.length > 0 ? (
          <div className="space-y-1">
            {filteredHistory.map((item) => {
              const isActive = activePrdId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => item.prd_data && onSelectPrd(item.prd_data, item.id)}
                  className={`group relative flex flex-col p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-xs'
                      : 'bg-zinc-900/30 border-transparent hover:bg-zinc-900/70 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <p
                      className={`text-xs font-semibold line-clamp-1 ${
                        isActive ? 'text-amber-300 font-bold' : 'text-zinc-300'
                      }`}
                    >
                      {item.title || 'Untitled PRD'}
                    </p>

                    {onDeletePrd && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                        title="Hapus dokumen ini"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span className="truncate max-w-[120px]">
                      {item.model_used ? item.model_used.replace('gemini-', '') : 'AI Model'}
                    </span>
                    <span>{formatTimeAgo(item.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 px-2 text-center rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/40">
            <Layers className="h-6 w-6 text-zinc-500 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-zinc-400 font-medium">Belum ada PRD aktif</p>
            <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
              Ketik ide produk Anda pada formulir untuk mulai membuat dokumen PRD.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info: Model Status & Profile */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/90 space-y-2">
        {/* Model Chooser Pill */}
        {isServerManaged ? (
          <div className="w-full flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-2 text-left">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Cpu className="h-3.5 w-3.5" />
              </div>
              <div className="truncate">
                <div className="text-[10px] text-zinc-400 font-medium leading-none mb-1">
                  Mesin AI
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400 truncate">
                  {isPro
                    ? systemSettings?.pro_model || 'PRO Cloud AI'
                    : systemSettings?.free_model || 'Auto Flash AI'}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Cloud
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 text-left hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Cpu className="h-3.5 w-3.5" />
              </div>
              <div className="truncate">
                <div className="text-[10px] text-zinc-400 font-medium leading-none mb-1">
                  Model Prioritas (BYOK)
                </div>
                <div className="text-xs font-mono font-bold text-zinc-200 truncate">
                  {activeModel}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-amber-400 hover:underline shrink-0 ml-1 font-semibold">
              Ganti
            </span>
          </button>
        )}

        {/* User Tier & Quota Card */}
        <div className="flex items-center justify-between px-2 py-1 text-xs">
          <div className="flex items-center gap-1.5">
            {isPro ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>PRO Unlimited</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                <Zap className="h-3 w-3 text-amber-400" />
                <span>Trial: {remainingTrials}x tersisa</span>
              </span>
            )}
          </div>

          {!isPro && (
            <button
              type="button"
              onClick={onOpenPricing}
              className="text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:underline"
            >
              Upgrade PRO
            </button>
          )}
        </div>

        {/* User login / status */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-xs">
          {user ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate text-zinc-400 text-[11px] max-w-[160px]">
                {user.email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="text-[10px] text-zinc-400 hover:text-rose-400 transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors font-medium"
            >
              <LogIn className="h-3.5 w-3.5 text-amber-400" />
              <span>Login Akun Google</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
