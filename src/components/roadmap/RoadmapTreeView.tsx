'use client';

import React, { useState, useMemo } from 'react';
import { RoadmapOutput, RoadmapNode, RoadmapSubBranch, NodeStatus, RoadmapLevel } from '@/types/roadmap';
import {
  Compass,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Box,
  LayoutGrid,
  Download,
  RefreshCw,
  GitBranch,
  Layers,
  BookOpen,
  ExternalLink,
  Code2,
  Check,
  Circle,
  Plus,
  ArrowRight,
  Briefcase,
  Target,
} from 'lucide-react';
import { RoadmapNodeDrawer } from './RoadmapNodeDrawer';

interface RoadmapTreeViewProps {
  roadmap: RoadmapOutput;
  onReset: () => void;
  onUpdateRoadmap?: (updated: RoadmapOutput) => void;
  theme?: 'dark' | 'light';
}

export function RoadmapTreeView({
  roadmap,
  onReset,
  onUpdateRoadmap,
  theme = 'dark',
}: RoadmapTreeViewProps) {
  const isLight = theme === 'light';
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(85);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [currentRoadmap, setCurrentRoadmap] = useState<RoadmapOutput>(roadmap);
  const [branchingCardId, setBranchingCardId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Sync state if prop changes
  React.useEffect(() => {
    setCurrentRoadmap(roadmap);
  }, [roadmap]);

  // Toggle branch expansion for milestone
  const toggleBranch = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: prev[nodeId] === undefined ? false : !prev[nodeId],
    }));
  };

  const isBranchExpanded = (nodeId: string) => {
    return expandedNodes[nodeId] !== false; // Default open
  };

  // Toggle child expansion for specific card
  const toggleCardChildren = (cardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: prev[cardId] === undefined ? false : !prev[cardId],
    }));
  };

  const isCardExpanded = (cardId: string) => {
    return expandedCards[cardId] !== false; // Default open
  };

  // Helper to ensure subBranches exist on node
  const getMaterializedSubBranches = (node: RoadmapNode): RoadmapSubBranch[] => {
    if (node.subBranches && node.subBranches.length > 0) return node.subBranches;
    return (node.keyTopics || []).map((topic, sIdx) => ({
      id: `${node.id}-sub-${sIdx + 1}`,
      title: topic,
      estimatedHours: '3-5 Jam',
      actionSteps: node.actionSteps && node.actionSteps[sIdx]
        ? [node.actionSteps[sIdx]]
        : [`Kuasai konsep ${topic} dan terapkan pada proyek`],
      keyTopics: [topic],
      children: [],
      status: 'not_started' as NodeStatus,
    }));
  };

  // Status handler with recursive support for milestones, sub-branches, and deep children
  const handleStatusChange = (nodeId: string, newStatus: NodeStatus) => {
    const updatedNodes = currentRoadmap.nodes.map((n) => {
      // 1. Direct match on top-level milestone node
      if (n.id === nodeId) {
        return { ...n, status: newStatus };
      }

      // 2. Check within subBranches
      const branches = getMaterializedSubBranches(n);
      let subBranchMutated = false;

      const updatedBranches = branches.map((sb) => {
        // Direct match on sub-branch
        if (sb.id === nodeId) {
          subBranchMutated = true;
          return { ...sb, status: newStatus };
        }

        // Check inside horizontal children
        if (sb.children && sb.children.length > 0) {
          let childMutated = false;
          const updatedChildren = sb.children.map((cb) => {
            if (cb.id === nodeId) {
              childMutated = true;
              subBranchMutated = true;
              return { ...cb, status: newStatus };
            }
            return cb;
          });

          if (childMutated) {
            return { ...sb, children: updatedChildren };
          }
        }

        return sb;
      });

      if (subBranchMutated) {
        const allCompleted = updatedBranches.length > 0 && updatedBranches.every((b) => b.status === 'completed');
        const anyInProgress = updatedBranches.some((b) => b.status === 'in_progress' || b.status === 'completed');

        let parentStatus = n.status;
        if (allCompleted) {
          parentStatus = 'completed';
        } else if (anyInProgress && parentStatus === 'not_started') {
          parentStatus = 'in_progress';
        }

        return {
          ...n,
          status: parentStatus,
          subBranches: updatedBranches,
        };
      }

      return n;
    });

    const updatedRoadmap: RoadmapOutput = {
      ...currentRoadmap,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString(),
    };

    setCurrentRoadmap(updatedRoadmap);

    // Keep active selectedNode in sync if drawer is inspecting it
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, status: newStatus });
    }

    if (onUpdateRoadmap) {
      onUpdateRoadmap(updatedRoadmap);
    }
  };

  // 1-Click Branching KE SAMPING (to the right) from a SPECIFIC card
  const handleBranchCard = async (
    parentNode: RoadmapNode,
    branchCard: RoadmapSubBranch,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (branchingCardId) return;

    setBranchingCardId(branchCard.id);

    try {
      const existingChildTitles = (branchCard.children || []).map((c) => c.title);

      const res = await fetch('/api/roadmap-branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: parentNode.id,
          cardId: branchCard.id,
          nodeTitle: branchCard.title,
          parentTitle: parentNode.title,
          nodeCategory: parentNode.category,
          roadmapGoal: currentRoadmap.goal || currentRoadmap.title,
          existingBranches: existingChildTitles,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal membuat cabang lanjutan ke samping');
      }

      const newChildren: RoadmapSubBranch[] = json.data?.branches || [];
      if (newChildren.length === 0) return;

      const updatedNodes = currentRoadmap.nodes.map((n) => {
        if (n.id === parentNode.id) {
          const updatedSubBranches = (n.subBranches || []).map((sb) => {
            if (sb.id === branchCard.id) {
              return {
                ...sb,
                children: [...(sb.children || []), ...newChildren],
              };
            }
            return sb;
          });
          return { ...n, subBranches: updatedSubBranches };
        }
        return n;
      });

      const updatedRoadmap = {
        ...currentRoadmap,
        nodes: updatedNodes,
        updatedAt: new Date().toISOString(),
      };

      setCurrentRoadmap(updatedRoadmap);
      setExpandedCards((prev) => ({ ...prev, [branchCard.id]: true }));

      if (onUpdateRoadmap) {
        onUpdateRoadmap(updatedRoadmap);
      }
    } catch (err: any) {
      alert(`Gagal mencabangkan materi: ${err.message}`);
    } finally {
      setBranchingCardId(null);
    }
  };

  // 1-Click Adding a new top-level card to the milestone (kebawah)
  const handleAddTopicToMilestone = async (parentNode: RoadmapNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const loadingKey = `milestone-${parentNode.id}`;
    if (branchingCardId) return;

    setBranchingCardId(loadingKey);

    try {
      const existingBranchTitles = (parentNode.subBranches || []).map((b) => b.title);

      const res = await fetch('/api/roadmap-branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: parentNode.id,
          nodeTitle: parentNode.title,
          nodeCategory: parentNode.category,
          roadmapGoal: currentRoadmap.goal || currentRoadmap.title,
          existingBranches: existingBranchTitles,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menambah topik');
      }

      const newBranches: RoadmapSubBranch[] = json.data?.branches || [];
      if (newBranches.length === 0) return;

      const updatedNodes = currentRoadmap.nodes.map((n) => {
        if (n.id === parentNode.id) {
          const currentBranches = n.subBranches || [];
          return {
            ...n,
            subBranches: [...currentBranches, ...newBranches],
          };
        }
        return n;
      });

      const updatedRoadmap = {
        ...currentRoadmap,
        nodes: updatedNodes,
        updatedAt: new Date().toISOString(),
      };

      setCurrentRoadmap(updatedRoadmap);
      setExpandedNodes((prev) => ({ ...prev, [parentNode.id]: true }));

      if (onUpdateRoadmap) {
        onUpdateRoadmap(updatedRoadmap);
      }
    } catch (err: any) {
      alert(`Gagal menambah topik baru: ${err.message}`);
    } finally {
      setBranchingCardId(null);
    }
  };

  // Dynamic context-aware column label
  const getDynamicColumnLabel = (goal: string, category: string) => {
    const g = (goal || '').toLowerCase();
    if (g.includes('kerja') || g.includes('karir') || g.includes('engineer') || g.includes('developer')) {
      return `KOMPETENSI SPESIFIK & MATERI INDUSTRI`;
    }
    if (g.includes('freelance') || g.includes('upwork') || g.includes('klien')) {
      return `MODUL DELIVERABLE & PROYEK KLIEN`;
    }
    if (g.includes('startup') || g.includes('saas') || g.includes('bisnis') || g.includes('produk')) {
      return `FITUR INTI & TAHAPAN PRODUKSI`;
    }
    return `MODUL SPESIFIKASI ${category.toUpperCase()}`;
  };

  // Learning Level Badges
  const getLevelMeta = (level: RoadmapLevel, index: number) => {
    const levelMap: Record<RoadmapLevel, { label: string; badge: string; border: string }> = {
      fundamental: {
        label: 'Level 1: Fondasi',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        border: 'border-emerald-500/40',
      },
      intermediate: {
        label: 'Level 2: Menengah',
        badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
        border: 'border-sky-500/40',
      },
      advanced: {
        label: 'Level 3: Lanjutan',
        badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        border: 'border-purple-500/40',
      },
      mastery: {
        label: 'Level 4: Penguasaan',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        border: 'border-amber-500/40',
      },
    };

    if (level in levelMap) return levelMap[level];
    const idx = Math.min(3, Math.floor((index / (currentRoadmap.nodes.length || 1)) * 4));
    const keys: RoadmapLevel[] = ['fundamental', 'intermediate', 'advanced', 'mastery'];
    return levelMap[keys[idx]];
  };

  // Filter levels
  const availableLevels = useMemo(() => {
    return [
      { id: 'ALL', label: 'Semua Level' },
      { id: 'fundamental', label: 'Level 1: Fondasi' },
      { id: 'intermediate', label: 'Level 2: Menengah' },
      { id: 'advanced', label: 'Level 3: Lanjutan' },
      { id: 'mastery', label: 'Level 4: Penguasaan' },
    ];
  }, []);

  const filteredNodes = useMemo(() => {
    if (selectedLevelFilter === 'ALL') return currentRoadmap.nodes;
    return currentRoadmap.nodes.filter((n) => n.level === selectedLevelFilter);
  }, [currentRoadmap.nodes, selectedLevelFilter]);

  // Progres Capaian (menghitung seluruh unit: milestone, sub-topik, dan materi cabang)
  const { totalUnits, completedUnits } = useMemo(() => {
    let total = 0;
    let completed = 0;

    currentRoadmap.nodes.forEach((n) => {
      total += 1;
      if (n.status === 'completed') completed += 1;

      const branches = n.subBranches || [];
      branches.forEach((sb) => {
        total += 1;
        if (sb.status === 'completed') completed += 1;

        if (sb.children) {
          sb.children.forEach((cb) => {
            total += 1;
            if (cb.status === 'completed') completed += 1;
          });
        }
      });
    });

    return { totalUnits: total, completedUnits: completed };
  }, [currentRoadmap.nodes]);

  const progressPercent = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  // Export Markdown
  const handleExportMarkdown = () => {
    let md = `# ${currentRoadmap.title}\n\n`;
    md += `**Target Outcome:** ${currentRoadmap.targetRoleOrOutcome}\n`;
    md += `**Estimasi Durasi:** ${currentRoadmap.totalEstimatedWeeks}\n\n`;
    md += `## Ringkasan Eksekutif\n${currentRoadmap.summary}\n\n`;
    md += `## Pohon Keterampilan & Kurikulum Belajar\n\n`;

    currentRoadmap.nodes.forEach((n, idx) => {
      const levelMeta = getLevelMeta(n.level, idx);
      md += `### ${idx + 1}. [${levelMeta.label}] ${n.title} (${n.status})\n`;
      md += `- **Kategori:** ${n.category}\n`;
      md += `- **Estimasi Waktu:** ${n.estimatedHours}\n`;
      md += `- **Ringkasan:** ${n.summary}\n`;

      if (n.subBranches && n.subBranches.length > 0) {
        md += `- **Sub-Cabang Keahlian:**\n`;
        n.subBranches.forEach((sb, sbIdx) => {
          md += `  - **${sbIdx + 1}. ${sb.title}** (${sb.estimatedHours || '3-5 Jam'})\n`;
          if (sb.actionSteps && sb.actionSteps.length > 0) {
            sb.actionSteps.forEach((as) => {
              md += `    - [ ] ${as}\n`;
            });
          }
          if (sb.children && sb.children.length > 0) {
            sb.children.forEach((cb, cbIdx) => {
              md += `      - **${sbIdx + 1}.${cbIdx + 1} ${cb.title}** (${cb.estimatedHours || '3-5 Jam'})\n`;
            });
          }
        });
      }

      if (n.projectChallenge) {
        md += `- **Tantangan Proyek Portofolio:** ${n.projectChallenge.title}\n`;
        md += `  - Deliverable: ${n.projectChallenge.deliverable}\n`;
      }
      md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentRoadmap.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Convert sub-branch or deep child to RoadmapNode for drawer inspection
  const openSubBranchDrawer = (
    parentNode: RoadmapNode,
    branch: RoadmapSubBranch,
    parentBranch?: RoadmapSubBranch
  ) => {
    setSelectedNode({
      id: branch.id,
      title: branch.title,
      category: parentBranch
        ? `${parentNode.title} > ${parentBranch.title}`
        : `${parentNode.title} / Sub-Materi`,
      level: parentNode.level,
      status: branch.status || 'not_started',
      estimatedHours: branch.estimatedHours || '3-5 Jam',
      summary: branch.summary || `Penguasaan mendalam materi ${branch.title} dengan pemahaman konsep dan implementasi nyata.`,
      actionSteps: branch.actionSteps || [],
      keyTopics: branch.keyTopics || [branch.title],
      curatedLinks: branch.curatedLinks && branch.curatedLinks.length > 0 ? branch.curatedLinks : parentNode.curatedLinks,
      projectChallenge: branch.projectChallenge,
      commonPitfalls: branch.commonPitfalls,
      dependencies: [parentNode.id],
      subBranches: branch.children,
    });
  };

  return (
    <div className="w-full h-full flex flex-col flex-1 relative overflow-hidden select-none">
      {/* 1. Top Control Bar (Fixed Header over canvas) */}
      <div
        className={`h-14 shrink-0 border-b px-4 flex items-center justify-between z-20 transition-colors ${
          isLight
            ? 'bg-white/95 border-zinc-200 backdrop-blur-md text-zinc-900'
            : 'bg-[#0e1117]/95 border-zinc-800 backdrop-blur-md text-white'
        }`}
      >
        {/* Left: Title & Metadata */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 shrink-0">
            <Compass className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="font-bold text-orange-400">Roadmap Pintar</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-zinc-200 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {currentRoadmap.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
              <span className="truncate">{currentRoadmap.targetRoleOrOutcome}</span>
              <span>•</span>
              <span className="shrink-0">{currentRoadmap.totalEstimatedWeeks}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold shrink-0">
                {progressPercent}% Telah Dikuasai
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Filters */}
        <div className="flex items-center gap-2">
          {/* Level Filter Buttons */}
          <div className="hidden md:flex items-center rounded-xl bg-zinc-900/80 p-0.5 border border-zinc-800 gap-0.5">
            {availableLevels.map((lvl) => {
              const isSelected = selectedLevelFilter === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSelectedLevelFilter(lvl.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-600 text-white font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center rounded-xl bg-zinc-900/80 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(50, prev - 10))}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Perkecil Skala"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-xs font-mono font-medium text-zinc-300">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(140, prev + 10))}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Perbesar Skala"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(85)}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors ml-0.5"
              title="Reset Skala"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Action Buttons */}
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            title="Unduh Roadmap Markdown"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Export .MD</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            title="Rancang Roadmap Baru"
          >
            <RefreshCw className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Ganti Tujuan</span>
          </button>
        </div>
      </div>

      {/* 2. Fullscreen Infinite Mindmap Canvas */}
      <div
        id="full-roadmap-canvas"
        className={`flex-1 w-full h-full relative overflow-auto cursor-grab active:cursor-grabbing ${
          isLight ? 'bg-[#f8fafc]' : 'bg-[#090b10]'
        }`}
      >
        {/* Dot-matrix background pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(${isLight ? '#000' : '#fff'} 1.2px, transparent 1.2px)`,
            backgroundSize: '24px 24px',
            minWidth: '3600px',
            minHeight: '3600px',
          }}
        />

        {/* Scalable Mindmap Container */}
        <div
          className="p-8 sm:p-14 min-w-[1600px] inline-block"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Multi-Column Tree Structure: [ROOT] -> [PILLARS / MILESTONES] -> [TOPIC CARDS] -> [HORIZONTAL CHILD BRANCHES] */}
          <div className="flex items-start gap-14 relative z-10">
            {/* COLUMN 1: Root Node (Sasaran Utama) */}
            <div className="shrink-0 w-72 sticky top-14 pt-6">
              <div
                className={`rounded-3xl border p-6 text-center shadow-2xl transition-all relative ${
                  isLight
                    ? 'bg-white border-zinc-300 text-zinc-900'
                    : 'bg-[#121620] border-zinc-700/90 text-white'
                }`}
              >
                {/* Accent glow */}
                <div className="absolute -inset-1 bg-orange-500/15 rounded-3xl blur-md pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 mb-3.5 shadow-lg shadow-orange-500/10">
                    <Compass className="h-6 w-6" />
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-orange-500/15 text-orange-400 border border-orange-500/30 inline-block mb-2">
                    Target Sasaran Utama
                  </span>

                  <h2 className="text-lg font-black tracking-tight leading-snug mb-2">
                    {currentRoadmap.title}
                  </h2>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {currentRoadmap.targetRoleOrOutcome}
                  </p>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      <span>{currentRoadmap.totalEstimatedWeeks}</span>
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {progressPercent}% Selesai
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2 & BEYOND: Milestone Pillars, Individual Cards & Horizontal Branches */}
            <div className="flex-1 space-y-12">
              {filteredNodes.map((node, index) => {
                const levelMeta = getLevelMeta(node.level, index);
                const isCompleted = node.status === 'completed';
                const isInProgress = node.status === 'in_progress';
                const isExpanded = isBranchExpanded(node.id);

                // Sub-branch cards
                const branches: RoadmapSubBranch[] = getMaterializedSubBranches(node);

                const columnHeaderLabel = getDynamicColumnLabel(currentRoadmap.goal, node.category);

                return (
                  <div key={node.id} className="flex items-start gap-6 group relative">
                    {/* Level Milestone Card (Left: 300px) */}
                    <div
                      onClick={() => setSelectedNode(node)}
                      className={`w-76 shrink-0 rounded-2xl border p-5 transition-all shadow-lg cursor-pointer relative ${
                        isCompleted
                          ? 'bg-[#121b18] border-emerald-500/40 hover:border-emerald-500/70'
                          : isInProgress
                          ? 'bg-[#181a20] border-amber-500/40 hover:border-amber-500/70'
                          : isLight
                          ? 'bg-white border-zinc-200 hover:border-orange-500/40'
                          : 'bg-[#131722] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* Card Header: Level Tag & Status */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-md border uppercase ${levelMeta.badge}`}
                        >
                          {levelMeta.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-400'
                                : isInProgress
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-zinc-600'
                            }`}
                          />
                          <span
                            className={`text-[11px] font-medium ${
                              isCompleted
                                ? 'text-emerald-400'
                                : isInProgress
                                ? 'text-amber-400'
                                : 'text-zinc-500'
                            }`}
                          >
                            {isCompleted
                              ? 'Telah Dikuasai'
                              : isInProgress
                              ? 'Sedang Dipelajari'
                              : 'Belum Mulai'}
                          </span>
                        </div>
                      </div>

                      {/* Title & Summary */}
                      <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors leading-snug mb-1.5 line-clamp-2">
                        {node.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3.5">
                        {node.summary}
                      </p>

                      {/* Card Footer */}
                      <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3 text-zinc-500" />
                          <span>{node.estimatedHours}</span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => toggleBranch(node.id, e)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 px-2 py-0.5 rounded-md bg-orange-500/10 hover:bg-orange-500/20 transition-colors cursor-pointer"
                          title={isExpanded ? 'Sembunyikan Percabangan' : 'Tampilkan Percabangan'}
                        >
                          <span>{branches.length} Topik</span>
                          <ChevronDown
                            className={`h-3 w-3 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Connector Arm to Topics */}
                    <div className="w-8 h-px bg-zinc-700/80 mt-12 shrink-0 relative">
                      <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-orange-500/80" />
                    </div>

                    {/* TOPIC CARDS + HORIZONTAL BRANCHING CONTAINER */}
                    <div className="flex-1">
                      {isExpanded ? (
                        <div className="space-y-4">
                          {/* Dynamic Header Label for this level */}
                          <div className="flex items-center justify-between px-1 pb-1">
                            <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-orange-400 uppercase tracking-wider">
                              <GitBranch className="h-3.5 w-3.5 text-orange-400" />
                              <span>{columnHeaderLabel}</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                              {branches.length} Topik Inti
                            </span>
                          </div>

                          {/* List of Topic Cards, each capable of branching HORIZONTALLY (KE SAMPING) */}
                          <div className="space-y-4">
                            {branches.map((branch, bIdx) => {
                              const isBranchingThisCard = branchingCardId === branch.id;
                              const hasChildren = branch.children && branch.children.length > 0;
                              const isChildrenOpen = isCardExpanded(branch.id);
                              const isBranchCompleted = branch.status === 'completed';
                              const isBranchInProgress = branch.status === 'in_progress';

                              return (
                                <div key={branch.id || bIdx} className="flex items-start gap-4">
                                  {/* THE TOPIC CARD (Left: 340px) */}
                                  <div
                                    onClick={() => openSubBranchDrawer(node, branch)}
                                    className={`w-[340px] shrink-0 p-4 rounded-2xl border transition-all shadow-md cursor-pointer group/card relative ${
                                      isBranchCompleted
                                        ? 'bg-[#101b16] border-emerald-500/50 hover:border-emerald-400'
                                        : isBranchInProgress
                                        ? 'bg-[#1a1b14] border-amber-500/50 hover:border-amber-400'
                                        : isLight
                                        ? 'bg-white border-zinc-200 hover:border-orange-500/40'
                                        : 'bg-[#131722] hover:bg-[#181d2c] border-zinc-800 hover:border-orange-500/50'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <span
                                          className={`w-5 h-5 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                            isBranchCompleted
                                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                              : isBranchInProgress
                                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                              : 'bg-orange-500/15 border border-orange-500/30 text-orange-400'
                                          }`}
                                        >
                                          {bIdx + 1}
                                        </span>
                                        <h4 className="text-xs md:text-sm font-bold text-white group-hover/card:text-orange-300 transition-colors leading-snug line-clamp-2">
                                          {branch.title}
                                        </h4>
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {isBranchCompleted ? (
                                          <span className="text-[10px] font-medium font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            <span>Dikuasai</span>
                                          </span>
                                        ) : isBranchInProgress ? (
                                          <span className="text-[10px] font-medium font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                            <span>Belajar</span>
                                          </span>
                                        ) : branch.estimatedHours ? (
                                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 shrink-0">
                                            {branch.estimatedHours}
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>

                                    {/* Action Steps or Summary Preview */}
                                    {branch.actionSteps && branch.actionSteps.length > 0 ? (
                                      <ul className="space-y-1.5 pl-7 mt-2">
                                        {branch.actionSteps.slice(0, 2).map((step, sIdx) => (
                                          <li
                                            key={sIdx}
                                            className="text-xs text-zinc-400 group-hover/card:text-zinc-300 flex items-start gap-2 leading-relaxed"
                                          >
                                            <span className="text-orange-400/80 shrink-0 mt-0.5">•</span>
                                            <span className="line-clamp-2">{step}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-xs text-zinc-400 pl-7 line-clamp-2 mt-1">
                                        {branch.summary || `Penguasaan materi teknis terarah pada topik ${branch.title}.`}
                                      </p>
                                    )}

                                    {/* Action Buttons Row */}
                                    <div className="mt-3.5 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-[11px]">
                                      <span className="text-zinc-400 group-hover/card:text-orange-300 font-medium transition-colors">
                                        Detail & Mentor &rarr;
                                      </span>

                                      {/* + Cabangkan ke Samping Button */}
                                      <button
                                        type="button"
                                        onClick={(e) => handleBranchCard(node, branch, e)}
                                        disabled={isBranchingThisCard}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:text-orange-300 font-semibold transition-all cursor-pointer disabled:opacity-50"
                                        title="Cabangkan topik ini ke samping dengan AI"
                                      >
                                        {isBranchingThisCard ? (
                                          <>
                                            <div className="w-3 h-3 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
                                            <span>Mencabangkan...</span>
                                          </>
                                        ) : (
                                          <>
                                            <GitBranch className="h-3 w-3 text-orange-400" />
                                            <span>+ Cabang ke Samping</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* HORIZONTAL EXPANSION (KE SAMPING) IF THIS CARD HAS CHILDREN */}
                                  {hasChildren && (
                                    <div className="flex items-start gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
                                      {/* Connector Line to the Right */}
                                      <div className="w-8 h-px bg-orange-500/60 mt-10 shrink-0 relative">
                                        <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-orange-400" />
                                      </div>

                                      {/* Child Cards Column (KE SAMPING) */}
                                      <div className="w-[300px] shrink-0 space-y-2.5">
                                        <div className="flex items-center justify-between text-[10px] font-mono text-orange-400 uppercase tracking-wider px-1">
                                          <span>Cabang #{bIdx + 1}: Lanjutan</span>
                                          <span className="text-zinc-500">{branch.children!.length} Sub-Materi</span>
                                        </div>

                                        {branch.children!.map((child, cIdx) => {
                                          const isChildCompleted = child.status === 'completed';
                                          const isChildInProgress = child.status === 'in_progress';

                                          return (
                                            <div
                                              key={child.id || cIdx}
                                              onClick={() => openSubBranchDrawer(node, child, branch)}
                                              className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-md group/child relative ${
                                                isChildCompleted
                                                  ? 'bg-[#121c17] border-emerald-500/50 hover:border-emerald-400'
                                                  : isChildInProgress
                                                  ? 'bg-[#1c1c14] border-amber-500/50 hover:border-amber-400'
                                                  : 'bg-[#161a26] hover:bg-[#1c2232] border-zinc-800 hover:border-orange-500/50'
                                              }`}
                                            >
                                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <div className="flex items-center gap-2">
                                                  <span
                                                    className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                                      isChildCompleted
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : isChildInProgress
                                                        ? 'bg-amber-500/20 text-amber-400'
                                                        : 'bg-orange-500/20 text-orange-400'
                                                    }`}
                                                  >
                                                    {bIdx + 1}.{cIdx + 1}
                                                  </span>
                                                  <h5 className="text-xs font-bold text-white group-hover/child:text-orange-300 transition-colors leading-snug line-clamp-1">
                                                    {child.title}
                                                  </h5>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                  {isChildCompleted ? (
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Telah Dikuasai" />
                                                  ) : isChildInProgress ? (
                                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Sedang Dipelajari" />
                                                  ) : child.estimatedHours ? (
                                                    <span className="text-[9px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 shrink-0">
                                                      {child.estimatedHours}
                                                    </span>
                                                  ) : null}
                                                </div>
                                              </div>

                                              <p className="text-[11px] text-zinc-400 line-clamp-2 pl-6 leading-relaxed">
                                                {child.summary || (child.actionSteps && child.actionSteps[0]) || 'Penguasaan materi lanjutan terarah.'}
                                              </p>

                                              <div className="mt-2 pt-1.5 border-t border-zinc-850 flex items-center justify-between text-[10px] pl-6 text-zinc-500">
                                                <span className="text-orange-400/90 group-hover/child:underline">
                                                  Detail & Mentor &rarr;
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Add Top-Level Topic to this Milestone (Kebawah) */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={(e) => handleAddTopicToMilestone(node, e)}
                              disabled={branchingCardId === `milestone-${node.id}`}
                              className="w-[340px] py-2 px-3 rounded-xl border border-dashed border-zinc-700/80 hover:border-orange-500/40 bg-zinc-900/40 hover:bg-zinc-900 text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {branchingCardId === `milestone-${node.id}` ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
                                  <span>Menambah Topik Baru...</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3.5 w-3.5 text-zinc-500" />
                                  <span>+ Tambah Topik di Level Ini</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Collapsed State Button */
                        <button
                          type="button"
                          onClick={() => toggleBranch(node.id)}
                          className="h-12 px-4 rounded-xl border border-dashed border-zinc-700/80 hover:border-orange-500/50 bg-zinc-900/40 hover:bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <GitBranch className="h-3.5 w-3.5 text-orange-400" />
                          <span>Mekarkan {branches.length} Topik...</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Slide-over Node Detail Drawer */}
      <RoadmapNodeDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onStatusChange={handleStatusChange}
        roadmapTitle={currentRoadmap.title}
        targetRole={currentRoadmap.targetRoleOrOutcome}
      />
    </div>
  );
}
