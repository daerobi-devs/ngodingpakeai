import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SystemSettings } from '@/lib/supabase/types';
import { generateBlueprintUnified } from '@/lib/ai/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prdTitle, archetype, features = [], techStack } = body;

    if (!prdTitle) {
      return NextResponse.json(
        { success: false, error: 'Judul PRD wajib diisi.' },
        { status: 400 }
      );
    }

    // Load System Settings
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
      // Use fallback defaults
    }

    const userGeminiKey = req.headers.get('x-gemini-api-key') || '';
    const userPreferredModel = req.headers.get('x-gemini-preferred-model') || undefined;

    let isPro = false;
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: { user } } = await adminSupabase.auth.getUser(token);
        if (user) {
          const { data: profile } = await adminSupabase
            .from('profiles')
            .select('subscription_tier, is_admin')
            .eq('id', user.id)
            .single();
          isPro = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'plus' || profile?.subscription_tier === 'unlimited' || Boolean(profile?.is_admin);
        }
      }
    } catch {
      // ignore
    }

    const blueprint = await generateBlueprintUnified({
      systemSettings,
      userGeminiKey,
      prdTitle,
      archetype,
      features,
      techStack,
      userPreferredModel,
      isPro,
    });

    return NextResponse.json({
      success: true,
      diagrams: {
        system_flowchart: blueprint.system_flowchart,
        user_journey_flow: blueprint.user_journey_flow,
        database_erd: blueprint.database_erd,
        sql_migration_script: blueprint.sql_migration_script,
      },
      modelUsed: blueprint.modelUsed,
    });
  } catch (error: any) {
    console.error('generate-blueprint error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses blueprint arsitektur & SQL.' },
      { status: 500 }
    );
  }
}
