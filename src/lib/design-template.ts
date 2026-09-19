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
*Standard: Awesome-Design-MD & Taste-Skill Anti-Slop Specification*

> [!IMPORTANT]
> **Mandatory Frontend Enforcement for AI Coding Agents (Cursor, Claude Code, Windsurf):**
> When writing HTML, CSS, Tailwind, or React/Vue components for this project, you MUST strictly adhere to this DESIGN.md.
> Generic clichés (neon purple gradients, unbranded components, arbitrary padding) are STRICTLY FORBIDDEN.

---

## 🚫 1. THE ANTI-AI-SLOP BANNED LIST (STRICTLY PROHIBITED)
Coding agents are expressly forbidden from introducing the following visual clichés:
1. **NO Neon Purple / Cyan Glow Gradients**: Do NOT combine indigo-500 with cyan-400 for hero text, cards, or background blooms.
2. **NO Floating Glass Dots / Particle Orbs**: Do NOT inject background radial dot grids or fuzzy blur balls behind text.
3. **NO Floating Flat Cards Without Borders**: Cards must NOT rely merely on heavy shadows; every surface must have crisp, subtle border definition.
4. **NO Emoji Clichés for Feature Icons**: Do NOT use raw emojis (🚀, 💡, 🤖, ⚡) inside feature card headers. Use minimalist SVG icon sets (Lucide, Radix, Heroicons).
5. **NO Arbitrary Padding / Spacing**: Never invent arbitrary spacing like \`p-[23px]\`. Stick exclusively to the 4px / 8px scale (\`p-4\`, \`p-6\`, \`gap-4\`).
6. **NO SaaS-Washing on Non-SaaS Products**: If this product is an institutional/school website or local catalog, NEVER render SaaS subscription pricing cards or hacker-style dark modes.

---

## 🎨 2. ADAPTIVE COLOR PALETTE & DESIGN TOKENS
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

### Dark Mode (For Tech SaaS, Night Dashboards, Terminal Views)
- **Background Base**: \`#09090b\` (\`zinc-950\`) — Deep neutral black, non-murky.
- **Card / Surface**: \`#121215\` or \`#18181b\` (\`zinc-900\`) with \`border-zinc-800\`.
- **Borders & Dividers**: \`#27272a\` (\`zinc-800\`) / \`border-white/10\`.
- **Typography - Heading**: \`#f4f4f5\` (\`zinc-100\`).
- **Typography - Body**: \`#d4d4d8\` (\`zinc-300\`).
- **Typography - Muted / Subtext**: \`#a1a1aa\` (\`zinc-400\`).

---

## 📐 3. LAYOUT & GEOMETRIC RULES

### A. Concentric Radius Formula
Whenever rounded elements are nested inside another rounded container, the radii MUST be optically balanced:
\`\`\`text
outer_radius = inner_radius + padding
\`\`\`
*Example:* Card with \`rounded-xl\` (12px) and \`p-2\` (8px) must contain buttons with \`rounded-sm\` or \`rounded-md\` (4-6px), never conflicting outer curves.

### B. Typography Rules
- **Headlines**: Use \`font-extrabold\` or \`font-bold\` with \`tracking-tight\` and \`text-wrap: balance\`.
- **Body & Paragraphs**: Use \`leading-relaxed\` with \`text-wrap: pretty\` to eliminate single-word orphan lines.
- **Metrics, Counters & Currency**: ALWAYS use \`font-mono\` or \`tabular-nums\` to avoid layout jitter during updates.
- **Category Badges & Labels**: Small uppercase text with expanded tracking (\`text-[11px] font-bold uppercase tracking-wider\`).

---

## ⚡ 4. MICRO-INTERACTIONS & MOTION GUIDELINES
- **Hover Transitions**: Apply \`transition-colors duration-150\` or \`transition-all duration-200 ease-out\`.
- **Interactive Cards**: Subtle lift on hover (\`hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-zinc-700\`).
- **Buttons Active State**: Tactile press feel using \`active:scale-[0.98]\`.
- **Real-Time Indicators**: Subtle pulsing dots for active statuses (\`<span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>\`).

---

## 🧩 5. CORE COMPONENT BLUEPRINTS

### Primary Action Button
\`\`\`html
<button class="flex items-center justify-center gap-2 rounded-lg bg-[${primaryHex}] px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-sm">
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

${
  hasDashboard
    ? `
---

## 🖥️ 6. MODERN DASHBOARD & APP SHELL BLUEPRINT (COLLAPSIBLE SIDEBAR)
*Because this application includes a Dashboard, Portal, or Admin Workspace, follow this 4-part App Shell layout:*

### A. App Shell Architecture
\`\`\`text
┌────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (w-64 desktop, collapsible) │ TOP HEADER (Sticky, h-16)       │
│  ├─ Logo & Brand                     │ ├─ Breadcrumbs: App > Page      │
│  ├─ Workspace / Role Switcher        │ ├─ Search Bar (Cmd + K)         │
│  ├─ Nav Items (Active indicator)     │ ├─ Notifications & User Menu    │
│  └─ User Profile Footer              ├─────────────────────────────────┤
│                                      │ MAIN CONTENT (p-6, max-w-7xl)   │
│                                      │ ├─ Page Header & Action CTA     │
│                                      │ ├─ KPI 4-Card Stats Grid        │
│                                      │ └─ Data Table / Interactive View│
└────────────────────────────────────────────────────────────────────────┘
\`\`\`

### B. Implementation Guidelines for Coding Agents
1. **Sidebar Navigation**:
   - Fixed width \`w-64\` on desktop, collapsible to \`w-16\` with icon-only mode.
   - Active link styling: \`bg-[${primaryHex}]/10 text-[${primaryHex}] border-r-2 border-[${primaryHex}] font-semibold\`.
   - Inactive link styling: \`text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/60\`.
2. **Top Header Bar**:
   - \`sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md\`.
   - Includes quick search box with \`kbd\` badge (\`⌘K\` or \`Ctrl+K\`).
3. **Mobile Drawer (Responsive)**:
   - On screens \`< md\` (mobile/tablet), hide desktop sidebar.
   - Use hamburger menu icon triggering a slide-over Sheet/Drawer with backdrop blur.

### C. Sample App Shell Component (Tailwind + React)
\`\`\`tsx
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div class="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* 1. Collapsible Sidebar */}
      <aside class="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 justify-between p-4">
        <div class="space-y-6">
          <div class="flex items-center gap-2 px-2">
            <div class="h-7 w-7 rounded-lg bg-[${primaryHex}] flex items-center justify-center text-white font-bold text-xs">P</div>
            <span class="font-bold text-sm text-slate-900 dark:text-white tracking-tight">${prd.title}</span>
          </div>
          <nav class="space-y-1">
            <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg bg-[${primaryHex}]/10 text-[${primaryHex}] font-medium text-xs">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              <span>Overview</span>
            </a>
          </nav>
        </div>
        <div class="border-t border-slate-100 dark:border-zinc-800 pt-3 flex items-center gap-3 px-2">
          <div class="h-8 w-8 rounded-full bg-slate-200 dark:bg-zinc-700" />
          <div class="text-xs">
            <p class="font-bold text-slate-900 dark:text-white">Operator</p>
            <p class="text-slate-400 text-[10px]">admin@domain.com</p>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <div class="flex-1 flex flex-col min-w-0">
        <header class="sticky top-0 z-20 h-16 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div class="text-xs text-slate-500">Dashboard &gt; Overview</div>
          <div class="flex items-center gap-3">
            <span class="text-[11px] bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono text-slate-500">⌘K Search</span>
          </div>
        </header>
        <main class="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
\`\`\`
`
    : ""
}

${
  isStaticSite
    ? `
---

## 🌐 7. STATIC SITE & LANDING PAGE POLISH CONTRACT
*Because this project includes static/landing page components:*
1. **Core Web Vitals**: Target LCP < 1.2s, CLS 0, and FID < 50ms.
2. **Above-the-Fold Hero**: Clean single headline, value proposition subheadline, 1 primary action, 1 secondary action, social proof badges.
3. **Asset Formats**: Use inline SVGs for crisp icons and WebP/AVIF for photographic assets.
`
    : ""
}
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


