"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { AuthModal } from "@/components/AuthModal";
import { PricingModal } from "@/components/PricingModal";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  Kanban,
  GitBranch,
  Code2,
  Database,
  Layers,
  Shield,
  Zap,
  Check,
  Send,
  SlidersHorizontal,
  ChevronRight,
  FileText,
  Terminal,
  CheckCircle2,
  Clock,
  Copy,
  Lock,
  Workflow,
  Cpu,
  Network,
  Monitor,
  Smartphone,
  RotateCw,
  Globe,
  Calendar,
  CreditCard,
  MessageSquare,
  Cloud,
  Key,
} from "lucide-react";
import {
  CursorLogo,
  AntigravityLogo,
  ClaudeLogo,
  WindsurfLogo,
  VsCodeLogo,
} from "@/components/icons/AgentIcons";

const QUICK_INSPIRATION_CHIPS = [
  "Rental Lapangan Badminton + WA Gateway",
  "SaaS Langganan B2B Multi-Tenant",
  "Aplikasi Kasir POS Multi-Outlet",
  "Klinik Dokter & Rekam Medis",
];

const LOVABLE_SECTION_FEATURES = [
  {
    id: "spec",
    title: "Living Spec PRD 4-Lapis",
    description:
      "Dokumen spesifikasi terstruktur (Core UX, Admin, Anti-Fraud, Automasi) yang terus hidup dan terupdate untuk memandu AI secara mutlak.",
    url: "spec.ngodingpakeprd.com",
    tag: "Arsitektur 4-Lapis",
  },
  {
    id: "tree",
    title: "Pohon Modul & Fitur Interaktif",
    description:
      "Visualisasi pohon arsitektur modular—pilih modul, tambah sub-fitur kustom, dan hitung estimasi kompleksitas sebelum dieksekusi.",
    url: "tree.ngodingpakeprd.com",
    tag: "Pohon Fitur & Modul",
  },
  {
    id: "mermaid",
    title: "Diagram Arsitektur Mermaid Visual",
    description:
      "Diagram alur sistem, alur data backend, dan state machine yang otomatis digambar dan dapat diedit langsung dalam kanvas.",
    url: "flow.ngodingpakeprd.com",
    tag: "Alur Data & Sistem",
  },
  {
    id: "database",
    title: "Skema SQL PostgreSQL & RLS",
    description:
      "File DDL database bersih lengkap dengan UUID, relasi Foreign Key, dan proteksi Row-Level Security Supabase yang siap pasang.",
    url: "database.ngodingpakeprd.com",
    tag: "PostgreSQL & RLS",
  },
  {
    id: "agent",
    title: "Papan MCP Kanban Coding Agent",
    description:
      "Papan tugas (To Do, Doing, Done) yang langsung sinkron ke Cursor, Claude Code, dan Windsurf melalui protokol MCP Server.",
    url: "mcp.ngodingpakeprd.com",
    tag: "Sinkronisasi MCP Hub",
  },
];

export default function HomePageHub() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [ideaInput, setIdeaInput] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const [activeWorkspaceIdx, setActiveWorkspaceIdx] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const totalScrollDistance = rect.height - window.innerHeight;

      if (totalScrollDistance > 100) {
        // Desktop / Sticky scroll calculation
        const currentScroll = -rect.top;
        const progress = Math.max(0, Math.min(0.999, currentScroll / totalScrollDistance));
        const newIndex = Math.min(
          LOVABLE_SECTION_FEATURES.length - 1,
          Math.floor(progress * LOVABLE_SECTION_FEATURES.length)
        );
        setActiveFeatureIdx(newIndex);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToFeature = (idx: number) => {
    setActiveFeatureIdx(idx);
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const totalScrollDistance = rect.height - window.innerHeight;
    if (totalScrollDistance > 100) {
      const containerTop = window.scrollY + rect.top;
      const stepSize = totalScrollDistance / LOVABLE_SECTION_FEATURES.length;
      const targetScroll = containerTop + (idx + 0.5) * stepSize;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  const handleCopyMockPrompt = () => {
    navigator.clipboard.writeText(
      `cursor-agent --file PRD.md "Bangun Lapis 1 (UX Booking) & Lapis 3 (Slot Locking 10m) sesuai schema.sql"`
    );
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleStartIdea = (text?: string) => {
    const chosenIdea = (text || ideaInput).trim();
    if (chosenIdea) {
      try {
        localStorage.setItem("ngodingpakeprd_pending_idea", chosenIdea);
      } catch {}
    }

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    router.push("/generator?mode=prd");
  };

  const handleCardClick = (mode: "prd" | "roadmap" | "architect") => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (mode === "architect") {
      router.push("/architect");
      return;
    }
    router.push(`/generator?mode=${mode}`);
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-100 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-200 overflow-x-clip relative">
      {/* Ambient Radial Spotlight (Linear/Raycast aesthetic) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-amber-500/[0.08] via-amber-500/[0.015] to-transparent blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Top Header Section */}
      <header className="w-full relative z-20">
        <AnnouncementBanner />
        <Navbar
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenPricing={() => setIsPricingModalOpen(true)}
          onOpenGenerator={() => handleCardClick("prd")}
          isLandingPage={true}
        />
      </header>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16 sm:space-y-24 relative z-10">
        
        {/* ================= SECTION 1: HERO & PROMPT GATEWAY ================= */}
        <section className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto">
          {/* Main Headline - Option 1: Clean & Inviting */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
              Rancang Arsitekturnya Sekarang, Biarkan AI yang Mengeksekusi.
            </h1>
            <p className="text-sm sm:text-lg text-zinc-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Cukup ketik satu kalimat ide untuk membuat PRD lengkap, diagram sistem, dan skema SQL yang siap pakai.
            </p>
          </div>

          {/* Interactive Hero Prompt Console (Clean, Pristine & Tactile) */}
          <div className="w-full max-w-2xl mx-auto text-left relative group">
            {/* Ambient Multi-Stop Glow behind Prompt Box */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 rounded-2xl blur-lg opacity-30 group-focus-within:opacity-80 group-hover:opacity-50 transition duration-500 pointer-events-none" />

            <div className="relative rounded-2xl bg-[#0c0e14]/95 border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] p-3.5 sm:p-5 backdrop-blur-xl transition-all duration-200 focus-within:border-amber-500/50">
              <div className="px-1 py-1">
                <textarea
                  rows={2}
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleStartIdea();
                    }
                  }}
                  placeholder="Ketik ide aplikasimu di sini (contoh: Aplikasi sewa lapangan badminton dengan Midtrans dan notifikasi WhatsApp)..."
                  className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Bottom Control Bar */}
              <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] mt-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-400">
                    <Layers className="w-3 h-3 text-amber-400/80" />
                    <span>PRD 4-Lapis</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartIdea()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
                >
                  <span>Rancang Cetak Biru</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <span className="text-[11px] text-zinc-500 font-mono">Inspirasi Cepat:</span>
              {QUICK_INSPIRATION_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIdeaInput(chip);
                    handleStartIdea(chip);
                  }}
                  className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/[0.02] hover:bg-amber-500/10 text-zinc-400 hover:text-amber-300 border border-white/[0.07] hover:border-amber-500/30 transition-all duration-150 cursor-pointer active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: LOVABLE-STYLE SCROLL-DRIVEN ORBITAL SHOWCASE ================= */}
        <section
          ref={sectionRef}
          className="relative py-10 sm:py-16 lg:py-0 lg:h-[280vh]"
        >
          {/* Sticky Viewport Container */}
          <div className="lg:sticky lg:top-20 lg:h-screen lg:flex lg:items-center">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              {/* ================= LEFT COLUMN: LOVABLE MINIMALIST LIST ================= */}
              <div className="lg:col-span-5 space-y-6 sm:space-y-8 order-2 lg:order-1">
                {/* Section Header */}
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Untuk membangun dan lebih jauh lagi
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    ngodingpakeprd berjalan di atas standar arsitektur kelas perusahaan – sehingga Anda bisa membuat cetak biru perangkat lunak full-stack yang siap berkembang.
                  </p>
                </div>

                {/* Minimalist Feature Items with Dividers (Exact Lovable Style) */}
                <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                  {LOVABLE_SECTION_FEATURES.map((feat, idx) => {
                    const isActive = idx === activeFeatureIdx;
                    return (
                      <div
                        key={feat.id}
                        id={`lovable-feature-${idx}`}
                        onClick={() => scrollToFeature(idx)}
                        className="cursor-pointer py-4 sm:py-5 transition-all duration-300 group"
                      >
                        <h3
                          className={`text-sm sm:text-base transition-colors duration-200 ${
                            isActive
                              ? "text-white font-bold"
                              : "text-zinc-400 font-medium group-hover:text-zinc-200"
                          }`}
                        >
                          {feat.title}
                        </h3>

                        {/* Animated Expandable Description & Progress Bar */}
                        {isActive && (
                          <div className="mt-2.5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                              {feat.description}
                            </p>
                            {/* Glowing Multi-Color Gradient Line (Lovable style) */}
                            <div className="h-[2.5px] w-36 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.5)]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ================= RIGHT COLUMN: DYNAMIC MULTI-SHOWCASE CARDS (LOVABLE REPLICA) ================= */}
              <div className="lg:col-span-7 flex items-center justify-center relative order-1 lg:order-2">
                <div className="w-full relative min-h-[460px] sm:min-h-[500px]">
                  {/* ================= CARD 0: LIVING SPEC 4-LAPIS (ORBITAL ENGINE) ================= */}
                  <div
                    className={`w-full transition-all duration-500 ease-out ${
                      activeFeatureIdx === 0
                        ? "opacity-100 scale-100 relative pointer-events-auto"
                        : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
                    }`}
                  >
                    <div className="w-full rounded-3xl border border-white/[0.08] bg-[#0b0d14] p-5 sm:p-8 relative overflow-hidden backdrop-blur-2xl flex items-center justify-center min-h-[460px] sm:min-h-[500px] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                      {/* 3x3 Subtle Rounded Tiles Grid (Lovable style) */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-3.5 p-6 pointer-events-none opacity-40">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div
                            key={i}
                            className="rounded-2xl border border-white/[0.04] bg-white/[0.01]"
                          />
                        ))}
                      </div>

                      {/* Ambient Glows */}
                      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -top-10 right-1/4 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute inset-0 bg-radial from-purple-500/10 via-pink-500/5 to-transparent blur-3xl pointer-events-none" />

                      {/* SVG Dotted Orbital Arc Curve */}
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                        viewBox="0 0 500 400"
                      >
                        <path
                          d="M 50 200 Q 250 375 450 200"
                          fill="none"
                          stroke="rgba(255,255,255,0.14)"
                          strokeWidth="1.5"
                          strokeDasharray="4 6"
                        />
                      </svg>

                      {/* Central Floating Browser Window */}
                      <div className="p-[1.5px] rounded-2xl bg-gradient-to-br from-blue-500/60 via-purple-500/50 to-pink-500/70 shadow-[0_0_40px_rgba(236,72,153,0.18)] max-w-sm sm:max-w-md w-full relative z-10 transition-all duration-300">
                        <div className="bg-[#080a0f] rounded-[15px] p-4 sm:p-5 space-y-3.5 select-none">
                          {/* Window Top Address Bar */}
                          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                              <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                              <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11141e] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                              <Lock className="w-3 h-3 text-zinc-400" />
                              <span>spec.ngodingpakeprd.com</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3.5 h-3.5 rounded-full border border-white/15 bg-white/5" />
                              <div className="w-3.5 h-3.5 rounded-full border border-white/15 bg-white/5" />
                            </div>
                          </div>

                          {/* 4-Layer Spec Content */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block font-semibold">
                              4-Layer Living Spec Architecture
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                <span className="font-semibold text-zinc-200 block">Lapis 1: Core UX</span>
                                <span className="text-[10px] text-zinc-400">Kalender Slot &amp; Checkout Flow</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                <span className="font-semibold text-zinc-200 block">Lapis 2: Admin</span>
                                <span className="text-[10px] text-zinc-400">Dashboard &amp; Audit Log System</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                <span className="font-semibold text-purple-300 block">Lapis 3: Anti-Fraud</span>
                                <span className="text-[10px] text-purple-400">Pessimistic Concurrency Guard</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                <span className="font-semibold text-zinc-200 block">Lapis 4: Automasi</span>
                                <span className="text-[10px] text-zinc-400">Worker Webhook &amp; Queue</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5 Orbital Glowing Nodes */}
                      <button
                        type="button"
                        onClick={() => scrollToFeature(0)}
                        title="Living Spec"
                        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#121622]/90 border border-purple-400 ring-2 ring-purple-500/80 shadow-[0_0_25px_rgba(168,85,247,0.6)] backdrop-blur-md flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110"
                      >
                        <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToFeature(1)}
                        title="Pohon Fitur"
                        className="absolute left-8 sm:left-20 bottom-3 sm:bottom-6 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#121622]/90 border border-white/[0.14] backdrop-blur-md flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 text-zinc-400 hover:text-emerald-400"
                      >
                        <GitBranch className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToFeature(2)}
                        title="Diagram Mermaid"
                        className="absolute left-1/2 -translate-x-1/2 -bottom-2 sm:bottom-2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#121622]/90 border border-white/[0.14] backdrop-blur-md flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 text-zinc-400 hover:text-cyan-400"
                      >
                        <Workflow className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToFeature(3)}
                        title="Database SQL"
                        className="absolute right-8 sm:right-20 bottom-3 sm:bottom-6 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#121622]/90 border border-white/[0.14] backdrop-blur-md flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 text-zinc-400 hover:text-blue-400"
                      >
                        <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToFeature(4)}
                        title="MCP Agent"
                        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#121622]/90 border border-white/[0.14] backdrop-blur-md flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 text-zinc-400 hover:text-amber-400"
                      >
                        <Kanban className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>

                  {/* ================= CARD 1: POHON MODUL & FITUR INTERAKTIF ================= */}
                  <div
                    className={`w-full transition-all duration-500 ease-out ${
                      activeFeatureIdx === 1
                        ? "opacity-100 scale-100 relative pointer-events-auto"
                        : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
                    }`}
                  >
                    <div className="w-full rounded-3xl border border-white/[0.08] bg-[#0b0d14] p-5 sm:p-7 relative overflow-hidden backdrop-blur-2xl flex flex-col justify-between min-h-[460px] sm:min-h-[500px] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] relative z-10">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11141e] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                          <GitBranch className="w-3 h-3 text-emerald-400" />
                          <span>tree.ngodingpakeprd.com</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                          Feature Tree
                        </span>
                      </div>

                      {/* Tree Interactive Center */}
                      <div className="relative z-10 py-3 space-y-4">
                        <div className="flex justify-center">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                            <Layers className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Arsitektur Inti Aplikasi</span>
                          </div>
                        </div>

                        {/* 4 Branch Modules Grid */}
                        <div className="grid grid-cols-2 gap-2.5 text-left">
                          <div className="p-3 rounded-xl bg-white/[0.03] border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-zinc-200">1. Core Logic &amp; UX</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold">Aktif</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">Kalender Slot, Checkout, Validasi Input</p>
                          </div>

                          <div className="p-3 rounded-xl bg-white/[0.03] border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-zinc-200">2. Autentikasi &amp; RBAC</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-semibold">Aktif</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">Supabase OAuth, Admin Multi-Tenant</p>
                          </div>

                          <div className="p-3 rounded-xl bg-white/[0.03] border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-zinc-200">3. Database &amp; Storage</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-semibold">Aktif</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">PostgreSQL DDL, UUID v4, S3 Storage</p>
                          </div>

                          <div className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/20 hover:border-amber-500/40 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-zinc-200">4. Gateway &amp; Worker</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-semibold">Aktif</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">Midtrans QRIS, Webhook Asinkron</p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Control Bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-[11px] font-mono text-zinc-400 relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>14 Sub-Fitur Terpilih</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                          Hemat 85% Token AI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ================= CARD 2: DIAGRAM ARSITEKTUR MERMAID VISUAL ================= */}
                  <div
                    className={`w-full transition-all duration-500 ease-out ${
                      activeFeatureIdx === 2
                        ? "opacity-100 scale-100 relative pointer-events-auto"
                        : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
                    }`}
                  >
                    <div className="w-full rounded-3xl border border-white/[0.08] bg-[#0b0d14] p-5 sm:p-7 relative overflow-hidden backdrop-blur-2xl flex flex-col justify-between min-h-[460px] sm:min-h-[500px] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                      <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] relative z-10">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11141e] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                          <Workflow className="w-3 h-3 text-cyan-400" />
                          <span>flow.ngodingpakeprd.com</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold">
                          Mermaid Graph
                        </span>
                      </div>

                      {/* Diagram Flow */}
                      <div className="relative z-10 py-2 space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-center">
                          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-cyan-500/40 text-center shadow-[0_0_15px_rgba(6,182,212,0.15)] w-full max-w-sm">
                            <span className="text-zinc-100 font-semibold block">Client App (Next.js 15 App Router)</span>
                            <span className="text-[10px] text-zinc-400 font-sans">React 19 Server Actions &amp; Client State</span>
                          </div>
                        </div>

                        <div className="flex justify-center text-cyan-400 text-xs">
                          <span>↓ HTTP / REST Payload</span>
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-purple-500/40 text-center shadow-[0_0_15px_rgba(168,85,247,0.15)] w-full max-w-sm">
                            <span className="text-zinc-100 font-semibold block">API Gateway &amp; Auth Guard</span>
                            <span className="text-[10px] text-zinc-400 font-sans">JWT Verification • Rate Limiter</span>
                          </div>
                        </div>

                        <div className="flex justify-center text-purple-400 text-xs">
                          <span>↓ Transaction Payload</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] max-w-sm mx-auto w-full">
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                            <span className="text-amber-300 font-semibold block">Concurrency Guard</span>
                            <span className="text-[10px] text-zinc-400 font-sans">Pessimistic Row Lock</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                            <span className="text-blue-300 font-semibold block">PostgreSQL (Supabase)</span>
                            <span className="text-[10px] text-zinc-400 font-sans">Row-Level Security</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Status */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-[11px] font-mono text-zinc-400 relative z-10">
                        <span className="text-zinc-400">Mermaid.js Flowchart Architecture</span>
                        <span className="text-cyan-400 font-semibold">Zero Halusinasi Logika</span>
                      </div>
                    </div>
                  </div>

                  {/* ================= CARD 3: SKEMA SQL POSTGRESQL & RLS ================= */}
                  <div
                    className={`w-full transition-all duration-500 ease-out ${
                      activeFeatureIdx === 3
                        ? "opacity-100 scale-100 relative pointer-events-auto"
                        : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
                    }`}
                  >
                    <div className="w-full rounded-3xl border border-white/[0.08] bg-[#0b0d14] p-5 sm:p-7 relative overflow-hidden backdrop-blur-2xl flex flex-col justify-between min-h-[460px] sm:min-h-[500px] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] relative z-10">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11141e] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                          <Database className="w-3 h-3 text-blue-400" />
                          <span>database.ngodingpakeprd.com</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold">
                          PostgreSQL DDL
                        </span>
                      </div>

                      {/* SQL Code View */}
                      <div className="relative z-10 py-1 space-y-2.5">
                        <div className="p-3.5 rounded-xl bg-[#06080e] border border-white/[0.08] font-mono text-[10px] sm:text-[11px] text-zinc-300 space-y-1 overflow-x-auto shadow-inner">
                          <p><span className="text-blue-400 font-semibold">CREATE TABLE</span> bookings (</p>
                          <p className="pl-4">id <span className="text-purple-400">UUID PRIMARY KEY DEFAULT</span> gen_random_uuid(),</p>
                          <p className="pl-4">user_id <span className="text-purple-400">UUID REFERENCES</span> auth.users(id) <span className="text-orange-400">ON DELETE CASCADE</span>,</p>
                          <p className="pl-4">status <span className="text-purple-400">VARCHAR(20) DEFAULT</span> <span className="text-emerald-300">&apos;pending&apos;</span>,</p>
                          <p className="pl-4">locked_until <span className="text-purple-400">TIMESTAMPTZ NOT NULL</span></p>
                          <p>);</p>
                        </div>

                        {/* RLS Security Policy Banner */}
                        <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/30 space-y-1 font-mono text-[10px]">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <Shield className="w-3.5 h-3.5" />
                            <span>ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;</span>
                          </div>
                          <p className="text-zinc-400">
                            <span className="text-emerald-300 font-semibold">CREATE POLICY</span> &quot;Users access own bookings&quot; <span className="text-blue-300">USING</span> (auth.uid() = user_id);
                          </p>
                        </div>
                      </div>

                      {/* Bottom Badges */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-[11px] font-mono text-zinc-400 relative z-10">
                        <span className="text-zinc-300 font-medium">Supabase PostgreSQL 15+</span>
                        <span className="text-emerald-400 font-semibold">Zero Data Leakage</span>
                      </div>
                    </div>
                  </div>

                  {/* ================= CARD 4: PAPAN MCP KANBAN CODING AGENT (CONNECTED ECOSYSTEM GRID) ================= */}
                  <div
                    className={`w-full transition-all duration-500 ease-out ${
                      activeFeatureIdx === 4
                        ? "opacity-100 scale-100 relative pointer-events-auto"
                        : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
                    }`}
                  >
                    <div className="w-full rounded-3xl border border-white/[0.08] bg-[#0b0d14] p-5 sm:p-7 relative overflow-hidden backdrop-blur-2xl flex flex-col justify-between min-h-[460px] sm:min-h-[500px] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                      <div className="absolute inset-0 bg-radial from-amber-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] relative z-10">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11141e] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                          <Kanban className="w-3 h-3 text-amber-400" />
                          <span>mcp.ngodingpakeprd.com</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
                          MCP Protocol Hub
                        </span>
                      </div>

                      {/* Connected Multi-Agent Ecosystem Grid (Lovable style) */}
                      <div className="relative z-10 py-2 space-y-3">
                        {/* Central MCP Hub Card */}
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/40 flex items-center justify-between shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                              <Cpu className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">ngodingpakeprd Studio MCP Server</span>
                              <span className="text-[10px] font-mono text-amber-400/80">Port 3001 • Bi-directional Sync Active</span>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live
                          </span>
                        </div>

                        {/* Surrounding Connected Agent Grid (6 tiles) */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 transition-all flex flex-col items-center gap-1">
                            <CursorLogo className="w-4 h-4 text-zinc-200" />
                            <span className="font-semibold text-zinc-200 text-[11px]">Cursor</span>
                            <span className="text-[9px] font-mono text-emerald-400">.cursorrules</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 transition-all flex flex-col items-center gap-1">
                            <ClaudeLogo className="w-4 h-4" />
                            <span className="font-semibold text-zinc-200 text-[11px]">Claude Code</span>
                            <span className="text-[9px] font-mono text-emerald-400">CLAUDE.md</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 transition-all flex flex-col items-center gap-1">
                            <WindsurfLogo className="w-4 h-4" />
                            <span className="font-semibold text-zinc-200 text-[11px]">Windsurf</span>
                            <span className="text-[9px] font-mono text-emerald-400">.windsurfrules</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 transition-all flex flex-col items-center gap-1">
                            <AntigravityLogo className="w-4 h-4" />
                            <span className="font-semibold text-zinc-200 text-[11px]">Antigravity</span>
                            <span className="text-[9px] font-mono text-emerald-400">MCP Protocol</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 transition-all flex flex-col items-center gap-1">
                            <VsCodeLogo className="w-4 h-4" />
                            <span className="font-semibold text-zinc-200 text-[11px]">VS Code</span>
                            <span className="text-[9px] font-mono text-emerald-400">Extension</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/40 transition-all flex flex-col items-center gap-1">
                            <Database className="w-4 h-4 text-cyan-400" />
                            <span className="font-semibold text-zinc-200 text-[11px]">Supabase</span>
                            <span className="text-[9px] font-mono text-emerald-400">Postgres DDL</span>
                          </div>
                        </div>

                        {/* Mini Kanban Task Stream */}
                        <div className="flex items-center justify-between gap-1 p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[10px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">To Do: RLS Policy</span>
                          <ArrowRight className="w-3 h-3 text-zinc-500" />
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">Doing: Row Lock</span>
                          <ArrowRight className="w-3 h-3 text-zinc-500" />
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Done: Spec PRD</span>
                        </div>
                      </div>

                      {/* Bottom Status */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-[11px] font-mono text-zinc-400 relative z-10">
                        <span className="text-zinc-300 font-medium">Real-Time MCP Kanban Synchronization</span>
                        <span className="text-amber-400 font-semibold">Semua Agent Terhubung</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: THE BEFORE VS AFTER ================= */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Mengapa Arsitek Dulu, Koding Kemudian?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Perbedaan nyata antara langsung meminta AI mengoding vs memberikan cetak biru arsitektur terstruktur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Box 1: Cara Lama */}
            <div className="p-5 sm:p-6 rounded-2xl border border-red-500/20 bg-red-950/10 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <span>Cara Lama: Langsung Koding ke AI</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-400 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">&times;</span>
                  <span>AI halusinasi relasi tabel dan foreign keys yang tidak konsisten.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">&times;</span>
                  <span>Edge-case krusial (concurrency lock, penanganan timeout, admin back-office) terlewat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">&times;</span>
                  <span>Boros token ratusan ribu karena berulang kali memperbaiki kode yang salah arah.</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Pakai NgodingPakePRD */}
            <div className="p-5 sm:p-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <span>Dengan NgodingPakePRD: Living Spec + MCP</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Spesifikasi 4-lapis menyeluruh dari core value, admin, sampai automasi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Skema SQL PostgreSQL produksi dengan UUID dan RLS yang valid tanpa eror.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Hemat 70% token AI karena coding agent langsung memahami peta sistem.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: 3 WORKSPACES HUB (EXPANDABLE HOVER ACCORDION) ================= */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-zinc-400 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Workspace Ecosystem</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Tiga Ruang Kerja Utama
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Arahkan kursor atau pilih mode kerja untuk membuka spesifikasi dan cetak biru pengembangan proyekmu.
            </p>
          </div>

          {/* Expandable Accordion Container */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-4 items-stretch w-full min-h-[480px]">
            {/* CARD 0: BIKIN PRD */}
            <div
              onMouseEnter={() => setActiveWorkspaceIdx(0)}
              onClick={() => {
                if (activeWorkspaceIdx !== 0) setActiveWorkspaceIdx(0);
                else handleCardClick("prd");
              }}
              className={`group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 bg-[#0c0e14]/95 backdrop-blur-2xl border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer overflow-hidden ${
                activeWorkspaceIdx === 0
                  ? "lg:flex-[2.8] border-amber-500/40 shadow-[0_20px_50px_rgba(245,158,11,0.12)]"
                  : "lg:flex-1 border-white/[0.08] hover:border-amber-500/30 opacity-80 hover:opacity-100"
              }`}
            >
              {/* Ambient Glow */}
              <div
                className={`absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
                  activeWorkspaceIdx === 0 ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className="absolute top-4 right-6 text-7xl font-mono font-bold text-white/[0.03] select-none pointer-events-none">
                01
              </div>

              {/* Card Header & Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:bg-amber-500/15 transition-all duration-200 shadow-sm">
                    <Kanban className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    Living Spec
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-1.5 tracking-tight">
                  Bikin PRD
                </h3>
                <p className="text-xs text-amber-300/80 font-mono mb-2">
                  Cetak Biru 4-Lapis &amp; Skema SQL Migration
                </p>

                {/* Expanded Content Details */}
                <div
                  className={`transition-all duration-300 ${
                    activeWorkspaceIdx === 0
                      ? "opacity-100 max-h-[800px] visible"
                      : "lg:opacity-0 lg:max-h-0 lg:invisible lg:overflow-hidden"
                  }`}
                >
                  <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                    Ubah satu kalimat ide jadi PRD matang, pohon modul interaktif, diagram alur Mermaid, dan skema SQL PostgreSQL yang siap dieksekusi Cursor &amp; Claude Code.
                  </p>

                  {/* Micro-UI Preview: PRD Spec Console */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#07090e]/80 p-3.5 mb-4 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06] text-[10px] text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-amber-400" />
                        <span className="text-zinc-200 font-semibold">Living Spec Console</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px]">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold">FRD</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-400">TRD</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-400">SQL</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-zinc-300">
                      <div className="text-amber-300/90 font-semibold truncate">
                        &gt; Core Model: bookings, courts, transactions, rls_guards
                      </div>
                      <div className="text-zinc-400 text-[10px] truncate">
                        Status: Sinkronisasi MCP siap pakai untuk Cursor, Claude Code, &amp; Windsurf
                      </div>
                    </div>
                  </div>

                  {/* Highlights Checklist */}
                  <ul className="space-y-1.5 text-[11px] text-zinc-300 mb-5">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Spesifikasi 4-Lapis: FRD, TRD, User Flow &amp; PostgreSQL DDL</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Eliminasi 90% bug logika dan hemat jutaan token AI</span>
                    </li>
                  </ul>
                </div>

                {/* Collapsed Teaser on Desktop */}
                <div
                  className={`hidden lg:block transition-all duration-300 ${
                    activeWorkspaceIdx === 0 ? "hidden" : "block mt-3"
                  }`}
                >
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Living Spec 4-lapis &amp; skema SQL siap eksekusi coding agent.
                  </p>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="relative z-10 pt-3 border-t border-white/[0.06]">
                {activeWorkspaceIdx === 0 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick("prd");
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md active:scale-[0.99]"
                  >
                    <span>Mulai Rancang PRD</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 group-hover:text-amber-400 transition-colors">
                    <span>Buka Ruang Kerja</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </div>

            {/* CARD 1: ROADMAP PINTAR */}
            <div
              onMouseEnter={() => setActiveWorkspaceIdx(1)}
              onClick={() => {
                if (activeWorkspaceIdx !== 1) setActiveWorkspaceIdx(1);
                else handleCardClick("roadmap");
              }}
              className={`group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 bg-[#0c0e14]/95 backdrop-blur-2xl border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer overflow-hidden ${
                activeWorkspaceIdx === 1
                  ? "lg:flex-[2.8] border-blue-500/40 shadow-[0_20px_50px_rgba(59,130,246,0.12)]"
                  : "lg:flex-1 border-white/[0.08] hover:border-blue-500/30 opacity-80 hover:opacity-100"
              }`}
            >
              {/* Ambient Glow */}
              <div
                className={`absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
                  activeWorkspaceIdx === 1 ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className="absolute top-4 right-6 text-7xl font-mono font-bold text-white/[0.03] select-none pointer-events-none">
                02
              </div>

              {/* Card Header & Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-500/15 transition-all duration-200 shadow-sm">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    Mind Map
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-1.5 tracking-tight">
                  Roadmap Pintar
                </h3>
                <p className="text-xs text-blue-300/80 font-mono mb-2">
                  Peta Kurikulum &amp; Visual Mind Map Interaktif
                </p>

                {/* Expanded Content Details */}
                <div
                  className={`transition-all duration-300 ${
                    activeWorkspaceIdx === 1
                      ? "opacity-100 max-h-[800px] visible"
                      : "lg:opacity-0 lg:max-h-0 lg:invisible lg:overflow-hidden"
                  }`}
                >
                  <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                    Susun pohon kurikulum keahlian dan visualisasi mind map interaktif dengan rujukan dokumentasi resmi dan bimbingan AI Mentor dari nol sampai mahir.
                  </p>

                  {/* Micro-UI Preview: Skill Tree Mind Map Canvas */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#07090e]/90 p-3.5 mb-4 font-mono text-xs shadow-inner relative overflow-hidden">
                    {/* Top Canvas Bar */}
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.06] text-[10px] text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <GitBranch className="w-3 h-3 text-blue-400" />
                        <span className="text-zinc-200 font-semibold">Skill Tree Mind Map</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 font-semibold">
                        Pan &amp; Zoom Canvas
                      </span>
                    </div>

                    {/* Visual Mind Map Tree Nodes */}
                    <div className="flex items-center justify-between gap-1.5 py-1 text-[10px]">
                      {/* Node 1: Fondasi */}
                      <div className="flex-1 p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                        <span className="text-[9px] font-mono text-blue-400 block font-semibold">01 FONDASI</span>
                        <span className="text-zinc-200 font-medium text-[11px] truncate block">Sintaks &amp; Konsep</span>
                      </div>

                      {/* Connecting Line */}
                      <div className="w-3 sm:w-4 h-0.5 bg-blue-500/40 shrink-0" />

                      {/* Node 2: Proyek Riil */}
                      <div className="flex-1 p-2 rounded-xl bg-white/[0.04] border border-cyan-500/40 text-center shadow-[0_0_15px_rgba(6,182,212,0.12)]">
                        <span className="text-[9px] font-mono text-cyan-400 block font-semibold">02 PROYEK</span>
                        <span className="text-zinc-200 font-medium text-[11px] truncate block">Arsitektur Nyata</span>
                      </div>

                      {/* Connecting Line */}
                      <div className="w-3 sm:w-4 h-0.5 bg-cyan-500/40 shrink-0" />

                      {/* Node 3: AI Mentor */}
                      <div className="flex-1 p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
                        <span className="text-[9px] font-mono text-purple-400 block font-semibold">03 MENTOR</span>
                        <span className="text-zinc-200 font-medium text-[11px] truncate block">Tanya Jawab AI</span>
                      </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/[0.06] text-[10px] text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Cabang Otomatis (Auto-Branch)</span>
                      </div>
                      <span className="text-blue-300 font-medium">Dokumentasi Terkurasi</span>
                    </div>
                  </div>

                  {/* Highlights Checklist */}
                  <ul className="space-y-1.5 text-[11px] text-zinc-300 mb-5">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>Mind map pohon materi interaktif 1-klik (Pan, Zoom, &amp; Expand)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>Mentor AI interaktif bertutur manusiawi di setiap modul</span>
                    </li>
                  </ul>
                </div>

                {/* Collapsed Teaser on Desktop */}
                <div
                  className={`hidden lg:block transition-all duration-300 ${
                    activeWorkspaceIdx === 1 ? "hidden" : "block mt-3"
                  }`}
                >
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Visual mind map kurikulum interaktif dengan bimbingan AI Mentor.
                  </p>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="relative z-10 pt-3 border-t border-white/[0.06]">
                {activeWorkspaceIdx === 1 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick("roadmap");
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-blue-500 hover:bg-blue-400 text-zinc-950 shadow-md active:scale-[0.99]"
                  >
                    <span>Jelajahi Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 group-hover:text-blue-400 transition-colors">
                    <span>Buka Ruang Kerja</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </div>

            {/* CARD 2: STUDIO ARSITEK & BAB 3 */}
            <div
              onMouseEnter={() => setActiveWorkspaceIdx(2)}
              onClick={() => {
                if (activeWorkspaceIdx !== 2) setActiveWorkspaceIdx(2);
                else handleCardClick("architect");
              }}
              className={`group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 bg-[#0c0e14]/95 backdrop-blur-2xl border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer overflow-hidden ${
                activeWorkspaceIdx === 2
                  ? "lg:flex-[2.8] border-purple-500/40 shadow-[0_20px_50px_rgba(168,85,247,0.12)]"
                  : "lg:flex-1 border-white/[0.08] hover:border-purple-500/30 opacity-80 hover:opacity-100"
              }`}
            >
              {/* Ambient Glow */}
              <div
                className={`absolute -top-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
                  activeWorkspaceIdx === 2 ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className="absolute top-4 right-6 text-7xl font-mono font-bold text-white/[0.03] select-none pointer-events-none">
                03
              </div>

              {/* Card Header & Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:scale-105 group-hover:bg-purple-500/15 transition-all duration-200 shadow-sm">
                    <Network className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    UML &amp; Bab 3
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-1.5 tracking-tight">
                  Studio Arsitek
                </h3>
                <p className="text-xs text-purple-300/80 font-mono mb-2">
                  UML 2.5, Skema ERD &amp; Naskah Skripsi DOCX
                </p>

                {/* Expanded Content Details */}
                <div
                  className={`transition-all duration-300 ${
                    activeWorkspaceIdx === 2
                      ? "opacity-100 max-h-[800px] visible"
                      : "lg:opacity-0 lg:max-h-0 lg:invisible lg:overflow-hidden"
                  }`}
                >
                  <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                    Ekstraksi cetak biru dari ide, SQL, folder, atau GitHub repo. Hasilkan 6 diagram UML &amp; ERD presisi, naskah Bab 3 skripsi Word DOCX standar DIKTI, dan kisi tanya-jawab sidang.
                  </p>

                  {/* Micro-UI Preview: Academic Architecture Console */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#07090e]/80 p-3.5 mb-4 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06] text-[10px] text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Network className="w-3 h-3 text-purple-400" />
                        <span className="text-zinc-200 font-semibold">UML 2.5 &amp; Thesis Studio</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-400 font-semibold">
                        DOCX 4-4-3-3
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-zinc-300">
                      <div className="text-purple-300/90 font-semibold truncate">
                        &gt; 6 Diagram: Use Case, ERD, Sequence, Activity, Class, DFD
                      </div>
                      <div className="text-zinc-400 text-[10px] truncate">
                        Status: Format Word Margin 4-4-3-3 &amp; AI Dosen Siap Uji
                      </div>
                    </div>
                  </div>

                  {/* Highlights Checklist */}
                  <ul className="space-y-1.5 text-[11px] text-zinc-300 mb-5">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>6 Diagram UML &amp; Terstruktur validasi Mermaid tanpa halusinasi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Ekspor naskah Bab 3 DOCX lengkap kamus data &amp; skenario terstandar</span>
                    </li>
                  </ul>
                </div>

                {/* Collapsed Teaser on Desktop */}
                <div
                  className={`hidden lg:block transition-all duration-300 ${
                    activeWorkspaceIdx === 2 ? "hidden" : "block mt-3"
                  }`}
                >
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    6 diagram UML 2.5, ERD presisi, naskah Bab 3 DOCX, &amp; kisi sidang skripsi.
                  </p>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="relative z-10 pt-3 border-t border-white/[0.06]">
                {activeWorkspaceIdx === 2 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick("architect");
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-[0.99]"
                  >
                    <span>Buka Studio Arsitek</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 group-hover:text-purple-400 transition-colors">
                    <span>Buka Ruang Kerja</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= INTEGRATED AGENT ECOSYSTEM STRIP ================= */}
        <section className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs text-zinc-400 font-mono pt-4">
          <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
            Terintegrasi langsung untuk:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-300 text-[11px]">
              <CursorLogo className="w-3 h-3 text-zinc-300" />
              <span>Cursor</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-300 text-[11px]">
              <Code2 className="w-3 h-3 text-amber-400" />
              <span>Claude Code</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-300 text-[11px]">
              <WindsurfLogo className="w-3 h-3 text-teal-400" />
              <span>Windsurf</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-300 text-[11px]">
              <AntigravityLogo className="w-3 h-3" />
              <span>Antigravity</span>
            </span>
          </div>
        </section>

      </main>

      {/* Minimalist Clean Footer */}
      <footer className="w-full border-t border-zinc-800/80 py-4 text-xs text-zinc-500 relative z-20">
        <div className="w-full px-6 sm:px-10 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs">
            <span className="font-extrabold tracking-tight text-white">
              ngodingpake<span className="text-amber-400 font-black">prd</span>
            </span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-zinc-400">Arsitektur Produk &amp; Task AI Coding Agent</span>
          </div>
          <div className="flex items-center gap-5 text-zinc-500">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Ketentuan</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privasi</Link>
          </div>
        </div>
      </footer>

      {/* Auth Modal for Guests */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Pricing / Upgrade Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </div>
  );
}
