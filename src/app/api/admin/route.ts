import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeOpenAiEndpoint, parseOpenAiChatResponse } from '@/lib/ai/openai-compat';

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE ?? '';
const ADMIN_EMAIL = 'buatintech@gmail.com';

function isAuthorized(req: NextRequest): boolean {
  const passcode = req.headers.get('x-admin-passcode');
  return Boolean(ADMIN_PASSCODE && passcode === ADMIN_PASSCODE);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // Public action: verify passcode only (no data returned)
    if (action === 'verify_passcode') {
      if (isAuthorized(req)) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: 'Passcode salah' }, { status: 401 });
    }

    if (!isAuthorized(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Akses Admin Diperlukan' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    if (action === 'users') {
      const { data, error } = await adminSupabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, users: data });
    }

    if (action === 'orders') {
      const { data, error } = await adminSupabase
        .from('payment_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, orders: data });
    }

    if (action === 'settings_raw') {
      const { data, error } = await adminSupabase
        .from('system_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, settings: data });
    }

    if (action === 'live_monitoring') {
      const { data: recentGenerations } = await adminSupabase
        .from('prd_history')
        .select('id, user_id, title, model_used, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      const { count: totalGenCount } = await adminSupabase
        .from('prd_history')
        .select('*', { count: 'exact', head: true });

      const { data: profilesData } = await adminSupabase
        .from('profiles')
        .select('id, email, full_name, subscription_tier, trial_count, updated_at');

      const profileMap = new Map<string, { email?: string; full_name?: string; tier?: string }>();
      (profilesData || []).forEach((p) => {
        profileMap.set(p.id, { email: p.email, full_name: p.full_name, tier: p.subscription_tier });
      });

      const enrichedGenerations = (recentGenerations || []).map((g) => {
        const prof = g.user_id ? profileMap.get(g.user_id) : undefined;
        return {
          ...g,
          userEmail: prof?.email || (g.user_id ? 'User ID: ' + g.user_id.slice(0, 8) : 'Pengunjung (Guest/Trial)'),
          userName: prof?.full_name || (g.user_id ? 'Member' : 'Tamu / Visitor'),
          userTier: prof?.tier || (g.user_id ? 'free' : 'trial'),
        };
      });

      return NextResponse.json({
        success: true,
        recentGenerations: enrichedGenerations,
        totalGenerations: totalGenCount || 0,
        activeUsersCount: profilesData?.length || 0,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : 'Admin error';
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Akses Admin Diperlukan' }, { status: 401 });
    }

    const body = await req.json();
    const { action, ...payload } = body;
    const adminSupabase = createAdminClient();

    if (action === 'approve_order') {
      const { orderId, userId } = payload;
      const { error: orderErr } = await adminSupabase
        .from('payment_orders')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (orderErr) return NextResponse.json({ success: false, error: orderErr.message }, { status: 500 });

      const { error: profileErr } = await adminSupabase
        .from('profiles')
        .update({ subscription_tier: 'pro', updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (profileErr) return NextResponse.json({ success: false, error: profileErr.message }, { status: 500 });

      return NextResponse.json({ success: true, message: 'Pesanan disetujui & Akun Pro telah aktif!' });
    }

    if (action === 'reject_order') {
      const { orderId, adminNotes } = payload;
      const { error } = await adminSupabase
        .from('payment_orders')
        .update({ status: 'rejected', admin_notes: adminNotes || 'Pembayaran tidak sesuai', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, message: 'Pesanan ditolak' });
    }

    if (action === 'update_user_tier') {
      const { userId, tier, resetTrial } = payload;
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (tier) updates.subscription_tier = tier;
      if (resetTrial) updates.trial_count = 0;

      const { error } = await adminSupabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, message: 'Data user diperbarui' });
    }

    if (action === 'test_ai_endpoint') {
      const { endpointUrl, apiKey, model } = payload;
      const targetUrl = normalizeOpenAiEndpoint(endpointUrl);
      const cleanKey = (apiKey || '').trim();
      const targetModel = (model || 'deepseek-chat').trim();
      const startTime = Date.now();

      try {
        const testReq = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (cleanKey || 'sk-test'),
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [{ role: 'user', content: 'Reply with OK if connection is working.' }],
            max_tokens: 20,
            stream: false,
          }),
          signal: AbortSignal.timeout(15000),
        });

        const latencyMs = Date.now() - startTime;

        if (!testReq.ok) {
          const errText = await testReq.text();
          let parsedError = errText;
          try {
            const errJson = JSON.parse(errText);
            parsedError = errJson?.error?.message || errJson?.error || errText;
          } catch {}

          const errorString = typeof parsedError === 'string' ? parsedError : JSON.stringify(parsedError);
          return NextResponse.json({
            success: false,
            status: testReq.status,
            latencyMs,
            targetUrl,
            error: `[HTTP ${testReq.status}] ${errorString.slice(0, 180)}`,
          });
        }

        const rawText = await testReq.text();
        const { content: reply } = parseOpenAiChatResponse(rawText);

        return NextResponse.json({
          success: true,
          latencyMs,
          targetUrl,
          reply: reply ? reply.slice(0, 120).trim() : 'OK',
        });
      } catch (err: unknown) {
        const latencyMs = Date.now() - startTime;
        const msg = err instanceof Error ? err.message : 'Koneksi gagal atau timeout ke endpoint';
        return NextResponse.json({
          success: false,
          latencyMs,
          targetUrl,
          error: `${msg} (${targetUrl})`,
        });
      }
    }

    if (action === 'test_gemini_slot') {
      const { apiKey, slotId } = payload;
      if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
        return NextResponse.json({ success: false, error: 'API Key masih kosong' }, { status: 400 });
      }

      const cleanKey = apiKey.trim();
      const startTime = Date.now();

      try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
        const listRes = await fetch(listUrl, { signal: AbortSignal.timeout(10000) });
        const latencyMs = Date.now() - startTime;

        if (!listRes.ok) {
          const errText = await listRes.text();
          let parsedMsg = errText;
          try {
            const errObj = JSON.parse(errText);
            parsedMsg = errObj?.error?.message || errText;
          } catch {}
          return NextResponse.json({
            success: false,
            slotId,
            status: 'offline',
            latencyMs,
            error: `[HTTP ${listRes.status}] ${parsedMsg.slice(0, 180)}`,
          });
        }

        const listData = await listRes.json();
        const availableModels: string[] = (listData?.models || [])
          .map((m: any) => m.name?.replace('models/', ''))
          .filter((name: string) =>
            name && (name.includes('gemini') || name.includes('flash') || name.includes('pro'))
          );

        return NextResponse.json({
          success: true,
          slotId,
          status: 'online',
          latencyMs,
          models: availableModels.slice(0, 8),
          lastChecked: new Date().toLocaleTimeString('id-ID'),
        });
      } catch (err: unknown) {
        const latencyMs = Date.now() - startTime;
        const msg = err instanceof Error ? err.message : 'Koneksi timeout atau gagal';
        return NextResponse.json({
          success: false,
          slotId,
          status: 'offline',
          latencyMs,
          error: msg,
        });
      }
    }

    if (action === 'fetch_9router_models') {
      const { endpointUrl, apiKey } = payload;
      const baseUrl = (endpointUrl || 'http://127.0.0.1:2080').replace(/\/v1\/chat\/completions\/?$/, '').replace(/\/+$/, '');
      const modelsUrl = `${baseUrl}/v1/models`;
      const cleanKey = apiKey || 'sk-test';

      try {
        const res = await fetch(modelsUrl, {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + cleanKey,
          },
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const data = await res.json();
          const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
          const models: string[] = rawList.map((m: any) => m.id || m.name || String(m)).filter(Boolean);
          if (models.length > 0) {
            return NextResponse.json({ success: true, models });
          }
        }
      } catch {}

      // Default combo models popular on 9Router
      return NextResponse.json({
        success: true,
        models: [
          'deepseek-chat',
          'deepseek-reasoner',
          'claude-3-5-sonnet-20241022',
          'claude-3-5-haiku-20241022',
          'gpt-4o',
          'gpt-4o-mini',
          'gemini-2.5-flash',
          'gemini-2.5-pro',
        ],
        isFallback: true,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : 'Admin action error';
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
