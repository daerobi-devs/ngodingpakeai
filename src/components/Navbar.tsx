'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  hasApiKey?: boolean;
  activeKeyCount?: number;
  activeModel?: string;
  onOpenSettings?: () => void;
  onOpenPricing?: () => void;
  onOpenAuth?: () => void;
  onOpenGenerator?: () => void;
  onLoadDemo?: () => void;
  onReset?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isLandingPage?: boolean;
  onOpenProChat?: () => void;
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
  onOpenProChat,
}) => {
  const router = useRouter();
  const { user, profile, isPro, isAdmin, remainingTrials, logout, systemSettings } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-1 hover:opacity-90 transition-opacity">
            <span className="font-extrabold tracking-tight">
              ngodingpake<span className="text-amber-500 font-black">prd</span>
            </span>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Trial Status indicator (non-landing page only) */}
          {!isLandingPage && !isPro && (
            <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Trial: <strong className="text-zinc-200 font-mono font-bold">{user ? `${remainingTrials}x` : `${systemSettings?.trial_limit ?? 1}x`}</strong></span>
            </div>
          )}

          {/* PRO Badge / Clean Upgrade Button (non-landing page only) */}
          {!isLandingPage && (
            isPro ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>PRO</span>
              </div>
            ) : (
              onOpenPricing && (
                <button
                  type="button"
                  onClick={onOpenPricing}
                  className="inline-flex items-center rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                >
                  Upgrade PRO
                </button>
              )
            )
          )}

          {isLandingPage ? (
            <>
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
                  title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Moon className="h-3.5 w-3.5 text-blue-300" />
                  )}
                </button>
              )}

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
                      </div>

                      <Link
                        href="/generator"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-400 hover:bg-zinc-900 transition-colors font-medium"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Buka Studio Generator</span>
                      </Link>

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
                    {hasApiKey
                      ? activeModel
                        ? `${activeModel.replace('gemini-', '')}`
                        : 'Key Ready'
                      : 'Set Key'}
                  </span>
                </button>
              )}

              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                  title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Moon className="h-3.5 w-3.5 text-blue-300" />
                  )}
                </button>
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
                        {!isPro && (
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-zinc-400">Sisa Kuota:</span>
                            <span className="text-amber-400 font-bold font-mono">{remainingTrials}x generate</span>
                          </div>
                        )}
                      </div>



                      {onOpenProChat && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenProChat();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors text-left font-medium cursor-pointer"
                        >
                          <Bot className="h-3.5 w-3.5" />
                          <span>Diskusi Arsitek PRO</span>
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
          )}
        </div>
      </div>
    </header>
  );
};
