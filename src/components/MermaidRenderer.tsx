"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { Copy, Check, Code2, AlertTriangle, RefreshCw, Maximize2, X } from "lucide-react";

interface MermaidRendererProps {
  chart: string;
  title?: string;
  className?: string;
  theme?: "dark" | "light";
}

function sanitizeMermaidChart(raw: string): string {
  let cleaned = raw
    .trim()
    .replace(/^```mermaid\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // If it's an erDiagram, fix common LLM Mermaid ERD syntax errors
  if (cleaned.startsWith("erDiagram") || cleaned.includes("erDiagram")) {
    // 1. Remove parentheses from data types inside entity blocks (e.g. varchar(255) -> varchar, decimal(10,2) -> decimal, int(11) -> int)
    cleaned = cleaned.replace(/(\b\w+)\s*\([^)]*\)/g, "$1");

    // 2. Normalize multi-word types that break Mermaid parser
    cleaned = cleaned.replace(/timestamp\s+with(?:out)?\s+time\s+zone/gi, "timestamp");
    cleaned = cleaned.replace(/character\s+varying/gi, "varchar");
    cleaned = cleaned.replace(/double\s+precision/gi, "float");

    // 3. Normalize hyphens in entity names inside relationships and blocks (e.g. USER-ROLES -> USER_ROLES)
    cleaned = cleaned.replace(/([a-zA-Z0-9_]+)-([a-zA-Z0-9_]+)\s*\{/g, "$1_$2 {");
    cleaned = cleaned.replace(/([a-zA-Z0-9_]+)-([a-zA-Z0-9_]+)\s*\|/g, "$1_$2 |");
    cleaned = cleaned.replace(/\|\s*([a-zA-Z0-9_]+)-([a-zA-Z0-9_]+)/g, "| $1_$2");

    // 4. Ensure relationship lines have no broken spaces in markers
    cleaned = cleaned.replace(/\|\s*\|\s*--\s*o\s*\{/g, "||--o{");
    cleaned = cleaned.replace(/\|\s*\|\s*--\s*\|\s*\{/g, "||--|{");
    cleaned = cleaned.replace(/\|\s*\|\s*--\s*\|\s*\|/g, "||--||");
  }

  // If flowchart, clean invalid characters inside unquoted node labels
  if (cleaned.startsWith("graph") || cleaned.startsWith("flowchart")) {
    cleaned = cleaned.replace(/\[([^"\]]+)\]/g, (match, inner) => {
      if (inner.includes("(") || inner.includes(")") || inner.includes("/")) {
        return `["${inner.replace(/"/g, "'")}"]`;
      }
      return match;
    });
  }

  return cleaned;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({
  chart,
  title,
  className = "",
  theme = "dark",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showRaw, setShowRaw] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  // Stable ID across renders for this component instance
  const renderIdRef = useRef<string>(`mermaid_${rawId}`);
  const lastChartRef = useRef<string>("");
  const isLight = theme === "light";

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      if (!chart || !chart.trim()) {
        if (isMounted) {
          setError("Tidak ada data diagram yang disediakan");
          setLoading(false);
        }
        return;
      }

      // Clean & sanitize chart syntax
      const cleanChart = sanitizeMermaidChart(chart);

      // Avoid redundant re-rendering if chart is identical and theme unchanged
      if (lastChartRef.current === `${cleanChart}_${theme}` && svgContent) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          theme: isLight ? "default" : "dark",
          securityLevel: "loose",
          themeVariables: isLight
            ? {
                darkMode: false,
                background: "#ffffff",
                primaryColor: "#f1f5f9",
                primaryTextColor: "#0f172a",
                primaryBorderColor: "#d97706",
                lineColor: "#64748b",
                secondaryColor: "#f8fafc",
                tertiaryColor: "#e2e8f0",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "13px",
              }
            : {
                darkMode: true,
                background: "#09090b",
                primaryColor: "#1e293b",
                primaryTextColor: "#f1f5f9",
                primaryBorderColor: "#f59e0b",
                lineColor: "#64748b",
                secondaryColor: "#121215",
                tertiaryColor: "#18181b",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "13px",
              },
        });

        // Use a unique ID suffix per actual render to prevent Mermaid collision
        const elementId = `${renderIdRef.current}_${Date.now()}`;
        const { svg } = await mermaid.render(elementId, cleanChart);

        if (isMounted) {
          lastChartRef.current = cleanChart;
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn("Mermaid render error:", err);
          // Hapus paksa elemen error DOM yang disuntikkan secara otomatis oleh Mermaid
          try {
            if (typeof document !== "undefined") {
              document.querySelectorAll('[id^="dmermaid_"], [id^="d_"], .error-icon').forEach((el) => el.remove());
            }
          } catch {}
          setError(
            err instanceof Error
              ? err.message
              : "Sintaks diagram Mermaid sedang disesuaikan"
          );
          setLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart, theme]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden flex flex-col transition-colors ${
        isLight
          ? "border-slate-200 bg-white text-slate-800 shadow-sm"
          : "border-zinc-800 bg-[#121215] text-zinc-100 shadow-sm"
      } ${className}`}
    >
      {/* Diagram Top Bar */}
      <div
        className={`flex items-center justify-between border-b px-4 py-3 ${
          isLight ? "border-slate-200 bg-slate-50" : "border-zinc-800 bg-[#09090b]"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-500" />
          <h4
            className={`text-xs font-semibold ${
              isLight ? "text-slate-800" : "text-zinc-200"
            }`}
          >
            {title || "Diagram Arsitektur"}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRaw(!showRaw)}
            className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              isLight
                ? "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                : "border-zinc-800 bg-[#121215] text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
          >
            <Code2 className="h-3 w-3" />
            <span>{showRaw ? "Preview SVG" : "Raw Code"}</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              isLight
                ? "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                : "border-zinc-800 bg-[#121215] text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Disalin</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Salin Mermaid</span>
              </>
            )}
          </button>
          {!loading && !error && !showRaw && (
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "border-zinc-800 bg-[#121215] text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
              title="Perbesar Layar Penuh"
            >
              <Maximize2 className="h-3 w-3" />
              <span className="hidden sm:inline">Perbesar</span>
            </button>
          )}
        </div>
      </div>

      {/* Diagram Content Area */}
      <div
        className={`p-4 flex-1 flex flex-col items-center justify-center min-h-[260px] overflow-x-auto ${
          isLight ? "bg-white" : "bg-[#09090b]/50"
        }`}
      >
        {loading && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 py-12">
            <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
            <span>Merender diagram Mermaid...</span>
          </div>
        )}

        {!loading && error && (
          <div className="w-full">
            <div className="text-[11px] text-zinc-500 font-mono mb-1.5 px-1">
              Spesifikasi Diagram Mermaid:
            </div>
            <pre className="w-full rounded-lg border border-zinc-800 bg-[#09090b] p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
              {chart}
            </pre>
          </div>
        )}

        {!loading && !error && showRaw && (
          <div className="w-full">
            <pre className="w-full rounded-lg border border-zinc-800 bg-[#09090b] p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
              {chart}
            </pre>
          </div>
        )}

        {!loading && !error && !showRaw && (
          <div
            ref={containerRef}
            className="w-full flex justify-center items-center [&>svg]:max-w-full [&>svg]:h-auto py-2"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-white">
                {title || "Diagram Arsitektur"} (Mode Layar Penuh)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Tersalin" : "Salin Kode"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                title="Tutup Layar Penuh (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
            <div
              className="w-full h-full flex items-center justify-center [&>svg]:max-w-none [&>svg]:w-auto [&>svg]:max-h-[80vh]"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
