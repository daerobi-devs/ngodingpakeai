"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Loader2,
  Layers,
  CreditCard,
  Target,
  ArrowRight,
  Wand2,
} from "lucide-react";
import { ClarificationQuestion } from "@/types/prd";

interface ClarifierModalProps {
  isOpen: boolean;
  userIdea: string;
  questions: ClarificationQuestion[];
  loading: boolean;
  onClose: () => void;
  onSubmitClarifications: (selectedMap: Record<string, string>) => void;
  theme?: "dark" | "light";
}

export const ClarifierModal: React.FC<ClarifierModalProps> = ({
  isOpen,
  userIdea,
  questions,
  loading,
  onClose,
  onSubmitClarifications,
  theme = "dark",
}) => {
  const isLight = theme === "light";
  // selectedAnswers: { [questionId]: optionId }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  // Auto-select recommended options whenever questions change
  useEffect(() => {
    if (questions && questions.length > 0) {
      const initial: Record<string, string> = {};
      questions.forEach((q) => {
        initial[q.id] = q.recommendedOptionId || q.options[0]?.id;
      });
      setSelectedAnswers(initial);
    }
  }, [questions]);

  if (!isOpen) return null;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleApply = () => {
    // Build human readable map: { [category]: selected_label }
    const result: Record<string, string> = {};
    questions.forEach((q) => {
      const selectedOptId = selectedAnswers[q.id];
      const opt = q.options.find((o) => o.id === selectedOptId);
      if (opt) {
        result[q.category] = `${opt.label} (${opt.description || ""})`;
      }
    });
    onSubmitClarifications(result);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "tech_stack":
        return <Layers className="h-4 w-4 text-amber-500" />;
      case "core_flow":
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      default:
        return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border shadow-2xl overflow-hidden ${
        isLight
          ? "border-slate-200 bg-white text-slate-900"
          : "border-zinc-800 bg-[#121215] text-zinc-100"
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-6 py-4 ${
          isLight ? "border-slate-200 bg-slate-50/80" : "border-zinc-800 bg-[#09090b]"
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-sm">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h3 className={`font-semibold text-base flex items-center gap-2 ${
                isLight ? "text-slate-900" : "text-white"
              }`}>
                Quick Clarifier: Pertajam Spesifikasi Produk
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  3-Klik Instan
                </span>
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Pilih keputusan teknis kunci di bawah (tanpa perlu mengetik panjang).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`rounded-lg p-1.5 transition-colors ${
              isLight
                ? "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Idea Context Banner */}
        <div className={`border-b px-6 py-3 flex items-center gap-2.5 ${
          isLight ? "border-slate-200 bg-slate-100/70" : "border-zinc-800 bg-zinc-900/50"
        }`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider shrink-0 ${
            isLight ? "text-slate-500" : "text-zinc-400"
          }`}>
            Ide Anda:
          </span>
          <p className={`text-xs font-medium truncate italic ${
            isLight ? "text-slate-800" : "text-zinc-200"
          }`}>
            &ldquo;{userIdea}&rdquo;
          </p>
        </div>

        {/* Question Cards Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
              <p className="text-sm font-medium text-zinc-200">
                Menganalisis ide & menyiapkan 3 opsi teknis terbaik...
              </p>
              <p className="text-xs text-zinc-500">
                Menghubungkan ke Gemini Flash untuk arsitektur optimal
              </p>
            </div>
          ) : (
            questions.map((q, idx) => {
              const selectedOptId = selectedAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-4.5 space-y-3 ${
                    isLight
                      ? "border-slate-200 bg-slate-50/80"
                      : "border-zinc-800 bg-[#09090b]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                        isLight
                          ? "bg-white border-slate-200 shadow-xs"
                          : "bg-zinc-800 border-zinc-700"
                      }`}>
                        {getCategoryIcon(q.category)}
                      </div>
                      <span className={`text-xs font-semibold ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}>
                        {idx + 1}. {q.question}
                      </span>
                    </div>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                    {q.options.map((opt) => {
                      const isSelected = selectedOptId === opt.id;
                      const isRecommended = q.recommendedOptionId === opt.id;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt.id)}
                          className={`relative flex flex-col text-left p-3 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? isLight
                                ? "border-amber-500 bg-amber-50 text-slate-950 shadow-sm ring-1 ring-amber-500"
                                : "border-amber-500 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-500"
                              : isLight
                              ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100/60"
                              : "border-zinc-800 bg-[#121215] text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className={`text-xs font-bold leading-snug ${
                              isSelected ? (isLight ? "text-amber-950" : "text-amber-300") : ""
                            }`}>
                              {opt.label}
                            </span>
                            {isSelected && (
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-zinc-950">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          {opt.description && (
                            <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                              isLight ? "text-slate-500" : "text-zinc-400"
                            }`}>
                              {opt.description}
                            </p>
                          )}
                          {isRecommended && (
                            <span className={`mt-2 inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded w-fit ${
                              isLight
                                ? "text-amber-800 bg-amber-100/80 border border-amber-300"
                                : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                            }`}>
                              <Check className="h-2.5 w-2.5" /> Rekomendasi
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className={`border-t p-4 flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isLight ? "border-slate-200 bg-slate-50/80" : "border-zinc-800 bg-[#09090b]"
        }`}>
          <button
            type="button"
            onClick={() => {
              // Reset to all recommended
              const rec: Record<string, string> = {};
              questions.forEach((q) => {
                rec[q.id] = q.recommendedOptionId || q.options[0]?.id;
              });
              setSelectedAnswers(rec);
            }}
            disabled={loading}
            className={`text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight ? "text-slate-500 hover:text-slate-900" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Wand2 className="h-3.5 w-3.5 text-amber-500" />
            <span>Reset ke Opsi Rekomendasi</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 sm:flex-none rounded-lg border px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  : "border-zinc-800 bg-[#121215] text-zinc-300 hover:text-white hover:border-zinc-700"
              }`}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={loading || questions.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <span>Terapkan & Isi Form</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
