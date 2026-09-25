import { NextRequest, NextResponse } from 'next/server';
import { generatePRDUnified } from '@/lib/ai/ai-service';
import { MASTER_PRD_SYSTEM_PROMPT, buildPRDUserPrompt } from '@/lib/gemini/prompts';
import { PRDFormData, PRDOutput } from '@/types/prd';
import { createAdminClient } from '@/lib/supabase/admin';
import { SystemSettings, Profile, DEFAULT_PRICING_TIERS, hasTierFeature } from '@/lib/supabase/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const formData: PRDFormData = body.formData;
    const userId = body.userId;
    const techStack = body.techStack;
    const language = body.language || 'id';
    const selectedModules = body.selectedModules;

    if (!formData) {
      return NextResponse.json(
        { success: false, error: 'Data form PRD tidak ditemukan' },
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
      qris_merchant_name: 'NGODINGPAKEPRD OFFICIAL',
      pro_price_rp: 49000,
      pro_price_formatted: 'Rp 49.000 / Lifetime Access',
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
      // fallback
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

    // Check if subscription (pro/plus) is expired
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

    const isPaidTier = userProfile?.subscription_tier === 'pro' || userProfile?.subscription_tier === 'plus' || userProfile?.subscription_tier === 'unlimited' || Boolean(userProfile?.is_admin);

    // Enforce daily rate limit if user is logged in and not admin
    const tiers = systemSettings.pricing_tiers || DEFAULT_PRICING_TIERS;
    const currentTierConfig = tiers.find(t => t.id === userProfile?.subscription_tier) || tiers.find(t => t.id === 'free');
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
              error: `Batas kuota harian kamu (${effectiveDailyLimit} PRD/hari untuk paket ${currentTierConfig?.name || userTier.toUpperCase()}) telah tercapai hari ini. Kuota akan direset otomatis pukul 00:00 WIB.`,
              dailyLimitReached: true,
            },
            { status: 429 }
          );
        }
      } else if (effectiveDailyLimit === 0 && systemSettings.api_key_mode === 'server_managed' && !isPaidTier) {
        // Jika batas harian diset 0, gunakan batasan lifetime trial
        const currentTrialCount = userProfile?.trial_count || 0;
        if (currentTrialCount >= (systemSettings.trial_limit || 1)) {
          return NextResponse.json(
            {
              success: false,
              error: `Kuota generate gratis untuk paket kamu telah habis. Silakan upgrade paket untuk melanjutkan.`,
              trialExpired: true,
            },
            { status: 403 }
          );
        }
      }
    }

    // Backend validation for dynamic feature flags (Templates & Custom Stack)
    const templateId = techStack?.id || (body as { templateId?: string })?.templateId || 'starter';
    const isCustom = templateId === 'custom' || techStack?.name?.toLowerCase().includes('custom');

    if (isCustom && !hasTierFeature(userTier, 'custom_stack', systemSettings, Boolean(userProfile?.is_admin))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fitur Racik Custom Tech Stack dikunci untuk paket kamu. Silakan upgrade paket untuk membukanya.',
          featureLocked: 'custom_stack',
        },
        { status: 403 }
      );
    }

    if ((templateId === 'mobile-app' || templateId === 'ai-service') && !hasTierFeature(userTier, 'advanced_templates', systemSettings, Boolean(userProfile?.is_admin))) {
      return NextResponse.json(
        {
          success: false,
          error: `Template arsitektur ini dikunci untuk paket kamu. Silakan upgrade paket untuk membukanya.`,
          featureLocked: 'advanced_templates',
        },
        { status: 403 }
      );
    }

    const userGeminiKey = req.headers.get('x-gemini-api-key') || '';
    const userPreferredModel = req.headers.get('x-gemini-preferred-model') || '';
    if (systemSettings.api_key_mode === 'byok_only' && !userGeminiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API Key belum dimasukkan. Silakan buka menu Pengaturan untuk memasukkan API Key kamu.',
        },
        { status: 401 }
      );
    }

    const systemPrompt = MASTER_PRD_SYSTEM_PROMPT;
    const userPrompt = buildPRDUserPrompt(formData, techStack, language, selectedModules);

    const prdResult = await generatePRDUnified({
      systemSettings,
      userGeminiKey,
      systemPrompt,
      userPrompt,
      isPro: isPaidTier,
      userId: userProfile?.id || userId,
      assignedGeminiSlot: userProfile?.assigned_gemini_slot,
      userPreferredModel: userPreferredModel.trim() || undefined,
    });

    const finalPrdResult: PRDOutput = {
      ...prdResult,
      tech_stack: techStack,
    };

    const isServerKey = !userGeminiKey || isPaidTier || systemSettings.api_key_mode === 'server_managed';

    // Calculate approximate token usage (1 token ~= 3.8 characters for structured technical JSON)
    const promptTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 3.8);
    const outputTokens = Math.ceil(JSON.stringify(finalPrdResult).length / 3.8);
    const tokensUsed = promptTokens + outputTokens;

    if (userProfile && !isPaidTier && systemSettings.api_key_mode === 'server_managed') {
      await adminSupabase
        .from('profiles')
        .update({
          trial_count: (userProfile.trial_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userProfile.id);
    }

    // If server key was used, accumulate token consumption in user profile
    if (userProfile && isServerKey) {
      try {
        const currentTokens = (userProfile as any).total_server_tokens || 0;
        await adminSupabase
          .from('profiles')
          .update({
            total_server_tokens: currentTokens + tokensUsed,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userProfile.id);
      } catch (tokErr) {
        console.warn('Could not update total_server_tokens:', tokErr);
      }
    }

    const slotUsed = finalPrdResult.metadata?.geminiSlotUsed || 'Slot Auto';

    let insertedHistoryId: string | null = null;
    try {
      const { data: insertedRow } = await adminSupabase
        .from('prd_history')
        .insert({
          user_id: userProfile?.id || null,
          title: formData.title || 'Untitled PRD',
          prd_data: finalPrdResult as any,
          model_used: finalPrdResult.metadata?.modelUsed || 'AI Engine',
          tokens_used: tokensUsed,
          is_server_key: isServerKey,
          gemini_slot_used: slotUsed,
        })
        .select('id')
        .single();
      if (insertedRow?.id) {
        insertedHistoryId = insertedRow.id;
      }
    } catch (histErr) {
      console.error('Failed to log prd_history:', histErr);
    }

    return NextResponse.json({
      success: true,
      prdId: insertedHistoryId,
      data: {
        ...finalPrdResult,
        metadata: {
          ...finalPrdResult.metadata,
          prdId: insertedHistoryId,
          tokensUsed,
          isServerKey,
          geminiSlotUsed: slotUsed,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Error in generate-prd:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat PRD';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
