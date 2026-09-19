import { NextRequest, NextResponse } from "next/server";
import { generateClarificationsUnified } from "@/lib/ai/ai-service";
import { buildClarificationPrompt } from "@/lib/gemini/prompts";
import { getDomainDiscoveryQuestions } from "@/lib/gemini/domain-discovery";
import { createAdminClient } from "@/lib/supabase/admin";
import { Profile, SystemSettings } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  let userIdea = "";
  try {
    const body = await req.json();
    userIdea = body.userIdea || "";
    const templateId = body.templateId;
    const language = body.language || 'id';
    const userId = body.userId;

    if (!userIdea.trim()) {
      return NextResponse.json(
        { success: false, error: "Ide produk tidak boleh kosong" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    let systemSettings: SystemSettings = {
      id: "default",
      auth_mode: "hybrid",
      api_key_mode: "byok_only",
      monetization_mode: "freemium",
      ai_provider: "gemini_direct",
      trial_limit: 1,
      qris_merchant_name: "NGODINGPAKEPRD OFFICIAL",
      pro_price_rp: 49000,
      pro_price_formatted: "Rp 49.000 / Lifetime Access",
    };

    try {
      const { data: dbSettings } = await adminSupabase
        .from("system_settings")
        .select("*")
        .eq("id", "default")
        .single();
      if (dbSettings) {
        systemSettings = dbSettings as SystemSettings;
      }
    } catch {
      // use default fallback
    }

    // Strict Login Mode Enforcement
    let userProfile: Profile | null = null;
    if (userId) {
      const { data: prof } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (prof) userProfile = prof as Profile;
    }

    if (systemSettings.auth_mode === 'strict_login' && !userProfile) {
      return NextResponse.json(
        { success: false, error: 'Akses dibatasi. Silakan Login menggunakan Akun Google terlebih dahulu.' },
        { status: 401 }
      );
    }

    const userGeminiKey = req.headers.get("x-gemini-api-key") || "";
    const userPreferredModel = req.headers.get("x-gemini-preferred-model") || undefined;
    const prompt = buildClarificationPrompt(userIdea, templateId, language);

    const questions = await generateClarificationsUnified({
      systemSettings,
      userGeminiKey,
      userIdea,
      prompt,
      userPreferredModel,
    });

    return NextResponse.json({
      success: true,
      data: {
        userIdea,
        questions,
      },
    });
  } catch (error: unknown) {
    console.error("Error in generate-clarifications:", error);
    const fallback = getDomainDiscoveryQuestions(userIdea || "Aplikasi Web");
    return NextResponse.json({
      success: true,
      data: {
        userIdea,
        questions: fallback,
      },
    });
  }
}

