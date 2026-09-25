'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile, SystemSettings, PaymentOrder } from '@/lib/supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  systemSettings: SystemSettings | null;
  isLoading: boolean;
  isPro: boolean;
  isPlus: boolean;
  isPaid: boolean;
  isAdmin: boolean;
  tier: 'free' | 'plus' | 'pro' | 'unlimited';
  dailyLimit: number;
  todayGenerations: number;
  remainingToday: number;
  remainingTrials: number;
  pendingOrder: PaymentOrder | null;
  loginWithGoogle: (redirectTo?: string, usePopup?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshPendingOrder: () => Promise<void>;
  cancelPendingOrder: (orderId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOrder, setPendingOrder] = useState<PaymentOrder | null>(null);

  const supabase = createClient();

  const fetchPendingOrder = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}&t=${Date.now()}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const pending = data.orders.find((o: PaymentOrder) => o.status === 'pending') || null;
        setPendingOrder(pending);
        return pending;
      }
    } catch (e) {
      console.warn('Failed to fetch pending order:', e);
    }
    return null;
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings?t=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSystemSettings(data.settings);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch system settings:', e);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // 1. Try server admin endpoint with cache-busting to bypass RLS and get fresh tier
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}&t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.profile) {
          setProfile(json.profile as Profile);
          return;
        }
      }

      // 2. Fallback to client-side supabase query
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (e) {
      console.warn('Failed to fetch profile:', e);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);
          if (currentSession?.user) {
            await Promise.all([
              fetchProfile(currentSession.user.id),
              fetchPendingOrder(currentSession.user.id),
            ]);
          }
        }
      } catch (e) {
        console.error('Error init auth:', e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    init();
    fetchSettings();

    const onFocus = () => {
      fetchSettings();
      if (user?.id) {
        fetchProfile(user.id);
        fetchPendingOrder(user.id);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        if (newSession?.user) {
          await Promise.all([
            fetchProfile(newSession.user.id),
            fetchPendingOrder(newSession.user.id),
          ]);
        } else {
          setProfile(null);
          setPendingOrder(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
    };
  }, [supabase, fetchProfile, fetchPendingOrder, fetchSettings, user?.id]);

  // Polling check when an order is pending verification
  useEffect(() => {
    if (!user?.id || !pendingOrder) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders?userId=${encodeURIComponent(user.id)}&t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const currentOrder = data.orders.find((o: PaymentOrder) => o.id === pendingOrder.id);
          if (!currentOrder || currentOrder.status !== 'pending') {
            setPendingOrder(null);
            if (currentOrder?.status === 'approved') {
              await fetchProfile(user.id);
            }
          }
        }
      } catch {
        // silent fail on network glitch
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [user?.id, pendingOrder, fetchProfile]);

  const loginWithGoogle = async (redirectTo = '/generator', usePopup = true): Promise<boolean> => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    if (usePopup && typeof window !== 'undefined') {
      const callbackUrl = `${origin}/auth/callback?popup=true&next=${encodeURIComponent(redirectTo)}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        console.error('Failed to get OAuth URL for popup, falling back to direct redirect:', error);
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          },
        });
        return false;
      }

      // Hitung koordinat tengah layar browser pengguna
      const width = 500;
      const height = 650;
      const left = window.screenX + Math.max(0, Math.floor((window.outerWidth - width) / 2));
      const top = window.screenY + Math.max(0, Math.floor((window.outerHeight - height) / 2));

      const popup = window.open(
        data.url,
        'google-oauth-popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      );

      // Jika browser memblokir popup, fallback otomatis ke redirect penuh
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        console.warn('Popup diblokir oleh browser. Mengalihkan ke redirect normal.');
        window.location.href = data.url;
        return false;
      }

      return new Promise<boolean>((resolve) => {
        let isDone = false;

        const cleanup = () => {
          if (typeof window !== 'undefined') {
            window.removeEventListener('message', handleMessage);
          }
          clearInterval(pollTimer);
        };

        const finishSuccess = async () => {
          if (isDone) return;
          isDone = true;
          cleanup();
          try {
            const { data: { session: freshSession } } = await supabase.auth.getSession();
            if (freshSession) {
              setSession(freshSession);
              setUser(freshSession.user);
              await Promise.all([
                fetchProfile(freshSession.user.id),
                fetchPendingOrder(freshSession.user.id),
              ]);
            }
          } catch (e) {
            console.warn('Session refresh error:', e);
          }
          resolve(true);
        };

        const handleMessage = async (event: MessageEvent) => {
          if (event.origin === origin && event.data?.type === 'SUPABASE_AUTH_SUCCESS') {
            await finishSuccess();
          }
        };

        window.addEventListener('message', handleMessage);

        const pollTimer = setInterval(async () => {
          if (popup.closed) {
            clearInterval(pollTimer);
            if (!isDone) {
              setTimeout(async () => {
                if (isDone) return;
                const { data: { session: checkSession } } = await supabase.auth.getSession();
                if (checkSession) {
                  await finishSuccess();
                } else {
                  isDone = true;
                  cleanup();
                  resolve(false);
                }
              }, 600);
            }
          }
        }, 500);
      });
    }

    // Default redirect mode
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setPendingOrder(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const refreshPendingOrder = async () => {
    if (user?.id) {
      await fetchPendingOrder(user.id);
    }
  };

  const cancelPendingOrder = async (orderId: string): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          userId: user.id,
          action: 'cancel',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingOrder(null);
        return true;
      }
    } catch (e) {
      console.error('Failed to cancel order:', e);
    }
    return false;
  };

  const userEmail = user?.email?.toLowerCase().trim() || '';
  const adminEmails = [
    'daerobi.devs@gmail.com',
    'admin@ngodingpakeprd.com',
    'buatintech@gmail.com',
  ];
  const isAdmin = Boolean(profile?.is_admin) || adminEmails.includes(userEmail);
  const rawTier = (profile?.subscription_tier || 'free').toLowerCase().trim();
  const isPaidExpired = Boolean(
    (rawTier === 'pro' || rawTier === 'plus') &&
    !isAdmin &&
    profile?.pro_expires_at &&
    new Date(profile.pro_expires_at).getTime() < Date.now()
  );
  const activeTier: 'free' | 'plus' | 'pro' | 'unlimited' = isPaidExpired
    ? 'free'
    : isAdmin
    ? 'unlimited'
    : rawTier === 'plus'
    ? 'plus'
    : rawTier === 'pro' || rawTier === 'unlimited'
    ? (rawTier as any)
    : 'free';

  const isPro = activeTier === 'pro' || activeTier === 'unlimited' || isAdmin;
  const isPlus = activeTier === 'plus';
  const isPaid = isPro || isPlus;

  const trialLimit = systemSettings?.trial_limit ?? 1;
  const trialUsed = profile?.trial_count ?? 0;
  const remainingTrials = isPaid ? 999999 : Math.max(0, trialLimit - trialUsed);

  // Daily Quota Tracking (Today's count and remaining limit)
  const dailyLimit = profile?.daily_limit ?? (isPro ? 50 : isPlus ? 10 : trialLimit);
  const todayGenerations = profile?.today_generations_count ?? 0;
  const remainingToday = profile?.remaining_today ?? (dailyLimit >= 999999 ? 999999 : Math.max(0, dailyLimit - todayGenerations));

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        systemSettings,
        isLoading,
        isPro,
        isPlus,
        isPaid,
        isAdmin,
        tier: activeTier,
        dailyLimit,
        todayGenerations,
        remainingToday,
        remainingTrials,
        pendingOrder,
        loginWithGoogle,
        logout,
        refreshProfile,
        refreshSettings: fetchSettings,
        refreshPendingOrder,
        cancelPendingOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
