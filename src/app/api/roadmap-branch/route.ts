import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SystemSettings, Profile } from '@/lib/supabase/types';
import { normalizeOpenAiEndpoint, parseOpenAiChatResponse, repairAndParseJSON } from '@/lib/ai/openai-compat';
import { createKeyPool, resolveGeminiKeysAndSlot, MODEL_LADDER } from '@/lib/gemini/gemini-client';
import { RoadmapSubBranch } from '@/types/roadmap';

const BRANCH_SYSTEM_PROMPT = `Anda adalah Principal Technical Curriculum & Career Architect.
Tugas Anda adalah membedah dan memperdalam satu topik keterampilan menjadi 2 sampai 3 sub-cabang keahlian yang sangat spesifik, aplikatif, dan berstandar industri.

ATURAN WAJIB:
1. STRICT ZERO EMOJI: Dilarang keras menggunakan emoji atau simbol grafis apapun.
2. Output HARUS berupa JSON murni valid tanpa backtick markdown:
{
  "branches": [
    {
      "id": "string",
      "title": "string (Nama sub-cabang keahlian spesifik)",
      "summary": "string (Penjelasan mengapa materi ini krusial)",
      "estimatedHours": "string (misal: '4-6 Jam')",
      "actionSteps": ["string (Langkah aksi konkret 1)", "string (Langkah aksi konkret 2)"],
      "keyTopics": ["string (Konsep/keyword)"],
      "curatedLinks": [
        {
          "title": "string",
          "url": "string (URL resmi/github/roadmap.sh)",
          "type": "doc"
        }
      ]
    }
  ]
}
3. Bahasa pengantar adalah Bahasa Indonesia profesional dengan istilah teknis baku.`;

function stripEmojis(text: string): string {
  if (!text) return '';
  return text.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nodeId,
      cardId,
      nodeTitle,
      parentTitle,
      nodeCategory = 'Kompetensi Teknis',
      roadmapGoal = 'Penguasaan Teknologi',
      existingBranches = [],
      userId,
    } = body;

    if (!nodeTitle) {
      return NextResponse.json(
        { success: false, error: 'Informasi topik cabang tidak ditemukan.' },
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

    if (userProfile?.is_banned) {
      return NextResponse.json(
        { success: false, error: 'Akun Anda telah dinonaktifkan oleh administrator.' },
        { status: 403 }
      );
    }

    const userGeminiKey = req.headers.get('x-gemini-api-key') || '';
    const userPreferredModel = req.headers.get('x-gemini-preferred-model') || '';

    const userPrompt = `SASARAN ROADMAP: "${roadmapGoal}"
${parentTitle ? `MODUL INDUK: "${parentTitle}"` : ''}
KATEGORI / FOKUS: "${nodeCategory}"
TOPIK SPESIFIK YANG AKAN DICABANGKAN KE SAMPING: "${nodeTitle}"
${existingBranches.length > 0 ? `Sub-cabang yang sudah ada pada topik ini: ${existingBranches.join(', ')}\n(Jangan menduplikasi cabang yang sudah ada)` : ''}

Silakan bedah topik spesifik di atas menjadi 2 atau 3 sub-cabang materi teknis lanjutan yang lebih mendalam, terarah, dan aplikatif.
Setiap cabang harus memiliki:
- title: nama materi spesifik lanjutan (bukan pengulangan topik induk)
- summary: penjelasan jelas 1-2 kalimat mengapa materi lanjutan ini krusial dikuasai
- estimatedHours: estimasi jam praktis (misal '3-5 Jam')
- actionSteps: 2-3 langkah praktik kode/konsep yang terarah
- keyTopics: 2-3 keywords teknologi/tooling
- curatedLinks: 1 tautan dokumentasi nyata yang relevan.

Format output hanya JSON valid tanpa emoji.`;

    const isPro = userProfile?.subscription_tier === 'pro' ||
                  userProfile?.subscription_tier === 'plus' ||
                  userProfile?.subscription_tier === 'unlimited' ||
                  Boolean(userProfile?.is_admin);

    const provider = isPro
      ? (systemSettings.pro_ai_provider || systemSettings.ai_provider || 'nine_router')
      : (systemSettings.free_ai_provider || systemSettings.ai_provider || 'gemini_direct');

    const preferredModel = userPreferredModel?.trim() || (isPro ? systemSettings.pro_model : systemSettings.free_model);

    let rawOutput = '';

    if (provider === 'nine_router') {
      const endpoint = normalizeOpenAiEndpoint(systemSettings.nine_router_url);
      const apiKey = systemSettings.nine_router_key || '9router-local';
      const model = preferredModel || systemSettings.nine_router_model || 'deepseek-chat';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: BRANCH_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 3000,
          temperature: 0.3,
        }),
      });

      if (!res.ok) throw new Error(`9Router error ${res.status}`);
      const rawText = await res.text();
      const parsed = parseOpenAiChatResponse(rawText);
      rawOutput = parsed.content;
    } else if (provider === 'openrouter') {
      const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      const apiKey = systemSettings.openrouter_key;
      const model = preferredModel || systemSettings.openrouter_model || 'anthropic/claude-3.5-sonnet';

      if (!apiKey) throw new Error('OpenRouter API Key belum dikonfigurasi.');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: BRANCH_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1200,
          temperature: 0.3,
        }),
      });

      if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);
      const data = await res.json();
      rawOutput = data?.choices?.[0]?.message?.content || '';
    } else {
      // Gemini Direct fallback ladder
      let keyList: string[] = [];
      let slotPreferredModel: string | undefined = undefined;

      if (systemSettings.api_key_mode === 'server_managed') {
        const resolved = resolveGeminiKeysAndSlot(systemSettings, userId, userProfile?.assigned_gemini_slot);
        keyList = resolved.keys;
        slotPreferredModel = resolved.slotPreferredModel;
        if (keyList.length === 0) {
          const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean);
          keyList = envKeys;
        }
      } else if (userGeminiKey) {
        keyList = [userGeminiKey.trim()];
      }

      if (keyList.length === 0) {
        throw new Error('API Key belum tersedia di sistem.');
      }

      const pool = createKeyPool(keyList);
      const chosenModel = slotPreferredModel?.trim() || preferredModel || 'gemini-2.5-flash';
      const ladder = [chosenModel, ...MODEL_LADDER.filter((m) => m !== chosenModel)];

      let success = false;
      let lastErr = '';
      let parsedBranchJson: any = null;

      for (const curModel of ladder) {
        const activeKey = pool.getAvailableKey();
        if (!activeKey) break;

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${curModel}:generateContent?key=${activeKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: BRANCH_SYSTEM_PROMPT }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
                maxOutputTokens: 1200,
              },
            }),
            signal: AbortSignal.timeout(45000),
          });

          if (!res.ok) {
            lastErr = `HTTP ${res.status}`;
            continue;
          }

          const geminiData = await res.json();
          const cand = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (cand) {
            try {
              parsedBranchJson = repairAndParseJSON(cand);
              rawOutput = cand;
              success = true;
              break;
            } catch (pErr: any) {
              lastErr = pErr?.message;
            }
          }
        } catch (e: any) {
          lastErr = e?.message || 'Error';
        }
      }
    }

    let parsedJson = rawOutput ? (() => {
      try {
        return repairAndParseJSON(rawOutput);
      } catch {
        return null;
      }
    })() : null;

    if (!parsedJson) {
      parsedJson = {
        branches: [
          {
            title: `Pendalaman Materi: ${(nodeTitle || 'Materi').slice(0, 30)}`,
            summary: `Pemahaman menyeluruh mengenai dasar dan penerapan praktis untuk topik ${nodeTitle || 'Materi'}.`,
            estimatedHours: '2-4 Jam',
            actionSteps: [
              `Pelajari dokumentasi inti terkait ${nodeTitle || 'materi ini'}`,
              'Praktikkan latihan kode atau studi kasus mandiri',
              'Evaluasi hasil implementasi secara bertahap',
            ],
            keyTopics: ['Konsep Utama', 'Implementasi Langsung', 'Best Practices'],
            curatedLinks: [
              { title: 'Dokumentasi Resmi & Rujukan Terpercaya', url: 'https://roadmap.sh', type: 'doc' },
            ],
          },
        ],
      };
    }
    const rawBranches = Array.isArray(parsedJson?.branches) ? parsedJson.branches : [];

    const branches: RoadmapSubBranch[] = rawBranches.map((b: any, bIdx: number) => ({
      id: `${cardId || nodeId || 'sub'}-deep-${Date.now()}-${bIdx + 1}`,
      title: stripEmojis(b.title || `Sub-Keahlian Baru ${bIdx + 1}`),
      summary: stripEmojis(b.summary || `Penguasaan praktis materi ${b.title || ''}`),
      estimatedHours: stripEmojis(b.estimatedHours || '3-5 Jam'),
      actionSteps: Array.isArray(b.actionSteps) ? b.actionSteps.map(stripEmojis).filter(Boolean) : [],
      keyTopics: Array.isArray(b.keyTopics) ? b.keyTopics.map(stripEmojis).filter(Boolean) : [],
      curatedLinks: Array.isArray(b.curatedLinks)
        ? b.curatedLinks.map((l: any) => ({
            title: stripEmojis(l.title || 'Dokumentasi Resmi'),
            url: l.url || 'https://roadmap.sh',
            type: l.type || 'doc',
          }))
        : [],
      status: 'not_started' as const,
      children: [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        nodeId,
        cardId: cardId || null,
        branches,
      },
    });
  } catch (error: unknown) {
    console.error('Error in roadmap-branch:', error);
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan membedah cabang';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
