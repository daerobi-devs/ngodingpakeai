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

  // Typewriter Animation Logic for Headline
  const FULL_HEADLINE = "Stop Ngoding Tanpa Arah. Rancang Arsitektur & Task AI dalam Hitungan Detik.";
  const SPLIT_INDEX = 25; // length of "Stop Ngoding Tanpa Arah. "
  const [typedLength, setTypedLength] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isDeleting && typedLength < FULL_HEADLINE.length) {
      timer = setTimeout(() => {
        setTypedLength((prev) => prev + 1);
      }, 55);
    } else if (!isDeleting && typedLength === FULL_HEADLINE.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 3800);
    } else if (isDeleting && typedLength > 0) {
      timer = setTimeout(() => {
        setTypedLength((prev) => prev - 1);
      }, 25);
    } else if (isDeleting && typedLength === 0) {
      timer = setTimeout(() => {
        setIsDeleting(false);
      }, 600);
    }

    return () => clearTimeout(timer);
  }, [typedLength, isDeleting]);

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

            {/* Punchy Hero Headline with Typewriter Animation */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] min-h-[105px] sm:min-h-[145px] flex items-center justify-center">
                <span>
                  {typedLength <= SPLIT_INDEX ? (
                    <span className={isLight ? "text-slate-900" : "text-white"}>
                      {FULL_HEADLINE.slice(0, typedLength)}
                    </span>
                  ) : (
                    <>
                      <span className={isLight ? "text-slate-900" : "text-white"}>
                        {FULL_HEADLINE.slice(0, SPLIT_INDEX)}
                      </span>
                      <span className="text-amber-500">
                        {FULL_HEADLINE.slice(SPLIT_INDEX, typedLength)}
                      </span>
                    </>
                  )}
                  {/* Blinking Amber Terminal Cursor */}
                  <span className="inline-block w-1.5 sm:w-2 h-[0.85em] align-baseline ml-1.5 bg-amber-500 animate-pulse rounded-xs" />
                </span>
              </h1>
              <p className={`mx-auto max-w-2xl text-base sm:text-lg leading-relaxed ${
                isLight ? "text-slate-600" : "text-zinc-400"
              }`}>
                Ubah 1 kalimat ide menjadi PRD terstruktur, 5 blueprint arsitektur visual, dan starter kit (<code>.ZIP</code>) siap lempar ke AI coding agent Anda.
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
          </div>
        </section>

        {/* ================= PRESET ARCHITECTURE TEMPLATES SHOWCASE ================= */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-24">
          <LandingTemplateShowcase theme={theme} />
        </section>

        {/* ================= SECTION: 5 BLUEPRINT MERMAID ================= */}
        <section id="diagrams" className={`mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t transition-colors ${
          isLight ? "border-slate-200" : "border-zinc-800/80"
        }`}>
          <InteractiveBlueprintStudio theme={theme} />
        </section>

        {/* ================= SECTION: DESIGN.MD ANTI-SLOP ================= */}
        <section id="design" className={`mx-auto max-w-6xl px-4 sm:px-6 py-16 border-t transition-colors ${
          isLight ? "border-slate-200" : "border-zinc-800/80"
        }`}>
          <div className="text-center space-y-3 mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Palette className="h-3.5 w-3.5" /> Frontend Standard Guard
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              DESIGN.md Anti-AI Slop: Desain Sekelas Linear & Vercel
            </h2>
            <p className={`max-w-2xl mx-auto text-sm ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
              AI sering menghasilkan UI membosankan dengan rounded aneh, warna norak, dan animasi kaku. Dokumen <code>DESIGN.md</code> mengunci aturan estetika ketat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/50 border-zinc-800"
              }`}>
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>Palet Warna Dark/Light Berkelas</h4>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                    Menggunakan semantic token Tailwind CSS (Zinc/Slate base) dengan aksen amber/emerald yang terukur.
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/50 border-zinc-800"
              }`}>
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>Micro-Interactions & Feedback State</h4>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                    Mengharuskan skeleton loader, transisi hover 150ms, dan active scale feedback di setiap tombol.
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/50 border-zinc-800"
              }`}>
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>Zero Generic Template Look</h4>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                    Memaksa AI menghindari card layout membosankan dan menerapkan visual hierarchy ala aplikasi modern.
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl border p-5 font-mono text-xs overflow-hidden ${
              isLight ? "bg-slate-900 text-zinc-300 border-slate-700" : "bg-black/80 text-zinc-300 border-zinc-800"
            }`}>
              <div className="flex items-center justify-between text-zinc-500 pb-3 border-b border-zinc-800 text-[11px]">
                <span className="text-amber-400 font-bold">docs/DESIGN.md Guidelines</span>
                <span>ANTI-SLOP ENFORCED</span>
              </div>
              <pre className="pt-3 leading-relaxed text-[11px] text-zinc-300 overflow-x-auto whitespace-pre">
                {`## 1. Design Principles
- Aesthetic: Linear/Vercel minimalist polish
- Radius: rounded-xl (inputs, cards), rounded-lg (buttons)
- Transitions: duration-150 ease-out with active:scale-[0.98]
- Contrast: High semantic WCAG AA compliant

## 2. Component Hierarchy
- Primary CTA: Solid Amber-500 with dark zinc text
- Secondary: Ghost with subtle border border-zinc-800
- Danger: Subtle red wash bg-red-500/10 text-red-400`}
              </pre>
            </div>
          </div>
        </section>

        {/* ================= SECTION: CARA KERJA ================= */}
        <section id="workflow" className={`mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t transition-colors ${
          isLight ? "border-slate-200" : "border-zinc-800/80"
        }`}>
          <VisualWorkflowPipeline theme={theme} />
        </section>

        {/* ================= SECTION: ROADMAP PEMULA ================= */}
        <section id="roadmap" className={`mx-auto max-w-6xl px-4 sm:px-6 py-16 border-t transition-colors ${isLight ? "border-slate-200" : "border-zinc-800/80"}`}>
          <BeginnerRoadmap theme={theme} />
        </section>

        {/* ================= FINAL CTA BANNER ================= */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 pb-28">
          <div className={`rounded-3xl border p-8 sm:p-14 text-center space-y-6 relative overflow-hidden transition-all ${
            isLight
              ? "border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-white to-amber-50/60 shadow-xl shadow-amber-500/10 text-slate-900"
              : "border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-[#121215] to-[#09090b] shadow-2xl text-white"
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 pointer-events-none" />
            
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Siap Bikin PRD & Blueprint Arsitektur Pertama Kamu?
            </h2>
            <p className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed ${
              isLight ? "text-slate-600" : "text-zinc-400"
            }`}>
              Mulai sekarang tanpa ribet. Terstandarisasi untuk tim engineer serta AI coding agents.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartGenerator}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-8 py-4 text-base font-extrabold text-zinc-950 shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Buka Generator PRD Sekarang</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
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
