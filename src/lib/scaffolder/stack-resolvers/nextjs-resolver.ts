import type JSZip from "jszip";
import type { PRDOutput, DeepFeature } from "@/types/prd";

export interface ParsedRole {
  name: string;
  slug: string;
  description: string;
}

/**
 * Extracts distinct user roles from PRD target_audience, archetype, and feature user stories.
 */
export function extractRoles(prd: PRDOutput): ParsedRole[] {
  const audience = prd.archetype_detection?.target_audience || "";
  const title = prd.title || "";
  const combined = `${audience} ${title}`.toLowerCase();

  const detected: ParsedRole[] = [];

  // Known role keywords mapped to clean names
  const roleKeywords: Array<{ pattern: RegExp; name: string; slug: string; desc: string }> = [
    { pattern: /\b(dokter|doctor|medis)\b/, name: "Dokter", slug: "dokter", desc: "Portal Manajemen Medis & Pasien" },
    { pattern: /\b(pasien|patient)\b/, name: "Pasien", slug: "pasien", desc: "Portal Pasien & Reservasi Layanan" },
    { pattern: /\b(guru|pengajar|dosen|teacher)\b/, name: "Guru", slug: "guru", desc: "Portal Guru & Manajemen Kelas" },
    { pattern: /\b(siswa|student|murid|mahasiswa)\b/, name: "Siswa", slug: "siswa", desc: "Portal Siswa & Pembelajaran" },
    { pattern: /\b(merchant|toko|seller|penjual|vendor)\b/, name: "Merchant", slug: "merchant", desc: "Portal Merchant & Katalog Produk" },
    { pattern: /\b(kurir|courier|driver)\b/, name: "Kurir", slug: "kurir", desc: "Portal Logistik & Pengantaran" },
    { pattern: /\b(admin|administrator|pengelola)\b/, name: "Admin", slug: "admin", desc: "Pusat Kontrol & Manajemen Sistem" },
  ];

  for (const item of roleKeywords) {
    if (item.pattern.test(combined)) {
      if (!detected.some((r) => r.slug === item.slug)) {
        detected.push({ name: item.name, slug: item.slug, description: item.desc });
      }
    }
  }

  // Fallback if target audience doesn't match specific roles
  if (detected.length === 0) {
    const hasDashboard = prd.archetype_detection?.has_dashboard !== false;
    if (hasDashboard) {
      detected.push(
        { name: "Dashboard", slug: "dashboard", description: "Portal Pengguna & Ringkasan Aktivitas" },
        { name: "Admin", slug: "admin", description: "Pusat Pengaturan & Kontrol Sistem" }
      );
    } else {
      detected.push({ name: "Dashboard", slug: "dashboard", description: "Ringkasan Aplikasi" });
    }
  } else if (!detected.some((r) => r.slug === "admin")) {
    // If specific roles found but no admin, add admin as management shell
    detected.push({ name: "Admin", slug: "admin", description: "Pusat Kontrol & Manajemen Sistem" });
  }

  return detected;
}

/**
 * Assigns features to the most relevant role.
 */
export function mapFeaturesToRoles(features: DeepFeature[], roles: ParsedRole[]): Map<string, DeepFeature[]> {
  const mapping = new Map<string, DeepFeature[]>();
  for (const role of roles) {
    mapping.set(role.slug, []);
  }

  const defaultRoleSlug = roles[0].slug;

  for (const feat of features) {
    const context = `${feat.name} ${feat.user_story} ${(feat.business_rules || []).join(" ")}`.toLowerCase();
    let assigned = false;

    for (const role of roles) {
      if (context.includes(role.slug) || context.includes(role.name.toLowerCase())) {
        mapping.get(role.slug)?.push(feat);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      mapping.get(defaultRoleSlug)?.push(feat);
    }
  }

  return mapping;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Generates a complete Next.js 16 + React 19 + Tailwind v4 starter codebase.
 */
export function resolveNextJsStack(targetFolder: JSZip, prd: PRDOutput): void {
  const roles = extractRoles(prd);
  const features = prd.feature_breakdown || [];
  const featureMap = mapFeaturesToRoles(features, roles);
  const projectName = slugify(prd.title) || "app-starter";

  // 1. package.json
  targetFolder.file(
    "package.json",
    JSON.stringify(
      {
        name: projectName,
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "next lint",
        },
        dependencies: {
          next: "^15.2.0",
          react: "^19.0.0",
          "react-dom": "^19.0.0",
          "lucide-react": "^1.16.0",
          clsx: "^2.1.1",
          "tailwind-merge": "^3.0.2",
        },
        devDependencies: {
          "@types/node": "^22.0.0",
          "@types/react": "^19.0.0",
          "@types/react-dom": "^19.0.0",
          typescript: "^5.7.0",
          tailwindcss: "^4.0.0",
          "@tailwindcss/postcss": "^4.0.0",
          postcss: "^8.5.0",
        },
      },
      null,
      2
    )
  );

  // 2. tsconfig.json
  targetFolder.file(
    "tsconfig.json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: {
            "@/*": ["./src/*"],
          },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"],
      },
      null,
      2
    )
  );

  // 3. next.config.ts
  targetFolder.file(
    "next.config.ts",
    `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
`
  );

  // 4. postcss.config.mjs
  targetFolder.file(
    "postcss.config.mjs",
    `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`
  );

  // 5. .gitignore
  targetFolder.file(
    ".gitignore",
    `# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
`
  );

  // 6. .env.example
  targetFolder.file(
    ".env.example",
    `# Application
NEXT_PUBLIC_APP_NAME="${prd.title.replace(/"/g, '\\"')}"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Backend & Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/${projectName.replace(/-/g, "_")}"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
`
  );

  // 7. src/lib/utils.ts
  targetFolder.file(
    "src/lib/utils.ts",
    `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`
  );

  // 8. src/app/globals.css
  targetFolder.file(
    "src/app/globals.css",
    `@import "tailwindcss";

@layer base {
  :root {
    --background: #09090b;
    --foreground: #fafafa;
    --card: #121215;
    --card-foreground: #fafafa;
    --border: #27272a;
    --primary: #3b82f6;
    --primary-foreground: #ffffff;
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }
}
`
  );

  // 9. src/app/layout.tsx (Root Layout)
  targetFolder.file(
    "src/app/layout.tsx",
    `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${prd.title.replace(/"/g, '\\"')}",
  description: "${(prd.opportunity_framing?.core_problem || "Modern application generated by ngodingpakeprd").replace(/"/g, '\\"')}",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className={\`\${inter.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-blue-600 selection:text-white\`}>
        {children}
      </body>
    </html>
  );
}
`
  );

  // 10. Public Landing Page: src/app/(marketing)/page.tsx
  targetFolder.file(
    "src/app/(marketing)/page.tsx",
    `import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Layers, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
            ${prd.title.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold tracking-tight text-white">${prd.title.replace(/"/g, '\\"')}</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/${roles[0].slug}"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 active:scale-95"
          >
            <span>Masuk ke ${roles[0].name}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden px-6 py-24 text-center sm:py-32">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3.5 py-1 text-xs text-zinc-300 backdrop-blur-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Production-Grade Architecture Ready</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              ${prd.title.replace(/"/g, '\\"')}
            </h1>

            <p className="mx-auto max-w-2xl text-base text-zinc-400 sm:text-lg leading-relaxed">
              ${(prd.opportunity_framing?.working_hypothesis || prd.opportunity_framing?.core_problem || "Platform digital modern terstandarisasi untuk efisiensi operasional.").replace(/"/g, '\\"')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              ${roles
                .map(
                  (r) => `
              <Link
                key="${r.slug}"
                href="/${r.slug}"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800 active:scale-95"
              >
                <span>Portal ${r.name}</span>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </Link>`
                )
                .join("")}
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="border-t border-zinc-800/80 bg-zinc-900/30 px-6 py-20">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Fitur Utama & Modul Sistem
              </h2>
              <p className="text-sm text-zinc-400">
                Dirancang spesifik mengikuti kebutuhan bisnis dan arsitektur MVP.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              ${features
                .slice(0, 6)
                .map(
                  (f) => `
              <div key="${f.id}" className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3 transition hover:border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-400 border border-blue-500/20">
                    ${f.priority}
                  </span>
                  <Zap className="h-4 w-4 text-zinc-500" />
                </div>
                <h3 className="text-base font-semibold text-white">${f.name.replace(/"/g, '\\"')}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                  ${f.user_story.replace(/"/g, '\\"')}
                </p>
              </div>`
                )
                .join("")}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8 text-center text-xs text-zinc-500">
        <p>&copy; {new Date().getFullYear()} ${prd.title.replace(/"/g, '\\"')}. All rights reserved.</p>
      </footer>
    </div>
  );
}
`
  );

  // 11. Multi-Role App Shells & Dynamic Feature Sub-routes
  for (const role of roles) {
    const roleFeatures = featureMap.get(role.slug) || [];

    // src/components/AppSidebar.tsx (per role or universal)
    targetFolder.file(
      `src/components/${role.slug}/Sidebar.tsx`,
      `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Settings,
  ChevronRight,
  LogOut,
  Shield,
  FileText
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/${role.slug}" },
  ${roleFeatures
    .map((f) => {
      const fSlug = slugify(f.name);
      return `{ label: "${f.name.replace(/"/g, '\\"')}", href: "/${role.slug}/${fSlug}", badge: "${f.priority}" },`;
    })
    .join("\n  ")}
];

export function ${role.name}Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 px-4 py-5">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 pb-6 border-b border-zinc-800/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
          ${prd.title.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white truncate max-w-[150px]">${prd.title.replace(/"/g, '\\"')}</span>
          <span className="text-[10px] font-medium text-blue-400 font-mono">Portal ${role.name}</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={\`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition \${
                isActive
                  ? "bg-zinc-800 text-white font-semibold shadow-xs"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }\`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Layers className="h-4 w-4 shrink-0 text-zinc-400" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-400 border border-blue-500/20">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="border-t border-zinc-800/80 pt-4 px-2 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2 truncate">
            <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300 font-bold">
              ${role.name.charAt(0)}
            </div>
            <span className="truncate">${role.name} User</span>
          </div>
          <Link href="/" className="hover:text-white" title="Keluar ke Beranda">
            <LogOut className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
`
    );

    // src/app/([role])/layout.tsx
    targetFolder.file(
      `src/app/(${role.slug})/layout.tsx`,
      `import { ${role.name}Sidebar } from "@/components/${role.slug}/Sidebar";
import { Bell, Search } from "lucide-react";

export default function ${role.name}Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <${role.name}Sidebar />

      {/* Main Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-400">Portal /</span>
            <span className="text-xs font-semibold text-white">${role.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Cari fitur atau data..."
                className="h-8 rounded-lg border border-zinc-800 bg-zinc-900/60 pl-8 pr-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-hidden"
              />
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white">
              <Bell className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
`
    );

    // src/app/([role])/page.tsx (Role Overview)
    targetFolder.file(
      `src/app/(${role.slug})/page.tsx`,
      `import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock, Layers, ShieldCheck } from "lucide-react";

export default function ${role.name}OverviewPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">${role.description}</h1>
          <p className="text-xs text-zinc-400">
            Selamat datang di portal ${role.name} untuk ${prd.title.replace(/"/g, '\\"')}.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">Status Operasional</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">Online</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-zinc-500">Seluruh modul aktif normal</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">Total Modul Fitur</span>
          <div className="text-xl font-bold text-white tabular-nums">${roleFeatures.length} Modul</div>
          <p className="text-[10px] text-zinc-500">Tersinkronisasi dengan spesifikasi PRD</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">Standar UI</span>
          <div className="text-xl font-bold text-white">Linear Taste</div>
          <p className="text-[10px] text-zinc-500">Dark Zinc 950 + Zero Emoji</p>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Daftar Modul & Aksi</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          ${roleFeatures
            .map((f) => {
              const fSlug = slugify(f.name);
              return `
          <Link
            key="${f.id}"
            href="/${role.slug}/${fSlug}"
            className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2 transition hover:border-zinc-700 hover:bg-zinc-900/80"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-400 border border-blue-500/20">
                ${f.priority}
              </span>
              <ArrowUpRight className="h-4 w-4 text-zinc-500 transition group-hover:text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition">${f.name.replace(/"/g, '\\"')}</h3>
            <p className="text-xs text-zinc-400 line-clamp-2">${f.user_story.replace(/"/g, '\\"')}</p>
          </Link>`;
            })
            .join("")}
        </div>
      </div>
    </div>
  );
}
`
    );

    // Dynamic Sub-routes for P0 and P1 features
    for (const feat of roleFeatures) {
      const fSlug = slugify(feat.name);
      targetFolder.file(
        `src/app/(${role.slug})/${fSlug}/page.tsx`,
        `"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Plus, Filter, RefreshCw, Shield } from "lucide-react";

export default function ${role.name}_${fSlug.replace(/-/g, "_")}_Page() {
  const [activeTab, setActiveTab] = useState<"view" | "rules" | "tech">("view");

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-400 border border-blue-500/20">
              ${feat.priority}
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white">${feat.name.replace(/"/g, '\\"')}</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
            ${feat.user_story.replace(/"/g, '\\"')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800 active:scale-95">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 active:scale-95">
            <Plus className="h-3.5 w-3.5" />
            <span>Buat Entitas Baru</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("view")}
          className={\`border-b-2 px-3 pb-2 text-xs font-medium transition \${
            activeTab === "view"
              ? "border-blue-500 text-white font-semibold"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }\`}
        >
          Alur Kerja (Happy Path)
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={\`border-b-2 px-3 pb-2 text-xs font-medium transition \${
            activeTab === "rules"
              ? "border-blue-500 text-white font-semibold"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }\`}
        >
          Aturan Bisnis & Validasi (${(feat.business_rules || []).length})
        </button>
        <button
          onClick={() => setActiveTab("tech")}
          className={\`border-b-2 px-3 pb-2 text-xs font-medium transition \${
            activeTab === "tech"
              ? "border-blue-500 text-white font-semibold"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }\`}
        >
          Tech Mapping
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "view" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Langkah Eksekusi Modul</h3>
            <div className="space-y-3">
              ${(feat.happy_path || ["User membuka modul", "Sistem memvalidasi hak akses", "Menampilkan data interaktif"])
                .map(
                  (step, idx) => `
              <div key={${idx}} className="flex items-start gap-3 rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 font-mono text-[10px] font-bold text-blue-400 border border-blue-500/20">
                  ${idx + 1}
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">${step.replace(/"/g, '\\"')}</p>
              </div>`
                )
                .join("")}
            </div>
          </div>
        </div>
      )}

      {activeTab === "rules" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Business Rules & Edge Cases</h3>
            <div className="space-y-2">
              ${(feat.business_rules || ["Data wajib tervalidasi sebelum disimpan."])
                .map(
                  (rule, idx) => `
              <div key={${idx}} className="flex items-start gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>${rule.replace(/"/g, '\\"')}</span>
              </div>`
                )
                .join("")}
            </div>

            ${
              feat.edge_cases && feat.edge_cases.length > 0
                ? `
            <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-2">
              <span className="text-xs font-semibold text-amber-400">Penanganan Edge Cases:</span>
              <div className="space-y-1.5">
                ${feat.edge_cases
                  .map(
                    (ec, idx) => `
                <div key={${idx}} className="flex items-start gap-2.5 text-xs text-zinc-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span>${ec.replace(/"/g, '\\"')}</span>
                </div>`
                  )
                  .join("")}
              </div>
            </div>`
                : ""
            }
          </div>
        </div>
      )}

      {activeTab === "tech" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
              <span className="text-xs font-semibold text-zinc-300">API Endpoints Terkait</span>
              <div className="space-y-1 font-mono text-[11px] text-blue-400">
                ${((feat.tech_mapping?.api_endpoints || []).length > 0
                  ? feat.tech_mapping!.api_endpoints!
                  : [`/api/v1/${fSlug}`]
                )
                  .map((ep) => `<div>${ep}</div>`)
                  .join("")}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
              <span className="text-xs font-semibold text-zinc-300">Tabel Database</span>
              <div className="space-y-1 font-mono text-[11px] text-emerald-400">
                ${((feat.tech_mapping?.db_tables || []).length > 0
                  ? feat.tech_mapping!.db_tables!
                  : [fSlug.replace(/-/g, "_")]
                )
                  .map((tb) => `<div>${tb}</div>`)
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`
      );
    }
  }
}
