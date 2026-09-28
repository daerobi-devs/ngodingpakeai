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

/**
 * Generates actionable TASKS.md for AI Coding Agent or developer checklist.
 */
export function generateStudioTasksMarkdown(prd: PRDOutput): string {
  let md = `# Implementation Tasks & Execution Backlog: ${prd.title}\n\n`;
  md += `> Dokumen rincian tugas koding berfase yang diekstrak dari Pohon Fitur & PRD.\n`;
  md += `> Gunakan checklist ini sebagai panduan eksekusi untuk AI Coding Agent (Claude Code, Cursor, Aider, Devin) atau Software Engineer.\n\n`;

  // 1. Fondasi & Arsitektur
  md += `## FASE 1: Fondasi & Arsitektur Sistem (P0)\n\n`;
  md += `- [ ] **[TASK-FOUNDATION-01] Inisialisasi Project, Design Tokens & Shell Layout** (Prioritas: P0)\n`;
  md += `  - **User Story**: Membangun kerangka dasar aplikasi ${prd.title}, navigasi responsif, layout header-footer, dan mock data interaktif.\n`;
  md += `  - **Target Komponen**: \`App Router Layout\`, \`Navigation Shell\`, \`Theme Provider\`, \`UI Design System\`\n\n`;

  md += `- [ ] **[TASK-DB-01] Skema Database, Relasi, Indeks & RLS Policies** (Prioritas: P0)\n`;
  md += `  - **User Story**: Merancang tabel relasional PostgreSQL di Supabase lengkap dengan Row-Level Security dan indeks performa mengacu pada skema PRD.\n`;
  md += `  - **Target Entitas**: Tabel relasional sesuai spesifikasi PRD\n\n`;

  md += `- [ ] **[TASK-AUTH-01] Sistem Autentikasi Pengguna & Route Guards** (Prioritas: P0)\n`;
  md += `  - **User Story**: Menyediakan alur login/register, sinkronisasi profil pengguna, dan proteksi rute middleware server-side.\n`;
  md += `  - **Target Komponen**: \`Auth Modal / Page\`, \`Session Verifier\`, \`Auth Middleware Route Guard\`\n\n`;

  // 2. Modul Berfase & Sub-Fitur
  if (prd.roadmap_tree && prd.roadmap_tree.length > 0) {
    prd.roadmap_tree.forEach((node, nodeIdx) => {
      const phaseLabel = node.phase || (nodeIdx < 2 ? 'FASE 1' : nodeIdx < 4 ? 'FASE 2' : 'FASE 3');
      const phasePriority = phaseLabel.includes('1') ? 'P0' : 'P1';
      const nodeSlug = node.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `mod-${nodeIdx + 1}`;
      const subList = (node.sub_features || []).map((s) => (typeof s === 'string' ? s : s.label)).filter(Boolean);

      md += `## [${phaseLabel}] Modul ${nodeIdx + 1}: ${node.title}\n\n`;
      md += `- [ ] **[TASK-MOD-${nodeIdx + 1}] Arsitektur & Shell Modul: ${node.title}** (Prioritas: ${phasePriority})\n`;
      md += `  - **Deskripsi**: ${node.description || `Membangun alur utama modul ${node.title} untuk aplikasi ${prd.title}.`}\n`;
      md += `  - **Komponen Target**: \`components/${nodeSlug}/MainView.tsx\`, \`/api/${nodeSlug}\`\n\n`;

      if (subList.length > 0) {
        subList.forEach((subTitle, sIdx) => {
          const cleanSub = subTitle.replace(/^[-*•\d.]+\s*/, '').trim();
          const subSlug = cleanSub.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 25) || `sub-${sIdx + 1}`;
          md += `- [ ] **[TASK-SUB-${nodeIdx + 1}.${sIdx + 1}] Sub-Fitur: ${cleanSub}** (Prioritas: ${phasePriority})\n`;
          md += `  - **User Story**: Mengimplementasikan antarmuka dan alur bisnis "${cleanSub}" pada modul ${node.title}.\n`;
          md += `  - **File Target**: \`components/${nodeSlug}/${subSlug}.tsx\` & \`/api/${nodeSlug}/${subSlug}\`\n\n`;
        });
      }
    });
  } else if (prd.feature_breakdown && prd.feature_breakdown.length > 0) {
    prd.feature_breakdown.forEach((feat, idx) => {
      const p = feat.priority || (idx < 2 ? 'P0' : 'P1');
      md += `## Fitur Inti ${idx + 1}: ${feat.name} (${p})\n\n`;
      md += `- [ ] **[TASK-FEAT-${idx + 1}] Implementasi Menyeluruh: ${feat.name}**\n`;
      md += `  - **User Story**: ${feat.user_story}\n`;
      if (feat.tech_mapping?.frontend_components) {
        md += `  - **Frontend**: \`${feat.tech_mapping.frontend_components.join('`, `')}\`\n`;
      }
      if (feat.tech_mapping?.api_endpoints) {
        md += `  - **API**: \`${feat.tech_mapping.api_endpoints.join('`, `')}\`\n`;
      }
      md += `\n`;
    });
  }

  // 3. Integrasi & Resiliensi
  md += `## FASE KESIAPAN: Integrasi, Resiliensi & Kesiapan Produksi (P1)\n\n`;
  md += `- [ ] **[TASK-API-01] Pembangunan Route Handlers, Safe Actions & Validasi Skema Zod** (Prioritas: P1)\n`;
  md += `  - **Target**: Next.js Route Handlers, Zod Input Schema, dan middleware rate limiting.\n\n`;

  md += `- [ ] **[TASK-EXT-01] Integrasi Transaksional & Webhook Gateway** (Prioritas: P1)\n`;
  md += `  - **Target**: Webhook Handler, Signature Verifier, dan antrean event atomik.\n\n`;

  md += `- [ ] **[TASK-RESILIENCE-01] Penanganan Edge Cases, Error Boundaries & Fallback UI** (Prioritas: P1)\n`;
  md += `  - **Target**: Global Error Boundary, Not-Found Page, dan Skeleton Shimmer Loading.\n\n`;

  md += `- [ ] **[TASK-PROD-01] Audit Kualitas Kode, Type Checking, E2E Verification & Kesiapan Rilis** (Prioritas: P1)\n`;
  md += `  - **Target**: Verifikasi \`npx tsc --noEmit\`, build kompilasi produksi sukses, dan SEO meta tags.\n`;

  return md;
}

/**
 * Generates the master CLI prompt for AI Coding Agents (Claude Code, Cursor, Aider, Windsurf).
 */
export function generateAgentMasterPrompt(prd: PRDOutput): string {
  const resolvedStack = resolvePrdTechStack(prd);
  const tasksMarkdown = generateStudioTasksMarkdown(prd);

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
Mulai sekarang, bacalah seluruh konteks di atas. Konfirmasikan bahwa kamu memahami struktur proyek, lalu langsung mulai eksekusi [TASK-FOUNDATION-01] dan laporkan progres begitu selesai!
`;
}
