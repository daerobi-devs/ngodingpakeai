import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createMpgInvoice, getMpgConfig } from '@/lib/mpg/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, userName, amount, amountFormatted, tierId, paymentMethod, checkoutMode } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'User ID dan Email wajib disertakan' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Fetch system settings to check payment mode
    const { data: settings } = await adminSupabase
      .from('system_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    const mpgConfig = getMpgConfig(settings);
    const isManualRequested = settings?.payment_gateway_mode === 'manual_qris' || checkoutMode === 'manual';

    let randomCode = Math.floor(1000 + Math.random() * 9000);
    let orderCode = 'PRD-' + randomCode;

    const insertData: Record<string, any> = {
      user_id: userId,
      user_email: userEmail,
      user_name: userName || userEmail.split('@')[0],
      order_code: orderCode,
      amount: amount || 49000,
      amount_formatted: amountFormatted || 'Rp 49.000',
      payment_method: isManualRequested ? 'Manual GoPay / WhatsApp' : (paymentMethod || 'QRIS Dinamis Mandiri'),
      status: 'pending',
    };
    if (tierId) {
      insertData.admin_notes = `Tier: ${tierId.toUpperCase()}${isManualRequested ? ' (Manual GoBiz)' : ''}`;
    }

    // 2. If Mandiri Private Gateway is active and not manual mode, request dynamic QRIS invoice
    if (mpgConfig.isMpgActive && !isManualRequested) {
      const generatedOrderId = `INV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const packageName = tierId === 'plus' ? 'Paket PLUS (10 PRD/Hari)' : 'Paket PRO (50 PRD/Hari)';
      const mpgResult = await createMpgInvoice(
        {
          orderId: generatedOrderId,
          amount: amount || 49000,
          customerName: userName || userEmail.split('@')[0],
          customerEmail: userEmail,
          items: [
            {
              name: packageName,
              price: Math.round(amount || 49000),
              quantity: 1,
            },
          ],
        },
        settings
      );

      if (mpgResult.success && mpgResult.data) {
        insertData.order_code = mpgResult.data.order_id;
        insertData.gateway_order_id = mpgResult.data.order_id;
        insertData.amount = mpgResult.data.base_amount;
        insertData.final_amount = mpgResult.data.final_amount;
        insertData.unique_code = mpgResult.data.unique_code;
        insertData.amount_formatted = `Rp ${mpgResult.data.final_amount.toLocaleString('id-ID')}`;
        insertData.payment_method = 'QRIS Dinamis Mandiri';
        insertData.qr_string = mpgResult.data.qr_string;
        insertData.checkout_url = mpgResult.data.checkout_url;
        insertData.expired_at = mpgResult.data.expired_at;
        insertData.admin_notes = `Tier: ${(tierId || 'pro').toUpperCase()} (MPG Dinamis)`;
      } else {
        console.warn('[Orders API] MPG Invoice creation failed, falling back to manual QRIS:', mpgResult.error);
      }
    }

    // 3. Insert order with resilient schema fallback if new columns don't exist yet
    let res = await adminSupabase
      .from('payment_orders')
      .insert(insertData)
      .select()
      .single();

    if (res.error) {
      // Fallback: omit new MPG columns if migration hasn't been applied yet
      const fallbackData = {
        user_id: insertData.user_id,
        user_email: insertData.user_email,
        user_name: insertData.user_name,
        order_code: insertData.order_code,
        amount: insertData.amount,
        amount_formatted: insertData.amount_formatted,
        payment_method: insertData.payment_method,
        status: insertData.status,
        admin_notes: insertData.admin_notes,
      };

      res = await adminSupabase
        .from('payment_orders')
        .insert(fallbackData)
        .select()
        .single();
    }

    if (res.error) {
      return NextResponse.json({ success: false, error: res.error.message }, { status: 500 });
    }

    // Merge in-memory dynamic data in case database fallback omitted the columns
    const finalOrder = {
      ...res.data,
      qr_string: insertData.qr_string || res.data?.qr_string,
      final_amount: insertData.final_amount || res.data?.final_amount,
      unique_code: insertData.unique_code || res.data?.unique_code,
      expired_at: insertData.expired_at || res.data?.expired_at,
      checkout_url: insertData.checkout_url || res.data?.checkout_url,
    };

    return NextResponse.json({
      success: true,
      order: finalOrder,
      checkoutUrl: finalOrder.checkout_url,
      checkout_url: finalOrder.checkout_url,
      qr_string: finalOrder.qr_string,
      mode: isManualRequested ? 'manual' : (mpgConfig.isHosted ? 'hosted' : 'headless'),
    });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : 'Gagal membuat pesanan';
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID diperlukan' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('payment_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders: data });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : 'Gagal mengambil data pesanan';
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, userId, action } = body;

    if (!orderId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Order ID dan User ID diperlukan' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    if (action === 'cancel') {
      const { data, error } = await adminSupabase
        .from('payment_orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, order: data });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak valid' }, { status: 400 });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : 'Gagal memperbarui status pesanan';
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
