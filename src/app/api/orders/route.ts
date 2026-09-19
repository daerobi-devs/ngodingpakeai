import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, userName, amount, amountFormatted, tierId, paymentMethod } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'User ID dan Email wajib disertakan' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderCode = 'PRD-' + randomCode;

    const insertData: Record<string, any> = {
      user_id: userId,
      user_email: userEmail,
      user_name: userName || userEmail.split('@')[0],
      order_code: orderCode,
      amount: amount || 49000,
      amount_formatted: amountFormatted || 'Rp 49.000',
      payment_method: paymentMethod || 'QRIS GoPay',
      status: 'pending',
    };
    if (tierId) {
      insertData.admin_notes = `Tier: ${tierId.toUpperCase()}`;
    }

    const { data, error } = await adminSupabase
      .from('payment_orders')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
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
