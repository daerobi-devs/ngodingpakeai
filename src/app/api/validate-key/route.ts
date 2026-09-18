import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { valid: false, message: "API key kosong atau format tidak valid" },
        { status: 400 }
      );
    }

    // Ping gemini models endpoint
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`
    );

    if (res.ok) {
      const data = await res.json();
      const models = (data.models || []).map((m: { name: string }) =>
        m.name.replace("models/", "")
      );
      return NextResponse.json({
        valid: true,
        message: "API Key valid & terhubung ke Google AI Studio!",
        availableModels: models.filter((m: string) => m.toLowerCase().includes("gemini")),
      });
    } else {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({
        valid: false,
        message:
          err?.error?.message ||
          `API Key ditolak oleh Google AI Studio (HTTP ${res.status})`,
      });
    }
  } catch (error: unknown) {
    return NextResponse.json({
      valid: false,
      message:
        error instanceof Error ? error.message : "Gagal menguji koneksi API Key",
    });
  }
}
