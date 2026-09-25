'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Key,
  RotateCcw,
  Sun,
  Moon,
  ArrowRight,
  LogIn,
  LogOut,
  Crown,
  Settings,
  Users,
  Zap,
  Network,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

function formatCompactNumber(num: number): string {
  if (!num || num <= 0) return '0';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString('id-ID');
}

interface NavbarProps {
  hasApiKey?: boolean;
  activeKeyCount?: number;
  activeModel?: string;
  onOpenSettings?: () => void;
  onOpenPricing?: () => void;
  onOpenAuth?: () => void;
  onOpenGenerator?: () => void;
  onReset?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isLandingPage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasApiKey = false,
  activeKeyCount = 0,
  activeModel,
  onOpenSettings,
  onOpenPricing,
  onOpenAuth,
  onOpenGenerator,
  onReset,
  theme = 'dark',
  onToggleTheme,
  isLandingPage = false,
}) => {
  const router = useRouter();
  const {
    user,
    profile,
    isPro,
    isPlus,
    isPaid,
    isAdmin,
    tier,
    dailyLimit,
    todayGenerations,
    remainingToday,
    remainingTrials,
    logout,
    systemSettings,
  } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [stats, setStats] = useState<{ users: number; prds: number }>({ users: 0, prds: 0 });

  useEffect(() => {
    if (!isLandingPage) return;

    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success) {
          setStats({
            users: Number(data.users) || 0,
            prds: Number(data.prds) || 0,
          });
        }
      } catch {
        // silent fail
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isLandingPage]);

  const isServerManaged = systemSettings?.api_key_mode === 'server_managed';
  const isStrictLogin = systemSettings?.auth_mode === 'strict_login';

  const handleGeneratorClick = (e: React.MouseEvent) => {
    if (isStrictLogin && !user) {
      e.preventDefault();
      if (onOpenAuth) {
        onOpenAuth();
      } else if (onOpenGenerator) {
        onOpenGenerator();
      }
      return;
    }

    if (onOpenGenerator) {
      e.preventDefault();
      onOpenGenerator();
    }
  };

  const [avatarError, setAvatarError] = useState(false);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || profile?.avatar_url;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#09090b]/95 backdrop-blur-md text-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Realtime Community Stats */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-1 hover:opacity-90 transition-opacity">
            <span className="font-extrabold tracking-tight">
              ngodingpake<span className="text-amber-500 font-black">prd</span>
            </span>
          </Link>

          {isLandingPage && (
            <div className="hidden sm:flex items-center gap-3.5 border-l border-zinc-800/90 pl-3.5 py-0.5 text-xs select-none">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-extrabold text-white text-[13px] tracking-tight">
                  {formatCompactNumber(stats.users)}
                </span>
                <span className="text-zinc-400 text-xs font-medium">User</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-extrabold text-white text-[13px] tracking-tight">
                  {formatCompactNumber(stats.prds)}
                </span>
                <span className="text-zinc-400 text-xs font-medium">PRD</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Trial / Tier Status indicator (non-landing page only) */}
          {!isLandingPage && (
            isPro ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>PRO</span>
                <span className="text-[10px] text-zinc-400 font-mono font-normal pl-1 border-l border-amber-500/20">
                  {dailyLimit >= 999999 ? 'Unlimited' : `${remainingToday}/${dailyLimit}`}
                </span>
              </div>
            ) : isPlus ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-xs font-bold text-emerald-400">
                  <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  <span>PLUS</span>
                  <span className="text-[10px] text-emerald-300/80 font-mono font-normal pl-1 border-l border-emerald-500/30">
                    {remainingToday}/{dailyLimit} hari ini
                  </span>
                </div>
                {onOpenPricing && (
                  <button
                    type="button"
                    onClick={onOpenPricing}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <Crown className="h-3 w-3" />
                    <span>Upgrade PRO</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-xs text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Trial: <strong className="text-zinc-200 font-mono font-bold">{user ? `${remainingTrials}x` : `${systemSettings?.trial_limit ?? 1}x`}</strong></span>
                </div>
                {onOpenPricing && (
                  <button
                    type="button"
                    onClick={onOpenPricing}
                    className="inline-flex items-center rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Upgrade Paket
                  </button>
                )}
              </>
            )
          )}

          {isLandingPage ? (
            <>
              {!user ? (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition-colors shadow-sm cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Login</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 py-1 px-2 text-xs text-zinc-200 hover:border-zinc-700 transition-colors cursor-pointer"
                  >
                    {avatarUrl && !avatarError ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={() => setAvatarError(true)}
                        className="w-5 h-5 rounded-full object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px]">
                        {initialLetter}
                      </div>
                    )}
                    <span className="max-w-[80px] sm:max-w-[110px] truncate text-left font-medium">
                      {displayName}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-xs text-zinc-300 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-zinc-800/80 mb-1 space-y-1">
                        <div className="font-semibold text-white truncate">{displayName}</div>
                        <div className="text-[11px] text-zinc-500 truncate">{user.email}</div>
                        <div className="pt-1 flex items-center justify-between">
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            isPro
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : isPlus
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {isPro ? 'Paket PRO' : isPlus ? 'Paket PLUS' : 'Paket Free'}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {isPro ? 'Unlimited' : isPlus ? `${remainingToday}/${dailyLimit} PRD` : `${remainingTrials}x trial`}
                          </span>
                        </div>
                      </div>

                      <Link
                        href="/generator"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-400 hover:bg-zinc-900 transition-colors font-medium"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Buka Studio Generator</span>
                      </Link>

                      <Link
                        href="/architect"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-purple-400 hover:bg-zinc-900 transition-colors font-medium"
                      >
                        <Network className="h-3.5 w-3.5" />
                        <span>Studio Arsitek &amp; Bab 3</span>
                      </Link>

                      {isPlus && onOpenPricing && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenPricing();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-amber-400 hover:bg-zinc-900 transition-colors font-semibold text-left cursor-pointer"
                        >
                          <Crown className="h-3.5 w-3.5" />
                          <span>Upgrade ke Paket PRO</span>
                        </button>
                      )}

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-400 hover:bg-zinc-900 transition-colors font-semibold"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          <span>Admin Control Plane</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-zinc-900 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  title="Kosongkan form"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline text-[11px]">Reset</span>
                </button>
              )}

              {onOpenSettings && !isServerManaged && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    hasApiKey
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>
                    {hasApiKey ? 'Key Aktif' : 'Set Key'}
                  </span>
                </button>
              )}

              {onToggleTheme && (
                <ThemeToggle theme={theme || 'dark'} onToggle={onToggleTheme} />
              )}


              {!user ? (
                onOpenAuth && (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-bold text-white transition-colors border border-zinc-700"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Masuk</span>
                  </button>
                )
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 py-1 px-2 text-xs text-zinc-200 hover:border-zinc-700 transition-colors"
                  >
                    {avatarUrl && !avatarError ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={() => setAvatarError(true)}
                        className="w-5 h-5 rounded-full object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px]">
                        {initialLetter}
                      </div>
                    )}
                    <span className="max-w-[80px] sm:max-w-[110px] truncate text-left font-medium">
                      {displayName}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-xs text-zinc-300 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-zinc-800/80 mb-1 space-y-1">
                        <div className="font-semibold text-white truncate">{displayName}</div>
                        <div className="text-[11px] text-zinc-500 truncate">{user.email}</div>
                        <div className="mt-1.5 flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400">Status Akun:</span>
                          <span className={`font-bold px-1.5 py-0.5 rounded uppercase ${isPro ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-300 bg-zinc-800'}`}>
                            {isPro ? 'PRO ACTIVE' : 'FREE TRIAL'}
                          </span>
                        </div>
                        {isPro && profile?.pro_expires_at && !profile?.is_admin && (
                          <div className="flex items-center justify-between text-[10px] pt-1">
                            <span className="text-zinc-400">Masa Aktif:</span>
                            <span className="text-amber-400 font-mono font-medium">
                              {(() => {
                                const exp = new Date(profile.pro_expires_at);
                                const diffDays = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                return diffDays > 0 ? `Sisa ${diffDays} hari` : 'Kedaluwarsa';
                              })()}
                            </span>
                          </div>
                        )}
                        {!isPro && (
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-zinc-400">Sisa Kuota:</span>
                            <span className="text-amber-400 font-bold font-mono">{remainingTrials}x generate</span>
                          </div>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-400 hover:bg-zinc-900 transition-colors font-semibold"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          <span>Admin Control Plane</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-zinc-900 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
