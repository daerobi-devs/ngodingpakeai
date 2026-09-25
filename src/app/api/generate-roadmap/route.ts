import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SystemSettings, Profile, DEFAULT_PRICING_TIERS } from '@/lib/supabase/types';
import { generateRoadmapAI } from '@/lib/roadmap/roadmap-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const goal: string = body.goal || '';
    const additionalContext: string = body.additionalContext || '';
    const userId: string = body.userId || '';

    if (!goal || goal.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Silakan masukkan tujuan, karier, atau teknologi yang ingin Anda pelajari.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    let systemSettings: SystemSettings = {
      id: 'default',
      auth_mode: 'hybrid',
      api_key_mode: 'byok_only',
      monetization_mode: 'freemium',
      ai_provider: 'gemini_direct',
      trial_limit: 1,
      pro_price_rp: 49000,
      pro_price_formatted: 'Rp 49.000 / Lifetime Access',
      roadmap_access_tier: 'paid_only',
    };

    try {
      const { data: dbSettings } = await adminSupabase
        .from('system_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (dbSettings) {
        systemSettings = dbSettings as SystemSettings;
      }
    } catch {
      // fallback to default
    }

    let userProfile: Profile | null = null;
    if (userId) {
      const { data: prof } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (prof) userProfile = prof as Profile;
    }

    // Ban check
    if (userProfile?.is_banned) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akun Anda telah dinonaktifkan / diblokir oleh administrator karena melanggar ketentuan penggunaan.',
        },
        { status: 403 }
      );
    }

    if (systemSettings.auth_mode === 'strict_login' && !userProfile) {
      return NextResponse.json(
        { success: false, error: 'Akses dibatasi. Silakan Login menggunakan Akun Google terlebih dahulu.' },
        { status: 401 }
      );
    }

    // Check if subscription expired
    const userTier = userProfile?.subscription_tier || 'free';
    if ((userTier === 'pro' || userTier === 'plus') && !userProfile?.is_admin && userProfile?.pro_expires_at) {
      if (new Date(userProfile.pro_expires_at).getTime() < Date.now()) {
        userProfile.subscription_tier = 'free';
        adminSupabase
          .from('profiles')
          .update({ subscription_tier: 'free', updated_at: new Date().toISOString() })
          .eq('id', userProfile.id)
          .then();
      }
    }

    const isPaidTier = userProfile?.subscription_tier === 'pro' || 
                       userProfile?.subscription_tier === 'plus' || 
                       userProfile?.subscription_tier === 'unlimited' || 
                       Boolean(userProfile?.is_admin);

    // Dynamic Admin Access Policy Check for Roadmap Pintar
    const roadmapPolicy = systemSettings.roadmap_access_tier || 'paid_only';
    if (!userProfile?.is_admin) {
      if (roadmapPolicy === 'paid_only' && !isPaidTier) {
        return NextResponse.json(
          {
            success: false,
            error: 'Fitur Roadmap Pintar dikhususkan untuk Member Berlangganan (Plus / Pro). Silakan upgrade paket untuk menikmati fitur ini.',
            featureLocked: 'roadmap_access_tier',
          },
          { status: 403 }
        );
      }
      if (roadmapPolicy === 'pro_only' && userProfile?.subscription_tier !== 'pro' && userProfile?.subscription_tier !== 'unlimited') {
        return NextResponse.json(
          {
            success: false,
            error: 'Fitur Roadmap Pintar dikhususkan untuk Member Pro. Silakan upgrade ke paket Pro untuk mengakses.',
            featureLocked: 'roadmap_access_tier',
          },
          { status: 403 }
        );
      }
    }

    // Enforce 1 PRD daily rate limit
    const tiers = systemSettings.pricing_tiers || DEFAULT_PRICING_TIERS;
    const currentTierConfig = tiers.find((t) => t.id === userProfile?.subscription_tier) || tiers.find((t) => t.id === 'free');
    const effectiveDailyLimit = userProfile?.daily_limit_override !== undefined && userProfile?.daily_limit_override !== null
      ? userProfile.daily_limit_override
      : (currentTierConfig ? currentTierConfig.daily_limit : (userTier === 'free' ? 1 : 50));

    if (userProfile && !userProfile.is_admin) {
      if (effectiveDailyLimit > 0 && effectiveDailyLimit < 999999) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { count, error: countError } = await adminSupabase
          .from('prd_history')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userProfile.id)
          .not('title', 'ilike', '[Arsitek]%')
          .gte('created_at', startOfDay.toISOString());

        if (!countError && (count || 0) >= effectiveDailyLimit) {
          return NextResponse.json(
            {
              success: false,
              error: `Batas kuota harian Anda (${effectiveDailyLimit} per hari untuk paket ${currentTierConfig?.name || userTier.toUpperCase()}) telah tercapai hari ini. Kuota akan direset otomatis pukul 00:00 WIB.`,
              dailyLimitReached: true,
            },
            { status: 429 }
          );
        }
      } else if (effectiveDailyLimit === 0 && systemSettings.api_key_mode === 'server_managed' && !isPaidTier) {
        const currentTrialCount = userProfile?.trial_count || 0;
        if (currentTrialCount >= (systemSettings.trial_limit || 1)) {
          return NextResponse.json(
            {
              success: false,
              error: 'Kuota generate gratis untuk paket Anda telah habis. Silakan upgrade paket untuk melanjutkan.',
              trialExpired: true,
            },
            { status: 403 }
          );
        }
      }
    }

    const userGeminiKey = req.headers.get('x-gemini-api-key') || '';
    const userPreferredModel = req.headers.get('x-gemini-preferred-model') || '';
    if (systemSettings.api_key_mode === 'byok_only' && !userGeminiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API Key belum dimasukkan. Silakan buka menu Pengaturan untuk memasukkan API Key Anda.',
        },
        { status: 401 }
      );
    }

    // Generate Roadmap using AI Service
    const aiResult = await generateRoadmapAI({
      systemSettings,
      userGoal: goal,
      additionalContext,
      userGeminiKey,
      isPro: isPaidTier,
      userId: userProfile?.id || userId,
      assignedGeminiSlot: userProfile?.assigned_gemini_slot,
      userPreferredModel: userPreferredModel.trim() || undefined,
    });

    const isServerKey = !userGeminiKey || isPaidTier || systemSettings.api_key_mode === 'server_managed';

    // Deduct 1 free trial if applicable
    if (userProfile && !isPaidTier && systemSettings.api_key_mode === 'server_managed') {
      await adminSupabase
        .from('profiles')
        .update({
          trial_count: (userProfile.trial_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userProfile.id);
    }

    // Accumulate server token consumption in user profile
    if (userProfile && isServerKey) {
      try {
        const currentTokens = (userProfile as any).total_server_tokens || 0;
        await adminSupabase
          .from('profiles')
          .update({
            total_server_tokens: currentTokens + aiResult.tokensUsed,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userProfile.id);
      } catch (tokErr) {
        console.warn('Could not update total_server_tokens for roadmap:', tokErr);
      }
    }

    // Save into prd_history to deduct 1 PRD quota and enable history saving
    let savedPrdId: string | undefined;
    try {
      const { data: insertedData } = await adminSupabase
        .from('prd_history')
        .insert({
          user_id: userProfile?.id || null,
          title: `Roadmap: ${aiResult.roadmap.title}`,
          prd_data: {
            type: 'roadmap',
            roadmap: aiResult.roadmap,
          } as any,
          model_used: aiResult.modelUsed,
          tokens_used: aiResult.tokensUsed,
          is_server_key: isServerKey,
          gemini_slot_used: 'Roadmap Engine',
        })
        .select('id')
        .maybeSingle();

      if (insertedData?.id) {
        savedPrdId = insertedData.id;
      }
    } catch (histErr) {
      console.error('Failed to log roadmap to prd_history:', histErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...aiResult.roadmap,
        id: savedPrdId || aiResult.roadmap.id,
      },
      prdId: savedPrdId,
      modelUsed: aiResult.modelUsed,
      tokensUsed: aiResult.tokensUsed,
    });
  } catch (error: unknown) {
    console.error('Error in generate-roadmap:', error);
    let errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat merancang Roadmap Pintar';
    if (errorMessage.toLowerCase().includes('json') || errorMessage.toLowerCase().includes('syntaxerror')) {
      errorMessage = 'Sistem sedang menyelaraskan struktur data dari AI. Silakan coba klik Susun Roadmap sekali lagi.';
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
