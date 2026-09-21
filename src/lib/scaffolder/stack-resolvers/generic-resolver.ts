import type JSZip from "jszip";
import type { PRDOutput } from "@/types/prd";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Fallback Clean Architecture generator for generic stacks or unmapped technologies.
 */
export function resolveGenericStack(targetFolder: JSZip, prd: PRDOutput): void {
  const projectName = slugify(prd.title) || "clean-architecture-app";
  const features = prd.feature_breakdown || [];

  // 1. README.md
  targetFolder.file(
    "README.md",
    `# ${prd.title} — Clean Architecture Starter

Starter arsitektur bersih (*Clean Architecture*) terstruktur untuk ${prd.title}.

## Struktur Folder:
- \`src/domain/\`: Entitas inti bisnis & aturan validasi independen dari framework.
- \`src/usecases/\`: Skenario alur kerja (*Happy Path* & *Business Logic*) fitur P0/P1.
- \`src/interfaces/\`: Kontrak presenter, controller, dan adapter database.
- \`src/infrastructure/\`: Implementasi framework, database query, dan HTTP router.
- \`docs/PRD.md\`: Spesifikasi produk lengkap.
`
  );

  // 2. src/domain/
  for (const feat of features) {
    const slug = slugify(feat.name);
    targetFolder.file(
      `src/domain/${slug}.md`,
      `# Domain Entity: ${feat.name}
Priority: ${feat.priority}

## User Story:
${feat.user_story}

## Business Rules:
${(feat.business_rules || []).map((r) => `- ${r}`).join("\n")}

## Edge Cases:
${(feat.edge_cases || []).map((ec) => `- ${ec}`).join("\n")}
`
    );

    targetFolder.file(
      `src/usecases/${slug}-usecase.md`,
      `# Use Case: ${feat.name}

## Alur Kerja Utama (Happy Path):
${(feat.happy_path || []).map((step, idx) => `${idx + 1}. ${step}`).join("\n")}

## Tech Mapping:
- Endpoints: ${(feat.tech_mapping?.api_endpoints || []).join(", ") || "-"}
- Database Tables: ${(feat.tech_mapping?.db_tables || []).join(", ") || "-"}
`
    );
  }
}
