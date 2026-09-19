'use client';

import React, { useState, useMemo } from 'react';
import { PRDOutput, RoadmapPhaseNode, SubFeatureNode } from '@/types/prd';
import {
  GitBranch,
  Layers,
  CheckCircle2,
  Clock,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  FolderTree,
  Terminal,
  Filter,
  Box,
  LayoutGrid,
} from 'lucide-react';

interface PhasedFeatureTreeProps {
  prd: PRDOutput;
  theme?: 'dark' | 'light';
}

const SCHEMA_GARBAGE_KEYS = new Set([
  'status', 'description', 'icon', 'sub_features', 'id', 'label', 'priority', 'children'
]);

function isGarbageString(s: string): boolean {
  return SCHEMA_GARBAGE_KEYS.has(s.trim().toLowerCase());
}

export const PhasedFeatureTree: React.FC<PhasedFeatureTreeProps> = ({
  prd,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('ALL');
  const [copiedPhase, setCopiedPhase] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Derive or use existing roadmap tree nodes
  const nodes: RoadmapPhaseNode[] = useMemo(() => {
    if (prd.roadmap_tree && prd.roadmap_tree.length > 0) {
      // Sanitize sub_features against schema key garbage
      const sanitizedTree = prd.roadmap_tree.map((node) => {
        const validSubFeatures = (node.sub_features || []).filter((item) => {
          if (typeof item === 'string') return !isGarbageString(item);
          if (typeof item === 'object' && item !== null) return !isGarbageString(item.label || '');
          return true;
        });

        if (validSubFeatures.length === 0 && prd.feature_breakdown && prd.feature_breakdown.length > 0) {
          const matchingFeat = prd.feature_breakdown.find(
            (f) => f.id === node.id || f.name.toLowerCase().includes(node.title.toLowerCase()) || node.title.toLowerCase().includes(f.name.toLowerCase())
          ) || prd.feature_breakdown[0];
          const subItems = matchingFeat.happy_path && matchingFeat.happy_path.length > 0
            ? matchingFeat.happy_path.slice(0, 4)
            : matchingFeat.business_rules.slice(0, 4);
          return {
            ...node,
            sub_features: subItems.length > 0 ? subItems : [`Tampilan Antarmuka ${node.title}`, `Alur Proses & Validasi`, `Integrasi Data & Status`],
          };
        }

        return {
          ...node,
          sub_features: validSubFeatures.length > 0 ? validSubFeatures : [`Tampilan Antarmuka ${node.title}`, `Alur Proses & Validasi`, `Integrasi Data & Status`],
        };
      });

      return sanitizedTree;
    }

    // Fallback generator from feature_breakdown or scope
    const generated: RoadmapPhaseNode[] = [];

    if (prd.feature_breakdown && prd.feature_breakdown.length > 0) {
      const totalFeats = prd.feature_breakdown.length;
      const totalPhases = Math.max(2, Math.min(6, Math.ceil(totalFeats / 2)));

      prd.feature_breakdown.forEach((feat, idx) => {
        const phaseNumber = Math.min(totalPhases, Math.floor((idx / totalFeats) * totalPhases) + 1);
        const phaseLabel = `FASE ${phaseNumber}`;
        const subItems = feat.happy_path && feat.happy_path.length > 0
          ? feat.happy_path.slice(0, 4)
          : feat.business_rules.slice(0, 4);

        generated.push({
          id: `feat_node_${feat.id || idx}`,
          title: feat.name,
          phase: phaseLabel,
          status: 'Direncanakan',
          sub_features: subItems.length > 0 ? subItems : ['Komponen UI Frontend', 'Rute API Backend', 'Model Data & Validasi'],
        });
      });
    } else {
      // Fallback from scope
      const scopes = prd.boundaries.scope || [];
      const defaultModules = scopes.length > 0
        ? scopes
        : [
            'Katalog Produk & Layanan',
            'Pencarian & Filter Kategori',
            'Formulir Pemesanan & Transaksi',
            'Integrasi WhatsApp & Notifikasi',
            'Dashboard Manajemen Admin',
            'Autentikasi & Keamanan',
            'Profil & Pengaturan Sistem',
          ];

      const totalScopes = defaultModules.length;
      const totalPhases = Math.max(2, Math.min(6, Math.ceil(totalScopes / 2)));

      defaultModules.forEach((mod, idx) => {
        const phaseNumber = Math.min(totalPhases, Math.floor((idx / totalScopes) * totalPhases) + 1);
        generated.push({
          id: `scope_node_${idx}`,
          title: mod,
          phase: `FASE ${phaseNumber}`,
          status: 'Direncanakan',
          sub_features: [
            `Tampilan Antarmuka ${mod}`,
            `Validasi Input & Alur Data`,
            `Integrasi Database & Status`,
          ],
        });
      });
    }

    return generated;
  }, [prd.roadmap_tree, prd.feature_breakdown, prd.boundaries.scope]);

  // Extract distinct phases dynamically
  const availablePhases = useMemo(() => {
    const set = new Set<string>();
    nodes.forEach((n) => {
      if (n.phase) set.add(n.phase.toUpperCase());
    });
    const sortedPhases = Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
    return ['ALL', ...sortedPhases];
  }, [nodes]);

  // Filter nodes if user clicked a specific phase filter
  const filteredNodes = useMemo(() => {
    if (selectedPhaseFilter === 'ALL') return nodes;
    return nodes.filter((n) => n.phase.toUpperCase() === selectedPhaseFilter.toUpperCase());
  }, [nodes, selectedPhaseFilter]);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleCopyPhasePrompt = (phaseLabel: string, phaseNodes: RoadmapPhaseNode[]) => {
    const prompt = `Halo AI Coding Agent! Saya ingin mengeksekusi pembangunan ${phaseLabel} untuk proyek "${prd.title}".

Daftar modul yang harus diselesaikan pada ${phaseLabel}:
${phaseNodes.map((n, i) => `${i + 1}. ${n.title}\n   Sub-fitur:\n   ${n.sub_features.map((sf) => `• ${typeof sf === 'string' ? sf : sf.label}`).join('\n   ')}`).join('\n\n')}

Instruksi:
1. Baca dan patuhi aturan arsitektur di docs/PRD.md dan docs/DESIGN.md.
2. Buat struktur file modular, type-safe, dan responsive.
3. Mulai dengan modul pertama pada fase ini dan jelaskan langkah eksekusimu sebelum menulis kode.`;

    navigator.clipboard.writeText(prompt);
    setCopiedPhase(phaseLabel);
    setTimeout(() => setCopiedPhase(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 1. Top Control Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 transition-colors ${
        isLight ? 'bg-white border-zinc-200 shadow-xs' : 'bg-[#12151D] border-zinc-800'
      }`}>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <FolderTree className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="font-mono">Pohon Fitur Berfase</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-zinc-200 font-semibold truncate max-w-[200px] sm:max-w-xs">{prd.title}</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Peta jalan pengembangan bertahap siap dieksekusi coding agent secara terarah.
            </p>
          </div>
        </div>

        {/* Phase Filter Chips (Dynamically Generated) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-zinc-500 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          {availablePhases.map((phaseKey) => {
            const isSelected = selectedPhaseFilter === phaseKey;
            return (
              <button
                key={phaseKey}
                type="button"
                onClick={() => setSelectedPhaseFilter(phaseKey)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 shadow-xs font-bold'
                    : isLight
                    ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {phaseKey === 'ALL' ? 'Semua Fase' : phaseKey}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Mindmap Canvas Area */}
      <div
        id="feature-tree-canvas"
        className={`relative rounded-2xl border p-6 sm:p-10 overflow-x-auto min-h-[500px] transition-all duration-200 ${
          isLight
            ? 'bg-[#F8FAFC] border-zinc-300 shadow-inner'
            : 'bg-[#0E1117] border-zinc-800/80 shadow-2xl'
        }`}
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top left',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Visual Grid Dots Background */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${isLight ? '#000' : '#fff'} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Tree Container: Root (Left) -> Connector -> Modules (Center) -> Sub-Features (Right) */}
        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center gap-6 sm:gap-12 min-w-[700px] max-w-6xl mx-auto py-6">
          {/* A. Left Root Node */}
          <div className="shrink-0 flex items-center justify-center lg:w-56">
            <div className={`w-full rounded-2xl border p-5 text-center shadow-xl transition-all ${
              isLight
                ? 'bg-white border-zinc-300 text-zinc-900'
                : 'bg-[#151922] border-zinc-700/80 text-white'
            }`}>
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-2.5">
                <Box className="h-5 w-5" />
              </div>
              <h2 className="text-base font-black tracking-tight leading-snug line-clamp-2">
                {prd.title}
              </h2>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Clock className="h-3 w-3" />
                <span>Perencanaan</span>
              </div>
            </div>
          </div>

          {/* B. SVG Bezier Connector Branch Lines */}
          <div className="hidden lg:block w-14 shrink-0 self-stretch relative">
            <svg
              className="w-full h-full text-zinc-600/50 dark:text-zinc-700/70"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              preserveAspectRatio="none"
              viewBox="0 0 60 700"
            >
              {filteredNodes.map((_, idx) => {
                const total = filteredNodes.length;
                const startY = 350;
                const endY = (idx + 0.5) * (700 / total);
                return (
                  <path
                    key={idx}
                    d={`M 0 ${startY} C 30 ${startY}, 30 ${endY}, 60 ${endY}`}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
          </div>

          {/* C. Nodes List: Modules (Center) + Sub-Features (Right) */}
          <div className="flex-1 space-y-4">
            {filteredNodes.map((node) => {
              const isExpanded = !!expandedNodes[node.id];
              const phaseNumberMatch = node.phase.match(/\d+/);
              const phaseNum = phaseNumberMatch ? phaseNumberMatch[0] : '1';

              // Specific phase badge colors
              const phaseBadgeColors: Record<string, string> = {
                '1': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                '2': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                '3': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                '4': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
              };

              const badgeClass = phaseBadgeColors[phaseNum] || 'bg-amber-500/15 text-amber-400 border-amber-500/30';

              return (
                <div
                  key={node.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 group"
                >
                  {/* Middle Node Card */}
                  <div className={`w-full sm:w-64 shrink-0 rounded-2xl border p-3.5 transition-all shadow-sm ${
                    isLight
                      ? 'bg-white border-zinc-200 group-hover:border-zinc-300'
                      : 'bg-[#151922] border-zinc-800 group-hover:border-zinc-700'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${badgeClass}`}>
                            {node.phase}
                          </span>
                        </div>
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${
                          isLight ? 'text-zinc-900' : 'text-zinc-100'
                        }`}>
                          {node.title}
                        </h4>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                          {node.status || 'Direncanakan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Connector Line for Desktop */}
                  <div className="hidden sm:block w-6 h-px bg-zinc-700 shrink-0" />

                  {/* Right Sub-Features Card */}
                  <div className={`flex-1 rounded-2xl border p-4 transition-all shadow-xs ${
                    isLight
                      ? 'bg-white border-zinc-200'
                      : 'bg-[#181D28] border-zinc-800/90'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-zinc-400">
                        <LayoutGrid className="h-3 w-3 text-amber-400" />
                        <span>SUB FITUR</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {node.sub_features.length} item
                      </span>
                    </div>

                    <ul className="space-y-1.5 text-xs">
                      {(isExpanded ? node.sub_features : node.sub_features.slice(0, 3)).map((item, idx) => {
                        const isObj = typeof item === 'object' && item !== null;
                        const label = isObj ? item.label : String(item);
                        const priority = isObj ? item.priority : undefined;
                        const children = isObj && Array.isArray(item.children) ? item.children : [];

                        return (
                          <li key={idx} className="space-y-1">
                            <div className={`flex items-start gap-2 leading-relaxed ${
                              isLight ? 'text-zinc-700' : 'text-zinc-300'
                            }`}>
                              <span className="text-amber-400/80 font-bold shrink-0 mt-0.5">•</span>
                              <span className="flex-1 line-clamp-1 sm:line-clamp-2">{label}</span>
                              {priority && (
                                <span className={`shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                  priority === 'P0'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                }`}>
                                  {priority}
                                </span>
                              )}
                            </div>
                            {children.length > 0 && (
                              <ul className="ml-4 pl-2 border-l border-zinc-700/50 space-y-1">
                                {children.map((child, ci) => (
                                  <li key={ci} className={`flex items-start gap-1.5 text-[11px] ${
                                    isLight ? 'text-zinc-600' : 'text-zinc-400'
                                  }`}>
                                    <span className="text-zinc-500">-</span>
                                    <span>{typeof child === 'string' ? child : child.label}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    {node.sub_features.length > 3 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(node.id)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-medium mt-2 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Tutup rincian' : `Lihat semua (${node.sub_features.length})`}</span>
                        <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Bottom Toolbar with Zoom & Copy Prompt */}
      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 ${
        isLight ? 'bg-white border-zinc-200 shadow-xs' : 'bg-[#12151D] border-zinc-800'
      }`}>
        {/* Zoom Controls (Screenshot 4 style) */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-xl bg-zinc-950 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Perbesar Canvas (+)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-mono text-zinc-400 px-2 min-w-[40px] text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Perkecil Canvas (-)"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors text-xs font-mono"
              title="Reset Zoom (100%)"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 1-Click Copy Prompt for Active Phase */}
        <div className="flex items-center gap-2">
          {['FASE 1', 'FASE 2'].map((phaseKey) => {
            const phaseNodes = nodes.filter((n) => n.phase.toUpperCase() === phaseKey);
            if (phaseNodes.length === 0) return null;
            const isCopied = copiedPhase === phaseKey;

            return (
              <button
                key={phaseKey}
                type="button"
                onClick={() => handleCopyPhasePrompt(phaseKey, phaseNodes)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  isCopied
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : isLight
                    ? 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:text-white'
                }`}
                title={`Salin prompt eksekusi Cursor / Claude Code untuk ${phaseKey}`}
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Prompt {phaseKey} Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Terminal className="h-3.5 w-3.5 text-amber-400" />
                    <span>Salin Prompt {phaseKey}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
