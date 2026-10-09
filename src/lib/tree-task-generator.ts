import type { PRDOutput, RoadmapPhaseNode, SubFeatureNode } from '@/types/prd';

const SCHEMA_GARBAGE_KEYS = new Set([
  'status',
  'description',
  'icon',
  'sub_features',
  'id',
  'label',
  'priority',
  'children',
]);

export function isGarbageString(s: string): boolean {
  return SCHEMA_GARBAGE_KEYS.has(s.trim().toLowerCase());
}

export interface TreeModuleTask {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  priority: 'P0' | 'P1' | 'P2';
  targetFiles: string[];
  instruction: string;
}

export interface ModuleWithTreeTasks {
  node: RoadmapPhaseNode;
  nodeIndex: number;
  phaseLabel: string;
  tasks: TreeModuleTask[];
}

/**
 * Extracts and sanitizes roadmap tree nodes from PRDOutput,
 * ensuring robust fallback to feature_breakdown or boundaries.scope.
 */
export function getSanitizedTreeNodes(prd: PRDOutput): RoadmapPhaseNode[] {
  if (prd.roadmap_tree && prd.roadmap_tree.length > 0) {
    const sanitizedTree = prd.roadmap_tree.map((node, nodeIdx) => {
      const validSubFeatures = (node.sub_features || []).filter((item) => {
        if (typeof item === 'string') return !isGarbageString(item);
        if (typeof item === 'object' && item !== null) return !isGarbageString((item as SubFeatureNode).label || '');
        return true;
      });

      if (validSubFeatures.length === 0 && prd.feature_breakdown && prd.feature_breakdown.length > 0) {
        const matchingFeat =
          prd.feature_breakdown.find(
            (f) =>
              f.id === node.id ||
              f.name.toLowerCase().includes(node.title.toLowerCase()) ||
              node.title.toLowerCase().includes(f.name.toLowerCase())
          ) || prd.feature_breakdown[nodeIdx % prd.feature_breakdown.length];

        const subItems =
          matchingFeat?.happy_path && matchingFeat.happy_path.length > 0
            ? matchingFeat.happy_path.slice(0, 4)
            : matchingFeat?.business_rules && matchingFeat.business_rules.length > 0
            ? matchingFeat.business_rules.slice(0, 4)
            : [];

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
          : feat.business_rules && feat.business_rules.length > 0
          ? feat.business_rules.slice(0, 4)
          : [];

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
    const scopes = prd.boundaries?.scope || [];
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
}

/**
 * Generates the full set of 11-14 dynamic coding tasks for a specific roadmap module node,
 * matching the exact tasks displayed on the Feature Tree interactive canvas.
 */
export function generateModuleCodingTasks(
  node: {
    id?: string;
    title: string;
    phase?: string;
    sub_features?: (string | { label?: string; priority?: string })[];
  },
  nIdx: number,
  completionMap?: Record<string, boolean>
): TreeModuleTask[] {
  const baseId = node.id || `node-${nIdx}`;
  const title = node.title || `Modul ${nIdx + 1}`;
  const nodeSlug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `mod-${nIdx + 1}`;
  const rawPhase = node.phase || (nIdx < 2 ? 'FASE 1' : nIdx < 4 ? 'FASE 2' : 'FASE 3');
  const phasePriority: 'P0' | 'P1' | 'P2' = rawPhase.includes('1') ? 'P0' : 'P1';

  const subFeatures = (node.sub_features || [])
    .map((sf) => (typeof sf === 'string' ? sf : (sf as { label?: string }).label || ''))
    .filter(Boolean);

  const list: TreeModuleTask[] = [];

  // 1. Layout UI
  const idLayout = `${baseId}-t-layout`;
  list.push({
    id: idLayout,
    title: `Bangun halaman utama & layout navigasi ${title}`,
    completed: !!completionMap?.[idLayout],
    category: 'UI Layout & Shell Navigasi',
    priority: phasePriority,
    targetFiles: [`src/components/${nodeSlug}/${nodeSlug}-view.tsx`, `src/app/${nodeSlug}/page.tsx`],
    instruction: `Buat kerangka antarmuka responsif, header breadcrumb, dan layout navigasi terstruktur untuk ${title}.`,
  });

  // 2. Specific tasks for each sub-feature
  subFeatures.forEach((sf, sfIdx) => {
    const cleanSf = sf.replace(/^[-*•\d.]+\s*/, '').trim();
    const subSlug = cleanSf.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 25) || `sub-${sfIdx + 1}`;
    const idSf = `${baseId}-t-sf-${sfIdx + 1}`;
    const sfTitle =
      cleanSf.toLowerCase().startsWith('implementasi') ||
      cleanSf.toLowerCase().startsWith('buat') ||
      cleanSf.toLowerCase().startsWith('integrasi')
        ? cleanSf
        : `Implementasi komponen antarmuka & alur ${cleanSf}`;

    list.push({
      id: idSf,
      title: sfTitle,
      completed: !!completionMap?.[idSf],
      category: 'Komponen Sub-Fitur',
      priority: phasePriority,
      targetFiles: [`src/components/${nodeSlug}/${subSlug}.tsx`],
      instruction: `Implementasi komponen antarmuka mandiri dan alur interaksi pengguna untuk "${cleanSf}".`,
    });
  });

  // 3. Form input & validation with Zod
  const idForm = `${baseId}-t-form-zod`;
  list.push({
    id: idForm,
    title: `Buat formulir input interaktif dengan validasi skema Zod untuk ${title}`,
    completed: !!completionMap?.[idForm],
    category: 'Formulir & Validasi Zod',
    priority: phasePriority,
    targetFiles: [`src/lib/validations/${nodeSlug}.schema.ts`, `src/components/${nodeSlug}/${nodeSlug}-form.tsx`],
    instruction: `Susun skema validasi tipe aman Zod dan implementasikan form interaktif dengan umpan balik pesan validasi.`,
  });

  // 4. Modal / Drawer actions
  const idModal = `${baseId}-t-modal-actions`;
  list.push({
    id: idModal,
    title: `Implementasi dialog modal konfirmasi & drawer aksi detail ${title}`,
    completed: !!completionMap?.[idModal],
    category: 'Modal & Dialog Interaktif',
    priority: phasePriority,
    targetFiles: [`src/components/${nodeSlug}/${nodeSlug}-modal.tsx`],
    instruction: `Sediakan dialog konfirmasi aksi destruktif serta drawer inspeksi detail data ${title}.`,
  });

  // 5. Backend Server Actions & Route Handlers
  const idApi = `${baseId}-t-api-handler`;
  list.push({
    id: idApi,
    title: `Buat Server Action & API route handler mutasi data ${title}`,
    completed: !!completionMap?.[idApi],
    category: 'Server Actions & Route Handlers',
    priority: phasePriority,
    targetFiles: [`src/actions/${nodeSlug}-actions.ts`, `src/app/api/${nodeSlug}/route.ts`],
    instruction: `Bangun Server Actions atau API Route Handler dengan proteksi autentikasi, verifikasi input, dan sanitasi payload.`,
  });

  // 6. Database schema & relations
  const idDb = `${baseId}-t-db-schema`;
  list.push({
    id: idDb,
    title: `Rancang skema tabel database, Foreign Keys & relasi entitas ${title}`,
    completed: !!completionMap?.[idDb],
    category: 'Skema Relasional Database',
    priority: phasePriority,
    targetFiles: [`supabase/migrations/*_${nodeSlug.replace(/-/g, '_')}.sql`, `src/types/${nodeSlug}.types.ts`],
    instruction: `Rancang tabel PostgreSQL dengan Primary Key UUID, Foreign Keys, audit timestamp (created_at, updated_at).`,
  });

  // 7. Security: Row Level Security (RLS)
  const idRls = `${baseId}-t-rls-security`;
  list.push({
    id: idRls,
    title: `Terapkan kebijakan Row-Level Security (RLS) & proteksi hak akses ${title}`,
    completed: !!completionMap?.[idRls],
    category: 'Keamanan & Akses RLS',
    priority: phasePriority,
    targetFiles: [`supabase/migrations/*_${nodeSlug.replace(/-/g, '_')}_rls.sql`],
    instruction: `Aktifkan ALTER TABLE ENABLE ROW LEVEL SECURITY dan tambahkan policy terisolasi per user_id/role.`,
  });

  // 8. Performance index & query optimization
  const idPerf = `${baseId}-t-perf-index`;
  list.push({
    id: idPerf,
    title: `Optimasi query database & penambahan indeks performa untuk ${title}`,
    completed: !!completionMap?.[idPerf],
    category: 'Optimasi Indeks & Performa',
    priority: 'P1',
    targetFiles: [`supabase/migrations/*_${nodeSlug.replace(/-/g, '_')}_indexes.sql`],
    instruction: `Buat index B-Tree pada foreign key dan kolom filter/pencarian utama untuk mempercepat waktu respons query.`,
  });

  // 9. Feedback toast & loading state
  const idToast = `${baseId}-t-feedback-toast`;
  list.push({
    id: idToast,
    title: `Tambahkan visual feedback, skeleton loading state & toast alert ${title}`,
    completed: !!completionMap?.[idToast],
    category: 'State Loading & Feedback UX',
    priority: 'P1',
    targetFiles: [`src/components/${nodeSlug}/${nodeSlug}-skeleton.tsx`],
    instruction: `Sediakan skeleton placeholder saat data memuat dan notifikasi toast sukses/gagal untuk meningkatkan UX.`,
  });

  // 10. Error handling & edge cases
  const idError = `${baseId}-t-error-edge`;
  list.push({
    id: idError,
    title: `Implementasi penanganan error alur jaringan & validasi edge cases ${title}`,
    completed: !!completionMap?.[idError],
    category: 'Resiliensi & Penanganan Error',
    priority: 'P1',
    targetFiles: [`src/components/${nodeSlug}/error.tsx`],
    instruction: `Bangun boundary error lokal, empty state informatif saat data nol, dan penanganan timeout jaringan.`,
  });

  // 11. Unit & E2E Testing
  const idTesting = `${baseId}-t-testing`;
  list.push({
    id: idTesting,
    title: `Tulis unit test & pengujian alur interaksi end-to-end ${title}`,
    completed: !!completionMap?.[idTesting],
    category: 'Pengujian Otomatis (Test)',
    priority: 'P2',
    targetFiles: [`src/components/${nodeSlug}/__tests__/${nodeSlug}.test.tsx`],
    instruction: `Tulis pengujian unit komponen dan simulasi flow kritis pengisian data hingga sukses disimpan.`,
  });

  return list;
}

/**
 * Returns all modules and their respective dynamic coding tasks derived from the PRD Feature Tree.
 */
export function getAllTreeModulesWithTasks(
  prd: PRDOutput,
  completionMap?: Record<string, boolean>
): ModuleWithTreeTasks[] {
  const nodes = getSanitizedTreeNodes(prd);
  return nodes.map((node, nodeIndex) => {
    const phaseLabel = node.phase || (nodeIndex < 2 ? 'FASE 1' : nodeIndex < 4 ? 'FASE 2' : 'FASE 3');
    const tasks = generateModuleCodingTasks(node, nodeIndex, completionMap);
    return {
      node,
      nodeIndex,
      phaseLabel,
      tasks,
    };
  });
}
