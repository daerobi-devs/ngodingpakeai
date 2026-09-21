import type JSZip from "jszip";
import type { PRDOutput, DeepFeature } from "@/types/prd";

export interface ParsedRole {
  name: string;
  slug: string;
  description: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function toPascalCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

export function toSafeIdentifier(text: string, suffix: string = ""): string {
  let id = toPascalCase(text);
  if (!id) id = "Module";
  if (/^[0-9]/.test(id)) id = "_" + id;
  return `${id}${suffix}`;
}

export function toSafeNpmPackageName(text: string): string {
  let slug = slugify(text);
  if (!slug || !/^[a-z0-9]/.test(slug)) {
    slug = "app-" + (slug || "starter");
  }
  return slug.slice(0, 214);
}

/**
 * Normalizes features from PRD: uses feature_breakdown if present,
 * or dynamically synthesizes from boundaries.scope if feature_breakdown is empty.
 * Guarantees that every PRD produces real feature files matching its actual content.
 */
export function getNormalizedFeatures(prd: PRDOutput): DeepFeature[] {
  if (prd.feature_breakdown && prd.feature_breakdown.length > 0) {
    return prd.feature_breakdown;
  }

  const scope = prd.boundaries?.scope || [];
  if (scope.length > 0) {
    return scope.map((name, idx) => {
      const cleanSlug = slugify(name);
      const pascalName = toSafeIdentifier(name);

      return {
        id: `feat-${idx + 1}`,
        name,
        priority: idx < 3 ? "P0" : "P1",
        user_story: `Sebagai pengguna, saya ingin mengoperasikan modul ${name} untuk mendukung alur kerja sistem.`,
        happy_path: [`Akses modul ${name}`, `Validasi parameter input`, `Proses data ${name}`],
        business_rules: [`Data pada modul ${name} harus tervalidasi sebelum dieksekusi.`],
        edge_cases: [`Penanganan timeout atau kegagalan koneksi pada ${name}.`],
        tech_mapping: {
          frontend_components: [`${pascalName}View`],
          api_endpoints: [`/api/v1/${cleanSlug}`],
          db_tables: [cleanSlug.replace(/-/g, "_")],
        },
        agent_prompt: `Implementasikan arsitektur modul ${name} sesuai spesifikasi PRD.`,
      };
    });
  }

  return [
    {
      id: "feat-core",
      name: "Core System Engine",
      priority: "P0",
      user_story: "Sebagai pengguna, saya dapat menjalankan modul pemrosesan utama sistem.",
      happy_path: ["Inisialisasi sistem", "Proses data", "Tampilkan hasil"],
      business_rules: ["Validasi input wajib dipenuhi."],
      edge_cases: ["Error handling pada kegagalan eksekusi."],
      tech_mapping: {
        api_endpoints: ["/api/v1/core"],
        db_tables: ["core_records"],
      },
      agent_prompt: "Bangun modul inti sistem.",
    },
  ];
}

/**
 * Dynamically extracts roles directly from PRD user stories and target_audience.
 * ZERO hardcoded role lists. If there are 2 or more distinct roles (e.g. Kasir & Koki,
 * Dokter & Pasien, Mandor & Operator), it dynamically generates portals for them.
 * If single-user / tool / engine, returns empty array to keep a clean unified layout.
 */
export function extractRoles(prd: PRDOutput): ParsedRole[] {
  const detected: ParsedRole[] = [];
  const audience = prd.archetype_detection?.target_audience || "";
  const features = prd.feature_breakdown || [];

  // 1. Dynamically parse from User Stories ("Sebagai [Role]..." or "As a [Role]...")
  for (const feat of features) {
    const story = feat.user_story || "";
    const matchId = story.match(/(?:sebagai|untuk)\s+([A-Za-z0-9\s_-]+?)(?:,|\s+saya|\s+agar|\s+kami|\s+bisa|\s+dapat|\.)/i);
    const matchEn = story.match(/as\s+(?:a|an)\s+([A-Za-z0-9\s_-]+?)(?:,|\s+i\s+want|\s+i\s+can|\s+so\s+that|\.)/i);
    const rawRole = (matchId?.[1] || matchEn?.[1] || "").trim();

    if (rawRole && rawRole.length >= 3 && rawRole.length <= 25) {
      const slug = slugify(rawRole);
      const ignored = ["user", "pengguna", "sistem", "system", "aplikasi", "semua", "publik", "guest"];
      if (!detected.some((r) => r.slug === slug) && !ignored.includes(slug)) {
        detected.push({
          name: rawRole.charAt(0).toUpperCase() + rawRole.slice(1),
          slug,
          description: `Portal Akses & Manajemen ${rawRole}`,
        });
      }
    }
  }

  // 2. Dynamically parse from target_audience string (split by comma, dan, and, &, /)
  if (audience) {
    const segments = audience.split(/[,/&]|\s+dan\s+|\s+and\s+/i);
    for (let seg of segments) {
      seg = seg.trim().replace(/^(para|semua|calon|seluruh|staf|tim)\s+/i, "").trim();
      if (seg && seg.length >= 3 && seg.length <= 25) {
        const slug = slugify(seg);
        const ignored = ["user", "pengguna", "semua", "publik", "umum", "anyone", "masyarakat"];
        if (!detected.some((r) => r.slug === slug) && !ignored.includes(slug)) {
          detected.push({
            name: seg.charAt(0).toUpperCase() + seg.slice(1),
            slug,
            description: `Portal ${seg}`,
          });
        }
      }
    }
  }

  // If at least 2 distinct operational roles are found, treat as multi-role system
  if (detected.length >= 2) {
    return detected;
  }

  // Otherwise, return empty for clean single unified app
  return [];
}

/**
 * Assigns features to their corresponding role if multi-role system is active.
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

/**
 * Generates a clean, 100% dynamic Next.js starter codebase.
 * ZERO static marketing folders, ZERO hardcoded role templates.
 */
export function resolveNextJsStack(targetFolder: JSZip, prd: PRDOutput): void {
  const roles = extractRoles(prd);
  const isMultiRole = roles.length >= 2;
  const features = getNormalizedFeatures(prd);
  const projectName = toSafeNpmPackageName(prd.title);

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
          next: "^16.0.0",
          react: "^19.0.0",
          "react-dom": "^19.0.0",
          "lucide-react": "^1.46.0",
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
import { Layers } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/" },
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
            Active
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
import { ArrowRight, Layers } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">${prd.title.replace(/"/g, '\\"')}</h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
          ${(prd.opportunity_framing?.working_hypothesis || prd.opportunity_framing?.core_problem || "Workspace modular siap pakai yang terstruktur langsung dari PRD.").replace(/"/g, '\\"')}
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
          <span className="text-[11px] font-medium text-zinc-400">Arsitektur</span>
          <div className="text-2xl font-bold text-white">Next.js 16</div>
          <p className="text-[10px] text-zinc-500">Tailwind v4 + Zero Emoji</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">Status Sistem</span>
          <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
            <span>Ready</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-[10px] text-zinc-500">Siap dikembangkan dengan AI Coding Agent</p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Modul Fitur Utama</h2>
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
        `/**
 * =========================================================================
 * MODUL: ${feat.name} [${feat.priority}]
 * =========================================================================
 * User Story:
 * ${feat.user_story}
 *
 * Alur Kerja (Happy Path):
${(feat.happy_path || []).map((step, sIdx) => ` *   ${sIdx + 1}. ${step}`).join("\n")}
 *
 * Aturan Bisnis & Validasi:
${(feat.business_rules || []).map((rule) => ` *   - ${rule}`).join("\n")}
 *
 * Tech Mapping:
 * - Endpoints: ${(feat.tech_mapping?.api_endpoints || []).join(", ") || "-"}
 * - Tables: ${(feat.tech_mapping?.db_tables || []).join(", ") || "-"}
 * =========================================================================
 */

import { CheckCircle2, ArrowLeft, Layers, Database, Globe } from "lucide-react";
import Link from "next/link";

export default function ${toSafeIdentifier(feat.name, "Page")}() {
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

      {/* Alur Kerja & Aturan Bisnis */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
            <Layers className="h-4 w-4 text-blue-400" />
            <span>Alur Kerja (Happy Path)</span>
          </div>
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

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Aturan Bisnis & Validasi</span>
          </div>
          <div className="space-y-2">
            ${(feat.business_rules || ["Parameter wajib tervalidasi sebelum pemrosesan."])
              .map(
                (rule, idx) => `
            <div key={${idx}} className="flex items-start gap-2.5 text-xs text-zinc-300 rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-3">
              <span className="font-mono text-emerald-400 text-xs mt-0.5">•</span>
              <span className="leading-relaxed">${rule.replace(/"/g, '\\"')}</span>
            </div>`
              )
              .join("")}
          </div>
        </div>
      </div>

      {/* Tech Mapping */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 font-mono">
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            <span>Endpoint API Terkait</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-blue-400">
            ${((feat.tech_mapping?.api_endpoints || []).length > 0
              ? feat.tech_mapping!.api_endpoints!
              : [`/api/v1/${fSlug}`]
            )
              .map((ep) => `<div className="bg-zinc-950 px-2.5 py-1.5 rounded border border-zinc-800/80">${ep}</div>`)
              .join("")}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 font-mono">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>Tabel Database</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-emerald-400">
            ${((feat.tech_mapping?.db_tables || []).length > 0
              ? feat.tech_mapping!.db_tables!
              : [fSlug.replace(/-/g, "_")]
            )
              .map((tb) => `<div className="bg-zinc-950 px-2.5 py-1.5 rounded border border-zinc-800/80">${tb}</div>`)
              .join("")}
          </div>
        </div>
      </div>
    </div>
  );
}
`
      );
    }
  }

  // =========================================================================
  // SCENARIO 2: Multi-Role Application (Extracted dynamically from PRD)
  // Route groups: src/app/([role])/...
  // ZERO (marketing) folder!
  // =========================================================================
  if (isMultiRole) {
    const featureMap = mapFeaturesToRoles(features, roles);

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

    // Root page: Role Portal Switcher
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
      const roleFeatures = featureMap.get(role.slug) || [];
      const sidebarComp = toSafeIdentifier(role.name, "Sidebar");
      const layoutComp = toSafeIdentifier(role.name, "Layout");
      const pageComp = toSafeIdentifier(role.name, "DashboardPage");

      targetFolder.file(
        `src/components/${role.slug}/Sidebar.tsx`,
        `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, LogOut } from "lucide-react";

export function ${sidebarComp}() {
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
        ${roleFeatures
          .map((f) => {
            const fSlug = slugify(f.name);
            return `
        <Link
          href="/${role.slug}/${fSlug}"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition"
        >
          <span className="truncate">${f.name.replace(/"/g, '\\"')}</span>
        </Link>`;
          })
          .join("")}
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
        `import { ${sidebarComp} } from "@/components/${role.slug}/Sidebar";

export default function ${layoutComp}({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <${sidebarComp} />
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
        `import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ${pageComp}() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-xl font-bold text-white">${role.description}</h1>
        <p className="text-xs text-zinc-400 mt-1">Selamat datang di workspace ${role.name} untuk ${prd.title.replace(/"/g, '\\"')}.</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Modul Khusus ${role.name}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          ${roleFeatures
            .map((f) => {
              const fSlug = slugify(f.name);
              return `
          <Link
            key="${f.id}"
            href="/${role.slug}/${fSlug}"
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

      // Feature sub-routes for this role
      for (const feat of roleFeatures) {
        const fSlug = slugify(feat.name);
        const featPageComp = toSafeIdentifier(role.name + "_" + feat.name, "Page");

        targetFolder.file(
          `src/app/(${role.slug})/${fSlug}/page.tsx`,
          `/**
 * =========================================================================
 * MODUL: ${feat.name} [${feat.priority}]
 * PORTAL: ${role.name}
 * =========================================================================
 * User Story:
 * ${feat.user_story}
 *
 * Alur Kerja (Happy Path):
${(feat.happy_path || []).map((step, sIdx) => ` *   ${sIdx + 1}. ${step}`).join("\n")}
 *
 * Aturan Bisnis & Validasi:
${(feat.business_rules || []).map((rule) => ` *   - ${rule}`).join("\n")}
 *
 * Tech Mapping:
 * - Endpoints: ${(feat.tech_mapping?.api_endpoints || []).join(", ") || "-"}
 * - Tables: ${(feat.tech_mapping?.db_tables || []).join(", ") || "-"}
 * =========================================================================
 */

import { CheckCircle2, ArrowLeft, Layers, Database, Globe } from "lucide-react";
import Link from "next/link";

export default function ${featPageComp}() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-400 border border-blue-500/20">
              ${feat.priority}
            </span>
            <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Portal ${role.name}
            </span>
            <h1 className="text-lg font-bold tracking-tight text-white">${feat.name.replace(/"/g, '\\"')}</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            ${feat.user_story.replace(/"/g, '\\"')}
          </p>
        </div>

        <Link
          href="/${role.slug}"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke ${role.name}</span>
        </Link>
      </div>

      {/* Alur Kerja & Aturan Bisnis */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
            <Layers className="h-4 w-4 text-blue-400" />
            <span>Alur Kerja (Happy Path)</span>
          </div>
          <div className="space-y-2">
            ${(feat.happy_path || ["Inisialisasi modul", "Validasi parameter input", "Eksekusi proses"])
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

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Aturan Bisnis & Validasi</span>
          </div>
          <div className="space-y-2">
            ${(feat.business_rules || ["Otorisasi hak akses peran wajib tervalidasi."])
              .map(
                (rule, idx) => `
            <div key={${idx}} className="flex items-start gap-2.5 text-xs text-zinc-300 rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-3">
              <span className="font-mono text-emerald-400 text-xs mt-0.5">•</span>
              <span className="leading-relaxed">${rule.replace(/"/g, '\\"')}</span>
            </div>`
              )
              .join("")}
          </div>
        </div>
      </div>

      {/* Tech Mapping */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 font-mono">
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            <span>Endpoint API Terkait</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-blue-400">
            ${((feat.tech_mapping?.api_endpoints || []).length > 0
              ? feat.tech_mapping!.api_endpoints!
              : [`/api/v1/${role.slug}/${fSlug}`]
            )
              .map((ep) => `<div className="bg-zinc-950 px-2.5 py-1.5 rounded border border-zinc-800/80">${ep}</div>`)
              .join("")}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 font-mono">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>Tabel Database</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-emerald-400">
            ${((feat.tech_mapping?.db_tables || []).length > 0
              ? feat.tech_mapping!.db_tables!
              : [fSlug.replace(/-/g, "_")]
            )
              .map((tb) => `<div className="bg-zinc-950 px-2.5 py-1.5 rounded border border-zinc-800/80">${tb}</div>`)
              .join("")}
          </div>
        </div>
      </div>
    </div>
  );
}
`
        );
      }
    }
  }
}
