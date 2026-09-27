'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { PRDOutput, RoadmapPhaseNode } from '@/types/prd';
import { InteractiveTreeCanvas, TreeCanvasModule } from '@/components/tree/InteractiveTreeCanvas';

interface PhasedFeatureTreeProps {
  prd: PRDOutput;
  theme?: 'dark' | 'light';
  mode?: 'studio' | 'split' | 'standalone';
  isTasksGenerated?: boolean;
  onGenerateTasks?: () => void;
}

const SCHEMA_GARBAGE_KEYS = new Set([
  'status', 'description', 'icon', 'sub_features', 'id', 'label', 'priority', 'children',
]);

function isGarbageString(s: string): boolean {
  return SCHEMA_GARBAGE_KEYS.has(s.trim().toLowerCase());
}

export const PhasedFeatureTree: React.FC<PhasedFeatureTreeProps> = ({
  prd,
  theme = 'dark',
  mode = 'standalone',
  isTasksGenerated = true,
  onGenerateTasks,
}) => {
  const [showTasks, setShowTasks] = useState(true);
  const [taskCompletion, setTaskCompletion] = useState<Record<string, boolean>>({});

  // Derive or use existing roadmap tree nodes
  const nodes: RoadmapPhaseNode[] = useMemo(() => {
    if (prd.roadmap_tree && prd.roadmap_tree.length > 0) {
      const sanitizedTree = prd.roadmap_tree.map((node) => {
        const validSubFeatures = (node.sub_features || []).filter((item) => {
          if (typeof item === 'string') return !isGarbageString(item);
          if (typeof item === 'object' && item !== null) return !isGarbageString(item.label || '');
          return true;
        });

        if (validSubFeatures.length === 0 && prd.feature_breakdown && prd.feature_breakdown.length > 0) {
          const matchingFeat =
            prd.feature_breakdown.find(
              (f) =>
                f.id === node.id ||
                f.name.toLowerCase().includes(node.title.toLowerCase()) ||
                node.title.toLowerCase().includes(f.name.toLowerCase())
            ) || prd.feature_breakdown[0];
          const subItems =
            matchingFeat.happy_path && matchingFeat.happy_path.length > 0
              ? matchingFeat.happy_path.slice(0, 4)
              : matchingFeat.business_rules.slice(0, 4);
          return {
            ...node,
            sub_features:
              subItems.length > 0
                ? subItems
                : [`Tampilan Antarmuka ${node.title}`, `Alur Proses & Validasi`, `Integrasi Data & Status`],
          };
        }

        return {
          ...node,
          sub_features:
            validSubFeatures.length > 0
              ? validSubFeatures
              : [`Tampilan Antarmuka ${node.title}`, `Alur Proses & Validasi`, `Integrasi Data & Status`],
        };
      });

      return sanitizedTree;
    }

    // Fallback generator from feature_breakdown or scope
    const generated: RoadmapPhaseNode[] = [];

    if (prd.feature_breakdown && prd.feature_breakdown.length > 0) {
      const totalFeats = prd.feature_breakdown.length;
      const totalPhases = Math.max(2, Math.min(6, Math.ceil(totalFeats / 2)));

      prd.feature_breakdown.forEach((feat, idx) => {
        const phaseNumber = Math.min(totalPhases, Math.floor((idx / totalFeats) * totalPhases) + 1);
        const phaseLabel = `FASE ${phaseNumber}`;
        const subItems =
          feat.happy_path && feat.happy_path.length > 0
            ? feat.happy_path.slice(0, 4)
            : feat.business_rules.slice(0, 4);

        generated.push({
          id: `feat_node_${feat.id || idx}`,
          title: feat.name,
          phase: phaseLabel,
          status: 'Direncanakan',
          sub_features:
            subItems.length > 0
              ? subItems
              : ['Komponen UI Frontend', 'Rute API Backend', 'Model Data & Validasi'],
        });
      });
    } else {
      // Fallback from scope
      const scopes = prd.boundaries.scope || [];
      const defaultModules =
        scopes.length > 0
          ? scopes
          : [
              'Katalog Produk & Layanan',
              'Pencarian & Filter Kategori',
              'Formulir Pemesanan & Transaksi',
              'Integrasi WhatsApp & Notifikasi',
              'Dashboard Manajemen Admin',
              'Autentikasi & Keamanan',
              'Profil & Pengaturan Sistem',
            ];

      const totalScopes = defaultModules.length;
      const totalPhases = Math.max(2, Math.min(6, Math.ceil(totalScopes / 2)));

      defaultModules.forEach((mod, idx) => {
        const phaseNumber = Math.min(totalPhases, Math.floor((idx / totalScopes) * totalPhases) + 1);
        generated.push({
          id: `scope_node_${idx}`,
          title: mod,
          phase: `FASE ${phaseNumber}`,
          status: 'Direncanakan',
          sub_features: [
            `Tampilan Antarmuka ${mod}`,
            `Validasi Input & Alur Data`,
            `Integrasi Database & Status`,
          ],
        });
      });
    }

    return generated;
  }, [prd.roadmap_tree, prd.feature_breakdown, prd.boundaries.scope]);

function generateModuleCodingTasks(
  node: { id?: string; title: string; phase?: string; sub_features?: (string | { label?: string })[] },
  nIdx: number
): { id: string; title: string; completed: boolean }[] {
  const baseId = node.id || `node-${nIdx}`;
  const title = node.title || `Modul ${nIdx + 1}`;
  const subFeatures = (node.sub_features || [])
    .map((sf) => (typeof sf === 'string' ? sf : sf.label || ''))
    .filter(Boolean);

  const list: { id: string; title: string; completed: boolean }[] = [];

  // 1. Layout UI
  list.push({
    id: `${baseId}-t-layout`,
    title: `Bangun halaman utama & layout navigasi ${title}`,
    completed: false,
  });

  // 2. Specific tasks for each sub-feature
  subFeatures.forEach((sf, sfIdx) => {
    const cleanSf = sf.replace(/^[-*•\d.]+\s*/, '').trim();
    list.push({
      id: `${baseId}-t-sf-${sfIdx + 1}`,
      title: cleanSf.toLowerCase().startsWith('implementasi') || cleanSf.toLowerCase().startsWith('buat') || cleanSf.toLowerCase().startsWith('integrasi')
        ? cleanSf
        : `Implementasi komponen antarmuka & alur ${cleanSf}`,
      completed: false,
    });
  });

  // 3. Form input & validation
  list.push({
    id: `${baseId}-t-form-zod`,
    title: `Buat formulir input interaktif dengan validasi skema Zod untuk ${title}`,
    completed: false,
  });

  // 4. Modal / Drawer actions
  list.push({
    id: `${baseId}-t-modal-actions`,
    title: `Implementasi dialog modal konfirmasi & drawer aksi detail ${title}`,
    completed: false,
  });

  // 5. Backend Server Actions & Route Handlers
  list.push({
    id: `${baseId}-t-api-handler`,
    title: `Buat Server Action & API route handler mutasi data ${title}`,
    completed: false,
  });

  // 6. Database schema & relations
  list.push({
    id: `${baseId}-t-db-schema`,
    title: `Rancang skema tabel database, Foreign Keys & relasi entitas ${title}`,
    completed: false,
  });

  // 7. Security: Row Level Security (RLS)
  list.push({
    id: `${baseId}-t-rls-security`,
    title: `Terapkan kebijakan Row-Level Security (RLS) & proteksi hak akses ${title}`,
    completed: false,
  });

  // 8. Performance index
  list.push({
    id: `${baseId}-t-perf-index`,
    title: `Optimasi query database & penambahan indeks performa untuk ${title}`,
    completed: false,
  });

  // 9. Feedback toast & loading state
  list.push({
    id: `${baseId}-t-feedback-toast`,
    title: `Tambahkan visual feedback, skeleton loading state & toast alert ${title}`,
    completed: false,
  });

  // 10. Error handling & edge cases
  list.push({
    id: `${baseId}-t-error-edge`,
    title: `Implementasi penanganan error alur jaringan & validasi edge cases ${title}`,
    completed: false,
  });

  // 11. Unit & E2E Testing
  list.push({
    id: `${baseId}-t-testing`,
    title: `Tulis unit test & pengujian alur interaksi end-to-end ${title}`,
    completed: false,
  });

  return list;
}

  // Handle task toggle
  const handleToggleTask = useCallback((_modId: string, taskId: string) => {
    setTaskCompletion((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  }, []);

  // Map to TreeCanvasModule
  const canvasModules: TreeCanvasModule[] = useMemo(() => {
    return nodes.map((node, nIdx) => {
      const generatedTasks = isTasksGenerated ? generateModuleCodingTasks(node, nIdx) : [];

      return {
        id: node.id || `node-${nIdx}`,
        name: node.title,
        phase: node.phase,
        complexity: 'Sedang' as const,
        description: `Spesifikasi alur dan fungsionalitas modul ${node.title}.`,
        enabled: true,
        subFeatures: (node.sub_features || []).map((sf) =>
          typeof sf === 'string' ? sf : sf.label || ''
        ),
        tasks: generatedTasks.map((t) => ({
          id: t.id,
          title: t.title,
          completed: taskCompletion[t.id] ?? false,
        })),
      };
    });
  }, [nodes, taskCompletion, isTasksGenerated]);

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl bg-[#090b10]">
      <InteractiveTreeCanvas
        title={prd.title || 'Pohon Fitur Berfase'}
        subtitle={prd.opportunity_framing?.working_hypothesis || 'Peta jalan pengembangan terstruktur'}
        techStackLabel={prd.architecture_diagrams?.system_flowchart ? 'Living Spec' : 'Next.js 16 + Supabase'}
        modules={canvasModules}
        mode={mode}
        theme={theme}
        showTasks={showTasks}
        onToggleShowTasks={() => setShowTasks(!showTasks)}
        onToggleTask={handleToggleTask}
        onGenerateTasks={onGenerateTasks}
      />
    </div>
  );
};
