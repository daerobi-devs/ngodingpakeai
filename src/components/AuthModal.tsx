'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  Lock,
  ShieldCheck,
  Loader2,
  Kanban,
  Database,
  Cpu,
  CheckCircle2,
  Code2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  CursorLogo,
  AntigravityLogo,
  WindsurfLogo,
} from '@/components/icons/AgentIcons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { loginWithGoogle, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'waiting' | 'success'>('idle');

  // Jika user sudah terdeteksi login saat modal terbuka, tampilkan sukses dan tutup otomatis
  useEffect(() => {
    if (user && isOpen) {
      setStatus('success');
      const timer = setTimeout(() => {
        onClose();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [user, isOpen, onClose]);

  // Reset status saat modal dibuka ulang
  useEffect(() => {
    if (isOpen && !user) {
      setLoading(false);
      setStatus('idle');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setStatus('waiting');
      const success = await loginWithGoogle('/generator?mode=prd', true);
      if (success) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          router.push('/generator?mode=prd');
        }, 600);
      } else {
        setLoading(false);
        setStatus('idle');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-[#0c0d12] text-white shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Tombol Close Modal (Mobile & Desktop) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-xl p-2 text-zinc-400 hover:bg-zinc-800/80 hover:text-white transition-colors cursor-pointer"
          aria-label="Tutup modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ================= SISI KIRI: SHOWCASE VALUE PROPOSITION ================= */}
        <div className="relative md:w-1/2 p-6 sm:p-8 bg-gradient-to-b from-[#11141f] via-[#0d0f17] to-[#0a0b10] border-b md:border-b-0 md:border-r border-zinc-800/80 flex flex-col justify-between overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-0 w-56 h-40 bg-amber-500/10 blur-3xl pointer-events-none" />
          
          {/* Subtle Dot Grid Background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #a1a1aa 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />

          <div className="relative z-10">
            {/* Header Brand */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-extrabold tracking-tight text-white">
                ngodingpake<span className="text-amber-400 font-black">prd</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 font-semibold uppercase">
                Studio
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-zinc-100 mb-2 leading-snug">
              Cetak Biru Software &amp; Living Spec
            </h4>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Rancang arsitektur produk, modul pohon fitur interaktif, skema SQL, dan tugas Kanban yang langsung siap dieksekusi coding agent.
            </p>

            {/* 3 Fitur Pembeda Utama */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <Kanban className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Living Spec &amp; MCP Kanban</div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    Spesifikasi yang terus hidup dan papan tugas yang sinkron ke code editor.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm">
                <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Skema Relasi Database SQL</div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    Diagram ERD visual dan file migrasi tabel siap pasang di Supabase / PostgreSQL.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Prompt AI Agent Terarah</div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    Instruksi coding presisi 6-lapis per fitur untuk memangkas halusinasi AI.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Ekosistem AI Coding Agent */}
          <div className="relative z-10 pt-4 border-t border-zinc-800/80">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2 font-semibold">
              Kompatibel langsung dengan:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/70 text-[11px] text-zinc-300 font-mono">
                <CursorLogo className="h-3.5 w-3.5 text-zinc-300" />
                <span>Cursor</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/70 text-[11px] text-zinc-300 font-mono">
                <Code2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Claude Code</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/70 text-[11px] text-zinc-300 font-mono">
                <WindsurfLogo className="h-3.5 w-3.5 text-teal-400" />
                <span>Windsurf</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/70 text-[11px] text-zinc-300 font-mono">
                <AntigravityLogo className="h-3.5 w-3.5" />
                <span>Antigravity</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SISI KANAN: ACTION LOGIN PANE ================= */}
        <div className="relative md:w-1/2 p-6 sm:p-8 bg-[#090a0f] flex flex-col justify-between">
          <div>
            {/* Header Login */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono uppercase tracking-wider font-semibold mb-4">
              <Lock className="h-3 w-3 text-amber-400" />
              <span>Akses Workspace</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              Masuk ke Akun
            </h3>
            <p className="text-xs text-zinc-400 mb-8 leading-relaxed">
              Masuk untuk menyimpan riwayat proyek, mengelola cetak biru arsitektur, dan melanjutkan sesi pembuatan PRD kapan saja.
            </p>

            {/* Tombol Utama: Google OAuth */}
            <button
              type="button"
              disabled={loading || status === 'success'}
              onClick={handleGoogleLogin}
              className={`w-full flex items-center justify-center gap-3 rounded-xl font-bold py-3.5 px-4 transition-all shadow-md active:scale-[0.98] cursor-pointer text-xs sm:text-sm ${
                status === 'success'
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-white hover:bg-zinc-100 text-zinc-950 hover:shadow-lg disabled:opacity-85'
              }`}
            >
              {status === 'success' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>Berhasil Terhubung!</span>
                </>
              ) : status === 'waiting' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
                  <span>Menunggu Pilihan Akun...</span>
                </>
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

            {/* Informasi Status Popup Aktif & Tombol Batal */}
            {status === 'waiting' && (
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-[11px] text-amber-300 animate-in fade-in duration-200">
                <span className="leading-relaxed">
                  Jendela Google terbuka. Pilih akun Anda tanpa berpindah tab.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(false);
                    setStatus('idle');
                  }}
                  className="px-2.5 py-1 rounded text-[10px] bg-white/10 hover:bg-white/20 text-zinc-200 font-mono transition-colors shrink-0 ml-2 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}

            {/* Checklist Keamanan */}
            <div className="mt-6 space-y-2 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Autentikasi resmi Google OAuth 2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Tanpa kata sandi &amp; langsung aktif seketika</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Proyek tersimpan aman di Cloud Database Supabase</span>
              </div>
            </div>
          </div>

          {/* Footer Kebijakan & Terms */}
          <div className="pt-6 mt-6 border-t border-zinc-800/80 text-center">
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Dengan masuk, Anda menyetujui{' '}
              <Link href="/terms" onClick={onClose} className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors">
                Ketentuan Layanan
              </Link>{' '}
              dan{' '}
              <Link href="/privacy" onClick={onClose} className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors">
                Kebijakan Privasi
              </Link>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
