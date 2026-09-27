'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  X,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  Loader2,
  Layers,
  Check,
} from 'lucide-react';
import '@excalidraw/excalidraw/index.css';
import {
  ExcalidrawScene,
  downloadExcalidrawFile,
  openExcalidrawInstance,
} from '@/lib/excalidraw/excalidraw-converter';

// Dynamic import with ssr: false for App Router compatibility
const Excalidraw = dynamic(
  async () => {
    const mod = await import('@excalidraw/excalidraw');
    return mod.Excalidraw;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0b0f19] text-zinc-300 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-mono">Menyiapkan Kanvas Papan Tulis Excalidraw...</p>
      </div>
    ),
  }
);

interface InAppExcalidrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: ExcalidrawScene;
  title: string;
  isMasterMode?: boolean;
}

export const InAppExcalidrawModal: React.FC<InAppExcalidrawModalProps> = ({
  isOpen,
  onClose,
  scene,
  title,
  isMasterMode = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadFile = () => {
    const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    downloadExcalidrawFile(isMasterMode ? `master-blueprint-${safeName}.excalidraw` : `${safeName}.excalidraw`, scene);
    setHasDownloaded(true);
    setTimeout(() => setHasDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs animate-in fade-in duration-150 p-2 sm:p-4">
      <div
        className={`w-full ${
          isFullscreen ? 'h-full max-w-full' : 'h-[92vh] max-w-7xl'
        } flex flex-col rounded-2xl border border-zinc-800 bg-[#090b10] shadow-2xl overflow-hidden transition-all`}
      >
        {/* Top Header Bar */}
        <header className="h-13 px-4 border-b border-zinc-800 bg-[#0d1117] flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isMasterMode
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              <Layers className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-zinc-100 tracking-tight">{title}</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold border ${
                  isMasterMode
                    ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                    : 'bg-blue-950/60 text-blue-300 border-blue-800'
                }`}>
                  {isMasterMode ? 'Master Whiteboard (6 Diagram Sekaligus)' : 'Whiteboard Interaktif'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Kanvas tak terbatas live. Geser mouse untuk pan, scroll untuk zoom, dan klik objek untuk mengedit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download .excalidraw */}
            <button
              type="button"
              onClick={handleDownloadFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
              title="Unduh Berkas .excalidraw"
            >
              {hasDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersimpan</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File</span>
                </>
              )}
            </button>

            {/* Buka Web Tab */}
            <button
              type="button"
              onClick={openExcalidrawInstance}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              title="Buka Server Excalidraw Mandiri"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Web Server</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title={isFullscreen ? 'Kecilkan Jendela' : 'Perbesar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Tutup Kanvas"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Excalidraw Component Container */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-white">
          <Excalidraw
            initialData={{
              elements: scene.elements as any,
              appState: {
                viewBackgroundColor: '#ffffff',
                currentItemFontFamily: 1,
              },
              files: scene.files,
            }}
            theme="light"
            UIOptions={{
              canvasActions: {
                loadScene: true,
                export: { saveFileToDisk: true },
                saveAsImage: true,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
