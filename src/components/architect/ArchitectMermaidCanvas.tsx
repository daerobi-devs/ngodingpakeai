'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  Code2,
  Eye,
  Scan,
  Lock,
  Unlock,
  Wrench,
} from 'lucide-react';
import { sanitizeAndFixMermaidCode } from '@/lib/academic-architect/mermaid-sanitizer';

interface ArchitectMermaidCanvasProps {
  chart: string;
  title: string;
  isPrintMode?: boolean;
}

export const ArchitectMermaidCanvas: React.FC<ArchitectMermaidCanvasProps> = ({
  chart,
  title,
  isPrintMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [activeChartCode, setActiveChartCode] = useState<string>(chart);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showRawCode, setShowRawCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isScrollLocked, setIsScrollLocked] = useState<boolean>(false);

  // Update active code when chart prop changes
  useEffect(() => {
    setActiveChartCode(chart);
  }, [chart]);

  // Clean and render Mermaid diagram safely
  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      if (!activeChartCode || activeChartCode.trim().length === 0) {
        setSvgContent('');
        return;
      }

      setRenderError(null);
      const uniqueId = `mermaid-architect-${Math.random().toString(36).substring(2, 9)}`;

      // Pre-sanitize and fix any PlantUML / Mermaid irregularities
      const sanitized = sanitizeAndFixMermaidCode(
        activeChartCode,
        title.toLowerCase().includes('use case') ? 'use_case' : undefined
      );

      try {
        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          theme: isPrintMode ? 'neutral' : 'dark',
          themeVariables: isPrintMode
            ? {
                primaryColor: '#ffffff',
                primaryTextColor: '#09090b',
                primaryBorderColor: '#18181b',
                lineColor: '#18181b',
                secondaryColor: '#f4f4f5',
                tertiaryColor: '#ffffff',
                fontFamily: 'Times New Roman, serif',
                fontSize: '14px',
              }
            : {
                darkMode: true,
                background: '#07090e',
                primaryColor: '#1e293b',
                primaryTextColor: '#f8fafc',
                primaryBorderColor: '#3b82f6',
                lineColor: '#60a5fa',
                secondaryColor: '#0f172a',
                tertiaryColor: '#1e1b4b',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '13px',
              },
          securityLevel: 'loose',
          flowchart: { curve: 'basis', padding: 24, htmlLabels: true },
          sequence: { actorMargin: 50, messageMargin: 35 },
          er: { useMaxWidth: false },
        });

        const { svg } = await mermaid.render(uniqueId, sanitized);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('[Architect Mermaid] Render notice:', err);
          // Purge any orphan error elements inserted by Mermaid 12 in the DOM
          if (typeof document !== 'undefined') {
            document.querySelectorAll('[id^="dmermaid"]').forEach((el) => el.remove());
          }
          setRenderError(err?.message || 'Sintaks diagram memerlukan normalisasi.');
        }
      }
    };

    renderChart();
    return () => {
      isMounted = false;
      if (typeof document !== 'undefined') {
        document.querySelectorAll('[id^="dmermaid"]').forEach((el) => el.remove());
      }
    };
  }, [activeChartCode, isPrintMode, title]);

  // Auto-fit diagram comfortably to container
  const handleAutoFit = useCallback(() => {
    setIsInteracting(false);
    if (!containerRef.current || !contentRef.current) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const container = containerRef.current;
    const svgEl = contentRef.current.querySelector('svg');

    if (!svgEl) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const contWidth = container.clientWidth - 48; // padding margin
    const contHeight = container.clientHeight - 48;

    let svgWidth = svgEl.viewBox?.baseVal?.width || svgEl.clientWidth || 800;
    let svgHeight = svgEl.viewBox?.baseVal?.height || svgEl.clientHeight || 500;

    if (svgWidth <= 0) svgWidth = 800;
    if (svgHeight <= 0) svgHeight = 500;

    const scaleX = contWidth / svgWidth;
    const scaleY = contHeight / svgHeight;
    const idealScale = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.92, 0.2), 1.15);

    setZoom(Number(idealScale.toFixed(2)));
    setPan({ x: 0, y: 0 });
  }, []);

  // Automatically auto-fit whenever new diagram is rendered
  useEffect(() => {
    if (svgContent) {
      const timer = setTimeout(() => {
        handleAutoFit();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [svgContent, handleAutoFit]);

  // Pan controls with instant 60fps tracking (zero rubber-banding)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setIsInteracting(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsInteracting(false);
  };

  // Rock-solid, smooth centered zoom (no erratic pan jumping or nausea)
  const handleWheel = (e: React.WheelEvent) => {
    if (isScrollLocked) return;

    e.preventDefault();
    setIsInteracting(true);

    const direction = Math.sign(e.deltaY);
    // Smooth 6% change per step
    const zoomFactor = direction > 0 ? 0.94 : 1.06;

    setZoom((prevZoom) => {
      const nextZoom = Math.min(Math.max(Number((prevZoom * zoomFactor).toFixed(3)), 0.35), 3.0);
      return nextZoom;
    });

    setTimeout(() => setIsInteracting(false), 80);
  };

  const resetView = () => {
    setIsInteracting(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(activeChartCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleAutoRepair = () => {
    const fixed = sanitizeAndFixMermaidCode(activeChartCode, 'use_case');
    setActiveChartCode(fixed);
    setRenderError(null);
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_diagram.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`relative w-full h-full rounded-2xl border transition-colors flex flex-col overflow-hidden select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[460px]'
      } ${
        isPrintMode
          ? 'bg-white border-zinc-300 text-zinc-900 shadow-lg'
          : 'bg-[#07090e] border-zinc-800 text-zinc-100 shadow-2xl'
      }`}
    >
      {/* Canvas Top Bar */}
      <div
        className={`flex items-center justify-between px-3 sm:px-4 py-2 border-b z-20 shrink-0 ${
          isPrintMode ? 'bg-zinc-100 border-zinc-300' : 'bg-[#0e1117]/90 backdrop-blur-md border-zinc-800/80'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`text-xs font-mono font-bold tracking-tight truncate ${
              isPrintMode ? 'text-zinc-900' : 'text-zinc-200'
            }`}
          >
            {title}
          </span>
          <span
            className={`hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
              isPrintMode
                ? 'bg-zinc-200 border-zinc-300 text-zinc-700'
                : 'bg-blue-500/10 border-blue-500/25 text-blue-400'
            }`}
          >
            {isPrintMode ? 'Format Skripsi A4' : 'Kanvas Vektor'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-xs">
          {/* Zoom Buttons with 10% steps */}
          <button
            type="button"
            onClick={() => {
              setIsInteracting(false);
              setZoom((z) => Math.min(Number((z * 1.15).toFixed(2)), 3.0));
            }}
            className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            title="Perbesar Tampilan (+15%)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsInteracting(false);
              setZoom((z) => Math.max(Number((z * 0.85).toFixed(2)), 0.35));
            }}
            className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            title="Perkecil Tampilan (-15%)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Auto Fit to Screen */}
          <button
            type="button"
            onClick={handleAutoFit}
            className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            title="Pas ke Layar (Auto-Fit Kanvas)"
          >
            <Scan className="w-3.5 h-3.5" />
          </button>

          {/* Reset View */}
          <button
            type="button"
            onClick={resetView}
            className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            title="Reset Skala 100%"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-zinc-700/60 mx-1 hidden sm:block" />

          {/* Scroll Lock Toggle to prevent accidental zooming */}
          <button
            type="button"
            onClick={() => setIsScrollLocked(!isScrollLocked)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer hidden sm:inline-flex ${
              isScrollLocked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'border-zinc-700/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title={isScrollLocked ? 'Zoom Scroll Terkunci (Gunakan Tombol +/-)' : 'Zoom Scroll Bebas'}
          >
            {isScrollLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          {/* View Raw Mermaid Code */}
          <button
            type="button"
            onClick={() => setShowRawCode(!showRawCode)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showRawCode
                ? 'bg-blue-600 text-white border-blue-500'
                : 'border-zinc-700/60 hover:bg-zinc-800 text-zinc-300'
            }`}
            title="Lihat Kode Mermaid"
          >
            {showRawCode ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
          </button>

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            title="Salin Kode Diagram"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download SVG */}
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            title="Unduh Vektor SVG Tajam"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Presenter / Fullscreen Mode */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            title="Layar Penuh Kanvas"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center ${
          isPrintMode ? 'bg-[#fbfbfb]' : 'bg-[#05070b]'
        }`}
        style={{
          backgroundImage: isPrintMode
            ? 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)'
            : 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {renderError ? (
          <div className="max-w-lg p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs text-center space-y-3 shadow-2xl">
            <div className="space-y-1">
              <p className="font-bold text-sm text-amber-300">Format Sintaks Perlu Penyesuaian Otomatis</p>
              <p className="text-[11px] text-zinc-400">
                Sistem mendeteksi format penulisan PlantUML atau diagram yang dapat diubah ke standar resmi Mermaid flowchart.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleAutoRepair}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Perbaiki Otomatis ke UML Oval</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRawCode(!showRawCode)}
                className="px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Lihat Kode Sumber
              </button>
            </div>
          </div>
        ) : showRawCode ? (
          <div className="w-full h-full p-4 overflow-auto">
            <pre className="p-4 rounded-xl bg-[#090b10] border border-zinc-800 text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre selection:bg-blue-500/30">
              {activeChartCode}
            </pre>
          </div>
        ) : (
          <div
            ref={contentRef}
            className={`origin-center pointer-events-none ${
              isInteracting ? 'transition-none' : 'transition-transform duration-200 ease-out'
            }`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}

        {/* Floating Zoom & Pan Helper Badge */}
        <div
          className={`absolute bottom-3 right-3 px-3 py-1 rounded-xl border text-[10px] font-mono pointer-events-none z-10 shadow-sm ${
            isPrintMode
              ? 'bg-white/90 border-zinc-300 text-zinc-600'
              : 'bg-[#0e1117]/90 border-zinc-800/80 text-zinc-400'
          }`}
        >
          Skala: {Math.round(zoom * 100)}% | Geser Mouse untuk Pan
        </div>
      </div>
    </div>
  );
};
