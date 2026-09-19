"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Shield,
  Cpu,
} from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKeys: (keys: string[], preferredModel?: string) => void;
  currentKeys: string[];
  currentPreferredModel?: string;
  required?: boolean;
}

const PRESET_GEMINI_MODELS = [
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    tag: "Terbaru & Paling Pintar",
    desc: "Optimasi coding & reasoning arsitektur tajam untuk Cursor & Claude Code",
    badge: "Rekomendasi Utama",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    tag: "Agentic & High-Speed",
    desc: "Dioptimalkan untuk eksekusi agentic cepat & formulasi PRD presisi",
    badge: "Super Cepat",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    tag: "Ultra Low-Latency",
    desc: "Konsumsi token hemat dan respon instan untuk koneksi terbatas",
    badge: "Ringan & Hemat",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash Latest",
    tag: "Auto-Track Terbaru",
    desc: "Selalu mengarah otomatis ke rilis Gemini Flash stabil terkini Google",
    badge: "Auto Sync",
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    tag: "Deep Reasoning",
    desc: "Analisis sistematis mendalam cocok untuk produk skala enterprise",
    badge: "PRO Grade",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    tag: "LTS Stable",
    desc: "Versi 2.5 teruji dengan konsistensi output data JSON tinggi",
    badge: "Stabil",
    badgeClass: "border-zinc-700/40 bg-zinc-800/40 text-zinc-300",
  },
];

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaveKeys,
  currentKeys,
  currentPreferredModel,
  required = false,
}) => {
  const [inputVal, setInputVal] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.8-flash");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelVal, setCustomModelVal] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    message: string;
    models?: string[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputVal(currentKeys.join("\n"));
      setTestResult(null);

      let initialModel = currentPreferredModel;
      if (!initialModel && typeof window !== "undefined") {
        initialModel = localStorage.getItem("gemini_preferred_model") || "";
      }
      if (initialModel) {
        const isPreset = PRESET_GEMINI_MODELS.some((m) => m.id === initialModel);
        if (isPreset) {
          setSelectedModel(initialModel);
          setIsCustomModel(false);
        } else {
          setIsCustomModel(true);
          setCustomModelVal(initialModel);
        }
      }
    }
  }, [isOpen, currentKeys, currentPreferredModel]);

  if (!isOpen) return null;

  const handleSave = () => {
    const parsed = inputVal
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const activeModel = isCustomModel ? customModelVal.trim() : selectedModel;
    onSaveKeys(parsed, activeModel || undefined);
    onClose();
  };

  const handleTestConnection = async () => {
    const parsedKeys = inputVal
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (parsedKeys.length === 0) {
      setTestResult({
        valid: false,
        message: "Masukkan minimal 1 API Key untuk diuji",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const firstKey = parsedKeys[0];
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: firstKey }),
      });

      const data = await res.json();
      setTestResult({
        valid: data.valid,
        message: data.message,
        models: data.availableModels,
      });
    } catch {
      setTestResult({
        valid: false,
        message: "Gagal terhubung ke server validasi",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-[#111114] p-6 shadow-2xl text-zinc-100 my-auto">
        {/* Close Button - hidden if required and no keys yet */}
        {!required && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/60 text-amber-400">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Pengaturan Gemini API Key & Model</span>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] text-amber-400 font-semibold">
                BYOK
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              {required 
                ? "Sistem mewajibkan penggunaan Gemini API Key pribadi untuk memulai pembuatan PRD"
                : "Mendukung Gemini 3.5 hingga 3.8 & Rotasi Kunci Otomatis"}
            </p>
          </div>
        </div>

        {/* 1-Minute Clean Guide Banner */}
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-950/15 p-4 text-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-500/15">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Key className="h-4 w-4 text-amber-400" />
              <span>Panduan Dapatkan Kunci Gratis 1-Menit</span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-zinc-950 font-bold text-[11px] hover:bg-amber-400 transition-colors shadow-xs"
            >
              Buka Google AI Studio <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
            <div className="rounded-lg bg-zinc-900/80 border border-zinc-800/80 p-2.5">
              <span className="font-mono text-[10px] font-bold text-amber-400 block mb-1">LANGKAH 01</span>
              <p className="text-[11px] text-zinc-300 font-medium">Buka Google AI Studio</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Login menggunakan akun Google apapun (100% gratis)</p>
            </div>
            <div className="rounded-lg bg-zinc-900/80 border border-zinc-800/80 p-2.5">
              <span className="font-mono text-[10px] font-bold text-amber-400 block mb-1">LANGKAH 02</span>
              <p className="text-[11px] text-zinc-300 font-medium">Klik &quot;Create API Key&quot;</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Pilih Create in new project dalam 1 klik instan</p>
            </div>
            <div className="rounded-lg bg-zinc-900/80 border border-zinc-800/80 p-2.5">
              <span className="font-mono text-[10px] font-bold text-amber-400 block mb-1">LANGKAH 03</span>
              <p className="text-[11px] text-zinc-300 font-medium">Salin &amp; Tempel di Sini</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Paste kode key di kolom bawah lalu simpan</p>
            </div>
          </div>
        </div>

        {/* Universal Support & Local Storage Notice */}
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-3 text-xs text-emerald-300">
          <Shield className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-200">Kunci Tersimpan Aman Secara Lokal:</span>
            <p className="text-[11px] text-emerald-300/80 mt-0.5 leading-relaxed">
              API key disimpan langsung di memori browser Anda (<code>localStorage</code>) dan tidak pernah disimpan di database server kami.
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-zinc-300 block">
            Gemini API Key (tempel 1 per baris untuk multi-key pool):
          </label>
          <textarea
            rows={3}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="AIzaSy... (tempel 1 per baris untuk multi-key pool)"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
          <p className="text-[11px] text-zinc-500">
            💡 Tips: Masukkan 2–3 key dari Google AI Studio agar rotasi otomatis aktif saat salah satu key mencapai kuota limit gratis (RPM).
          </p>
        </div>

        {/* Model Selector Section */}
        <div className="mb-5 rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-amber-400" />
              <label className="text-xs font-bold text-zinc-200">
                Pilih Model Gemini (Prioritas Utama):
              </label>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              Auto-ladder fallback aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_GEMINI_MODELS.map((m) => {
              const isSelected = !isCustomModel && selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(m.id);
                    setIsCustomModel(false);
                  }}
                  className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-amber-500/80 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/40"
                      : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`text-xs font-bold font-mono ${
                        isSelected ? "text-white" : "text-zinc-300"
                      }`}
                    >
                      {m.id}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${m.badgeClass}`}
                    >
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                    {m.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom Model Option */}
          <div className="pt-1 border-t border-zinc-800/60">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 mb-2">
              <input
                type="checkbox"
                checked={isCustomModel}
                onChange={(e) => {
                  setIsCustomModel(e.target.checked);
                  if (e.target.checked && !customModelVal) {
                    setCustomModelVal(selectedModel);
                  }
                }}
                className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/30"
              />
              <span className="font-semibold text-zinc-300">
                Gunakan ID Model Kustom (misal: gemini-3.6-flash, gemini-3.7-flash, experimental)
              </span>
            </label>

            {isCustomModel && (
              <input
                type="text"
                value={customModelVal}
                onChange={(e) => setCustomModelVal(e.target.value)}
                placeholder="Contoh: gemini-3.8-flash"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`mb-4 rounded-xl border p-3 text-xs ${
              testResult.valid
                ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                : "border-rose-500/30 bg-rose-950/20 text-rose-300"
            }`}
          >
            <div className="flex items-start gap-2">
              {testResult.valid ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div className="w-full">
                <p className="font-semibold">{testResult.message}</p>
                {testResult.models && testResult.models.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <span className="text-zinc-400 text-[11px] block">
                      Model terdeteksi pada key Anda (klik untuk memilih):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {testResult.models.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setSelectedModel(m);
                            setIsCustomModel(false);
                          }}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono border transition-colors ${
                            selectedModel === m && !isCustomModel
                              ? "bg-amber-500 text-zinc-950 font-bold border-amber-400"
                              : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-700 hover:text-white disabled:opacity-50 transition-colors"
          >
            {testing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                <span>Menguji...</span>
              </>
            ) : (
              <span>Uji Koneksi Key</span>
            )}
          </button>

          <div className="flex gap-2">
            {!required && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Batal
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-950 transition-colors shadow-sm shadow-amber-500/20"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
