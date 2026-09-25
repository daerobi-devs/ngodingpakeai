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
      .not('title', 'ilike', '[Arsitek]%')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Filter lapis kedua untuk keamanan mutlak: singkirkan log arsitek dari riwayat PRD
    const cleanPrds = (data || []).filter(
      (item: any) => !item.title?.toLowerCase().startsWith('[arsitek]') && item.prd_data?.type !== 'architect'
    );

    return NextResponse.json({ success: true, prds: cleanPrds });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil riwayat PRD';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userId, title, prdData } = body;

    if (!id || !userId) {
      return NextResponse.json({ success: false, error: 'Data id dan userId diperlukan' }, { status: 400 });
    }

    try {
      const serverSupabase = await createClient();
      const { data: { user } } = await serverSupabase.auth.getUser();
      if (user && user.id !== userId) {
        return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 });
      }
    } catch {}

    const adminSupabase = createAdminClient();

    // Cek apakah proyek sudah ada di tabel prd_history
    const { data: existing } = await adminSupabase
      .from('prd_history')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // Perbarui proyek yang sama di tempat tanpa membuat duplikat
      const { error: updateErr } = await adminSupabase
        .from('prd_history')
        .update({
          title: title || 'Untitled PRD',
          prd_data: prdData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }
    } else {
      // Simpan proyek baru
      const { error: insertErr } = await adminSupabase
        .from('prd_history')
        .insert({
          id,
          user_id: userId,
          title: title || 'Untitled PRD',
          prd_data: prdData,
          created_at: new Date().toISOString(),
        });

      if (insertErr) {
        return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'PRD berhasil disinkronisasi' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menyimpan PRD';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let prdId = req.nextUrl.searchParams.get('id') || req.nextUrl.searchParams.get('prdId');
    let userId = req.nextUrl.searchParams.get('userId');

    // Jika tidak di searchParams, baca dari body
    if (!prdId || !userId) {
      try {
        const body = await req.json();
        prdId = prdId || body.prdId || body.id;
        userId = userId || body.userId;
      } catch {
        // Abaikan jika tidak ada body JSON
      }
    }

    if (!prdId || !userId) {
      return NextResponse.json({ success: false, error: 'Data id dan userId diperlukan' }, { status: 400 });
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
