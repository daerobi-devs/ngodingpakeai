"use client";

import React, { useState } from "react";
import { X, Bot, Send, Copy, Check, Loader2, Lightbulb } from "lucide-react";
import { SectionKey } from "@/types/prd";
import { SECTION_METADATA } from "@/lib/gemini/prompts";

interface SectionAssistantModalProps {
  isOpen: boolean;
  sectionKey: SectionKey | null;
  currentValues: Record<string, string>;
  apiKeyHeader: string;
  preferredModel?: string;
  onClose: () => void;
  onApplyText?: (text: string) => void;
}

export const SectionAssistantModal: React.FC<SectionAssistantModalProps> = ({
  isOpen,
  sectionKey,
  currentValues,
  apiKeyHeader,
  preferredModel,
  onClose,
  onApplyText,
}) => {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !sectionKey) return null;

  const meta = SECTION_METADATA[sectionKey];

  const handleSend = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt || userInput;
    setLoading(true);
    setStreamedResponse("");

    try {
      const res = await fetch("/api/assist-section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKeyHeader,
          "x-gemini-preferred-model": preferredModel || "",
        },
        body: JSON.stringify({
          sectionKey,
          currentValues,
          userMessage: promptToSend,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setStreamedResponse(
          `Error: ${errorData.error || "Gagal mendapatkan saran dari asisten AI"}`
        );
        setLoading(false);
        return;
      }

      if (!res.body) {
        setStreamedResponse("Respons tidak memiliki stream");
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamedResponse((prev) => prev + chunk);
      }
    } catch (err: unknown) {
      setStreamedResponse(
        `Error: ${err instanceof Error ? err.message : "Koneksi terputus"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(streamedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickPrompts: Record<SectionKey, string[]> = {
    opportunity_framing: [
      "Bantu rumuskan Core Problem & Hipotesis dalam 1 kalimat tajam",
      "Kaitkan dengan strategi pertumbuhan jangka panjang",
    ],
    boundaries: [
      "Susun 4 fitur utama Scope dan 3 poin Non-Goals penting",
      "Apa saja hal yang harus dicegah agar AI agent tidak over-engineering?",
    ],
    success_measurement: [
      "Berikan contoh KPI online kuantitatif dengan threshold spesifik",
      "Susun kriteria Golden Set untuk validasi akurasi AI",
    ],
    rollout_plan: [
      "Rancang persentase rollout bertahap (canary ke 100%) dan durasinya",
      "Tentukan Quality Gate sebelum naik fase",
    ],
    risk_management: [
      "Apa metrik deteksi dini jika model berhalusinasi atau error?",
      "Rancang mekanisme kill-switch instan tanpa downtime",
    ],
    ownership_action: [
      "Siapa saja peran penanggung jawab utama dan kapan review berkala?",
    ],
    ai_specific: [
      "Tuliskan minimal 2 poin GOOD wajib dan 2 poin REJECT ketat",
      "Susun guardrails keamanan prompt injection dan batas token",
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-zinc-800 bg-[#121215] shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-[#09090b]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Asisten PRD: {meta.title}
              </h3>
              <p className="text-xs text-zinc-400">{meta.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Section Tip */}
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-300">
            <Lightbulb className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold text-amber-400">Tips PRD Modern: </span>
              <span className="text-zinc-300">{meta.tips}</span>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Saran Prompt Cepat:
            </label>
            <div className="flex flex-wrap gap-2">
              {quickPrompts[sectionKey]?.map((qp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setUserInput(qp);
                    handleSend(qp);
                  }}
                  disabled={loading}
                  className="rounded-lg border border-zinc-800 bg-[#09090b] px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-700 hover:text-white transition-all text-left shadow-sm"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Assistant Stream Output */}
          {streamedResponse && (
            <div className="relative rounded-xl border border-zinc-800 bg-[#09090b] p-4 font-sans text-xs leading-relaxed text-zinc-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                  <Bot className="h-3 w-3" /> Rekomendasi Asisten:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-md bg-[#121215] border border-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" /> Disalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Salin Teks
                      </>
                    )}
                  </button>
                  {onApplyText && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyText(streamedResponse);
                        onClose();
                      }}
                      className="rounded-md bg-amber-500 px-3 py-1 text-[11px] font-bold text-zinc-950 hover:bg-amber-400 shadow-sm transition-colors"
                    >
                      Terapkan ke Form
                    </button>
                  )}
                </div>
              </div>
              <div className="whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed text-zinc-300">
                {streamedResponse}
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="border-t border-zinc-800 p-4 bg-[#09090b]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (userInput.trim()) handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={`Tanya ide atau diskusikan ${meta.title}...`}
              className="flex-1 rounded-lg border border-zinc-800 bg-[#121215] px-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
            <button
              type="submit"
              disabled={loading || !userInput.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50 transition-colors shrink-0 shadow-sm"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Kirim</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
