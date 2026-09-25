import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, ShieldCheck, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';

interface ArchitectMcpModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  projectName?: string;
  onImportMcpSession?: (files: { path: string; content: string }[], projectTitle: string) => void;
}

export const ArchitectMcpModal: React.FC<ArchitectMcpModalProps> = ({
  isOpen,
  onClose,
  sessionId = 'default',
  projectName = 'Proyek Aktif',
  onImportMcpSession,
}) => {
  const [activeTab, setActiveTab] = useState<'cursor' | 'claude' | 'antigravity'>('cursor');
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [liveMcpSession, setLiveMcpSession] = useState<{
    projectTitle: string;
    sourceFilesCount: number;
    sessionId: string;
    sourceFiles?: { path: string; content: string }[];
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(45);

  const checkSession = async () => {
    try {
      setIsChecking(true);
      const res = await fetch(`/api/mcp-architect?sessionId=${sessionId}&includeFiles=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'active' && data.sourceFilesCount > 0) {
          setLiveMcpSession(data);
          setIsPaused(true);
        }
      }
    } catch {} finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsPaused(false);
    setSecondsLeft(45);

    // Initial check on open
    checkSession();

    // Bounded interval: runs for 45s max (every 3 seconds), then pauses automatically
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 3) {
          clearInterval(timer);
          setIsPaused(true);
          return 0;
        }
        if (isMounted) {
          checkSession();
        }
        return prev - 3;
      });
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isOpen, sessionId]);

  const handleUseMcpProject = () => {
    if (!liveMcpSession || !liveMcpSession.sourceFiles) return;
    const files = liveMcpSession.sourceFiles;
    const title = liveMcpSession.projectTitle;

    // Clear MCP session on backend so it won't persist
    fetch(`/api/mcp-architect?sessionId=${sessionId}`, { method: 'DELETE' }).catch(() => {});
    setLiveMcpSession(null);

    if (onImportMcpSession) {
      onImportMcpSession(files, title);
    }
  };

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const mcpEndpoint = `${currentOrigin}/api/mcp-architect`;

  const cursorConfigJson = JSON.stringify(
    {
      mcpServers: {
        'ngodingpakeprd-architect': {
          url: mcpEndpoint,
          headers: {
            'x-session-id': sessionId,
          },
        },
      },
    },
    null,
    2
  );

  const claudeCommand = `claude mcp add ngodingpakeprd-architect ${mcpEndpoint} --header "x-session-id: ${sessionId}"`;

  const antigravityConfigJson = JSON.stringify(
    {
      servers: [
        {
          name: 'ngodingpakeprd-architect',
          type: 'streamable-http',
          url: mcpEndpoint,
          headers: {
            'x-session-id': sessionId,
          },
        },
      ],
    },
    null,
    2
  );

  const samplePrompt = `@ngodingpakeprd-architect Tolong pindai struktur database (SQL/Prisma) dan rute API proyek ini, lalu jalankan tool push_local_codebase untuk proyek "${projectName}" dengan sessionId "${sessionId}".`;

  const handleCopyConfig = () => {
    try {
      const textToCopy =
        activeTab === 'claude'
          ? claudeCommand
          : activeTab === 'antigravity'
          ? antigravityConfigJson
          : cursorConfigJson;
      navigator.clipboard.writeText(textToCopy);
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    } catch {}
  };

  const handleCopyPrompt = () => {
    try {
      navigator.clipboard.writeText(samplePrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#0d1117] text-zinc-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#161b22]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Koneksi MCP Studio Arsitek</h3>
              <p className="text-[11px] text-zinc-400">Sinkronkan kodingan lokal langsung dari Cursor, Claude Code, Windsurf, &amp; Antigravity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs leading-relaxed text-zinc-300 max-h-[80vh] overflow-y-auto">
          {/* Project Isolation Info Card */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] space-y-0.5">
              <p>
                <strong>Isolasi Proyek Terjamin:</strong> Sesi ini terkunci pada ID Proyek: <code className="px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-200 font-mono text-[10px]">{sessionId}</code>.
              </p>
              <p className="text-zinc-400 text-[10.5px]">
                Data proyek Anda tidak akan tertukar dengan proyek lain karena setiap ruang kerja memiliki Session ID unik tersendiri.
              </p>
            </div>
          </div>

          {/* Live Sync Status Banner */}
          {liveMcpSession && liveMcpSession.sourceFilesCount > 0 ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">
                    Kodingan Terdeteksi: {liveMcpSession.sourceFilesCount} Berkas Diterima dari AI Agent!
                  </p>
                  <p className="text-[11px] text-emerald-300/80">
                    Proyek: <span className="font-mono font-semibold text-emerald-200">{liveMcpSession.projectTitle}</span>
                  </p>
                </div>
              </div>
              {onImportMcpSession && (
                <button
                  type="button"
                  onClick={handleUseMcpProject}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
                >
                  <span>Buka di Studio Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : isPaused ? (
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                <span className="text-[11.5px] text-zinc-300">
                  Mode Siaga: Pengecekan otomatis dijeda untuk menghemat sumber daya sistem.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  setSecondsLeft(45);
                  checkSession();
                }}
                disabled={isChecking}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Periksa Kiriman Berkas</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="text-[11px] text-zinc-400">
                  Mendengarkan kiriman MCP dari IDE ({secondsLeft}d sisa)...
                </span>
              </div>
              <button
                type="button"
                onClick={() => checkSession()}
                disabled={isChecking}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-[11px] font-mono cursor-pointer shrink-0 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Cek Sekarang</span>
              </button>
            </div>
          )}

          {/* IDE Selector Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('cursor')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'cursor'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  Cursor &amp; Windsurf
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('claude')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'claude'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  Claude Code
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('antigravity')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'antigravity'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  Antigravity
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyConfig}
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer text-[11px] font-semibold"
              >
                {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedConfig ? 'Tersalin!' : 'Salin Konfigurasi'}</span>
              </button>
            </div>

            {/* Code Box */}
            <pre className="p-3.5 rounded-xl bg-[#090b10] border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto selection:bg-blue-500/30 max-h-44">
              {activeTab === 'claude'
                ? claudeCommand
                : activeTab === 'antigravity'
                ? antigravityConfigJson
                : cursorConfigJson}
            </pre>
            <p className="text-[10.5px] text-zinc-500 font-mono">
              {activeTab === 'claude'
                ? 'Jalankan perintah CLI di atas pada terminal proyek Anda.'
                : activeTab === 'antigravity'
                ? 'Tambahkan konfigurasi di atas ke file mcp_config Antigravity.'
                : 'Tempelkan blok di atas ke ~/.cursor/mcp.json atau .cursor/mcp.json'}
            </p>
          </div>

          {/* Copyable Ready-to-Use Agent Prompt */}
          <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                <span>Prompt Instruksi Siap Pakai untuk AI Agent:</span>
              </span>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 cursor-pointer text-[11px]"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? 'Prompt Tersalin!' : 'Salin Prompt'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-[#07090e] border border-zinc-800 font-mono text-[11px] text-zinc-200 leading-relaxed">
              {samplePrompt}
            </div>
            <p className="text-[10px] text-zinc-400">
              Cukup tempelkan prompt ini ke chat Cursor / Claude Code / Antigravity di proyek Anda. Agent akan otomatis mengekstrak SQL &amp; Controller lalu menyinkronkannya ke studio ini.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#161b22] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
