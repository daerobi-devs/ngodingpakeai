import { createAdminClient } from '@/lib/supabase/admin';
import { resolveGeminiKeysAndSlot } from '@/lib/gemini/gemini-client';
import { repairAndParseJSON } from '@/lib/ai/openai-compat';
import { SystemSettings } from '@/lib/supabase/types';

// Active high-performance models proven to work reliably
export const ARCHITECT_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
  'gemini-2.5-flash',
];

export async function executeArchitectPrompt<T = any>(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
  }
): Promise<{ success: boolean; data?: T; error?: string; rawText?: string; tokensUsed?: number; modelUsed?: string }> {
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
    const adminSupabase = createAdminClient();
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

  const { keys: keyPool } = resolveGeminiKeysAndSlot(systemSettings);
  if (process.env.GEMINI_API_KEY && !keyPool.includes(process.env.GEMINI_API_KEY)) {
    keyPool.unshift(process.env.GEMINI_API_KEY);
  }

  if (keyPool.length === 0) {
    return {
      success: false,
      error: 'Kunci API Gemini tidak tersedia di sistem admin.',
    };
  }

  let lastError: any = null;
  const temp = options?.temperature ?? 0.2;

  for (const modelName of ARCHITECT_MODELS) {
    for (let kIdx = 0; kIdx < keyPool.length; kIdx++) {
      const apiKey = keyPool[kIdx];
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const payload = {
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: temp,
            maxOutputTokens: options?.maxOutputTokens ?? 8192,
          },
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.status === 429) {
          // Rate limited, try next key
          continue;
        }

        if (res.status === 404 || res.status === 503) {
          // Model not found or unavailable, try next model
          break;
        }

        if (!res.ok) {
          const errText = await res.text();
          lastError = new Error(`HTTP ${res.status}: ${errText.slice(0, 150)}`);
          continue;
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const usage = data.usageMetadata;
        const totalTokens =
          usage?.totalTokenCount ||
          Math.ceil((systemPrompt.length + userPrompt.length + text.length) / 3.8);

        if (text) {
          const parsed = repairAndParseJSON(text) as T;
          if (parsed) {
            return {
              success: true,
              data: parsed,
              rawText: text,
              tokensUsed: totalTokens,
              modelUsed: modelName,
            };
          }
        }
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Gagal menghasilkan analisis arsitektur akademik.',
  };
}
