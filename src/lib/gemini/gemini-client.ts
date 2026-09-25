import {
  geminiPRDResponseSchema,
  PRDOutputZodSchema,
  clarificationResponseSchema,
  ClarificationOutputZodSchema,
  normalizeAndSanitizeClarifications,
  geminiFeatureTreeResponseSchema,
  normalizeAndSanitizeFeatureModules,
  synthesizeDomainFeatureModules,
} from "./schemas";
import { PRDOutput, ClarificationQuestion } from "@/types/prd";
import { getDomainDiscoveryQuestions } from "./domain-discovery";
import { repairAndParseJSON } from "@/lib/ai/openai-compat";

// Active high-performance model hierarchy ladder proven on Google AI Studio
export const MODEL_LADDER = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
];

// Global cooldown tracker for keys: key -> cooldown timestamp (ms)
const keyCooldowns = new Map<string, number>();

export interface KeyPoolManager {
  keys: string[];
  getAvailableKey(): string | null;
  markCooldown(key: string, cooldownMs?: number): void;
}

export function resolveGeminiKeysAndSlot(
  settings: {
    gemini_slots?: Array<{ id: string; label?: string; key: string; isActive: boolean; preferredModel?: string }>;
    gemini_master_keys?: string;
    global_gemini_slot?: string;
  },
  userId?: string,
  assignedSlotId?: string | null
): { keys: string[]; slotUsedLabel?: string; slotPreferredModel?: string } {
  if (settings.gemini_slots && settings.gemini_slots.length > 0) {
    const activeSlots = settings.gemini_slots.filter(
      (s) => s.isActive && s.key && s.key.trim().length > 0
    );

    if (activeSlots.length > 0) {
      // 1. Per-User Dedicated Slot Priority
      if (assignedSlotId) {
        const dedicatedSlot = activeSlots.find((s) => s.id === assignedSlotId);
        if (dedicatedSlot) {
          const others = activeSlots.filter((s) => s.id !== assignedSlotId).map((s) => s.key.trim());
          return {
            keys: [dedicatedSlot.key.trim(), ...others],
            slotUsedLabel: dedicatedSlot.label || `Slot ${dedicatedSlot.id}`,
            slotPreferredModel: dedicatedSlot.preferredModel,
          };
        }
      }

      // 2. Global Pin Slot Priority
      if (settings.global_gemini_slot && settings.global_gemini_slot !== 'auto') {
        const globalSlot = activeSlots.find((s) => s.id === settings.global_gemini_slot);
        if (globalSlot) {
          const others = activeSlots.filter((s) => s.id !== settings.global_gemini_slot).map((s) => s.key.trim());
          return {
            keys: [globalSlot.key.trim(), ...others],
            slotUsedLabel: globalSlot.label || `Slot ${globalSlot.id}`,
            slotPreferredModel: globalSlot.preferredModel,
          };
        }
      }

      // 3. Auto Load Balance (User Hash / Round-Robin)
      if (userId) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
          hash = (hash << 5) - hash + userId.charCodeAt(i);
          hash |= 0;
        }
        const primaryIdx = Math.abs(hash) % activeSlots.length;
        const primary = activeSlots[primaryIdx];
        const others = activeSlots
          .filter((_, idx) => idx !== primaryIdx)
          .map((s) => s.key.trim());
        return {
          keys: [primary.key.trim(), ...others],
          slotUsedLabel: primary.label || `Slot ${primary.id}`,
          slotPreferredModel: primary.preferredModel,
        };
      }

      return {
        keys: activeSlots.map((s) => s.key.trim()),
        slotUsedLabel: activeSlots[0]?.label || `Slot ${activeSlots[0]?.id}`,
        slotPreferredModel: activeSlots[0]?.preferredModel,
      };
    }
  }

  if (settings.gemini_master_keys) {
    const keys = settings.gemini_master_keys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    return { keys, slotUsedLabel: 'Master Keys' };
  }

  return { keys: [] };
}

export function getKeysFromSettings(
  settings: {
    gemini_slots?: Array<{ id: string; label?: string; key: string; isActive: boolean }>;
    gemini_master_keys?: string;
    global_gemini_slot?: string;
  },
  userId?: string,
  assignedSlotId?: string | null
): string[] {
  return resolveGeminiKeysAndSlot(settings, userId, assignedSlotId).keys;
}

export interface GeneratePRDOptions {
  apiKeyPool: KeyPoolManager;
  systemPrompt: string;
  userPrompt: string;
  preferredModel?: string;
  signal?: AbortSignal;
}

export function createKeyPool(rawKeys: string[] | string): KeyPoolManager {
  const list = (Array.isArray(rawKeys) ? rawKeys : rawKeys.split(","))
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  return {
    keys: list,
    getAvailableKey(): string | null {
      const now = Date.now();
      // First find key not in cooldown
      for (const k of list) {
        const cd = keyCooldowns.get(k) || 0;
        if (now > cd) {
          return k;
        }
      }
      // If all keys are in cooldown, pick the one that will expire earliest
      if (list.length > 0) {
        let earliestKey = list[0];
        let earliestCd = keyCooldowns.get(earliestKey) || 0;
        for (const k of list) {
          const cd = keyCooldowns.get(k) || 0;
          if (cd < earliestCd) {
            earliestCd = cd;
            earliestKey = k;
          }
        }
        return earliestKey;
      }
      return null;
    },
    markCooldown(key: string, cooldownMs = 60000) {
      keyCooldowns.set(key, Date.now() + cooldownMs);
    },
  };
}

// Helper sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateStructuredPRD(
  options: GeneratePRDOptions
): Promise<PRDOutput> {
  const { apiKeyPool, systemPrompt, userPrompt, preferredModel, signal } = options;

  let retries = 0;
  let fallbackCount = 0;
  const errorsCollected: string[] = [];

  const ladder = preferredModel
    ? [preferredModel, ...MODEL_LADDER.filter((m) => m !== preferredModel)]
    : MODEL_LADDER;

  // Iterate down the model ladder
  for (let modelIdx = 0; modelIdx < ladder.length; modelIdx++) {
    const currentModel = ladder[modelIdx];

    // For each model, attempt with retry per available keys
    const maxRetriesPerModel = 2;

    for (let attempt = 0; attempt < maxRetriesPerModel; attempt++) {
      const apiKey = apiKeyPool.getAvailableKey();
      if (!apiKey) {
        throw new Error(
          "Tidak ada Gemini API Key yang tersedia. Silakan masukkan API Key di Pengaturan."
        );
      }

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

        const payload = {
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: geminiPRDResponseSchema,
            temperature: 0.3,
            maxOutputTokens: 24576,
          },
        };

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: signal || AbortSignal.timeout(90000),
        });

        if (res.status === 429) {
          // Rate limited on this key
          apiKeyPool.markCooldown(apiKey, 60000);
          retries++;
          errorsCollected.push(
            `Key ${apiKey.slice(0, 6)}... kena rate-limit (429) pada model ${currentModel}`
          );
          await sleep(500 * Math.pow(2, attempt)); // fast backoff 500ms
          continue; // try next key for same model
        }

        if (!res.ok) {
          const errText = await res.text();
          errorsCollected.push(
            `Model ${currentModel} [HTTP ${res.status}]: ${errText.slice(0, 150)}`
          );

          // Fast failover: If model not found (404), 503 high demand, or deprecated, immediately jump to next model
          if (
            res.status === 404 ||
            res.status === 503 ||
            errText.includes("not found") ||
            errText.includes("unsupported") ||
            errText.includes("high demand") ||
            errText.includes("no longer available")
          ) {
            break;
          }

          retries++;
          await sleep(500 * Math.pow(2, attempt));
          continue;
        }

        const data = await res.json();
        const candidate = data?.candidates?.[0];
        const rawJsonText = candidate?.content?.parts?.[0]?.text;

        if (!rawJsonText) {
          throw new Error("Respons Gemini kosong atau tidak memiliki part teks");
        }

        // Clean any accidental markdown wrap
        const cleanedText = rawJsonText
          .trim()
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "");

        const parsedJson = repairAndParseJSON(cleanedText);

        // Validate with Zod
        const validatedPRD = PRDOutputZodSchema.parse(parsedJson);

        return {
          ...validatedPRD,
          metadata: {
            modelUsed: currentModel,
            generatedAt: new Date().toISOString(),
            retries,
            fallbackCount,
          },
        };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errorsCollected.push(`Percobaan ${currentModel} gagal: ${errorMsg}`);

        // If AbortError, propagate immediately
        if (err instanceof Error && err.name === "AbortError") {
          throw err;
        }

        retries++;
        await sleep(1000 * Math.pow(2, attempt));
      }
    }

    fallbackCount++;
  }

  throw new Error(
    `Semua model Gemini dan API Key gagal dieksekusi.\nRiwayat error:\n- ${errorsCollected.slice(-4).join("\n- ")}`
  );
}

export async function generateClarifications(options: {
  apiKeyPool: KeyPoolManager;
  userIdea: string;
  prompt: string;
  preferredModel?: string;
}): Promise<ClarificationQuestion[]> {
  const { apiKeyPool, userIdea, prompt, preferredModel } = options;
  let errorsCollected: string[] = [];

  const ladder = preferredModel
    ? [preferredModel, ...MODEL_LADDER.filter((m) => m !== preferredModel)]
    : MODEL_LADDER;

  for (let modelIdx = 0; modelIdx < ladder.length; modelIdx++) {
    const currentModel = ladder[modelIdx];
    const apiKey = apiKeyPool.getAvailableKey();
    if (!apiKey) continue;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: clarificationResponseSchema,
          temperature: 0.3,
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        apiKeyPool.markCooldown(apiKey, 30000);
        continue;
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsed = repairAndParseJSON(rawText);
      return normalizeAndSanitizeClarifications(parsed);
    } catch (e: unknown) {
      errorsCollected.push(e instanceof Error ? e.message : String(e));
    }
  }

  // Graceful domain-discovery fallback questions if AI fails
  return getDomainDiscoveryQuestions(userIdea);
}

export async function generateGeminiFeatureTree(options: {
  apiKeyPool: KeyPoolManager;
  idea: string;
  prompt: string;
  preferredModel?: string;
  answers?: Record<string, string[]>;
  questions?: any[];
}): Promise<any[]> {
  const { apiKeyPool, idea, prompt, preferredModel, answers = {}, questions = [] } = options;

  const ladder = preferredModel
    ? [preferredModel, ...MODEL_LADDER.filter((m) => m !== preferredModel)]
    : MODEL_LADDER;

  for (let modelIdx = 0; modelIdx < ladder.length; modelIdx++) {
    const currentModel = ladder[modelIdx];
    const apiKey = apiKeyPool.getAvailableKey();
    if (!apiKey) continue;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: geminiFeatureTreeResponseSchema,
          temperature: 0.3,
          maxOutputTokens: 8192,
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        apiKeyPool.markCooldown(apiKey, 30000);
        continue;
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsed = repairAndParseJSON(rawText);
      const sanitized = normalizeAndSanitizeFeatureModules(parsed);
      if (sanitized.length > 0) {
        return sanitized;
      }
    } catch {
      // Continue to next model/key
    }
  }

  return synthesizeDomainFeatureModules(idea, answers, questions);
}

