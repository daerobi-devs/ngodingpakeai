'use client';

import React, { useState } from 'react';
import { Compass, Cpu, Briefcase, Code2, Languages, Palette, Rocket, ArrowRight } from 'lucide-react';

interface RoadmapHeroInputProps {
  onGenerate: (goal: string, context?: string) => void;
  isLoading: boolean;
}

const PRESET_GOALS = [
  {
    category: 'Teknologi & Rekayasa',
    icon: Code2,
    text: 'Kuasai Fullstack Web Development dan Integrasi AI Agent Modern',
  },
  {
    category: 'Bahasa Asing & Komunikasi',
    icon: Languages,
    text: 'Belajar Bahasa Inggris dari nol hingga lancar speaking dan siap wawancara kerja',
  },
  {
    category: 'Bisnis & Manajemen Produk',
    icon: Briefcase,
    text: 'Menjadi Product Manager andal dari riset pasar hingga peluncuran MVP',
  },
  {
    category: 'Desain & Kreatif',
    icon: Palette,
    text: 'Kuasai UI/UX Design di Figma, design system, dan portofolio profesional',
  },
  {
    category: 'Data & Kecerdasan Buatan',
    icon: Cpu,
    text: 'Belajar Data Science, analisis bisnis, dan pemodelan Machine Learning',
  },
  {
    category: 'Pemasaran & Karier Global',
    icon: Rocket,
    text: 'Strategi Digital Marketing, personal branding, dan berkarier sebagai freelancer global',
  },
];

export function RoadmapHeroInput({ onGenerate, isLoading }: RoadmapHeroInputProps) {
  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isLoading) return;
    onGenerate(goal.trim(), context.trim() || undefined);
  };

  const handleSelectPreset = (presetText: string) => {
    setGoal(presetText);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-14 flex flex-col items-center">
      {/* Badge Header Modern & Elegan */}
      

      {/* Main Title & Subtitle */}
      <h1 className="text-3xl md:text-5xl font-bold text-center text-white tracking-tight leading-tight mb-4">
        Apa Tujuan Belajar atau Karier Anda?
      </h1>
      <p className="text-sm md:text-base text-zinc-400 text-center max-w-2xl mb-8 leading-relaxed">
        Ketik keahlian, profesi impian, bahasa asing, atau topik apa saja yang ingin Anda kuasai. 
        Kecerdasan buatan akan merancang kurikulum terstruktur lengkap dengan kurasi materi dan proyek nyata.
      </p>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="w-full relative group mb-8">
        <div className="relative flex flex-col bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-2 md:p-3 shadow-2xl focus-within:border-orange-500/70 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all duration-200">
          <div className="flex items-start gap-3 px-2 pt-2">
            <Compass className="w-5 h-5 text-orange-500 mt-1 shrink-0" />
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Tuliskan tujuan Anda (Contoh: Belajar Bahasa Inggris dari nol sampai lancar bicara, Menguasai Fullstack Web & AI, Menjadi UI/UX Designer, Persiapan Karier Product Manager, atau topik apa saja)..."
              className="w-full bg-transparent text-white placeholder-zinc-500 text-sm md:text-base resize-none outline-none min-h-[70px] max-h-[160px] leading-relaxed"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {/* Optional context expandable */}
          {showAdvanced && (
            <div className="mt-2 pt-2 border-t border-zinc-800 px-2">
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Preferensi tambahan (opsional): misal 'Punya waktu 2 jam sehari', 'Sudah bisa level dasar'..."
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs md:text-sm text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-700"
              />
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-3 px-2 border-t border-zinc-800/60 mt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              {showAdvanced ? '- Sembunyikan Preferensi' : '+ Tambah Preferensi Waktu / Pengalaman'}
            </button>

            <button
              type="submit"
              disabled={isLoading || !goal.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 text-white text-xs md:text-sm font-semibold transition-all duration-200 shadow-lg shadow-orange-600/20 disabled:shadow-none disabled:text-zinc-500 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Merancang Pohon Roadmap...</span>
                </>
              ) : (
                <>
                  <span>Susun Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Suggestion Presets: 6 Universal Topics */}
      <div className="w-full">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 text-center md:text-left">
          Inspirasi & Contoh Tujuan Populer
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_GOALS.map((preset, idx) => {
            const Icon = preset.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.text)}
                className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-orange-500/40 hover:bg-zinc-800/60 transition-all text-left group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-orange-400/90 block mb-0.5">
                    {preset.category}
                  </span>
                  <span className="text-xs text-zinc-300 group-hover:text-white line-clamp-2 leading-snug">
                    {preset.text}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
