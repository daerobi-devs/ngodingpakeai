'use client';

import React from 'react';
import { STUDIO_OUTLINE_SECTIONS, StudioOutlineItem } from './studio-markdown';

interface StudioOutlineProps {
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  theme?: 'dark' | 'light';
}

export const StudioOutline: React.FC<StudioOutlineProps> = ({
  activeSectionId,
  onSelectSection,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <nav
      aria-label="Table of Contents"
      className="w-56 lg:w-64 shrink-0 select-none pt-4 pb-8 pr-4"
    >
      {/* Header matching video: PRD — Project Requirements Document */}
      <div className="mb-6">
        <span
          className={`text-xs font-semibold tracking-tight block ${
            isLight ? 'text-zinc-500' : 'text-zinc-400'
          }`}
        >
          PRD — Project Requirements Document
        </span>
      </div>

      {/* List matching video: 1. Overview ──────── */}
      <ul className="space-y-3.5 text-xs">
        {STUDIO_OUTLINE_SECTIONS.map((section: StudioOutlineItem) => {
          const isActive = activeSectionId === section.id;
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelectSection(section.id)}
                className={`w-full group flex items-center justify-between text-left transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? isLight
                      ? 'text-zinc-950 font-bold'
                      : 'text-white font-semibold'
                    : isLight
                    ? 'text-zinc-500 hover:text-zinc-800 font-normal'
                    : 'text-zinc-500 hover:text-zinc-300 font-normal'
                }`}
              >
                <span className="truncate pr-2">
                  {section.number}. {section.title}
                </span>
                {/* Horizontal trailing line matching the video */}
                <span
                  className={`h-px flex-1 ml-2 transition-colors ${
                    isActive
                      ? isLight
                        ? 'bg-zinc-800'
                        : 'bg-zinc-300/80'
                      : isLight
                      ? 'bg-zinc-300 group-hover:bg-zinc-400'
                      : 'bg-zinc-800/80 group-hover:bg-zinc-700'
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
