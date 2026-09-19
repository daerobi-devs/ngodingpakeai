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

  // 1. First attempt: standard JSON.parse
  try {
    return JSON.parse(text);
  } catch {
    // Expected to continue to repair logic
  }

  // 2. Second attempt: Clean control characters
  try {
    const cleaned = text.replace(/[\u0000-\u001F]+/g, ' ');
    return JSON.parse(cleaned);
  } catch {}

  // 3. Third attempt: Trim dangling uncompleted tokens at end
  // If ended with uncompleted property or trailing comma:
  let candidate = text;
  const lastBrace = candidate.lastIndexOf('}');
  if (lastBrace !== -1 && lastBrace > 0) {
    try {
      return JSON.parse(candidate.slice(0, lastBrace + 1));
    } catch {}
  }

  // 4. Fourth attempt: Automatic Stack Balancer for Truncated JSON
  // If model hit max_tokens, it stopped mid-stream.
  // We close open strings, arrays, and objects.
  try {
    let inString = false;
    let escaped = false;
    const stack: ('{' | '[')[] = [];
    let repaired = '';

    for (let i = 0; i < candidate.length; i++) {
      const char = candidate[i];

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
        // Normalize literal newlines inside strings which break JSON.parse
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

    // If stream cut off while inside a string, close the string
    if (inString) {
      repaired += '"';
    }

    // Remove any trailing comma before closing brackets
    repaired = repaired.replace(/,\s*([\}\]])/g, '$1');
    repaired = repaired.replace(/,\s*$/, '');

    // Close all open brackets in reverse order
    while (stack.length > 0) {
      const open = stack.pop();
      if (open === '{') {
        repaired += '}';
      } else if (open === '[') {
        repaired += ']';
      }
    }

    // Clean any lingering trailing commas
    repaired = repaired.replace(/,\s*([\}\]])/g, '$1');

    return JSON.parse(repaired);
  } catch (err: any) {
    throw new Error(`Format JSON dari AI terpotong atau tidak lengkap: ${err?.message || 'Sintaks tidak valid'}`);
  }
}
