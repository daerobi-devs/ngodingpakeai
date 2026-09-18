import { NextRequest, NextResponse } from "next/server";
import { createKeyPool, getKeysFromSettings } from "@/lib/gemini/gemini-client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { idea, clarifications } = await req.json();

    if (!idea || typeof idea !== "string" || !idea.trim()) {
      return NextResponse.json(
        { error: "Ide produk tidak boleh kosong" },
        { status: 400 }
      );
    }

    let headerKeys = req.headers.get("x-gemini-api-key") || "";
    let envKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";

    // If client keys empty, fallback to system_settings server-managed keys
    let masterKeys = "";
    if (!headerKeys.trim() && !envKeys.trim()) {
      try {
        const adminSupabase = createAdminClient();
        const { data } = await adminSupabase
          .from("system_settings")
          .select("gemini_master_keys, gemini_slots")
          .eq("id", "default")
          .single();
        if (data) {
          const keys = getKeysFromSettings(data);
          if (keys.length > 0) {
            masterKeys = keys.join(",");
          }
        }
      } catch (e) {
        console.warn("Could not fetch master keys from db:", e);
      }
    }

    const combinedKeys = [
      ...headerKeys.split(",").map((k) => k.trim()),
      ...envKeys.split(",").map((k) => k.trim()),
      ...masterKeys.split(",").map((k) => k.trim()),
    ].filter((k) => k.length > 0);

    if (combinedKeys.length === 0) {
      return NextResponse.json(
        { error: "Gemini API Key belum dimasukkan di Pengaturan UI atau Admin Dashboard." },
        { status: 401 }
      );
    }

    const keyPool = createKeyPool(combinedKeys);
    const apiKey = keyPool.getAvailableKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Semua API key sedang cooldown (429)" },
        { status: 429 }
      );
    }

    const systemPrompt = `Kamu adalah Principal Product Architect.
Tugasmu adalah mengubah ide kasar produk dari user menjadi draft data form PRD lengkap 7 kategori yang mendalam, realistis, dan presisi.

Output HARUS berupa JSON murni dengan format persis seperti ini:
{
  "title": "Nama inisiatif produk yang profesional",
  "opportunity_framing": {
    "core_problem": "Masalah inti terukur yang dihadapi user",
    "working_hypothesis": "Solusi terukur dan mekanisme nilainya",
    "strategy_fit": "Dampak strategis jangka panjang"
  },
  "boundaries": {
    "scope": "- Fitur 1\\n- Fitur 2\\n- Fitur 3\\n- Fitur 4",
    "non_goals": "- Batasan 1 yang sengaja tidak dikerjakan\\n- Batasan 2"
  },
  "success_measurement": {
    "offline_golden_set": "Data uji validasi benchmark",
    "human_review": "Mekanisme audit kualitatif manusia",
    "online_metrics": "KPI kuantitatif dengan threshold (misal latency, error rate, konversi)"
  },
  "rollout_plan": {
    "exposure": "Tahapan persentase rilis (Canary 5% -> 25% -> 100%)",
    "duration": "Estimasi durasi uji coba",
    "segments_gates": "Kriteria kelayakan naik tahap"
  },
  "risk_management": {
    "detection": "Cara deteksi dini anomali dan error",
    "fallback_kill_switch": "Mekanisme fallback dan tombol kill-switch darurat"
  },
  "ownership_action": {
    "primary_owner": "Penanggung jawab utama (Tech Lead & PM)",
    "decision_points": "Jadwal evaluasi keputusan berkala"
  },
  "ai_specific": {
    "behavior_contract": "GOOD:\\n1. [Hal baik wajib]\\n2. [Hal baik wajib]\\n\\nREJECT:\\n1. [Hal dilarang]\\n2. [Hal dilarang]",
    "guardrails": "Batasan teknis keamanan, rate limit, dan privasi PII"
  }
}
DILARANG memberikan teks selain JSON. Gunakan Bahasa Indonesia profesional.`;

    let userPrompt = `Ide produk user: "${idea.trim()}"`;
    if (clarifications && typeof clarifications === "object" && Object.keys(clarifications).length > 0) {
      userPrompt += `\n\nSpesifikasi & Keputusan Teknis yang Dipilih User:`;
      for (const [key, val] of Object.entries(clarifications)) {
        userPrompt += `\n- ${key}: ${val}`;
      }
      userPrompt += `\n\nWAJIB selaraskan tumpukan teknologi, alur, dan batasan di seluruh 7 kategori form dengan keputusan di atas!`;
    }
    userPrompt += `\n\nHasilkan form PRD 7 kategori lengkap!`;

    const preferredModel = req.headers.get("x-gemini-preferred-model");
    const baseModels = [
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-flash-latest",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-flash-lite-latest",
    ];
    const modelsToTry = preferredModel
      ? [preferredModel, ...baseModels.filter((m) => m !== preferredModel)]
      : baseModels;

    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.4,
            },
          }),
          signal: AbortSignal.timeout(20000),
        });

        if (!res.ok) {
          lastError = `HTTP ${res.status}`;
          continue;
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        const cleaned = rawText
          .trim()
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "");

        const parsed = JSON.parse(cleaned);
        return NextResponse.json({ success: true, data: parsed });
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    return NextResponse.json(
      { error: `Gagal auto-generate form: ${lastError}` },
      { status: 500 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan pada auto-fill PRD",
      },
      { status: 500 }
    );
  }
}
