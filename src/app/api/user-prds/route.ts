import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID diperlukan' }, { status: 400 });
    }

    try {
      const serverSupabase = await createClient();
      const { data: { user } } = await serverSupabase.auth.getUser();
      if (user && user.id !== userId) {
        return NextResponse.json({ success: false, error: 'Akses ditolak: User ID tidak sesuai' }, { status: 403 });
      }
    } catch {}

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('prd_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, prds: data || [] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil riwayat PRD';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { prdId, userId } = body;

    if (!prdId || !userId) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
    }

    try {
      const serverSupabase = await createClient();
      const { data: { user } } = await serverSupabase.auth.getUser();
      if (user && user.id !== userId) {
        return NextResponse.json({ success: false, error: 'Akses ditolak: User ID tidak sesuai' }, { status: 403 });
      }
    } catch {}

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from('prd_history')
      .delete()
      .eq('id', prdId)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'PRD berhasil dihapus' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus PRD';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
