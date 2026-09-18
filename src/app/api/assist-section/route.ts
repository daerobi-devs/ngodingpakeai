import { NextRequest, NextResponse } from "next/server";
import { createKeyPool } from "@/lib/gemini/gemini-client";
import { buildSectionAssistantPrompt } from "@/lib/gemini/prompts";
import { SectionKey } from "@/types/prd";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sectionKey, currentValues, userMessage } = body as {
      sectionKey: SectionKey;
      currentValues: Record<string, string>;
      userMessage?: string;
    };

    if (!sectionKey) {
      return NextResponse.json(
        { error: "Section key harus disertakan" },
        { status: 400 }
      );
    }

    const headerKeys = req.headers.get("x-gemini-api-key") || "";
    const envKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    const combinedKeys = [
      ...headerKeys.split(",").map((k) => k.trim()),
      ...envKeys.split(",").map((k) => k.trim()),
    ].filter((k) => k.length > 0);

    if (combinedKeys.length === 0) {
      return NextResponse.json(
        {
          error:
            "Gemini API Key belum dimasukkan. Silakan atur di Pengaturan UI.",
        },
        { status: 401 }
      );
    }

    const keyPool = createKeyPool(combinedKeys);
    const apiKey = keyPool.getAvailableKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Tidak ada API key yang siap digunakan." },
        { status: 429 }
      );
    }

    const promptText = buildSectionAssistantPrompt(
      sectionKey,
      currentValues || {},
      userMessage
    );

    // Try fast models first for interactive assistant
    const preferredModel = req.headers.get("x-gemini-preferred-model");
    const baseAssistantModels = [
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-flash-latest",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
    ];
    const assistantModels = preferredModel
      ? [preferredModel, ...baseAssistantModels.filter((m) => m !== preferredModel)]
      : baseAssistantModels;

    let lastError = "";

    for (const model of assistantModels) {
      try {
        const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
        const response = await fetch(streamUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!response.ok || !response.body) {
          const errText = await response.text();
          lastError = `Model ${model} gagal: ${errText.slice(0, 100)}`;
          continue;
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const customStream = new ReadableStream({
          async start(controller) {
            const reader = response.body!.getReader();
            let buffer = "";

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed.startsWith("data: ")) {
                    const jsonStr = trimmed.slice(6).trim();
                    if (jsonStr === "[DONE]") continue;

                    try {
                      const parsed = JSON.parse(jsonStr);
                      const chunkText =
                        parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                      if (chunkText) {
                        controller.enqueue(encoder.encode(chunkText));
                      }
                    } catch {
                      // ignore json chunk parse error
                    }
                  }
                }
              }
            } catch (err) {
              controller.error(err);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(customStream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    return NextResponse.json(
      { error: `Gagal menjalankan asisten section: ${lastError}` },
      { status: 500 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan internal pada asisten",
      },
      { status: 500 }
    );
  }
}
