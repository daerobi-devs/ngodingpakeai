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

/**
 * Robust JSON parser and repair engine for LLMs.
 * Automatically recovers from truncated responses, unescaped quotes,
 * dangling commas, and incomplete brackets.
 */
export function repairAndParseJSON(rawText: string): any {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Teks JSON kosong.');
  }

  let text = rawText.trim();

  // Strip markdown code fences if present
  text = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');

  const firstBrace = text.indexOf('{');
  if (firstBrace === -1) {
    throw new Error('Tidak ditemukan kurung kurawal pembuka { dalam respons AI.');
  }
  text = text.slice(firstBrace);

  // Normalize smart quotes and remove BOM
  text = text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/^\uFEFF/, '');

  // 1. First attempt: standard JSON.parse
  try {
    return JSON.parse(text);
  } catch {
    // Expected to continue to repair logic
  }

  // 2. Second attempt: Clean control characters and trailing commas
  try {
    const cleaned = text
      .replace(/[\u0000-\u001F]+/g, ' ')
      .replace(/,\s*([\}\]])/g, '$1');
    return JSON.parse(cleaned);
  } catch {}

  // 3. Third attempt: Trim dangling uncompleted tokens at end
  let candidate = text;
  const lastBrace = candidate.lastIndexOf('}');
  if (lastBrace !== -1 && lastBrace > 0) {
    try {
      const sliced = candidate.slice(0, lastBrace + 1).replace(/,\s*([\}\]])/g, '$1');
      return JSON.parse(sliced);
    } catch {}
  }

  // Helper: Try balancing brackets and fixing cut-off key-values on a candidate string
  const attemptBalanceAndParse = (cand: string): any => {
    // Pre-repair: fix unquoted keys e.g. { id: "1" } -> { "id": "1" }
    let preRepaired = cand
      .replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":')
      .replace(/([{,]\s*)([a-zA-Z0-9_-]+)\s*:/g, '$1"$2":');

    let inString = false;
    let escaped = false;
    const stack: ('{' | '[')[] = [];
    let repaired = '';

    for (let i = 0; i < preRepaired.length; i++) {
      const char = preRepaired[i];

      if (escaped) {
        escaped = false;
        repaired += char;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        repaired += char;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        repaired += char;
        continue;
      }

      if (inString) {
        if (char === '\n') {
          repaired += '\\n';
        } else if (char === '\r') {
          // ignore
        } else if (char === '\t') {
          repaired += '\\t';
        } else {
          repaired += char;
        }
        continue;
      }

      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack.length > 0 && stack[stack.length - 1] === '{') {
          stack.pop();
        }
      } else if (char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === '[') {
          stack.pop();
        }
      }

      repaired += char;
    }

    // 1. If cut off inside a string, close the string
    if (inString) {
      repaired += '"';
    }

    // 2. Clean dangling tokens before bracket closing
    // Dangling key with colon: e.g. ,"key": or {"key":
    repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*$/, '');
    repaired = repaired.replace(/\{\s*"[^"]*"\s*:\s*$/, '{');
    // Dangling key without colon: e.g. ,"key"
    repaired = repaired.replace(/,\s*"[^"]*"\s*$/, '');
    // Colon at the very end
    repaired = repaired.replace(/:\s*$/, ': null');
    // Trailing comma at the end
    repaired = repaired.replace(/,\s*$/, '');

    // 3. Close open brackets in reverse order
    while (stack.length > 0) {
      const open = stack.pop();
      if (open === '{') {
        repaired += '}';
      } else if (open === '[') {
        repaired += ']';
      }
    }

    // 4. Fix any colon directly followed by a closing bracket (empty value bug e.g. "keyTopics":}]}]})
    repaired = repaired.replace(/:\s*\}/g, ': null}');
    repaired = repaired.replace(/:\s*\]/g, ': []]');
    // Fix dangling key right before a closing brace: e.g. ,"key"} -> }
    repaired = repaired.replace(/,\s*"[^"]+"\s*\}/g, '}');
    // Clean trailing commas before closing brackets
    repaired = repaired.replace(/,\s*([\}\]])/g, '$1');

    return JSON.parse(repaired);
  };

  // 4. Fourth attempt: Balanced repair on candidate
  try {
    return attemptBalanceAndParse(candidate);
  } catch (err: any) {
    // 5. Fifth attempt: Progressive slice backwards to the last valid completed object
    let cutIdx = candidate.lastIndexOf('}');
    while (cutIdx > 10) {
      const sub = candidate.slice(0, cutIdx + 1);
      try {
        return attemptBalanceAndParse(sub);
      } catch {
        cutIdx = candidate.lastIndexOf('}', cutIdx - 1);
      }
    }

    // 6. Sixth attempt: Relaxed loose object evaluation via Function constructor safely
    try {
      const sanitized = candidate
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .replace(/,\s*([\}\]])/g, '$1');
      const looseObj = new Function(`"use strict"; return (${sanitized});`)();
      if (looseObj && typeof looseObj === 'object') {
        return looseObj;
      }
    } catch {}

    throw new Error(`Format JSON dari AI terpotong atau tidak lengkap: ${err?.message || 'Sintaks tidak valid'}`);
  }
}

