import { PRDOutput } from '@/types/prd';
import { PRDOutputZodSchema } from '@/lib/gemini/schemas';
import { createKeyPool, generateStructuredPRD as generateGeminiDirect, getKeysFromSettings } from '@/lib/gemini/gemini-client';
import { SystemSettings, AiProvider } from '@/lib/supabase/types';
import { normalizeOpenAiEndpoint, parseOpenAiChatResponse } from './openai-compat';

interface GenerateOptions {
  systemSettings: SystemSettings;
  userGeminiKey?: string;
  systemPrompt: string;
  userPrompt: string;
  isPro?: boolean;
  userId?: string;
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

  // Determine provider and model based on user tier
  const provider: AiProvider = isPro
    ? (systemSettings.pro_ai_provider || systemSettings.ai_provider || 'gemini_direct')
    : (systemSettings.free_ai_provider || systemSettings.ai_provider || 'gemini_direct');

  const preferredModel = isPro
    ? (systemSettings.pro_model || systemSettings.nine_router_model || 'deepseek-chat')
    : (systemSettings.free_model || 'gemini-flash-latest');

  // 1. If provider is 9Router (OpenAI Compatible)
  if (provider === 'nine_router') {
    const endpoint = normalizeOpenAiEndpoint(systemSettings.nine_router_url);
    const apiKey = systemSettings.nine_router_key || 'sk-test';
    const model = preferredModel || 'deepseek-chat';

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
        temperature: 0.3,
        stream: false,
      }),
      signal: signal || AbortSignal.timeout(150000), // 150s timeout for large PRD generation
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error('9Router Error [' + res.status + ']: ' + errText.slice(0, 200));
    }

    const rawText = await res.text();
    const { content: rawContent } = parseOpenAiChatResponse(rawText);
    if (!rawContent) {
      throw new Error('Respons 9Router kosong atau format stream tidak terbaca.');
    }

    let cleanedText = rawContent.trim();
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedText = cleanedText.slice(firstBrace, lastBrace + 1);
    } else {
      cleanedText = cleanedText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '');
    }

    const parsed = JSON.parse(cleanedText);
    const validated = PRDOutputZodSchema.parse(parsed);

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
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
      signal: signal || AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error('OpenRouter Error [' + res.status + ']: ' + errText.slice(0, 200));
    }

    const data = await res.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error('Respons OpenRouter kosong.');

    const cleanedText = rawContent
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    const parsed = JSON.parse(cleanedText);
    const validated = PRDOutputZodSchema.parse(parsed);

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
  if (systemSettings.api_key_mode === 'server_managed') {
    keyList = getKeysFromSettings(systemSettings, userId);
    if (keyList.length === 0) {
      const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
      keyList = envKeys;
    }
  } else {
    if (userGeminiKey) {
      keyList = [userGeminiKey.trim()];
    }
  }

  if (keyList.length === 0) {
    throw new Error('API Key belum diisi. Masukkan Gemini API Key atau aktifkan Server Managed Key / Multi-Key Slot di Admin.');
  }

  const chosenGeminiModel = userPreferredModel?.trim() || preferredModel || 'gemini-3.8-flash';
  const pool = createKeyPool(keyList);
  return await generateGeminiDirect({
    apiKeyPool: pool,
    systemPrompt,
    userPrompt,
    preferredModel: chosenGeminiModel,
    signal,
  });
}
