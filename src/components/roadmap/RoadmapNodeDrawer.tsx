'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RoadmapNode, NodeStatus } from '@/types/roadmap';
import {
  X,
  Clock,
  ExternalLink,
  AlertTriangle,
  Code2,
  BookOpen,
  Layers,
  CheckCircle2,
  GitBranch,
  MessageSquare,
  Bot,
  Send,
  Briefcase,
  Copy,
  Check,
  Compass,
  ChevronRight,
  ShieldAlert,
  Terminal,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface RoadmapNodeDrawerProps {
  node: RoadmapNode | null;
  onClose: () => void;
  onStatusChange: (nodeId: string, status: NodeStatus) => void;
  roadmapTitle?: string;
  targetRole?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function RoadmapNodeDrawer({
  node,
  onClose,
  onStatusChange,
  roadmapTitle,
  targetRole,
}: RoadmapNodeDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'mentor'>('details');
  const [mentorQuery, setMentorQuery] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [localStatus, setLocalStatus] = useState<NodeStatus>(node?.status || 'not_started');

  // Keep localStatus in sync with node
  useEffect(() => {
    if (node) {
      setLocalStatus(node.status || 'not_started');
    }
  }, [node?.id, node?.status]);

  const handleStatusSelect = (status: NodeStatus) => {
    if (!node) return;
    setLocalStatus(status);
    onStatusChange(node.id, status);
  };

  // Chat conversation history per node
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dynamic resizable width state
  const [drawerWidth, setDrawerWidth] = useState<number>(640);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  // Resize drag handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 420 && newWidth <= Math.min(1250, window.innerWidth - 60)) {
        setDrawerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        setIsResizing(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    setIsResizing(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  const toggleExpand = () => {
    if (drawerWidth > 800) {
      setDrawerWidth(580);
    } else {
      setDrawerWidth(Math.min(980, window.innerWidth - 60));
    }
  };

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab === 'mentor') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistories, activeTab, mentorLoading]);

  if (!node) return null;

  const currentMessages = chatHistories[node.id] || [];

  const handleToggleStep = (stepIdx: number) => {
    const key = `${node.id}-step-${stepIdx}`;
    setCheckedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAskMentor = async (
    promptType: 'explain' | 'code_example' | 'interview_simulation' | 'best_practice' | 'custom',
    customQueryText?: string
  ) => {
    const queryToSend = (customQueryText || mentorQuery).trim();
    if (promptType === 'custom' && !queryToSend) return;

    let userLabel = queryToSend;
    if (promptType === 'explain') userLabel = 'Tolong jelaskan konsep ini secara sederhana dan mudah dipahami.';
    else if (promptType === 'code_example') userLabel = 'Boleh kasih contoh nyata penerapannya di dunia kerja?';
    else if (promptType === 'interview_simulation') userLabel = 'Kira-kira pertanyaan apa yang sering muncul di tes atau interview untuk topik ini?';
    else if (promptType === 'best_practice') userLabel = 'Apa saja tips praktis dan jebakan umum yang harus dihindari?';

    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      content: userLabel,
      timestamp: Date.now(),
    };

    const updatedWithUser = [...currentMessages, userMsg];
    setChatHistories((prev) => ({
      ...prev,
      [node.id]: updatedWithUser,
    }));

    setMentorLoading(true);
    setActiveTab('mentor');
    setMentorQuery('');

    // 1. Cek cache lokal: jika sudah pernah ditanyakan pada topik ini, tampilkan instan tanpa bakar token
    const cacheKey = `ngodingpakeprd_mentor_${node.id}_${promptType}_${queryToSend.toLowerCase()}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const assistantMsg: ChatMessage = {
          id: `msg-a-${Date.now()}`,
          role: 'assistant',
          content: cached,
          timestamp: Date.now(),
        };
        setChatHistories((prev) => ({
          ...prev,
          [node.id]: [...updatedWithUser, assistantMsg],
        }));
        setMentorLoading(false);
        return;
      }
    } catch {
      // ignore
    }

    try {
      const res = await fetch('/api/roadmap-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: node.title,
          category: node.category,
          summary: node.summary,
          actionSteps: (node.actionSteps || []).slice(0, 4),
          keyTopics: (node.keyTopics || []).slice(0, 5),
          promptType,
          customQuery: queryToSend,
          roadmapTitle,
          targetRoleOrOutcome: targetRole,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal terhubung dengan Mentor AI');
      }

      const assistantMsg: ChatMessage = {
        id: `msg-a-${Date.now()}`,
        role: 'assistant',
        content: json.data?.answer || 'Tidak ada respons dari mentor.',
        timestamp: Date.now(),
      };

      // Simpan ke cache lokal untuk penghematan token maksimal
      try {
        localStorage.setItem(cacheKey, assistantMsg.content);
      } catch {
        // ignore
      }

      setChatHistories((prev) => ({
        ...prev,
        [node.id]: [...updatedWithUser, assistantMsg],
      }));
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Terjadi kendala saat konsultasi: ${err.message || 'Koneksi gagal'}`,
        timestamp: Date.now(),
      };
      setChatHistories((prev) => ({
        ...prev,
        [node.id]: [...updatedWithUser, errorMsg],
      }));
    } finally {
      setMentorLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'fundamental':
        return { text: 'Level 1: Fondasi', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'intermediate':
        return { text: 'Level 2: Menengah', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
      case 'advanced':
        return { text: 'Level 3: Lanjutan', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'mastery':
        return { text: 'Level 4: Penguasaan', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      default:
        return { text: 'Kompetensi Teknis', bg: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  const levelBadge = getLevelBadge(node.level);

  // Format inline markdown (bold, italic, inline code)
  const formatInlineText = (text: string) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((seg, idx) => {
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-amber-300 font-semibold"
          >
            {seg.slice(1, -1)}
          </code>
        );
      }
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-white">
            {seg.slice(2, -2)}
          </strong>
        );
      }
      if (seg.startsWith('*') && seg.endsWith('*')) {
        return (
          <em key={idx} className="italic text-zinc-300">
            {seg.slice(1, -1)}
          </em>
        );
      }
      return seg;
    });
  };

  // Render markdown text dynamically with headings, lists, quotes, and code blocks
  const renderMarkdownContent = (content: string) => {
    const codeBlockRegex = /(```[\s\S]*?```)/g;
    const blocks = content.split(codeBlockRegex);

    return (
      <div className="space-y-3 text-xs text-zinc-200 leading-relaxed font-sans">
        {blocks.map((block, bIdx) => {
          if (block.startsWith('```') && block.endsWith('```')) {
            const lines = block.slice(3, -3).trim().split('\n');
            const lang = lines[0]?.match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
            const code = lang ? lines.slice(1).join('\n') : lines.join('\n');
            const codeId = `code-${bIdx}`;

            return (
              <div key={bIdx} className="my-2.5 rounded-xl bg-[#090b10] border border-zinc-800 overflow-hidden font-mono shadow-md">
                <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Terminal className="w-3.5 h-3.5 text-orange-400" />
                    <span>{lang || 'snippet'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(code, codeId)}
                    className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedIndex === codeId ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 text-[11px] text-emerald-300/90 overflow-x-auto whitespace-pre leading-normal">
                  {code}
                </pre>
              </div>
            );
          }

          const lines = block.split('\n');
          const elements: React.ReactNode[] = [];
          let currentList: React.ReactNode[] = [];

          const flushList = () => {
            if (currentList.length > 0) {
              elements.push(
                <div key={`list-${elements.length}`} className="my-2 space-y-1.5 pl-1">
                  {currentList}
                </div>
              );
              currentList = [];
            }
          };

          lines.forEach((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) {
              flushList();
              return;
            }

            // Headers: ###, ####, ##
            if (trimmed.startsWith('### ')) {
              flushList();
              elements.push(
                <h3
                  key={`h3-${lIdx}`}
                  className="text-xs md:text-sm font-bold text-amber-400 mt-3.5 mb-1.5 pt-1 flex items-center gap-1.5 border-l-2 border-amber-500/60 pl-2"
                >
                  {formatInlineText(trimmed.slice(4))}
                </h3>
              );
              return;
            }

            if (trimmed.startsWith('#### ')) {
              flushList();
              elements.push(
                <h4
                  key={`h4-${lIdx}`}
                  className="text-xs font-semibold text-zinc-100 mt-2.5 mb-1 pl-1"
                >
                  {formatInlineText(trimmed.slice(5))}
                </h4>
              );
              return;
            }

            if (trimmed.startsWith('## ')) {
              flushList();
              elements.push(
                <h2
                  key={`h2-${lIdx}`}
                  className="text-sm md:text-base font-bold text-white mt-4 mb-2 pb-1 border-b border-zinc-800"
                >
                  {formatInlineText(trimmed.slice(3))}
                </h2>
              );
              return;
            }

            // Horizontal rule
            if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
              flushList();
              elements.push(<hr key={`hr-${lIdx}`} className="border-zinc-800 my-3" />);
              return;
            }

            // Unordered list (* or -)
            const ulMatch = trimmed.match(/^[\*\-]\s+(.*)$/);
            if (ulMatch) {
              currentList.push(
                <div key={`ul-${lIdx}`} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                  <div className="flex-1">{formatInlineText(ulMatch[1])}</div>
                </div>
              );
              return;
            }

            // Ordered list (1. 2. etc)
            const olMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
            if (olMatch) {
              currentList.push(
                <div key={`ol-${lIdx}`} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                  <span className="font-mono text-[11px] font-bold text-amber-400 shrink-0 min-w-[16px] mt-0.5">
                    {olMatch[1]}.
                  </span>
                  <div className="flex-1">{formatInlineText(olMatch[2])}</div>
                </div>
              );
              return;
            }

            // Regular paragraph
            flushList();
            elements.push(
              <p key={`p-${lIdx}`} className="text-xs text-zinc-300 leading-relaxed my-1.5">
                {formatInlineText(trimmed)}
              </p>
            );
          });

          flushList();

          return <div key={bIdx} className="space-y-1">{elements}</div>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile only lightweight click-away backdrop (NO blur on desktop, so roadmap remains sharp & interactive) */}
      <div
        onClick={onClose}
        className="sm:hidden fixed inset-0 z-40 bg-black/40 transition-opacity"
      />

      {/* Slide-over Drawer - Resizable Dynamic Sidebar without Blurry Backdrop */}
      <div
        style={{
          width: typeof window !== 'undefined' && window.innerWidth >= 640 ? `${drawerWidth}px` : '100%',
          maxWidth: '100vw',
        }}
        className="fixed inset-y-0 right-0 z-50 bg-[#0f1219] border-l border-zinc-800 shadow-2xl flex flex-col transition-all duration-75 animate-in slide-in-from-right-4"
      >
        {/* Left Resize Drag Handle */}
        <div
          onMouseDown={handleStartResize}
          className={`hidden sm:flex absolute -left-2 top-0 bottom-0 w-3.5 cursor-ew-resize items-center justify-center group z-50 select-none ${
            isResizing ? 'bg-orange-500/40' : 'hover:bg-orange-500/20'
          }`}
          title="Geser ke kiri/kanan untuk mengubah lebar sidebar"
        >
          <div className="w-1 h-12 rounded-full bg-zinc-600 group-hover:bg-orange-400 group-active:bg-orange-400 transition-colors" />
        </div>

        {/* 1. Sleek Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-[#0d1017] shrink-0">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1 flex-wrap">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border uppercase ${levelBadge.bg}`}>
                  {levelBadge.text}
                </span>
                <span>•</span>
                <span className="text-zinc-400 truncate max-w-[200px]">{node.category}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono text-zinc-400">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>{node.estimatedHours}</span>
                </span>
              </div>
              <h2 className="text-base md:text-lg font-bold text-white tracking-tight leading-snug">
                {node.title}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleExpand}
                className="hidden sm:inline-flex items-center gap-1 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={drawerWidth > 800 ? 'Persempit Sidebar' : 'Perlebar Sidebar'}
              >
                {drawerWidth > 800 ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Tutup (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Switcher Tabs */}
          <div className="flex items-center rounded-xl bg-zinc-950 p-1 border border-zinc-850 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'details'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              <span>Detail Kurikulum</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mentor')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'mentor'
                  ? 'bg-orange-600 text-white font-bold shadow-xs'
                  : 'text-orange-400 hover:text-orange-300'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
              <span>Tanya Mentor AI</span>
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'details' ? (
            /* TAB 1: CURRICULUM DETAILS */
            <>
              {/* Status Segmented Switcher */}
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Status Belajar:</span>
                <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleStatusSelect('not_started')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      localStatus === 'not_started'
                        ? 'bg-zinc-800 text-white font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Belum Mulai
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusSelect('in_progress')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      localStatus === 'in_progress'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Sedang Dipelajari
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusSelect('completed')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      localStatus === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Telah Dikuasai
                  </button>
                </div>
              </div>

              {/* Rangkuman Materi */}
              <div>
                <h3 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                  <span>Rangkuman Materi</span>
                </h3>
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs md:text-sm text-zinc-300 leading-relaxed">
                  {node.summary}
                </div>
              </div>

              {/* Action Steps Checklist (Interactive) */}
              {node.actionSteps && node.actionSteps.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Langkah Praktik & Penguasaan</span>
                  </h3>
                  <div className="space-y-2">
                    {node.actionSteps.map((step, sIdx) => {
                      const key = `${node.id}-step-${sIdx}`;
                      const isChecked = Boolean(checkedSteps[key]);

                      return (
                        <div
                          key={sIdx}
                          onClick={() => handleToggleStep(sIdx)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                            isChecked
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-zinc-400'
                              : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                              isChecked
                                ? 'bg-emerald-500 text-zinc-950'
                                : 'border border-zinc-600 bg-zinc-900'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={`text-xs leading-relaxed ${isChecked ? 'line-through opacity-70' : ''}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Topics */}
              {node.keyTopics && node.keyTopics.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>Konsep Kunci & Tooling</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {node.keyTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Curated Links (Only if real) */}
              {node.curatedLinks && node.curatedLinks.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Tautan Dokumentasi & Referensi</span>
                  </h3>
                  <div className="space-y-1.5">
                    {node.curatedLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-orange-500/40 hover:bg-zinc-900 transition-all group"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-xs font-medium text-zinc-200 group-hover:text-orange-300 block truncate">
                            {link.title}
                          </span>
                          {link.description && (
                            <span className="text-[11px] text-zinc-500 block truncate">
                              {link.description}
                            </span>
                          )}
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-orange-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Challenge (ONLY if defined specifically on this node) */}
              {node.projectChallenge && (
                <div>
                  <h3 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-orange-400" />
                    <span>Tantangan Proyek (Proof of Work)</span>
                  </h3>
                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-2">
                    <h4 className="text-xs font-bold text-orange-300">
                      {node.projectChallenge.title}
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {node.projectChallenge.description}
                    </p>
                    {node.projectChallenge.deliverable && (
                      <div className="pt-2 border-t border-orange-500/10 text-[11px]">
                        <span className="text-zinc-400 font-semibold">Deliverable: </span>
                        <span className="text-orange-200 font-mono">{node.projectChallenge.deliverable}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Common Pitfalls (ONLY if defined on this node) */}
              {node.commonPitfalls && node.commonPitfalls.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Jebakan Umum Yang Harus Dihindari</span>
                  </h3>
                  <div className="space-y-1.5">
                    {node.commonPitfalls.map((pitfall, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-200/90"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{pitfall}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom CTA to Mentor AI */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('mentor')}
                  className="w-full py-3 px-4 rounded-xl bg-orange-600/15 hover:bg-orange-600/25 border border-orange-500/30 text-orange-400 hover:text-orange-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-orange-400" />
                  <span>Ada yang bikin kamu bingung? Tanya Mentor AI &rarr;</span>
                </button>
              </div>
            </>
          ) : (
            /* TAB 2: INTERACTIVE AI MENTOR CONVERSATION */
            <div className="flex flex-col h-full space-y-4">
              {/* Mentor Active Banner */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Mentor Pribadimu</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </span>
                    <span className="text-[11px] text-zinc-400 block truncate max-w-xs">
                      Membahas: {node.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conversation Area */}
              <div className="flex-1 space-y-3.5">
                {currentMessages.length === 0 && (
                  <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-850 text-center space-y-4 my-2">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/25 text-orange-400 flex items-center justify-center mx-auto">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-white mb-1">
                        Ada yang bikin kamu bingung tentang "{node.title}"?
                      </h4>
                      <p className="text-[11px] text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        Pilih topik bantuan cepat di bawah atau tanyakan langsung apa saja yang ingin kamu diskusikan bersama mentor.
                      </p>
                    </div>

                    {/* 4 Sleek Quick Action Chips - Universal for any topic */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-left">
                      <button
                        type="button"
                        onClick={() => handleAskMentor('explain')}
                        disabled={mentorLoading}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-850 transition-all text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <BookOpen className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span className="text-xs font-bold text-zinc-200 group-hover:text-orange-300">
                            Jelaskan Konsep
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          Analogi & esensi pemahaman
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAskMentor('code_example')}
                        disabled={mentorLoading}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-sky-500/50 hover:bg-zinc-850 transition-all text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <Code2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="text-xs font-bold text-zinc-200 group-hover:text-sky-300">
                            Contoh Nyata & Praktik
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          Penerapan riil & studi kasus
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAskMentor('interview_simulation')}
                        disabled={mentorLoading}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-850 transition-all text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <Briefcase className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="text-xs font-bold text-zinc-200 group-hover:text-purple-300">
                            Simulasi Uji Pemahaman
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          Pertanyaan evaluasi & poin kunci
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAskMentor('best_practice')}
                        disabled={mentorLoading}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-850 transition-all text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300">
                            Best Practice & Tips
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          Hindari jebakan & langkah efektif
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Messages stream */}
                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.role === 'user' ? (
                      <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-zinc-800 border border-zinc-700 p-3 text-xs text-white">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="max-w-[95%] w-full rounded-2xl rounded-tl-xs bg-[#131722] border border-zinc-800/90 p-4 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2">
                          <span className="text-[11px] font-bold text-orange-400 flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5" />
                            <span>Bimbingan Mentor</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.content, msg.id)}
                            className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 cursor-pointer"
                          >
                            {copiedIndex === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>

                        {renderMarkdownContent(msg.content)}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading state */}
                {mentorLoading && (
                  <div className="flex items-start gap-2.5 p-4 rounded-2xl rounded-tl-xs bg-[#131722] border border-zinc-800 animate-in fade-in">
                    <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white">Mentor sedang menyiapkan arahan...</span>
                      <p className="text-[11px] text-zinc-400">Menyusun penjelasan praktis dan langkah nyata buat kamu.</p>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Bottom Quick Chips + Input Form */}
              <div className="pt-2 shrink-0 border-t border-zinc-800/80 space-y-2">
                {currentMessages.length > 0 && !mentorLoading && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-zinc-400">
                    <button
                      type="button"
                      onClick={() => handleAskMentor('explain')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-orange-500/40 hover:text-white shrink-0 cursor-pointer"
                    >
                      Jelaskan Konsep
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskMentor('code_example')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-sky-500/40 hover:text-white shrink-0 cursor-pointer"
                    >
                      Contoh Praktik
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskMentor('interview_simulation')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 hover:text-white shrink-0 cursor-pointer"
                    >
                      Uji Pemahaman
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskMentor('best_practice')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 hover:text-white shrink-0 cursor-pointer"
                    >
                      Best Practice
                    </button>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (mentorQuery.trim() && !mentorLoading) {
                      handleAskMentor('custom', mentorQuery.trim());
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={mentorQuery}
                    onChange={(e) => setMentorQuery(e.target.value)}
                    placeholder="Tanyakan apa saja yang bikin kamu bingung seputar materi ini..."
                    disabled={mentorLoading}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-orange-500/80"
                  />
                  <button
                    type="submit"
                    disabled={!mentorQuery.trim() || mentorLoading}
                    className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-850 text-white transition-colors cursor-pointer shrink-0 disabled:text-zinc-600 shadow-md shadow-orange-600/20"
                    title="Kirim Pertanyaan"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
