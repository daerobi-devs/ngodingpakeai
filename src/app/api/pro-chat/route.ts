import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SystemSettings } from '@/lib/supabase/types';
import { getKeysFromSettings, createKeyPool, MODEL_LADDER } from '@/lib/gemini/gemini-client';
import { normalizeOpenAiEndpoint, parseOpenAiChatResponse } from '@/lib/ai/openai-compat';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, action = 'chat', userId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, error: 'Pesan obrolan tidak boleh kosong' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    let systemSettings: SystemSettings = {
      id: 'default',
      auth_mode: 'hybrid',
      api_key_mode: 'server_managed',
      monetization_mode: 'freemium',
      ai_provider: 'gemini_direct',
      trial_limit: 1,
      pro_price_rp: 49000,
      pro_price_formatted: 'Rp 49.000 / Lifetime Access',
    };

    try {
      const { data } = await adminSupabase.from('system_settings').select('*').eq('id', 'default').single();
      if (data) systemSettings = data as SystemSettings;
    } catch {}

    // Verify PRO user privilege if strict
    if (userId) {
      try {
        const { data: prof } = await adminSupabase.from('profiles').select('subscription_tier').eq('id', userId).single();
        const isPro = prof?.subscription_tier === 'pro' || prof?.subscription_tier === 'unlimited';
        if (!isPro && systemSettings.monetization_mode === 'paywall_strict') {
          return NextResponse.json(
            { success: false, error: 'Fitur AI Architect Brainstorming hanya tersedia untuk akun PRO.' },
            { status: 403 }
          );
        }
      } catch {}
    }

    // Resolve API keys
    const headerKey = req.headers.get('x-gemini-api-key') || '';
    let keyList = getKeysFromSettings(systemSettings, userId);
    if (keyList.length === 0) {
      const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
      keyList = envKeys;
    }
    if (headerKey.trim()) {
      keyList = [headerKey.trim(), ...keyList];
    }

    if (keyList.length === 0) {
      return NextResponse.json({ success: false, error: 'API Key AI tidak tersedia' }, { status: 500 });
    }

    const keyPool = createKeyPool(keyList);
    const activeKey = keyPool.getAvailableKey() || keyList[0];

    // Support client preferred model header
    const preferredModelHeader = req.headers.get('x-gemini-preferred-model');

    const CHAT_SYSTEM_INSTRUCTION = `Kamu adalah Technical Co-Founder & AI Product Architect yang cerdas, ramah, dan interaktif.

ATURAN KOMUNIKASI (SANGAT PENTING):
1. JANGAN PERNAH MENJAWAB DENGAN ESSAY PANJANG ATAU MONOLOG TEKNIS BESAR! Jawaban yang terlalu panjang membuat user terbebani.
2. Jawablah seperti layaknya obrolan AI normal (seperti ChatGPT / manusia): santai, ringkas, padat, dan to-the-point (maksimal 2-3 paragraf pendek saja).
3. Sambut ide pengguna dengan antusias, berikan 1-2 masukan kunci yang tajam, lalu ajukan 1 atau 2 pertanyaan pemantik yang relevan agar tercipta dialog dua arah yang hidup.
4. Jangan langsung menjabarkan seluruh arsitektur lengkap atau tabel database di chat awal. Fokuslah mendengarkan dan menggali kebutuhan pengguna langkah demi langkah.
5. Gunakan Bahasa Indonesia yang bersahabat, profesional, dan menyenangkan.`;

    const buildExtractPrompt = (conversationSummary: string) => `Berdasarkan rangkuman diskusi ide produk berikut:

${conversationSummary}

Tugasmu adalah menyusun draf formulir PRD lengkap 7 KATEGORI ke dalam objek JSON murni.
Pastikan SEMUA field terisi secara bermakna, spesifik, realistis, dan kontekstual sesuai produk yang dibahas. Jika di percakapan ada bagian yang belum sempat dibahas tuntas (misal rollout, metrics, atau guardrails), gunakan kecerdasan domain terbaikmu untuk melengkapinya secara profesional sehingga TIDAK ADA SATUPUN FIELD YANG KOSONG.

Format output HARUS berupa JSON murni dengan struktur persis seperti ini:
{
  "title": "Nama inisiatif produk yang jelas dan profesional",
  "opportunity_framing": {
    "core_problem": "Masalah inti terukur yang dihadapi target pengguna",
    "working_hypothesis": "Hipotesis solusi dan mekanisme nilai yang dihadirkan",
    "strategy_fit": "Target pengguna spesifik dan keselarasan strategis produk"
  },
  "boundaries": {
    "scope": "- Fitur 1\\n- Fitur 2\\n- Fitur 3\\n- Fitur 4",
    "non_goals": "- Hal yang sengaja tidak dibuat di versi MVP 1\\n- Hal yang di luar cakupan 2"
  },
  "success_measurement": {
    "offline_golden_set": "Data uji validasi fungsional dan skenario pengujian utama",
    "human_review": "Mekanisme audit manual oleh pengelola/operator",
    "online_metrics": "KPI kuantitatif keberhasilan (misal konversi, retensi, responsivitas)"
  },
  "rollout_plan": {
    "exposure": "Tahapan persentase rilis pengguna (Internal -> Beta Terbatas -> Publik 100%)",
    "duration": "Estimasi durasi uji coba hingga peluncuran penuh",
    "segments_gates": "Kriteria kelayakan sebelum rilis ke publik luas"
  },
  "risk_management": {
    "detection": "Cara deteksi dini kendala teknis atau komplain user",
    "fallback_kill_switch": "Mekanisme cadangan dan tombol darurat jika terjadi kegagalan sistem"
  },
  "ownership_action": {
    "primary_owner": "Penanggung jawab utama (Product Owner & Tech Lead)",
    "decision_points": "Jadwal evaluasi keputusan berkala"
  },
  "ai_specific": {
    "behavior_contract": "GOOD:\\n1. [Karakteristik wajib antarmuka & alur]\\n2. [Karakteristik wajib]\\n\\nREJECT:\\n1. [Hal yang dilarang]\\n2. [Hal yang dilarang]",
    "guardrails": "Batasan keamanan data, privasi pengguna, dan keandalan sistem"
  }
}

Balas HANYA dengan objek JSON murni tanpa pembungkus markdown apapun.`;

    // If 9Router is configured as PRO provider
    const isNineRouter = systemSettings.pro_ai_provider === 'nine_router' || (systemSettings.ai_provider === 'nine_router' && !systemSettings.pro_ai_provider);

    if (isNineRouter && systemSettings.nine_router_key) {
      const endpoint = normalizeOpenAiEndpoint(systemSettings.nine_router_url);
      const model = systemSettings.pro_model || systemSettings.nine_router_model || 'deepseek-chat';

      if (action === 'extract_to_form') {
        const conversationSummary = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
        const extractPrompt = buildExtractPrompt(conversationSummary);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + systemSettings.nine_router_key,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: extractPrompt }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            stream: false,
          }),
        });

        if (res.ok) {
          const rawText = await res.text();
          const { content } = parseOpenAiChatResponse(rawText);
          const cleanJson = (content || '{}').replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
          try {
            const parsed = JSON.parse(cleanJson);
            return NextResponse.json({ success: true, data: parsed });
          } catch {}
        }
      } else {
        const chatMessages = [
          {
            role: 'system',
            content: CHAT_SYSTEM_INSTRUCTION,
          },
          ...messages,
        ];

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + systemSettings.nine_router_key,
          },
          body: JSON.stringify({
            model,
            messages: chatMessages,
            temperature: 0.7,
            stream: false,
          }),
        });

        if (res.ok) {
          const rawText = await res.text();
          const { content: reply } = parseOpenAiChatResponse(rawText);
          return NextResponse.json({ success: true, reply: reply || 'Maaf, respon tidak tersedia.' });
        }
      }
    }

    // Default: Fast Gemini Engine
    const targetModel = preferredModelHeader || systemSettings.pro_model || MODEL_LADDER[0]; // gemini-3.8-flash or configured

    if (action === 'extract_to_form') {
      const conversationSummary = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
      const extractPrompt = buildExtractPrompt(conversationSummary);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${activeKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: extractPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ success: false, error: errText }, { status: res.status });
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
      const parsed = JSON.parse(cleanJson);
      return NextResponse.json({ success: true, data: parsed });
    }

    // Normal Chat action with Gemini
    const geminiContents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${activeKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: CHAT_SYSTEM_INSTRUCTION }] },
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ success: false, error: errText }, { status: res.status });
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Terima kasih atas diskusinya!';
    return NextResponse.json({ success: true, reply });

  } catch (error: unknown) {
    console.error('Error in pro-chat API:', error);
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
