'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile, SystemSettings } from '@/lib/supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  systemSettings: SystemSettings | null;
  isLoading: boolean;
  isPro: boolean;
  isAdmin: boolean;
  remainingTrials: number;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

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
            await fetchProfile(currentSession.user.id);
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
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
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
  }, [supabase, fetchProfile, fetchSettings]);

  const loginWithGoogle = async (redirectTo = '/generator') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: origin + '/auth/callback?next=' + encodeURIComponent(redirectTo),
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const isPro = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'unlimited';
  const isAdmin = profile?.is_admin || (user?.email ? ['daerobi.devs@gmail.com', 'admin@ngodingpakeprd.com'].includes(user.email) : false);
  const trialLimit = systemSettings?.trial_limit ?? 1;
  const trialUsed = profile?.trial_count ?? 0;
  const remainingTrials = Math.max(0, trialLimit - trialUsed);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        systemSettings,
        isLoading,
        isPro,
        isAdmin,
        remainingTrials,
        loginWithGoogle,
        logout,
        refreshProfile,
        refreshSettings: fetchSettings,
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
