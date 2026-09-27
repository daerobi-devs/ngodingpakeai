'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PRDFormData } from '@/types/prd';
import { TechStackConfig } from './WizardHeroInput';
import {
  ArrowLeft,
  ArrowRight,
  FolderTree,
  Kanban,
  Loader2,
} from 'lucide-react';
import { InteractiveTreeCanvas, TreeCanvasModule } from '@/components/tree/InteractiveTreeCanvas';

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

    // 4. Modul Eksekusi Coding Agent & MCP Kanban (FASE 4)
    modules.push({
      id: 'mod-agent',
      name: 'Eksekusi Coding Agent & MCP Kanban',
      description: 'Integrasi server MCP dan prompt terarah untuk dikerjakan Claude Code atau Cursor.',
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
  const handleAddSubFeature = (modId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        return { ...m, subFeatures: [...m.subFeatures, trimmed] };
      })
    );
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
  const displayTitle = formData.title || (idea.length > 55 ? `${idea.slice(0, 52)}...` : idea);

  // Convert to TreeCanvasModule format
  const canvasModules: TreeCanvasModule[] = useMemo(() => {
    return modules.map((m) => ({
      id: m.id,
      name: m.name,
      phase: m.phase,
      complexity: m.complexity,
      description: m.description,
      enabled: m.enabled,
      subFeatures: m.subFeatures,
    }));
  }, [modules]);

  return (
    <div className="w-full h-[calc(100vh-8rem)] min-h-[650px] flex flex-col animate-in fade-in duration-300 relative">
      {/* 1. Main Interactive Infinite Tree Canvas */}
      <div className="flex-1 w-full h-full relative overflow-hidden rounded-2xl border border-zinc-800/90 shadow-2xl flex flex-col">
        <InteractiveTreeCanvas
          title={displayTitle}
          subtitle="Peta jalan pengembangan bertahap siap dieksekusi coding agent secara terarah."
          techStackLabel={techStack.frontend || techStack.name}
          modules={canvasModules}
          mode="wizard"
          theme={theme}
          onToggleModule={handleToggleModule}
          onAddSubFeature={handleAddSubFeature}
          onRemoveSubFeature={handleRemoveSubFeature}
          onProceedWizard={handleFinalGenerate}
          isGeneratingPrd={isGeneratingPrd}
        />
      </div>

      {/* 2. Floating Bottom Action Bar */}
      <div
        className={`mt-4 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 transition-all ${
          isLight
            ? 'bg-white/95 border-zinc-300 shadow-xl text-zinc-900'
            : 'bg-[#0e1118]/95 border-zinc-800 shadow-2xl text-white'
        }`}
      >
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 font-bold text-sm text-zinc-100">
            <Kanban className="h-4 w-4 text-amber-500" />
            <span>Pohon Fitur Siap Dikomposisikan ke Dokumen Studio PRD</span>
          </div>
          <p className="text-xs text-zinc-400">
            {enabledCount} dari {modules.length} modul aktif terpilih. Kamu bisa geser (pan) canvas dan atur skala perbesaran bebas.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBack}
            disabled={isGeneratingPrd}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              isLight
                ? 'bg-zinc-100 border-zinc-300 text-zinc-700'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            Ubah Tanya Jawab
          </button>

          <button
            type="button"
            onClick={handleFinalGenerate}
            disabled={isGeneratingPrd || enabledCount === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-6 py-2.5 text-xs font-extrabold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            {isGeneratingPrd ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                <span>Menyusun Dokumen Studio...</span>
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
