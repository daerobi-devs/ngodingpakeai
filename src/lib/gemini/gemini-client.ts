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
import { z } from "zod";

// Active verified model hierarchy ladder on Google Gemini API
export const MODEL_LADDER = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite-preview",
  "gemini-flash-lite-latest",
];

// Global cooldown tracker for keys: key -> cooldown timestamp (ms)
const keyCooldowns = new Map<string, number>();

export interface KeyPoolManager {
  keys: string[];
  getAvailableKey(): string | null;
  markCooldown(key: string, cooldownMs?: number): void;
}

export interface GeminiSlotTarget {
  id: string;
  label: string;
  key: string;
  preferredModel?: string;
  isDedicated?: boolean;
}

export function resolveOrderedGeminiSlots(
  settings: {
    gemini_slots?: Array<{ id: string; label?: string; key: string; isActive: boolean; preferredModel?: string }>;
    gemini_master_keys?: string;
    global_gemini_slot?: string;
    pro_model?: string;
    free_model?: string;
  },
  userId?: string,
  assignedSlotId?: string | null,
  isPro?: boolean
): GeminiSlotTarget[] {
  const defaultGlobalModel = (isPro ? settings.pro_model : settings.free_model)?.trim() || 'gemini-3.1-flash-lite';

  if (settings.gemini_slots && settings.gemini_slots.length > 0) {
    const activeSlots = settings.gemini_slots.filter(
      (s) => s.isActive && s.key && s.key.trim().length > 0
    );

    if (activeSlots.length > 0) {
      // 1. Per-User Dedicated Slot Priority (Dipilih di Admin per user)
      if (assignedSlotId) {
        const dedicatedSlot = activeSlots.find((s) => s.id === assignedSlotId);
        if (dedicatedSlot) {
          const others = activeSlots.filter((s) => s.id !== assignedSlotId);
          return [
            {
              id: dedicatedSlot.id,
              label: dedicatedSlot.label || `Slot ${dedicatedSlot.id}`,
              key: dedicatedSlot.key.trim(),
              preferredModel: dedicatedSlot.preferredModel?.trim() || defaultGlobalModel,
              isDedicated: true,
            },
            ...others.map((s) => ({
              id: s.id,
              label: s.label || `Slot ${s.id}`,
              key: s.key.trim(),
              preferredModel: s.preferredModel?.trim() || defaultGlobalModel,
              isDedicated: false,
            })),
          ];
        }
      }

      // 2. Global Pin Slot Priority (Dipilih di Admin untuk semua pengguna)
      if (settings.global_gemini_slot && settings.global_gemini_slot !== 'auto') {
        const globalSlot = activeSlots.find((s) => s.id === settings.global_gemini_slot);
        if (globalSlot) {
          const others = activeSlots.filter((s) => s.id !== settings.global_gemini_slot);
          return [
            {
              id: globalSlot.id,
              label: globalSlot.label || `Slot ${globalSlot.id}`,
              key: globalSlot.key.trim(),
              preferredModel: globalSlot.preferredModel?.trim() || defaultGlobalModel,
              isDedicated: false,
            },
            ...others.map((s) => ({
              id: s.id,
              label: s.label || `Slot ${s.id}`,
              key: s.key.trim(),
              preferredModel: s.preferredModel?.trim() || defaultGlobalModel,
              isDedicated: false,
            })),
          ];
        }
      }

      // 3. User Hash / Round-Robin balancing
      if (userId) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
          hash = (hash << 5) - hash + userId.charCodeAt(i);
          hash |= 0;
        }
        const primaryIdx = Math.abs(hash) % activeSlots.length;
        const primary = activeSlots[primaryIdx];
        const others = activeSlots.filter((_, idx) => idx !== primaryIdx);
        return [
          {
            id: primary.id,
            label: primary.label || `Slot ${primary.id}`,
            key: primary.key.trim(),
            preferredModel: primary.preferredModel?.trim() || defaultGlobalModel,
            isDedicated: true,
          },
          ...others.map((s) => ({
            id: s.id,
            label: s.label || `Slot ${s.id}`,
            key: s.key.trim(),
            preferredModel: s.preferredModel?.trim() || defaultGlobalModel,
            isDedicated: false,
          })),
        ];
      }

      return activeSlots.map((s, idx) => ({
        id: s.id,
        label: s.label || `Slot ${s.id}`,
        key: s.key.trim(),
        preferredModel: s.preferredModel?.trim() || defaultGlobalModel,
        isDedicated: idx === 0,
      }));
    }
  }

  // Fallback to master keys jika slot individual tidak terisi
  if (settings.gemini_master_keys) {
    const keys = settings.gemini_master_keys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    return keys.map((k, idx) => ({
      id: `master_${idx + 1}`,
      label: `Master Key #${idx + 1}`,
      key: k,
      preferredModel: defaultGlobalModel,
      isDedicated: false,
    }));
  }

  return [];
}

export function resolveGeminiKeysAndSlot(
  settings: {
    gemini_slots?: Array<{ id: string; label?: string; key: string; isActive: boolean; preferredModel?: string }>;
    gemini_master_keys?: string;
    global_gemini_slot?: string;
    pro_model?: string;
    free_model?: string;
  },
  userId?: string,
  assignedSlotId?: string | null,
  isPro?: boolean
): { keys: string[]; slotUsedLabel?: string; slotPreferredModel?: string; slotTargets: GeminiSlotTarget[] } {
  const targets = resolveOrderedGeminiSlots(settings, userId, assignedSlotId, isPro);
  if (targets.length > 0) {
    return {
      keys: targets.map((t) => t.key),
      slotUsedLabel: targets[0].label,
      slotPreferredModel: targets[0].preferredModel,
      slotTargets: targets,
    };
  }
  return { keys: [], slotTargets: [] };
}

export function getKeysFromSettings(
  settings: {
    gemini_slots?: Array<{ id: string; label?: string; key: string; isActive: boolean }>;
    gemini_master_keys?: string;
    global_gemini_slot?: string;
    pro_model?: string;
    free_model?: string;
  },
  userId?: string,
  assignedSlotId?: string | null,
  isPro?: boolean
): string[] {
  return resolveGeminiKeysAndSlot(settings, userId, assignedSlotId, isPro).keys;
}

export interface GeneratePRDOptions {
  apiKeyPool: KeyPoolManager;
  systemPrompt: string;
  userPrompt: string;
  preferredModel?: string;
  signal?: AbortSignal;
  slotTargets?: GeminiSlotTarget[];
}

export function createKeyPool(rawKeys: string[] | string): KeyPoolManager {
  const list = (Array.isArray(rawKeys) ? rawKeys : rawKeys.split(","))
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  return {
    keys: list,
    getAvailableKey(): string | null {
      const now = Date.now();
      for (const k of list) {
        const cd = keyCooldowns.get(k) || 0;
        if (now >= cd) {
          return k;
        }
      }
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
  const { apiKeyPool, systemPrompt, userPrompt, preferredModel, signal, slotTargets = [] } = options;

  let retries = 0;
  let fallbackCount = 0;
  const errorsCollected: string[] = [];

  // TAHAP 1: Eksekusi berurutan per-Slot Admin (Dedicated -> Pinned -> Other Active Slots)
  if (slotTargets.length > 0) {
    for (let slotIdx = 0; slotIdx < slotTargets.length; slotIdx++) {
      const target = slotTargets[slotIdx];
      const modelToUse = target.preferredModel?.trim() || preferredModel || 'gemini-3.1-flash-lite';
      const apiKey = target.key;

      if (!apiKey) continue;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;

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
            apiKeyPool.markCooldown(apiKey, 60000);
            retries++;
            errorsCollected.push(
              `Slot "${target.label}" (${modelToUse}) [HTTP 429 Rate Limit]`
            );
            break; // Coba slot aktif berikutnya
          }

          if (res.status === 503) {
            retries++;
            // Tunggu 1.5 detik jika attempt pertama kena lonjakan antrean Google
            if (attempt === 0) {
              await sleep(1500);
              continue;
            }
            errorsCollected.push(
              `Slot "${target.label}" (${modelToUse}) [HTTP 503 Antrean Google]`
            );
            break; // Coba slot aktif berikutnya
          }

          if (!res.ok) {
            const errText = await res.text();
            errorsCollected.push(
              `Slot "${target.label}" (${modelToUse}) [HTTP ${res.status}]: ${errText.slice(0, 120)}`
            );
            break; // Coba slot aktif berikutnya
          }

          const data = await res.json();
          const candidate = data?.candidates?.[0];
          const rawJsonText = candidate?.content?.parts?.[0]?.text;

          if (!rawJsonText) {
            throw new Error("Respons Gemini kosong atau tidak memiliki part teks");
          }

          const cleanedText = rawJsonText
            .trim()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "");

          const parsedJson = repairAndParseJSON(cleanedText);
          const validatedPRD = PRDOutputZodSchema.parse(parsedJson);

          return {
            ...validatedPRD,
            metadata: {
              modelUsed: modelToUse,
              generatedAt: new Date().toISOString(),
              retries,
              fallbackCount,
              geminiSlotUsed: target.label,
            },
          };
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") {
            throw err;
          }
          const errorMsg = err instanceof Error ? err.message : String(err);
          errorsCollected.push(`Slot "${target.label}" (${modelToUse}): ${errorMsg.slice(0, 120)}`);
          if (attempt === 0) {
            await sleep(1000);
          }
        }
      }

      fallbackCount++;
    }
  }

  // TAHAP 2: Jika seluruh slot admin gagal, gunakan Emergency Model Ladder
  const emergencyModels = MODEL_LADDER.filter((m) => !errorsCollected.some((e) => e.includes(`(${m})`)));

  for (let modelIdx = 0; modelIdx < emergencyModels.length; modelIdx++) {
    const currentModel = emergencyModels[modelIdx];
    const apiKey = apiKeyPool.getAvailableKey();
    if (!apiKey) continue;

    for (let attempt = 0; attempt < 2; attempt++) {
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
          apiKeyPool.markCooldown(apiKey, 60000);
          retries++;
          break;
        }

        if (res.status === 503) {
          retries++;
          if (attempt === 0) {
            await sleep(1200);
            continue;
          }
          break;
        }

        if (!res.ok) {
          const errText = await res.text();
          errorsCollected.push(
            `Cadangan [${currentModel}] [HTTP ${res.status}]: ${errText.slice(0, 100)}`
          );
          break;
        }

        const data = await res.json();
        const candidate = data?.candidates?.[0];
        const rawJsonText = candidate?.content?.parts?.[0]?.text;

        if (!rawJsonText) {
          throw new Error("Respons Gemini kosong");
        }

        const cleanedText = rawJsonText
          .trim()
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "");

        const parsedJson = repairAndParseJSON(cleanedText);
        const validatedPRD = PRDOutputZodSchema.parse(parsedJson);

        return {
          ...validatedPRD,
          metadata: {
            modelUsed: currentModel,
            generatedAt: new Date().toISOString(),
            retries,
            fallbackCount,
            geminiSlotUsed: "Emergency Fallback Ladder",
          },
        };
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          throw err;
        }
        retries++;
      }
    }

    fallbackCount++;
  }

  throw new Error(
    `Semua Slot Gemini dan Model Cadangan gagal dieksekusi.\nRiwayat kegagalan:\n- ${errorsCollected.join("\n- ")}`
  );
}

export interface ExecuteGeminiStageOptions<T> {
  apiKeyPool: KeyPoolManager;
  systemPrompt: string;
  userPrompt: string;
  responseSchema: Record<string, any>;
  zodSchema: z.ZodType<T>;
  stageName?: string;
  preferredModel?: string;
  signal?: AbortSignal;
  slotTargets?: GeminiSlotTarget[];
  maxOutputTokens?: number;
}

export async function executeGeminiStageJson<T>(
  options: ExecuteGeminiStageOptions<T>
): Promise<{ data: T; modelUsed: string; slotUsed: string }> {
  const {
    apiKeyPool,
    systemPrompt,
    userPrompt,
    responseSchema,
    zodSchema,
    stageName = "Stage",
    preferredModel,
    signal,
    slotTargets = [],
    maxOutputTokens = 16384,
  } = options;

  let retries = 0;
  const errorsCollected: string[] = [];

  // TAHAP 1: Eksekusi berurutan per-Slot Admin
  if (slotTargets.length > 0) {
    for (let slotIdx = 0; slotIdx < slotTargets.length; slotIdx++) {
      const target = slotTargets[slotIdx];
      const modelToUse = target.preferredModel?.trim() || preferredModel || 'gemini-3.1-flash-lite';
      const apiKey = target.key;
      if (!apiKey) continue;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;
          const payload = {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema,
              temperature: 0.3,
              maxOutputTokens,
            },
          };

          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: signal || AbortSignal.timeout(90000),
          });

          if (res.status === 429) {
            apiKeyPool.markCooldown(apiKey, 60000);
            retries++;
            errorsCollected.push(`[${stageName}] Slot "${target.label}" (${modelToUse}) [HTTP 429 Rate Limit]`);
            break;
          }

          if (res.status === 503) {
            retries++;
            if (attempt === 0) {
              await sleep(1500);
              continue;
            }
            errorsCollected.push(`[${stageName}] Slot "${target.label}" (${modelToUse}) [HTTP 503 Antrean Google]`);
            break;
          }

          if (!res.ok) {
            const errText = await res.text();
            errorsCollected.push(`[${stageName}] Slot "${target.label}" (${modelToUse}) [HTTP ${res.status}]: ${errText.slice(0, 120)}`);
            break;
          }

          const data = await res.json();
          const candidate = data?.candidates?.[0];
          const rawJsonText = candidate?.content?.parts?.[0]?.text;
          if (!rawJsonText) {
            throw new Error(`Respons Gemini pada [${stageName}] kosong`);
          }

          const cleanedText = rawJsonText
            .trim()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "");

          const parsedJson = repairAndParseJSON(cleanedText);
          const validated = zodSchema.parse(parsedJson);

          return {
            data: validated,
            modelUsed: modelToUse,
            slotUsed: target.label,
          };
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") throw err;
          const errorMsg = err instanceof Error ? err.message : String(err);
          errorsCollected.push(`[${stageName}] Slot "${target.label}" (${modelToUse}): ${errorMsg.slice(0, 120)}`);
          if (attempt === 0) await sleep(1000);
        }
      }
    }
  }

  // TAHAP 2: Emergency Model Ladder
  const emergencyModels = MODEL_LADDER.filter((m) => !errorsCollected.some((e) => e.includes(`(${m})`)));

  for (let modelIdx = 0; modelIdx < emergencyModels.length; modelIdx++) {
    const currentModel = emergencyModels[modelIdx];
    const apiKey = apiKeyPool.getAvailableKey();
    if (!apiKey) continue;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
        const payload = {
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.3,
            maxOutputTokens,
          },
        };

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: signal || AbortSignal.timeout(90000),
        });

        if (res.status === 429) {
          apiKeyPool.markCooldown(apiKey, 60000);
          retries++;
          break;
        }

        if (res.status === 503) {
          retries++;
          if (attempt === 0) {
            await sleep(1200);
            continue;
          }
          break;
        }

        if (!res.ok) {
          const errText = await res.text();
          errorsCollected.push(`[${stageName}] Cadangan [${currentModel}] [HTTP ${res.status}]: ${errText.slice(0, 100)}`);
          break;
        }

        const data = await res.json();
        const candidate = data?.candidates?.[0];
        const rawJsonText = candidate?.content?.parts?.[0]?.text;
        if (!rawJsonText) throw new Error("Respons Gemini kosong");

        const cleanedText = rawJsonText
          .trim()
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "");

        const parsedJson = repairAndParseJSON(cleanedText);
        const validated = zodSchema.parse(parsedJson);

        return {
          data: validated,
          modelUsed: currentModel,
          slotUsed: "Emergency Fallback Ladder",
        };
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") throw err;
        retries++;
      }
    }
  }

  throw new Error(`[${stageName}] Gagal dieksekusi oleh semua slot & model cadangan.\n- ${errorsCollected.join("\n- ")}`);
}

export async function generateClarifications(options: {
  apiKeyPool: KeyPoolManager;
  userIdea: string;
  prompt: string;
  preferredModel?: string;
  slotTargets?: GeminiSlotTarget[];
}): Promise<ClarificationQuestion[]> {
  const { apiKeyPool, userIdea, prompt, preferredModel, slotTargets = [] } = options;
  let errorsCollected: string[] = [];

  // TAHAP 1: Eksekusi berurutan per-Slot Admin
  if (slotTargets.length > 0) {
    for (let slotIdx = 0; slotIdx < slotTargets.length; slotIdx++) {
      const target = slotTargets[slotIdx];
      const modelToUse = target.preferredModel?.trim() || preferredModel || 'gemini-3.1-flash-lite';
      const apiKey = target.key;
      if (!apiKey) continue;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;
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

          if (res.status === 429) {
            apiKeyPool.markCooldown(apiKey, 30000);
            break;
          }

          if (res.status === 503) {
            if (attempt === 0) {
              await sleep(1500);
              continue;
            }
            break;
          }

          if (!res.ok) {
            break;
          }

          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) continue;

          const parsed = repairAndParseJSON(rawText);
          return normalizeAndSanitizeClarifications(parsed);
        } catch {
          if (attempt === 0) await sleep(1000);
        }
      }
    }
  }

  // TAHAP 2: Emergency Model Ladder
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
  slotTargets?: GeminiSlotTarget[];
}): Promise<any[]> {
  const { apiKeyPool, idea, prompt, preferredModel, answers = {}, questions = [], slotTargets = [] } = options;

  // TAHAP 1: Eksekusi berurutan per-Slot Admin
  if (slotTargets.length > 0) {
    for (let slotIdx = 0; slotIdx < slotTargets.length; slotIdx++) {
      const target = slotTargets[slotIdx];
      const modelToUse = target.preferredModel?.trim() || preferredModel || 'gemini-3.1-flash-lite';
      const apiKey = target.key;
      if (!apiKey) continue;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;
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

          if (res.status === 429) {
            apiKeyPool.markCooldown(apiKey, 30000);
            break;
          }

          if (res.status === 503) {
            if (attempt === 0) {
              await sleep(1500);
              continue;
            }
            break;
          }

          if (!res.ok) {
            break;
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
          if (attempt === 0) await sleep(1000);
        }
      }
    }
  }

  // TAHAP 2: Emergency Model Ladder
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
