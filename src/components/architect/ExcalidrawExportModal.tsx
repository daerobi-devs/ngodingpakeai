'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  Copy,
  Check,
  PenTool,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import {
  convertMermaidToExcalidraw,
  downloadExcalidrawFile,
  openExcalidrawInstance,
  EXCALIDRAW_INSTANCE_URL,
} from '@/lib/excalidraw/excalidraw-converter';

interface ExcalidrawExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartCode: string;
  chartTitle: string;
  theme?: 'dark' | 'light';
}

export const ExcalidrawExportModal: React.FC<ExcalidrawExportModalProps> = ({
  isOpen,
  onClose,
  chartCode,
  chartTitle,
  theme = 'dark',
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleDownload = () => {
    const scene = convertMermaidToExcalidraw(chartCode, chartTitle);
    const safeName = chartTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    downloadExcalidrawFile(`${safeName || 'arsitektur'}.excalidraw`, scene);
    setHasDownloaded(true);
    setTimeout(() => setHasDownloaded(false), 3000);
  };

  const handleOpenAndCopy = async () => {
    try {
      await navigator.clipboard.writeText(chartCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
    openExcalidrawInstance();
  };

  const handleCopyMermaid = async () => {
    try {
      await navigator.clipboard.writeText(chartCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Coret &amp; Edit di Excalidraw</h3>
              <p className="text-[11px] text-zinc-400">
                Hubungkan diagram {chartTitle} ke server Excalidraw mandiri Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Target Host Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-zinc-400">Server Target:</span>
              <span className="text-indigo-400 font-bold truncate">{EXCALIDRAW_INSTANCE_URL}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 shrink-0">
              Self-Hosted
            </span>
          </div>

          {/* Action Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opsi 1: Unduh Berkas .excalidraw */}
            <div className="flex flex-col justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:border-indigo-500/50 transition-all">
              <div className="space-y-1 mb-3">
                <div className="font-bold text-xs text-zinc-200 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Unduh Berkas Kanvas</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Unduh berkas <code>.excalidraw</code> siap pakai, lalu seret (drag &amp; drop) langsung ke layar Excalidraw.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
              >
                {hasDownloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .excalidraw</span>
                  </>
                )}
              </button>
            </div>

            {/* Opsi 2: Buka Web & Salin Kode */}
            <div className="flex flex-col justify-between p-4 rounded-xl border border-indigo-500/40 bg-indigo-950/10 hover:border-indigo-400 transition-all">
              <div className="space-y-1 mb-3">
                <div className="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Buka Tab Excalidraw</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Otomatis menyalin diagram ke clipboard dan membuka tab Excalidraw Anda. Cukup tekan <strong>Ctrl + V</strong> di sana.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAndCopy}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>Buka Kanvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tips Bantuan */}
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800 text-[11px] text-zinc-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span>Petunjuk Cepat di Excalidraw:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-zinc-400">
              <li>
                Jika mengunduh berkas, cukup <strong>seret (drag)</strong> berkas <code>.excalidraw</code> dari folder unduhan ke layar putih Excalidraw.
              </li>
              <li>
                Jika membuka tab, klik menu Excalidraw &gt; <strong>Insert</strong> &gt; <strong>Mermaid to Excalidraw</strong>, atau tekan <strong>Ctrl + V</strong>.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-950/60 text-xs">
          <button
            type="button"
            onClick={handleCopyMermaid}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Kode Mermaid Disalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Raw Mermaid</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-zinc-750 bg-zinc-800 text-zinc-300 hover:text-white font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
