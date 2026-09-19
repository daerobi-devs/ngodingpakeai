import { PRDOutput, ClarificationQuestion } from '@/types/prd';
import { PRDOutputZodSchema, normalizeAndSanitizePRDOutput, normalizeAndSanitizeClarifications } from '@/lib/gemini/schemas';
import { createKeyPool, generateStructuredPRD as generateGeminiDirect, generateClarifications as generateGeminiClarifications, getKeysFromSettings, resolveGeminiKeysAndSlot } from '@/lib/gemini/gemini-client';
import { SystemSettings, AiProvider } from '@/lib/supabase/types';
import { normalizeOpenAiEndpoint, parseOpenAiChatResponse, repairAndParseJSON } from './openai-compat';
import { getDomainDiscoveryQuestions } from '@/lib/gemini/domain-discovery';

interface GenerateOptions {
  systemSettings: SystemSettings;
  userGeminiKey?: string;
  systemPrompt: string;
  userPrompt: string;
  isPro?: boolean;
  userId?: string;
  assignedGeminiSlot?: string | null;
  signal?: AbortSignal;
  userPreferredModel?: string;
}

export async function generatePRDUnified(options: GenerateOptions): Promise<PRDOutput> {
  const {
    systemSettings,
    userGeminiKey,
    systemPrompt,
    userPrompt,
    isPro,
    userId,
    signal,
    userPreferredModel,
  } = options;

  // Resolve provider & model based on PRO status and preferred overrides
  const provider: AiProvider = isPro
    ? (systemSettings.pro_ai_provider || systemSettings.ai_provider || 'nine_router')
    : (systemSettings.free_ai_provider || systemSettings.ai_provider || 'gemini_direct');

  const preferredModel = userPreferredModel?.trim() || (isPro ? systemSettings.pro_model : systemSettings.free_model);

  // 1. 9Router provider
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
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 8192,
        temperature: 0.3,
      }),
      signal: signal || AbortSignal.timeout(180000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error('9Router Error [' + res.status + ']: ' + errText.slice(0, 200));
    }

    const rawResponseText = await res.text();
    const { content: rawContent } = parseOpenAiChatResponse(rawResponseText);
    if (!rawContent) {
      throw new Error('Respons 9Router kosong atau format stream tidak terbaca.');
    }

    const parsed = repairAndParseJSON(rawContent);
    const validated = normalizeAndSanitizePRDOutput(parsed);

    return {
      ...validated,
      metadata: {
        modelUsed: '9Router (' + model + ')',
        generatedAt: new Date().toISOString(),
        retries: 0,
        fallbackCount: 0,
      },
    };
  }

  // 2. OpenRouter provider
  if (provider === 'openrouter') {
    const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    const apiKey = systemSettings.openrouter_key;
    const model = preferredModel || systemSettings.openrouter_model || 'anthropic/claude-3.5-sonnet';

    if (!apiKey) {
      throw new Error('OpenRouter API Key belum dikonfigurasi di Admin Dashboard.');
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'HTTP-Referer': 'https://ngodingpakeprd.com',
        'X-Title': 'ngodingpakeprd',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 8192,
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
      signal: signal || AbortSignal.timeout(180000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error('OpenRouter Error [' + res.status + ']: ' + errText.slice(0, 200));
    }

    const data = await res.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error('Respons OpenRouter kosong.');

    const parsed = repairAndParseJSON(rawContent);
    const validated = normalizeAndSanitizePRDOutput(parsed);

    return {
      ...validated,
      metadata: {
        modelUsed: 'OpenRouter (' + model + ')',
        generatedAt: new Date().toISOString(),
        retries: 0,
        fallbackCount: 0,
      },
    };
  }

  // 3. Default: Gemini Direct
  let keyList: string[] = [];
  let slotUsedLabel: string | undefined = undefined;
  let slotPreferredModel: string | undefined = undefined;
  if (systemSettings.api_key_mode === 'server_managed') {
    const resolved = resolveGeminiKeysAndSlot(systemSettings, userId, options.assignedGeminiSlot);
    keyList = resolved.keys;
    slotUsedLabel = resolved.slotUsedLabel;
    slotPreferredModel = resolved.slotPreferredModel;
    if (keyList.length === 0) {
      const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
      keyList = envKeys;
      if (envKeys.length > 0) slotUsedLabel = 'Env Key';
    }
  } else {
    if (userGeminiKey) {
      keyList = [userGeminiKey.trim()];
      slotUsedLabel = 'BYOK Key';
    }
  }

  if (keyList.length === 0) {
    throw new Error('API Key belum diisi. Masukkan Gemini API Key atau aktifkan Server Managed Key / Multi-Key Slot di Admin.');
  }

  const chosenGeminiModel = slotPreferredModel?.trim() || userPreferredModel?.trim() || preferredModel || 'gemini-2.5-flash';
  const pool = createKeyPool(keyList);
  const geminiResult = await generateGeminiDirect({
    apiKeyPool: pool,
    systemPrompt,
    userPrompt,
    preferredModel: chosenGeminiModel,
    signal,
  });

  return {
    ...geminiResult,
    metadata: {
      modelUsed: geminiResult.metadata?.modelUsed || chosenGeminiModel,
      generatedAt: geminiResult.metadata?.generatedAt || new Date().toISOString(),
      retries: geminiResult.metadata?.retries,
      fallbackCount: geminiResult.metadata?.fallbackCount,
      geminiSlotUsed: slotUsedLabel,
    },
  };
}

export interface ClarificationUnifiedOptions {
  systemSettings: SystemSettings;
  userGeminiKey?: string;
  userIdea: string;
  prompt: string;
  isPro?: boolean;
  userId?: string;
  signal?: AbortSignal;
  userPreferredModel?: string;
}

export async function generateClarificationsUnified(
  options: ClarificationUnifiedOptions
): Promise<ClarificationQuestion[]> {
  const {
    systemSettings,
    userGeminiKey,
    userIdea,
    prompt,
    isPro,
    userId,
    signal,
    userPreferredModel,
  } = options;

  const fallbackQuestions = getDomainDiscoveryQuestions(userIdea);

  const provider: AiProvider = isPro
    ? (systemSettings.pro_ai_provider || systemSettings.ai_provider || 'nine_router')
    : (systemSettings.free_ai_provider || systemSettings.ai_provider || 'gemini_direct');

  const preferredModel =
    userPreferredModel?.trim() || (isPro ? systemSettings.pro_model : systemSettings.free_model);

  try {
    // 1. 9Router Provider
    if (provider === 'nine_router') {
      const endpoint = normalizeOpenAiEndpoint(systemSettings.nine_router_url);
      const apiKey = systemSettings.nine_router_key || '9router-local';
      const model = preferredModel || systemSettings.nine_router_model || 'deepseek-chat';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'Kamu adalah Lead Discovery Engineer. Outputkan JSON murni valid berisi array questions sesuai schema.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 3000,
          temperature: 0.3,
        }),
        signal: signal || AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        console.warn('9Router clarification HTTP error:', res.status);
        return fallbackQuestions;
      }

      const rawResponseText = await res.text();
      const { content: rawContent } = parseOpenAiChatResponse(rawResponseText);
      if (!rawContent) return fallbackQuestions;

      const parsed = repairAndParseJSON(rawContent);
      return normalizeAndSanitizeClarifications(parsed);
    }

    // 2. OpenRouter Provider
    if (provider === 'openrouter') {
      const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      const apiKey = systemSettings.openrouter_key;
      const model =
        preferredModel || systemSettings.openrouter_model || 'anthropic/claude-3.5-haiku';

      if (!apiKey) return fallbackQuestions;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
          'HTTP-Referer': 'https://ngodingpakeprd.com',
          'X-Title': 'ngodingpakeprd',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'Kamu adalah Lead Discovery Engineer. Outputkan JSON murni valid berisi array questions sesuai schema.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 3000,
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
        signal: signal || AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        console.warn('OpenRouter clarification HTTP error:', res.status);
        return fallbackQuestions;
      }

      const data = await res.json();
      const rawContent = data?.choices?.[0]?.message?.content;
      if (!rawContent) return fallbackQuestions;

      const parsed = repairAndParseJSON(rawContent);
      return normalizeAndSanitizeClarifications(parsed);
    }

    // 3. Default: Gemini Direct
    let keyList: string[] = [];
    if (systemSettings.api_key_mode === 'server_managed') {
      keyList = getKeysFromSettings(systemSettings, userId);
      if (keyList.length === 0) {
        const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);
        keyList = envKeys;
      }
    } else {
      if (userGeminiKey) {
        keyList = [userGeminiKey.trim()];
      } else {
        // In BYOK or hybrid without header, check if server slots exist as backup
        const slots = getKeysFromSettings(systemSettings, userId);
        if (slots.length > 0) keyList = slots;
      }
    }

    if (keyList.length === 0) {
      return fallbackQuestions;
    }

    const chosenModel = userPreferredModel?.trim() || preferredModel || 'gemini-2.5-flash';
    const pool = createKeyPool(keyList);

    return await generateGeminiClarifications({
      apiKeyPool: pool,
      userIdea,
      prompt,
      preferredModel: chosenModel,
    });
  } catch (err) {
    console.warn('generateClarificationsUnified error, returning smart domain questions:', err);
    return fallbackQuestions;
  }
}
