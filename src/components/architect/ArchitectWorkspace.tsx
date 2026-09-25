'use client';

import React, { useState } from 'react';
import {
  FileText,
  FileCode,
  Download,
  Loader2,
  Send,
  ShieldCheck,
  HelpCircle,
  Link2,
  Table as TableIcon,
  Layers,
  Printer,
  ArrowLeft,
  Check,
  Copy,
  Terminal,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  X,
} from 'lucide-react';
import {
  ArchitectProject,
  AcademicDiagramSet,
  DiagramType,
  CurriculumSchool,
} from '@/lib/academic-architect/types';
import { ArchitectMermaidCanvas } from './ArchitectMermaidCanvas';
import { ArchitectProjectSwitcher } from './ArchitectProjectSwitcher';
import { generateThesisBab3Docx } from '@/lib/academic-architect/docx-generator';

interface ArchitectWorkspaceProps {
  project: ArchitectProject;
  projects: ArchitectProject[];
  onSelectProject: (projectId: string) => void;
  onUpdateProject: (updated: ArchitectProject) => void;
  onOpenFolder: () => void;
  onCreateNew: () => void;
  onBackToHub: () => void;
  onOpenMcpModal: () => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ArchitectWorkspace: React.FC<ArchitectWorkspaceProps> = ({
  project,
  projects,
  onSelectProject,
  onUpdateProject,
  onOpenFolder,
  onCreateNew,
  onBackToHub,
  onOpenMcpModal,
  onDeleteProject,
}) => {
  const [activeTab, setActiveTab] = useState<
    'use_case' | 'sequence' | 'activity' | 'class_diagram' | 'erd' | 'dfd0' | 'dfd1' | 'flowchart' | 'arch'
  >('use_case');
  const [selectedSequenceIdx, setSelectedSequenceIdx] = useState<number>(0);
  const [selectedActivityIdx, setSelectedActivityIdx] = useState<number>(0);
  const [rightPanelTab, setRightPanelTab] = useState<'tables' | 'inspector' | 'defense' | 'trace'>('tables');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false);
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);
  const [revisionInput, setRevisionInput] = useState<string>('');
  const [isRevising, setIsRevising] = useState<boolean>(false);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [isRevisionBarOpen, setIsRevisionBarOpen] = useState<boolean>(true);

  const diagrams: AcademicDiagramSet = project.diagrams;

  // Resolve current active diagram chart code and title
  let currentChart = '';
  let currentTitle = '';

  switch (activeTab) {
    case 'use_case':
      currentChart = diagrams.useCaseDiagram;
      currentTitle = 'Use Case Diagram (Kaidah UML 2.5)';
      break;
    case 'sequence':
      currentChart = diagrams.sequenceScenarios?.[selectedSequenceIdx]?.mermaidCode || diagrams.sequenceScenarios?.[0]?.mermaidCode || '';
      currentTitle = diagrams.sequenceScenarios?.[selectedSequenceIdx]?.title || 'Sequence Diagram';
      break;
    case 'activity':
      currentChart = diagrams.activityScenarios?.[selectedActivityIdx]?.mermaidCode || diagrams.activityScenarios?.[0]?.mermaidCode || '';
      currentTitle = diagrams.activityScenarios?.[selectedActivityIdx]?.title || 'Activity Diagram';
      break;
    case 'class_diagram':
      currentChart = diagrams.classDiagram;
      currentTitle = 'Class Diagram (Struktur Entitas & Model)';
      break;
    case 'erd':
      currentChart = diagrams.erdDiagram;
      currentTitle = 'Entity Relationship Diagram (Notasi Crow\'s Foot)';
      break;
    case 'dfd0':
      currentChart = diagrams.dfdLevel0Diagram;
      currentTitle = 'DFD Level 0 (Diagram Konteks)';
      break;
    case 'dfd1':
      currentChart = diagrams.dfdLevel1Diagram;
      currentTitle = 'DFD Level 1 (Dekomposisi Proses)';
      break;
    case 'flowchart':
      currentChart = diagrams.flowchartDiagram;
      currentTitle = 'Flowchart Logika Bisnis (Standar ANSI)';
      break;
    case 'arch':
      currentChart = diagrams.systemArchitectureDiagram;
      currentTitle = 'Diagram Arsitektur Sistem Menyeluruh';
      break;
  }

  // Handle Chat-to-Modify Revision
  const handleSendRevision = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const instruction = revisionInput.trim();
    if (!instruction || isRevising) return;

    setIsRevising(true);
    setRevisionInput('');

    try {
      const res = await fetch('/api/architect/audit-and-revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDiagrams: project.diagrams,
          instruction,
          activeDiagramType: activeTab,
        }),
      });

      const data = await res.json();
      if (data.success && data.diagrams) {
        const updatedProject: ArchitectProject = {
          ...project,
          diagrams: data.diagrams,
          updatedAt: new Date().toISOString(),
          revisionHistory: [
            ...(project.revisionHistory || []),
            {
              version: (project.revisionHistory?.length || 0) + 1,
              timestamp: new Date().toLocaleTimeString('id-ID'),
              instruction,
            },
          ],
        };
        onUpdateProject(updatedProject);
      }
    } catch (err) {
      console.error('Revision error:', err);
    } finally {
      setIsRevising(false);
    }
  };

  // Handle Export Word .docx
  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const blob = await generateThesisBab3Docx(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bab_3_Perancangan_Sistem_${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export docx error:', err);
      alert('Gagal mengekspor dokumen Word.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Handle Download SQL Migration
  const handleDownloadSql = () => {
    if (!diagrams.sqlDdlScript) return;
    const blob = new Blob([diagrams.sqlDdlScript], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_schema.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toggle Right Panel with specific tab
  const handleToggleRightPanel = (tab: 'tables' | 'inspector' | 'defense' | 'trace') => {
    if (isRightPanelOpen && rightPanelTab === tab) {
      setIsRightPanelOpen(false);
    } else {
      setRightPanelTab(tab);
      setIsRightPanelOpen(true);
    }
  };

  // Toggle Zen / Focus Mode
  const toggleZenMode = () => {
    if (isLeftSidebarOpen || isRightPanelOpen) {
      setIsLeftSidebarOpen(false);
      setIsRightPanelOpen(false);
    } else {
      setIsLeftSidebarOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#09090b] text-zinc-100 select-none">
      {/* 1. TOP BAR */}
      <header className="h-13 px-3 sm:px-4 border-b border-zinc-800 bg-[#0e1117] flex items-center justify-between shrink-0 z-30">
        {/* Left: Hub Back, Toggle Sidebar & Project Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToHub}
            className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Kembali ke Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isLeftSidebarOpen
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
            title={isLeftSidebarOpen ? 'Sembunyikan Katalog Diagram' : 'Tampilkan Katalog Diagram'}
          >
            {isLeftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <ArchitectProjectSwitcher
            currentProject={project}
            projects={projects}
            onSelectProject={onSelectProject}
            onOpenFolder={onOpenFolder}
            onCreateNew={onCreateNew}
            onDeleteProject={onDeleteProject}
          />

          {/* Mazhab Toggle */}
          <div className="hidden lg:inline-flex rounded-lg border border-zinc-800 bg-[#090b10] p-0.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => {
                const updated: ArchitectProject = { ...project, curriculumSchool: 'uml' };
                onUpdateProject(updated);
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                project.curriculumSchool === 'uml'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mazhab UML
            </button>
            <button
              type="button"
              onClick={() => {
                const updated: ArchitectProject = { ...project, curriculumSchool: 'structured' };
                onUpdateProject(updated);
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                project.curriculumSchool === 'structured'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Terstruktur
            </button>
          </div>
        </div>

        {/* Center: Quick Academic Panel Openers */}
        <div className="hidden md:flex items-center gap-1 border border-zinc-800/80 bg-[#090b10] p-0.5 rounded-xl text-xs font-mono">
          <button
            type="button"
            onClick={() => handleToggleRightPanel('tables')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              isRightPanelOpen && rightPanelTab === 'tables'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tabel Bab 3
          </button>
          <button
            type="button"
            onClick={() => handleToggleRightPanel('inspector')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              isRightPanelOpen && rightPanelTab === 'inspector'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            AI Dosen
          </button>
          <button
            type="button"
            onClick={() => handleToggleRightPanel('defense')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              isRightPanelOpen && rightPanelTab === 'defense'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Kisi Sidang
          </button>
          <button
            type="button"
            onClick={() => handleToggleRightPanel('trace')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              isRightPanelOpen && rightPanelTab === 'trace'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Jejak Kode
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zen / Focus Mode Toggle */}
          <button
            type="button"
            onClick={toggleZenMode}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition-colors cursor-pointer ${
              !isLeftSidebarOpen && !isRightPanelOpen
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white'
            }`}
            title={
              !isLeftSidebarOpen && !isRightPanelOpen
                ? 'Kembali ke Tampilan Normal'
                : 'Mode Layar Luas (Maksimalkan Kanvas)'
            }
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {!isLeftSidebarOpen && !isRightPanelOpen ? 'Normal' : 'Layar Luas'}
            </span>
          </button>

          {/* Mode Cetak Toggle */}
          <button
            type="button"
            onClick={() => setIsPrintMode(!isPrintMode)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition-colors cursor-pointer ${
              isPrintMode
                ? 'bg-white text-zinc-900 border-zinc-300 font-bold'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white'
            }`}
            title="Ubah latar kanvas putih bersih untuk cetak A4"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{isPrintMode ? 'Mode Cetak Aktif' : 'Cetak A4'}</span>
          </button>

          {/* MCP Modal Button */}
          <button
            type="button"
            onClick={onOpenMcpModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
            title="Buka Konfigurasi MCP Server"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline">MCP IDE</span>
          </button>

          {/* Download SQL DDL */}
          <button
            type="button"
            onClick={handleDownloadSql}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
            title="Unduh Skrip SQL DDL"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">schema.sql</span>
          </button>

          {/* Export Word .docx */}
          <button
            type="button"
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-600/20"
          >
            {isExportingDocx ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Unduh Bab 3 (.docx)</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE BODY */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden bg-[#07090e]">
        {/* ZONA KIRI: Sidebar Katalog Diagram (Collapsible) */}
        {isLeftSidebarOpen ? (
          <aside className="w-60 sm:w-64 shrink-0 border-r border-zinc-800/80 bg-[#0d1117] flex flex-col overflow-y-auto p-3 space-y-3 transition-all duration-200">
            {/* Kelompok UML */}
            <div className="space-y-1">
              <div className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                Keluarga UML 2.5
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('use_case')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                  activeTab === 'use_case'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300 font-bold'
                    : 'hover:bg-zinc-800/60 text-zinc-300'
                }`}
              >
                <span>1. Use Case Diagram</span>
                <span className="text-[10px] font-mono text-zinc-500">UML</span>
              </button>

              {/* Sequence with Multi-Scenario Pills */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('sequence')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                    activeTab === 'sequence'
                      ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300 font-bold'
                      : 'hover:bg-zinc-800/60 text-zinc-300'
                  }`}
                >
                  <span>2. Sequence Diagram</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                    {diagrams.sequenceScenarios?.length || 1}
                  </span>
                </button>

                {activeTab === 'sequence' && diagrams.sequenceScenarios && (
                  <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-blue-500/30 ml-2">
                    {diagrams.sequenceScenarios.map((seq, idx) => (
                      <button
                        key={seq.id || idx}
                        type="button"
                        onClick={() => setSelectedSequenceIdx(idx)}
                        className={`w-full text-left px-2 py-1 rounded-lg text-[11px] font-mono truncate transition-colors cursor-pointer block ${
                          selectedSequenceIdx === idx
                            ? 'bg-blue-500/20 text-blue-300 font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {idx + 1}. {seq.title.replace(/^Sequence Diagram:?\s*/i, '')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity with Multi-Scenario */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('activity')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                    activeTab === 'activity'
                      ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300 font-bold'
                      : 'hover:bg-zinc-800/60 text-zinc-300'
                  }`}
                >
                  <span>3. Activity Diagram</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                    {diagrams.activityScenarios?.length || 1}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('class_diagram')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                  activeTab === 'class_diagram'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300 font-bold'
                    : 'hover:bg-zinc-800/60 text-zinc-300'
                }`}
              >
                <span>4. Class Diagram</span>
                <span className="text-[10px] font-mono text-zinc-500">OOP</span>
              </button>
            </div>

            {/* Kelompok Terstruktur & Basis Data */}
            <div className="space-y-1 pt-2 border-t border-zinc-800/60">
              <div className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                Basis Data &amp; Alur
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('erd')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                  activeTab === 'erd'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300 font-bold'
                    : 'hover:bg-zinc-800/60 text-zinc-300'
                }`}
              >
                <span>5. Database ERD</span>
                <span className="text-[10px] font-mono text-amber-400">Crow's Foot</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dfd0')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                  activeTab === 'dfd0'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300 font-bold'
                    : 'hover:bg-zinc-800/60 text-zinc-300'
                }`}
              >
                <span>6. DFD Level 0 (Konteks)</span>
                <span className="text-[10px] font-mono text-zinc-500">DFD</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dfd1')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                  activeTab === 'dfd1'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300 font-bold'
                    : 'hover:bg-zinc-800/60 text-zinc-300'
                }`}
              >
                <span>7. DFD Level 1</span>
                <span className="text-[10px] font-mono text-zinc-500">DFD</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('flowchart')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                  activeTab === 'flowchart'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300 font-bold'
                    : 'hover:bg-zinc-800/60 text-zinc-300'
                }`}
              >
                <span>8. Flowchart Logika</span>
                <span className="text-[10px] font-mono text-zinc-500">ANSI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('arch')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                  activeTab === 'arch'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300 font-bold'
                    : 'hover:bg-zinc-800/60 text-zinc-300'
                }`}
              >
                <span>9. Arsitektur Sistem</span>
                <span className="text-[10px] font-mono text-zinc-500">Cloud</span>
              </button>
            </div>
          </aside>
        ) : (
          /* Slim Rail Mode (48px) */
          <aside className="w-12 shrink-0 border-r border-zinc-800/80 bg-[#0d1117] flex flex-col items-center py-3 space-y-1.5">
            {[
              { id: 'use_case', label: '1. Use Case' },
              { id: 'sequence', label: '2. Sequence' },
              { id: 'activity', label: '3. Activity' },
              { id: 'class_diagram', label: '4. Class' },
              { id: 'erd', label: '5. ERD' },
              { id: 'dfd0', label: '6. DFD 0' },
              { id: 'dfd1', label: '7. DFD 1' },
              { id: 'flowchart', label: '8. Flowchart' },
              { id: 'arch', label: '9. Arsitektur' },
            ].map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
                title={item.label}
              >
                {idx + 1}
              </button>
            ))}
          </aside>
        )}

        {/* ZONA TENGAH: Kanvas Luas & Inline Chat-to-Modify */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden p-2 sm:p-3 space-y-2">
          <div className="flex-1 min-h-0 relative">
            <ArchitectMermaidCanvas
              chart={currentChart}
              title={currentTitle}
              isPrintMode={isPrintMode}
            />
          </div>

          {/* Inline Chat-to-Modify Bar (Collapsible) */}
          {isRevisionBarOpen ? (
            <form
              onSubmit={handleSendRevision}
              className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl border border-zinc-800 bg-[#0e1117] shadow-xl shrink-0"
            >
              <input
                type="text"
                value={revisionInput}
                onChange={(e) => setRevisionInput(e.target.value)}
                disabled={isRevising}
                placeholder={`Instruksi revisi dosen untuk ${currentTitle}... (Contoh: Tambah use case cetak struk)`}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isRevising || !revisionInput.trim()}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                {isRevising ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Perbarui Diagram</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRevisionBarOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Sembunyikan bilah revisi untuk ruang kanvas maksimal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsRevisionBarOpen(true)}
                className="px-3 py-1 rounded-xl border border-zinc-800 bg-[#0e1117]/80 hover:bg-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shadow-md"
              >
                + Buka Kotak Revisi Diagram
              </button>
            </div>
          )}
        </main>

        {/* ZONA KANAN: Panel Akademik Bab 3 & AI Inspector (Collapsible Slide-out) */}
        {isRightPanelOpen && (
          <aside className="w-80 sm:w-96 shrink-0 border-l border-zinc-800/80 bg-[#0d1117] flex flex-col overflow-hidden transition-all duration-200">
            {/* Header with Close Button */}
            <div className="h-11 px-3 border-b border-zinc-800/80 bg-[#161b22]/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRightPanelTab('tables')}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    rightPanelTab === 'tables' ? 'bg-blue-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Tabel Bab 3
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab('inspector')}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    rightPanelTab === 'inspector' ? 'bg-blue-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  AI Dosen
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab('defense')}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    rightPanelTab === 'defense' ? 'bg-blue-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Sidang
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab('trace')}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    rightPanelTab === 'trace' ? 'bg-blue-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Jejak
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Tutup Panel Samping"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Tab Content */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs leading-relaxed text-zinc-300">
              {/* TAB 1: TABEL BAB 3 */}
              {rightPanelTab === 'tables' && (
                <div className="space-y-3">
                  {activeTab === 'erd' ? (
                    // Kamus Data Database
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">Kamus Data Spesifikasi Tabel</span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {diagrams.dataDictionary?.length || 0} Tabel
                        </span>
                      </div>

                      {diagrams.dataDictionary?.map((t, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-zinc-800 bg-[#090b10] space-y-2">
                          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                            <span className="font-mono font-bold text-amber-400">{t.tableName}</span>
                            <span className="text-[10px] text-zinc-500">{t.fields?.length || 0} Kolom</span>
                          </div>
                          <p className="text-[11px] text-zinc-400">{t.description}</p>
                          <div className="space-y-1">
                            {t.fields?.map((f, fIdx) => (
                              <div key={fIdx} className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                                <span>
                                  {f.columnName} {f.isPrimaryKey && <span className="text-amber-400 font-bold">[PK]</span>}
                                </span>
                                <span className="text-zinc-500">{f.dataType}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Skenario Use Case Bab 3
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">Tabel Skenario Use Case Resmi</span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {diagrams.useCaseScenarios?.length || 0} Skenario
                        </span>
                      </div>

                      {diagrams.useCaseScenarios?.map((sc, idx) => (
                        <div key={sc.id || idx} className="p-3 rounded-xl border border-zinc-800 bg-[#090b10] space-y-2">
                          <div className="border-b border-zinc-800 pb-1.5 flex items-center justify-between">
                            <span className="font-bold text-blue-300 text-xs">{sc.useCaseName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {sc.primaryActor}
                            </span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <p><strong className="text-zinc-400">Deskripsi:</strong> {sc.description}</p>
                            <p><strong className="text-zinc-400">Pre-Condition:</strong> {sc.preCondition}</p>
                            <p><strong className="text-zinc-400">Post-Condition:</strong> {sc.postCondition}</p>
                          </div>
                          <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase text-zinc-400">Alur Utama (Main Flow):</span>
                            {sc.mainFlow?.map((mf, mIdx) => (
                              <div key={mIdx} className="text-[10px] text-zinc-300 pl-2 border-l border-zinc-700">
                                {mf.step}. {mf.actorAction} &rarr; {mf.systemReaction}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: AI DOSEN INSPECTOR */}
              {rightPanelTab === 'inspector' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[11px]">
                      Inspektur memverifikasi kaidah OMG UML 2.5 dan Roger S. Pressman sebelum laporan diajukan ke dosen pembimbing.
                    </p>
                  </div>

                  {project.auditIssues?.length === 0 ? (
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-center text-xs">
                      Diagram Bebas Pelanggaran Teori. Siap Diajukan.
                    </div>
                  ) : (
                    project.auditIssues?.map((issue) => (
                      <div key={issue.id} className="p-3 rounded-xl border border-zinc-800 bg-[#090b10] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{issue.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {issue.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{issue.violationExplanation}</p>
                        <p className="text-[10px] font-mono text-zinc-500">Rujukan: {issue.theoryRule}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: KISI-KISI SIDANG */}
              {rightPanelTab === 'defense' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px]">
                      Prediksi pertanyaan maut dosen penguji saat diagram ini diproyeksikan di ruang sidang skripsi.
                    </p>
                  </div>

                  {project.defenseQA?.map((qa) => (
                    <div key={qa.id} className="p-3 rounded-xl border border-zinc-800 bg-[#090b10] space-y-2">
                      <p className="font-bold text-xs text-amber-200">"{qa.criticalQuestion}"</p>
                      <div className="space-y-1 text-[11px]">
                        <p className="text-zinc-300 leading-relaxed">
                          <strong className="text-emerald-400">Kunci Jawaban Ilmiah:</strong> {qa.scientificAnswer}
                        </p>
                        <p className="text-zinc-400 text-[10px] italic">
                          <strong>Analogi Sederhana:</strong> {qa.laymanAnalogy}
                        </p>
                        <p className="text-[9px] font-mono text-zinc-500 pt-1">
                          Sumber Teori: {qa.theoryReference}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: JEJAK KODE (TRACEABILITY) */}
              {rightPanelTab === 'trace' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Matriks Keterlacakan Kode Nyata</span>
                    <Link2 className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Bukti keterikatan ilmiah bahwa setiap elemen diagram berasal dari berkas kodingan asli:
                  </p>

                  {project.traceabilityMatrix?.map((tm, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-zinc-800 bg-[#090b10] space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200">{tm.diagramElement}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          {tm.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-400 truncate">Berkas: {tm.sourceFile}</p>
                      <p className="text-[10px] text-zinc-500">{tm.elementRole}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
