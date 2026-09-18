/**
 * Utility functions for OpenAI-compatible proxies (such as 9Router, Local LLM, OpenRouter).
 * Handles URL normalization and robust parsing of both standard JSON and SSE stream responses.
 */

export function normalizeOpenAiEndpoint(rawUrl?: string): string {
  let clean = (rawUrl || 'http://127.0.0.1:2080').trim().replace(/\/+$/, '');
  if (!clean.endsWith('/chat/completions')) {
    if (clean.endsWith('/v1')) {
      clean = `${clean}/chat/completions`;
    } else {
      clean = `${clean}/v1/chat/completions`;
    }
  }
  return clean;
}

export function parseOpenAiChatResponse(rawText: string): { content: string; raw?: any } {
  const trimmed = (rawText || '').trim();
  if (!trimmed) {
    return { content: '', raw: null };
  }

  // 1. Try standard JSON parse first
  try {
    const parsed = JSON.parse(trimmed);
    const content =
      parsed?.choices?.[0]?.message?.content ??
      parsed?.choices?.[0]?.delta?.content ??
      parsed?.reply ??
      '';
    return {
      content: typeof content === 'string' ? content : (content ? JSON.stringify(content) : ''),
      raw: parsed,
    };
  } catch {
    // Expected to fall through if response is SSE (starts with data: ...)
  }

  // 2. Handle Server-Sent Events (SSE) streaming format
  // Format: lines starting with `data: { ... }` or `data: [DONE]`
  if (trimmed.includes('data:')) {
    const lines = trimmed.split('\n');
    let accumulatedContent = '';
    let lastParsedObj: any = null;

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine.startsWith('data:')) continue;

      const payload = cleanLine.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      try {
        const chunk = JSON.parse(payload);
        lastParsedObj = chunk;
        const delta =
          chunk?.choices?.[0]?.delta?.content ??
          chunk?.choices?.[0]?.message?.content ??
          '';
        if (typeof delta === 'string') {
          accumulatedContent += delta;
        }
      } catch {
        // Ignore malformed individual chunks
      }
    }

    if (accumulatedContent || lastParsedObj) {
      return {
        content: accumulatedContent || lastParsedObj?.choices?.[0]?.message?.content || '',
        raw: lastParsedObj,
      };
    }
  }

  // 3. Fallback: Check if wrapped in data: prefix without newline
  if (trimmed.startsWith('data:')) {
    const withoutData = trimmed.replace(/^data:\s*/, '').trim();
    try {
      const parsed = JSON.parse(withoutData);
      const content = parsed?.choices?.[0]?.message?.content ?? parsed?.choices?.[0]?.delta?.content ?? '';
      return {
        content: typeof content === 'string' ? content : '',
        raw: parsed,
      };
    } catch {}
  }

  // 4. Fallback: Search for outer JSON object between { and }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const candidate = trimmed.slice(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(candidate);
      const content = parsed?.choices?.[0]?.message?.content ?? parsed?.choices?.[0]?.delta?.content ?? '';
      return {
        content: typeof content === 'string' ? content : '',
        raw: parsed,
      };
    } catch {}
  }

  // 5. Raw text fallback
  return { content: trimmed, raw: null };
}
