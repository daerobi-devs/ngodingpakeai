'use client';

import React, { useState, useMemo } from 'react';
import { PRDOutput } from '@/types/prd';
import {
  CheckCircle2,
  Clock,
  Circle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Terminal,
  Plus,
  ShieldCheck,
  Layers,
  ArrowRight,
  X,
  Server,
} from 'lucide-react';

export interface KanbanTask {
  id: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  phase: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  userStory: string;
  happyPath?: string[];
  businessRules?: string[];
  edgeCases?: string[];
  techMapping?: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
  };
  agentPrompt: string;
}

interface StudioKanbanViewProps {
  prd: PRDOutput;
  tasks?: KanbanTask[];
  onUpdateTaskStatus?: (taskId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'done') => void;
  onAddTask?: (newTask: KanbanTask) => void;
  onOpenMcpModal?: () => void;
  theme?: 'dark' | 'light';
}

export function generateComprehensiveKanbanTasks(prd: PRDOutput): KanbanTask[] {
  const list: KanbanTask[] = [];

    // 1. Task Inisialisasi Fondasi & Layout Frontend Menyeluruh
    list.push({
      id: 'task-foundation-layout',
      title: 'Inisialisasi Project, Sistem Token & Layout UI Menyeluruh',
      priority: 'P0',
      phase: 'Fase 1: Fondasi & Antarmuka',
      status: 'todo',
      userStory: `Membangun kerangka dasar aplikasi ${prd.title}, navigasi responsif, layout header-footer, dan mock data visual interaktif.`,
      techMapping: {
        frontend: ['App Router Layout', 'Navigation Shell', 'Theme Provider', 'UI Design System'],
      },
      agentPrompt: `TUGAS FONDASI FRONTEND: ${prd.title}

Target Arsitektur:
- Produk: ${prd.title}
- Arsitektur: ${prd.archetype_detection?.archetype || 'Modern Web Application'}
- Target Pengguna: ${prd.archetype_detection?.target_audience || 'End User'}

Instruksi Pengerjaan:
1. Buat struktur halaman lengkap dengan responsive header, sidebar navigasi, dan footer.
2. Pasang mock state interaktif agar seluruh komponen visual dapat diklik dan diuji alurnya sebelum integrasi data riil.
3. Patuhi prinsip antarmuka bersih tanpa emoji dan validasi seluruh rendering komponen.`,
    });

    // 2. Task Perancangan Skema Database, Relasi, Indeks & RLS
    list.push({
      id: 'task-db-schema-rls',
      title: 'Perancangan Skema Database, Foreign Keys, Indeks & RLS Policies',
      priority: 'P0',
      phase: 'Fase 1: Fondasi & Antarmuka',
      status: 'todo',
      userStory: 'Merancang tabel relasional PostgreSQL di Supabase lengkap dengan Row-Level Security dan indeks performa.',
      techMapping: {
        database: ['PostgreSQL Schema', 'Row Level Security', 'Foreign Keys', 'Performance Indexes'],
      },
      agentPrompt: `TUGAS PERANCANGAN DATABASE LENGKAP: ${prd.title}

Konteks ERD:
Gunakan diagram database_erd dari dokumen PRD sebagai acuan entitas.

Instruksi Pengerjaan:
1. Rancang file migrasi SQL mencakup tabel utama, tabel relasi, kolom updated_at, dan foreign key constraints.
2. Tambahkan policy Row Level Security (RLS) terisolasi per user_id.
3. Buat indeks performa pada kolom yang sering difilter atau di-query.`,
    });

    // 3. Task Autentikasi & Proteksi Akses
    list.push({
      id: 'task-auth-security',
      title: 'Sistem Autentikasi Pengguna, Session Management & Middleware Guard',
      priority: 'P0',
      phase: 'Fase 2: Keamanan & Akun',
      status: 'todo',
      userStory: 'Menyediakan alur login/register, sinkronisasi profil pengguna, dan proteksi rute dengan middleware.',
      techMapping: {
        frontend: ['Auth Modal / Page', 'User Profile Header'],
        backend: ['Session Verifier', 'Auth Middleware Route Guard'],
        database: ['public.profiles table'],
      },
      agentPrompt: `TUGAS AUTENTIKASI DAN KEAMANAN: ${prd.title}

Instruksi Pengerjaan:
1. Siapkan alur autentikasi aman dengan session cookies server-side.
2. Buat middleware untuk memproteksi halaman private/dashboard.
3. Buat trigger pembuatan profil otomatis saat user mendaftar.`,
    });

    // 4. Feature Breakdown dari Dokumen PRD
    if (prd.feature_breakdown && prd.feature_breakdown.length > 0) {
      prd.feature_breakdown.forEach((feat, idx) => {
        list.push({
          id: feat.id || `task-feat-${idx + 1}`,
          title: feat.name || `Fitur Inti: Modul ${idx + 1}`,
          priority: feat.priority || (idx < 2 ? 'P0' : 'P1'),
          phase: idx < 2 ? 'Fase 2: Fitur Utama MVP' : 'Fase 3: Fitur Pendukung',
          status: 'todo',
          userStory: feat.user_story || `Implementasikan fitur ${feat.name} secara menyeluruh.`,
          happyPath: feat.happy_path,
          businessRules: feat.business_rules,
          edgeCases: feat.edge_cases,
          techMapping: {
            frontend: feat.tech_mapping?.frontend_components,
            backend: feat.tech_mapping?.api_endpoints,
            database: feat.tech_mapping?.db_tables,
          },
          agentPrompt: feat.agent_prompt || `TUGAS FITUR: ${feat.name}

Spesifikasi & Kebutuhan:
- User Story: ${feat.user_story}
- Komponen Frontend: ${(feat.tech_mapping?.frontend_components || []).join(', ')}
- Endpoint API: ${(feat.tech_mapping?.api_endpoints || []).join(', ')}
- Skema Database: ${(feat.tech_mapping?.db_tables || []).join(', ')}

Instruksi Agen:
Bangun UI komponen terlebih dahulu, buat API server action dengan validasi Zod, dan hubungkan mutasi ke database.`,
        });
      });
    }

    // 5. Scope Tambahan dari PRD (Boundaries) jika belum masuk
    if (prd.boundaries?.scope && prd.boundaries.scope.length > 0) {
      prd.boundaries.scope.slice(0, 3).forEach((scStr, idx) => {
        const scTitle = scStr.replace(/^[-*•\d.]+\s*/, '').trim();
        if (scTitle && !list.some((t) => t.title.toLowerCase().includes(scTitle.toLowerCase().slice(0, 15)))) {
          list.push({
            id: `task-scope-${idx + 1}`,
            title: `Modul Ruang Lingkup: ${scTitle}`,
            priority: 'P1',
            phase: 'Fase 3: Fitur Pendukung',
            status: 'todo',
            userStory: `Memastikan ruang lingkup fungsionalitas: ${scTitle} terpenuhi secara optimal.`,
            agentPrompt: `TUGAS IMPLEMENTASI RUANG LINGKUP:\n${scTitle}\n\nPastikan fitur ini terintegrasi harmonis dengan modul sistem lainnya.`,
          });
        }
      });
    }

    // 6. Task Integrasi API & Mutasi Data Aman (Server Actions & Zod)
    list.push({
      id: 'task-api-zod-actions',
      title: 'Pembangunan API Route Handlers, Safe Actions & Validasi Skema Zod',
      priority: 'P1',
      phase: 'Fase 3: Backend & Integrasi',
      status: 'todo',
      userStory: 'Membuat endpoint REST / Server Actions dengan validasi payload Zod dan penanganan error standar.',
      techMapping: {
        backend: ['Next.js Route Handlers', 'Zod Input Schema', 'Rate Limiter'],
      },
      agentPrompt: `TUGAS API & SERVER ACTIONS: ${prd.title}

Instruksi Pengerjaan:
1. Buat skema Zod untuk seluruh input formulir dan request payload.
2. Gunakan safe-action pattern untuk memastikan seluruh error tertangkap rapi dengan status kode HTTP tepat.`,
    });

    // 7. Task Transaksi / Integrasi Eksternal
    list.push({
      id: 'task-external-integration',
      title: 'Integrasi Alur Bisnis Transaksional & Webhook Gateway',
      priority: 'P1',
      phase: 'Fase 3: Backend & Integrasi',
      status: 'todo',
      userStory: 'Mengintegrasikan layanan eksternal (pembayaran QRIS, notifikasi email/WA, atau LLM gateway) beserta webhook listener.',
      techMapping: {
        backend: ['Webhook Handler', 'Signature Verifier', 'Event Queue'],
      },
      agentPrompt: `TUGAS INTEGRASI & TRANSAKSI: ${prd.title}

Instruksi Pengerjaan:
1. Buat webhook endpoint yang memverifikasi signature cryptographic keamanan.
2. Lakukan mutasi status transaksi secara atomik dan idempotent.`,
    });

    // 8. Task Penanganan Edge Cases & Resiliensi Error
    list.push({
      id: 'task-edgecases-resilience',
      title: 'Penanganan Kasus Ekstrem (Edge Cases), Error Boundaries & Fallback UI',
      priority: 'P1',
      phase: 'Fase 4: Resiliensi & Kesiapan Rilis',
      status: 'todo',
      userStory: 'Menangani kondisi offline, network timeout, input tak valid, dan menyediakan halaman fallback ramah pengguna.',
      techMapping: {
        frontend: ['Global Error Boundary', 'Not-Found Page', 'Skeleton Shimmer Loading'],
      },
      agentPrompt: `TUGAS RESILIENSI SISTEM: ${prd.title}

Instruksi Pengerjaan:
1. Pasang error boundary pada setiap route dan layout.
2. Sediakan tampilan empty state, loading skeleton, dan instruksi penanganan jika koneksi terputus.`,
    });

    // 9. Task Audit Kualitas & Kesiapan Produksi
    list.push({
      id: 'task-production-readiness',
      title: 'Audit Kualitas Kode, Type Checking, E2E Verification & Kesiapan Rilis',
      priority: 'P1',
      phase: 'Fase 4: Resiliensi & Kesiapan Rilis',
      status: 'todo',
      userStory: 'Memverifikasi kompilasi build produksi, eliminasi lint error, dan pengecekan aksesibilitas antarmuka.',
      techMapping: {
        frontend: ['Build Verification', 'TypeScript Strict Check', 'SEO Meta Tags'],
      },
      agentPrompt: `TUGAS KESIAPAN PRODUKSI: ${prd.title}

Instruksi Pengerjaan:
1. Jalankan npx tsc --noEmit dan pastikan nol error tipe.
2. Pastikan build Next.js sukses terkompilasi.
3. Pasang metadata OpenGraph dan meta tags SEO esensial.`,
    });

    return list;
}

export const StudioKanbanView: React.FC<StudioKanbanViewProps> = ({
  prd,
  tasks: controlledTasks,
  onUpdateTaskStatus,
  onAddTask,
  onOpenMcpModal,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const initialTasks = useMemo(() => generateComprehensiveKanbanTasks(prd), [prd]);
  const [internalTasks, setInternalTasks] = useState<KanbanTask[]>(initialTasks);
  const activeTasks = controlledTasks || internalTasks;

  const [selectedPriority, setSelectedPriority] = useState<'all' | 'P0' | 'P1'>('all');
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState<boolean>(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'P0' | 'P1' | 'P2'>('P1');
  const [newPhase, setNewPhase] = useState('Fase 2: Fitur Tambahan');
  const [newUserStory, setNewUserStory] = useState('');

  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'done') => {
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, newStatus);
    }
    setInternalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: KanbanTask = {
      id: `task-custom-${Date.now()}`,
      title: newTitle.trim(),
      priority: newPriority,
      phase: newPhase,
      status: 'todo',
      userStory: newUserStory.trim() || `Implementasikan tugas ${newTitle.trim()} sesuai standar arsitektur.`,
      agentPrompt: `TUGAS TAMBAHAN: ${newTitle.trim()}

Konteks Produk: ${prd.title}
Fase: ${newPhase}
Prioritas: ${newPriority}

Deskripsi & Kebutuhan:
${newUserStory.trim() || 'Implementasikan modul ini hingga tuntas dan siap produksi.'}

Instruksi Agen:
1. Panggil tool MCP 'update_task_status' ke 'in_progress' saat mulai.
2. Selesaikan kode dan uji fungsi secara menyeluruh.
3. Panggil tool MCP 'update_task_status' ke 'done' setelah selesai.`,
    };

    if (onAddTask) {
      onAddTask(newTask);
    }
    setInternalTasks((prev) => [newTask, ...prev]);

    setNewTitle('');
    setNewUserStory('');
    setIsNewTaskModalOpen(false);
  };

  const handleCopyPrompt = (taskId: string, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedTaskId(taskId);
    setTimeout(() => setCopiedTaskId(null), 2000);
  };

  const handleCopyAllPrompts = () => {
    const fullPlan = activeTasks
      .map(
        (t, idx) =>
          `### [TUGAS ${idx + 1}] (${t.priority}) - ${t.title} [ID: ${t.id}]\nStatus: ${t.status}\nFase: ${t.phase}\nUser Story: ${t.userStory}\n\nPrompt Lengkap Agen AI:\n${t.agentPrompt}\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(fullPlan);
    setIsCopiedAll(true);
    setTimeout(() => setIsCopiedAll(false), 2000);
  };

  // Metrics
  const totalCount = activeTasks.length;
  const doneCount = activeTasks.filter((t) => t.status === 'done').length;
  const reviewCount = activeTasks.filter((t) => t.status === 'review').length;
  const inProgressCount = activeTasks.filter((t) => t.status === 'in_progress').length;
  const todoCount = activeTasks.filter((t) => t.status === 'todo').length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Filtered by priority
  const filteredTasks = useMemo(() => {
    if (selectedPriority === 'all') return activeTasks;
    return activeTasks.filter((t) => t.priority === selectedPriority);
  }, [activeTasks, selectedPriority]);

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const reviewTasks = filteredTasks.filter((t) => t.status === 'review');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Header Bar: Title, Metrics, and Action */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight
            ? 'border-zinc-200 bg-white shadow-xs'
            : 'border-zinc-800/80 bg-[#0d1117] shadow-lg'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ea580c]/15 text-[#ea580c] border border-[#ea580c]/30">
                Papan Eksekusi Agen AI (4 Alur)
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {doneCount} dari {totalCount} Tugas Selesai ({progressPercent}%)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Kanban Pelacakan Tugas Otonom
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 max-w-3xl leading-relaxed">
              Tugas dipecah secara mendalam mencakup frontend, skema database, API, hingga kesiapan rilis. Kartu berpindah otomatis saat agen Antigravity, Cursor, atau Claude Code memanggil instruksi MCP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Priority Filter */}
            <div className="inline-flex rounded-xl border border-zinc-800 bg-[#161b22] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedPriority('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedPriority === 'all'
                    ? 'bg-[#ea580c] text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Semua ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedPriority('P0')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedPriority === 'P0'
                    ? 'bg-[#ea580c] text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                P0 Kritis
              </button>
              <button
                type="button"
                onClick={() => setSelectedPriority('P1')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedPriority === 'P1'
                    ? 'bg-[#ea580c] text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                P1 Fitur
              </button>
            </div>

            {/* Add Custom Task Button */}
            <button
              type="button"
              onClick={() => setIsNewTaskModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ea580c]/40 bg-[#ea580c]/15 hover:bg-[#ea580c]/25 text-[#ea580c] px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
              title="Tambah tugas implementasi baru ke papan Kanban"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Tugas</span>
            </button>

            {/* Copy All Prompts */}
            <button
              type="button"
              onClick={handleCopyAllPrompts}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-[#161b22] hover:bg-zinc-800 text-zinc-200 hover:text-white px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
              title="Salin seluruh prompt tugas agen terstruktur"
            >
              {isCopiedAll ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin Semua Prompt</span>
                </>
              )}
            </button>

            {/* MCP Integration & Agent Prompt Cheat Sheet Modal Trigger */}
            {onOpenMcpModal && (
              <button
                type="button"
                onClick={onOpenMcpModal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-[#161b22] hover:bg-zinc-800 text-zinc-200 hover:text-[#ea580c] hover:border-[#ea580c]/50 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                title="Buka panduan integrasi MCP dan contekan prompt agen AI"
              >
                <Server className="h-3.5 w-3.5 text-[#ea580c]" />
                <span>Integrasi MCP</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-4 pt-3 border-t border-zinc-800/60">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
            <span className="font-medium">Total Progres Kode Proyek</span>
            <span className="font-mono font-bold text-white">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ea580c] via-blue-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4-Column Kanban Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {/* Column 1: TO DO */}
        <div
          className={`rounded-2xl border p-3.5 flex flex-col min-h-[520px] ${
            isLight
              ? 'border-zinc-200 bg-zinc-50/70'
              : 'border-zinc-800/80 bg-[#0d1117]/60'
          }`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/60 mb-3">
            <div className="flex items-center gap-1.5">
              <Circle className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                To Do
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-bold">
              {todoTasks.length}
            </span>
          </div>

          {/* Cards List */}
          <div className="space-y-3 flex-1">
            {todoTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                Tidak ada tugas dalam To Do.
              </div>
            ) : (
              todoTasks.map((task) => (
                <KanbanTaskCard
                  key={task.id}
                  task={task}
                  isLight={isLight}
                  isCopied={copiedTaskId === task.id}
                  isExpanded={expandedTaskId === task.id}
                  onToggleExpand={() =>
                    setExpandedTaskId(expandedTaskId === task.id ? null : task.id)
                  }
                  onCopyPrompt={() => handleCopyPrompt(task.id, task.agentPrompt)}
                  onMoveStatus={(newStatus) => handleStatusChange(task.id, newStatus)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div
          className={`rounded-2xl border p-3.5 flex flex-col min-h-[520px] ${
            isLight
              ? 'border-amber-200/60 bg-amber-500/5'
              : 'border-amber-500/20 bg-amber-500/5'
          }`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/20 mb-3">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                In Progress
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              {inProgressTasks.length}
            </span>
          </div>

          {/* Cards List */}
          <div className="space-y-3 flex-1">
            {inProgressTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                Tidak ada tugas aktif dikerjakan.
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <KanbanTaskCard
                  key={task.id}
                  task={task}
                  isLight={isLight}
                  isCopied={copiedTaskId === task.id}
                  isExpanded={expandedTaskId === task.id}
                  onToggleExpand={() =>
                    setExpandedTaskId(expandedTaskId === task.id ? null : task.id)
                  }
                  onCopyPrompt={() => handleCopyPrompt(task.id, task.agentPrompt)}
                  onMoveStatus={(newStatus) => handleStatusChange(task.id, newStatus)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: REVIEW / TESTING */}
        <div
          className={`rounded-2xl border p-3.5 flex flex-col min-h-[520px] ${
            isLight
              ? 'border-blue-200/60 bg-blue-500/5'
              : 'border-blue-500/20 bg-blue-500/5'
          }`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-blue-500/20 mb-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Review & Testing
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-bold">
              {reviewTasks.length}
            </span>
          </div>

          {/* Cards List */}
          <div className="space-y-3 flex-1">
            {reviewTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                Belum ada tugas dalam tahap review.
              </div>
            ) : (
              reviewTasks.map((task) => (
                <KanbanTaskCard
                  key={task.id}
                  task={task}
                  isLight={isLight}
                  isCopied={copiedTaskId === task.id}
                  isExpanded={expandedTaskId === task.id}
                  onToggleExpand={() =>
                    setExpandedTaskId(expandedTaskId === task.id ? null : task.id)
                  }
                  onCopyPrompt={() => handleCopyPrompt(task.id, task.agentPrompt)}
                  onMoveStatus={(newStatus) => handleStatusChange(task.id, newStatus)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 4: DONE */}
        <div
          className={`rounded-2xl border p-3.5 flex flex-col min-h-[520px] ${
            isLight
              ? 'border-emerald-200/60 bg-emerald-500/5'
              : 'border-emerald-500/20 bg-emerald-500/5'
          }`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-emerald-500/20 mb-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Done (Selesai)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              {doneTasks.length}
            </span>
          </div>

          {/* Cards List */}
          <div className="space-y-3 flex-1">
            {doneTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                Belum ada tugas yang selesai.
              </div>
            ) : (
              doneTasks.map((task) => (
                <KanbanTaskCard
                  key={task.id}
                  task={task}
                  isLight={isLight}
                  isCopied={copiedTaskId === task.id}
                  isExpanded={expandedTaskId === task.id}
                  onToggleExpand={() =>
                    setExpandedTaskId(expandedTaskId === task.id ? null : task.id)
                  }
                  onCopyPrompt={() => handleCopyPrompt(task.id, task.agentPrompt)}
                  onMoveStatus={(newStatus) => handleStatusChange(task.id, newStatus)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah Tugas Baru */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0d1117] text-zinc-100 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#ea580c]" />
                <span>Tambah Tugas Eksekusi Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Judul Tugas</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Implementasi Ekspor Laporan Transaksi PDF..."
                  className="w-full rounded-xl border border-zinc-700 bg-[#161b22] px-3 py-2 text-white focus:outline-none focus:border-[#ea580c]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Prioritas</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#161b22] px-3 py-2 text-white focus:outline-none focus:border-[#ea580c]"
                  >
                    <option value="P0">P0 (Kritis / MVP)</option>
                    <option value="P1">P1 (Fitur Utama)</option>
                    <option value="P2">P2 (Penyempurnaan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Fase Pengerjaan</label>
                  <select
                    value={newPhase}
                    onChange={(e) => setNewPhase(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#161b22] px-3 py-2 text-white focus:outline-none focus:border-[#ea580c]"
                  >
                    <option value="Fase 1: Fondasi">Fase 1: Fondasi</option>
                    <option value="Fase 2: Fitur Tambahan">Fase 2: Fitur Tambahan</option>
                    <option value="Fase 3: Integrasi">Fase 3: Integrasi</option>
                    <option value="Fase 4: Rilis">Fase 4: Rilis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Deskripsi / User Story</label>
                <textarea
                  rows={3}
                  value={newUserStory}
                  onChange={(e) => setNewUserStory(e.target.value)}
                  placeholder="Jelaskan kebutuhan teknis dan target fungsionalitas fitur ini..."
                  className="w-full rounded-xl border border-zinc-700 bg-[#161b22] px-3 py-2 text-white focus:outline-none focus:border-[#ea580c]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#ea580c] hover:bg-[#ea580c]/90 text-white font-semibold cursor-pointer"
                >
                  Simpan & Tambahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface KanbanTaskCardProps {
  task: KanbanTask;
  isLight: boolean;
  isCopied: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCopyPrompt: () => void;
  onMoveStatus: (status: 'todo' | 'in_progress' | 'review' | 'done') => void;
}

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
  task,
  isLight,
  isCopied,
  isExpanded,
  onToggleExpand,
  onCopyPrompt,
  onMoveStatus,
}) => {
  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        task.status === 'done'
          ? isLight
            ? 'border-emerald-200 bg-white opacity-85'
            : 'border-emerald-500/30 bg-[#161b22]/70 opacity-90'
          : task.status === 'review'
          ? isLight
            ? 'border-blue-300 bg-white shadow-xs'
            : 'border-blue-500/30 bg-[#161b22] shadow-sm'
          : task.status === 'in_progress'
          ? isLight
            ? 'border-amber-300 bg-white shadow-sm'
            : 'border-amber-500/40 bg-[#161b22] shadow-md'
          : isLight
          ? 'border-zinc-200 bg-white shadow-xs'
          : 'border-zinc-800/90 bg-[#161b22]/90 hover:border-zinc-700'
      }`}
    >
      {/* Top Tag Row: Priority & Phase */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
              task.priority === 'P0'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {task.priority}
          </span>
          <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">
            {task.phase}
          </span>
        </div>

        {/* Quick Status Dropdown / Move Buttons */}
        <div className="flex items-center gap-1">
          {task.status === 'todo' && (
            <button
              type="button"
              onClick={() => onMoveStatus('in_progress')}
              className="text-[9px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors cursor-pointer"
              title="Pindahkan ke In Progress"
            >
              Mulai
            </button>
          )}
          {task.status === 'in_progress' && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onMoveStatus('todo')}
                className="text-[9px] px-1 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                title="Kembalikan ke To Do"
              >
                <RotateCcw className="h-2.5 w-2.5" />
              </button>
              <button
                type="button"
                onClick={() => onMoveStatus('review')}
                className="text-[9px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 cursor-pointer"
                title="Pindahkan ke Review"
              >
                Review
              </button>
            </div>
          )}
          {task.status === 'review' && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onMoveStatus('in_progress')}
                className="text-[9px] px-1 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                title="Kembalikan ke In Progress"
              >
                <RotateCcw className="h-2.5 w-2.5" />
              </button>
              <button
                type="button"
                onClick={() => onMoveStatus('done')}
                className="text-[9px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 cursor-pointer"
                title="Tandai Selesai"
              >
                Selesai
              </button>
            </div>
          )}
          {task.status === 'done' && (
            <button
              type="button"
              onClick={() => onMoveStatus('review')}
              className="text-[9px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              title="Buka kembali review"
            >
              Buka
            </button>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4
        className={`text-xs font-bold leading-snug mb-1.5 ${
          task.status === 'done' ? 'line-through text-zinc-400' : 'text-zinc-100'
        }`}
      >
        {task.title}
      </h4>

      {/* User Story Brief */}
      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mb-2">
        {task.userStory}
      </p>

      {/* Tech Mapping Pills */}
      {task.techMapping && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.techMapping.frontend?.slice(0, 2).map((fe, idx) => (
            <span
              key={idx}
              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-300 border border-blue-500/20 truncate max-w-[110px]"
            >
              {fe}
            </span>
          ))}
          {task.techMapping.backend?.slice(0, 2).map((be, idx) => (
            <span
              key={idx}
              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/20 truncate max-w-[110px]"
            >
              {be}
            </span>
          ))}
          {task.techMapping.database?.slice(0, 1).map((db, idx) => (
            <span
              key={idx}
              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 truncate max-w-[110px]"
            >
              {db}
            </span>
          ))}
        </div>
      )}

      {/* Card Action Row: Salin Prompt Agen & Detail Toggle */}
      <div className="pt-2 border-t border-zinc-800/50 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={onCopyPrompt}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
            isCopied
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-[#ea580c]/15 text-[#ea580c] hover:bg-[#ea580c]/25 border border-[#ea580c]/30'
          }`}
          title="Salin prompt lengkap untuk agen AI"
        >
          {isCopied ? <Check className="h-3 w-3" /> : <Terminal className="h-3 w-3" />}
          <span>{isCopied ? 'Tersalin' : 'Salin Prompt'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleExpand}
          className="text-[10px] text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-0.5 cursor-pointer p-1"
        >
          <span>Detail</span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 space-y-2 text-[11px] text-zinc-300 animate-in fade-in duration-200">
          <div>
            <span className="font-semibold text-zinc-400 block mb-0.5">Prompt Lengkap Agen AI:</span>
            <pre className="p-2 rounded-lg bg-[#09090b] border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {task.agentPrompt}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};