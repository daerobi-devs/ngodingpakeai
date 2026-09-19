import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID diperlukan' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // 1. Fetch user's profile with admin privilege (bypassing RLS safely)
    let { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // 2. If profile record doesn't exist yet, auto-create it from auth.users
    if (!profile) {
      try {
        const { data: authUserData } = await adminSupabase.auth.admin.getUserById(userId);
        if (authUserData?.user) {
          const authUser = authUserData.user;
          const userEmail = authUser.email || '';
          const adminEmails = [
            'daerobi.devs@gmail.com',
            'admin@ngodingpakeprd.com',
            'buatintech@gmail.com',
          ];
          const isMasterAdmin = adminEmails.includes(userEmail.toLowerCase());

          const newProfile = {
            id: userId,
            email: userEmail,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || userEmail.split('@')[0],
            avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
            subscription_tier: isMasterAdmin ? 'unlimited' : 'free',
            is_admin: isMasterAdmin,
            trial_count: 0,
            updated_at: new Date().toISOString(),
          };

          const { data: inserted, error: insertErr } = await adminSupabase
            .from('profiles')
            .upsert(newProfile)
            .select('*')
            .single();

          if (!insertErr && inserted) {
            profile = inserted;
          }
        }
      } catch (createErr) {
        console.warn('Could not auto-create profile:', createErr);
      }
    }

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profil tidak ditemukan' }, { status: 404 });
    }

    // Auto-grant PRO if email is admin email
    const adminEmails = [
      'daerobi.devs@gmail.com',
      'admin@ngodingpakeprd.com',
      'buatintech@gmail.com',
    ];
    if (profile.email && adminEmails.includes(profile.email.toLowerCase())) {
      if (!profile.is_admin || (profile.subscription_tier !== 'pro' && profile.subscription_tier !== 'unlimited')) {
        await adminSupabase
          .from('profiles')
          .update({
            is_admin: true,
            subscription_tier: 'unlimited',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        profile.is_admin = true;
        profile.subscription_tier = 'unlimited';
      }
    } else if ((profile.subscription_tier === 'pro' || profile.subscription_tier === 'plus') && profile.pro_expires_at) {
      // Auto-downgrade if paid duration has expired
      const isExpired = new Date(profile.pro_expires_at).getTime() < Date.now();
      if (isExpired) {
        await adminSupabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        profile.subscription_tier = 'free';
      }
    }

    // 3. Count today's PRD generations for accurate quota display
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count: todayCount } = await adminSupabase
      .from('prd_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString());

    // 4. Calculate effective daily limit based on tier
    let dailyLimit = 1;
    try {
      const { data: settingsData } = await adminSupabase
        .from('system_settings')
        .select('pricing_tiers, trial_limit')
        .eq('id', 'default')
        .single();

      const userTier = (profile.subscription_tier || 'free').toLowerCase();
      if (userTier === 'unlimited' || profile.is_admin) {
        dailyLimit = 999999;
      } else if (profile.daily_limit_override !== undefined && profile.daily_limit_override !== null) {
        dailyLimit = Number(profile.daily_limit_override);
      } else {
        const pricingTiers = settingsData?.pricing_tiers || [];
        const matchingTier = pricingTiers.find((t: any) => t.id === userTier);
        if (matchingTier && typeof matchingTier.daily_limit === 'number') {
          dailyLimit = matchingTier.daily_limit;
        } else {
          dailyLimit = userTier === 'pro' ? 50 : userTier === 'plus' ? 10 : (settingsData?.trial_limit || 1);
        }
      }
    } catch {
      const userTier = (profile.subscription_tier || 'free').toLowerCase();
      dailyLimit = userTier === 'pro' ? 50 : userTier === 'plus' ? 10 : 1;
    }

    const todayGenerations = todayCount || 0;
    const remainingToday = dailyLimit >= 999999 ? 999999 : Math.max(0, dailyLimit - todayGenerations);

    const enrichedProfile = {
      ...profile,
      today_generations_count: todayGenerations,
      daily_limit: dailyLimit,
      remaining_today: remainingToday,
    };

    return NextResponse.json({ success: true, profile: enrichedProfile });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat profil';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, full_name, role, favorite_ai, onboarding_completed } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID diperlukan' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (full_name !== undefined) updatePayload.full_name = full_name;
    if (role !== undefined) updatePayload.role = role;
    if (favorite_ai !== undefined) updatePayload.favorite_ai = favorite_ai;
    if (onboarding_completed !== undefined) updatePayload.onboarding_completed = onboarding_completed;

    const { data: updated, error } = await adminSupabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memperbarui profil';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
