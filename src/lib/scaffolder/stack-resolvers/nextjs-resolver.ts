import type JSZip from "jszip";
import type { PRDOutput, DeepFeature } from "@/types/prd";

export interface ParsedRole {
  name: string;
  slug: string;
  description: string;
}

/**
 * Extracts distinct user roles ONLY if explicitly mentioned in target_audience.
 * If no distinct multiple roles exist, returns an empty array to indicate a unified application.
 */
export function extractRoles(prd: PRDOutput): ParsedRole[] {
  const audience = (prd.archetype_detection?.target_audience || "").toLowerCase();
  const detected: ParsedRole[] = [];

  const roleKeywords: Array<{ pattern: RegExp; name: string; slug: string; desc: string }> = [
    { pattern: /\b(dokter|doctor|medis)\b/, name: "Dokter", slug: "dokter", desc: "Portal Manajemen Medis & Pasien" },
    { pattern: /\b(pasien|patient)\b/, name: "Pasien", slug: "pasien", desc: "Portal Pasien & Reservasi Layanan" },
    { pattern: /\b(guru|pengajar|dosen|teacher)\b/, name: "Guru", slug: "guru", desc: "Portal Guru & Manajemen Kelas" },
    { pattern: /\b(siswa|student|murid|mahasiswa)\b/, name: "Siswa", slug: "siswa", desc: "Portal Siswa & Pembelajaran" },
    { pattern: /\b(merchant|seller|penjual|vendor)\b/, name: "Merchant", slug: "merchant", desc: "Portal Merchant & Penjualan" },
    { pattern: /\b(kurir|courier|driver)\b/, name: "Kurir", slug: "kurir", desc: "Portal Logistik & Pengantaran" },
  ];

  for (const item of roleKeywords) {
    if (item.pattern.test(audience)) {
      if (!detected.some((r) => r.slug === item.slug)) {
        detected.push({ name: item.name, slug: item.slug, description: item.desc });
      }
    }
  }

  // Only return roles if at least 2 distinct roles are explicitly detected (e.g. Dokter & Pasien)
  if (detected.length >= 2) {
    if (audience.includes("admin") && !detected.some((r) => r.slug === "admin")) {
      detected.push({ name: "Admin", slug: "admin", description: "Pusat Kontrol & Pengaturan Sistem" });
    }
    return detected;
  }

  // Otherwise, return empty to treat as a clean unified application
  return [];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Generates a clean Next.js starter codebase strictly tailored to the PRD.
 * NO fake marketing folders, NO boilerplate sales hero sections.
 */
export function resolveNextJsStack(targetFolder: JSZip, prd: PRDOutput): void {
  const roles = extractRoles(prd);
  const isMultiRole = roles.length >= 2;
  const features = prd.feature_breakdown || [];
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

  // =========================================================================
  // SCENARIO 1: Unified Application (Standard / Developer Tool / Engine / Single App)
  // Clean root app structure: src/app/page.tsx, src/app/[feature]/page.tsx
  // ZERO (marketing) and ZERO (dashboard) folders!
  // =========================================================================
  if (!isMultiRole) {
    // src/components/Sidebar.tsx
    targetFolder.file(
      "src/components/Sidebar.tsx",
      `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, ChevronRight } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Console Overview", href: "/" },
  ${features
    .map((f) => {
      const fSlug = slugify(f.name);
      return `{ label: "${f.name.replace(/"/g, '\\"')}", href: "/${fSlug}", badge: "${f.priority}" },`;
    })
    .join("\n  ")}
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 px-4 py-5">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 pb-5 border-b border-zinc-800/80">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
          ${prd.title.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-white truncate">${prd.title.replace(/"/g, '\\"')}</span>
          <span className="text-[10px] text-zinc-500 font-mono">Workspace</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
          Modul Sistem (${features.length})
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={\`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition \${
                isActive
                  ? "bg-zinc-800 text-white font-semibold"
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

      {/* Footer */}
      <div className="border-t border-zinc-800/80 pt-4 px-2">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Status</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ready
          </span>
        </div>
      </div>
    </aside>
  );
}
`
    );

    // src/app/layout.tsx (Root Layout with Sidebar)
    targetFolder.file(
      "src/app/layout.tsx",
      `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${prd.title.replace(/"/g, '\\"')}",
  description: "${(prd.opportunity_framing?.core_problem || "Application workspace generated by ngodingpakeprd").replace(/"/g, '\\"')}",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className={\`\${inter.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-blue-600 selection:text-white flex\`}>
        <Sidebar />
        <main className="flex-1 ml-64 p-6 min-w-0 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
`
    );

    // src/app/page.tsx (Main Console / Overview)
    targetFolder.file(
      "src/app/page.tsx",
      `import Link from "next/link";
import { Layers, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">${prd.title.replace(/"/g, '\\"')}</h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
          ${(prd.opportunity_framing?.working_hypothesis || prd.opportunity_framing?.core_problem || "Platform digital terstruktur untuk otomasi dan efisiensi sistem.").replace(/"/g, '\\"')}
        </p>
      </div>

      {/* Metrics Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">Total Modul Fitur</span>
          <div className="text-2xl font-bold text-white tabular-nums">${features.length}</div>
          <p className="text-[10px] text-zinc-500">Terspesifikasi di docs/PRD.md</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">Arsitektur UI</span>
          <div className="text-2xl font-bold text-white">Next.js 16</div>
          <p className="text-[10px] text-zinc-500">Tailwind v4 + Zero Emoji</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">Status Sistem</span>
          <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
            <span>Online</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-[10px] text-zinc-500">Siap dikembangkan dengan AI Coding Agent</p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Daftar Modul & Sub-rute</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          ${features
            .map((f) => {
              const fSlug = slugify(f.name);
              return `
          <Link
            key="${f.id}"
            href="/${fSlug}"
            className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/80"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-400 border border-blue-500/20">
                  ${f.priority}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white transition" />
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition">${f.name.replace(/"/g, '\\"')}</h3>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">${f.user_story.replace(/"/g, '\\"')}</p>
            </div>
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

    // Feature Sub-routes: src/app/[feature_slug]/page.tsx
    for (const feat of features) {
      const fSlug = slugify(feat.name);
      targetFolder.file(
        `src/app/${fSlug}/page.tsx`,
        `"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Terminal } from "lucide-react";
import Link from "next/link";

export default function ${fSlug.replace(/-/g, "_")}_Page() {
  const [activeTab, setActiveTab] = useState<"flow" | "rules" | "tech">("flow");

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-400 border border-blue-500/20">
              ${feat.priority}
            </span>
            <h1 className="text-lg font-bold tracking-tight text-white">${feat.name.replace(/"/g, '\\"')}</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            ${feat.user_story.replace(/"/g, '\\"')}
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("flow")}
          className={\`border-b-2 px-3 pb-2 text-xs font-medium transition \${
            activeTab === "flow" ? "border-blue-500 text-white font-semibold" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }\`}
        >
          Alur Kerja (Happy Path)
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={\`border-b-2 px-3 pb-2 text-xs font-medium transition \${
            activeTab === "rules" ? "border-blue-500 text-white font-semibold" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }\`}
        >
          Aturan Bisnis & Validasi (${(feat.business_rules || []).length})
        </button>
        <button
          onClick={() => setActiveTab("tech")}
          className={\`border-b-2 px-3 pb-2 text-xs font-medium transition \${
            activeTab === "tech" ? "border-blue-500 text-white font-semibold" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }\`}
        >
          Tech Mapping
        </button>
      </div>

      {/* Tab 1: Flow */}
      {activeTab === "flow" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">Langkah Eksekusi</h3>
          <div className="space-y-2">
            ${(feat.happy_path || ["Inisialisasi modul", "Validasi parameter input", "Eksekusi proses utama"])
              .map(
                (step, idx) => `
            <div key={${idx}} className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 font-mono text-[10px] font-bold text-blue-400 border border-blue-500/20">
                ${idx + 1}
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">${step.replace(/"/g, '\\"')}</p>
            </div>`
              )
              .join("")}
          </div>
        </div>
      )}

      {/* Tab 2: Rules */}
      {activeTab === "rules" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">Business Rules</h3>
          <div className="space-y-2">
            ${(feat.business_rules || ["Parameter wajib tervalidasi sebelum pemrosesan."])
              .map(
                (rule, idx) => `
            <div key={${idx}} className="flex items-start gap-2.5 text-xs text-zinc-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>${rule.replace(/"/g, '\\"')}</span>
            </div>`
              )
              .join("")}
          </div>
        </div>
      )}

      {/* Tab 3: Tech */}
      {activeTab === "tech" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
            <span className="text-xs font-semibold text-zinc-300">Endpoint API</span>
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
      )}
    </div>
  );
}
`
      );
    }
  }

  // =========================================================================
  // SCENARIO 2: Multi-Role Application (Dokter, Pasien, Guru, Siswa, dll.)
  // Explicit route groups: src/app/([role])/...
  // ZERO (marketing) folder!
  // =========================================================================
  if (isMultiRole) {
    // Root layout
    targetFolder.file(
      "src/app/layout.tsx",
      `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${prd.title.replace(/"/g, '\\"')}",
  description: "${(prd.opportunity_framing?.core_problem || "Multi-role application workspace").replace(/"/g, '\\"')}",
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

    // Root page: Role Portal Chooser
    targetFolder.file(
      "src/app/page.tsx",
      `import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";

export default function PortalChooserPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100">
      <div className="max-w-xl w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">${prd.title.replace(/"/g, '\\"')}</h1>
          <p className="text-xs text-zinc-400">Pilih portal peran Anda untuk masuk ke sistem.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          ${roles
            .map(
              (r) => `
          <Link
            key="${r.slug}"
            href="/${r.slug}"
            className="group flex flex-col items-start rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition hover:border-zinc-700 hover:bg-zinc-900"
          >
            <div className="flex w-full items-center justify-between mb-2">
              <span className="text-sm font-bold text-white group-hover:text-blue-400 transition">Portal ${r.name}</span>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition" />
            </div>
            <p className="text-xs text-zinc-400">${r.description}</p>
          </Link>`
            )
            .join("")}
        </div>
      </div>
    </div>
  );
}
`
    );

    // Populate each role route group
    for (const role of roles) {
      targetFolder.file(
        `src/components/${role.slug}/Sidebar.tsx`,
        `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, LogOut } from "lucide-react";

export function ${role.name}Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 px-4 py-5">
      <div className="flex items-center gap-3 px-2 pb-5 border-b border-zinc-800/80">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
          ${role.name.charAt(0)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-white truncate">${prd.title.replace(/"/g, '\\"')}</span>
          <span className="text-[10px] text-blue-400 font-mono">Portal ${role.name}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        <Link
          href="/${role.slug}"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-900 transition"
        >
          <Layers className="h-4 w-4 text-zinc-400" />
          <span>Dashboard ${role.name}</span>
        </Link>
      </div>

      <div className="border-t border-zinc-800/80 pt-4 px-2">
        <Link href="/" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition">
          <LogOut className="h-3.5 w-3.5" />
          <span>Ganti Portal</span>
        </Link>
      </div>
    </aside>
  );
}
`
      );

      targetFolder.file(
        `src/app/(${role.slug})/layout.tsx`,
        `import { ${role.name}Sidebar } from "@/components/${role.slug}/Sidebar";

export default function ${role.name}Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <${role.name}Sidebar />
      <main className="flex-1 ml-64 p-6 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
`
      );

      targetFolder.file(
        `src/app/(${role.slug})/page.tsx`,
        `export default function ${role.name}Page() {
  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="text-xl font-bold text-white">${role.description}</h1>
      <p className="text-xs text-zinc-400">Selamat datang di workspace ${role.name}.</p>
    </div>
  );
}
`
      );
    }
  }
}
