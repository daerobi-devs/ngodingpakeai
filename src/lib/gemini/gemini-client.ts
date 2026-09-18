import {
  geminiPRDResponseSchema,
  PRDOutputZodSchema,
  clarificationResponseSchema,
  ClarificationOutputZodSchema,
} from "./schemas";
import { PRDOutput, ClarificationQuestion } from "@/types/prd";

// Active high-performance model hierarchy ladder proven on Google AI Studio
export const MODEL_LADDER = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
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

export function getKeysFromSettings(
  settings: {
    gemini_slots?: Array<{ id: string; key: string; isActive: boolean }>;
    gemini_master_keys?: string;
  },
  userId?: string
): string[] {
  if (settings.gemini_slots && settings.gemini_slots.length > 0) {
    const activeSlots = settings.gemini_slots.filter(
      (s) => s.isActive && s.key && s.key.trim().length > 0
    );
    if (activeSlots.length > 0) {
      if (userId) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
          hash = (hash << 5) - hash + userId.charCodeAt(i);
          hash |= 0;
        }
        const primaryIdx = Math.abs(hash) % activeSlots.length;
        const primary = activeSlots[primaryIdx].key.trim();
        const others = activeSlots
          .filter((_, idx) => idx !== primaryIdx)
          .map((s) => s.key.trim());
        return [primary, ...others];
      }
      return activeSlots.map((s) => s.key.trim());
    }
  }

  if (settings.gemini_master_keys) {
    return settings.gemini_master_keys
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }

  return [];
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
            maxOutputTokens: 8192,
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

        const parsedJson = JSON.parse(cleanedText);

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
  const { apiKeyPool, prompt, preferredModel } = options;
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

      const parsed = JSON.parse(
        rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "")
      );
      const validated = ClarificationOutputZodSchema.parse(parsed);
      return validated.questions;
    } catch (e: unknown) {
      errorsCollected.push(e instanceof Error ? e.message : String(e));
    }
  }

  // Graceful fallback questions if AI fails
  return [
    {
      id: "q_target_user",
      category: "target_user",
      question: "Ceritakan seseorang yang paling butuh aplikasi ini. Sekarang mereka ngapain buat mengatasi masalahnya?",
      options: [
        { id: "opt_manual_wa", label: "Catat manual di kertas & chat WhatsApp", description: "Sering lupa stok dan jadwal bentrok" },
        { id: "opt_excel_sheet", label: "Pakai Google Spreadsheet / Excel", description: "Ribet update tiap saat dan tidak otomatis" },
        { id: "opt_direct_call", label: "Telepon & tanya ketersediaan manual", description: "Banyak waktu terbuang untuk konfirmasi" },
        { id: "opt_no_system", label: "Belum punya sistem sama sekali", description: "Pelanggan sering komplain karena pelayanan lambat" },
      ],
      recommendedOptionId: "opt_manual_wa",
      isMultiSelect: false,
      inputType: "chips",
    },
    {
      id: "q_first_action",
      category: "core_flow",
      question: "Kalau orang buka aplikasi ini pertama kali, satu hal apa yang harus mereka selesaikan sebelum nutup aplikasi?",
      options: [
        { id: "opt_view_catalog", label: "Lihat katalog barang/layanan yang tersedia", description: "Langsung tahu pilihan dan harga tanpa ribet" },
        { id: "opt_first_booking", label: "Buat pesanan / booking pertama", description: "Konversi langsung dalam hitungan menit" },
        { id: "opt_check_date", label: "Cek jadwal & slot ketersediaan tanggal", description: "Memastikan slot masih tersedia" },
        { id: "opt_register", label: "Daftar akun / login profil", description: "Menyimpan data identitas awal" },
      ],
      recommendedOptionId: "opt_view_catalog",
      isMultiSelect: false,
      inputType: "chips",
    },
    {
      id: "q_core_features",
      category: "feature_priority",
      question: "Pilih 3 fitur yang paling wajib ada di aplikasi ini untuk rilis awal (MVP):",
      options: [
        { id: "opt_catalog_filter", label: "Katalog & Filter Pencarian Cepat", description: "Cari berdasarkan nama, kategori, dan harga" },
        { id: "opt_order_flow", label: "Formulir Booking / Pesanan Instan", description: "Isi data dan durasi tanpa berbelit-belit" },
        { id: "opt_wa_direct", label: "Kirim Ringkasan Pesanan ke WhatsApp", description: "Notifikasi otomatis ke admin & pelanggan via WA" },
        { id: "opt_admin_dash", label: "Dashboard Kelola Pesanan & Stok Admin", description: "Pantau pesanan masuk dan ubah status" },
        { id: "opt_payment_qris", label: "Pembayaran Online / QRIS Otomatis", description: "Verifikasi pembayaran otomatis" },
        { id: "opt_date_calendar", label: "Kalender Jadwal Ketersediaan", description: "Cegah double-booking pada tanggal yang sama" },
      ],
      recommendedOptionId: "opt_catalog_filter",
      isMultiSelect: true,
      inputType: "chips",
    },
    {
      id: "q_differentiator",
      category: "value_proposition",
      question: "Apa yang bikin aplikasi ini lebih enak dipakai dibanding cara biasa saat ini?",
      options: [
        { id: "opt_fast_search", label: "Lebih cepat cari & cek stok barang", description: "Tidak perlu menunggu balasan admin berjam-jam" },
        { id: "opt_clear_pricing", label: "Rincian harga & syarat sewa transparan", description: "Tidak ada biaya tersembunyi" },
        { id: "opt_no_calls", label: "Gak perlu repot telepon atau bolak-balik chat", description: "Semua informasi lengkap di layar" },
        { id: "opt_order_home", label: "Bisa booking langsung dari rumah 24 jam", description: "Akses fleksibel kapan pun dibutuhkan" },
      ],
      recommendedOptionId: "opt_fast_search",
      isMultiSelect: false,
      inputType: "chips",
    },
    {
      id: "q_retention",
      category: "retention_trigger",
      question: "Apa yang bikin orang akan balik lagi pakai aplikasi ini, bukan cuma coba sekali?",
      options: [
        { id: "opt_smooth_experience", label: "Proses cepat, anti ribet, & minim klik", description: "Pengalaman pengguna menyenangkan" },
        { id: "opt_complete_items", label: "Katalog selalu terupdate & stok akurat", description: "Pelanggan percaya ketersediaan barang" },
        { id: "opt_order_history", label: "Riwayat pesanan tersimpan rapi", description: "Gampang pesan ulang tanpa input data lagi" },
        { id: "opt_loyalty_promo", label: "Poin loyalitas & potongan harga berkala", description: "Reward untuk pelanggan setia" },
      ],
      recommendedOptionId: "opt_smooth_experience",
      isMultiSelect: false,
      inputType: "chips",
    },
  ];
}
