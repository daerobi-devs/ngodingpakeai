'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PRDOutput } from '@/types/prd';
import { StudioTopBar, DocumentVersionInfo } from './StudioTopBar';
import { StudioOutline } from './StudioOutline';
import { StudioDocumentView } from './StudioDocumentView';
import { StudioChatDrawer, StudioChatMessage } from './StudioChatDrawer';
import { StudioKanbanView, KanbanTask, generateComprehensiveKanbanTasks } from './StudioKanbanView';
import { StudioMcpModal } from './StudioMcpModal';
import { StudioAgentConfigModal } from './StudioAgentConfigModal';
import { ImplementationModal } from './ImplementationModal';
import { generateStudioFullMarkdown, generateStudioTasksMarkdown } from './studio-markdown';
import { StudioUIDesignPromptView } from './StudioUIDesignPromptView';
import { generateDesignDoc, getDesignPalette } from '@/lib/design-template';
import { generateStarterCodebaseZip } from '@/lib/scaffolder/codebase-scaffolder';
import { PhasedFeatureTree } from '@/components/PhasedFeatureTree';
import { Loader2 } from 'lucide-react';

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
  isLoadingPrd?: boolean;
  loadingPrdMessage?: string;
  isNewlyGenerated?: boolean;
  onFinishTyping?: () => void;
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
  isLoadingPrd = false,
  loadingPrdMessage,
  isNewlyGenerated = false,
  onFinishTyping,
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
  const storageTasksGeneratedKey = `ngodingpakeprd_tasks_generated_${prdId}`;

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

  const [viewMode, setViewMode] = useState<'preview' | 'tree' | 'split' | 'raw' | 'kanban' | 'ui_prompt'>('preview');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState<boolean>(false);
  const [isAgentConfigModalOpen, setIsAgentConfigModalOpen] = useState<boolean>(false);
  const [isImplementModalOpen, setIsImplementModalOpen] = useState<boolean>(false);
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
  const [hasGeneratedTasks, setHasGeneratedTasks] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageTasksGeneratedKey);
        return saved === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });
  const [isGeneratingTasks, setIsGeneratingTasks] = useState<boolean>(false);
  const [generatingProgressText, setGeneratingProgressText] = useState<string>('Menganalisis modul & sub-fitur dari PRD...');

  const storageTreeTasksKey = `ngodingpakeprd_studio_tree_tasks_${prdId}`;
  const [treeTaskCompletion, setTreeTaskCompletion] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`ngodingpakeprd_studio_tree_tasks_${prdId}`);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {};
  });

  const handleToggleTreeTask = useCallback((_modId: string, taskId: string) => {
    setTreeTaskCompletion((prev) => {
      const next = {
        ...prev,
        [taskId]: !prev[taskId],
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`ngodingpakeprd_studio_tree_tasks_${prdId}`, JSON.stringify(next));
        } catch {
          // silent
        }
      }
      return next;
    });
  }, [prdId]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentPrdIdRef = useRef<string | null>(null);

  // Sync versions and task generation state if prdId changes (i.e. user selected a different PRD from history or created a new PRD)
  useEffect(() => {
    if (currentPrdIdRef.current === prdId) {
      return;
    }
    currentPrdIdRef.current = prdId;

    if (typeof window !== 'undefined') {
      try {
        const savedTreeTasks = localStorage.getItem(`ngodingpakeprd_studio_tree_tasks_${prdId}`);
        setTreeTaskCompletion(savedTreeTasks ? JSON.parse(savedTreeTasks) : {});
      } catch {
        setTreeTaskCompletion({});
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const savedTasksGen = localStorage.getItem(storageTasksGeneratedKey);
        setHasGeneratedTasks(savedTasksGen === 'true');
      } catch {
        setHasGeneratedTasks(false);
      }
    }

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

  // Synchronize when initialPrd transitions from stub to generated PRD
  useEffect(() => {
    if (initialPrd && !isLoadingPrd && initialPrd.opportunity_framing?.core_problem) {
      setVersions((prev) => {
        if (prev.length === 1 && prev[0].versionNumber === 1) {
          return [
            {
              ...prev[0],
              prd: initialPrd,
            },
          ];
        }
        return prev;
      });
    }
  }, [initialPrd, isLoadingPrd]);

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
        'section-tasks',
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

  // Initial sync with MCP server using comprehensive task breakdown (if generated)
  useEffect(() => {
    const syncToMcp = async () => {
      try {
        const fullTaskList = hasGeneratedTasks ? (liveKanbanTasks || generateComprehensiveKanbanTasks(currentPrd)) : [];
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
  }, [prdId, currentPrd, fullMarkdown, hasGeneratedTasks, liveKanbanTasks]);

  const handleBikinTask = useCallback(async () => {
    if (isGeneratingTasks) return;
    setIsGeneratingTasks(true);
    setGeneratingProgressText('Menganalisis arsitektur modul dan fase PRD...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setGeneratingProgressText('Menyusun coding task berfase (Phase 1, 2, 3)...');

      const generatedTasks = generateComprehensiveKanbanTasks(currentPrd);
      setLiveKanbanTasks(generatedTasks);

      await new Promise((r) => setTimeout(r, 650));
      setGeneratingProgressText('Menyinkronkan task breakdown ke antarmuka & MCP server...');

      try {
        await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync_project',
            prdId,
            title: currentPrd.title,
            markdownSpec: fullMarkdown,
            tasks: generatedTasks,
          }),
        });
      } catch {
        // silent sync fallback
      }

      await new Promise((r) => setTimeout(r, 450));

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageTasksGeneratedKey, 'true');
        } catch {
          // silent
        }
      }
      setHasGeneratedTasks(true);
      setViewMode('split');
    } finally {
      setIsGeneratingTasks(false);
    }
  }, [isGeneratingTasks, currentPrd, fullMarkdown, prdId, storageTasksGeneratedKey]);

  const handleRegenerateTasks = useCallback(async () => {
    await handleBikinTask();
  }, [handleBikinTask]);

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

  const handleUpdateDiagrams = useCallback(
    (diagrams: any) => {
      setVersions((prev) => {
        const activeIdx = prev.findIndex((v) => v.versionNumber === activeVersionNumber);
        if (activeIdx === -1) return prev;
        const target = prev[activeIdx];
        const updatedPrd: PRDOutput = {
          ...target.prd,
          architecture_diagrams: {
            ...target.prd.architecture_diagrams,
            ...diagrams,
          },
          sql_migration_script: diagrams.sql_migration_script || target.prd.sql_migration_script,
        };
        const updatedList = [...prev];
        updatedList[activeIdx] = {
          ...target,
          prd: updatedPrd,
        };
        try {
          localStorage.setItem(storageVersionKey, JSON.stringify(updatedList));
        } catch {
          // silent
        }
        if (onUpdatePrd) {
          onUpdatePrd(updatedPrd, target.versionNumber);
        }
        return updatedList;
      });
    },
    [activeVersionNumber, storageVersionKey, onUpdatePrd]
  );

  const handleExportZip = async (mode: 'full_starter' | 'docs_only' = 'full_starter') => {
    setIsExportingZip(true);
    try {
      const { blob, filename } = await generateStarterCodebaseZip(currentPrd, {
        mode,
        versionNumber: activeVersionNumber,
        taskCompletion: treeTaskCompletion,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export ZIP error:', err);
      alert('Gagal mengekspor file ZIP.');
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleDownloadMarkdown = () => {
    try {
      const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeTitle = (currentPrd.title || 'PRD')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      a.href = url;
      a.download = `PRD_${safeTitle}_v${activeVersionNumber}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download Markdown error:', err);
    }
  };

  const handleDownloadPrdAndTasks = () => {
    try {
      const safeTitle = (currentPrd.title || 'PRD')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

      // 1. Download file PRD.md
      const prdBlob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
      const prdUrl = URL.createObjectURL(prdBlob);
      const a1 = document.createElement('a');
      a1.href = prdUrl;
      a1.download = `PRD_${safeTitle}_v${activeVersionNumber}.md`;
      document.body.appendChild(a1);
      a1.click();
      document.body.removeChild(a1);
      URL.revokeObjectURL(prdUrl);

      // 2. Download file TASKS.md with dynamic tasks from the Feature Tree
      setTimeout(() => {
        const tasksMarkdown = generateStudioTasksMarkdown(currentPrd, treeTaskCompletion);
        const tasksBlob = new Blob([tasksMarkdown], { type: 'text/markdown;charset=utf-8' });
        const tasksUrl = URL.createObjectURL(tasksBlob);
        const a2 = document.createElement('a');
        a2.href = tasksUrl;
        a2.download = `TASKS_${safeTitle}_v${activeVersionNumber}.md`;
        document.body.appendChild(a2);
        a2.click();
        document.body.removeChild(a2);
        URL.revokeObjectURL(tasksUrl);
      }, 200);
    } catch (err) {
      console.error('Download PRD & TASKS error:', err);
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
      // Suppress error display so technical errors do not appear to the user in discussion or revision
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
        onBikinTask={() => {
          if (!hasGeneratedTasks) {
            handleBikinTask();
          } else {
            setViewMode((prev) => (prev === 'split' ? 'kanban' : 'split'));
          }
        }}
        hasGeneratedTasks={hasGeneratedTasks}
        isGeneratingTasks={isGeneratingTasks}
        onRegenerateTasks={handleRegenerateTasks}
        onExportZip={handleExportZip}
        onDownloadMarkdown={handleDownloadMarkdown}
        onCopyMarkdown={handleCopyMarkdown}
        isCopiedMarkdown={isCopiedMarkdown}
        isExportingZip={isExportingZip}
        onOpenImplementModal={() => setIsImplementModalOpen(true)}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onOpenMcpModal={() => setIsMcpModalOpen(true)}
        onOpenAgentConfig={() => setIsAgentConfigModalOpen(true)}
        onBack={onBackToEdit}
        onToggleSidebar={onToggleSidebar}
        theme={theme}
      />

      {/* 2. Main Content Body with dynamic layout modes */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden bg-[#0b0f17]">
        {/* Left Column: Outline Table of Contents (Visible only in single document preview mode) */}
        {viewMode === 'preview' && (
          <div className="hidden lg:block pl-6 pr-2 py-6 overflow-y-auto shrink-0">
            <StudioOutline
              activeSectionId={activeSectionId}
              onSelectSection={handleSelectSection}
              theme={theme}
              prd={currentPrd}
              isLoading={isLoadingPrd}
            />
          </div>
        )}

        {/* Center Column / Main View Panes */}
        {viewMode === 'kanban' ? (
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 scroll-smooth"
          >
            <StudioKanbanView
              prd={currentPrd}
              tasks={hasGeneratedTasks ? (liveKanbanTasks || generateComprehensiveKanbanTasks(currentPrd)) : []}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onAddTask={handleAddTask}
              onOpenMcpModal={() => setIsMcpModalOpen(true)}
              theme={theme}
              isTasksGenerated={hasGeneratedTasks}
              onGenerateTasks={handleBikinTask}
            />
          </div>
        ) : viewMode === 'ui_prompt' ? (
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 scroll-smooth"
          >
            <StudioUIDesignPromptView
              prd={currentPrd}
              theme={theme}
            />
          </div>
        ) : viewMode === 'tree' ? (
          <div className="flex-1 h-full w-full overflow-hidden p-3 sm:p-5">
            <PhasedFeatureTree
              prd={currentPrd}
              theme={theme}
              mode="studio"
              isTasksGenerated={hasGeneratedTasks}
              onGenerateTasks={handleBikinTask}
              taskCompletion={treeTaskCompletion}
              onToggleTask={handleToggleTreeTask}
            />
          </div>
        ) : viewMode === 'split' ? (
          <div className="flex-1 flex flex-col xl:flex-row h-full w-full overflow-hidden divide-y xl:divide-y-0 xl:divide-x divide-zinc-800">
            {/* Left Pane: Dokumen PRD */}
            <div
              ref={scrollContainerRef}
              className="w-full xl:w-1/2 h-1/2 xl:h-full overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth"
            >
              <StudioDocumentView
                prd={currentPrd}
                fullMarkdown={fullMarkdown}
                viewMode="preview"
                theme={theme}
                onUpdateDiagrams={handleUpdateDiagrams}
                apiKeyHeader={apiKeyHeader}
                onOpenTree={() => setViewMode('tree')}
                onBikinTask={handleBikinTask}
                hasGeneratedTasks={hasGeneratedTasks}
                isGeneratingTasks={isGeneratingTasks}
                isLoading={isLoadingPrd}
                loadingMessage={loadingPrdMessage}
                isNewlyGenerated={isNewlyGenerated}
                onFinishTyping={onFinishTyping}
              />
            </div>

            {/* Right Pane: Pohon Fitur & Tasks Canvas */}
            <div className="w-full xl:w-1/2 h-1/2 xl:h-full overflow-hidden p-2 sm:p-4 bg-[#090b10]">
              <PhasedFeatureTree
                prd={currentPrd}
                theme={theme}
                mode="split"
                isTasksGenerated={hasGeneratedTasks}
                onGenerateTasks={handleBikinTask}
                taskCompletion={treeTaskCompletion}
                onToggleTask={handleToggleTreeTask}
              />
            </div>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 scroll-smooth"
          >
            <StudioDocumentView
              prd={currentPrd}
              fullMarkdown={fullMarkdown}
              viewMode={viewMode}
              theme={theme}
              onUpdateDiagrams={handleUpdateDiagrams}
              apiKeyHeader={apiKeyHeader}
              onOpenTree={() => setViewMode('tree')}
              onBikinTask={handleBikinTask}
              hasGeneratedTasks={hasGeneratedTasks}
              isGeneratingTasks={isGeneratingTasks}
              isLoading={isLoadingPrd}
              loadingMessage={loadingPrdMessage}
              isNewlyGenerated={isNewlyGenerated}
              onFinishTyping={onFinishTyping}
            />
          </div>
        )}

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

      {/* Coding Agent Configuration Modal */}
      <StudioAgentConfigModal
        isOpen={isAgentConfigModalOpen}
        onClose={() => setIsAgentConfigModalOpen(false)}
        prd={currentPrd}
      />

      {/* Mulai Implementasi Modal (matching ngodingpakeai Image 2) */}
      <ImplementationModal
        isOpen={isImplementModalOpen}
        onClose={() => setIsImplementModalOpen(false)}
        prd={currentPrd}
        versionNumber={activeVersionNumber}
        onDownloadPrd={handleDownloadMarkdown}
        onDownloadPrdAndTasks={handleDownloadPrdAndTasks}
        onDownloadZip={() => handleExportZip('full_starter')}
        isExportingZip={isExportingZip}
        theme={theme}
        taskCompletion={treeTaskCompletion}
      />

      {/* Task Generation Progress Modal Overlay */}
      {isGeneratingTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
              <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mb-1">
              Menyusun Breakdown Task
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Mengonversi modul, sub-fitur, dan alur PRD menjadi coding task berfase siap eksekusi.
            </p>
            <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden mb-3 border border-zinc-700/50">
              <div className="bg-amber-400 h-full w-2/3 animate-pulse rounded-full transition-all duration-500" />
            </div>
            <p className="text-[11px] font-mono text-amber-400/90">
              {generatingProgressText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
