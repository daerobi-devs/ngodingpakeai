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
      // Pre-select recommended option or first option by default
      if (q.recommendedOptionId) {
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

  // Compile answers into full PRDFormData
  const handleFinalSubmit = () => {
    const q1 = answers[questions[0]?.id] || [];
    const q2 = answers[questions[1]?.id] || [];
    const q3 = answers[questions[2]?.id] || [];
    const q4 = answers[questions[3]?.id] || [];
    const q5 = answers[questions[4]?.id] || [];

    const compiledTitle = idea.length > 60 ? idea.slice(0, 57) + '...' : idea;

    const coreProblem = q1.length > 0
      ? `Masalah pengguna saat ini: ${q1.join(', ')}. Pengguna membutuhkan solusi digital yang praktis untuk ${idea}.`
      : `Pengguna membutuhkan platform terintegrasi untuk ${idea}.`;

    const hypothesis = q2.length > 0
      ? `Dengan menyediakan aksi instan "${q2.join(', ')}", pengguna dapat menyelesaikan kebutuhan mereka lebih cepat tanpa kendala manual.`
      : `Dengan platform ini, efisiensi operasional dan kepuasan pengguna meningkat secara terukur.`;

    const strategyFit = q4.length > 0
      ? `Keunggulan kompetitif utama: ${q4.join(', ')}.`
      : `Fokus pada kemudahan akses dan reliabilitas sistem.`;

    const scopeFeatures = q3.length > 0 ? q3.join('\n') : `${idea}\nKatalog & Manajemen Data\nNotifikasi`;

    const retentionNotes = q5.length > 0
      ? `Faktor retensi & retargeting: ${q5.join(', ')}.`
      : 'User experience yang cepat dan responsif.';

    const formData: PRDFormData = {
      title: compiledTitle,
      opportunity_framing: {
        core_problem: coreProblem,
        working_hypothesis: hypothesis,
        strategy_fit: strategyFit,
      },
      boundaries: {
        scope: scopeFeatures,
        non_goals: 'Fitur di luar lingkup MVP tahap 1 sengaja ditunda agar fokus pada validasi produk dan stabilitas sistem awal.',
      },
      success_measurement: {
        offline_golden_set: 'Semua alur utama (happy path) lolos validasi tanpa error blocking.',
        human_review: 'Review usability ramah untuk pengguna baru (first-time user).',
        online_metrics: `Tingkat adopsi fitur utama > 75%, ${retentionNotes}`,
      },
      rollout_plan: {
        exposure: '100% rilis publik web responsive.',
        duration: 'Fase evaluasi 14 hari pasca peluncuran.',
        segments_gates: 'Pastikan performa loading < 2 detik dan tidak ada crash log di database.',
      },
      risk_management: {
        detection: 'Log error terpusat dan monitoring status API realtime.',
        fallback_kill_switch: 'Fallback mode baca-saja jika backend transaksi mengalami kendala.',
      },
      ownership_action: {
        primary_owner: 'Lead Developer / Product Owner',
        decision_points: 'Evaluasi metrik mingguan untuk menentukan prioritas fitur fase berikutnya.',
      },
      ai_specific: {
        behavior_contract: `Tech stack wajib: ${techStack.frontend}, ${techStack.backend}, ${techStack.database}.\nSistem harus menerapkan kode modular, type-safe, dan responsive.`,
        guardrails: 'Validasi input dengan Zod, sanitasi data, cegah SQL injection, dan gunakan environment variables aman.',
      },
    };

    onSubmitDiscovery(formData);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 px-4">
      {/* 1. Step Progress Indicator */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-10 text-xs sm:text-sm font-medium">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span>Input ide</span>
        </button>
        <div className="h-px w-8 sm:w-16 bg-amber-500/50" />
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
          <span>Klarifikasi kebutuhan</span>
        </div>
        <div className="h-px w-8 sm:w-16 bg-zinc-800" />
        <div className="flex items-center gap-2 text-zinc-500">
          <span className="flex h-2 w-2 rounded-full bg-zinc-700" />
          <span>Blueprint & Roadmap</span>
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

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleToggleOption(question, option.label)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'border border-amber-500 bg-amber-500/15 text-amber-300 font-semibold shadow-xs shadow-amber-500/10'
                          : isLight
                          ? 'border border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                          : 'border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-amber-400" />}
                      <span>{option.label}</span>
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
