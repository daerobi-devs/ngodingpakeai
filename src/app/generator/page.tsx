'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PRDFormData, PRDOutput, SectionKey } from '@/types/prd';
import { GeneratorSidebar, PrdHistorySummary } from '@/components/GeneratorSidebar';
import { PRDForm } from '@/components/PRDForm';
import { PRDViewer } from '@/components/PRDViewer';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { SectionAssistantModal } from '@/components/SectionAssistantModal';
import { AuthModal } from '@/components/AuthModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import { PricingModal } from '@/components/PricingModal';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { useAuth } from '@/context/AuthContext';
import { WizardHeroInput, TechStackConfig, DEFAULT_TECH_STACK } from '@/components/wizard/WizardHeroInput';
import { WizardDiscoveryStep } from '@/components/wizard/WizardDiscoveryStep';
import { ClarificationQuestion } from '@/types/prd';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  AlertCircle,
  Zap,
  Crown,
  Lock,
  LogIn,
  CheckCircle2,
  Key,
  PanelLeft,
  PanelLeftClose,
  ChevronRight,
  Edit3,
  BookOpen,
  ArrowLeft,
  Sun,
  Moon,
  FolderGit2,
  Settings,
  HelpCircle,
  X,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

const INITIAL_FORM_DATA: PRDFormData = {
  title: '',
  opportunity_framing: {
    core_problem: '',
    working_hypothesis: '',
    strategy_fit: '',
  },
  boundaries: {
    scope: '',
    non_goals: '',
  },
  success_measurement: {
    offline_golden_set: '',
    human_review: '',
    online_metrics: '',
  },
  rollout_plan: {
    exposure: '',
    duration: '',
    segments_gates: '',
  },
  risk_management: {
    detection: '',
    fallback_kill_switch: '',
  },
  ownership_action: {
    primary_owner: '',
    decision_points: '',
  },
  ai_specific: {
    behavior_contract: '',
    guardrails: '',
  },
};

function GeneratorContent() {
  const searchParams = useSearchParams();
  const urlTemplate = searchParams?.get('template') || undefined;
  const {
    user,
    profile,
    isPro,
    isPlus,
    isPaid,
    tier,
    dailyLimit,
    remainingToday,
    isAdmin,
    remainingTrials,
    systemSettings,
    isLoading: authLoading,
    logout,
    refreshProfile,
  } = useAuth();
  const [keys, setKeys] = useState<string[]>([]);
  const [preferredModel, setPreferredModel] = useState<string>('gemini-3.8-flash');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePrdId, setActivePrdId] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<PrdHistorySummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Auto-open Onboarding modal if user is logged in but hasn't completed onboarding profile
  useEffect(() => {
    if (user && profile && !authLoading) {
      if (!profile.onboarding_completed) {
        setIsOnboardingOpen(true);
      }
    }
  }, [user, profile, authLoading]);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || profile?.avatar_url;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const initialLetter = displayName.charAt(0).toUpperCase();

  const userTier = (profile?.subscription_tier || '').toLowerCase().trim();
  const isPaidMember = isPaid || isAdmin;
  const tierLabel = isPro || isAdmin ? 'Paket PRO (Lengkap)' : isPlus ? 'Paket PLUS (Hemat)' : 'Paket Free';
  const adminWaNumber = '6285123607711';
  const helpMessage = `Halo Admin ngodingpakeprd,

Saya pengguna ${tierLabel}
- Nama: ${displayName}
- Email Akun: ${user?.email || ''}

Saya ingin berkonsultasi mengenai kendala / pertanyaan berikut:
`;
  const helpWaUrl = `https://wa.me/${adminWaNumber}?text=${encodeURIComponent(helpMessage)}`;

  const [assistantSection, setAssistantSection] = useState<SectionKey | null>(null);
  const [formData, setFormData] = useState<PRDFormData>(INITIAL_FORM_DATA);
  const [generatedPRD, setGeneratedPRD] = useState<PRDOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [creationMode, setCreationMode] = useState<'wizard' | 'manual'>('wizard');
  const [wizardStep, setWizardStep] = useState<'input' | 'discovery'>('input');
  const [wizardIdea, setWizardIdea] = useState('');
  const [wizardStack, setWizardStack] = useState<TechStackConfig>(DEFAULT_TECH_STACK);
  const [discoveryQuestions, setDiscoveryQuestions] = useState<ClarificationQuestion[]>([]);
  const [loadingClarifications, setLoadingClarifications] = useState(false);

  const isLight = theme === 'light';
  const isServerManaged = systemSettings?.api_key_mode === 'server_managed';
  const isStrictLogin = systemSettings?.auth_mode === 'strict_login';

  // Responsive sidebar initial check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }
  }, []);

  // Fetch history from Supabase and local storage
  const fetchUserHistory = async () => {
    let combined: PrdHistorySummary[] = [];

    // 1. Read local storage first
    try {
      const local = localStorage.getItem('local_prd_history');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          combined = parsed;
        }
      }
    } catch {
      // ignore
    }

    // 2. Fetch cloud history if authenticated
    if (user?.id) {
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/user-prds?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.prds)) {
            const cloudItems: PrdHistorySummary[] = data.prds.map((p: any) => ({
              id: p.id,
              title: p.title,
              created_at: p.created_at,
              model_used: p.model_used,
              prd_data: p.prd_data,
            }));

            // Merge avoiding duplicates by id
            const existingIds = new Set(cloudItems.map((c) => c.id));
            const uniqueLocal = combined.filter((l) => !existingIds.has(l.id));
            combined = [...cloudItems, ...uniqueLocal];
          }
        }
      } catch (err) {
        console.warn('Could not fetch cloud PRDs:', err);
      } finally {
        setLoadingHistory(false);
      }
    }

    setHistoryItems(combined);
  };

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('prd_preferred_theme') as 'dark' | 'light' | null;
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setTheme(storedTheme);
      }
      const storedKeys = localStorage.getItem('gemini_api_keys');
      if (storedKeys) {
        const parsed = JSON.parse(storedKeys);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setKeys(parsed);
        }
      }
      const storedModel = localStorage.getItem('gemini_preferred_model');
      if (storedModel) {
        setPreferredModel(storedModel);
      }


    } catch {
      // ignore
    }

    fetchUserHistory();
  }, [user?.id]);

  // Otomatis munculkan pop-up API Key jika Admin menyetel mode BYOK (wajib key sendiri) & user belum punya key
  useEffect(() => {
    if (!authLoading && systemSettings) {
      if (!isServerManaged && keys.length === 0) {
        setIsKeyModalOpen(true);
      } else if (isServerManaged) {
        // Jika mode di admin diubah ke server_managed, jangan paksa pop-up terbuka
        // (kecuali jika user membukanya sendiri secara manual)
      }
    }
  }, [authLoading, isServerManaged, keys.length, systemSettings]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('prd_preferred_theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleSaveKeys = (newKeys: string[], newModel?: string) => {
    setKeys(newKeys);
    localStorage.setItem('gemini_api_keys', JSON.stringify(newKeys));
    if (newModel) {
      setPreferredModel(newModel);
      localStorage.setItem('gemini_preferred_model', newModel);
    }
  };

  const handleNewPrd = () => {
    setActivePrdId(null);
    setGeneratedPRD(null);
    setFormData(INITIAL_FORM_DATA);
    setWizardStep('input');
    setWizardIdea('');
    setDiscoveryQuestions([]);
    setErrorMessage(null);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectHistoryPrd = (prd: PRDOutput, id: string) => {
    setGeneratedPRD(prd);
    setActivePrdId(id);
    setErrorMessage(null);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteHistoryPrd = async (id: string) => {
    // Remove from state
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));

    // Remove from local storage
    try {
      const local = localStorage.getItem('local_prd_history');
      if (local) {
        const parsed = JSON.parse(local);
        const updated = parsed.filter((item: any) => item.id !== id);
        localStorage.setItem('local_prd_history', JSON.stringify(updated));
      }
    } catch {
      // ignore
    }

    // If active, reset view
    if (activePrdId === id) {
      setActivePrdId(null);
      setGeneratedPRD(null);
    }

    // Call server delete if user is logged in
    if (user?.id) {
      try {
        await fetch(`/api/user-prds?id=${id}&userId=${user.id}`, {
          method: 'DELETE',
        });
      } catch {
        // ignore
      }
    }
  };

  const handleHeroSubmit = async (idea: string, stack: TechStackConfig, language?: any) => {
    if (isStrictLogin && !user) {
      setIsAuthModalOpen(true);
      return;
    }

    setWizardIdea(idea);
    setWizardStack(stack);
    setLoadingClarifications(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-clarifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': keys.join(','),
          'x-gemini-preferred-model': preferredModel,
        },
        body: JSON.stringify({
          userIdea: idea,
          templateId: stack.templateId,
          language: language || stack.language || 'id',
          userId: user?.id,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyiapkan pertanyaan klarifikasi');
      }

      setDiscoveryQuestions(json.data.questions || []);
      setWizardStep('discovery');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat pertanyaan');
    } finally {
      setLoadingClarifications(false);
    }
  };

  const handleDiscoverySubmit = async (compiledFormData: PRDFormData) => {
    setFormData(compiledFormData);
    await handleGenerate(compiledFormData);
  };

  const handleGenerate = async (overrideFormData?: PRDFormData) => {
    const targetFormData = overrideFormData || formData;

    if (isStrictLogin && !user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!isServerManaged && keys.length === 0) {
      setIsKeyModalOpen(true);
      return;
    }

    if (isServerManaged && !isPaid && user && remainingTrials <= 0) {
      setIsPricingModalOpen(true);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusStep('Menyiapkan konteks produk...');

    try {
      setTimeout(() => setStatusStep('Menganalisis boundary & non-goals...'), 2000);
      setTimeout(() => setStatusStep('Merancang arsitektur & sequence flow...'), 5000);
      setTimeout(() => setStatusStep('Menyusun DESIGN.md anti-slop guidelines...'), 8000);
      setTimeout(() => setStatusStep('Finalisasi checklist Cursor & Claude Code...'), 12000);

      const res = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': keys.join(','),
          'x-gemini-preferred-model': preferredModel,
        },
        body: JSON.stringify({
          formData: targetFormData,
          userId: user?.id,
          techStack: wizardStack,
          language: wizardStack.language || 'id',
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.trialExpired || json.dailyLimitReached) {
          setIsPricingModalOpen(true);
        }
        throw new Error(json.error || 'Gagal membuat PRD');
      }

      setGeneratedPRD(json.data);

      // Save to history state & local storage
      const newHistoryItem: PrdHistorySummary = {
        id: `prd_${Date.now()}`,
        title: targetFormData.title || 'Untitled PRD',
        created_at: new Date().toISOString(),
        model_used: json.data?.metadata?.modelUsed || preferredModel,
        prd_data: json.data,
      };

      setHistoryItems((prev) => [newHistoryItem, ...prev]);
      setActivePrdId(newHistoryItem.id);

      try {
        const local = localStorage.getItem('local_prd_history');
        const parsed = local ? JSON.parse(local) : [];
        localStorage.setItem('local_prd_history', JSON.stringify([newHistoryItem, ...parsed].slice(0, 30)));
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga');
    } finally {
      setLoading(false);
      setStatusStep('');
    }
  };

  const currentSectionValues = (): Record<string, string> => {
    if (!assistantSection) return {};
    const val = formData[assistantSection];
    if (typeof val === 'object' && val !== null) {
      return val as Record<string, string>;
    }
    return { value: String(val || '') };
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-200 ${
      isLight ? 'bg-zinc-100 text-zinc-900' : 'bg-[#09090b] text-zinc-100'
    }`}>
      {/* 1. Collapsible Left Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 lg:static lg:z-auto transition-transform duration-200 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <GeneratorSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activePrdId={activePrdId}
          historyItems={historyItems}
          onSelectPrd={handleSelectHistoryPrd}
          onNewPrd={handleNewPrd}
          onDeletePrd={handleDeleteHistoryPrd}
          onOpenSettings={() => setIsKeyModalOpen(true)}
          onOpenPricing={() => setIsPricingModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          activeModel={preferredModel}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isLoadingHistory={loadingHistory}
          onRefreshHistory={fetchUserHistory}
          creationMode={creationMode}
          onSetCreationMode={setCreationMode}
        />
      </div>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 2. Main Studio Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Announcement Banner */}
        <AnnouncementBanner />

        {/* Top Workspace Header */}
        <header className="h-14 shrink-0 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md px-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sidebar toggle button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              title={isSidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
            >
              {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4 text-amber-400" />}
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
              <Link href="/" className="hover:text-zinc-200 transition-colors hidden sm:inline">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 hidden sm:inline" />
              <span className="text-zinc-300 font-medium">Studio</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-amber-400 font-semibold truncate max-w-[200px] sm:max-w-[320px]">
                {generatedPRD
                  ? generatedPRD.title || 'Dokumen PRD'
                  : formData.title?.trim() || 'Draf Produk Baru'}
              </span>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Toggle between Edit Form and View PRD */}
            {generatedPRD && (
              <button
                type="button"
                onClick={() => setGeneratedPRD(null)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Kembali Edit Form</span>
              </button>
            )}

            {/* Active Model BYOK Chip - only shown when NOT server_managed */}
            {!isServerManaged && (
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
                title="Pengaturan Kunci API"
              >
                <Key className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden md:inline">API Key</span>
              </button>
            )}

            {/* User Profile Avatar & Dropdown / Guest Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-zinc-700 transition-all focus:outline-none cursor-pointer"
                  title={displayName}
                >
                  {avatarUrl && !avatarError ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={() => setAvatarError(true)}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-700/80 shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-xs shadow-xs">
                      {initialLetter}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu (matching user screenshot media_1789734313113.png) */}
                {isUserMenuOpen && (
                  <>
                    {/* Invisible click-away backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />

                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-700/80 bg-[#161a23] shadow-2xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-100">
                      {/* Header: Name & Email */}
                      <div className="px-3.5 py-3 border-b border-zinc-700/50">
                        <div className="text-sm font-bold text-white truncate leading-tight">
                          {displayName}
                        </div>
                        <div className="text-xs text-zinc-400 truncate mt-0.5">
                          {user.email}
                        </div>
                      </div>

                      {/* Middle options */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsSettingsModalOpen(true);
                          }}
                          className="w-full flex items-center px-3.5 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
                        >
                          Pengaturan
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            if (isPaidMember) {
                              setIsHelpModalOpen(true);
                            } else {
                              setIsPricingModalOpen(true);
                            }
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Bantuan & Support WA</span>
                          </div>
                          {!isPaidMember ? (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                              <Lock className="h-2.5 w-2.5" />
                              <span>PLUS/PRO</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                              VIP
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleToggleTheme();
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {theme === 'dark' ? (
                              <Sun className="h-3.5 w-3.5 text-amber-400" />
                            ) : (
                              <Moon className="h-3.5 w-3.5 text-indigo-400" />
                            )}
                            <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {theme === 'dark' ? 'Light' : 'Dark'}
                          </span>
                        </button>
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-zinc-700/50 py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center px-3.5 py-2 text-xs font-medium text-zinc-200 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3 py-1.5 text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Masuk</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Canvas Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-8">
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 max-w-4xl mx-auto">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Terjadi Kesalahan</p>
                <p className="mt-1 text-xs text-red-300 leading-relaxed whitespace-pre-wrap">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Condition 0: Strict Login Wall if not authenticated */}
          {isStrictLogin && !user && !authLoading ? (
            <div className="my-12 sm:my-20 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-zinc-900/90 to-zinc-950 p-8 sm:p-12 text-center text-white shadow-2xl max-w-xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mb-4 border border-amber-500/30 shadow-lg shadow-amber-500/10">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2">Login Diperlukan untuk Menggunakan Generator</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
                Mode Strict Login aktif. Silakan masuk menggunakan akun Google untuk mengakses generator PRD dan menyimpan riwayat proyek Anda.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-3 text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk dengan Google Sekarang</span>
                </button>
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium px-5 py-3 text-xs sm:text-sm transition-all"
                >
                  <span>Kembali ke Beranda</span>
                </Link>
              </div>
            </div>
          ) : generatedPRD ? (
            /* Condition 1: PRD Viewer Mode (Expanded Canvas) */
            <div id="prd-viewer-section" className="w-full max-w-6xl mx-auto">
              <PRDViewer
                prd={generatedPRD}
                onBackToEdit={() => setGeneratedPRD(null)}
                theme={theme}
                onRequireUpgrade={() => setIsPricingModalOpen(true)}
              />
            </div>
          ) : (
            /* Condition 2: PRD Input Studio (Mode Terpandu vs Mode Form Manual) */
            <div className="w-full">
              {creationMode === 'wizard' ? (
                /* Sub-condition A: Wizard Mode */
                <div id="wizard-container" className="w-full">
                  {wizardStep === 'input' ? (
                    <WizardHeroInput
                      initialIdea={wizardIdea}
                      userName={user ? displayName : undefined}
                      onSubmitIdea={handleHeroSubmit}
                      isLoading={loadingClarifications}
                      theme={theme}
                      initialTemplateId={urlTemplate}
                      onRequireUpgrade={() => setIsPricingModalOpen(true)}
                    />
                  ) : (
                    <WizardDiscoveryStep
                      idea={wizardIdea}
                      techStack={wizardStack}
                      questions={discoveryQuestions}
                      onBack={() => setWizardStep('input')}
                      onSubmitDiscovery={handleDiscoverySubmit}
                      isGeneratingPrd={loading}
                      theme={theme}
                    />
                  )}
                </div>
              ) : (
                /* Sub-condition B: Manual Form Mode (100% Preserved) */
                <div id="prd-input-form" className="max-w-4xl mx-auto">
                  <PRDForm
                    formData={formData}
                    onChange={setFormData}
                    onSubmit={handleGenerate}
                    loading={loading}
                    statusStep={statusStep}
                    onOpenAssistant={(section) => setAssistantSection(section)}
                    apiKeyHeader={keys.join(',')}
                    preferredModel={preferredModel}
                    theme={theme}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        currentKeys={keys}
        currentPreferredModel={preferredModel}
        onSaveKeys={handleSaveKeys}
        required={!isServerManaged && keys.length === 0}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {user && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          userId={user.id}
          initialName={profile?.full_name || user.user_metadata?.full_name || ''}
          onComplete={async () => {
            setIsOnboardingOpen(false);
            await refreshProfile();
          }}
        />
      )}

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {assistantSection && (
        <SectionAssistantModal
          isOpen={true}
          onClose={() => setAssistantSection(null)}
          sectionKey={assistantSection}
          currentValues={currentSectionValues()}
          apiKeyHeader={keys.join(',')}
          preferredModel={preferredModel}
          onApplyText={(improvedText: string) => {
            try {
              const parsed = JSON.parse(improvedText);
              setFormData((prev) => ({
                ...prev,
                [assistantSection]: parsed,
              }));
            } catch {
              // fallback
            }
            setAssistantSection(null);
          }}
        />
      )}

      {/* Pengaturan Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0f1219] p-6 text-white shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Settings className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">Pengaturan Akun</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Profil Pengguna:</span>
                  <span className="font-semibold text-white">{displayName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Email:</span>
                  <span className="text-zinc-300 font-mono">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Peran:</span>
                  <span className="text-amber-400 font-medium">{profile?.role || 'Belum diatur'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">AI Coding Utama:</span>
                  <span className="text-amber-400 font-mono font-medium">{profile?.favorite_ai || 'Belum diatur'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Status Akun:</span>
                  <span className={`font-bold px-2 py-0.5 rounded uppercase text-[10px] ${
                    isPro ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {isPro ? 'PRO Unlimited' : `Trial (${remainingTrials}x tersisa)`}
                  </span>
                </div>
                {user && (
                  <div className="pt-2 border-t border-zinc-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsModalOpen(false);
                        setIsOnboardingOpen(true);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline font-semibold cursor-pointer"
                    >
                      Ubah Data Profil
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 text-zinc-400 leading-relaxed space-y-1">
                <div className="font-semibold text-zinc-300">Mesin AI Otomatis (Server-Managed):</div>
                <p>
                  Akun Anda terhubung langsung ke mesin AI server. Anda tidak perlu memasukkan API key pribadi. Pengaturan kustomisasi dan integrasi tambahan akan segera hadir.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bantuan Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0f1219] p-6 text-white shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Bantuan & Customer Support</h3>
                  <span className="text-[10px] text-zinc-400 font-mono">Dukungan WhatsApp Prioritas</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-zinc-300 leading-relaxed">
              {isPaidMember ? (
                /* VIP WhatsApp Support for PLUS & PRO */
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat Konsultasi Pengembang (VIP)</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {tierLabel.replace('Paket ', '')}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    Memiliki kendala saat menyusun PRD, integrasi prompt Cursor / Claude Code, starter kit, ataupun akun? Silakan hubungi langsung pengembang via WhatsApp untuk penanganan prioritas.
                  </p>
                  <div className="pt-2">
                    <a
                      href={helpWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat WhatsApp Pengembang (0851-2360-7711)</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                    </a>
                  </div>
                </div>
              ) : (
                /* Locked Notice for Free Users */
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Lock className="h-4 w-4" />
                    <span>Dukungan WhatsApp Khusus PLUS & PRO</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    Layanan konsultasi kendala dan direct chat WhatsApp bersama tim pengembang tersedia eksklusif untuk member Paket PLUS dan PRO.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsHelpModalOpen(false);
                      setIsPricingModalOpen(true);
                    }}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <span>Upgrade ke PLUS atau PRO</span>
                  </button>
                </div>
              )}

              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-1">
                <div className="font-bold text-zinc-200">Bagaimana cara kerja Generator PRD?</div>
                <p className="text-zinc-400 text-[11px]">
                  Ketik ide produk Anda di form awal, lengkapi pertanyaan klarifikasi cerdas, dan AI akan otomatis menghasilkan dokumen PRD standar industri dengan checklist instruksi untuk Cursor dan Claude Code.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <GeneratorContent />
    </Suspense>
  );
}
