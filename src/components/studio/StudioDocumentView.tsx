'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PRDOutput } from '@/types/prd';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { resolvePrdTechStack } from './studio-markdown';
import { synthesizeDynamicArchitectureDiagrams } from '@/lib/gemini/schemas';
import { generateDynamicUserFlowSteps, generateArchitectureOverview, generateDatabaseSchemaDictionary, generateCleanCoreFeatures, generateCleanRequirements, generateRichTechStack } from '@/lib/prd-narratives';
import { Copy, Check, Terminal, Shield, Zap, Target, Layers, Database, Code2, FolderTree, ArrowRight, ListTodo, Kanban, Loader2 } from 'lucide-react';

interface StudioDocumentViewProps {
  prd: PRDOutput;
  fullMarkdown: string;
  viewMode: 'preview' | 'raw';
  theme?: 'dark' | 'light';
  onUpdateDiagrams?: (diagrams: any) => void;
  apiKeyHeader?: string;
  onOpenTree?: () => void;
  onBikinTask?: () => void;
  hasGeneratedTasks?: boolean;
  isGeneratingTasks?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
  isNewlyGenerated?: boolean;
  onFinishTyping?: () => void;
}

function cleanLeadText(text: string, prefixes: string[] = []): string {
  if (!text) return '';
  let cleaned = text.trim();
  const allPrefixes = [
    ...prefixes,
    'masalah yang diselesaikan:',
    'masalah yang diselesaikan',
    'masalah yang dihadapi:',
    'problem statement:',
    'masalah:',
    'tujuan aplikasi:',
    'tujuan aplikasi',
    'tujuan produk:',
    'tujuan:',
    'working hypothesis:',
    'hipotesis:',
    'keunggulan strategis:',
    'tujuan akhirnya:',
    'keselarasan strategi:',
  ];
  for (const p of allPrefixes) {
    if (cleaned.toLowerCase().startsWith(p.toLowerCase())) {
      cleaned = cleaned.slice(p.length).replace(/^[:\s\-—]+/, '').trim();
      break;
    }
  }
  return cleaned;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'module';
}

export const StudioDocumentView: React.FC<StudioDocumentViewProps> = ({
  prd,
  fullMarkdown,
  viewMode,
  theme = 'dark',
  onUpdateDiagrams,
  apiKeyHeader = '',
  onOpenTree,
  onBikinTask,
  hasGeneratedTasks = false,
  isGeneratingTasks = false,
  isLoading = false,
  loadingMessage = 'Menganalisis ide dan menyusun PRD...',
  isNewlyGenerated = false,
  onFinishTyping,
}) => {
  const isLight = theme === 'light';
  const resolvedStack = resolvePrdTechStack(prd);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const userFlowSteps = useMemo(() => generateDynamicUserFlowSteps(prd), [prd]);
  const archOverview = useMemo(() => generateArchitectureOverview(prd), [prd]);
  const schemaDict = useMemo(() => generateDatabaseSchemaDictionary(prd), [prd]);
  const cleanFeatures = useMemo(() => generateCleanCoreFeatures(prd), [prd]);
  const cleanReqs = useMemo(() => generateCleanRequirements(prd), [prd]);
  const richTechStack = useMemo(() => generateRichTechStack(prd), [prd]);

  const coreProblemText = useMemo(() => cleanLeadText(prd.opportunity_framing?.core_problem || '', ['masalah yang diselesaikan', 'problem statement']), [prd]);
  const workingHypothesisText = useMemo(() => cleanLeadText(prd.opportunity_framing?.working_hypothesis || '', ['tujuan aplikasi', 'working hypothesis']), [prd]);
  const strategyFitText = useMemo(() => cleanLeadText(prd.opportunity_framing?.strategy_fit || '', ['tujuan akhirnya', 'strategy fit']), [prd]);
  const scopeBullets = useMemo(() => Array.isArray(prd.boundaries?.scope) ? prd.boundaries.scope.slice(0, 5) : [], [prd]);

  useEffect(() => {
    if (onFinishTyping) onFinishTyping();
  }, [onFinishTyping]);

  const [diagramsState, setDiagramsState] = useState(() =>
    synthesizeDynamicArchitectureDiagrams(
      prd.title || 'App',
      prd.archetype_detection,
      prd.feature_breakdown || [],
      prd.architecture_diagrams
    )
  );

  useEffect(() => {
    setDiagramsState(
      synthesizeDynamicArchitectureDiagrams(
        prd.title || 'App',
        prd.archetype_detection,
        prd.feature_breakdown || [],
        prd.architecture_diagrams
      )
    );
  }, [prd]);

  const handleCopyPrompt = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch {
      // fallback
    }
  };

  const defaultFlowchart = diagramsState.system_flowchart;
  const defaultUserJourney = diagramsState.user_journey_flow;
  const defaultERD = diagramsState.database_erd;
  const defaultSql = diagramsState.sql_migration_script || prd.sql_migration_script || '';

  const handleCopySql = () => {
    const sqlToCopy = schemaDict.rawSqlMigration || defaultSql;
    if (!sqlToCopy) return;
    try {
      navigator.clipboard.writeText(sqlToCopy);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      // fallback
    }
  };

  if (viewMode === 'raw') {
    return (
      <div className="w-full max-w-4xl mx-auto py-6">
        <div
          className={`rounded-xl border p-4 font-mono text-xs leading-relaxed overflow-x-auto select-text ${
            isLight
              ? 'border-zinc-300 bg-white text-zinc-900 shadow-sm'
              : 'border-zinc-800 bg-[#0b0f17] text-zinc-300 shadow-xl'
          }`}
        >
          <pre className="whitespace-pre-wrap">{fullMarkdown}</pre>
        </div>
      </div>
    );
  }

  {/* SKELETON / LOADING STATE MATCHING IMAGE 3 */}
  if (isLoading) {
    return (
      <article
        className={`w-full max-w-4xl mx-auto py-6 px-2 sm:px-6 transition-colors duration-200 select-none ${
          isLight ? 'text-zinc-900' : 'text-zinc-300'
        }`}
      >
        {/* Breadcrumb matching Image 3: ngodingpakeprd · [Project Title] / Dokumen PRD */}
        <div className="text-xs text-zinc-500 font-medium mb-3 flex items-center gap-1.5 select-none">
          <span className="text-zinc-400">ngodingpakeprd</span>
          <span>·</span>
          <span className="text-zinc-300 font-semibold truncate max-w-xs">{prd.title || 'Proyek Baru'}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-amber-500">Dokumen PRD</span>
        </div>

        {/* Status Pill with Spinner matching Image 3 */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-400 mb-8 animate-pulse shadow-lg">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span>{loadingMessage}</span>
        </div>

        {/* Shimmering Document Skeleton matching Image 3 */}
        <div className="space-y-8 animate-pulse select-none pointer-events-none">
          {/* Main Title placeholder */}
          <div className="h-9 w-3/4 sm:w-1/2 bg-zinc-800/80 rounded-xl" />

          {/* Section 1: Overview Skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-36 bg-zinc-800/70 rounded-lg" />
            <div className="space-y-2.5">
              <div className="h-4 w-full bg-zinc-800/50 rounded-md" />
              <div className="h-4 w-11/12 bg-zinc-800/50 rounded-md" />
              <div className="h-4 w-4/5 bg-zinc-800/50 rounded-md" />
            </div>
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <div className="h-3.5 w-3/4 bg-zinc-800/40 rounded-md" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <div className="h-3.5 w-4/5 bg-zinc-800/40 rounded-md" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <div className="h-3.5 w-2/3 bg-zinc-800/40 rounded-md" />
              </div>
            </div>
            <div className="h-4 w-5/6 bg-zinc-800/50 rounded-md mt-3" />
          </div>

          {/* Section 2: Requirements Skeleton */}
          <div className="space-y-4 pt-4 border-t border-zinc-800/60">
            <div className="h-6 w-44 bg-zinc-800/70 rounded-lg" />
            <div className="space-y-2.5">
              <div className="h-4 w-full bg-zinc-800/50 rounded-md" />
              <div className="h-4 w-5/6 bg-zinc-800/50 rounded-md" />
            </div>
          </div>

          {/* Section 3: Architecture Canvas Skeleton */}
          <div className="space-y-4 pt-4 border-t border-zinc-800/60">
            <div className="h-6 w-52 bg-zinc-800/70 rounded-lg" />
            <div className="h-44 w-full rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-900/30 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
              <div className="w-5 h-5 border-2 border-zinc-600 border-t-amber-400 rounded-full animate-spin" />
              <span>Merancang Diagram Arsitektur &amp; Relasi Database...</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`w-full max-w-4xl mx-auto py-6 px-2 sm:px-6 transition-colors duration-200 select-text leading-relaxed relative ${
        isLight ? 'text-zinc-900' : 'text-zinc-300'
      }`}
    >
      {/* Breadcrumb matching Image 2 / Image 3 */}
      <div className="text-xs text-zinc-500 font-medium mb-3 flex items-center gap-1.5 select-none">
        <span className="text-zinc-400">ngodingpakeprd</span>
        <span>·</span>
        <span className="text-zinc-300 font-semibold truncate max-w-xs">{prd.title || 'Proyek'}</span>
        <span className="text-zinc-600">/</span>
        <span className="text-amber-500">Dokumen PRD</span>
      </div>

      {/* 1. Main Document Title matching video: PRD — Project Requirements Document */}
      <h1
        className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-8 ${
          isLight ? 'text-zinc-950' : 'text-white'
        }`}
      >
        PRD — {prd.title || 'Project Requirements Document'}
      </h1>

      {/* 1. Overview */}
      <section id="section-overview" className="scroll-mt-20 mb-12">
        <h2
          className={`text-xl sm:text-2xl font-bold tracking-tight mb-5 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          1. Overview
        </h2>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          {/* Masalah yang diselesaikan */}
          {coreProblemText && (
            <p className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
              <strong className={`font-semibold ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                Masalah yang diselesaikan
              </strong>{' '}
              {coreProblemText}
            </p>
          )}

          {/* Tujuan aplikasi */}
          {workingHypothesisText && (
            <div>
              <p className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                <strong className={`font-semibold ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                  Tujuan aplikasi
                </strong>{' '}
                {workingHypothesisText}
              </p>

              {/* Bullet points jika ada lingkup MVP */}
              {scopeBullets.length > 0 && (
                <ul className="mt-3 space-y-1.5 pl-5 list-disc text-sm sm:text-base">
                  {scopeBullets.map((sc, scIdx) => (
                    <li key={scIdx} className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                      {sc.replace(/^[-*•\d.]+\s*/, '').replace(/^\[REQ-\d+\]\s*/i, '')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Tujuan akhirnya / Strategy Fit */}
          {strategyFitText && (
            <p className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
              <strong className={`font-semibold ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                Tujuan akhirnya:
              </strong>{' '}
              {strategyFitText}
            </p>
          )}

          {/* Target Persona & Metrik dalam strip minimalis halus */}
          {(prd.archetype_detection?.target_audience || prd.success_measurement?.online_metrics) && (
            <div className={`pt-4 border-t text-xs sm:text-sm space-y-1.5 ${
              isLight ? 'border-zinc-200 text-zinc-600' : 'border-zinc-800/80 text-zinc-400'
            }`}>
              {prd.archetype_detection?.target_audience && (
                <p>
                  <strong className={isLight ? 'text-zinc-900' : 'text-zinc-200'}>Target Persona:</strong>{' '}
                  {prd.archetype_detection.target_audience}
                </p>
              )}
              {prd.success_measurement?.online_metrics && (
                <p>
                  <strong className={isLight ? 'text-zinc-900' : 'text-zinc-200'}>Target Metrik &amp; KPI:</strong>{' '}
                  {prd.success_measurement.online_metrics}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. Requirements */}
      <section id="section-requirements" className="scroll-mt-20 mb-12">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight mb-5 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          2. Requirements
        </h2>

        {/* Persyaratan Fungsional */}
        <div className="mb-6">
          <h3 className={`text-base font-semibold mb-3 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
            Persyaratan Fungsional
          </h3>
          <ul className="space-y-2 text-sm leading-relaxed pl-5 list-disc">
            {cleanReqs.functional.map((item, idx) => (
              <li key={idx} className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Persyaratan Non-Fungsional */}
        <div className="mb-6">
          <h3 className={`text-base font-semibold mb-3 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
            Persyaratan Non-Fungsional
          </h3>
          <ul className="space-y-2 text-sm leading-relaxed pl-5 list-disc">
            {cleanReqs.nonFunctional.map((item, idx) => (
              <li key={idx} className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Asumsi & Batasan */}
        {cleanReqs.assumptionsAndConstraints.length > 0 && (
          <div>
            <h3 className={`text-base font-semibold mb-3 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
              Asumsi &amp; Batasan
            </h3>
            <ul className="space-y-2 text-sm leading-relaxed pl-5 list-disc">
              {cleanReqs.assumptionsAndConstraints.map((item, idx) => (
                <li key={idx} className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 3. Core Features */}
      <section id="section-features" className="scroll-mt-20 mb-12">
        <div className="flex items-center justify-between mb-2">
          <h2
            className={`text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2 ${
              isLight ? 'text-zinc-950' : 'text-white'
            }`}
          >
            <Zap className="w-5 h-5 text-amber-400" />
            <span>3. Core Features</span>
          </h2>
          {onOpenTree && (
            <button
              type="button"
              onClick={onOpenTree}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isLight
                  ? 'border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                  : 'border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
              title="Buka Pohon Fitur Interaktif"
            >
              <FolderTree className="h-3.5 w-3.5 text-amber-400" />
              <span>Pohon Fitur</span>
            </button>
          )}
        </div>

        <p className={`text-sm mb-6 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          Fitur di bawah ini disusun mengikuti urutan fase pada kerangka fitur yang sudah disetujui.
        </p>

        <div className="space-y-8">
          {cleanFeatures.map((phase, idx) => (
            <div
              key={phase.id || idx}
              id={`feature-module-${phase.id || idx}`}
              className="scroll-mt-24 space-y-3"
            >
              <h3
                className={`text-base font-bold tracking-tight ${
                  isLight ? 'text-zinc-900' : 'text-white'
                }`}
              >
                {phase.phaseTitle}
              </h3>

              {phase.moduleSummary && (
                <p className={`text-sm leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  {phase.moduleSummary}
                </p>
              )}

              {phase.subFeatures && phase.subFeatures.length > 0 && (
                <ul className="space-y-2 text-sm list-disc pl-5">
                  {phase.subFeatures.map((sub, sIdx) => (
                    <li key={sIdx} className="leading-relaxed pl-1">
                      <strong className={isLight ? 'text-zinc-900 font-semibold' : 'text-white font-semibold'}>
                        {sub.name}
                      </strong>
                      <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                        {' '}— {sub.description}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. User Flow */}
      <section id="section-user-flow" className="scroll-mt-20 mb-10">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight mb-2 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          4. User Flow
        </h2>
        <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
          Alur utama yang akan dilalui pengguna, disusun mengikuti urutan fase:
        </p>

        <ol className="space-y-4 text-sm text-zinc-300 list-decimal pl-5">
          {userFlowSteps.map((s) => (
            <li key={s.step} className="leading-relaxed pl-1">
              <strong className="text-white font-semibold">
                {s.title} ({s.phaseTag}):
              </strong>{' '}
              <span className="text-zinc-300">{s.description}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. Architecture */}
      <section id="section-architecture" className="scroll-mt-20 mb-10">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight mb-4 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          5. Architecture
        </h2>

        {/* Narrative Intro */}
        <p className="text-sm text-zinc-300 leading-relaxed mb-6">
          {archOverview.intro}
        </p>

        {/* Gambaran Sistem */}
        <div className="mb-6 space-y-2.5">
          <h3 className="text-sm font-bold text-white mb-2">Gambaran sistem:</h3>
          <ul className="space-y-2 text-sm text-zinc-300 list-disc pl-5">
            {archOverview.systemComponentsList && archOverview.systemComponentsList.length > 0 ? (
              archOverview.systemComponentsList.map((item, idx) => (
                <li key={idx}>
                  <strong className="text-white font-semibold">{item.label}:</strong>{' '}
                  {item.text}
                </li>
              ))
            ) : (
              <>
                <li>
                  <strong className="text-white font-semibold">Antarmuka pengguna:</strong>{' '}
                  {archOverview.systemComponents.frontend}
                </li>
                <li>
                  <strong className="text-white font-semibold">Logika server:</strong>{' '}
                  {archOverview.systemComponents.backend}
                </li>
                <li>
                  <strong className="text-white font-semibold">Basis data:</strong>{' '}
                  {archOverview.systemComponents.database}
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Diagram Alur Sistem */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-white">Diagram alur sistem:</h3>
          <div className="py-1">
            <MermaidRenderer
              chart={archOverview.systemFlowchartMermaid}
              title="Diagram Alur Sistem"
              theme={theme}
            />
          </div>
        </div>
      </section>

      {/* 6. Database Schema */}
      <section id="section-database" className="scroll-mt-20 mb-12">
        <div className="pb-3 mb-6 border-b border-zinc-800/70">
          <h2
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              isLight ? 'text-zinc-950' : 'text-white'
            }`}
          >
            6. Database Schema
          </h2>
          <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Berikut tabel-tabel utama yang dibutuhkan. Nama kolom memakai huruf kecil dengan garis bawah.
          </p>
        </div>

        {/* Data Dictionary Tables List */}
        <div className="space-y-8">
          {schemaDict.tables.map((table) => (
            <div key={table.name} className="space-y-2.5">
              {/* Table Title Heading */}
              <h3
                className={`text-sm sm:text-base font-semibold ${
                  isLight ? 'text-zinc-900' : 'text-zinc-100'
                }`}
              >
                {table.number}. {table.name}
                {table.description && (
                  <span className={`font-normal ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {' '}— {table.description}
                  </span>
                )}
              </h3>

              {/* Table Container */}
              <div
                className={`overflow-x-auto rounded-lg border ${
                  isLight
                    ? 'border-zinc-300 bg-white'
                    : 'border-zinc-800/80 bg-[#0d121c]/50'
                }`}
              >
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr
                      className={`border-b ${
                        isLight
                          ? 'border-zinc-200 bg-zinc-100/80 text-zinc-700'
                          : 'border-zinc-800/80 bg-[#141b27]/80 text-zinc-200'
                      }`}
                    >
                      <th className="py-2.5 px-4 font-medium w-[22%] border-r border-zinc-800/60">
                        Kolom
                      </th>
                      <th className="py-2.5 px-4 font-medium w-[20%] border-r border-zinc-800/60">
                        Tipe
                      </th>
                      <th className="py-2.5 px-4 font-medium w-[58%]">
                        Kegunaan
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isLight ? 'divide-zinc-200 text-zinc-800' : 'divide-zinc-800/60 text-zinc-300'
                    }`}
                  >
                    {table.columns.map((col) => (
                      <tr
                        key={col.name}
                        className="hover:bg-zinc-500/5 transition-colors"
                      >
                        <td className="py-2.5 px-4 border-r border-zinc-800/50 text-zinc-200">
                          {col.name}
                        </td>
                        <td className="py-2.5 px-4 border-r border-zinc-800/50 text-zinc-300">
                          {col.type}
                        </td>
                        <td className="py-2.5 px-4 text-zinc-300/90 leading-relaxed">
                          {col.purpose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* ERD Diagram Sub-section */}
        <div className="mt-10 pt-4">
          <h3
            className={`text-sm sm:text-base font-semibold mb-3 ${
              isLight ? 'text-zinc-900' : 'text-zinc-100'
            }`}
          >
            Diagram hubungan antar tabel (ER):
          </h3>
          <div
            className={`p-4 rounded-xl border ${
              isLight ? 'border-zinc-300 bg-zinc-50' : 'border-zinc-800/80 bg-[#0d121c]/40'
            }`}
          >
            <MermaidRenderer
              chart={schemaDict.erdDiagram || defaultERD}
              title="Diagram Hubungan Antar Tabel (ER)"
              theme={theme}
            />
          </div>
        </div>
      </section>

      {/* 7. Tech Stack */}
      <section id="section-tech-stack" className="scroll-mt-20 mb-10">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight mb-3 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          7. Tech Stack
        </h2>

        {/* Dynamic Contextual Opening Rationale matching Image 2 */}
        <p className={`text-sm leading-relaxed mb-4 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          {richTechStack.intro}
        </p>

        {/* Tech Stack List matching Image 2 */}
        <ul className="space-y-2.5 text-sm list-disc pl-5 text-zinc-300">
          {richTechStack.items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              <strong className={isLight ? 'text-zinc-950 font-semibold' : 'text-white font-semibold'}>
                {item.category}:
              </strong>{' '}
              <span className={isLight ? 'text-zinc-900 font-medium' : 'text-zinc-200 font-medium'}>
                {item.name}
              </span>
              {item.rationale && (
                <span className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>
                  {' '}— {item.rationale}
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* Dynamic Closing Note matching Image 2 */}
        {richTechStack.closingNote && (
          <p className={`mt-5 text-xs italic leading-relaxed ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
            {richTechStack.closingNote}
          </p>
        )}
      </section>

      </article>
  );
};
