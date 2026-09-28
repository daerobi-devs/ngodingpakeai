'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect, useLayoutEffect } from 'react';
import {
  FolderTree,
  Box,
  Check,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Circle,
  LayoutGrid,
  ListTodo,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Layers,
} from 'lucide-react';

export interface TreeCanvasTask {
  id: string;
  title: string;
  completed: boolean;
  priority?: string;
}

export interface TreeCanvasModule {
  id: string;
  name: string;
  phase: string;
  complexity?: 'Rendah' | 'Sedang' | 'Tinggi';
  description?: string;
  enabled?: boolean;
  subFeatures: string[];
  tasks?: TreeCanvasTask[];
}

export interface InteractiveTreeCanvasProps {
  title: string;
  subtitle?: string;
  techStackLabel?: string;
  modules: TreeCanvasModule[];
  mode?: 'wizard' | 'studio' | 'split' | 'standalone';
  theme?: 'dark' | 'light';
  showTasks?: boolean;
  onToggleModule?: (modId: string) => void;
  onAddSubFeature?: (modId: string, text: string) => void;
  onRemoveSubFeature?: (modId: string, subIdx: number) => void;
  onToggleTask?: (modId: string, taskId: string) => void;
  onToggleShowTasks?: () => void;
  onGenerateTasks?: () => void;
  onProceedWizard?: () => void;
  onBackWizard?: () => void;
  isGeneratingPrd?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
}

const PHASE_COLORS: Record<string, { badge: string; text: string; dot: string; line: string }> = {
  '1': {
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    line: '#f59e0b',
  },
  '2': {
    badge: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    text: 'text-zinc-300',
    dot: 'bg-zinc-400',
    line: '#64748b',
  },
  '3': {
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
    line: '#3b82f6',
  },
  '4': {
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    text: 'text-purple-400',
    dot: 'bg-purple-400',
    line: '#a855f7',
  },
  '5': {
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    text: 'text-rose-400',
    dot: 'bg-rose-400',
    line: '#f43f5e',
  },
};

function getPhaseColor(phase: string) {
  const num = phase.replace(/\D/g, '') || '1';
  return (
    PHASE_COLORS[num] || {
      badge: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
      text: 'text-zinc-300',
      dot: 'bg-zinc-400',
      line: '#64748b',
    }
  );
}

export const InteractiveTreeCanvas: React.FC<InteractiveTreeCanvasProps> = ({
  title,
  subtitle,
  techStackLabel = 'Modern Fullstack',
  modules,
  mode = 'studio',
  theme = 'dark',
  showTasks = true,
  onToggleModule,
  onAddSubFeature,
  onRemoveSubFeature,
  onToggleTask,
  onToggleShowTasks,
  onGenerateTasks,
  onProceedWizard,
  onBackWizard,
  isGeneratingPrd = false,
  isLoading = false,
  loadingMessage = 'Sedang merancang arsitektur modul dan pohon fitur...',
}) => {
  const isLight = theme === 'light';
  const isSplit = mode === 'split';
  const isWizard = mode === 'wizard';

  const [zoomLevel, setZoomLevel] = useState<number>(isSplit ? 65 : 85);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('ALL');
  const [activeAddSubFeature, setActiveAddSubFeature] = useState<string | null>(null);
  const [newSubFeatureInput, setNewSubFeatureInput] = useState<{ [modId: string]: string }>({});
  const [expandedSub, setExpandedSub] = useState<Record<string, boolean>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const toggleExpandSub = (modId: string) => {
    setExpandedSub((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const toggleExpandTasks = (modId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Canvas pan/drag state
  const canvasRef = useRef<HTMLDivElement>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const hasCenteredInitiallyRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Phase list for filter chips
  const availablePhases = useMemo(() => {
    const set = new Set<string>();
    modules.forEach((m) => {
      if (m.phase) set.add(m.phase.toUpperCase());
    });
    const sorted = Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
    return ['ALL', ...sorted];
  }, [modules]);

  // Filtered modules
  const filteredModules = useMemo(() => {
    if (selectedPhaseFilter === 'ALL') return modules;
    return modules.filter((m) => m.phase.toUpperCase() === selectedPhaseFilter.toUpperCase());
  }, [modules, selectedPhaseFilter]);

  // Dynamic coordinates measurement for fanning curves & vertical centering
  const modulesContainerRef = useRef<HTMLDivElement>(null);
  const [moduleCenters, setModuleCenters] = useState<number[]>([]);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const updateCoordinates = useCallback(() => {
    if (!modulesContainerRef.current) return;
    const container = modulesContainerRef.current;
    const rows = container.querySelectorAll<HTMLElement>('[data-tree-row]');
    const newCenters: number[] = [];
    rows.forEach((row) => {
      const card = row.querySelector<HTMLElement>('[data-module-card]');
      if (card) {
        newCenters.push(row.offsetTop + card.offsetTop + card.offsetHeight / 2);
      } else {
        newCenters.push(row.offsetTop + 32);
      }
    });
    setModuleCenters(newCenters);
    setContainerHeight(container.offsetHeight);
  }, []);

  useLayoutEffect(() => {
    updateCoordinates();
  }, [filteredModules, expandedSub, expandedTasks, showTasks, updateCoordinates]);

  useEffect(() => {
    if (!modulesContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      updateCoordinates();
    });
    observer.observe(modulesContainerRef.current);
    return () => observer.disconnect();
  }, [updateCoordinates]);

  // Calculated root center point (midpoint of all modules)
  const rootCenterY = useMemo(() => {
    if (moduleCenters.length > 0) {
      return (moduleCenters[0] + moduleCenters[moduleCenters.length - 1]) / 2;
    }
    const count = filteredModules.length || 1;
    return ((count - 1) * 96) / 2 + 32;
  }, [moduleCenters, filteredModules.length]);

  // Center Canvas on Tree (Allows panning in ALL 360 degrees freely)
  const centerCanvasOnTree = useCallback(
    (smooth = true) => {
      if (!canvasRef.current || !treeContainerRef.current) return;
      const canvas = canvasRef.current;
      const tree = treeContainerRef.current;

      const currentScale = zoomLevel / 100;
      // Position the tree so root node is at ~18-20% from left, and rootCenterY is centered vertically
      const rootX = tree.offsetLeft;
      const rootY = tree.offsetTop + rootCenterY * currentScale;

      const targetScrollLeft = rootX - canvas.clientWidth * 0.15;
      const targetScrollTop = rootY - canvas.clientHeight / 2;

      canvas.scrollTo({
        left: Math.max(0, targetScrollLeft),
        top: Math.max(0, targetScrollTop),
        behavior: smooth ? 'smooth' : 'auto',
      });
    },
    [rootCenterY, zoomLevel]
  );

  // Trigger auto-centering on initial mount
  useEffect(() => {
    if (hasCenteredInitiallyRef.current) return;
    if (moduleCenters.length > 0) {
      const timer = setTimeout(() => {
        centerCanvasOnTree(false);
        hasCenteredInitiallyRef.current = true;
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [moduleCenters, centerCanvasOnTree]);

  // Total tasks stats
  const totalTasksCount = useMemo(() => {
    return modules.reduce((acc, m) => acc + (m.tasks?.length || 0), 0);
  }, [modules]);

  const completedTasksCount = useMemo(() => {
    return modules.reduce(
      (acc, m) => acc + (m.tasks?.filter((t) => t.completed).length || 0),
      0
    );
  }, [modules]);

  // Canvas Mouse Dragging Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('a')
    ) {
      return;
    }

    if (!canvasRef.current) return;
    setIsPanning(true);
    setPanStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: canvasRef.current.scrollLeft,
      scrollTop: canvasRef.current.scrollTop,
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isPanning || !canvasRef.current) return;
      e.preventDefault();
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      canvasRef.current.scrollLeft = panStart.scrollLeft - dx;
      canvasRef.current.scrollTop = panStart.scrollTop - dy;
    },
    [isPanning, panStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleAddSubFeatureSubmit = (modId: string) => {
    const text = (newSubFeatureInput[modId] || '').trim();
    if (!text || !onAddSubFeature) return;
    onAddSubFeature(modId, text);
    setNewSubFeatureInput((prev) => ({ ...prev, [modId]: '' }));
    setActiveAddSubFeature(null);
  };

  return (
    <div className="w-full h-full flex flex-col flex-1 relative overflow-hidden select-none">
      {/* 1. FLOATING TOP ISLAND (Eliminates claustrophobic stacked header bar, makes canvas 100% full-height) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#101420]/90 border border-zinc-800/90 rounded-full px-3.5 py-1.5 shadow-2xl backdrop-blur-md max-w-[95vw] overflow-x-auto scrollbar-none transition-all">
        {/* Project Title / Icon */}
        <div className="flex items-center gap-1.5 pl-1 pr-2.5 border-r border-zinc-800/80 shrink-0">
          <div className="h-5 w-5 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FolderTree className="h-3 w-3" />
          </div>
          <span
            className="text-xs font-bold text-zinc-200 truncate max-w-[120px] sm:max-w-[200px]"
            title={title}
          >
            {title}
          </span>
        </div>

        {/* Phase Filter Chips */}
        <div className="flex items-center gap-1 shrink-0">
          {availablePhases.map((phaseKey) => {
            const isSelected = selectedPhaseFilter === phaseKey;
            return (
              <button
                key={phaseKey}
                type="button"
                onClick={() => setSelectedPhaseFilter(phaseKey)}
                className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {phaseKey === 'ALL' ? 'Semua' : phaseKey}
              </button>
            );
          })}
        </div>

        {/* Action: Bikin Task / Toggle Tasks */}
        <div className="pl-1.5 border-l border-zinc-800/80 shrink-0 flex items-center gap-1.5">
          {!isWizard && (onToggleShowTasks || onGenerateTasks) && (
            <button
              type="button"
              onClick={() => {
                if (totalTasksCount === 0 && onGenerateTasks) {
                  onGenerateTasks();
                } else if (onToggleShowTasks) {
                  onToggleShowTasks();
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                totalTasksCount === 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 active:scale-95'
                  : showTasks
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                  : 'bg-zinc-800/80 text-zinc-300 hover:text-white'
              }`}
            >
              <ListTodo className="h-3 w-3" />
              <span>
                {totalTasksCount === 0
                  ? 'Bikin Task'
                  : showTasks
                  ? 'Sembunyikan Tasks'
                  : 'Tampilkan Tasks'}
              </span>
              {totalTasksCount > 0 && (
                <span className="text-[9.5px] font-mono px-1 rounded-full bg-zinc-900/90 text-zinc-400">
                  {completedTasksCount}/{totalTasksCount}
                </span>
              )}
            </button>
          )}

          {isWizard && onBackWizard && (
            <button
              type="button"
              onClick={onBackWizard}
              disabled={isGeneratingPrd}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                isLight
                  ? 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                  : 'border-zinc-700/80 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white'
              }`}
              title="Kembali ke pertanyaan klarifikasi"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Ubah Tanya Jawab</span>
            </button>
          )}

          {isWizard && onProceedWizard && (
            <button
              type="button"
              onClick={onProceedWizard}
              disabled={isGeneratingPrd}
              className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPrd ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-zinc-950" />
                  <span>Menyusun PRD...</span>
                </>
              ) : (
                <>
                  <span>Generate Dokumen PRD</span>
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. INFINITE CANVAS WITH FULL 360-DEGREE PAN FREEDOM */}
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 w-full h-full relative overflow-auto ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        } ${isLight ? 'bg-[#f8fafc]' : 'bg-[#0a0e17]'}`}
      >
        {/* Dot-matrix background pattern across huge area */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(${isLight ? '#000' : '#94a3b8'} 1.2px, transparent 1.2px)`,
            backgroundSize: '24px 24px',
            minWidth: '5500px',
            minHeight: '4500px',
          }}
        />

        {/* Scalable Container Placed in the Center with Generous Margins on all 4 sides */}
        <div
          ref={treeContainerRef}
          className="inline-block relative z-10"
          style={{
            padding: '500px 900px 600px 600px', // Plentiful space above, left, right, below!
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Main Horizontal Mindmap Tree Flow */}
          {isLoading ? (
            /* GHOST / SKELETON FEATURE TREE (Matching Gambar 1) */
            <div className="flex items-start relative select-none animate-in fade-in duration-500">
              {/* Central Status Pill */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-amber-500/30 bg-[#0c1017]/90 text-xs font-medium text-amber-400 shadow-xl backdrop-blur-md">
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>{loadingMessage}</span>
              </div>

              {/* 1. ROOT GHOST NODE (PERENCANAAN) */}
              <div
                className="shrink-0 w-48 sm:w-52"
                style={{ transform: 'translateY(110px)' }}
              >
                <div className="rounded-2xl border border-zinc-800/80 bg-[#111724]/90 p-4 shadow-xl relative backdrop-blur-sm">
                  <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-semibold block mb-2.5">
                    PERENCANAAN
                  </span>
                  <div className="space-y-2">
                    <div className="h-2 w-32 bg-zinc-700/60 rounded-full animate-pulse" />
                    <div className="h-1.5 w-20 bg-zinc-800/80 rounded-full animate-pulse" />
                  </div>
                  {/* Right Anchor Dot */}
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-600 border-2 border-[#111724] shrink-0" />
                </div>
              </div>

              {/* 2. SVG FANNING BEZIER CURVES */}
              <div className="w-56 shrink-0 relative self-stretch pointer-events-none" style={{ height: '360px' }}>
                <svg className="w-full h-full overflow-visible">
                  <circle cx="0" cy="140" r="4.5" className="fill-zinc-500 stroke-zinc-900" strokeWidth="1.5" />
                  {/* Curve to top */}
                  <path
                    d="M 0 140 C 90 140, 134 40, 224 40"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    strokeOpacity="0.6"
                    className="animate-pulse"
                  />
                  <circle cx="224" cy="40" r="3" className="fill-zinc-600" />
                  {/* Curve to middle */}
                  <path
                    d="M 0 140 C 90 140, 134 140, 224 140"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    strokeOpacity="0.6"
                    className="animate-pulse"
                  />
                  <circle cx="224" cy="140" r="3" className="fill-zinc-600" />
                  {/* Curve to bottom */}
                  <path
                    d="M 0 140 C 90 140, 134 240, 224 240"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    strokeOpacity="0.6"
                    className="animate-pulse"
                  />
                  <circle cx="224" cy="240" r="3" className="fill-zinc-600" />
                </svg>
              </div>

              {/* 3. 3 FITUR + SUB FITUR GHOST NODES */}
              <div className="space-y-6">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="flex items-center">
                    {/* FITUR CARD */}
                    <div className="w-52 sm:w-56 shrink-0 rounded-2xl border border-zinc-800/80 bg-[#111724]/90 p-3.5 shadow-md relative backdrop-blur-sm">
                      <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-semibold block mb-2">
                        FITUR
                      </span>
                      <div className="space-y-1.5">
                        <div className="h-2 w-36 bg-zinc-700/50 rounded-full animate-pulse" />
                        <div className="h-1.5 w-24 bg-zinc-800/60 rounded-full animate-pulse" />
                      </div>
                      {/* Right Anchor Dot */}
                      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-zinc-600 border-2 border-[#111724]" />
                    </div>

                    {/* SVG CONNECTOR TO SUB FITUR */}
                    <div className="w-24 shrink-0 relative self-stretch pointer-events-none" style={{ height: '80px' }}>
                      <svg className="w-full h-full overflow-visible">
                        <path
                          d="M 0 40 C 45 40, 55 40, 96 40"
                          fill="none"
                          stroke="#475569"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          strokeOpacity="0.5"
                          className="animate-pulse"
                        />
                        <circle cx="96" cy="40" r="3" className="fill-zinc-600" />
                      </svg>
                    </div>

                    {/* SUB FITUR CARD */}
                    <div className="w-60 sm:w-64 shrink-0 rounded-2xl border border-zinc-800/80 bg-[#0e121d]/90 p-3.5 shadow-md backdrop-blur-sm">
                      <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-semibold block mb-2.5">
                        SUB FITUR
                      </span>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                          <div className="h-2 w-40 bg-zinc-700/50 rounded-full animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                          <div className="h-2 w-32 bg-zinc-700/50 rounded-full animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                          <div className="h-2 w-24 bg-zinc-800/60 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-start relative">
            {/* 1. ROOT NODE (Compact Horizontal Capsule - matching Image 2) */}
            <div
              className="shrink-0 w-48 sm:w-52 transition-transform duration-200"
              style={{
                transform: `translateY(${Math.max(0, rootCenterY - 28)}px)`,
              }}
            >
              <div
                className={`rounded-2xl border p-2.5 sm:p-3 transition-all relative flex items-center gap-2.5 shadow-xl ${
                  isLight
                    ? 'bg-white border-zinc-300 text-zinc-900'
                    : 'bg-[#111724] border-zinc-700/80 text-white'
                }`}
              >
                {/* Product Icon */}
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                  <Box className="h-4 w-4" />
                </div>

                {/* Title & Status */}
                <div className="min-w-0 flex-1">
                  <h2
                    className="text-xs sm:text-[13px] font-bold text-white truncate leading-tight"
                    title={title}
                  >
                    {title}
                  </h2>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                    Perencanaan
                  </span>
                </div>

                {/* Right Anchor Dot */}
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-600 border-2 border-[#111724] shrink-0" />
              </div>
            </div>

            {/* 2. SVG FANNING BEZIER CURVES FROM ROOT TO MODULES (Wide 240px Runway - ZERO KINKS!) */}
            <div className="w-60 shrink-0 relative self-stretch pointer-events-none">
              <svg
                className="w-full h-full overflow-visible"
                style={{ height: containerHeight > 0 ? `${containerHeight}px` : '100%' }}
              >
                {/* Central Anchor Dot on Root Edge */}
                <circle
                  cx="0"
                  cy={rootCenterY}
                  r="4.5"
                  className="fill-amber-400 stroke-zinc-900"
                  strokeWidth="1.5"
                />

                {/* Multi-strand Fanning Bezier Curves */}
                {filteredModules.map((mod, idx) => {
                  const targetY =
                    moduleCenters[idx] !== undefined
                      ? moduleCenters[idx]
                      : idx * 96 + 32;
                  const phaseColor = getPhaseColor(mod.phase);

                  const spanX = 240;
                  const dy = targetY - rootCenterY;
                  const absDy = Math.abs(dy);

                  // Adaptive control points to eliminate ANY kink ("ketekuk"):
                  // As dy increases, give progressive horizontal runway so the curve arches gracefully
                  const cp1x = Math.min(spanX * 0.48, 50 + absDy * 0.22);
                  const cp2x = Math.max(spanX * 0.52, spanX - (50 + absDy * 0.22));

                  return (
                    <g key={mod.id || idx}>
                      {/* Organic Cubic Bezier Curve (S-curve) */}
                      <path
                        d={`M 0 ${rootCenterY} C ${cp1x} ${rootCenterY}, ${cp2x} ${targetY}, ${spanX} ${targetY}`}
                        fill="none"
                        stroke={phaseColor.line}
                        strokeWidth="1.5"
                        strokeOpacity="0.65"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                      {/* Target Anchor Dot on Module Entrance */}
                      <circle
                        cx={spanX}
                        cy={targetY}
                        r="3"
                        className="fill-zinc-500"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* 3. NODES HIERARCHY COLUMNS (Modules -> Sub Fitur -> Tasks) */}
            <div
              ref={modulesContainerRef}
              className="flex-1 space-y-4 sm:space-y-5"
            >
              {filteredModules.map((mod) => {
                const isEnabled = mod.enabled !== false;
                const phaseColor = getPhaseColor(mod.phase);
                const modTasks = mod.tasks || [];
                const completedModTasks = modTasks.filter((t) => t.completed).length;
                const isSubExpanded = Boolean(expandedSub[mod.id]);
                const isTasksExpanded = Boolean(expandedTasks[mod.id]);
                const displayedSubFeatures = isSubExpanded ? mod.subFeatures : mod.subFeatures.slice(0, 3);
                const displayedTasks = isTasksExpanded ? modTasks : modTasks.slice(0, 3);

                return (
                  <div
                    key={mod.id}
                    data-tree-row
                    className="flex items-start relative group"
                  >
                    {/* LEVEL 1: COMPACT MODULE CARD (Sleek horizontal card matching Image 2) */}
                    <div
                      data-module-card
                      className={`w-56 sm:w-60 shrink-0 rounded-2xl border p-2.5 sm:p-3 transition-all shadow-md relative ${
                        !isEnabled
                          ? isLight
                            ? 'bg-zinc-100/60 border-zinc-200 opacity-60'
                            : 'bg-zinc-900/40 border-zinc-850 opacity-50'
                          : isLight
                          ? 'bg-white border-zinc-200 hover:border-amber-500/40'
                          : 'bg-[#111724] border-zinc-800/90 hover:border-zinc-700'
                      }`}
                    >
                      {/* Left Anchor Dot */}
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-600" />

                      {/* Top Right: Phase Badge */}
                      <div className="absolute top-2 right-2.5">
                        <span
                          className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded-full border uppercase ${phaseColor.badge}`}
                        >
                          {mod.phase.toUpperCase().startsWith('FASE')
                            ? mod.phase.toUpperCase()
                            : `FASE ${mod.phase.toUpperCase()}`}
                        </span>
                      </div>

                      {/* Main Row: Icon + Module Title */}
                      <div className="flex items-center gap-2 mb-2 pr-12">
                        <div className="h-6 w-6 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 shrink-0">
                          <LayoutGrid className="h-3.5 w-3.5" />
                        </div>
                        <h3
                          className={`text-xs font-bold leading-snug truncate ${
                            isEnabled
                              ? isLight
                                ? 'text-zinc-900'
                                : 'text-zinc-100'
                              : 'line-through text-zinc-500'
                          }`}
                          title={mod.name}
                        >
                          {mod.name}
                        </h3>
                      </div>

                      {/* Bottom Status Row: Planned Dot + Task / Status Counter */}
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <div className="flex items-center gap-1">
                          {onToggleModule && (
                            <button
                              type="button"
                              onClick={() => onToggleModule(mod.id)}
                              className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition mr-0.5 cursor-pointer ${
                                isEnabled
                                  ? 'bg-amber-500 border-amber-500 text-zinc-950'
                                  : 'border-zinc-700 bg-zinc-900'
                              }`}
                              title={isEnabled ? 'Nonaktifkan modul' : 'Aktifkan modul'}
                            >
                              {isEnabled && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </button>
                          )}
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[10px] text-zinc-400">
                            {isEnabled ? 'Direncanakan' : 'Nonaktif'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-zinc-400 font-semibold">
                          <Circle className="h-2.5 w-2.5 text-zinc-500" />
                          <span>
                            {modTasks.length > 0 ? `${completedModTasks}/${modTasks.length}` : '0/0'}
                          </span>
                        </div>
                      </div>

                      {/* Right Anchor Dot */}
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-600" />
                    </div>

                    {/* HORIZONTAL CONNECTOR LINE TO SUB FITUR (Spacious 56-64px distance matching Image 2) */}
                    <div className="w-14 sm:w-16 h-px bg-zinc-700/70 self-center shrink-0 relative">
                      <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-zinc-600" />
                      <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-zinc-600" />
                    </div>

                    {/* LEVEL 2: SUB FITUR CARD (Micro-pill rows matching Image 2) */}
                    <div
                      className={`w-56 sm:w-64 shrink-0 rounded-2xl border p-2.5 sm:p-3 transition-all shadow-md relative ${
                        !isEnabled
                          ? isLight
                            ? 'bg-zinc-100/50 border-zinc-200 opacity-60'
                            : 'bg-zinc-900/30 border-zinc-850 opacity-50'
                          : isLight
                          ? 'bg-white border-zinc-200'
                          : 'bg-[#0f1420] border-zinc-800/80'
                      }`}
                    >
                      {/* Left Anchor Dot */}
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-600" />

                      {/* Header: SUB FITUR */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-[9.5px] font-mono uppercase font-bold text-zinc-400">
                          <Layers className="h-3 w-3 text-zinc-500" />
                          <span>SUB FITUR</span>
                        </div>
                        <span className="text-[9px] text-zinc-500 font-mono">
                          {mod.subFeatures.length} item
                        </span>
                      </div>

                      {/* Sub-Feature Micro-Pill Items */}
                      <div className="space-y-1">
                        {displayedSubFeatures.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            className={`px-2 py-1.5 rounded-lg text-[11px] leading-snug border transition flex items-center justify-between gap-1.5 group/item ${
                              isLight
                                ? 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:border-zinc-300'
                                : 'bg-[#141a28]/70 border-zinc-800/60 text-zinc-300 hover:border-zinc-700 hover:bg-[#182032]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <span className="h-1 w-1 rounded-full bg-zinc-500 shrink-0" />
                              <span className="truncate" title={sub}>
                                {sub}
                              </span>
                            </div>

                            {onRemoveSubFeature && (
                              <button
                                type="button"
                                onClick={() => onRemoveSubFeature(mod.id, sIdx)}
                                className="opacity-0 group-hover/item:opacity-100 p-0.5 text-zinc-500 hover:text-red-400 transition cursor-pointer shrink-0"
                                title="Hapus sub-fitur ini"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Expand / Collapse Sub-Features toggle */}
                      {mod.subFeatures.length > 3 && (
                        <button
                          type="button"
                          onClick={() => toggleExpandSub(mod.id)}
                          className="w-full pt-1.5 text-center text-[10px] font-medium text-zinc-500 hover:text-zinc-300 cursor-pointer transition block"
                        >
                          {isSubExpanded
                            ? 'Tampilkan lebih sedikit ^'
                            : `Lihat semua (${mod.subFeatures.length}) >`}
                        </button>
                      )}

                      {/* Add Custom Sub-Feature Inline */}
                      {onAddSubFeature && (
                        <div className="mt-2 pt-1.5 border-t border-zinc-800/50">
                          {activeAddSubFeature === mod.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={newSubFeatureInput[mod.id] || ''}
                                onChange={(e) =>
                                  setNewSubFeatureInput((prev) => ({
                                    ...prev,
                                    [mod.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddSubFeatureSubmit(mod.id);
                                  }
                                }}
                                placeholder="Sub-fitur baru..."
                                className={`flex-1 text-[11px] px-2 py-1 rounded-md border focus:outline-none focus:border-amber-500 ${
                                  isLight
                                    ? 'bg-white border-zinc-300 text-zinc-900'
                                    : 'bg-zinc-900 border-zinc-700 text-white'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddSubFeatureSubmit(mod.id)}
                                className="px-2 py-1 rounded-md bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 transition cursor-pointer"
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveAddSubFeature(null)}
                                className="p-1 text-zinc-400 hover:text-white transition cursor-pointer text-[10px]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveAddSubFeature(mod.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Tambah Sub Fitur</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Right Anchor Dot */}
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-600" />
                    </div>

                    {/* LEVEL 3: TASKS CARD (If showTasks is true or has tasks) */}
                    {(showTasks || modTasks.length > 0) && (
                      <>
                        {/* HORIZONTAL CONNECTOR LINE TO TASKS (Spacious 56-64px distance matching Image 2) */}
                        <div className="w-14 sm:w-16 h-px bg-zinc-700/70 self-center shrink-0 relative animate-in fade-in duration-200">
                          <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-zinc-600" />
                          <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-blue-500/80" />
                        </div>

                        {/* TASKS CARD (Cool Blue/Navy-tinted execution card matching Image 2) */}
                        <div
                          className={`w-60 sm:w-68 shrink-0 rounded-2xl border p-2.5 sm:p-3 transition-all shadow-md relative animate-in fade-in duration-200 ${
                            isLight
                              ? 'bg-blue-50/60 border-blue-200'
                              : 'bg-[#121c2e] border-blue-900/40 hover:border-blue-700/50 shadow-blue-950/20'
                          }`}
                        >
                          {/* Left Anchor Dot */}
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400/80" />

                          {/* Header: TASKS */}
                          <div className="flex items-center justify-between mb-2">
                            <div className={`flex items-center gap-1.5 text-[9.5px] font-mono uppercase font-bold ${
                              isLight ? 'text-blue-700' : 'text-blue-400'
                            }`}>
                              <ListTodo className={`h-3 w-3 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                              <span>TASKS</span>
                            </div>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                              isLight
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-blue-950/80 border border-blue-800/40 text-blue-300 font-semibold'
                            }`}>
                              {completedModTasks}/{modTasks.length}
                            </span>
                          </div>

                          {modTasks.length === 0 ? (
                            <div className="py-2.5 text-center text-[10px] text-zinc-500">
                              <p>Belum ada rincian tugas coding.</p>
                              {onGenerateTasks && (
                                <button
                                  type="button"
                                  onClick={onGenerateTasks}
                                  className={`mt-1 hover:underline text-[10px] font-semibold cursor-pointer block mx-auto ${
                                    isLight ? 'text-blue-600' : 'text-blue-400'
                                  }`}
                                >
                                  + Rinci Tugas Otomatis
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {displayedTasks.map((task) => {
                                const isTaskDone = task.completed;
                                return (
                                  <div
                                    key={task.id}
                                    onClick={() => onToggleTask && onToggleTask(mod.id, task.id)}
                                    className={`px-2 py-1.5 rounded-lg text-[11px] leading-snug border transition cursor-pointer select-none flex items-center gap-2 ${
                                      isTaskDone
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through'
                                        : isLight
                                        ? 'bg-white border-blue-200/70 text-slate-800 hover:border-blue-300'
                                        : 'bg-[#172338]/90 border-blue-900/30 text-blue-100/90 hover:border-blue-700/50 hover:bg-[#1c2c48]'
                                    }`}
                                  >
                                    <div
                                      className={`h-3 w-3 rounded border flex items-center justify-center shrink-0 transition ${
                                        isTaskDone
                                          ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                                          : isLight
                                          ? 'border-blue-300 bg-white'
                                          : 'border-blue-500/40 bg-[#0d1624]'
                                      }`}
                                    >
                                      {isTaskDone && <Check className="h-2 w-2 stroke-[3]" />}
                                    </div>

                                    <span
                                      className="truncate flex-1"
                                      title={task.title}
                                    >
                                      {task.title}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Expand / Collapse Tasks toggle */}
                          {modTasks.length > 3 && (
                            <button
                              type="button"
                              onClick={() => toggleExpandTasks(mod.id)}
                              className={`w-full pt-1.5 text-center text-[10px] font-medium cursor-pointer transition block ${
                                isLight ? 'text-blue-600/80 hover:text-blue-800' : 'text-blue-400/80 hover:text-blue-300'
                              }`}
                            >
                              {isTasksExpanded
                                ? 'Tampilkan lebih sedikit ^'
                                : `Lihat semua (${modTasks.length}) >`}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>

        {/* Floating Minimalist Canvas Controls (Bottom-Left - matching Image 2) */}
        <div className="absolute bottom-5 left-5 z-30 flex flex-col items-center bg-[#131824]/90 border border-zinc-800/90 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden divide-y divide-zinc-800/70">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(140, prev + 10))}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Perbesar Skala (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(40, prev - 10))}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Perkecil Skala (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoomLevel(isSplit ? 65 : 85);
              centerCanvasOnTree(true);
            }}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Posisikan ke Tengah (Reset Center)"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
