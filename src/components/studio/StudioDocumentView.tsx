'use client';

import React, { useState, useEffect } from 'react';
import { PRDOutput } from '@/types/prd';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { resolvePrdTechStack } from './studio-markdown';
import { synthesizeDynamicArchitectureDiagrams } from '@/lib/gemini/schemas';
import { Copy, Check, Terminal, Shield, Zap, Target, Layers, Database, Code2 } from 'lucide-react';

interface StudioDocumentViewProps {
  prd: PRDOutput;
  fullMarkdown: string;
  viewMode: 'preview' | 'raw';
  theme?: 'dark' | 'light';
  onUpdateDiagrams?: (diagrams: any) => void;
  apiKeyHeader?: string;
}

export const StudioDocumentView: React.FC<StudioDocumentViewProps> = ({
  prd,
  fullMarkdown,
  viewMode,
  theme = 'dark',
  onUpdateDiagrams,
  apiKeyHeader = '',
}) => {
  const isLight = theme === 'light';
  const resolvedStack = resolvePrdTechStack(prd);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [databaseViewMode, setDatabaseViewMode] = useState<'erd' | 'sql'>('erd');
  const [copiedSql, setCopiedSql] = useState(false);

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
    if (!defaultSql) return;
    try {
      navigator.clipboard.writeText(defaultSql);
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

  return (
    <article
      className={`w-full max-w-4xl mx-auto py-6 px-2 sm:px-6 transition-colors duration-200 select-text leading-relaxed ${
        isLight ? 'text-zinc-900' : 'text-zinc-300'
      }`}
    >
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
          className={`text-lg sm:text-xl font-bold tracking-tight mb-4 flex items-center gap-2 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          <Target className="w-5 h-5 text-amber-400" />
          <span>1. Overview</span>
        </h2>

        <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
          {/* Problem Statement */}
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Problem Statement & Konteks Lapangan</h4>
            <div className="space-y-2 text-zinc-300 leading-relaxed whitespace-pre-line">
              {prd.opportunity_framing.core_problem}
            </div>
          </div>

          {/* Working Hypothesis */}
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">Hipotesis Solusi & Alur Kunci</h4>
            <p className="text-zinc-300 leading-relaxed">{prd.opportunity_framing.working_hypothesis}</p>
          </div>

          {/* Strategy Fit */}
          {prd.opportunity_framing.strategy_fit && (
            <div className={`p-4 rounded-xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">Keunggulan Strategis & Keselarasan Solusi</h4>
              <p className="text-zinc-300 leading-relaxed">{prd.opportunity_framing.strategy_fit}</p>
            </div>
          )}

          {/* Target Audience & Personas */}
          {prd.archetype_detection?.target_audience && (
            <div className={`p-4 rounded-xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">Target Persona & Pengguna Sistem</h4>
              <p className="text-zinc-300 leading-relaxed">{prd.archetype_detection.target_audience}</p>
            </div>
          )}

          {/* Target KPI / Success Metrics */}
          {prd.success_measurement?.online_metrics && (
            <div className={`p-4 rounded-xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Target Metrik & KPI Produksi</h4>
              <div className="space-y-1 text-xs">
                <p><strong className="text-white">Metrik Online / KPI:</strong> {prd.success_measurement.online_metrics}</p>
                {prd.success_measurement.offline_golden_set && (
                  <p><strong className="text-white">Validasi Fungsional:</strong> {prd.success_measurement.offline_golden_set}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Requirements */}
      <section id="section-requirements" className="scroll-mt-20 mb-12">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight mb-4 flex items-center gap-2 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>2. Requirements</span>
        </h2>

        {/* 2.1 Functional Requirements */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">2.1 Functional Requirements (Lingkup MVP)</h3>
          <ul className="space-y-2.5 text-sm leading-relaxed pl-1">
            {Array.isArray(prd.boundaries.scope) ? (
              prd.boundaries.scope.map((item, idx) => {
                const isCodePrefixed = item.startsWith('[REQ-') || item.startsWith('REQ-');
                const reqCode = isCodePrefixed ? '' : `[REQ-${String(idx + 1).padStart(2, '0')}]`;
                return (
                  <li key={idx} className="flex items-start gap-2 text-zinc-300">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                      {isCodePrefixed ? item.split(']')[0] + ']' : reqCode}
                    </span>
                    <span>{isCodePrefixed ? item.split(']').slice(1).join(']').trim() : item}</span>
                  </li>
                );
              })
            ) : (
              <li className="text-zinc-300">{prd.boundaries.scope}</li>
            )}
          </ul>
        </div>

        {/* 2.2 Out-of-Scope Non-Goals */}
        {Array.isArray(prd.boundaries.non_goals) && prd.boundaries.non_goals.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">2.2 Batasan & Non-Goals (Out of Scope MVP)</h3>
            <ul className="space-y-2 text-sm leading-relaxed pl-1">
              {prd.boundaries.non_goals.map((ng, idx) => (
                <li key={`ng-${idx}`} className="flex items-start gap-2 text-zinc-400">
                  <span className="font-mono text-[10px] font-bold text-zinc-400 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                    NON-GOAL
                  </span>
                  <span>{ng}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 2.3 Non-Functional Requirements & Keamanan */}
        {(prd.ai_specific?.guardrails || prd.risk_management?.detection || prd.risk_management?.fallback_kill_switch) && (
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>2.3 Non-Functional Requirements & Keamanan</span>
            </h3>
            <div className="space-y-2 text-xs leading-relaxed text-zinc-300">
              {prd.ai_specific?.guardrails && prd.ai_specific.guardrails.length > 0 && (
                <p><strong className="text-white">Standar Keamanan & Validasi:</strong> {prd.ai_specific.guardrails.join(', ')}</p>
              )}
              {prd.risk_management?.detection && (
                <p><strong className="text-white">Pemantauan & Audit Trail:</strong> {prd.risk_management.detection}</p>
              )}
              {prd.risk_management?.fallback_kill_switch && (
                <p><strong className="text-white">Mitigasi Risiko & Failover:</strong> {prd.risk_management.fallback_kill_switch}</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 3. Core Features */}
      <section id="section-features" className="scroll-mt-20 mb-12">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight mb-4 flex items-center gap-2 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          <Zap className="w-5 h-5 text-amber-400" />
          <span>3. Core Features</span>
        </h2>

        <div className="space-y-8 text-sm leading-relaxed">
          {prd.feature_breakdown && prd.feature_breakdown.length > 0 ? (
            prd.feature_breakdown.map((feat, idx) => (
              <div
                key={feat.id || idx}
                className={`p-5 rounded-2xl border transition-colors ${
                  isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800/80'
                } space-y-4`}
              >
                {/* Header Feature & Priority */}
                <div className="flex items-center justify-between gap-3 border-b border-zinc-800/60 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 text-xs font-mono font-bold">
                      {idx + 1}
                    </span>
                    <span>{feat.name}</span>
                  </h3>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      feat.priority === 'P0'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {feat.priority || 'P0'}
                  </span>
                </div>

                {/* User Story */}
                <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/50 text-xs leading-relaxed">
                  <span className="font-semibold text-zinc-400 uppercase tracking-wider block mb-1">User Story:</span>
                  <p className="text-zinc-200 italic">{feat.user_story}</p>
                </div>

                {/* Happy Path */}
                {feat.happy_path && feat.happy_path.length > 0 && (
                  <div>
                    <span className="text-zinc-200 font-semibold block mb-1.5 text-xs uppercase tracking-wider text-amber-400">
                      Alur Kerja Interaktif (Happy Path):
                    </span>
                    <ol className="list-decimal pl-5 space-y-1 text-xs text-zinc-300">
                      {feat.happy_path.map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Business Rules */}
                {feat.business_rules && feat.business_rules.length > 0 && (
                  <div>
                    <span className="text-zinc-200 font-semibold block mb-1.5 text-xs uppercase tracking-wider text-indigo-400">
                      Aturan Bisnis & Validasi:
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-300">
                      {feat.business_rules.map((rule, rIdx) => (
                        <li key={rIdx} className="leading-relaxed">{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Edge Cases */}
                {feat.edge_cases && feat.edge_cases.length > 0 && (
                  <div>
                    <span className="text-zinc-200 font-semibold block mb-1.5 text-xs uppercase tracking-wider text-rose-400">
                      Penanganan Edge Cases & Pemulihan:
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-400">
                      {feat.edge_cases.map((edge, eIdx) => (
                        <li key={eIdx} className="leading-relaxed">{edge}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech Mapping */}
                {feat.tech_mapping && (
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 space-y-2 text-xs">
                    <span className="font-semibold text-zinc-300 uppercase tracking-wider block text-[11px]">
                      Technical Mapping (Komponen, API & DB):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {feat.tech_mapping.frontend_components && feat.tech_mapping.frontend_components.length > 0 && (
                        <div>
                          <span className="text-[10px] text-zinc-400 font-medium block mb-1">Frontend:</span>
                          <div className="flex flex-wrap gap-1">
                            {feat.tech_mapping.frontend_components.map((c, cIdx) => (
                              <span key={cIdx} className="font-mono text-[10px] bg-zinc-800 text-indigo-300 px-1.5 py-0.5 rounded border border-zinc-700 truncate max-w-full">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {feat.tech_mapping.api_endpoints && feat.tech_mapping.api_endpoints.length > 0 && (
                        <div>
                          <span className="text-[10px] text-zinc-400 font-medium block mb-1">API Routes:</span>
                          <div className="flex flex-wrap gap-1">
                            {feat.tech_mapping.api_endpoints.map((a, aIdx) => (
                              <span key={aIdx} className="font-mono text-[10px] bg-zinc-800 text-emerald-300 px-1.5 py-0.5 rounded border border-zinc-700 truncate max-w-full">
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {feat.tech_mapping.db_tables && feat.tech_mapping.db_tables.length > 0 && (
                        <div>
                          <span className="text-[10px] text-zinc-400 font-medium block mb-1">Database Tables:</span>
                          <div className="flex flex-wrap gap-1">
                            {feat.tech_mapping.db_tables.map((t, tIdx) => (
                              <span key={tIdx} className="font-mono text-[10px] bg-zinc-800 text-amber-300 px-1.5 py-0.5 rounded border border-zinc-700 truncate max-w-full">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Coding Agent Prompt */}
                {feat.agent_prompt && (
                  <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-3 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-mono text-[11px] font-semibold text-zinc-300">Prompt Siap Pakai (Cursor / Claude Code)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(feat.id || String(idx), feat.agent_prompt)}
                        className="inline-flex items-center gap-1 text-[10px] text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        {copiedPromptId === (feat.id || String(idx)) ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin Prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="font-mono text-[11px] text-zinc-300 bg-zinc-900/80 p-2.5 rounded border border-zinc-800/80 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                      {feat.agent_prompt}
                    </pre>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-zinc-300">
              Fitur utama terinci mencakup alur registrasi pengguna, dashboard operasional, dan pemrosesan data real-time.
            </p>
          )}
        </div>
      </section>

      {/* 4. User Flow */}
      <section id="section-user-flow" className="scroll-mt-20 mb-10">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight mb-4 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          4. User Flow
        </h2>
        <div className="py-2">
          <MermaidRenderer chart={defaultUserJourney} title="User Flow" theme={theme} />
        </div>
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
        <div className="py-2">
          <MermaidRenderer chart={defaultFlowchart} title="Architecture Diagram" theme={theme} />
        </div>
      </section>

      {/* 6. Database Schema & SQL Migration */}
      <section id="section-database" className="scroll-mt-20 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2
            className={`text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2 ${
              isLight ? 'text-zinc-950' : 'text-white'
            }`}
          >
            <Database className="w-5 h-5 text-blue-400" />
            <span>6. Database Schema &amp; SQL Migration</span>
          </h2>

          {/* Toggle Switch ERD vs SQL */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto text-xs font-mono">
            <button
              type="button"
              onClick={() => setDatabaseViewMode('erd')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                databaseViewMode === 'erd'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Diagram ERD Visual
            </button>
            <button
              type="button"
              onClick={() => setDatabaseViewMode('sql')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                databaseViewMode === 'sql'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Skrip SQL Migration
            </button>
          </div>
        </div>

        {databaseViewMode === 'erd' ? (
          <div className="py-2">
            <MermaidRenderer chart={defaultERD} title="Database Schema (ERD)" theme={theme} />
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-[#090b10] overflow-hidden shadow-xl">
            {/* Header Toolbar SQL */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs font-bold text-zinc-200">schema.sql</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  PostgreSQL / Supabase DDL
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin SQL Migration</span>
                  </>
                )}
              </button>
            </div>
            {/* Code Block Content */}
            <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed whitespace-pre selection:bg-amber-500/30">
              {defaultSql}
            </pre>
          </div>
        )}
      </section>

      {/* 7. Tech Stack */}
      <section id="section-tech-stack" className="scroll-mt-20 mb-10">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight mb-4 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          7. Tech Stack
        </h2>

        <ul className="space-y-2 text-sm list-disc pl-5 text-zinc-300">
          <li>
            <strong className="text-white font-semibold">Frontend:</strong> {resolvedStack.frontend}
          </li>
          <li>
            <strong className="text-white font-semibold">Backend & API:</strong> {resolvedStack.backend}
          </li>
          <li>
            <strong className="text-white font-semibold">Database:</strong> {resolvedStack.database}
          </li>
          {resolvedStack.aiIntegration && (
            <li>
              <strong className="text-white font-semibold">AI Integration:</strong> {resolvedStack.aiIntegration}
            </li>
          )}
          <li>
            <strong className="text-white font-semibold">Authentication:</strong> {resolvedStack.auth}
          </li>
          <li>
            <strong className="text-white font-semibold">Deployment:</strong> {resolvedStack.deployment}
          </li>
        </ul>
      </section>
    </article>
  );
};
