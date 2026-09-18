import { NextRequest, NextResponse } from "next/server";
import { createKeyPool, generateClarifications, getKeysFromSettings } from "@/lib/gemini/gemini-client";
import { buildClarificationPrompt } from "@/lib/gemini/prompts";
import { getDomainDiscoveryQuestions } from "@/lib/gemini/domain-discovery";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userIdea: string = body.userIdea || "";

    if (!userIdea.trim()) {
      return NextResponse.json(
        { success: false, error: "Ide produk tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Instant domain-specific fallback questions ready in < 5ms
    const domainQuestions = getDomainDiscoveryQuestions(userIdea);

    let headerKeys = req.headers.get("x-gemini-api-key") || "";
    let envKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";

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
        console.warn("Could not fetch master keys:", e);
      }
    }

    const combinedKeys = [
      ...headerKeys.split(",").map((k) => k.trim()),
      ...envKeys.split(",").map((k) => k.trim()),
      ...masterKeys.split(",").map((k) => k.trim()),
    ].filter((k) => k.length > 0);

    // If no keys configured, return instant domain questions without error
    if (combinedKeys.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          userIdea,
          questions: domainQuestions,
        },
      });
    }

    const keyPool = createKeyPool(combinedKeys);
    const prompt = buildClarificationPrompt(userIdea);
    const preferredModel = req.headers.get("x-gemini-preferred-model") || undefined;

    // Fast AI race with 3.5s timeout: if Gemini is slow or fails, seamlessly use domain questions!
    const aiPromise = generateClarifications({
      apiKeyPool: keyPool,
      userIdea,
      prompt,
      preferredModel,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI clarification timeout (fallback to domain)")), 3500)
    );

    let questions = domainQuestions;
    try {
      questions = await Promise.race([aiPromise, timeoutPromise]);
    } catch (raceErr) {
      console.warn("Using instant domain discovery questions:", raceErr);
      questions = domainQuestions;
    }

    return NextResponse.json({
      success: true,
      data: {
        userIdea,
        questions,
      },
    });
  } catch (error: unknown) {
    console.error("Error in generate-clarifications:", error);
    const body = await req.json().catch(() => ({}));
    const fallback = getDomainDiscoveryQuestions(body?.userIdea || "Aplikasi Web");
    return NextResponse.json({
      success: true,
      data: {
        userIdea: body?.userIdea || "",
        questions: fallback,
      },
    });
  }
}
