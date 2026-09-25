import React, { useState, useRef, useEffect } from 'react';
import {
  FolderUp,
  Terminal,
  FileText,
  Send,
  Loader2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
} from 'lucide-react';
import { ArchitectProject } from '@/lib/academic-architect/types';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface ArchitectEntryHubProps {
  onStartExtraction: (params: {
    rawIdea?: string;
    files?: { path: string; content: string }[];
    githubUrl?: string;
    prdId?: string;
  }) => Promise<void>;
  recentProjects: ArchitectProject[];
  onOpenProject: (projectId: string) => void;
  onOpenMcpModal: () => void;
  onDeleteProject?: (projectId: string) => void;
  isLoading: boolean;
}

export const ArchitectEntryHub: React.FC<ArchitectEntryHubProps> = ({
  onStartExtraction,
  recentProjects,
  onOpenProject,
  onOpenMcpModal,
  onDeleteProject,
  isLoading,
}) => {
  const [promptText, setPromptText] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [showGithubInput, setShowGithubInput] = useState(false);
  const [uploadedFilesCount, setUploadedFilesCount] = useState<number | null>(null);
  const [scanBreakdown, setScanBreakdown] = useState<{
    schemas: number;
    routes: number;
    models: number;
    configs: number;
  } | null>(null);
  const [stagedFiles, setStagedFiles] = useState<{ path: string; content: string }[]>([]);
  const [activeMcpSession, setActiveMcpSession] = useState<{
    projectTitle: string;
    sourceFilesCount: number;
    sessionId: string;
    sourceFiles?: { path: string; content: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    const checkMcp = async () => {
      try {
        const res = await fetch('/api/mcp-architect?checkAny=true&includeFiles=true');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.status === 'active' && data.sourceFilesCount > 0) {
            setActiveMcpSession(data);
          }
        }
      } catch {}
    };

    // Pengecekan satu kali saat komponen dimuat (tanpa looping tak terbatas)
    checkMcp();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDirectorySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    // Scored file container
    const scoredFiles: { file: File; score: number; relPath: string; category: string }[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const relPath = (file.webkitRelativePath || file.name).replace(/\\/g, '/');
      const lower = relPath.toLowerCase();

      // Blacklist noise directories
      const isIgnored =
        lower.includes('node_modules/') ||
        lower.includes('/node_modules') ||
        lower.includes('.git/') ||
        lower.includes('.next/') ||
        lower.includes('dist/') ||
        lower.includes('build/') ||
        lower.includes('vendor/') ||
        lower.includes('.cache/') ||
        lower.includes('coverage/') ||
        lower.includes('__pycache__/') ||
        lower.includes('.turbo/') ||
        lower.includes('.vscode/') ||
        lower.includes('.idea/');

      if (isIgnored) continue;

      let score = 0;
      let category = 'other';

      // 1. Tier 1: Database Schemas, Migrations & DDL (Highest Priority)
      if (/\.(sql|prisma)$/i.test(lower) || /migration.*\.php$/i.test(lower) || /schema\.(ts|js|py)$/i.test(lower)) {
        score = 100;
        category = 'schema';
      }
      // 2. Tier 2: Domain Models & Entities
      else if (
        /\/(?:models?|entities?|schemas?)\/.*\.(ts|js|py|php|go|java|cs)$/i.test(lower) ||
        /\.(model|entity|schema)\.(ts|js|py)$/i.test(lower) ||
        /(?:models|entities)\.py$/i.test(lower)
      ) {
        score = 85;
        category = 'model';
      }
      // 3. Tier 3: API Routing & Controllers
      else if (
        /\/(?:routes?|controllers?|handlers?|api)\/.*\.(ts|js|py|php|go|java|cs)$/i.test(lower) ||
        /\.(controller|router|route|handler)\.(ts|js|py|php|go)$/i.test(lower) ||
        /(?:urls|views|routes)\.(py|php|ts|js)$/i.test(lower)
      ) {
        score = 75;
        category = 'route';
      }
      // 4. Tier 4: Services & UseCases
      else if (/\/(?:services?|usecases?|actions?)\/.*\.(ts|js|py|php|go|java|cs)$/i.test(lower)) {
        score = 60;
        category = 'service';
      }
      // 5. Tier 5: Manifests & Configs
      else if (/(?:package\.json|composer\.json|go\.mod|requirements\.txt|pom\.xml)$/i.test(lower)) {
        score = 50;
        category = 'config';
      }
      // 6. Tier 6: Other source code files in src/ or app/
      else if (/\.(ts|tsx|js|jsx|py|php|go|java|cs)$/i.test(lower)) {
        score = 30;
        category = 'code';
      }

      if (score > 0) {
        scoredFiles.push({ file, score, relPath, category });
      }
    }

    // Sort by priority score descending
    scoredFiles.sort((a, b) => b.score - a.score);

    // Read top 100 most critical files
    const maxFilesToRead = 100;
    const selected = scoredFiles.slice(0, maxFilesToRead);
    const keyFiles: { path: string; content: string }[] = [];

    let schemas = 0;
    let routes = 0;
    let models = 0;
    let configs = 0;

    for (const item of selected) {
      try {
        const text = await item.file.text();
        keyFiles.push({ path: item.relPath, content: text });

        if (item.category === 'schema') schemas++;
        else if (item.category === 'route') routes++;
        else if (item.category === 'model') models++;
        else if (item.category === 'config') configs++;
      } catch {
        // ignore binary
      }
    }

    setStagedFiles(keyFiles);
    setUploadedFilesCount(keyFiles.length);
    setScanBreakdown({ schemas, routes, models, configs });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (!promptText.trim() && stagedFiles.length === 0 && !githubUrl.trim()) {
      return;
    }

    await onStartExtraction({
      rawIdea: promptText.trim() || undefined,
      files: stagedFiles.length > 0 ? stagedFiles : undefined,
      githubUrl: githubUrl.trim() || undefined,
    });
  };

  const handleImportFromMcp = async () => {
    if (!activeMcpSession || !activeMcpSession.sourceFiles) return;
    const sessId = activeMcpSession.sessionId;
    const files = activeMcpSession.sourceFiles;
    const title = activeMcpSession.projectTitle;

    // Clear session on backend so it won't linger when returning to hub
    if (sessId) {
      fetch(`/api/mcp-architect?sessionId=${sessId}`, { method: 'DELETE' }).catch(() => {});
    }
    setActiveMcpSession(null);

    await onStartExtraction({
      files: files,
      rawIdea: title,
    });
  };

  const handleDismissMcp = () => {
    if (activeMcpSession?.sessionId) {
      fetch(`/api/mcp-architect?sessionId=${activeMcpSession.sessionId}`, { method: 'DELETE' }).catch(() => {});
    }
    setActiveMcpSession(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-16 px-4 animate-in fade-in duration-200">
      {/* Hero Title */}
      <div className="text-center mb-8 sm:mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ruang Kerja Mandiri: Studio Arsitek Sistem &amp; Bab 3</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Rancang &amp; Bedah Arsitektur Skripsi
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Pindai kodingan lokal atau rancang dari nol. Hasilkan 6 diagram akademik resmi, naskah narasi Bab 3, dan kisi-kisi ujian sidang dalam hitungan detik.
        </p>
      </div>

      {/* Live MCP Active Session Detection Banner */}
      {activeMcpSession && activeMcpSession.sourceFilesCount > 0 && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Koneksi MCP Terdeteksi:</span>
                <span className="text-emerald-300 font-mono">{activeMcpSession.projectTitle}</span>
              </p>
              <p className="text-[11px] text-emerald-300/80">
                AI Agent telah menyinkronkan <strong>{activeMcpSession.sourceFilesCount} berkas arsitektur</strong> ke studio ini.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleImportFromMcp}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Memproses...' : 'Buka & Bedah Arsitektur'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDismissMcp}
              className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition-colors cursor-pointer"
              title="Abaikan & Tutup Banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modern Conversational Command Center */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d1117] p-4 sm:p-5 shadow-2xl relative overflow-hidden transition-all focus-within:border-blue-500/50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            disabled={isLoading}
            placeholder="Jelaskan ide sistem Anda, atau tempel pertanyaan dosen, atau lampirkan berkas kodingan di bawah..."
            rows={3}
            className="w-full bg-transparent border-0 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden resize-none leading-relaxed"
          />

          {/* Staged File Badge */}
          {uploadedFilesCount !== null && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Terdeteksi <strong>{uploadedFilesCount}</strong> berkas arsitektur:
                  {scanBreakdown && (
                    <span className="text-zinc-300 ml-1 font-normal">
                      ({scanBreakdown.schemas} skema DB, {scanBreakdown.routes} API route, {scanBreakdown.models} data model, {scanBreakdown.configs} config)
                    </span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStagedFiles([]);
                  setUploadedFilesCount(null);
                  setScanBreakdown(null);
                }}
                className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer shrink-0"
              >
                Hapus
              </button>
            </div>
          )}

          {/* GitHub Input Drawer */}
          {showGithubInput && (
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 animate-in fade-in duration-100">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                <GithubIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Tautan Repositori GitHub Publik:</span>
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/project-skripsi"
                className="w-full px-3 py-1.5 rounded-lg bg-[#090b10] border border-zinc-700 text-xs text-zinc-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Action Attachment Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
            {/* Left: Input Triggers */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Folder Picker Button */}
              <input
                ref={fileInputRef}
                type="file"
                // @ts-ignore - webkitdirectory standard
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleDirectorySelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#161b22] hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <FolderUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tarik Folder Proyek</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={() => setShowGithubInput(!showGithubInput)}
                disabled={isLoading}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                  showGithubInput
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                    : 'border-zinc-800 bg-[#161b22] hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                <GithubIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Tautan GitHub</span>
              </button>

              {/* Dedicated MCP Button */}
              <button
                type="button"
                onClick={onOpenMcpModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#161b22] hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Koneksi MCP IDE</span>
              </button>
            </div>

            {/* Right: Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (!promptText.trim() && stagedFiles.length === 0 && !githubUrl.trim())}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-blue-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membedah Arsitektur...</span>
                </>
              ) : (
                <>
                  <span>Mulai Analisis</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Projects Showcase */}
      {recentProjects && recentProjects.length > 0 && (
        <div className="mt-10 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 px-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Proyek Arsitektur Tersimpan</span>
            </span>
            <span className="text-[11px] text-zinc-500">{recentProjects.length} Proyek</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenProject(p.id)}
                className="p-4 rounded-xl border border-zinc-800/80 bg-[#0e1117] hover:bg-[#121620] hover:border-blue-500/40 transition-all cursor-pointer group flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-xs font-bold text-zinc-100 group-hover:text-blue-400 transition-colors truncate flex-1">
                      {p.title}
                    </h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {p.curriculumSchool === 'uml' ? 'Mazhab UML' : 'Terstruktur'}
                      </span>
                      {onDeleteProject && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Hapus proyek "${p.title}"? Proyek ini akan dihapus dari penyimpanan lokal.`)) {
                              onDeleteProject(p.id);
                            }
                          }}
                          className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Hapus Proyek"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {p.description || p.blueprint?.systemDescription || 'Arsitektur perangkat lunak lengkap.'}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>{new Date(p.updatedAt).toLocaleDateString('id-ID')}</span>
                  <span className="inline-flex items-center gap-1 text-blue-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Buka Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
