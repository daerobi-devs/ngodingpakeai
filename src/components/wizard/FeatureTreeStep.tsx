'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PRDFormData } from '@/types/prd';
import { TechStackConfig } from './WizardHeroInput';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  FolderTree,
  Filter,
  Box,
  LayoutGrid,
  Plus,
  Trash2,
  Check,
  Kanban,
  Sparkles,
  Loader2,
} from 'lucide-react';

export interface FeatureModule {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'auth' | 'data' | 'integration' | 'admin' | 'ai_agent';
  complexity: 'Rendah' | 'Sedang' | 'Tinggi';
  phase: string;
  subFeatures: string[];
  enabled: boolean;
}

interface FeatureTreeStepProps {
  idea: string;
  techStack: TechStackConfig;
  formData: PRDFormData;
  onBack: () => void;
  onProceedToStudio: (updatedFormData: PRDFormData, selectedModules: FeatureModule[]) => void;
  isGeneratingPrd?: boolean;
  theme?: 'dark' | 'light';
  customModules?: FeatureModule[];
}

export const FeatureTreeStep: React.FC<FeatureTreeStepProps> = ({
  idea,
  techStack,
  formData,
  onBack,
  onProceedToStudio,
  isGeneratingPrd = false,
  theme = 'dark',
  customModules,
}) => {
  const isLight = theme === 'light';

  // Smart module synthesis based on the user's idea and tech stack
  const initialModules = useMemo<FeatureModule[]>(() => {
    const lowerIdea = idea.toLowerCase();
    const modules: FeatureModule[] = [];

    // 1. Modul Autentikasi & Keamanan (FASE 1)
    modules.push({
      id: 'mod-auth',
      name: 'Autentikasi & Manajemen Pengguna',
      description: 'Sistem login aman, registrasi, manajemen sesi, dan otorisasi bertingkat (RBAC).',
      category: 'auth',
      complexity: 'Sedang',
      phase: 'FASE 1',
      enabled: true,
      subFeatures: [
        'Registrasi & Login (Email/Password & OAuth Google)',
        'Role-Based Access Control (Admin, Pelanggan, Mitra)',
        'Penyimpanan Sesi Aman & Refresh Token JWT',
        'Profil Pengguna & Pemulihan Kata Sandi',
      ],
    });

    // 2. Modul Inti Bisnis / Core Workflow (FASE 2)
    const isEcommerce = /toko|jual|beli|produk|shop|marketplace|sewa|rental|booking/i.test(lowerIdea);
    const isSaaS = /saas|platform|tools|generator|ai|manajemen|sistem|aplikasi/i.test(lowerIdea);

    if (isEcommerce) {
      modules.push({
        id: 'mod-core',
        name: 'Katalog Produk & Alur Transaksi',
        description: 'Pusat operasional pencarian, keranjang belanja, checkout, dan manajemen inventori.',
        category: 'core',
        complexity: 'Tinggi',
        phase: 'FASE 2',
        enabled: true,
        subFeatures: [
          'Katalog Produk Interaktif & Filter Multi-Kriteria',
          'Keranjang Belanja & Kalkulasi Biaya Otomatis',
          'Alur Checkout Instan & Riwayat Transaksi',
          'Status Pesanan Realtime & Nomor Resi',
        ],
      });
    } else if (isSaaS) {
      modules.push({
        id: 'mod-core',
        name: 'Workspace & Mesin Eksekusi Utama',
        description: 'Ruang kerja pengguna untuk memproses data, menjalankan fitur inti, dan menyimpan hasil kerja.',
        category: 'core',
        complexity: 'Tinggi',
        phase: 'FASE 2',
        enabled: true,
        subFeatures: [
          'Dashboard Interaktif & Manajemen Proyek Pengguna',
          'Pemrosesan Tugas & Generator Output Otomatis',
          'Validasi Masukan & Penanganan Galat Presisi',
          'Penyimpanan Versi Kerja & Riwayat Aktivitas',
        ],
      });
    } else {
      modules.push({
        id: 'mod-core',
        name: 'Alur Bisnis & Pemrosesan Data Inti',
        description: 'Logika bisnis utama aplikasi untuk menyelesaikan permasalahan pengguna.',
        category: 'core',
        complexity: 'Tinggi',
        phase: 'FASE 2',
        enabled: true,
        subFeatures: [
          'Manajemen Formulir & Pengumpulan Data Pengguna',
          'Alur Pemrosesan Bisnis Terstruktur',
          'Penyajian Informasi & Dasbor Pelacakan Status',
          'Riwayat Log Kerja & Notifikasi Internal',
        ],
      });
    }

    // 3. Modul Skema Database & Penyimpanan (FASE 3)
    modules.push({
      id: 'mod-data',
      name: 'Skema Database & Arsitektur Data',
      description: `Rancangan tabel terstruktur, relasi relasional, dan migrasi SQL pada ${techStack.database}.`,
      category: 'data',
      complexity: 'Sedang',
      phase: 'FASE 3',
      enabled: true,
      subFeatures: [
        `Tabel Relasional Utama dengan Relasi Foreign Key`,
        'Indeks Performa untuk Pencarian Cepat & Kueri Analitik',
        'Row Level Security (RLS) untuk Isolasi Data Multi-Tenant',
        'Skrip Migrasi SQL DDL Otomatis & Trigger Updated_At',
      ],
    });

    // 4. Modul Integrasi & Gateway (FASE 4)
    const isPaymentNeed = /bayar|transaksi|jual|beli|langganan|subscription|qris|checkout/i.test(lowerIdea);
    modules.push({
      id: 'mod-integration',
      name: isPaymentNeed ? 'Payment Gateway & Webhook Notifikasi' : 'Integrasi API & Layanan Notifikasi',
      description: isPaymentNeed
        ? 'Gerbang pembayaran digital otomatis (QRIS, VA) dengan sistem webhook rekonsiliasi realtime.'
        : 'Integrasi layanan pihak ketiga, API eksternal, dan notifikasi komunikasi pengguna.',
      category: 'integration',
      complexity: 'Sedang',
      phase: 'FASE 4',
      enabled: true,
      subFeatures: isPaymentNeed
        ? [
            'Integrasi QRIS Dinamis & Virtual Account Bank',
            'Webhook Listener Pembayaran Terverifikasi Otomatis',
            'Manajemen Transaksi Tertunda, Sukses, & Kedaluwarsa',
            'Notifikasi Email/WhatsApp Konfirmasi Pembayaran',
          ]
        : [
            'Konektor REST/GraphQL API Pihak Ketiga',
            'Layanan Pengiriman Email Notifikasi Transaksional',
            'Penanganan Rate Limiting & Retry Mechanism Otomatis',
            'Sistem Logging Audit Event Terintegrasi',
          ],
    });

    // 5. Modul Admin & Backoffice (FASE 4)
    modules.push({
      id: 'mod-admin',
      name: 'Panel Manajemen Admin (Backoffice)',
      description: 'Pusat kendali pengelola aplikasi untuk audit, moderasi data, dan laporan analitik.',
      category: 'admin',
      complexity: 'Sedang',
      phase: 'FASE 4',
      enabled: true,
      subFeatures: [
        'Ringkasan Metrik KPI & Grafik Analitik Pertumbuhan',
        'Tabel Manajemen Pengguna & Pengaturan Hak Akses',
        'Moderasi Transaksi, Konten, & Konfigurasi Sistem',
        'Pusat Ekspor Laporan Data (CSV/Excel/JSON)',
      ],
    });

    // 6. Modul AI Coding Agent Tasks / MCP Kanban (FASE 4)
    modules.push({
      id: 'mod-ai-agent',
      name: 'Spesifikasi Tugas AI Coding Agent (MCP Kanban)',
      description: 'Papan tugas terstruktur yang dapat dibaca dan diperbarui langsung oleh Cursor, Windsurf, dan Claude Code.',
      category: 'ai_agent',
      complexity: 'Rendah',
      phase: 'FASE 4',
      enabled: true,
      subFeatures: [
        'Pembagian Tugas Terperinci (Setup, Backend, UI, Integrasi)',
        'Server MCP Endpoint (get_tasks, update_task_status)',
        'Sinkronisasi Otomatis Status Kanban (To Do, Doing, Done)',
        'Prompt Kontekstual Lengkap Per Modul Siap Eksekusi',
      ],
    });

    return modules;
  }, [idea, techStack]);

  const [modules, setModules] = useState<FeatureModule[]>(() => {
    if (customModules && customModules.length > 0) {
      return customModules;
    }
    return initialModules;
  });

  useEffect(() => {
    if (customModules && customModules.length > 0) {
      setModules(customModules);
    }
  }, [customModules]);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('ALL');
  const [newSubFeatureInput, setNewSubFeatureInput] = useState<{ [modId: string]: string }>({});
  const [activeAddSubFeature, setActiveAddSubFeature] = useState<string | null>(null);

  // Available Phases
  const availablePhases = useMemo(() => {
    const set = new Set<string>();
    modules.forEach((m) => {
      if (m.phase) set.add(m.phase.toUpperCase());
    });
    const sorted = Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
    return ['ALL', ...sorted];
  }, [modules]);

  // Filtered Modules
  const filteredModules = useMemo(() => {
    if (selectedPhaseFilter === 'ALL') return modules;
    return modules.filter((m) => m.phase.toUpperCase() === selectedPhaseFilter.toUpperCase());
  }, [modules, selectedPhaseFilter]);

  // Toggle Module Enabled/Disabled
  const handleToggleModule = (modId: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === modId ? { ...m, enabled: !m.enabled } : m))
    );
  };

  // Toggle Sub-Feature
  const handleRemoveSubFeature = (modId: string, subIdx: number) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        const filtered = m.subFeatures.filter((_, idx) => idx !== subIdx);
        return { ...m, subFeatures: filtered };
      })
    );
  };

  // Add Custom Sub-Feature
  const handleAddSubFeature = (modId: string) => {
    const text = (newSubFeatureInput[modId] || '').trim();
    if (!text) return;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        return { ...m, subFeatures: [...m.subFeatures, text] };
      })
    );

    setNewSubFeatureInput((prev) => ({ ...prev, [modId]: '' }));
    setActiveAddSubFeature(null);
  };

  // Submit to generate Studio PRD
  const handleFinalGenerate = () => {
    const enabledModules = modules.filter((m) => m.enabled);

    // Enrich PRDFormData with selected modules summary
    const modulesSummary = enabledModules
      .map((m) => `- [${m.phase}] Modul ${m.name}: ${m.subFeatures.join(', ')}`)
      .join('\n');

    const updatedFormData: PRDFormData = {
      ...formData,
      boundaries: {
        ...formData.boundaries,
        scope: `${formData.boundaries.scope}\n\nPohon Fitur Terpilih:\n${modulesSummary}`.trim(),
      },
    };

    onProceedToStudio(updatedFormData, enabledModules);
  };

  const enabledCount = modules.filter((m) => m.enabled).length;

  const phaseBadgeColors: Record<string, string> = {
    '1': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    '2': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    '3': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    '4': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };

  const displayTitle = formData.title || (idea.length > 55 ? `${idea.slice(0, 52)}...` : idea);

  return (
    <div className="w-full max-w-[1700px] mx-auto py-4 sm:py-6 px-2 sm:px-6 lg:px-8 animate-in fade-in duration-300 space-y-5 pb-28">
      {/* 1. Top Control Bar (Clean Layout matching PhasedFeatureTree) */}
      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 transition-colors ${
        isLight ? 'bg-white border-zinc-200 shadow-xs' : 'bg-[#12151D] border-zinc-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <FolderTree className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="font-mono font-semibold">Pohon Fitur Berfase</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-zinc-200 font-semibold truncate max-w-[280px] sm:max-w-md">{displayTitle}</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Peta jalan pengembangan bertahap siap dieksekusi coding agent secara terarah.
            </p>
          </div>
        </div>

        {/* Phase Filter Chips & Active Count */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-zinc-500 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {availablePhases.map((phaseKey) => {
              const isSelected = selectedPhaseFilter === phaseKey;
              return (
                <button
                  key={phaseKey}
                  type="button"
                  onClick={() => setSelectedPhaseFilter(phaseKey)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 shadow-xs font-bold'
                      : isLight
                      ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {phaseKey === 'ALL' ? 'Semua Fase' : phaseKey}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] font-mono px-3 py-1 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold ml-1">
            {enabledCount}/{modules.length} Modul Aktif
          </span>
        </div>
      </div>

      {/* 2. Main Mindmap Canvas Area (Full-Width Responsive Bezier Layout) */}
      <div
        id="feature-tree-canvas"
        className={`relative rounded-2xl border p-4 sm:p-8 overflow-x-auto min-h-[600px] transition-all duration-200 ${
          isLight
            ? 'bg-[#F8FAFC] border-zinc-300 shadow-inner'
            : 'bg-[#0E1117] border-zinc-800/80 shadow-2xl'
        }`}
      >
        {/* Visual Grid Dots Background */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${isLight ? '#000' : '#fff'} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Tree Container: Root (Left Sticky) -> Connector -> Modules (Center) -> Sub-Features (Right) */}
        <div className="relative z-10 flex flex-col lg:flex-row items-start gap-4 sm:gap-8 w-full py-2">
          {/* A. Left Root Node (Sticky at Top on Desktop) */}
          <div className="shrink-0 w-full lg:w-64 lg:sticky lg:top-6 z-10">
            <div className={`w-full rounded-2xl border p-5 text-center shadow-xl transition-all ${
              isLight
                ? 'bg-white border-zinc-300 text-zinc-900'
                : 'bg-[#151922] border-zinc-700/80 text-white'
            }`}>
              <div className="flex h-11 w-11 mx-auto items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-3">
                <Box className="h-5.5 w-5.5" />
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight leading-snug line-clamp-3">
                {displayTitle}
              </h2>
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Clock className="h-3 w-3" />
                <span>Perencanaan</span>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-400 font-mono">
                {techStack.frontend || techStack.name}
              </div>
            </div>
          </div>

          {/* B. SVG Bezier Connector Branch Lines (Dynamic curves originating from sticky root node) */}
          <div className="hidden lg:block w-12 shrink-0 self-stretch relative">
            <svg
              className="w-full h-full text-zinc-600/50 dark:text-zinc-700/70"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              preserveAspectRatio="none"
              viewBox="0 0 48 700"
            >
              {filteredModules.map((_, idx) => {
                const total = filteredModules.length;
                const startY = 85; // Aligned with the sticky root node
                const endY = (idx + 0.5) * (700 / total);
                return (
                  <path
                    key={idx}
                    d={`M 0 ${startY} C 24 ${startY}, 24 ${endY}, 48 ${endY}`}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
          </div>

          {/* C. Nodes List: Modules (Center) + Sub-Features (Right) spanning full remaining width */}
          <div className="flex-1 space-y-4 w-full">
            {filteredModules.map((mod) => {
              const isEnabled = mod.enabled;
              const phaseNumberMatch = mod.phase.match(/\d+/);
              const phaseNum = phaseNumberMatch ? phaseNumberMatch[0] : '1';
              const badgeClass = phaseBadgeColors[phaseNum] || 'bg-amber-500/15 text-amber-400 border-amber-500/30';

              return (
                <div
                  key={mod.id}
                  className="flex flex-col xl:flex-row xl:items-center gap-3 sm:gap-5 group w-full"
                >
                  {/* Middle Node Card */}
                  <div className={`w-full xl:w-72 shrink-0 rounded-2xl border p-4 transition-all shadow-sm ${
                    isEnabled
                      ? isLight
                        ? 'bg-white border-zinc-200 group-hover:border-zinc-300'
                        : 'bg-[#151922] border-zinc-800 group-hover:border-zinc-700'
                      : isLight
                      ? 'bg-zinc-100/70 border-zinc-200 opacity-60'
                      : 'bg-zinc-900/40 border-zinc-850 opacity-50'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${badgeClass}`}>
                            {mod.phase}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleModule(mod.id)}
                            className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition cursor-pointer ${
                              isEnabled
                                ? 'bg-amber-500 border-amber-500 text-zinc-950 font-bold'
                                : isLight
                                ? 'border-zinc-400 bg-white'
                                : 'border-zinc-700 bg-zinc-900'
                            }`}
                            title={isEnabled ? 'Nonaktifkan modul' : 'Aktifkan modul'}
                          >
                            {isEnabled && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </button>
                        </div>
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${
                          isEnabled
                            ? isLight ? 'text-zinc-900' : 'text-zinc-100'
                            : 'line-through text-zinc-500'
                        }`}>
                          {mod.name}
                        </h4>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                            {isEnabled ? 'Direncanakan' : 'Dinonaktifkan'}
                          </span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold ${
                            mod.complexity === 'Tinggi'
                              ? 'bg-red-500/10 border-red-500/30 text-red-400'
                              : mod.complexity === 'Sedang'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          }`}>
                            {mod.complexity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Connector Line for Desktop */}
                  <div className="hidden xl:block w-5 h-px bg-zinc-700 shrink-0" />

                  {/* Right Sub-Features Card */}
                  <div className={`flex-1 rounded-2xl border p-4 transition-all shadow-xs ${
                    isEnabled
                      ? isLight
                        ? 'bg-white border-zinc-200'
                        : 'bg-[#181D28] border-zinc-800/90'
                      : isLight
                      ? 'bg-zinc-100/50 border-zinc-200 opacity-60'
                      : 'bg-zinc-900/30 border-zinc-850 opacity-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-zinc-400">
                        <LayoutGrid className="h-3 w-3 text-amber-400" />
                        <span>SUB FITUR</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {mod.subFeatures.length} item
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {mod.subFeatures.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className={`group/sub flex items-center justify-between gap-2 p-2 rounded-lg text-xs leading-tight border transition ${
                            isLight
                              ? 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:border-zinc-300'
                              : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span className="truncate">{sub}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveSubFeature(mod.id, sIdx)}
                            className="opacity-0 group-hover/sub:opacity-100 transition-opacity p-0.5 text-zinc-500 hover:text-red-400 cursor-pointer"
                            title="Hapus sub-fitur ini"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Sub-Feature Inline */}
                    {activeAddSubFeature === mod.id ? (
                      <div className="flex items-center gap-1.5 pt-2">
                        <input
                          type="text"
                          value={newSubFeatureInput[mod.id] || ''}
                          onChange={(e) =>
                            setNewSubFeatureInput((prev) => ({ ...prev, [mod.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubFeature(mod.id);
                            }
                          }}
                          placeholder="Ketik sub-fitur tambahan..."
                          className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:border-amber-500 ${
                            isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-900 border-zinc-700 text-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSubFeature(mod.id)}
                          className="px-2.5 py-1.5 bg-amber-500 text-zinc-950 font-bold rounded-lg text-xs hover:bg-amber-400 cursor-pointer"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveAddSubFeature(null)}
                          className="px-2 py-1.5 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveAddSubFeature(mod.id)}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-amber-500 hover:text-amber-400 pt-2 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Tambah Sub-Fitur</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Floating Bottom Action Bar (Non-intrusive sticky placement) */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20 backdrop-blur-xl ${
        isLight
          ? 'bg-white/95 border-zinc-300 shadow-xl'
          : 'bg-[#090b10]/95 border-zinc-800 shadow-2xl'
      }`}>
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 font-bold text-sm text-zinc-100">
            <Kanban className="h-4 w-4 text-amber-500" />
            <span>Siap Diekspor ke Studio PRD &amp; Papan Kanban</span>
          </div>
          <p className="text-xs text-zinc-400">
            AI akan menyusun dokumen Markdown, Skema Database SQL, dan tugas Kanban siap pakai Cursor / Claude.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBack}
            disabled={isGeneratingPrd}
            className={`px-4 py-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-700' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            Ubah Tanya Jawab
          </button>

          <button
            type="button"
            onClick={handleFinalGenerate}
            disabled={isGeneratingPrd || enabledCount === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-6 py-3 text-xs font-extrabold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            {isGeneratingPrd ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                <span>Menyusun Dokumen Studio &amp; Kanban...</span>
              </>
            ) : (
              <>
                <span>Generate Dokumen PRD di Studio</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
