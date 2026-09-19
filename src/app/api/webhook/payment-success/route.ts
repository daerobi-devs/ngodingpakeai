import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyMpgSignature, getMpgConfig } from '@/lib/mpg/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let rawBody = '';
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json(
      { status: 'error', error: 'BAD_REQUEST', message: 'Gagal membaca payload webhook' },
      { status: 400 }
    );
  }

  // 1. Extract Signature from Header (Supports both X-Signature and X-Callback-Signature)
  const incomingSignature =
    req.headers.get('x-signature') ||
    req.headers.get('x-callback-signature') ||
    req.headers.get('X-Signature') ||
    req.headers.get('X-Callback-Signature');

  const adminSupabase = createAdminClient();

  // 2. Fetch Gateway Settings from database
  let webhookSecret = process.env.MPG_WEBHOOK_SECRET || 'mandiri-private-gateway-secret-key-change-in-prod';
  try {
    const { data: settings } = await adminSupabase
      .from('system_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (settings) {
      const config = getMpgConfig(settings);
      webhookSecret = config.webhookSecret;
    }
  } catch (err) {
    console.warn('[MPG Webhook] Failed to fetch system_settings for secret, using fallback:', err);
  }

  // 3. Verify HMAC-SHA256 Signature
  const isValidSignature = verifyMpgSignature(rawBody, incomingSignature, webhookSecret);
  if (!isValidSignature) {
    console.warn('[MPG Webhook] Unauthorized request: Invalid HMAC-SHA256 signature.');
    return NextResponse.json(
      {
        status: 'error',
        error: 'INVALID_SIGNATURE',
        message: 'Tanda tangan digital HMAC-SHA256 tidak valid atau tidak cocok.',
      },
      { status: 401 }
    );
  }

  // 4. Parse Webhook JSON Payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { status: 'error', error: 'MALFORMED_JSON', message: 'Payload webhook bukan format JSON valid' },
      { status: 400 }
    );
  }

  const {
    event = 'payment.success',
    order_id,
    amount,
    detected_bank,
    payment_method,
    paid_at,
  } = payload;

  if (!order_id) {
    return NextResponse.json(
      { status: 'error', error: 'MISSING_ORDER_ID', message: 'Parameter order_id tidak ditemukan' },
      { status: 400 }
    );
  }

  // 5. Lookup Order in payment_orders table
  const { data: order, error: orderLookupErr } = await adminSupabase
    .from('payment_orders')
    .select('*')
    .or(`order_code.eq.${order_id},gateway_order_id.eq.${order_id}`)
    .maybeSingle();

  if (orderLookupErr) {
    console.error('[MPG Webhook] Database lookup error:', orderLookupErr);
    return NextResponse.json(
      { status: 'error', error: 'DATABASE_ERROR', message: orderLookupErr.message },
      { status: 500 }
    );
  }

  if (!order) {
    console.warn(`[MPG Webhook] Order ID ${order_id} tidak ditemukan di database payment_orders.`);
    // Return 200 OK so gateway doesn't retry unnecessarily for non-existent order
    return NextResponse.json({
      status: 'ok',
      warning: 'ORDER_NOT_FOUND',
      message: `Pesanan ${order_id} tidak ditemukan di sistem. Notifikasi dicatat.`,
    });
  }

  // 6. Idempotency Check: Don't re-activate if already processed
  if (order.status === 'approved' || order.status === 'paid') {
    return NextResponse.json({
      success: true,
      status: 'ok',
      message: `Pesanan ${order_id} sudah diproses sebelumnya (Idempotent). Tidak ada perubahan ganda.`,
    });
  }

  // 7. Determine Target Subscription Tier
  let grantedTier: 'plus' | 'pro' = 'pro';
  if (order.tier_id === 'plus' || order.admin_notes?.toLowerCase().includes('tier: plus')) {
    grantedTier = 'plus';
  }

  const durationDays = 30; // Default 30 hari
  const now = Date.now();
  const paidTimestamp = paid_at ? new Date(paid_at).toISOString() : new Date().toISOString();

  // 8. Update Order Status to 'approved' (and track detected bank / method)
  const updateOrderPayload: Record<string, any> = {
    status: 'approved',
    detected_bank: detected_bank || payment_method || 'QRIS_NOTIFICATION',
    paid_at: paidTimestamp,
    updated_at: new Date().toISOString(),
  };

  const { error: updateOrderErr } = await adminSupabase
    .from('payment_orders')
    .update(updateOrderPayload)
    .eq('id', order.id);

  if (updateOrderErr) {
    console.error('[MPG Webhook] Failed to update order status:', updateOrderErr);
    return NextResponse.json(
      { success: false, status: 'error', error: 'DATABASE_ERROR', message: updateOrderErr.message },
      { status: 500 }
    );
  }

  // 9. Activate User Subscription in profiles table (Extend if already active)
  if (order.user_id) {
    try {
      const { data: currentProfile } = await adminSupabase
        .from('profiles')
        .select('pro_expires_at, subscription_tier')
        .eq('id', order.user_id)
        .single();

      let newExpiresAt: string;
      const currentExpires = currentProfile?.pro_expires_at ? new Date(currentProfile.pro_expires_at).getTime() : 0;

      if (currentExpires > now) {
        // Extend from current active expiration date
        newExpiresAt = new Date(currentExpires + durationDays * 24 * 60 * 60 * 1000).toISOString();
      } else {
        // Fresh activation for 30 days from now
        newExpiresAt = new Date(now + durationDays * 24 * 60 * 60 * 1000).toISOString();
      }

      await adminSupabase
        .from('profiles')
        .update({
          subscription_tier: grantedTier,
          pro_expires_at: newExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.user_id);
    } catch (profileErr) {
      console.error('[MPG Webhook] Failed to update user profile:', profileErr);
    }
  }

  // 10. Return standard 200 OK with success: true
  return NextResponse.json({
    success: true,
    status: 'ok',
    message: `Pembayaran ${order_id} sebesar Rp ${amount || order.amount} berhasil diverifikasi. Akun ${grantedTier.toUpperCase()} telah aktif!`,
    data: {
      order_id,
      tier: grantedTier,
      duration_days: durationDays,
      status: 'PAID',
    },
  });
}
