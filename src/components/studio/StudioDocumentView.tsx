'use client';

import React from 'react';
import { PRDOutput } from '@/types/prd';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { resolvePrdTechStack } from './studio-markdown';

interface StudioDocumentViewProps {
  prd: PRDOutput;
  fullMarkdown: string;
  viewMode: 'preview' | 'raw';
  theme?: 'dark' | 'light';
}

export const StudioDocumentView: React.FC<StudioDocumentViewProps> = ({
  prd,
  fullMarkdown,
  viewMode,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const resolvedStack = resolvePrdTechStack(prd);

  const defaultFlowchart =
    prd.architecture_diagrams?.system_flowchart ||
    `graph TD
  User([User Client]) --> WebApp[Web Frontend]
  WebApp --> API[Backend API Routes]
  API --> Auth[Auth & Security Guardrails]
  API --> Service[Core Business Services]
  Service --> DB[(Primary Database)]
  Service --> Cache[(Redis / In-Memory Cache)]
  Service --> ThirdParty[External Integrations]`;

  const defaultUserJourney =
    prd.architecture_diagrams?.user_journey_flow ||
    `flowchart TD
  Start([Pengunjung Masuk]) --> Landing[Landing Page]
  Landing --> AuthCheck{Punya Akun?}
  AuthCheck -- Belum --> Register[Registrasi & Verifikasi]
  AuthCheck -- Sudah --> Login[Login Akun]
  Register --> Onboarding[Lengkapi Profil]
  Login --> Dashboard[Dashboard Utama]
  Onboarding --> Dashboard
  Dashboard --> CoreAction[Gunakan Fitur Utama]
  CoreAction --> Feedback[Status & Hasil]`;

  const defaultERD =
    prd.architecture_diagrams?.database_erd ||
    `erDiagram
  USERS ||--o{ TRANSACTIONS : initiates
  USERS {
    string id PK
    string email
    string name
    string role
    datetime created_at
  }
  TRANSACTIONS ||--|{ LOGS : generates
  TRANSACTIONS {
    string id PK
    string user_id FK
    string status
    float amount
    datetime updated_at
  }
  LOGS {
    string id PK
    string transaction_id FK
    string event
    datetime timestamp
  }`;

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
        PRD — Project Requirements Document
      </h1>

      {/* 1. Overview */}
      <section id="section-overview" className="scroll-mt-20 mb-10">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight mb-4 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          1. Overview
        </h2>

        <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
          <p>
            <strong className="text-white font-semibold">{prd.title}</strong>{' '}
            {prd.opportunity_framing.core_problem}
          </p>
          <p>{prd.opportunity_framing.working_hypothesis}</p>
          {prd.opportunity_framing.strategy_fit && (
            <p>{prd.opportunity_framing.strategy_fit}</p>
          )}
        </div>
      </section>

      {/* 2. Requirements */}
      <section id="section-requirements" className="scroll-mt-20 mb-10">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight mb-4 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          2. Requirements
        </h2>

        <ul className="space-y-3 text-sm leading-relaxed list-disc pl-5">
          {Array.isArray(prd.boundaries.scope) ? (
            prd.boundaries.scope.map((item, idx) => {
              if (item.includes(':')) {
                const [prefix, ...rest] = item.split(':');
                return (
                  <li key={idx} className="text-zinc-300">
                    <strong className="text-white font-semibold">{prefix.trim()}:</strong>{' '}
                    {rest.join(':').trim()}
                  </li>
                );
              }
              return (
                <li key={idx} className="text-zinc-300">
                  <strong className="text-white font-semibold">Fitur Utama:</strong> {item}
                </li>
              );
            })
          ) : (
            <li className="text-zinc-300">{prd.boundaries.scope}</li>
          )}

          {Array.isArray(prd.boundaries.non_goals) &&
            prd.boundaries.non_goals.map((ng, idx) => (
              <li key={`ng-${idx}`} className="text-zinc-400">
                <strong className="text-zinc-300 font-semibold">Batasan (Out-of-scope):</strong>{' '}
                {ng}
              </li>
            ))}
        </ul>
      </section>

      {/* 3. Core Features */}
      <section id="section-features" className="scroll-mt-20 mb-10">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight mb-4 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          3. Core Features
        </h2>

        <div className="space-y-6 text-sm leading-relaxed">
          {prd.feature_breakdown && prd.feature_breakdown.length > 0 ? (
            prd.feature_breakdown.map((feat, idx) => (
              <div key={feat.id || idx} className="space-y-2">
                <h3 className="text-base font-bold text-white">
                  {idx + 1}. {feat.name} ({feat.priority})
                </h3>
                <p className="text-zinc-300">
                  <strong className="text-zinc-200">User Story:</strong> {feat.user_story}
                </p>

                {feat.happy_path && feat.happy_path.length > 0 && (
                  <div>
                    <span className="text-zinc-200 font-semibold block mb-1">Alur Kerja (Happy Path):</span>
                    <ol className="list-decimal pl-5 space-y-1 text-zinc-300">
                      {feat.happy_path.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {feat.business_rules && feat.business_rules.length > 0 && (
                  <div>
                    <span className="text-zinc-200 font-semibold block mb-1">Aturan Bisnis & Validasi:</span>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                      {feat.business_rules.map((rule, rIdx) => (
                        <li key={rIdx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {feat.edge_cases && feat.edge_cases.length > 0 && (
                  <div>
                    <span className="text-zinc-200 font-semibold block mb-1">Penanganan Edge Cases:</span>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                      {feat.edge_cases.map((edge, eIdx) => (
                        <li key={eIdx}>{edge}</li>
                      ))}
                    </ul>
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

      {/* 6. Database Schema */}
      <section id="section-database" className="scroll-mt-20 mb-10">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight mb-4 ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}
        >
          6. Database Schema
        </h2>
        <div className="py-2">
          <MermaidRenderer chart={defaultERD} title="Database Schema (ERD)" theme={theme} />
        </div>
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
