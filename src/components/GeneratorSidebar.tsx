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
  ExternalLink,
  RefreshCw,
  Layers,
  Search,
  Zap,
  Wand2,
  SlidersHorizontal,
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
  onOpenSettings: () => void;
  onOpenPricing: () => void;
  onOpenAuth: () => void;
  activeModel: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isLoadingHistory?: boolean;
  onRefreshHistory?: () => void;
  creationMode: 'wizard' | 'manual';
  onSetCreationMode: (mode: 'wizard' | 'manual') => void;
}

export const GeneratorSidebar: React.FC<GeneratorSidebarProps> = ({
  isOpen,
  onToggle,
  activePrdId,
  historyItems,
  onSelectPrd,
  onNewPrd,
  onDeletePrd,
  onOpenSettings,
  onOpenPricing,
  onOpenAuth,
  activeModel,
  theme,
  onToggleTheme,
  isLoadingHistory = false,
  onRefreshHistory,
  creationMode,
  onSetCreationMode,
}) => {
  const {
    isPro,
    isPlus,
    isPaid,
    tier,
    remainingTrials,
    dailyLimit,
    todayGenerations,
    remainingToday,
    systemSettings,
    pendingOrder,
  } = useAuth();
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
      const diffDay = Math.floor(diffHour / 24);
      return `${diffDay}h lalu`;
    } catch {
      return '';
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Hapus dokumen PRD ini dari riwayat?')) {
      if (onDeletePrd) onDeletePrd(id);
    }
  };

  if (!isOpen) {
    return (
      <aside className="hidden lg:flex flex-col items-center py-4 w-14 shrink-0 border-r border-zinc-800/80 bg-[#0c0c0e] text-zinc-400 z-30 transition-all">
        <button
          type="button"
          onClick={onToggle}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors mb-4 cursor-pointer"
          title="Buka Sidebar Workspace"
        >
          <PanelLeft className="h-5 w-5 text-amber-400" />
        </button>

        <button
          type="button"
          onClick={onNewPrd}
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors mb-4 shadow-sm shadow-amber-500/20 cursor-pointer"
          title="Buat PRD Baru"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* Collapsed Pending Order Indicator */}
        {pendingOrder && !isPro && (
          <button
            type="button"
            onClick={onOpenPricing}
            className="relative p-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors mb-4 border border-amber-500/40 cursor-pointer"
            title={`Pesanan ${pendingOrder.order_code} Menunggu Verifikasi`}
          >
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500" />
            <Clock className="h-4 w-4" />
          </button>
        )}

        {!isServerManaged && (
          <div className="mt-auto flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Pengaturan Kunci API"
            >
              <Key className="h-4 w-4 text-emerald-400" />
            </button>
          </div>
        )}
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
      </div>

      {/* Mode Pembuatan Section */}
      <div className="px-3 py-2.5 border-b border-zinc-800/60">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-0.5">
          Mode Pembuatan
        </span>
        <div className="flex items-center rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => onSetCreationMode('wizard')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-all ${
              creationMode === 'wizard'
                ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
            title="Mode Terpandu (Wizard)"
          >
            <Wand2 className="h-3 w-3 shrink-0" />
            <span>Terpandu</span>
          </button>
          <button
            type="button"
            onClick={() => onSetCreationMode('manual')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-all ${
              creationMode === 'manual'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
            title="Form Manual (7 Kategori)"
          >
            <SlidersHorizontal className="h-3 w-3 shrink-0" />
            <span>Manual</span>
          </button>
        </div>
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

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Dokumen PRD</span>
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

      {/* Footer Info: User Tier & Quota */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/90 space-y-2">
        {/* Pending Order Status Card */}
        {pendingOrder && !isPro && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>Menunggu Verifikasi</span>
              </div>
              <span className="font-mono font-bold text-[10px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">
                {pendingOrder.order_code}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Pesanan sedang divalidasi admin.
            </p>
            <button
              type="button"
              onClick={onOpenPricing}
              className="mt-2 w-full py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Clock className="h-3 w-3" />
              <span>Lihat Detail / Konfirmasi WA</span>
            </button>
          </div>
        )}

        {/* User Tier & Quota Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {isPro ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  <Crown className="h-3.5 w-3.5 text-amber-400" />
                  <span>PRO Unlimited</span>
                </span>
              ) : isPlus ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  <span>PLUS Member</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/50">
                  <Zap className="h-3 w-3 text-zinc-400" />
                  <span>Paket Free</span>
                </span>
              )}
            </div>

            {/* Upgrade action button */}
            {!pendingOrder && (
              isPlus ? (
                <button
                  type="button"
                  onClick={onOpenPricing}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Crown className="h-2.5 w-2.5" />
                  <span>Upgrade PRO</span>
                </button>
              ) : !isPro ? (
                <button
                  type="button"
                  onClick={onOpenPricing}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                >
                  Pilih Paket
                </button>
              ) : null
            )}
          </div>

          {/* Daily Quota Counter */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
            <span>Kuota PRD Hari Ini:</span>
            <span className="font-mono font-bold text-zinc-200">
              {isPro
                ? (dailyLimit >= 999999 ? 'Unlimited' : `${remainingToday}/${dailyLimit}`)
                : isPlus
                ? `${remainingToday}/${dailyLimit} tersisa`
                : `${remainingTrials}x trial`}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
