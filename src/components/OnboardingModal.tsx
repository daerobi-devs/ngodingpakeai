'use client';

import React, { useState } from 'react';
import { User, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Profile } from '@/lib/supabase/types';

interface OnboardingModalProps {
  isOpen: boolean;
  userId: string;
  initialName?: string;
  onComplete: (updatedProfile: Profile) => void;
}

const ROLE_OPTIONS = [
  'Solo Developer / Indie Hacker',
  'Software Engineer',
  'Mobile App Developer',
  'Tech Lead / Product Manager',
  'Mahasiswa / Pelajar IT',
];

const AI_TOOLS_OPTIONS = [
  'Cursor',
  'Antigravity',
  'Claude Code',
  'Windsurf',
  'GitHub Copilot',
  'Lainnya / Manual',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  userId,
  initialName = '',
  onComplete,
}) => {
  const [fullName, setFullName] = useState(initialName);
  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0]);
  const [selectedAi, setSelectedAi] = useState(AI_TOOLS_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    if (!cleanName) {
      setError('Silakan masukkan nama panggilan atau nama lengkap Anda.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          full_name: cleanName,
          role: selectedRole,
          favorite_ai: selectedAi,
          onboarding_completed: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan profil');
      }

      onComplete(json.profile);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0c0c0e] p-6 sm:p-8 text-white shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-28 bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="text-center mb-6 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono uppercase tracking-wider font-bold mb-3">
            <span>Personalisasi Studio</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Selamat Datang di ngodingpake<span className="text-amber-500">prd</span>
          </h3>

          <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Lengkapi data singkat berikut agar dokumen arsitektur teknis dan instruksi AI disesuaikan dengan profil Anda.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Nama Lengkap atau Panggilan
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Contoh: Daerobi"
              required
              autoFocus
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Peran Utama Anda
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow-xs'
                        : 'border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{role}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
              AI Coding Tool Utama Pilihan Anda
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AI_TOOLS_OPTIONS.map((tool) => {
                const isSelected = selectedAi === tool;
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => setSelectedAi(tool)}
                    className={`text-center px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow-xs'
                        : 'border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span>{tool}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold py-3 px-4 transition-all shadow-md shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
            ) : (
              <>
                <span>Mulai Rancang Arsitektur</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
