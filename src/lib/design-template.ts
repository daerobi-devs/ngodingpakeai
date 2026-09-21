import { PRDOutput } from "@/types/prd";

export interface DesignPalette {
  domain: string;
  primaryColorName: string;
  primaryHex: string;
  primaryHoverHex: string;
  primaryTailwind: string;
  accentHex: string;
  moodDescription: string;
  hasDashboard: boolean;
  isStaticSite: boolean;
}

export function getDesignPalette(prd: PRDOutput): DesignPalette {
  const titleLower = prd.title.toLowerCase();
  const archetypeLower = (prd.archetype_detection?.archetype || "").toLowerCase();
  const scopeJoined = (prd.boundaries?.scope || []).join(" ").toLowerCase();
  const fullContext = `${titleLower} ${archetypeLower} ${scopeJoined}`;

  // 1. Determine Product Domain & Dynamic Color Palette
  let domain = "general_saas";
  let primaryColorName = "Electric Indigo";
  let primaryHex = "#6366f1";
  let primaryHoverHex = "#4f46e5";
  let primaryTailwind = "indigo-600";
  let accentHex = "#06b6d4";
  let moodDescription = "Modern, high-precision, technical aesthetic (Linear / Vercel grade)";

  if (
    fullContext.includes("sekolah") ||
    fullContext.includes("education") ||
    fullContext.includes("kampus") ||
    fullContext.includes("akademik") ||
    fullContext.includes("ppdb") ||
    fullContext.includes("rumah sakit") ||
    fullContext.includes("medis") ||
    fullContext.includes("klinik") ||
    fullContext.includes("health")
  ) {
    domain = "institutional_edu";
    primaryColorName = "Trust Navy & Medical Teal";
    primaryHex = "#1e3a8a"; // Navy 900
    primaryHoverHex = "#172554";
    primaryTailwind = "blue-900";
    accentHex = "#0d9488"; // Teal 600
    moodDescription = "Formal, terpercaya, terpelajar, dan bersih steril (High Legibility Canvas)";
  } else if (
    fullContext.includes("batik") ||
    fullContext.includes("umkm") ||
    fullContext.includes("katalog") ||
    fullContext.includes("craft") ||
    fullContext.includes("kuliner") ||
    fullContext.includes("kopi") ||
    fullContext.includes("cafe") ||
    fullContext.includes("resto")
  ) {
    domain = "umkm_catalog";
    primaryColorName = "Warm Earth Tone & Sogan Amber";
    primaryHex = "#78350f"; // Amber 900 / Warm Earth
    primaryHoverHex = "#92400e";
    primaryTailwind = "amber-900";
    accentHex = "#d97706"; // Amber 600
    moodDescription = "Hangat, ramah, autentik lokal, visual-first dengan fotografi produk dominan";
  } else if (
    fullContext.includes("booking") ||
    fullContext.includes("sewa") ||
    fullContext.includes("futsal") ||
    fullContext.includes("lapangan") ||
    fullContext.includes("sport") ||
    fullContext.includes("gym") ||
    fullContext.includes("rental")
  ) {
    domain = "booking_sports";
    primaryColorName = "Dynamic Emerald & High-Energy Green";
    primaryHex = "#059669"; // Emerald 600
    primaryHoverHex = "#047857";
    primaryTailwind = "emerald-600";
    accentHex = "#10b981"; // Emerald 500
    moodDescription = "Enerjik, kontras tinggi, dinamis, fokus pada kejelasan jadwal & ketersediaan";
  } else if (
    fullContext.includes("finance") ||
    fullContext.includes("investasi") ||
    fullContext.includes("keuangan") ||
    fullContext.includes("bank") ||
    fullContext.includes("kasir")
  ) {
    domain = "fintech";
    primaryColorName = "Royal Blue & Security Slate";
    primaryHex = "#2563eb"; // Blue 600
    primaryHoverHex = "#1d4ed8";
    primaryTailwind = "blue-600";
    accentHex = "#10b981"; // Emerald 500 for profit/success
    moodDescription = "Kuat, aman, terenkripsi, data-dense dengan tipografi tabular angka presisi";
  }

  // Override if AI returned explicit color_theme in archetype_detection
  if (prd.archetype_detection?.color_theme?.primary) {
    primaryHex = prd.archetype_detection.color_theme.primary;
    if (prd.archetype_detection.color_theme.accent) {
      accentHex = prd.archetype_detection.color_theme.accent;
    }
  }

  // 2. Check if product requires Dashboard with Sidebar
  const hasDashboard =
    prd.archetype_detection?.has_dashboard ??
    (fullContext.includes("dashboard") ||
      fullContext.includes("admin") ||
      fullContext.includes("portal") ||
      fullContext.includes("panel") ||
      fullContext.includes("kelola") ||
      fullContext.includes("manajemen") ||
      fullContext.includes("saas") ||
      fullContext.includes("booking"));

  const isStaticSite =
    titleLower.includes("landing") ||
    titleLower.includes("portofolio") ||
    titleLower.includes("company profile") ||
    (prd.boundaries?.scope || []).some((s) => s.toLowerCase().includes("landing"));

  return {
    domain,
    primaryColorName,
    primaryHex,
    primaryHoverHex,
    primaryTailwind,
    accentHex,
    moodDescription,
    hasDashboard,
    isStaticSite,
  };
}

/**
 * Generates a production-grade, anti-AI-slop DESIGN.md specification
 * Adaptively selects color palette based on product archetype & domain.
 * Includes complete App Shell layout with Collapsible Sidebar for dashboards.
 */
export function generateDesignDoc(prd: PRDOutput, customPalette?: DesignPalette): string {
  const {
    domain,
    primaryColorName,
    primaryHex,
    primaryHoverHex,
    primaryTailwind,
    accentHex,
    moodDescription,
    hasDashboard,
    isStaticSite,
  } = customPalette || getDesignPalette(prd);

  return `# DESIGN.md — Design System & Frontend Aesthetic Contract
*Project: ${prd.title}*
*Archetype: ${prd.archetype_detection?.archetype || "Modern Digital Product"}*
*Target Audience: ${prd.archetype_detection?.target_audience || "End Users & Operators"}*
*Standard: Vercel Web Interface Guidelines & Linear App Taste System*

> [!IMPORTANT]
> **Mandatory Frontend Enforcement for AI Coding Agents (Cursor, Claude Code, Antigravity, Windsurf):**
> When writing HTML, CSS, Tailwind, or React/Vue components for this project, you MUST strictly adhere to this DESIGN.md.
> Generic clichés (sparkles, emojis, neon purple gradients, floating cards without borders, arbitrary padding) are STRICTLY FORBIDDEN.

---

## 1. THE ANTI-AI-SLOP BANNED LIST (STRICTLY PROHIBITED)
Coding agents are expressly forbidden from introducing the following visual clichés:
1. **ABSOLUTE ZERO EMOJI POLICY**:
   - NEVER use raw emojis (such as ✨, 🚀, 🌟, 🔥, 💡, 🤖, 📈, 🎉) in any component, button, card header, page title, or label.
   - Feature icons MUST use pure monochrome vector SVGs (Lucide React, Radix, or Heroicons) with controlled sizing (16px to 20px).
2. **NO Neon Purple / Cyan Glow Gradients**:
   - Do NOT combine indigo-500 with cyan-400 for hero text, cards, or background blooms.
3. **NO Floating Glass Dots / Particle Orbs**:
   - Do NOT inject background radial dot grids or fuzzy blur balls behind text.
4. **NO Floating Flat Cards Without Borders**:
   - Cards must NOT rely merely on heavy drop shadows; every surface must have crisp, subtle 1px border definition (\`border-zinc-800\` in dark mode, \`border-slate-200\` in light mode).
5. **NO Arbitrary Padding / Spacing**:
   - Never invent arbitrary spacing like \`p-[23px]\`. Stick exclusively to the 4px / 8px scale (\`p-4\`, \`p-6\`, \`gap-4\`).
6. **NO SaaS-Washing on Non-SaaS Products**:
   - If this product is an institutional/school website or local catalog, NEVER render SaaS subscription pricing cards or hacker-style dark modes.

---

## 2. MULTI-SURFACE APP SHELL ARCHITECTURE CONTRACT
*When building modern web applications with landing pages, user dashboards, and admin panels, AI agents MUST organize code into separated Route Groups:*

### A. Surface Structure & Route Groups
1. **Public Marketing Surface (\`app/(marketing)/page.tsx\`)**:
   - Clean top navigation bar with logo, navigation links, and Login/Get Started CTA.
   - High-conversion Hero section, Feature grid, Social proof / Testimonials, FAQ accordion, and Footer.
2. **User Dashboard Surface (\`app/(dashboard)/layout.tsx\`)**:
   - **MANDATORY Left Collapsible Sidebar** (\`w-64\` on desktop, collapsible to \`w-16\` icon-only mode).
   - Sidebar includes: Brand Logo, Active Navigation Links (with distinct active styling), Workspace/Team Switcher, and User Profile Footer with Logout.
   - Sticky Topbar (\`h-16\`) with Breadcrumbs, Global Search (\`⌘K\`), Notifications, and Quick Action buttons.
   - Mobile responsive drawer sheet triggered by a hamburger button on screens \`< md\`.
3. **Admin / Operator Surface (\`app/(admin)/layout.tsx\`)**:
   - Dedicated Admin Sidebar with administrative links (Overview, User Management, Analytics, System Settings).
   - Role-Based Access Guard middleware (redirecting unauthorized users).
   - Dense data tables with sorting, filtering, pagination, and status badges.

### B. Sample Production-Grade App Shell Component (Tailwind + React)
\`\`\`tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { Home, BarChart2, Settings, Users, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

export function DashboardAppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      {/* 1. Desktop Collapsible Sidebar */}
      <aside className={"hidden md:flex flex-col border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 backdrop-blur-md justify-between transition-all duration-200 " + (collapsed ? "w-16 p-2" : "w-64 p-4")}>
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            {!collapsed && (
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-[${primaryHex}] flex items-center justify-center text-white font-bold text-xs">
                  ${prd.title.charAt(0) || 'P'}
                </div>
                <span className="font-bold text-sm tracking-tight truncate">${prd.title}</span>
              </div>
            )}
            <button 
              type="button" 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[${primaryHex}]/10 text-[${primaryHex}] font-semibold text-xs transition-colors">
              <Home className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Overview</span>}
            </Link>
            <Link href="/dashboard/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium text-xs transition-colors">
              <BarChart2 className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Analytics</span>}
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="border-t border-slate-200 dark:border-zinc-800 pt-3 flex items-center gap-3 px-1">
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-zinc-700 shrink-0" />
          {!collapsed && (
            <div className="text-xs truncate">
              <p className="font-bold text-slate-900 dark:text-zinc-100 truncate">Operator User</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">user@domain.com</p>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main Content Canvas with Sticky Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Dashboard &gt; Overview</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md font-mono text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
              ⌘K Search
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
\`\`\`

---

## 3. ADAPTIVE COLOR PALETTE & DESIGN TOKENS
**Domain Context**: *${domain.toUpperCase()}* — *${moodDescription}*

### Color Roles
- **Primary Brand Accent**: \`${primaryHex}\` (${primaryColorName})
  - Hover State: \`${primaryHoverHex}\`
  - Tailwind Equivalent: \`${primaryTailwind}\`
- **Secondary / Highlight Accent**: \`${accentHex}\`
- **Success / Confirmed State**: \`#10b981\` (\`emerald-500\`)
- **Warning / Pending State**: \`#f59e0b\` (\`amber-500\`)
- **Critical / Danger State**: \`#ef4444\` (\`rose-500\`)

### Light Mode (Default for School, Catalog, Public Portals)
- **Background Base**: \`#ffffff\` / \`#f8fafc\` (\`slate-50\`) — Clean, high-legibility canvas.
- **Card / Surface**: \`#ffffff\` with \`border-slate-200\` and subtle \`shadow-xs\`.
- **Borders & Dividers**: \`#e2e8f0\` (\`slate-200\`).
- **Typography - Heading**: \`#0f172a\` (\`slate-900\`) — Crisp font contrast.
- **Typography - Body**: \`#334155\` (\`slate-700\`).
- **Typography - Muted / Subtext**: \`#64748b\` (\`slate-500\`).

### Dark Mode (For Tech SaaS, Night Dashboards, Developer Tools)
- **Background Base**: \`#09090b\` (\`zinc-950\`) — Deep neutral black, non-murky (Linear style).
- **Card / Surface**: \`#121215\` or \`#18181b\` (\`zinc-900\`) with \`border-zinc-800\`.
- **Borders & Dividers**: \`#27272a\` (\`zinc-800\`) / \`border-white/10\`.
- **Typography - Heading**: \`#f4f4f5\` (\`zinc-100\`).
- **Typography - Body**: \`#d4d4d8\` (\`zinc-300\`).
- **Typography - Muted / Subtext**: \`#a1a1aa\` (\`zinc-400\`).

---

## 4. VERCEL & LINEAR DESIGN ENGINEERING RULES

### A. Concentric Radius Formula
Whenever rounded elements are nested inside another rounded container, the radii MUST be optically balanced:
\`\`\`text
outer_radius = inner_radius + padding
\`\`\`
*Example:* Card with \`rounded-xl\` (12px) and \`p-2\` (8px) must contain buttons with \`rounded-sm\` or \`rounded-md\` (4-6px), never conflicting outer curves.

### B. Typography & Font Smoothing
- **Font Smoothing**: Apply \`-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;\` on the root HTML.
- **Headlines**: Use \`font-extrabold\` or \`font-bold\` with \`tracking-tight\` and \`text-wrap: balance\`.
- **Body & Paragraphs**: Use \`leading-relaxed\` with \`text-wrap: pretty\` to eliminate single-word orphan lines.
- **Metrics, Counters & Currency**: ALWAYS use \`font-mono\` or \`tabular-nums\` to avoid layout jitter during updates.
- **Category Badges & Labels**: Small uppercase text with expanded tracking (\`text-[11px] font-bold uppercase tracking-wider\`).

### C. URL State Persistence & Information Density
- **State in URLs**: For tabs, pagination, search queries, and view toggles, store state in URL search parameters (\`useSearchParams\`) so users can share or reload exact views.
- **Information Density**: Deliver compact, highly scannable layouts with subtle 1px dividers rather than huge empty gaps.
- **Loading Skeletons**: Never leave screens blank white/black during data fetching. Render pulse skeletons matching exact card geometry.

### D. Micro-Interactions & Tactile Polish
- **Hover Transitions**: Apply \`transition-colors duration-150\` or \`transition-all duration-200 ease-out\`.
- **Interactive Cards**: Subtle lift on hover (\`hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-zinc-700\`).
- **Buttons Active State**: Tactile press feel using \`active:scale-[0.98]\`.
- **Real-Time Indicators**: Subtle pulsing dots for active statuses without emojis:
\`\`\`tsx
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
</span>
\`\`\`

---

## 5. CORE COMPONENT BLUEPRINTS

### Primary Action Button
\`\`\`html
<button class="flex items-center justify-center gap-2 rounded-lg bg-[${primaryHex}] px-4 py-2.5 text-xs font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-sm">
  <span>Aksi Utama</span>
  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
</button>
\`\`\`

### Elevated Content Card
\`\`\`html
<div class="rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 space-y-3 transition-all hover:border-[${primaryHex}]/40 shadow-xs">
  <div class="flex items-center justify-between">
    <span class="rounded-md bg-[${primaryHex}]/10 border border-[${primaryHex}]/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[${primaryHex}]">
      Status / Kategori
    </span>
    <span class="text-xs text-slate-400 dark:text-zinc-500 font-mono">ID: #01</span>
  </div>
  <h3 class="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Judul Elemen / Fitur</h3>
  <p class="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">Penjelasan ringkas, padat, dan terstruktur tanpa kata-kata klise.</p>
  </div>
\`\`\`
`;
}

const AI_PALETTE_INVENTIONS: Array<Omit<DesignPalette, 'hasDashboard' | 'isStaticSite'>> = [
  {
    domain: "neo_precision",
    primaryColorName: "Electric Sapphire & Neon Mint",
    primaryHex: "#2563eb",
    primaryHoverHex: "#1d4ed8",
    primaryTailwind: "blue-600",
    accentHex: "#10b981",
    moodDescription: "Presisi tinggi, terpercaya, modern data-dense aesthetic kelas dunia (Stripe & Linear grade)",
  },
  {
    domain: "emerald_wealth",
    primaryColorName: "Royal Emerald & Luminous Teal",
    primaryHex: "#059669",
    primaryHoverHex: "#047857",
    primaryTailwind: "emerald-600",
    accentHex: "#2dd4bf",
    moodDescription: "Kemakmuran, kestabilan finansial, ramah pengguna dengan kontras tinggi yang nyaman di mata",
  },
  {
    domain: "cyber_violet",
    primaryColorName: "Deep Amethyst & Electric Rose",
    primaryHex: "#7c3aed",
    primaryHoverHex: "#6d28d9",
    primaryTailwind: "violet-600",
    accentHex: "#f43f5e",
    moodDescription: "Futuristik, kreatif, eksklusif, cocok untuk platform SaaS generasi baru & perkakas AI",
  },
  {
    domain: "solar_amber",
    primaryColorName: "Solar Amber & Cyan Spark",
    primaryHex: "#d97706",
    primaryHoverHex: "#b45309",
    primaryTailwind: "amber-600",
    accentHex: "#06b6d4",
    moodDescription: "Hangat, berenergi tinggi, fokus operasional cepat tanpa membuat mata lelah",
  },
  {
    domain: "nordic_minimal",
    primaryColorName: "Nordic Ocean & Arctic Frost",
    primaryHex: "#0284c7",
    primaryHoverHex: "#0369a1",
    primaryTailwind: "sky-600",
    accentHex: "#38bdf8",
    moodDescription: "Minimalis Skandinavia, steril, ultra-terbaca dengan pemisahan visual yang tajam",
  },
  {
    domain: "crimson_pulse",
    primaryColorName: "Crimson Ruby & Gold Flare",
    primaryHex: "#e11d48",
    primaryHoverHex: "#be123c",
    primaryTailwind: "rose-600",
    accentHex: "#f59e0b",
    moodDescription: "Tegas, dinamis, mengutamakan konversi cepat dan aksi pengguna yang jelas",
  },
  {
    domain: "obsidian_luxury",
    primaryColorName: "Titanium Slate & Emerald Glint",
    primaryHex: "#334155",
    primaryHoverHex: "#1e293b",
    primaryTailwind: "slate-700",
    accentHex: "#10b981",
    moodDescription: "Mewah, tenang, minimalis monokromatik ala hardware Apple & workstation premium",
  },
];

export function generateAIHarmonicPalette(prd: PRDOutput, currentHex?: string): DesignPalette {
  const current = getDesignPalette(prd);
  // Filter out the current palette to guarantee a fresh, exciting look
  const filtered = AI_PALETTE_INVENTIONS.filter(
    (p) => p.primaryHex.toLowerCase() !== (currentHex || current.primaryHex).toLowerCase()
  );
  const picked = filtered[Math.floor(Math.random() * filtered.length)] || AI_PALETTE_INVENTIONS[0];

  return {
    ...picked,
    hasDashboard: current.hasDashboard,
    isStaticSite: current.isStaticSite,
  };
}


