'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
  variant?: 'button' | 'pill';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  variant = 'button',
  className = '',
}) => {
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`group inline-flex items-center p-1 rounded-full border transition-all duration-200 cursor-pointer shadow-xs ${
          isDark
            ? 'bg-zinc-950/90 border-zinc-800 hover:border-zinc-700'
            : 'bg-slate-200/90 border-slate-300 hover:border-slate-400'
        } ${className}`}
        title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      >
        <span
          className={`flex items-center justify-center h-6 w-6 rounded-full transition-all duration-200 ${
            !isDark
              ? 'bg-white text-amber-500 shadow-sm ring-1 ring-black/5 scale-105'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Sun className="h-3.5 w-3.5 transition-transform duration-200" />
        </span>
        <span
          className={`flex items-center justify-center h-6 w-6 rounded-full transition-all duration-200 ${
            isDark
              ? 'bg-zinc-800 text-amber-400 shadow-sm ring-1 ring-white/10 scale-105'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Moon className="h-3.5 w-3.5 transition-transform duration-200" />
        </span>
      </button>
    );
  }

  // Default: Pro Compact Glassmorphic Button with Glowing Halo and Micro-interactions
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      className={`group relative flex items-center justify-center h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer overflow-hidden ${
        isDark
          ? 'border-zinc-700/60 hover:border-amber-500/50 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 shadow-sm hover:shadow-md hover:shadow-amber-500/10'
          : 'border-slate-300/80 hover:border-amber-400/80 bg-gradient-to-b from-white to-slate-100/90 shadow-sm hover:shadow-md hover:shadow-amber-500/10'
      } ${className}`}
    >
      {/* Ambient background glow on hover */}
      <span
        className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
          isDark ? 'bg-amber-400/5' : 'bg-amber-500/5'
        }`}
      />

      {isDark ? (
        <div className="relative flex items-center justify-center">
          {/* Glowing halo */}
          <span className="absolute w-5 h-5 rounded-full bg-amber-400/25 blur-[3px] opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
          {/* Animated Sun Icon */}
          <Sun className="relative h-4 w-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          {/* Glowing halo */}
          <span className="absolute w-5 h-5 rounded-full bg-indigo-500/20 blur-[3px] opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
          {/* Animated Moon Icon */}
          <Moon className="relative h-4 w-4 text-indigo-600 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
        </div>
      )}
    </button>
  );
};
