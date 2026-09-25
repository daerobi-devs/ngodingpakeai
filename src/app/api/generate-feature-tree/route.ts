import { NextRequest, NextResponse } from "next/server";
import { generateFeatureTreeUnified } from "@/lib/ai/ai-service";
import { buildFeatureTreePrompt } from "@/lib/gemini/prompts";
import { synthesizeDomainFeatureModules } from "@/lib/gemini/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { Profile, SystemSettings } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  let userIdea = "";
  let answers: Record<string, string[]> = {};
  let questions: any[] = [];

  try {
    const body = await req.json();
    userIdea = body.idea || body.userIdea || "";
    const techStack = body.techStack;
    const formData = body.formData;
    answers = body.answers || {};
    questions = body.questions || [];
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

    const prompt = buildFeatureTreePrompt({
      idea: userIdea,
      techStack,
      formData,
      answers,
      questions,
      language,
    });

    const isPaidTier = userProfile?.subscription_tier === 'pro' || userProfile?.subscription_tier === 'plus' || Boolean(userProfile?.is_admin);

    const modules = await generateFeatureTreeUnified({
      systemSettings,
      userGeminiKey,
      idea: userIdea,
      prompt,
      isPro: isPaidTier,
      userId: userProfile?.id || userId,
      userPreferredModel,
      answers,
      questions,
    });

    return NextResponse.json({
      success: true,
      data: {
        idea: userIdea,
        modules,
      },
    });
  } catch (error: unknown) {
    console.error("Error in generate-feature-tree:", error);
    const fallback = synthesizeDomainFeatureModules(userIdea || "Aplikasi Web", answers, questions);
    return NextResponse.json({
      success: true,
      data: {
        idea: userIdea,
        modules: fallback,
      },
    });
  }
}
