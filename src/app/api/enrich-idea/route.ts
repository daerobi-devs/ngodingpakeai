import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SystemSettings } from "@/lib/supabase/types";
import { enrichIdeaUnified, synthesizeDynamicEnrichedIdea } from "@/lib/ai/ai-service";

export async function POST(req: NextRequest) {
  let userIdea = "";
  let language: "id" | "en" = "id";
  let templateId = "starter";

  try {
    const body = await req.json();
    userIdea = typeof body.userIdea === "string" ? body.userIdea.trim() : "";
    language = body.language === "en" ? "en" : "id";
    templateId = body.templateId || "starter";

    if (!userIdea) {
      return NextResponse.json(
        { success: false, error: "Ide produk tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Load System Settings
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
      // Use fallback defaults
    }

    const userGeminiKey = req.headers.get("x-gemini-api-key") || "";
    const userPreferredModel = req.headers.get("x-gemini-preferred-model") || undefined;

    const enrichedResult = await enrichIdeaUnified({
      systemSettings,
      userGeminiKey,
      userIdea,
      language,
      templateId,
      userPreferredModel,
    });

    return NextResponse.json({
      success: true,
      enrichedIdea: enrichedResult || synthesizeDynamicEnrichedIdea(userIdea, language, templateId),
    });
  } catch (error: any) {
    console.error("Error in enrich-idea API:", error);
    // Dynamic topic-aware synthesis fallback instead of generic static hardcode
    const fallbackResult = synthesizeDynamicEnrichedIdea(userIdea || "Aplikasi Web", language, templateId);
    return NextResponse.json({
      success: true,
      enrichedIdea: fallbackResult,
    });
  }
}
