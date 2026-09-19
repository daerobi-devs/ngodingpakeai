"use client";

import React, { useState } from "react";
import { PRDFormData, SectionKey, ClarificationQuestion } from "@/types/prd";
import { ClarifierModal } from "./ClarifierModal";
import { FIELD_PRESETS } from "@/lib/form-presets";
import { useAuth } from "@/context/AuthContext";
import {
  Network,
  Palette,
  Package,
  Target,
  Shield,
  BarChart3,
  Rocket,
  AlertTriangle,
  Users,
  Bot,
  Loader2,
  Plus,
  Wand2,
  ChevronDown,
  ChevronUp,
  Crown,
  SlidersHorizontal,
  CheckCircle2,
  Info,
} from "lucide-react";

interface PRDFormProps {
  formData: PRDFormData;
  onChange: (data: PRDFormData) => void;
  onSubmit: () => void;
  loading: boolean;
  statusStep: string;
  onOpenAssistant: (sectionKey: SectionKey) => void;
  apiKeyHeader?: string;
  preferredModel?: string;
  theme?: "dark" | "light";
}

export const PRDForm: React.FC<PRDFormProps> = ({
  formData,
  onChange,
  onSubmit,
  loading,
  statusStep,
  onOpenAssistant,
  apiKeyHeader,
  preferredModel,
  theme = "dark",
}) => {
  const { user, isPro, remainingTrials, systemSettings } = useAuth();
  const isLight = theme === "light";
  const [quickIdea, setQuickIdea] = useState("");
  const [autofilling, setAutofilling] = useState(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const [isClarifierOpen, setIsClarifierOpen] = useState(false);
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestion[]>([]);
  const [clarificationLoading, setClarificationLoading] = useState(false);
  const [isManualDetailOpen, setIsManualDetailOpen] = useState(false);

  // Helper to append a preset chip into a field
  const appendToField = (
    section: keyof PRDFormData,
    subfield: string,
    textToAdd: string
  ) => {
    const currentSection = formData[section] as Record<string, string>;
    const currentVal = currentSection[subfield] || "";
    const isBullet = textToAdd.startsWith("-") || textToAdd.startsWith("[");
    const formattedText = isBullet ? textToAdd : `- ${textToAdd}`;

    const updatedVal = currentVal.trim()
      ? `${currentVal.trim()}\n${formattedText}`
      : formattedText;

    onChange({
      ...formData,
      [section]: {
        ...currentSection,
        [subfield]: updatedVal,
      },
    });
  };

  const updateField = (
    section: keyof PRDFormData,
    subfield: string,
    val: string
  ) => {
    const currentSection = formData[section] as Record<string, string>;
    onChange({
      ...formData,
      [section]: {
        ...currentSection,
        [subfield]: val,
      },
    });
  };

  // Open Quick Clarifier (3 Multiple Choice Questions)
  const handleOpenClarifier = async () => {
    if (!quickIdea.trim()) return;
    setIsClarifierOpen(true);
    setClarificationLoading(true);
    setAutofillError(null);

    try {
      const res = await fetch("/api/generate-clarifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKeyHeader || "",
          "x-gemini-preferred-model": preferredModel || "",
        },
        body: JSON.stringify({ userIdea: quickIdea.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menghasilkan opsi klarifikasi");
      }

      setClarificationQuestions(json.data.questions);
    } catch (err: unknown) {
      console.warn("Clarification fetch error:", err);
    } finally {
      setClarificationLoading(false);
    }
  };

  // Apply selected clarifications and autofill the 7 categories
  const handleApplyClarifications = async (selectedAnswers: Record<string, string>) => {
    setIsClarifierOpen(false);
    setAutofilling(true);
    setAutofillError(null);

    try {
      const res = await fetch("/api/autofill-prd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKeyHeader || "",
          "x-gemini-preferred-model": preferredModel || "",
        },
        body: JSON.stringify({
          idea: quickIdea.trim(),
          clarifications: selectedAnswers,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal membuat formula PRD otomatis");
      }

      onChange(json.data);
    } catch (err: unknown) {
      setAutofillError(
        err instanceof Error ? err.message : "Gagal auto-fill form PRD"
      );
    } finally {
      setAutofilling(false);
    }
  };

  // AI 1-Click Auto formulate all 7 sections directly (Bypass)
  const handleAIAutoFill = async () => {
    if (!quickIdea.trim()) return;
    setAutofilling(true);
    setAutofillError(null);

    try {
      const res = await fetch("/api/autofill-prd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKeyHeader || "",
          "x-gemini-preferred-model": preferredModel || "",
        },
        body: JSON.stringify({ idea: quickIdea.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal membuat formula PRD otomatis");
      }

      onChange(json.data);
    } catch (err: unknown) {
      setAutofillError(
        err instanceof Error ? err.message : "Gagal auto-fill form PRD"
      );
    } finally {
      setAutofilling(false);
    }
  };

  const requiredFieldsCheck = [
    Boolean(formData.opportunity_framing.core_problem.trim()),
    Boolean(formData.opportunity_framing.working_hypothesis.trim()),
    Boolean(formData.boundaries.scope.trim()),
    Boolean(formData.boundaries.non_goals.trim()),
    Boolean(formData.success_measurement.online_metrics.trim()),
    Boolean(formData.risk_management.detection.trim()),
    Boolean(formData.risk_management.fallback_kill_switch.trim()),
    Boolean(formData.ownership_action.primary_owner.trim()),
    Boolean(formData.ai_specific.behavior_contract.trim()),
    Boolean(formData.ai_specific.guardrails.trim()),
  ];

  const totalRequired = requiredFieldsCheck.length;
  const completedRequired = requiredFieldsCheck.filter(Boolean).length;
  const isFormValid = completedRequired === totalRequired;

  return (
    <form
      id="prd-input-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (isFormValid && !loading) {
          onSubmit();
        }
      }}
      className="space-y-6 pb-28"
    >
      {/* AI Quick Auto-Architect Bar with Smart Clarifier */}
      <div className={`rounded-xl border p-5 sm:p-6 space-y-4 ${isLight ? "border-slate-300/90 bg-white/95 shadow-xs" : "border-zinc-800 bg-[#121215]"}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-amber-400" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
              Ketik 1 Kalimat Ide & Pilih Cara Isi Form:
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            Smart Clarifier + Form 7 Kategori Otomatis
          </span>
        </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={quickIdea}
              onChange={(e) => setQuickIdea(e.target.value)}
              placeholder="Misal: Aplikasi sewa lapangan futsal dengan DP QRIS otomatis & reminder WhatsApp"
              className={`flex-1 rounded-lg border px-3.5 py-2.5 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-white placeholder-zinc-500 focus:border-amber-500/50"}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && quickIdea.trim() && !autofilling) {
                  e.preventDefault();
                  handleOpenClarifier();
                }
              }}
            />

            {/* Primary Action: 3-Click Clarifier */}
            <button
              type="button"
              disabled={autofilling || !quickIdea.trim()}
              onClick={handleOpenClarifier}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-sm"
              title="Munculkan 3 opsi pilihan ganda untuk mengunci Tech Stack & Alur Bisnis"
            >
              <Target className="h-3.5 w-3.5" />
              <span>Pertajam Ide (3 Pilihan Ganda)</span>
            </button>

            {/* Direct Auto-Fill Bypass */}
            <button
              type="button"
              disabled={autofilling || !quickIdea.trim()}
              onClick={handleAIAutoFill}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer ${isLight ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900" : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"}`}
              title="Langsung isi semua kolom dengan tebakan default AI tanpa pertanyaan"
            >
              {autofilling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                  <span>Memformulasikan...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>Auto-Fill Langsung</span>
                </>
              )}
            </button>
          </div>

          {autofillError && (
            <p className="text-xs text-rose-400 font-medium mt-1">{autofillError}</p>
          )}
        </div>

      {/* Project Initiative Title */}
      <div className={`rounded-xl border p-5 sm:p-6 ${isLight ? "border-slate-300/90 bg-white/95 shadow-xs" : "border-zinc-800 bg-[#121215]"}`}>
        <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
          Nama / Judul Inisiatif Produk <span className="text-amber-400">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ""}
          onChange={(e) => onChange({ ...formData, title: e.target.value })}
          placeholder="Contoh: AI Code Review & Security Sentinel di GitHub PR"
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none transition-colors font-medium ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-white placeholder-zinc-600 focus:border-zinc-600"}`}
        />
      </div>

      
      {/* 💡 PROGRESSIVE DISCLOSURE: Status Indicator & Collapsible 7 Categories Toggle */}
      <div className="space-y-3 pt-1">
        {/* Friendly Success Banner when Form is complete */}
        {isFormValid && (
          <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border animate-in fade-in duration-300 ${
            isLight
              ? "bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isLight ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/20 text-emerald-400"
              }`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Semua 10 Kolom Spesifikasi Utama Siap Diproses!</p>
                <p className={`text-[11px] mt-0.5 ${isLight ? "text-emerald-800" : "text-emerald-400/80"}`}>
                  Kamu bisa langsung klik tombol kuning &ldquo;Generate PRD Mendalam&rdquo; di bawah, atau buka detail jika ingin mengedit kolom teknis.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsManualDetailOpen(!isManualDetailOpen)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                isLight
                  ? "bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100/60"
                  : "bg-zinc-900 border-emerald-500/40 text-emerald-400 hover:bg-zinc-800"
              }`}
            >
              {isManualDetailOpen ? "Sembunyikan Form Detail" : "Review / Edit Detail Spesifikasi"}
            </button>
          </div>
        )}

        {/* Collapsible Accordion Trigger Button */}
        <button
          type="button"
          onClick={() => setIsManualDetailOpen(!isManualDetailOpen)}
          className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
            isLight
              ? "bg-white/95 border-slate-300 hover:border-slate-400 hover:bg-white text-slate-900 shadow-xs"
              : "bg-[#121215] border-zinc-800 hover:border-zinc-700 text-zinc-200"
          }`}
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg border shrink-0 ${
              isLight
                ? "bg-amber-100 border-amber-300 text-amber-800"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}>
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold tracking-tight">
                  Kustomisasi & Edit Manual (7 Kategori Principal Engineer)
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isFormValid
                    ? isLight
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : isLight
                    ? "bg-slate-200 text-slate-700 border-slate-300"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}>
                  {completedRequired} dari {totalRequired} Kolom Terisi
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600 font-medium" : "text-zinc-400"}`}>
                {isManualDetailOpen
                  ? "Klik untuk melipat formulir 7 kategori"
                  : "Klik untuk membuka & mengubah manual: Problem, Fitur Web, Metrics KPI, Rollout, Risk, Ownership, AI Rules"}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border shrink-0 transition-colors ${
            isLight
              ? "bg-slate-100 border-slate-300 text-slate-800"
              : "bg-zinc-800 border-zinc-700 text-zinc-300"
          }`}>
            <span>{isManualDetailOpen ? "Tutup Form" : "Buka Form"}</span>
            {isManualDetailOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>
      </div>

      {/* 7 Categories Form Container — Collapsible with smooth transition */}
      {isManualDetailOpen && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* 1. OPPORTUNITY FRAMING */}
      <div className={`rounded-xl border p-5 sm:p-6 space-y-4 ${isLight ? "border-slate-300/90 bg-white/95 shadow-xs" : "border-zinc-800 bg-[#121215]"}`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${isLight ? "border-slate-100" : "border-zinc-800"} pb-4`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-zinc-800 text-zinc-200 border-zinc-700/60"}`}>
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                1. Opportunity Framing
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-zinc-400"}`}>
                Akar masalah terukur, hipotesis nilai, dan keselarasan strategis.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setIsManualDetailOpen(true); onOpenAssistant("opportunity_framing"); }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${isLight ? "border-slate-300 bg-slate-200/90 text-slate-800 hover:border-slate-400 hover:bg-slate-300 hover:text-slate-950 font-medium" : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white"}`}
          >
            <Bot className="h-3.5 w-3.5 text-amber-400" />
            <span>Bantu Formulasikan</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Core Problem <span className="text-amber-400 font-bold">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.opportunity_framing.core_problem}
              onChange={(e) =>
                updateField("opportunity_framing", "core_problem", e.target.value)
              }
              placeholder="Uraikan masalah inti dalam 1 kalimat padat dan terukur..."
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>

          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Working Hypothesis <span className="text-amber-400 font-bold">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.opportunity_framing.working_hypothesis}
              onChange={(e) =>
                updateField("opportunity_framing", "working_hypothesis", e.target.value)
              }
              placeholder="Solusi terukur dan mekanisme nilainya..."
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>

          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Strategy Fit <span className="text-zinc-500 text-[11px] font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={formData.opportunity_framing.strategy_fit || ""}
              onChange={(e) =>
                updateField("opportunity_framing", "strategy_fit", e.target.value)
              }
              placeholder="Inisiatif strategis atau peluang jangka panjang yang dibuka..."
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>
        </div>
      </div>

      {/* 2. BOUNDARIES (Fitur Utama Web & Batasan MVP) with Clickable Chips */}
      <div className={`rounded-xl border p-5 sm:p-6 space-y-4 ${isLight ? "border-slate-300/90 bg-white/95 shadow-xs" : "border-zinc-800 bg-[#121215]"}`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${isLight ? "border-slate-100" : "border-zinc-800"} pb-4`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-zinc-800 text-zinc-200 border-zinc-700/60"}`}>
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                2. Boundaries (Fitur Utama Web & Batasan MVP)
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-zinc-400"}`}>
                Definisikan fitur utama yang akan dibangun serta batasan (non-goals) agar AI coding agent fokus dan tidak overengineering.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setIsManualDetailOpen(true); onOpenAssistant("boundaries"); }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${isLight ? "border-slate-300 bg-slate-200/90 text-slate-800 hover:border-slate-400 hover:bg-slate-300 hover:text-slate-950 font-medium" : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white"}`}
          >
            <Bot className="h-3.5 w-3.5 text-amber-400" />
            <span>Asisten Scope</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Scope Column */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold block ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Scope (Fitur Utama yang Dibangun & Alur Kerja) <span className="text-amber-400 font-bold">*</span>
            </label>

            {/* Clickable Preset Chips */}
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className={`text-[10px] font-semibold uppercase w-full ${isLight ? "text-slate-600 font-medium" : "text-zinc-400"}`}>
                Klik Tambah Scope:
              </span>
              {FIELD_PRESETS.scope.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => appendToField("boundaries", "scope", chip)}
                  className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors cursor-pointer ${isLight ? "border-slate-300 bg-slate-200/90 text-slate-800 hover:border-slate-400 hover:bg-slate-300 hover:text-slate-950 font-medium" : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"}`}
                >
                  <Plus className="h-3 w-3 text-zinc-400" />
                  <span>{chip}</span>
                </button>
              ))}
            </div>

            <textarea
              rows={5}
              required
              value={formData.boundaries.scope}
              onChange={(e) => updateField("boundaries", "scope", e.target.value)}
              placeholder="- Fitur yang termasuk..."
              className={`w-full rounded-lg border px-3.5 py-2 text-xs font-mono focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>

          {/* Non-Goals Column */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold block ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Non-Goals (Batasan MVP & Hal yang Dilarang) <span className="text-amber-400 font-bold">*</span>
            </label>

            {/* Clickable Non-Goals Chips */}
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className={`text-[10px] font-semibold uppercase w-full ${isLight ? "text-slate-600 font-medium" : "text-zinc-400"}`}>
                Klik Tambah Non-Goals:
              </span>
              {FIELD_PRESETS.non_goals.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => appendToField("boundaries", "non_goals", chip)}
                  className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors cursor-pointer ${isLight ? "border-slate-300 bg-slate-200/90 text-slate-800 hover:border-slate-400 hover:bg-slate-300 hover:text-slate-950 font-medium" : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"}`}
                >
                  <Plus className="h-3 w-3 text-zinc-400" />
                  <span>{chip}</span>
                </button>
              ))}
            </div>

            <textarea
              rows={5}
              required
              value={formData.boundaries.non_goals}
              onChange={(e) => updateField("boundaries", "non_goals", e.target.value)}
              placeholder="- Hal yang sengaja dilarang..."
              className={`w-full rounded-lg border px-3.5 py-2 text-xs font-mono focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>
        </div>
      </div>

      {/* 3. SUCCESS MEASUREMENT with Clickable KPI Chips */}
      <div className={`rounded-xl border p-5 sm:p-6 space-y-4 ${isLight ? "border-slate-300/90 bg-white/95 shadow-xs" : "border-zinc-800 bg-[#121215]"}`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${isLight ? "border-slate-100" : "border-zinc-800"} pb-4`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-zinc-800 text-zinc-200 border-zinc-700/60"}`}>
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                3. Success Measurement
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-zinc-400"}`}>
                Tentukan KPI target dan metode validasi kualitas.
              </p>
            </div>
          </div>
        </div>

        {/* Clickable Metrics Chips */}
        <div className={`flex flex-wrap gap-1.5 p-3 rounded-lg border ${isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800"}`}>
          <span className={`text-[10px] font-semibold uppercase w-full ${isLight ? "text-slate-600 font-medium" : "text-zinc-400"}`}>
            Klik Chip untuk Menambah Online Metrics & KPI:
          </span>
          {FIELD_PRESETS.metrics.map((metric, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() =>
                appendToField("success_measurement", "online_metrics", metric)
              }
              className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors cursor-pointer ${isLight ? "border-slate-300 bg-slate-200/90 text-slate-800 hover:border-slate-400 hover:bg-slate-300 hover:text-slate-950 font-medium" : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"}`}
            >
              <Plus className="h-3 w-3 text-zinc-400" />
              <span>{metric}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Offline Golden Set <span className="text-zinc-500 text-[11px] font-normal">(Opsional)</span>
            </label>
            <textarea
              rows={3}
              value={formData.success_measurement.offline_golden_set || ""}
              onChange={(e) =>
                updateField("success_measurement", "offline_golden_set", e.target.value)
              }
              placeholder="Dataset pengujian benchmark..."
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>

          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Human Review <span className="text-zinc-500 text-[11px] font-normal">(Opsional)</span>
            </label>
            <textarea
              rows={3}
              value={formData.success_measurement.human_review || ""}
              onChange={(e) =>
                updateField("success_measurement", "human_review", e.target.value)
              }
              placeholder="Sampling review kualitatif manusia..."
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>

          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Online Metrics & KPI <span className="text-amber-400 font-bold">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={formData.success_measurement.online_metrics}
              onChange={(e) =>
                updateField("success_measurement", "online_metrics", e.target.value)
              }
              placeholder="KPI terukur beserta target angkanya..."
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>
        </div>
      </div>

      {/* 4. ROLLOUT PLAN & 5. RISK MANAGEMENT with Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Rollout Plan */}
        <div className={`rounded-xl border p-5 sm:p-6 space-y-3 ${isLight ? "border-slate-300/90 bg-white/95 shadow-xs" : "border-zinc-800 bg-[#121215]"}`}>
          <div className={`flex items-center justify-between border-b ${isLight ? "border-slate-100" : "border-zinc-800"} pb-3 mb-2`}>
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-zinc-300" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                4. Rollout Plan
              </h3>
            </div>
          </div>

          {/* Rollout preset chips */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {FIELD_PRESETS.rollout.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  updateField(
                    "rollout_plan",
                    idx === 0
                      ? "exposure"
                      : idx === 1
                      ? "duration"
                      : "segments_gates",
                    chip
                  )
                }
                className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors cursor-pointer ${isLight ? "border-slate-300 bg-slate-200/90 text-slate-800 hover:border-slate-400 hover:bg-slate-300 hover:text-slate-950 font-medium" : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"}`}
              >
                <Plus className="h-3 w-3 text-zinc-400" />
                <span>{chip}</span>
              </button>
            ))}
          </div>

          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Exposure (% traffic/user awal)
            </label>
            <input
              type="text"
              value={formData.rollout_plan.exposure || ""}
              onChange={(e) => updateField("rollout_plan", "exposure", e.target.value)}
              placeholder="Misal: 5% tim internal di minggu ke-1"
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Duration (Lama pengujian)
            </label>
            <input
              type="text"
              value={formData.rollout_plan.duration || ""}
              onChange={(e) => updateField("rollout_plan", "duration", e.target.value)}
              placeholder="Misal: 4 minggu masa uji"
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Segments & Ramp Gates (Kriteria naik tahap)
            </label>
            <input
              type="text"
              value={formData.rollout_plan.segments_gates || ""}
              onChange={(e) =>
                updateField("rollout_plan", "segments_gates", e.target.value)
              }
              placeholder="Misal: Error rate < 0.2% dan zero data leak"
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>
        </div>

        {/* Risk Management */}
        <div className={`rounded-xl border p-5 sm:p-6 space-y-3 ${isLight ? "border-slate-300/90 bg-white/95 shadow-xs" : "border-zinc-800 bg-[#121215]"}`}>
          <div className={`flex items-center justify-between border-b ${isLight ? "border-slate-100" : "border-zinc-800"} pb-3 mb-2`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-zinc-300" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                5. Risk Management
              </h3>
            </div>
          </div>

          {/* Risk chips */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {FIELD_PRESETS.killSwitch.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  appendToField("risk_management", "fallback_kill_switch", chip)
                }
                className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors cursor-pointer ${isLight ? "border-slate-300 bg-slate-200/90 text-slate-800 hover:border-slate-400 hover:bg-slate-300 hover:text-slate-950 font-medium" : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"}`}
              >
                <Plus className="h-3 w-3 text-zinc-400" />
                <span>{chip}</span>
              </button>
            ))}
          </div>

          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Detection (Deteksi Masalah) <span className="text-amber-400 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.risk_management.detection}
              onChange={(e) =>
                updateField("risk_management", "detection", e.target.value)
              }
              placeholder="Contoh: Alert Sentry timeout dan lonjakan HTTP 5xx"
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Fallback & Kill Switch <span className="text-amber-400 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.risk_management.fallback_kill_switch}
              onChange={(e) =>
                updateField("risk_management", "fallback_kill_switch", e.target.value)
              }
              placeholder="Contoh: Toggle feature flag di admin panel untuk fallback ke sistem lama"
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>
        </div>
      </div>

      {/* 6. OWNERSHIP & ACTION */}
      <div className={`rounded-xl border p-5 sm:p-6 ${isLight ? "border-slate-300/90 bg-white/95 shadow-xs" : "border-zinc-800 bg-[#121215]"}`}>
        <div className={`flex items-center gap-2 border-b ${isLight ? "border-slate-100" : "border-zinc-800"} pb-3 mb-4`}>
          <Users className="h-4 w-4 text-zinc-300" />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
            6. Ownership & Action
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Primary Owner (PIC) <span className="text-amber-400 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.ownership_action.primary_owner}
              onChange={(e) =>
                updateField("ownership_action", "primary_owner", e.target.value)
              }
              placeholder="Contoh: Alex (Lead Architect) & Maya (Product Lead)"
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Decision Points & Review Cadence
            </label>
            <input
              type="text"
              value={formData.ownership_action.decision_points || ""}
              onChange={(e) =>
                updateField("ownership_action", "decision_points", e.target.value)
              }
              placeholder="Contoh: Evaluasi mingguan; go/no-go rilis publik akhir Wk 4"
              className={`w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>
        </div>
      </div>

      {/* 7. AI-SPECIFIC ADDITIONS (Behavior Contract GOOD vs REJECT & Guardrails) */}
      <div className={`rounded-xl border p-5 sm:p-6 space-y-4 ${isLight ? "border-slate-300/90 bg-white/95 shadow-xs" : "border-zinc-800 bg-[#121215]"}`}>
        <div className={`flex items-center gap-2 border-b ${isLight ? "border-slate-100" : "border-zinc-800"} pb-4`}>
          <Bot className="h-4 w-4 text-amber-400" />
          <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
            <span>7. AI-Specific Additions</span>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-zinc-800 text-zinc-300 border-zinc-700"}`}>
              Modern PRD Core
            </span>
          </h3>
        </div>

        {/* Behavior Contract Chips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* GOOD PRESETS */}
          <div className="space-y-2">
            <span className={`text-[10px] font-semibold uppercase block ${isLight ? "text-slate-600 font-medium" : "text-zinc-400"}`}>
              Klik Tambah Aturan GOOD (Wajib Dilakukan):
            </span>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {FIELD_PRESETS.behaviorGood.map((goodChip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    appendToField("ai_specific", "behavior_contract", `[GOOD] ${goodChip}`)
                  }
                  className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors cursor-pointer text-left ${isLight ? "border-slate-300 bg-slate-200/90 text-slate-800 hover:border-slate-400 hover:bg-slate-300 hover:text-slate-950 font-medium" : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"}`}
                >
                  <Plus className="h-3 w-3 text-zinc-400 shrink-0" />
                  <span>{goodChip}</span>
                </button>
              ))}
            </div>

            <label className={`text-xs font-semibold block ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Behavior Contract (GOOD vs REJECT) <span className="text-amber-400 font-bold">*</span>
            </label>
            <textarea
              rows={5}
              required
              value={formData.ai_specific.behavior_contract}
              onChange={(e) =>
                updateField("ai_specific", "behavior_contract", e.target.value)
              }
              placeholder="[GOOD]:&#10;- Selalu sertakan alasan teknis dan diff solusi&#10;&#10;[REJECT]:&#10;- Dilarang mengubah file di luar cakupan PR"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>

          {/* REJECT PRESETS */}
          <div className="space-y-2">
            <span className={`text-[10px] font-semibold uppercase block ${isLight ? "text-slate-600 font-medium" : "text-zinc-400"}`}>
              Klik Tambah Aturan REJECT (Dilarang):
            </span>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {FIELD_PRESETS.behaviorReject.map((rejChip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    appendToField("ai_specific", "behavior_contract", `[REJECT] ${rejChip}`)
                  }
                  className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors cursor-pointer text-left ${isLight ? "border-slate-300 bg-slate-200/90 text-slate-800 hover:border-slate-400 hover:bg-slate-300 hover:text-slate-950 font-medium" : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"}`}
                >
                  <Plus className="h-3 w-3 text-zinc-400 shrink-0" />
                  <span>{rejChip}</span>
                </button>
              ))}
            </div>

            <label className={`text-xs font-semibold block ${isLight ? "text-slate-900 font-bold" : "text-zinc-300"}`}>
              Guardrails Teknis & Keamanan <span className="text-amber-400 font-bold">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {FIELD_PRESETS.guardrails.map((grChip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => appendToField("ai_specific", "guardrails", grChip)}
                  className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors cursor-pointer text-left ${isLight ? "border-slate-300 bg-slate-200/90 text-slate-800 hover:border-slate-400 hover:bg-slate-300 hover:text-slate-950 font-medium" : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"}`}
                >
                  <Plus className="h-3 w-3 text-zinc-400 shrink-0" />
                  <span>{grChip}</span>
                </button>
              ))}
            </div>

            <textarea
              rows={5}
              required
              value={formData.ai_specific.guardrails}
              onChange={(e) => updateField("ai_specific", "guardrails", e.target.value)}
              placeholder="- Sanitasi input prompt injection&#10;- Masking PII..."
              className={`w-full rounded-lg border px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-colors ${isLight ? "border-slate-300 bg-[#f1f3f7] text-slate-950 placeholder:text-slate-500 focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium" : "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500"}`}
            />
          </div>
        </div>
      </div>

      
        </div>
      )}
{/* Floating Action Bar */}
      <div className={`sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-xl backdrop-blur-md ${isLight ? "border-slate-200 bg-white/95 text-slate-800" : "border-zinc-800 bg-[#121215]/95 text-zinc-300"}`}>
        <div className="flex items-center gap-2.5 text-xs">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              isFormValid
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}
          >
            {completedRequired}
          </div>
          <span className={`${isLight ? "text-slate-700" : "text-zinc-300"}`}>
            {isFormValid ? (
              <span className="text-emerald-400 font-semibold">
                Semua {totalRequired} kolom wajib terisi lengkap
              </span>
            ) : (
              <span>
                {completedRequired} dari {totalRequired} kolom wajib terisi (gunakan AI Clarifier atau chip saran)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isPro && (
            <span className={`text-xs font-medium hidden sm:inline ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Kuota: <strong className="text-amber-500 font-mono font-bold">{user ? `${remainingTrials}x` : `${systemSettings?.trial_limit ?? 1}x`}</strong> tersisa
            </span>
          )}

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-2.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                <span>{statusStep || "Menghasilkan PRD Mendalam..."}</span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                <span>Generate PRD Mendalam (Gemini Flash)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Clarifier Modal (3-Question Instant Multiple Choice) */}
      <ClarifierModal
        isOpen={isClarifierOpen}
        userIdea={quickIdea}
        questions={clarificationQuestions}
        loading={clarificationLoading}
        onClose={() => setIsClarifierOpen(false)}
        onSubmitClarifications={handleApplyClarifications}
        theme={theme}
      />
    </form>
  );
};
