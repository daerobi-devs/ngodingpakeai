'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, FolderPlus, FolderKanban, Plus, Check, Trash2 } from 'lucide-react';
import { ArchitectProject } from '@/lib/academic-architect/types';

interface ArchitectProjectSwitcherProps {
  currentProject: ArchitectProject;
  projects: ArchitectProject[];
  onSelectProject: (projectId: string) => void;
  onOpenFolder: () => void;
  onCreateNew: () => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ArchitectProjectSwitcher: React.FC<ArchitectProjectSwitcherProps> = ({
  currentProject,
  projects,
  onSelectProject,
  onOpenFolder,
  onCreateNew,
  onDeleteProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#0d1117] hover:bg-[#161b22] text-xs font-medium text-zinc-200 transition-colors cursor-pointer group"
      >
        <FolderKanban className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="font-semibold truncate max-w-[160px] sm:max-w-[220px]">
          {currentProject?.title || 'Pilih Proyek'}
        </span>
        <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-transform" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl border border-zinc-800 bg-[#0e1117] text-zinc-100 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-zinc-800/80 bg-[#161b22]/50 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold px-3">
            Daftar Proyek Arsitektur
          </div>

          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {projects.length === 0 ? (
              <div className="p-3 text-center text-xs text-zinc-500">
                Belum ada proyek tersimpan lain.
              </div>
            ) : (
              projects.map((p) => {
                const isSelected = p.id === currentProject?.id;
                return (
                  <div
                    key={p.id}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors group ${
                      isSelected
                        ? 'bg-blue-600/15 border border-blue-500/30 text-blue-300 font-medium'
                        : 'hover:bg-zinc-800/60 text-zinc-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProject(p.id);
                        setIsOpen(false);
                      }}
                      className="flex-1 text-left truncate pr-2 cursor-pointer"
                    >
                      <p className="font-semibold truncate">{p.title}</p>
                      <p className="text-[10px] text-zinc-500 truncate">
                        {p.blueprint?.modules?.length || 0} Modul | {new Date(p.updatedAt).toLocaleDateString('id-ID')}
                      </p>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      {onDeleteProject && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Hapus proyek "${p.title}"? Proyek ini akan dihapus dari penyimpanan lokal.`)) {
                              onDeleteProject(p.id);
                            }
                          }}
                          className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                          title="Hapus Proyek"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2 border-t border-zinc-800 bg-[#12161f] space-y-1">
            <button
              type="button"
              onClick={() => {
                onOpenFolder();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-zinc-800/80 hover:text-white transition-colors cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Buka Folder Proyek Lain</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-zinc-800/80 hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Rancang Arsitektur Baru</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
