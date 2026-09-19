'use client';

import React, { useState } from 'react';
import { ClarificationQuestion, PRDFormData } from '@/types/prd';
import { TechStackConfig } from './WizardHeroInput';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  HelpCircle,
  Loader2,
  CheckCircle2,
  CornerDownLeft,
} from 'lucide-react';

interface WizardDiscoveryStepProps {
  idea: string;
  techStack: TechStackConfig;
  questions: ClarificationQuestion[];
  onBack: () => void;
  onSubmitDiscovery: (finalFormData: PRDFormData) => void;
  isGeneratingPrd?: boolean;
  theme?: 'dark' | 'light';
}

export const WizardDiscoveryStep: React.FC<WizardDiscoveryStepProps> = ({
  idea,
  techStack,
  questions,
  onBack,
  onSubmitDiscovery,
  isGeneratingPrd = false,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  // State: Record<questionId, string[] (array of selected option labels/text)>
  const [answers, setAnswers] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    questions.forEach((q) => {
      // Pre-select all recommended options or primary recommendation
      const recOptions = q.options.filter((o) => o.isRecommended);
      if (recOptions.length > 0) {
        if (q.isMultiSelect) {
          initial[q.id] = recOptions.map((o) => o.label);
        } else {
          initial[q.id] = [recOptions[0].label];
        }
      } else if (q.recommendedOptionId) {
        const found = q.options.find((o) => o.id === q.recommendedOptionId);
        if (found) {
          initial[q.id] = [found.label];
        }
      } else if (q.options.length > 0) {
        initial[q.id] = [q.options[0].label];
      }
    });
    return initial;
  });

  // State for "+ Lainnya" custom input per question
  const [activeOtherInput, setActiveOtherInput] = useState<Record<string, string>>({});
  const [showOtherInput, setShowOtherInput] = useState<Record<string, boolean>>({});

  // Toggle or select option
  const handleToggleOption = (question: ClarificationQuestion, optionLabel: string) => {
    setAnswers((prev) => {
      const current = prev[question.id] || [];
      if (question.isMultiSelect) {
        if (current.includes(optionLabel)) {
          return {
            ...prev,
            [question.id]: current.filter((item) => item !== optionLabel),
          };
        } else {
          return {
            ...prev,
            [question.id]: [...current, optionLabel],
          };
        }
      } else {
        // Single select
        return {
          ...prev,
          [question.id]: [optionLabel],
        };
      }
    });
  };

  // Skip question
  const handleSkipQuestion = (questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: ['[Dilewati oleh user]'],
    }));
  };

  // Add custom "+ Lainnya" chip
  const handleAddCustomOption = (questionId: string) => {
    const customText = (activeOtherInput[questionId] || '').trim();
    if (!customText) return;

    setAnswers((prev) => {
      const current = prev[questionId] || [];
      return {
        ...prev,
        [questionId]: [...current.filter((i) => i !== '[Dilewati oleh user]'), customText],
      };
    });

    setActiveOtherInput((prev) => ({ ...prev, [questionId]: '' }));
    setShowOtherInput((prev) => ({ ...prev, [questionId]: false }));
  };

  // Count answered questions
  const answeredCount = questions.filter((q) => {
    const ans = answers[q.id];
    return ans && ans.length > 0 && ans[0] !== '[Dilewati oleh user]';
  }).length;

  // Compile answers dynamically and intelligently into full PRDFormData
  const handleFinalSubmit = () => {
    // Helper to find answers by category or semantic id keywords with fallback index
    const getAnswersBy = (keywords: string[], fallbackIndex: number): string[] => {
      const found = questions.find((q) =>
        keywords.some((k) =>
          q.category.toLowerCase().includes(k) || q.id.toLowerCase().includes(k)
        )
      );
      if (found && answers[found.id] && answers[found.id].length > 0) {
        const valid = answers[found.id].filter((a) => a !== '[Dilewati oleh user]');
        if (valid.length > 0) return valid;
      }
      const fb = questions[fallbackIndex];
      if (fb && answers[fb.id] && answers[fb.id].length > 0) {
        return answers[fb.id].filter((a) => a !== '[Dilewati oleh user]');
      }
      return [];
    };

    const coreFlowAns = getAnswersBy(['core_flow', 'alur', 'transaksi', 'layanan', 'skema', 'mekanisme'], 0);
    const riskAns = getAnswersBy(['risk_management', 'mitigasi', 'konflik', 'selisih', 'stok', 'berkas', 'pencegahan'], 1);
    const integrasiAns = getAnswersBy(['integrations', 'integrasi', 'hardware', 'ekspedisi', 'ekosistem'], 2);
    const rolesAns = getAnswersBy(['user_roles', 'role', 'aktor', 'struktur', 'shift', 'akses'], 3);
    const featureAns = getAnswersBy(['feature_priority', 'modul', 'mvp', 'fitur'], 4);

    const compiledTitle = idea.length > 60 ? idea.slice(0, 57) + '...' : idea;

    const coreProblem = rolesAns.length > 0
      ? `Kebutuhan operasional untuk ${rolesAns.join(', ')}: Sistem saat ini membutuhkan otomatisasi alur digital untuk ${idea} guna mencegah inefisiensi dan kendala operasional.`
      : `Pengguna dan pengelola membutuhkan platform digital terpadu untuk efisiensi ${idea}.`;

    const hypothesis = coreFlowAns.length > 0
      ? `Dengan mengimplementasikan mekanisme alur "${coreFlowAns.join(', ')}", proses transaksi dan pertukaran data berjalan cepat, akurat, dan minim friksi bagi pengguna.`
      : `Dengan sistem ini, efisiensi operasional dan kepuasan pengguna meningkat secara terukur.`;

    const strategyFit = integrasiAns.length > 0
      ? `Keunggulan arsitektur & integrasi kunci: Mengandalkan ${integrasiAns.join(' serta ')} untuk menjamin keandalan dan daya saing operasional.`
      : `Fokus pada kemudahan akses, keandalan sistem, dan reliabilitas data.`;

    // Combine selected MVP features with integration points
    const scopeItems: string[] = [];
    if (featureAns.length > 0) {
      scopeItems.push(...featureAns);
    } else {
      scopeItems.push(`Modul Operasional Inti ${idea}`, 'Katalog & Manajemen Data', 'Pusat Notifikasi');
    }
    if (integrasiAns.length > 0) {
      scopeItems.push(`Integrasi Layanan: ${integrasiAns.join(', ')}`);
    }

    const riskDetection = 'Log anomali transaksi terpusat, validasi integritas skema database, dan pemantauan status API realtime.';
    const fallbackKillSwitch = riskAns.length > 0
      ? `Kebijakan mitigasi risiko: ${riskAns.join('. ')}. Sediakan saklar darurat (kill-switch) dan mode baca-saja jika terjadi gangguan pihak ketiga.`
      : 'Fallback mode baca-saja jika backend transaksi atau pihak ketiga mengalami kendala.';

    const primaryOwner = rolesAns.length > 0
      ? `Lead Product Architect / PIC Operasional (${rolesAns[0]})`
      : 'Lead Developer / Product Owner';

    const formData: PRDFormData = {
      title: compiledTitle,
      opportunity_framing: {
        core_problem: coreProblem,
        working_hypothesis: hypothesis,
        strategy_fit: strategyFit,
      },
      boundaries: {
        scope: scopeItems.join('\n'),
        non_goals: 'Fitur di luar lingkup prioritas MVP fase 1 sengaja ditunda agar pengembangan terfokus pada stabilitas alur transaksi inti dan rilis tepat waktu.',
      },
      success_measurement: {
        offline_golden_set: 'Semua alur utama (happy path) lolos validasi fungsional dan pengujian end-to-end tanpa blocking bug.',
        human_review: 'Uji kepuasan operasional ramah pengguna dengan alur transaksi yang jelas dan minim klik.',
        online_metrics: `Tingkat keberhasilan transaksi > 95%, adopsi modul utama > 75%, latensi respons API < 1.5 detik.`,
      },
      rollout_plan: {
        exposure: '100% rilis publik web responsive.',
        duration: 'Fase evaluasi 14 hari pasca peluncuran awal.',
        segments_gates: 'Pastikan performa loading < 2 detik dan tidak ada error fatal di log server.',
      },
      risk_management: {
        detection: riskDetection,
        fallback_kill_switch: fallbackKillSwitch,
      },
      ownership_action: {
        primary_owner: primaryOwner,
        decision_points: 'Evaluasi metrik operasional mingguan untuk menentukan peningkatan fitur fase 2.',
      },
      ai_specific: {
        behavior_contract: `Tech stack wajib: ${techStack.frontend}, ${techStack.backend}, ${techStack.database}.\nSistem harus menerapkan kode modular, type-safe, dan responsive.\nAlur bisnis wajib mengadopsi mekanisme: ${coreFlowAns.join(', ') || 'Alur standar industri'}.`,
        guardrails: 'Validasi input dengan Zod, sanitasi data, cegah SQL injection, dan gunakan environment variables aman.',
      },
    };

    onSubmitDiscovery(formData);
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-2 sm:pt-4 pb-8 px-4">
      {/* 1. Step Progress Indicator */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm font-medium">
        {/* Step 1: Konsep Ide (Done) */}
        <button
          type="button"
          onClick={onBack}
          disabled={isGeneratingPrd}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span>Konsep Ide</span>
        </button>

        {/* Connector 1 -> 2 (Finished) */}
        <div className="h-0.5 w-10 sm:w-20 bg-amber-500/50 rounded-full" />

        {/* Step 2: Bedah Kebutuhan */}
        <div className={`flex items-center gap-2 font-semibold transition-all ${
          isGeneratingPrd ? 'text-zinc-400' : 'text-amber-400'
        }`}>
          {isGeneratingPrd ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
          )}
          <span>Bedah Kebutuhan</span>
        </div>

        {/* Connector 2 -> 3 with Flowing Beam when generating PRD */}
        <div className="relative h-0.5 w-10 sm:w-20 bg-zinc-800 rounded-full overflow-hidden">
          {isGeneratingPrd ? (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent w-full animate-beam-flow shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          ) : (
            <div className="h-full w-full bg-zinc-800" />
          )}
        </div>

        {/* Step 3: Cetak Biru & Roadmap */}
        <div className={`flex items-center gap-2 transition-all ${
          isGeneratingPrd ? 'text-amber-400 font-semibold' : 'text-zinc-500'
        }`}>
          {isGeneratingPrd ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 ring-2 ring-amber-400/30" />
            </span>
          ) : (
            <span className="flex h-2 w-2 rounded-full bg-zinc-700" />
          )}
          <span>Cetak Biru & Roadmap</span>
          {isGeneratingPrd && (
            <span className="text-[10px] font-mono text-amber-400/80 animate-pulse hidden sm:inline">
              (Merancang...)
            </span>
          )}
        </div>
      </div>

      {/* 2. Headline & Counter (Screenshot 3 style) */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className={`text-2xl sm:text-4xl font-black tracking-tight ${
            isLight ? 'text-zinc-900' : 'text-white'
          }`}>
            Beberapa pertanyaan
          </h1>
          <p className={`text-xs sm:text-sm mt-1.5 ${
            isLight ? 'text-zinc-600' : 'text-zinc-400'
          }`}>
            Biar PRD-nya lebih akurat dan tajam. Jawab pertanyaan di bawah sesuai kebutuhanmu.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-1 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
          <span>{answeredCount}</span>
          <span className="text-zinc-500">/</span>
          <span>{questions.length}</span>
        </div>
      </div>

      {/* 3. Questions List Container */}
      <div className="space-y-6 mb-10">
        {questions.map((question, index) => {
          const selectedLabels = answers[question.id] || [];
          const isSkipped = selectedLabels.includes('[Dilewati oleh user]');

          return (
            <div
              key={question.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                isLight
                  ? 'bg-white border-zinc-200/90 shadow-xs'
                  : 'bg-[#151821] border-zinc-800/80 shadow-md'
              }`}
            >
              {/* Question Header & Lewati Button */}
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <h3 className={`text-sm sm:text-base font-bold leading-snug ${
                  isLight ? 'text-zinc-900' : 'text-zinc-100'
                }`}>
                  <span className="text-amber-400 mr-1.5">{index + 1}.</span>
                  {question.question}
                  {question.isMultiSelect && (
                    <span className="text-xs font-normal text-zinc-400 ml-1.5 italic">
                      (boleh pilih beberapa)
                    </span>
                  )}
                </h3>

                <button
                  type="button"
                  onClick={() => handleSkipQuestion(question.id)}
                  className={`text-xs font-medium shrink-0 transition-colors ${
                    isSkipped
                      ? 'text-amber-400 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {isSkipped ? 'Dilewati' : 'Lewati'}
                </button>
              </div>

              {/* Chips Options */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {question.options.map((option) => {
                  const isSelected = selectedLabels.includes(option.label);
                  const isRec = Boolean(option.isRecommended) || option.id === question.recommendedOptionId;
                  const recLabel = option.recommendationReason || option.badge || 'Rekomendasi';

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleToggleOption(question, option.label)}
                      title={option.description ? `${option.description}${isRec ? ` (${recLabel})` : ''}` : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? isLight
                            ? 'border-2 border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs'
                            : 'border border-amber-500 bg-amber-500/15 text-amber-300 font-semibold shadow-xs shadow-amber-500/10'
                          : isRec
                          ? isLight
                            ? 'border border-blue-300/80 bg-white text-slate-800 hover:border-blue-400'
                            : 'border border-amber-500/30 bg-zinc-900/90 text-zinc-200 hover:border-amber-500/50'
                          : isLight
                          ? 'border border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                          : 'border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {isSelected && <Check className={`h-3 w-3 ${isLight ? 'text-blue-600' : 'text-amber-400'}`} />}
                      <span>{option.label}</span>
                      {isRec && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider ${
                            isSelected
                              ? isLight
                                ? 'bg-blue-600 text-white'
                                : 'bg-amber-500 text-zinc-950 font-bold'
                              : isLight
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                          title={`Alasan: ${recLabel}`}
                        >
                          {recLabel}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Additional selected custom chips */}
                {selectedLabels
                  .filter((label) => !question.options.some((o) => o.label === label) && label !== '[Dilewati oleh user]')
                  .map((customLabel, cIdx) => (
                    <button
                      key={`custom_${cIdx}`}
                      type="button"
                      onClick={() => handleToggleOption(question, customLabel)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500 bg-amber-500/15 text-amber-300 font-semibold px-3 py-1.5 text-xs shadow-xs"
                    >
                      <Check className="h-3 w-3 text-amber-400" />
                      <span>{customLabel}</span>
                    </button>
                  ))}

                {/* "+ Lainnya" Button or Input */}
                {showOtherInput[question.id] ? (
                  <div className="inline-flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs">
                    <input
                      type="text"
                      placeholder="Tulis opsi custom..."
                      value={activeOtherInput[question.id] || ''}
                      onChange={(e) =>
                        setActiveOtherInput((prev) => ({
                          ...prev,
                          [question.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomOption(question.id);
                        }
                      }}
                      className="bg-transparent text-xs text-white focus:outline-hidden w-36 sm:w-48 placeholder:text-zinc-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomOption(question.id)}
                      className="p-1 text-amber-400 hover:text-white"
                      title="Tambahkan"
                    >
                      <CornerDownLeft className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setShowOtherInput((prev) => ({
                        ...prev,
                        [question.id]: true,
                      }))
                    }
                    className={`inline-flex items-center gap-1 rounded-xl border border-dashed px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      isLight
                        ? 'border-zinc-300 text-zinc-500 hover:text-zinc-800'
                        : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Plus className="h-3 w-3" />
                    <span>Lainnya</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Navigation Bar */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={onBack}
          disabled={isGeneratingPrd}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
            isLight
              ? 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
              : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white'
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={isGeneratingPrd}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-2.5 text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGeneratingPrd ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
              <span>Menyusun PRD & Roadmap...</span>
            </>
          ) : (
            <>
              <span>Susun PRD & Roadmap Arsitektur</span>
              <ArrowRight className="h-4 w-4 text-zinc-950" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
