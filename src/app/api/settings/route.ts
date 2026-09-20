import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_PRICING_TIERS, SystemSettings } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_SETTINGS: SystemSettings = {
  id: 'default',
  auth_mode: 'hybrid',
  api_key_mode: 'server_managed',
  monetization_mode: 'freemium',
  ai_provider: 'gemini_direct',
  global_gemini_slot: 'auto',
  pricing_tiers: DEFAULT_PRICING_TIERS,
  announcement_banner: {
    active: false,
    message: '',
    type: 'info',
  },
  trial_limit: 1,
  qris_merchant_name: 'NGODINGPAKEPRD OFFICIAL',
  qris_gopay_number: '0851-2360-7711',
  qris_image_url: '/qris-gopay-placeholder.png',
  payment_gateway_mode: 'manual_qris',
  mpg_gateway_url: 'http://localhost:3000',
  mpg_api_key: 'mpg_live_f89a3c10b7d24e6a8e5c3b1a9f0d7e2c',
  mpg_webhook_secret: 'mandiri-private-gateway-secret-key-change-in-prod',
  pro_price_rp: 49000,
  pro_price_formatted: 'Rp 49.000 / Lifetime Access',
  admin_passcode: 'prdadmin99',
  admin_emails: ['daerobi.devs@gmail.com'],
  studio_access_tier: 'paid_only',
  roadmap_access_tier: 'paid_only',
};

export async function GET() {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('system_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      });
    }

    const sanitizedSlots = Array.isArray(data.gemini_slots)
      ? data.gemini_slots.map((slot: any) => ({
          ...slot,
          key: slot.key ? '●●●●●●●●' : '',
        }))
      : undefined;

    const publicSettings = {
      ...data,
      gemini_slots: sanitizedSlots,
      nine_router_key: data.nine_router_key ? '●●●●●●●●' : undefined,
      gemini_master_keys: data.gemini_master_keys ? '●●●●●●●●' : undefined,
      openrouter_key: data.openrouter_key ? '●●●●●●●●' : undefined,
      mpg_api_key: data.mpg_api_key ? '●●●●●●●●' : undefined,
      mpg_webhook_secret: data.mpg_webhook_secret ? '●●●●●●●●' : undefined,
      admin_passcode: undefined,
    };

    return NextResponse.json({ success: true, settings: publicSettings }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS, note: err });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminPasscode = req.headers.get('x-admin-passcode');
    const envPasscode = process.env.ADMIN_PASSCODE ?? '';

    if (!adminPasscode || !envPasscode || adminPasscode !== envPasscode) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Akses Admin Diperlukan' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const body = await req.json();

    const { id, ...updates } = body;

    if (updates.nine_router_key === '●●●●●●●●') delete updates.nine_router_key;
    if (updates.gemini_master_keys === '●●●●●●●●') delete updates.gemini_master_keys;
    if (updates.openrouter_key === '●●●●●●●●') delete updates.openrouter_key;
    if (updates.mpg_api_key === '●●●●●●●●') delete updates.mpg_api_key;
    if (updates.mpg_webhook_secret === '●●●●●●●●') delete updates.mpg_webhook_secret;

    updates.updated_at = new Date().toISOString();

    let { data, error } = await adminSupabase
      .from('system_settings')
      .upsert({ id: 'default', ...updates })
      .select()
      .single();

    if (error && (error.message?.includes('does not exist') || error.code === '42703')) {
      // Gracefully retry with core columns if optional extension columns are not yet migrated
      const coreUpdates = { ...updates };
      delete coreUpdates.gemini_slots;
      delete coreUpdates.global_gemini_slot;
      delete coreUpdates.pricing_tiers;
      delete coreUpdates.announcement_banner;
      delete coreUpdates.pro_ai_provider;
      delete coreUpdates.pro_model;
      delete coreUpdates.free_ai_provider;
      delete coreUpdates.free_model;
      delete coreUpdates.payment_gateway_mode;
      delete coreUpdates.mpg_gateway_url;
      delete coreUpdates.mpg_api_key;
      delete coreUpdates.mpg_webhook_secret;
      delete coreUpdates.studio_access_tier;

      const retry = await adminSupabase
        .from('system_settings')
        .upsert({ id: 'default', ...coreUpdates })
        .select()
        .single();

      if (!retry.error) {
        return NextResponse.json({
          success: true,
          settings: retry.data,
          note: 'Pengaturan tersimpan. Silakan jalankan supabase_schema.sql di Supabase untuk mengaktifkan kolom multi-slot permanen.',
        });
      }
      return NextResponse.json({ success: false, error: retry.error.message }, { status: 500 });
    }

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : 'Gagal memperbarui pengaturan';
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
