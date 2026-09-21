"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { BeginnerRoadmap } from "@/components/BeginnerRoadmap";
import { InteractiveBlueprintStudio } from "@/components/landing/InteractiveBlueprintStudio";
import { VisualWorkflowPipeline } from "@/components/landing/VisualWorkflowPipeline";
import { LandingTemplateShowcase } from "@/components/landing/LandingTemplateShowcase";
import { StudioFeatureShowcase } from "@/components/landing/StudioFeatureShowcase";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import {
  CursorLogo,
  AntigravityLogo,
  ClaudeLogo,
  WindsurfLogo,
  VsCodeLogo,
} from "@/components/icons/AgentIcons";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  Layers,
  Network,
  Palette,
  Package,
  CheckCircle2,
  XCircle,
  FileCode2,
  Bot,
  Zap,
  Shield,
  FileText,
  Workflow,
  ChevronRight,
  Users,
  Compass,
  Database,
  Terminal,
  Cpu,
  BookmarkCheck,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, systemSettings } = useAuth();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isLight = theme === "light";

  const isStrictLogin = systemSettings?.auth_mode === "strict_login";

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("prd_preferred_theme") as "dark" | "light" | null;
      if (storedTheme === "dark" || storedTheme === "light") {
        setTheme(storedTheme);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("prd_preferred_theme", next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleStartGenerator = () => {
    if (isStrictLogin && !user) {
      setIsAuthModalOpen(true);
      return;
    }
    router.push("/generator");
  };

  return (
    <div className={`flex min-h-screen flex-col transition-colors ${
      isLight
        ? "bg-[#f8fafc] text-slate-900 selection:bg-amber-500/20 selection:text-amber-800"
        : "bg-[#09090b] text-zinc-100 selection:bg-amber-500/20 selection:text-amber-200"
    }`}>
      {/* Top Announcement Banner */}
      <AnnouncementBanner />

      {/* Navbar — Always Black bg-[#09090b] as required */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenGenerator={handleStartGenerator}
        isLandingPage={true}
      />

      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/10 via-amber-500/0 to-transparent blur-3xl -z-10 pointer-events-none" />

          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center space-y-8">

            {/* Punchy Hero Headline - Solid, No Layout Shift */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-balance">
                <span className={isLight ? "text-slate-900" : "text-white"}>
                  Stop Ngoding Tanpa Arah.{" "}
                </span>
                <span className="text-amber-500">
                  Rancang Arsitektur &amp; Task AI dalam Hitungan Detik.
                </span>
              </h1>
              <p className={`mx-auto max-w-2xl text-base sm:text-lg leading-relaxed ${
                isLight ? "text-slate-600" : "text-zinc-400"
              }`}>
                Ubah 1 kalimat ide menjadi PRD terstruktur, 5 blueprint arsitektur visual, papan Kanban, dan server MCP yang terhubung langsung ke AI coding agent Anda.
              </p>
            </div>

            {/* Single Punchy Primary CTA */}
            <div className="flex items-center justify-center pt-2">
              <button
                type="button"
                onClick={handleStartGenerator}
                className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-7 py-3.5 text-sm font-extrabold text-zinc-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Mulai Buat PRD Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* AI Agent Compatibility Badges with Authentic SVGs */}
            <div className="pt-8 space-y-3">
              <span className={`text-[11px] font-mono tracking-wider uppercase font-semibold block ${
                isLight ? "text-slate-500" : "text-zinc-500"
              }`}>
                Didesain Khusus untuk Ekosistem AI Coding Agent
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isLight ? "bg-white border-slate-200 text-slate-800 shadow-xs" : "bg-zinc-900/80 border-zinc-800 text-zinc-200"
                }`}>
                  <CursorLogo className="h-3.5 w-3.5 text-white" />
                  <span>Cursor IDE</span>
                </span>

                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isLight ? "bg-white border-slate-200 text-slate-800 shadow-xs" : "bg-zinc-900/80 border-zinc-800 text-zinc-200"
                }`}>
                  <AntigravityLogo className="h-4 w-4" />
                  <span>Google Antigravity</span>
                </span>

                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isLight ? "bg-white border-slate-200 text-slate-800 shadow-xs" : "bg-zinc-900/80 border-zinc-800 text-zinc-200"
                }`}>
                  <ClaudeLogo className="h-3.5 w-3.5" />
                  <span>Anthropic Claude Code</span>
                </span>

                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isLight ? "bg-white border-slate-200 text-slate-800 shadow-xs" : "bg-zinc-900/80 border-zinc-800 text-zinc-200"
                }`}>
                  <WindsurfLogo className="h-3.5 w-3.5" />
                  <span>Windsurf Editor</span>
                </span>

                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isLight ? "bg-white border-slate-200 text-slate-800 shadow-xs" : "bg-zinc-900/80 border-zinc-800 text-zinc-200"
                }`}>
                  <VsCodeLogo className="h-3.5 w-3.5" />
                  <span>VS Code (Cline / Roo)</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 1: STUDIO & MCP AGENTIC ECOSYSTEM ================= */}
        <section id="studio-features" className={`mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t transition-colors ${
          isLight ? "border-slate-200" : "border-zinc-800/80"
        }`}>
          <StudioFeatureShowcase theme={theme} />
        </section>

        {/* ================= SECTION 2: 5 BLUEPRINT MERMAID ================= */}
        <section id="diagrams" className={`mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t transition-colors ${
          isLight ? "border-slate-200" : "border-zinc-800/80"
        }`}>
          <InteractiveBlueprintStudio theme={theme} />
        </section>

        {/* ================= SECTION 3: CARA KERJA ================= */}
        <section id="workflow" className={`mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t transition-colors ${
          isLight ? "border-slate-200" : "border-zinc-800/80"
        }`}>
          <VisualWorkflowPipeline theme={theme} />
        </section>

        {/* ================= SECTION 4: PRESET ARCHITECTURE TEMPLATES SHOWCASE ================= */}
        <section id="templates" className={`mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t transition-colors ${
          isLight ? "border-slate-200" : "border-zinc-800/80"
        }`}>
          <LandingTemplateShowcase theme={theme} />
        </section>

        {/* ================= SECTION 5: ROADMAP PEMULA & STARTER PROMPT ================= */}
        <section id="roadmap" className={`mx-auto max-w-6xl px-4 sm:px-6 py-16 border-t transition-colors ${
          isLight ? "border-slate-200" : "border-zinc-800/80"
        }`}>
          <BeginnerRoadmap theme={theme} />
        </section>

        {/* ================= SECTION 6: FAQ ACCORDION ================= */}
        <section id="faq" className={`mx-auto max-w-6xl px-4 sm:px-6 py-16 pb-24 border-t transition-colors ${
          isLight ? "border-slate-200" : "border-zinc-800/80"
        }`}>
          <LandingFAQ theme={theme} />
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t py-8 text-xs ${
        isLight ? "border-slate-200 text-slate-500 bg-white" : "border-zinc-800 text-zinc-500 bg-[#09090b]"
      }`}>
        <div className="mx-auto max-w-6xl px-4 space-y-5">
          {/* Main row */}
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Left: Brand */}
            <div className="flex items-center gap-2">
              <span className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                ngodingpake<span className="text-amber-500 font-black">prd</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">AI Architecture & Modern PRD Engine</span>
            </div>

            {/* Center: GitHub */}
            <div className="flex justify-center">
              <a
                href="https://github.com/daerobi-devs"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold ${
                  isLight
                    ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-xs"
                    : "border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:text-white hover:border-zinc-700"
                }`}
                title="Kunjungi profil GitHub @daerobi-devs"
              >
                <svg className={`h-4 w-4 fill-current ${isLight ? 'text-slate-800' : 'text-white'}`} viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span className="font-mono">@daerobi-devs</span>
              </a>
            </div>

            {/* Right: Copyright */}
            <div className="text-right">
              <span>&copy; {new Date().getFullYear()} ngodingpakeprd</span>
            </div>
          </div>

          {/* Sub-row: Legal links — subtle */}
          <div className={`flex items-center justify-center gap-4 border-t pt-4 ${
            isLight ? 'border-slate-100' : 'border-zinc-800/60'
          }`}>
            <Link
              href="/privacy"
              className={`transition-colors ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-zinc-700 hover:text-zinc-400'}`}
            >
              Kebijakan Privasi
            </Link>
            <span className={isLight ? 'text-slate-300' : 'text-zinc-800'}>·</span>
            <Link
              href="/terms"
              className={`transition-colors ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-zinc-700 hover:text-zinc-400'}`}
            >
              Syarat &amp; Ketentuan
            </Link>
          </div>
        </div>
      </footer>

      {/* Auth Modal for Strict Login */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
