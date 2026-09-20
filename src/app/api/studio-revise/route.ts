import { NextRequest, NextResponse } from 'next/server';
import { PRDOutput } from '@/types/prd';
import { createAdminClient } from '@/lib/supabase/admin';
import { SystemSettings, Profile, DEFAULT_PRICING_TIERS } from '@/lib/supabase/types';
import { resolveGeminiKeysAndSlot } from '@/lib/gemini/gemini-client';
import { repairAndParseJSON } from '@/lib/ai/openai-compat';
import { normalizeAndSanitizePRDOutput } from '@/lib/gemini/schemas';

const REVISION_SYSTEM_PROMPT = `Anda adalah Lead Software Architect dan Product Strategist kelas dunia.
Tugas Anda adalah merevisi dan menyempurnakan dokumen PRD (Product Requirements Document) berdasarkan instruksi revisi dari pengguna.

ATURAN REVISI:
1. Kembalikan output HANYA dalam format JSON valid tanpa format markdown \`\`\`json pembungkus.
2. Pertahankan dan perbarui struktur PRDOutput secara utuh (title, archetype_detection, opportunity_framing, boundaries, success_measurement, rollout_plan, risk_management, ownership_action, ai_specific, feature_breakdown, architecture_diagrams, task_breakdown, tech_stack).
3. Terapkan perubahan yang diminta secara nyata dan spesifik:
   - Jika pengguna meminta menambah fitur, tambahkan objek fitur baru lengkap ke dalam array feature_breakdown dan sesuaikan boundaries.scope.
   - Jika pengguna meminta mengubah teknologi / stack, perbarui objek tech_stack dan architecture_diagrams (Mermaid diagrams).
   - Jika pengguna meminta mengubah database / skema, perbarui database_erd dan tech_mapping pada fitur terkait.
4. Sertakan atribut:
   - "revision_summary": Ringkasan 1-2 kalimat tentang apa saja yang telah diperbarui pada versi ini.
   - "chat_reply": Balasan profesional, ramah, dan informatif kepada pengguna dalam bahasa Indonesia menjelaskan secara spesifik bagian dokumen mana yang telah diubah (misalnya sebutkan bagian Tech Stack, Core Features, atau Database Schema).
5. ZERO EMOJI: Dilarang keras menggunakan emoji apapun di dalam teks, JSON, maupun balasan chat.`;

// Daftar model fallback berurutan untuk mengatasi overload 503 / 429
const FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
  'gemini-1.5-pro',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentPrd: PRDOutput = body.currentPrd;
    const instruction: string = body.instruction;
    const currentVersion: number = body.currentVersion || 1;
    const userId: string | undefined = body.userId;
    const prdId: string | undefined = body.prdId;
    const mode: 'chat' | 'revise' = body.mode === 'chat' ? 'chat' : 'revise';

    if (!currentPrd || !instruction) {
      return NextResponse.json(
        { success: false, error: 'Data PRD dan pesan instruksi wajib disertakan.' },
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
      qris_merchant_name: 'NGODINGPAKEPRD OFFICIAL',
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

    // 1. Kebijakan Langganan Mode Studio (studio_access_tier)
    const studioAccessPolicy = systemSettings.studio_access_tier || 'paid_only';
    const isProTier =
      userProfile?.subscription_tier === 'pro' ||
      userProfile?.subscription_tier === 'unlimited' ||
      Boolean(userProfile?.is_admin);
    const isPaidTier = userProfile?.subscription_tier === 'plus' || isProTier;

    if (studioAccessPolicy === 'pro_only' && !isProTier) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fitur Tab Studio dan Revisi AI hanya tersedia khusus untuk pengguna paket PRO & Unlimited.',
          requireUpgrade: true,
        },
        { status: 403 }
      );
    }

    if (studioAccessPolicy === 'paid_only' && !isPaidTier) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fitur Tab Studio dan Revisi AI adalah layanan berlangganan (Plus/PRO). Silakan upgrade paket Anda untuk menggunakan fitur ini.',
          requireUpgrade: true,
        },
        { status: 403 }
      );
    }

    // 2. Pembatasan Kuota Harian PRD (1 Revisi = 1 Kuota PRD Harian)
    if (mode === 'revise' && userProfile && !userProfile.is_admin) {
      const tiers = systemSettings.pricing_tiers || DEFAULT_PRICING_TIERS;
      const userTier = userProfile.subscription_tier || 'free';
      const currentTierConfig =
        tiers.find((t) => t.id === userTier) || tiers.find((t) => t.id === 'free');
      const effectiveDailyLimit =
        userProfile.daily_limit_override !== undefined && userProfile.daily_limit_override !== null
          ? userProfile.daily_limit_override
          : currentTierConfig
          ? currentTierConfig.daily_limit
          : userTier === 'free'
          ? 1
          : 50;

      if (effectiveDailyLimit > 0 && effectiveDailyLimit < 999999) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { count, error: countError } = await adminSupabase
          .from('prd_history')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userProfile.id)
          .gte('created_at', startOfDay.toISOString());

        if (!countError && (count || 0) >= effectiveDailyLimit) {
          return NextResponse.json(
            {
              success: false,
              error: `Batas kuota harian kamu (${effectiveDailyLimit} PRD/hari untuk paket ${
                currentTierConfig?.name || userTier.toUpperCase()
              }) telah tercapai hari ini. Setiap revisi memakan 1 kuota PRD. Kuota akan direset otomatis pukul 00:00 WIB.`,
              dailyLimitReached: true,
            },
            { status: 429 }
          );
        }
      }
    }

    // Resolusi Kunci API Dinamis & Slot
    const authHeader = req.headers.get('x-gemini-api-key') || '';
    const clientKeys = authHeader ? authHeader.split(',').map((k) => k.trim()).filter(Boolean) : [];
    const isPro = isPaidTier;

    let keyPool: string[] = [];
    let usedSlotLabel = 'Studio Auto';

    if (isPro || systemSettings.api_key_mode === 'server_managed') {
      const resolved = resolveGeminiKeysAndSlot(systemSettings, userId);
      keyPool = resolved.keys;
      if (resolved.slotUsedLabel) {
        usedSlotLabel = resolved.slotUsedLabel;
      }
    }

    if (keyPool.length === 0 && clientKeys.length > 0) {
      keyPool = clientKeys;
      usedSlotLabel = 'User BYOK';
    }

    if (keyPool.length === 0) {
      const resolved = resolveGeminiKeysAndSlot(systemSettings, userId);
      keyPool = resolved.keys;
      if (resolved.slotUsedLabel) {
        usedSlotLabel = resolved.slotUsedLabel;
      }
    }

    if (keyPool.length === 0) {
      const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      keyPool = envKeys;
      usedSlotLabel = 'Env Master Key';
    }

    if (keyPool.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kunci API Gemini tidak tersedia. Silakan hubungi Administrator.',
        },
        { status: 400 }
      );
    }

    let rawResultText = '';
    let lastError: any = null;
    let successfulModel = '';
    let responseUsageMetadata: any = null;

    if (mode === 'chat') {
      const chatSystemPrompt = `Anda adalah Co-Pilot AI dan Lead Software Architect untuk produk "${currentPrd.title}".
Tugas Anda adalah berdiskusi, berkonsultasi, menjawab pertanyaan arsitektur, dan brainstorming bersama pengguna.
PENTING:
1. Anda saat ini berada dalam MODE DISKUSI / KONSULTASI MURNI. JANGAN memberikan output JSON PRD. Berikan balasan penjelasan arsitektur yang mendalam, solutif, dan terstruktur dalam bahasa Indonesia.
2. Jelaskan trade-off teknologi, best practices, dan alternatif implementasi jika pengguna bertanya.
3. DILARANG KERAS MENGATAKAN BAHWA ANDA TELAH MENGUBAH ATAU MEMPERBARUI DOKUMEN PRD. Dokumen PRD pada mode ini sama sekali TIDAK diubah. Katakan secara jujur bahwa Anda berada di Mode Diskusi. Jika pengguna ingin menerapkan saran ini ke dokumen PRD resmi, jelaskan bahwa mereka dapat beralih ke tombol "Revisi PRD" di bagian atas atau mengeklik tombol "Terapkan ke Dokumen PRD" di bawah jawaban Anda.
4. ZERO EMOJI: Dilarang keras menggunakan emoji apapun.`;

      const chatUserPrompt = `Konteks Produk:
- Judul: ${currentPrd.title}
- Target: ${currentPrd.archetype_detection?.target_audience || 'Pengguna'}
- Arsitektur: ${currentPrd.archetype_detection?.archetype || 'Web Application'}

Pesan Diskusi dari Pengguna:
"${instruction}"

Berikan jawaban konsultasi arsitektur terbaik dan solutif.`;

      modelLoop: for (const modelName of FALLBACK_MODELS) {
        for (let kIdx = 0; kIdx < Math.min(keyPool.length, 4); kIdx++) {
          const apiKey = keyPool[kIdx % keyPool.length];
          try {
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
              model: modelName,
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: chatSystemPrompt + '\n\n' + chatUserPrompt },
                  ],
                },
              ],
              config: {
                temperature: 0.7,
              },
            });

            const text = response?.text?.trim() || '';
            if (text) {
              rawResultText = text;
              successfulModel = modelName;
              responseUsageMetadata = (response as any)?.usageMetadata;
              break modelLoop;
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`Chat Fallback: Model ${modelName} key ${kIdx} gagal:`, err?.message || err);
          }
        }
      }

      if (!rawResultText) {
        throw new Error(
          lastError?.message || 'Layanan AI sedang mengalami kepadatan tinggi. Silakan coba lagi.'
        );
      }

      // Hitung dan catat token server jika menggunakan server key
      const promptLength = chatSystemPrompt.length + chatUserPrompt.length;
      const outputLength = rawResultText.length;
      const estimatedTokens = Math.ceil((promptLength + outputLength) / 3.8);
      const totalTokens = responseUsageMetadata?.totalTokenCount || estimatedTokens;

      const isServerKey = clientKeys.length === 0 || isPro || systemSettings.api_key_mode === 'server_managed';

      if (userProfile && isServerKey) {
        try {
          const currentTokens = (userProfile as any).total_server_tokens || 0;
          await adminSupabase
            .from('profiles')
            .update({
              total_server_tokens: currentTokens + totalTokens,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userProfile.id);
        } catch (tokErr) {
          console.warn('Could not update total_server_tokens for studio chat:', tokErr);
        }
      }

      return NextResponse.json({
        success: true,
        mode: 'chat',
        chatReply: rawResultText,
        tokensUsed: totalTokens,
      });
    }

    // MODE: REVISE (Mengubah PRD dan menaikkan versi)
    const revisionUserPrompt = `Berikut adalah data PRD yang sedang aktif:
\`\`\`json
${JSON.stringify(currentPrd, null, 2)}
\`\`\`

Instruksi Revisi dari Pengguna:
"${instruction}"

Nomor Versi Dokumen Baru yang Dihasilkan: ${currentVersion + 1}

Terapkan perubahan dengan tepat ke dalam objek JSON PRD. Berikan atribut revision_summary dan chat_reply.`;

    modelLoop: for (const modelName of FALLBACK_MODELS) {
      for (let kIdx = 0; kIdx < Math.min(keyPool.length, 4); kIdx++) {
        const apiKey = keyPool[kIdx % keyPool.length];
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  { text: REVISION_SYSTEM_PROMPT + '\n\n' + revisionUserPrompt },
                ],
              },
            ],
            config: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          });

          const text = response?.text?.trim() || '';
          if (text) {
            rawResultText = text;
            successfulModel = modelName;
            responseUsageMetadata = (response as any)?.usageMetadata;
            break modelLoop; // Berhasil!
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Fallback: Model ${modelName} dengan key index ${kIdx} gagal:`, err?.message || err);
        }
      }
    }

    if (!rawResultText) {
      throw new Error(
        lastError?.message || 'Layanan AI sedang mengalami kepadatan tinggi di semua model. Silakan coba beberapa saat lagi.'
      );
    }

    const parsedJson = repairAndParseJSON(rawResultText);
    const sanitizedPrd = normalizeAndSanitizePRDOutput(parsedJson);

    // Kalkulasi token revisi
    const promptLength = REVISION_SYSTEM_PROMPT.length + revisionUserPrompt.length;
    const outputLength = rawResultText.length;
    const estimatedTokens = Math.ceil((promptLength + outputLength) / 3.8);
    const totalTokens = responseUsageMetadata?.totalTokenCount || estimatedTokens;

    // Pastikan tech_stack tidak kembali ke starter default jika tidak diminta diubah
    const baseStack = currentPrd.tech_stack || {};
    const revisedStack = sanitizedPrd.tech_stack || {};

    sanitizedPrd.tech_stack = {
      ...baseStack,
      ...revisedStack,
      templateId: revisedStack.templateId || baseStack.templateId || 'starter',
      frontend: revisedStack.frontend || baseStack.frontend,
      backend: revisedStack.backend || baseStack.backend,
      database: revisedStack.database || baseStack.database,
      deployment: revisedStack.deployment || baseStack.deployment,
      language: revisedStack.language || baseStack.language || 'id',
    };

    sanitizedPrd.metadata = {
      ...(currentPrd.metadata || {}),
      ...(parsedJson?.metadata || {}),
      modelUsed: successfulModel || currentPrd.metadata?.modelUsed || 'Gemini Flash',
      generatedAt: currentPrd.metadata?.generatedAt || new Date().toISOString(),
      tokensUsed: totalTokens,
    };

    const nextVersionNumber = currentVersion + 1;
    const revisionSummary =
      parsedJson?.revision_summary ||
      `Pembaruan dokumen versi ${nextVersionNumber} berdasarkan instruksi: "${instruction}"`;

    const chatReply =
      parsedJson?.chat_reply ||
      `Project Requirements Document (PRD) telah diperbarui dengan mengintegrasikan instruksi Anda. Versi dokumen telah ditingkatkan menjadi Versi ${nextVersionNumber}. Silakan periksa dokumen terbaru untuk melihat perubahannya.`;

    const isServerKey = clientKeys.length === 0 || isPro || systemSettings.api_key_mode === 'server_managed';

    // 1. Akumulasi total_server_tokens di profiles jika menggunakan server key
    if (userProfile && isServerKey) {
      try {
        const currentTokens = (userProfile as any).total_server_tokens || 0;
        await adminSupabase
          .from('profiles')
          .update({
            total_server_tokens: currentTokens + totalTokens,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userProfile.id);
      } catch (tokErr) {
        console.warn('Could not update total_server_tokens for studio revise:', tokErr);
      }
    }

    // 2. Perbarui dokumen pada row proyek yang sama (JANGAN buat proyek duplikat di riwayat)
    if (userProfile?.id && prdId) {
      try {
        const { data: existing } = await adminSupabase
          .from('prd_history')
          .select('id, tokens_used')
          .eq('id', prdId)
          .eq('user_id', userProfile.id)
          .maybeSingle();

        if (existing) {
          await adminSupabase
            .from('prd_history')
            .update({
              title: sanitizedPrd.title || currentPrd.title,
              prd_data: sanitizedPrd as any,
              tokens_used: (existing.tokens_used || 0) + totalTokens,
              updated_at: new Date().toISOString(),
            })
            .eq('id', prdId)
            .eq('user_id', userProfile.id);
        } else {
          await adminSupabase
            .from('prd_history')
            .insert({
              id: prdId,
              user_id: userProfile.id,
              title: sanitizedPrd.title || currentPrd.title || 'Untitled PRD',
              prd_data: sanitizedPrd as any,
              model_used: successfulModel || 'Gemini Flash',
              tokens_used: totalTokens,
              is_server_key: isServerKey,
              gemini_slot_used: usedSlotLabel,
            });
        }
      } catch (histErr) {
        console.error('Failed to update prd_history for studio revision:', histErr);
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'revise',
      newVersion: nextVersionNumber,
      revisionSummary,
      chatReply,
      revisedPrd: sanitizedPrd,
      tokensUsed: totalTokens,
    });
  } catch (error: any) {
    console.error('Error in studio-revise:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Terjadi kesalahan saat memproses revisi PRD.',
      },
      { status: 500 }
    );
  }
}
