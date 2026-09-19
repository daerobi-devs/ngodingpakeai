'use client';

import React, { useState } from 'react';
import { X, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle('/generator');
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800/90 bg-[#0c0c0e] p-6 sm:p-8 text-white shadow-2xl overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/10 blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-zinc-400 hover:bg-zinc-800/80 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand & Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono uppercase tracking-wider font-bold mb-3">
            <span>Studio Arsitektur Software</span>
          </div>

          <h3 className="text-2xl font-black tracking-tight text-white">
            ngodingpake<span className="text-amber-500">prd</span>
          </h3>

          <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">
            Masuk untuk menyimpan riwayat proyek, mengelola cetak biru sistem, dan mengakses AI generator.
          </p>
        </div>

        {/* Feature Highlights (clean & minimal, no emojis) */}
        <div className="space-y-2 mb-6 text-xs text-zinc-300">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-3.5 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span className="text-zinc-300">Sinkronisasi dokumen arsitektur dan diagram ERD ke Cloud</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-3.5 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-zinc-300">Panduan instruksi teknis terarah untuk AI coding pilihan Anda</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold py-3.5 px-4 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
          ) : (
            <>
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </>
          )}
        </button>

        {/* Security Note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <span>Autentikasi resmi Google OAuth. Tanpa password & langsung aktif.</span>
        </div>
      </div>
    </div>
  );
};
