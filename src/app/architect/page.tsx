'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArchitectProject, RawExtractedBlueprint, AcademicDiagramSet } from '@/lib/academic-architect/types';
import { ArchitectEntryHub } from '@/components/architect/ArchitectEntryHub';
import { ArchitectWorkspace } from '@/components/architect/ArchitectWorkspace';
import { ArchitectMcpModal } from '@/components/architect/ArchitectMcpModal';
import { PricingModal } from '@/components/PricingModal';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';

const STORAGE_KEY = 'ngodingpakeprd_architect_projects_v1';

function ArchitectStudioContent() {
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get('projectId');
  const queryPrdId = searchParams.get('prdId');

  const { user, isPro, isPlus, isPaid, isAdmin, systemSettings } = useAuth();
  const [projects, setProjects] = useState<ArchitectProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const isArchitectAllowed = () => {
    const policy = systemSettings?.architect_access_tier || 'paid_only';
    if (policy === 'pro_only') {
      return isPro || isAdmin;
    }
    if (policy === 'paid_only') {
      return isPaid || isPro || isPlus || isAdmin;
    }
    return true; // 'all'
  };

  // Load projects from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
            if (queryProjectId) {
              const matched = parsed.find((p) => p.id === queryProjectId);
              if (matched) setActiveProjectId(matched.id);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load local architect projects:', err);
      }
    }
  }, [queryProjectId]);

  // Save projects to local storage whenever updated
  const saveProjects = (updatedProjects: ArchitectProject[]) => {
    setProjects(updatedProjects);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
      } catch (err) {
        console.warn('Failed to save architect projects locally:', err);
      }
    }
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  // Handle Extraction and Synthesis Pipeline
  const handleStartExtraction = async (params: {
    rawIdea?: string;
    files?: { path: string; content: string }[];
    githubUrl?: string;
    prdId?: string;
  }) => {
    if (!user && systemSettings?.auth_mode === 'strict_login') {
      setIsAuthModalOpen(true);
      return;
    }

    if (!isArchitectAllowed()) {
      setIsPricingModalOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Ekstraksi Blueprint
      const extractRes = await fetch('/api/architect/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawIdea: params.rawIdea,
          files: params.files,
          githubUrl: params.githubUrl,
          prdId: params.prdId || queryPrdId || undefined,
          userId: user?.id,
        }),
      });

      const extractData = await extractRes.json();
      if (!extractData.success || !extractData.blueprint) {
        throw new Error(extractData.error || 'Gagal mengekstrak arsitektur proyek.');
      }

      const blueprint: RawExtractedBlueprint = extractData.blueprint;

      // 2. Sintesis 6 Diagram & Tabel Akademik
      const synthRes = await fetch('/api/architect/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprint,
          school: 'uml',
          userId: user?.id,
        }),
      });

      const synthData = await synthRes.json();
      if (!synthData.success || !synthData.diagrams) {
        if (synthData.featureLocked === 'architect_access_tier') {
          setIsPricingModalOpen(true);
          return;
        }
        throw new Error(synthData.error || 'Gagal menyintesis paket diagram akademik.');
      }

      const newProjectId = `arch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newProject: ArchitectProject = {
        id: newProjectId,
        title: blueprint.systemTitle || 'Sistem Informasi Akademik',
        description: blueprint.systemDescription || '',
        curriculumSchool: 'uml',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceType: params.files ? 'drag_folder' : params.githubUrl ? 'github_repo' : 'idea_scratch',
        sourceMetadata: {
          repoUrl: params.githubUrl,
          filesScanned: params.files?.map((f) => ({
            path: f.path,
            fileType: f.path.endsWith('.sql') ? 'sql' : 'route',
            summary: 'Extracted source file',
            extractedEntities: [],
          })),
        },
        blueprint,
        diagrams: synthData.diagrams,
        auditIssues: synthData.auditIssues || [],
        defenseQA: synthData.defenseQA || [],
        traceabilityMatrix: synthData.traceabilityMatrix || [],
      };

      const updated = [newProject, ...projects];
      saveProjects(updated);
      setActiveProjectId(newProjectId);
    } catch (err: any) {
      console.error('Extraction/Synthesis error:', err);
      alert(`Kendala: ${err?.message || 'Gagal memproses arsitektur'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProject = (updated: ArchitectProject) => {
    const list = projects.map((p) => (p.id === updated.id ? updated : p));
    saveProjects(list);
  };

  const handleDeleteProject = (projectId: string) => {
    const updated = projects.filter((p) => p.id !== projectId);
    saveProjects(updated);
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-zinc-100 flex flex-col font-sans">
      {activeProject ? (
        <ArchitectWorkspace
          project={activeProject}
          projects={projects}
          onSelectProject={(id) => setActiveProjectId(id)}
          onUpdateProject={handleUpdateProject}
          onOpenFolder={() => setActiveProjectId(null)}
          onCreateNew={() => setActiveProjectId(null)}
          onBackToHub={() => setActiveProjectId(null)}
          onOpenMcpModal={() => setIsMcpModalOpen(true)}
          onDeleteProject={handleDeleteProject}
        />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Top minimal header */}
          <div className="h-14 px-6 border-b border-zinc-800/80 bg-[#0d1117] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <a href="/" className="text-sm font-bold text-white hover:text-blue-400 transition-colors">
                ngodingpakeprd
              </a>
              <span className="text-zinc-600">/</span>
              <span className="text-xs font-mono font-semibold text-blue-400">architect</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMcpModalOpen(true)}
              className="text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              MCP IDE Config
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <ArchitectEntryHub
              onStartExtraction={handleStartExtraction}
              recentProjects={projects}
              onOpenProject={(id) => setActiveProjectId(id)}
              onOpenMcpModal={() => setIsMcpModalOpen(true)}
              onDeleteProject={handleDeleteProject}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Dedicated MCP Modal */}
      <ArchitectMcpModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
        sessionId={activeProject?.id || 'default'}
        projectName={activeProject?.title || 'Proyek Aktif'}
        onImportMcpSession={(files, projectTitle) => {
          setIsMcpModalOpen(false);
          handleStartExtraction({ files, rawIdea: projectTitle });
        }}
      />

      {/* Pricing Upgrade Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onOpenAuth={() => {
          setIsPricingModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function ArchitectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090e] flex items-center justify-center text-zinc-500 font-mono text-xs">Memuat Studio Arsitek...</div>}>
      <ArchitectStudioContent />
    </Suspense>
  );
}
