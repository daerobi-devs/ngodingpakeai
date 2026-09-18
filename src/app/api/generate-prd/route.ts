import { NextRequest, NextResponse } from 'next/server';
import { generatePRDUnified } from '@/lib/ai/ai-service';
import { MASTER_PRD_SYSTEM_PROMPT, buildPRDUserPrompt } from '@/lib/gemini/prompts';
import { PRDFormData } from '@/types/prd';
import { createAdminClient } from '@/lib/supabase/admin';
import { SystemSettings, Profile } from '@/lib/supabase/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const formData: PRDFormData = body.formData;
    const userId = body.userId;

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

    if (systemSettings.auth_mode === 'strict_login' && !userProfile) {
      return NextResponse.json(
        { success: false, error: 'Akses dibatasi. Silakan Login menggunakan Akun Google terlebih dahulu.' },
        { status: 401 }
      );
    }

    const isPro = userProfile?.subscription_tier === 'pro' || userProfile?.subscription_tier === 'unlimited';
    if (systemSettings.api_key_mode === 'server_managed' && !isPro) {
      const currentTrialCount = userProfile?.trial_count || 0;
      if (currentTrialCount >= systemSettings.trial_limit) {
        return NextResponse.json(
          {
            success: false,
            error: 'Trial gratis (' + systemSettings.trial_limit + 'x) kamu sudah habis. Silakan Upgrade ke PRO untuk akses unlimited tanpa batas atau gunakan API Key Gemini sendiri.',
            trialExpired: true,
          },
          { status: 403 }
        );
      }
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
    const userPrompt = buildPRDUserPrompt(formData);

    const prdResult = await generatePRDUnified({
      systemSettings,
      userGeminiKey,
      systemPrompt,
      userPrompt,
      isPro,
      userId: userProfile?.id || userId,
      userPreferredModel: userPreferredModel.trim() || undefined,
    });

    if (userProfile && !isPro && systemSettings.api_key_mode === 'server_managed') {
      await adminSupabase
        .from('profiles')
        .update({
          trial_count: (userProfile.trial_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userProfile.id);
    }

    try {
      await adminSupabase
        .from('prd_history')
        .insert({
          user_id: userProfile?.id || null,
          title: formData.title || 'Untitled PRD',
          prd_data: prdResult as any,
          model_used: prdResult.metadata?.modelUsed || 'AI Engine',
        });
    } catch (histErr) {
      console.error('Failed to log prd_history:', histErr);
    }

    return NextResponse.json({
      success: true,
      data: prdResult,
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
