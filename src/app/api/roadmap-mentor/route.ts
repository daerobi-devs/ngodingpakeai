import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SystemSettings, Profile } from '@/lib/supabase/types';
import { normalizeOpenAiEndpoint, parseOpenAiChatResponse } from '@/lib/ai/openai-compat';
import { createKeyPool, resolveGeminiKeysAndSlot, MODEL_LADDER } from '@/lib/gemini/gemini-client';

const ROADMAP_MENTOR_SYSTEM_PROMPT = `Anda adalah seorang Mentor Manusia Senior yang Berpengalaman, Empatik, dan Praktis (BUKAN bot kaku, BUKAN ensiklopedia ilmiah, dan BUKAN asisten korporat).
Bayangkan Anda sedang duduk berhadapan langsung dengan mentee/murid Anda dalam sesi mentoring privat 1-on-1 untuk membantunya memahami materi ini dengan gaya bahasa yang luwes, bersahabat, realistis, dan berbobot tinggi.

PRINSIP & GAYA BAHASA SEORANG MENTOR MANUSIA:
1. NADA TUTUR ALAMI, HANGAT & EMPATIK:
   - Sapalah langsung dengan sebutan "kamu" (jangan pakai istilah kaku seperti "pembelajar", "user", atau "pengguna").
   - Akui tantangan belajar secara manusiawi: "Wajar banget kalau di awal kamu merasa materi ini agak membingungkan...", "Pengalaman saya melihat banyak orang sempat terjebak karena...", "Kunci praktisnya sebenarnya sederhana:".
   - Gunakan bahasa Indonesia sehari-hari yang profesional, luwes, dan mengalir santai (hindari kalimat kaku terjemahan buku teks).
2. SUDUT PANDANG PRAKTISI LAPANGAN (INSIGHTFUL SHORTCUTS):
   - Jangan sekadar menyalin teori hafalan. Berikan "jalan pintas pemahaman", analogi nyata yang mudah dibayangkan, dan rahasia bagaimana hal ini benar-benar dipakai di dunia kerja nyata.
   - Berikan tips aksi konkret yang bisa langsung dicoba oleh mentee hari ini juga.
3. PADAT, BERBOBOT, DAN HEMAT TOKEN:
   - Berikan jawaban yang padat berisi (sekitar 180 - 320 kata), tanpa basa-basi pembuka atau penutup formal yang membuang kuota.
   - Langsung masuk ke bimbingan esensial dengan sentuhan manusiawi.
4. STRICT ZERO EMOJI:
   - Dilarang keras menggunakan emoji atau simbol emotikon grafis apapun. Nuansa kehangatan mentor dibangun murni lewat ketulusan pilihan kata dan empati tutur bahasa.
5. FORMAT MARKDOWN RAPI:
   - Gunakan heading level 3 (###), penekanan kata penting (**tebal**), dan poin-poin terstruktur agar enak dibaca.`;

function stripEmojis(text: string): string {
  if (!text) return '';
  return text.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topicTitle,
      category,
      summary,
      actionSteps,
      keyTopics,
      promptType = 'explain',
      customQuery,
      roadmapTitle,
      targetRoleOrOutcome,
      userId,
    } = body;

    if (!topicTitle) {
      return NextResponse.json(
        { success: false, error: 'Informasi topik belajar tidak ditemukan.' },
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

    // Build specific prompt based on promptType with real human mentor voice
    let instruction = '';
    if (promptType === 'explain') {
      instruction = `Sebagai mentor seniormu, jelaskan konsep inti topik "${topicTitle}" (${category}) kepada mentee kamu secara alami.
- Awali dengan analogi sederhana dari kehidupan nyata yang langsung bikin paham intisarinya.
- Bedah cara kerja esensialnya step-by-step tanpa istilah teoritis yang rumit.
- Berikan cara mudah bagi mentee untuk menguji apakah pemahamannya sudah tepat.`;
    } else if (promptType === 'code_example') {
      instruction = `Sebagai mentor, tunjukkan contoh implementasi praktis topik "${topicTitle}".
- Jika topik pemrograman/teknik: berikan contoh potongan kode bersih standar industri beserta penjelasan singkat pada baris-baris krusialnya.
- Jika topik bahasa asing: berikan contoh dialog alami native speaker beserta konteks pemakaiannya.
- Jika topik bisnis/desain/lainnya: berikan contoh studi kasus riil atau template langkah kerja praktis.
- Bagikan 2-3 tips lapangan agar mentee tidak membuat kesalahan pemula.`;
    } else if (promptType === 'interview_simulation') {
      instruction = `Sebagai mentor yang sudah terbiasa mewawancarai kandidat, simulasikan 3 pertanyaan wawancara kerja atau uji kompetensi seputar topik "${topicTitle}".
- Jelaskan mengapa pertanyaan tersebut sering diajukan di dunia kerja.
- Poin kunci apa yang dicari interviewer dari jawaban mentee.
- Kesalahan umum apa yang wajib dihindari.`;
    } else if (promptType === 'best_practice') {
      instruction = `Sebagai mentor berpengalaman, bagikan best practice dan rahasia lapangan untuk topik "${topicTitle}".
- Jebakan umum atau bad habit apa yang paling sering dilakukan orang saat mempelajari topik ini.
- Kebiasaan atau prinsip utama yang akan membuat hasil kerja mentee setara praktisi profesional.`;
    } else {
      instruction = `Pertanyaan dari menteemu: "${customQuery || topicTitle}"
Jawablah langsung layaknya seorang mentor manusia berpengalaman yang peduli, solutif, santai namun berbobot, dan berikan arahan praktis yang bisa langsung ia coba.`;
    }

    const userPrompt = `KONTEKS ROADMAP BELAJAR:
- Judul Kurikulum: ${roadmapTitle || 'Teknikal'}
- Target Hasil: ${targetRoleOrOutcome || 'Software Engineer'}
- Topik yang Sedang Dipelajari: ${topicTitle} (${category})
- Ringkasan Materi: ${summary || ''}
- Topik Kunci: ${Array.isArray(keyTopics) ? keyTopics.join(', ') : ''}

INSTRUKSI BIMBINGAN MENTOR:
${instruction}

Ingat: Patuhi aturan ZERO EMOJI secara mutlak. Format bimbingan menggunakan Markdown yang bersih dan mudah dibaca.`;

    const isPro = userProfile?.subscription_tier === 'pro' ||
                  userProfile?.subscription_tier === 'plus' ||
                  userProfile?.subscription_tier === 'unlimited' ||
                  Boolean(userProfile?.is_admin);

    const provider = isPro
      ? (systemSettings.pro_ai_provider || systemSettings.ai_provider || 'nine_router')
      : (systemSettings.free_ai_provider || systemSettings.ai_provider || 'gemini_direct');

    const preferredModel = userPreferredModel?.trim() || (isPro ? systemSettings.pro_model : systemSettings.free_model);

    let answer = '';

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
            { role: 'system', content: ROADMAP_MENTOR_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1200,
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`9Router error: ${err.slice(0, 150)}`);
      }
      const rawText = await res.text();
      const parsed = parseOpenAiChatResponse(rawText);
      answer = parsed.content;
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
            { role: 'system', content: ROADMAP_MENTOR_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1200,
          temperature: 0.3,
        }),
      });

      if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);
      const data = await res.json();
      answer = data?.choices?.[0]?.message?.content || '';
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
        throw new Error('API Key belum tersedia. Silakan atur di Pengaturan.');
      }

      const pool = createKeyPool(keyList);
      const chosenModel = slotPreferredModel?.trim() || preferredModel || 'gemini-2.5-flash';
      const ladder = [chosenModel, ...MODEL_LADDER.filter((m) => m !== chosenModel)];

      let success = false;
      let lastErr = '';

      for (const curModel of ladder) {
        const activeKey = pool.getAvailableKey();
        if (!activeKey) break;

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${curModel}:generateContent?key=${activeKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: ROADMAP_MENTOR_SYSTEM_PROMPT }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1200,
              },
            }),
            signal: AbortSignal.timeout(60000),
          });

          if (!res.ok) {
            lastErr = `HTTP ${res.status}`;
            continue;
          }

          const geminiData = await res.json();
          const cand = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (cand) {
            answer = cand;
            success = true;
            break;
          }
        } catch (e: any) {
          lastErr = e?.message || 'Error';
        }
      }

      if (!success || !answer) {
        throw new Error(`Gagal memuat konsultasi mentor AI (${lastErr})`);
      }
    }

    const cleanAnswer = stripEmojis(answer);

    return NextResponse.json({
      success: true,
      data: {
        answer: cleanAnswer,
        promptType,
        topicTitle,
      },
    });
  } catch (error: unknown) {
    console.error('Error in roadmap-mentor:', error);
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
