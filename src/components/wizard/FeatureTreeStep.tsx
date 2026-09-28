'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PRDFormData } from '@/types/prd';
import { TechStackConfig } from './WizardHeroInput';
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
  isLoading?: boolean;
  loadingMessage?: string;
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
  isLoading = false,
  loadingMessage,
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
    <div className="w-full h-[calc(100vh-6rem)] min-h-[660px] flex flex-col animate-in fade-in duration-300 relative">
      {/* Main Interactive Infinite Tree Canvas */}
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
          onBackWizard={onBack}
          isGeneratingPrd={isGeneratingPrd}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
        />
      </div>
    </div>
  );
};
