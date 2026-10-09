import { PRDOutput } from '@/types/prd';
import { TEMPLATE_ARCHETYPES } from '@/lib/templates/archetypes';
import { generateDynamicUserFlowSteps, generateArchitectureOverview, generateDatabaseSchemaDictionary, generateCleanCoreFeatures, generateCleanRequirements, generateRichTechStack } from '@/lib/prd-narratives';

export interface StudioOutlineItem {
  id: string;
  number: string;
  title: string;
}

export const STUDIO_OUTLINE_SECTIONS: StudioOutlineItem[] = [
  { id: 'section-overview', number: '1', title: 'Overview' },
  { id: 'section-requirements', number: '2', title: 'Requirements' },
  { id: 'section-features', number: '3', title: 'Core Features' },
  { id: 'section-user-flow', number: '4', title: 'User Flow' },
  { id: 'section-architecture', number: '5', title: 'Architecture' },
  { id: 'section-database', number: '6', title: 'Database Schema' },
  { id: 'section-tech-stack', number: '7', title: 'Tech Stack' },
];

export function resolvePrdTechStack(prd: PRDOutput) {
  const stack = prd.tech_stack;
  const templateId = stack?.templateId || 'starter';
  const archetype = TEMPLATE_ARCHETYPES[templateId] || TEMPLATE_ARCHETYPES['starter'];

  const frontend = stack?.frontend || archetype?.tech?.frontend?.name || 'Next.js 16 (App Router), React 19, Tailwind CSS, TypeScript';
  const backend = stack?.backend || archetype?.tech?.backend?.name || 'Next.js Route Handlers & Server Actions, Validasi Zod';
  const database = stack?.database || archetype?.tech?.database?.name || 'Supabase (PostgreSQL) dengan Row Level Security (RLS)';
  const deployment = stack?.deployment || archetype?.tech?.deployment?.name || 'Docker (VPS / Coolify)';

  let auth = 'Role-Based Access Control (RBAC) & Secure Session';
  if (templateId === 'mobile-app') {
    auth = 'Supabase Auth & Biometric / Secure Keystore Session';
  } else if (templateId === 'ai-service') {
    auth = 'API Key Authentication & JWT Bearer Token Guard';
  }

  // Only include AI Integration if template is explicitly 'ai-service'
  // OR if title/stack explicitly mentions AI/LLM models as distinct whole words
  const aiRegex = /\b(ai|llm|gpt|openai|gemini|claude|deepseek|machine learning|deep learning|artificial intelligence)\b/i;
  const isAiService =
    templateId === 'ai-service' ||
    Boolean(
      aiRegex.test(prd.title || '') ||
      (stack?.name && aiRegex.test(stack.name))
    );

  const aiIntegration = isAiService ? 'Multi-provider LLM API (Google Gemini / OpenRouter)' : null;

  return {
    templateId,
    name: stack?.name || archetype?.title || 'Modern Architecture',
    frontend,
    backend,
    database,
    deployment,
    auth,
    aiIntegration,
  };
}

import { synthesizeDynamicArchitectureDiagrams } from '@/lib/gemini/schemas';

export function generateStudioFullMarkdown(prd: PRDOutput): string {
  const diagrams = synthesizeDynamicArchitectureDiagrams(
    prd.title || 'App',
    prd.archetype_detection,
    prd.feature_breakdown || [],
    prd.architecture_diagrams
  );

  const defaultFlowchart = diagrams.system_flowchart;
  const defaultUserJourney = diagrams.user_journey_flow;
  const defaultERD = diagrams.database_erd;

  let md = `# PRD — ${prd.title || 'Project Requirements Document'}\n\n`;

  // 1. Overview
  md += `## 1. Overview\n\n`;
  if (prd.opportunity_framing?.core_problem) {
    md += `### 1.1 Problem Statement & Konteks Lapangan\n${prd.opportunity_framing.core_problem}\n\n`;
  }
  if (prd.opportunity_framing?.working_hypothesis) {
    md += `### 1.2 Hipotesis Solusi & Alur Kunci\n${prd.opportunity_framing.working_hypothesis}\n\n`;
  }
  if (prd.opportunity_framing?.strategy_fit) {
    md += `### 1.3 Keunggulan Strategis & Keselarasan Solusi\n${prd.opportunity_framing.strategy_fit}\n\n`;
  }
  if (prd.archetype_detection?.target_audience) {
    md += `### 1.4 Target Persona & Pengguna Sistem\n${prd.archetype_detection.target_audience}\n\n`;
  }
  if (prd.success_measurement?.online_metrics) {
    md += `### 1.5 Target Metrik & KPI Produksi\n`;
    md += `- **Metrik Operasional / Online**: ${prd.success_measurement.online_metrics}\n`;
    if (prd.success_measurement.offline_golden_set) {
      md += `- **Validasi Fungsional / Golden Set**: ${prd.success_measurement.offline_golden_set}\n`;
    }
    md += `\n`;
  }

  // 2. Requirements
  const cleanReqs = generateCleanRequirements(prd);
  md += `## 2. Requirements\n\n`;

  md += `### Persyaratan Fungsional\n\n`;
  cleanReqs.functional.forEach((item) => {
    md += `- ${item}\n`;
  });
  md += `\n`;

  md += `### Persyaratan Non-Fungsional\n\n`;
  cleanReqs.nonFunctional.forEach((item) => {
    md += `- ${item}\n`;
  });
  md += `\n`;

  if (cleanReqs.assumptionsAndConstraints.length > 0) {
    md += `### Asumsi & Batasan\n\n`;
    cleanReqs.assumptionsAndConstraints.forEach((item) => {
      md += `- ${item}\n`;
    });
    md += `\n`;
  }

  // 3. Core Features
  const cleanFeatures = generateCleanCoreFeatures(prd);
  md += `## 3. Core Features\n\n`;
  md += `Fitur di bawah ini disusun mengikuti urutan fase pada kerangka fitur yang sudah disetujui.\n\n`;

  cleanFeatures.forEach((phase) => {
    md += `### ${phase.phaseTitle}\n\n`;
    if (phase.moduleSummary) {
      md += `${phase.moduleSummary}\n\n`;
    }
    if (phase.subFeatures && phase.subFeatures.length > 0) {
      phase.subFeatures.forEach((sub) => {
        md += `- **${sub.name}** — ${sub.description}\n`;
      });
      md += `\n`;
    }
  });

  // 4. User Flow
  const userFlowSteps = generateDynamicUserFlowSteps(prd);
  md += `## 4. User Flow\n\n`;
  md += `Alur utama yang akan dilalui pengguna, disusun mengikuti urutan fase:\n\n`;
  userFlowSteps.forEach((s) => {
    md += `${s.step}. **${s.title} (${s.phaseTag})**: ${s.description}\n\n`;
  });

  // 5. Architecture
  const archOverview = generateArchitectureOverview(prd);
  md += `## 5. Architecture\n\n`;
  md += `${archOverview.intro}\n\n`;
  md += `### Gambaran sistem:\n\n`;
  if (archOverview.systemComponentsList && archOverview.systemComponentsList.length > 0) {
    archOverview.systemComponentsList.forEach((item) => {
      md += `- **${item.label}**: ${item.text}\n`;
    });
    md += `\n`;
  } else {
    md += `- **Antarmuka pengguna**: ${archOverview.systemComponents.frontend}\n`;
    md += `- **Logika server**: ${archOverview.systemComponents.backend}\n`;
    md += `- **Basis data**: ${archOverview.systemComponents.database}\n\n`;
  }
  md += `### Diagram alur sistem:\n\n`;
  md += "```mermaid\n" + archOverview.systemFlowchartMermaid + "\n```\n\n";

  // 6. Database Schema
  const schemaDict = generateDatabaseSchemaDictionary(prd);
  md += `## 6. Database Schema\n\n`;
  md += `${schemaDict.intro}\n\n`;

  schemaDict.tables.forEach((t) => {
    md += `### ${t.number}. ${t.name}${t.description ? ` — ${t.description}` : ''}\n\n`;
    md += `| Kolom | Tipe | Kegunaan |\n`;
    md += `| :--- | :--- | :--- |\n`;
    t.columns.forEach((col) => {
      md += `| \`${col.name}\` | \`${col.type}\` | ${col.purpose} |\n`;
    });
    md += `\n`;
  });

  md += `### Diagram hubungan antar tabel (ER):\n\n`;
  md += `\`\`\`mermaid\n${schemaDict.erdDiagram || defaultERD}\n\`\`\`\n\n`;

  // 7. Tech Stack
  const richStack = generateRichTechStack(prd);
  md += `## 7. Tech Stack\n\n`;
  md += `${richStack.intro}\n\n`;
  richStack.items.forEach((item) => {
    if (item.rationale) {
      md += `- **${item.category}:** ${item.name} — ${item.rationale}\n`;
    } else {
      md += `- **${item.category}:** ${item.name}\n`;
    }
  });
  if (richStack.closingNote) {
    md += `\n${richStack.closingNote}\n\n`;
  } else {
    md += `\n`;
  }

  return md;
}

import { getAllTreeModulesWithTasks } from '@/lib/tree-task-generator';

/**
 * Generates actionable TASKS.md for AI Coding Agent or developer checklist,
 * dynamically extracted from the Feature Tree (Pohon Fitur) modules and their engineering tasks.
 */
export function generateStudioTasksMarkdown(
  prd: PRDOutput,
  taskCompletion?: Record<string, boolean>
): string {
  // Check localStorage fallback if in browser
  let completionMap: Record<string, boolean> = taskCompletion || {};
  if (!taskCompletion && typeof window !== 'undefined') {
    try {
      const prdIdentifier = (prd as { id?: string }).id || prd.title || 'default';
      const saved = localStorage.getItem(`ngodingpakeprd_studio_tree_tasks_${prdIdentifier}`);
      if (saved) {
        completionMap = JSON.parse(saved);
      }
    } catch {
      // fallback
    }
  }

  const modulesWithTasks = getAllTreeModulesWithTasks(prd, completionMap);

  let totalTasks = 0;
  let completedTasks = 0;
  modulesWithTasks.forEach((m) => {
    m.tasks.forEach((t) => {
      totalTasks++;
      if (t.completed) completedTasks++;
    });
  });

  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  let md = `# Implementation Tasks & Execution Backlog: ${prd.title}\n\n`;
  md += `> Dokumen rincian tugas koding berfase yang diekstrak langsung secara dinamis dari Pohon Fitur & PRD.\n`;
  md += `> Gunakan checklist ini sebagai panduan eksekusi untuk AI Coding Agent (Claude Code, Cursor, Aider, Devin) atau Software Engineer.\n\n`;

  md += `## Ringkasan Eksekusi Proyek\n`;
  md += `- **Aplikasi:** ${prd.title}\n`;
  md += `- **Total Modul:** ${modulesWithTasks.length} modul terstruktur\n`;
  md += `- **Total Task Koding:** ${totalTasks} tugas teknis\n`;
  md += `- **Status Progres:** ${completedTasks} / ${totalTasks} selesai (${percent}%)\n\n`;
  md += `---\n\n`;

  // Group modules by Phase
  const phasesMap = new Map<string, typeof modulesWithTasks>();
  modulesWithTasks.forEach((m) => {
    const p = m.phaseLabel;
    if (!phasesMap.has(p)) {
      phasesMap.set(p, []);
    }
    phasesMap.get(p)!.push(m);
  });

  phasesMap.forEach((modules, phaseKey) => {
    md += `## [${phaseKey}] Rencana Modul Pengembangan\n\n`;

    modules.forEach((mod) => {
      const node = mod.node;
      const subList = (node.sub_features || [])
        .map((s) => (typeof s === 'string' ? s : (s as { label?: string }).label))
        .filter(Boolean);

      md += `### Modul ${mod.nodeIndex + 1}: ${node.title}\n`;
      if (node.description) {
        md += `- **Deskripsi:** ${node.description}\n`;
      }
      if (subList.length > 0) {
        md += `- **Cakupan Sub-Fitur:**\n`;
        subList.forEach((sub, sIdx) => {
          md += `  ${sIdx + 1}. ${sub}\n`;
        });
      }
      md += `\n`;
      md += `#### Checklist Tugas Koding (Pohon Fitur):\n\n`;

      mod.tasks.forEach((task, tIdx) => {
        const check = task.completed ? 'x' : ' ';
        const taskNum = String(tIdx + 1).padStart(2, '0');
        const codeTag = `[TASK-MOD-${mod.nodeIndex + 1}-${taskNum}]`;

        md += `- [${check}] **${codeTag} ${task.title}** (Prioritas: ${task.priority})\n`;
        md += `  - **Kategori**: ${task.category}\n`;
        if (task.targetFiles && task.targetFiles.length > 0) {
          md += `  - **Target File**: \`${task.targetFiles.join('`, `')}\`\n`;
        }
        if (task.instruction) {
          md += `  - **Instruksi**: ${task.instruction}\n`;
        }
        md += `\n`;
      });
    });
  });

  return md;
}

/**
 * Generates the master CLI prompt for AI Coding Agents (Claude Code, Cursor, Aider, Windsurf).
 */
export function generateAgentMasterPrompt(
  prd: PRDOutput,
  taskCompletion?: Record<string, boolean>
): string {
  const resolvedStack = resolvePrdTechStack(prd);
  const tasksMarkdown = generateStudioTasksMarkdown(prd, taskCompletion);

  return `# MASTER IMPLEMENTATION PROMPT UNTUK AI CODING AGENT

Kamu adalah Principal Software Engineer dan Autonomous Coding Agent berstandar tinggi.
Tugas utamamu adalah mengimplementasikan aplikasi "${prd.title}" secara terstruktur, otonom, dan tuntas mengacu pada spesifikasi teknis dan daftar task berikut.

---

## 1. RINGKASAN PROYEK & TECH STACK
- Judul Proyek: ${prd.title}
- Arsitektur Tech Stack:
  * Frontend: ${resolvedStack.frontend}
  * Backend & API: ${resolvedStack.backend}
  * Database: ${resolvedStack.database}
  * Autentikasi: ${resolvedStack.auth}
  * Deployment: ${resolvedStack.deployment}

---

## 2. ATURAN EKSEKUSI UTAMA (EXECUTION DIRECTIVES)
1. **Eksekusi Bertahap (Phase-by-Phase)**: Kerjakan tugas secara berurutan mulai dari FASE 1 (Fondasi & Arsitektur) sebelum melanjutkan ke modul fungsional berikutnya.
2. **Atomic Verification**: Setiap kali menyelesaikan sebuah modul/task, pastikan kode lulus audit tipe (\`npx tsc --noEmit\`) dan tidak ada broken imports.
3. **Strict Zero-Emoji Policy**: JANGAN gunakan unicode emoji di UI/kode/teks button. Gunakan ikon SVG monokrom (seperti Lucide React).
4. **Data Integrity**: Ikuti skema tabel relasional PostgreSQL dan relasi foreign key yang telah ditentukan.
5. **No Placeholders**: Jangan membuat fungsi mock kosong jika fungsionalitas inti dapat langsung diimplementasikan dengan logika bisnis nyata.

---

## 3. DAFTAR TASK EKSEKUSI (WORK BREAKDOWN STRUCTURE)

${tasksMarkdown}

---

## 4. PERINTAH AWAL EKSEKUSI
Mulai sekarang, bacalah seluruh konteks di atas. Konfirmasikan bahwa kamu memahami struktur proyek, lalu langsung mulai eksekusi dari task checklist pertama yang belum dicentang dan laporkan progres begitu selesai!
`;
}

