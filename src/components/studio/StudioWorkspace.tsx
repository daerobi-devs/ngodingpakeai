'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PRDOutput } from '@/types/prd';
import { StudioTopBar, DocumentVersionInfo } from './StudioTopBar';
import { StudioOutline } from './StudioOutline';
import { StudioDocumentView } from './StudioDocumentView';
import { StudioChatDrawer, StudioChatMessage } from './StudioChatDrawer';
import { StudioKanbanView, KanbanTask, generateComprehensiveKanbanTasks } from './StudioKanbanView';
import { StudioMcpModal } from './StudioMcpModal';
import { generateStudioFullMarkdown } from './studio-markdown';
import { generateDesignDoc, getDesignPalette } from '@/lib/design-template';

interface StudioSnapshot {
  versionNumber: number;
  timestamp: string;
  summary: string;
  prd: PRDOutput;
}

interface StudioWorkspaceProps {
  initialPrd: PRDOutput;
  prdId?: string;
  apiKeyHeader?: string;
  userId?: string;
  onBackToEdit?: () => void;
  onToggleSidebar?: () => void;
  onUpdatePrd?: (updatedPrd: PRDOutput, newVersion?: number) => void;
  onRequireUpgrade?: () => void;
  theme?: 'dark' | 'light';
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  initialPrd,
  prdId: prdIdProp,
  apiKeyHeader = '',
  userId,
  onBackToEdit,
  onToggleSidebar,
  onUpdatePrd,
  onRequireUpgrade,
  theme = 'dark',
}) => {
  const [internalPrdId] = useState<string>(() => {
    if (prdIdProp) return prdIdProp;
    const titleSlug = (initialPrd.title || 'project')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .substring(0, 32);
    const genTimestamp = initialPrd.metadata?.generatedAt
      ? `_${new Date(initialPrd.metadata.generatedAt).getTime()}`
      : `_${Date.now()}`;
    return `prd_${titleSlug}${genTimestamp}`;
  });

  const prdId = prdIdProp || internalPrdId;

  const storageVersionKey = `ngodingpakeprd_studio_versions_${prdId}`;
  const storageChatKey = `ngodingpakeprd_studio_chat_${prdId}`;

  const [versions, setVersions] = useState<StudioSnapshot[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`ngodingpakeprd_studio_versions_${prdId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // fallback
      }
    }
    return [
      {
        versionNumber: 1,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        summary: 'Draf inisialisasi PRD Studio',
        prd: initialPrd,
      },
    ];
  });

  const [activeVersionNumber, setActiveVersionNumber] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`ngodingpakeprd_studio_versions_${prdId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[parsed.length - 1].versionNumber;
          }
        }
      } catch {
        // fallback
      }
    }
    return 1;
  });

  const [viewMode, setViewMode] = useState<'preview' | 'raw' | 'kanban'>('preview');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<StudioChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedChat = localStorage.getItem(`ngodingpakeprd_studio_chat_${prdId}`);
        if (savedChat) {
          const parsed = JSON.parse(savedChat);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // fallback
      }
    }
    return [];
  });
  const [isRevising, setIsRevising] = useState<boolean>(false);
  const [isCopiedMarkdown, setIsCopiedMarkdown] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('section-overview');
  const [liveKanbanTasks, setLiveKanbanTasks] = useState<KanbanTask[] | undefined>(undefined);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentPrdIdRef = useRef<string | null>(null);

  // Sync versions if prdId changes (i.e. user selected a different PRD from history or created a new PRD)
  useEffect(() => {
    if (currentPrdIdRef.current === prdId) {
      return;
    }
    currentPrdIdRef.current = prdId;

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageVersionKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVersions(parsed);
            setActiveVersionNumber(parsed[parsed.length - 1].versionNumber);
            return;
          }
        }
      } catch {
        // fallback
      }
    }
    setVersions([
      {
        versionNumber: 1,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        summary: 'Draf inisialisasi PRD Studio',
        prd: initialPrd,
      },
    ]);
    setActiveVersionNumber(1);
  }, [prdId, storageVersionKey, initialPrd]);

  // Sync chat messages from localStorage when prdId changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedChat = localStorage.getItem(storageChatKey);
        if (savedChat) {
          const parsed = JSON.parse(savedChat);
          if (Array.isArray(parsed)) {
            setChatMessages(parsed);
            return;
          }
        }
      } catch {
        // silent
      }
    }
    // If no saved chat for this PRD, initialize with clean empty chat!
    setChatMessages([]);
  }, [prdId, storageChatKey]);

  // Sync chat messages to localStorage
  useEffect(() => {
    if (chatMessages.length > 0 && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageChatKey, JSON.stringify(chatMessages));
      } catch {
        // silent
      }
    }
  }, [chatMessages, storageChatKey]);

  const handleClearChat = () => {
    setChatMessages([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageChatKey);
      } catch {
        // silent
      }
    }
  };

  // Current active PRD data
  const currentPrd = useMemo(() => {
    const found = versions.find((v) => v.versionNumber === activeVersionNumber);
    return found ? found.prd : versions[versions.length - 1].prd;
  }, [versions, activeVersionNumber]);

  // Generate full markdown string
  const fullMarkdown = useMemo(() => {
    return generateStudioFullMarkdown(currentPrd);
  }, [currentPrd]);

  // Version info array for dropdown
  const versionInfoList: DocumentVersionInfo[] = useMemo(() => {
    return versions.map((v) => ({
      versionNumber: v.versionNumber,
      timestamp: v.timestamp,
      summary: v.summary,
    }));
  }, [versions]);

  // Scroll listener for outline tracking
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const sectionIds = [
        'section-overview',
        'section-requirements',
        'section-features',
        'section-user-flow',
        'section-architecture',
        'section-database',
        'section-tech-stack',
      ];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 250 && rect.bottom >= 50) {
            setActiveSectionId(id);
            break;
          }
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSectionId(sectionId);
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(fullMarkdown);
    setIsCopiedMarkdown(true);
    setTimeout(() => setIsCopiedMarkdown(false), 2000);
  };

  // Initial sync with MCP server using comprehensive task breakdown
  useEffect(() => {
    const syncToMcp = async () => {
      try {
        const fullTaskList = generateComprehensiveKanbanTasks(currentPrd);
        await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync_project',
            prdId,
            title: currentPrd.title,
            markdownSpec: fullMarkdown,
            tasks: fullTaskList,
          }),
        });
      } catch {
        // silent sync fallback
      }
    };

    syncToMcp();
  }, [prdId, currentPrd, fullMarkdown]);

  // Polling MCP when in Kanban view mode
  useEffect(() => {
    if (viewMode !== 'kanban') return;

    const pollTasks = async () => {
      try {
        const res = await fetch(`/api/mcp?prdId=${encodeURIComponent(prdId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.tasks && data.tasks.length > 0) {
            setLiveKanbanTasks(data.tasks);
          }
        }
      } catch {
        // ignore polling error
      }
    };

    pollTasks();
    const interval = setInterval(pollTasks, 3000);
    return () => clearInterval(interval);
  }, [viewMode, prdId]);

  const handleUpdateTaskStatus = useCallback(
    async (taskId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'done') => {
      setLiveKanbanTasks((prev) => {
        const base = prev || generateComprehensiveKanbanTasks(currentPrd);
        return base.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
      });

      try {
        await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_task_status',
            prdId,
            taskId,
            status: newStatus,
          }),
        });
      } catch {
        // silent
      }
    },
    [prdId, currentPrd]
  );

  const handleAddTask = useCallback(
    async (newTask: KanbanTask) => {
      const base = liveKanbanTasks || generateComprehensiveKanbanTasks(currentPrd);
      const updated = [newTask, ...base];
      setLiveKanbanTasks(updated);

      try {
        await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync_project',
            prdId,
            title: currentPrd.title,
            markdownSpec: fullMarkdown,
            tasks: updated,
          }),
        });
      } catch {
        // silent
      }
    },
    [prdId, currentPrd, fullMarkdown, liveKanbanTasks]
  );

  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const folderName = `${currentPrd.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-studio-kit`;
      const rootFolder = zip.folder(folderName) || zip;

      // 1. .cursorrules & CLAUDE.md with Autonomous Execution Protocol
      const autonomousRules = `# Autonomous Agent Protocol: ${currentPrd.title}
*Product Archetype: ${currentPrd.archetype_detection?.archetype || 'Modern Web Application'}*

## 1. Core Mission & Persona
You are an expert autonomous software engineer building this product to production grade. 
Your authoritative specification is located in \`docs/PRD.md\` and visual system in \`docs/DESIGN.md\`.

## 2. Autonomous Execution Directive (Zero Micro-Permission Halts)
- Execute implementation continuously without stopping to ask permission for routine development decisions (e.g. creating helper modules, choosing standard libraries, styling details, adding migrations, or writing tests).
- Work autonomously through milestones. Stop only if a fundamental business conflict occurs.

## 3. Frontend-First Implementation Strategy
- Build out the comprehensive, responsive frontend interface and complete user journey first with realistic mock data and interactive state handlers before connecting live databases.
- Ensure all screens, navigation routes, forms, modals, and error boundaries render cleanly and interactively.

## 4. Architectural Initiative & Database Proactivity
- Do NOT restrict yourself solely to the surface-level text of the PRD.
- If the PRD omits necessary database columns, foreign keys, index optimizations, audit timestamps, enum constraints, or edge-case API error handlers, you are EXPLICITLY AUTHORIZED and REQUIRED to proactively architect, expand, and design production-grade schemas and endpoints.
- Ensure database schemas are robust, normalized, and secured with Row-Level Security (RLS).

## 5. Model Context Protocol (MCP) Kanban Loop
- If connected to the ngodingpakeprd MCP server, retrieve active tasks using tool \`get_next_task\`.
- Update task status to \`in_progress\` via \`update_task_status\` when you start coding.
- Verify your code compiles and passes checks, then update status to \`done\` with implementation notes.

## 6. Coding Standards & Behavior Contract
1. Use TypeScript with strict mode.
2. Adhere to the behavior contract:
${(currentPrd.ai_specific?.behavior_contract?.good || []).map((g) => `- [GOOD] ${g}`).join('\n')}
${(currentPrd.ai_specific?.behavior_contract?.reject || []).map((r) => `- [REJECT] ${r}`).join('\n')}
`;

      rootFolder.file('.cursorrules', autonomousRules);
      rootFolder.file('CLAUDE.md', autonomousRules);

      // 2. docs/PRD.md & docs/DESIGN.md
      const docsFolder = rootFolder.folder('docs');
      if (docsFolder) {
        docsFolder.file('PRD.md', fullMarkdown);
        const palette = getDesignPalette(currentPrd);
        docsFolder.file('DESIGN.md', generateDesignDoc(currentPrd, palette));
      }

      // 3. README.md
      rootFolder.file(
        'README.md',
        `# ${currentPrd.title} — Studio Kit (Versi ${activeVersionNumber})

Paket starter kit instruksi arsitektur koding dari Studio AI Workspace dengan protokol eksekusi otonom.

## Struktur Folder:
- \`.cursorrules\` : Aturan koding otonom frontend-first & inisiatif arsitektur untuk Cursor.
- \`CLAUDE.md\` : Protokol autonomous execution untuk Claude Code CLI.
- \`docs/PRD.md\` : Dokumen PRD mengalir lengkap dengan diagram Mermaid.
- \`docs/DESIGN.md\` : Standar visual & desain interface.
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}-v${activeVersionNumber}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export ZIP error:', err);
      alert('Gagal mengekspor file ZIP.');
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleSendMessage = async (instruction: string, mode: 'chat' | 'revise' = 'chat') => {
    setIsRevising(true);
    const userMsg: StudioChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: instruction,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      mode,
    };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKeyHeader) {
        headers['x-gemini-api-key'] = apiKeyHeader;
      }

      const res = await fetch('/api/studio-revise', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPrd,
          instruction,
          currentVersion: activeVersionNumber,
          userId,
          mode,
          prdId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.requireUpgrade && onRequireUpgrade) {
          onRequireUpgrade();
        }
        throw new Error(data.error || 'Gagal memproses pesan.');
      }

      if (mode === 'chat') {
        // Mode Diskusi: Hanya balas pesan, JANGAN ubah dokumen PRD
        const aiMsg: StudioChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data.chatReply || 'Analisis arsitektur siap.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          mode: 'chat',
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      } else {
        // Mode Revisi: Dokumen PRD diperbarui & versi dinaikkan
        const newVersionNum = data.newVersion || activeVersionNumber + 1;
        const revisedPrd = data.revisedPrd || currentPrd;
        const summary = data.revisionSummary || `Revisi: ${instruction}`;
        const chatReply = data.chatReply || 'Dokumen PRD berhasil diperbarui.';

        const newSnapshot: StudioSnapshot = {
          versionNumber: newVersionNum,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          summary,
          prd: revisedPrd,
        };

        setVersions((prev) => {
          const updated = [...prev, newSnapshot];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(storageVersionKey, JSON.stringify(updated));
            } catch {
              // silent
            }
          }
          return updated;
        });
        if (typeof window !== 'undefined') {
          try {
            const currentSaved = localStorage.getItem(storageVersionKey);
            const parsedList = currentSaved ? JSON.parse(currentSaved) : [];
            const merged = [...parsedList.filter((x: any) => x.versionNumber !== newVersionNum), newSnapshot];
            localStorage.setItem(storageVersionKey, JSON.stringify(merged));
          } catch {
            // silent
          }
        }
        setActiveVersionNumber(newVersionNum);

        if (onUpdatePrd) {
          onUpdatePrd(revisedPrd, newVersionNum);
        }

        const aiMsg: StudioChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: chatReply,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          versionBump: newVersionNum,
          mode: 'revise',
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      console.error('Chat/Revision error:', err);
      const errorMsg: StudioChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Terjadi kendala saat memproses: ${err.message || 'Silakan periksa koneksi atau coba lagi.'}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsRevising(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#09090b] text-zinc-100">
      {/* 1. Top Bar */}
      <StudioTopBar
        title={currentPrd.title}
        versions={versionInfoList}
        activeVersion={activeVersionNumber}
        onSelectVersion={(vNum) => setActiveVersionNumber(vNum)}
        viewMode={viewMode}
        onToggleViewMode={(mode) => setViewMode(mode)}
        onExportZip={handleExportZip}
        onCopyMarkdown={handleCopyMarkdown}
        isCopiedMarkdown={isCopiedMarkdown}
        isExportingZip={isExportingZip}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onOpenMcpModal={() => setIsMcpModalOpen(true)}
        onBack={onBackToEdit}
        onToggleSidebar={onToggleSidebar}
        theme={theme}
      />

      {/* 2. Main 3-Column Content Body matching video layout */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden bg-[#0b0f17]">
        {/* Left Column: Outline Table of Contents (Hidden in Kanban mode for full board view) */}
        {viewMode !== 'kanban' && (
          <div className="hidden lg:block pl-6 pr-2 py-6 overflow-y-auto shrink-0">
            <StudioOutline
              activeSectionId={activeSectionId}
              onSelectSection={handleSelectSection}
              theme={theme}
            />
          </div>
        )}

        {/* Center Column: Scrollable Document Canvas OR Kanban Board */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 scroll-smooth"
        >
          {viewMode === 'kanban' ? (
            <StudioKanbanView
              prd={currentPrd}
              tasks={liveKanbanTasks}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onAddTask={handleAddTask}
              onOpenMcpModal={() => setIsMcpModalOpen(true)}
              theme={theme}
            />
          ) : (
            <StudioDocumentView
              prd={currentPrd}
              fullMarkdown={fullMarkdown}
              viewMode={viewMode}
              theme={theme}
            />
          )}
        </div>

        {/* Right Column: AI Co-Pilot Chat Drawer */}
        <StudioChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          isLoading={isRevising}
          theme={theme}
        />
      </div>

      {/* MCP Integration Modal */}
      <StudioMcpModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
        prdId={prdId}
        projectTitle={currentPrd.title}
        userToken={userId}
        theme={theme}
      />
    </div>
  );
};
