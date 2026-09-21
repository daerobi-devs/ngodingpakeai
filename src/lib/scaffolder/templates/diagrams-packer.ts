import type JSZip from "jszip";
import type { PRDOutput } from "@/types/prd";

/**
 * Packs all available Mermaid architecture diagrams from the PRD
 * into standalone .mmd files inside `docs/diagrams/` folder of the ZIP.
 */
export function packDiagramsToZip(rootFolder: JSZip, prd: PRDOutput): void {
  const diagramsFolder = rootFolder.folder("docs/diagrams");
  if (!diagramsFolder) return;

  const diagrams = prd.architecture_diagrams;
  if (!diagrams) return;

  const diagramMap: Array<{ filename: string; title: string; content?: string }> = [
    {
      filename: "01-system-flowchart.mmd",
      title: "System Architecture Flowchart",
      content: diagrams.system_flowchart,
    },
    {
      filename: "02-user-journey-flow.mmd",
      title: "User Journey & State Flow",
      content: diagrams.user_journey_flow,
    },
    {
      filename: "03-database-erd.mmd",
      title: "Database Entity Relationship Diagram (ERD)",
      content: diagrams.database_erd,
    },
    {
      filename: "04-api-integration-matrix.mmd",
      title: "API & Service Integration Matrix",
      content: diagrams.api_integration_matrix,
    },
    {
      filename: "05-sequence-diagram.mmd",
      title: "Core Business Logic Sequence Diagram",
      content: diagrams.sequence_diagram,
    },
    {
      filename: "06-infrastructure-topology.mmd",
      title: "Infrastructure & Deployment Topology",
      content: diagrams.infrastructure_topology,
    },
    {
      filename: "07-rbac-permission-matrix.mmd",
      title: "Role-Based Access Control (RBAC) Matrix",
      content: diagrams.rbac_permission_matrix,
    },
    {
      filename: "08-data-pipeline-flow.mmd",
      title: "Data Pipeline & Worker Flow",
      content: diagrams.data_pipeline_flow,
    },
  ];

  let addedCount = 0;
  for (const item of diagramMap) {
    if (item.content && item.content.trim().length > 0) {
      const sanitizedContent = item.content.trim();
      diagramsFolder.file(item.filename, sanitizedContent);
      addedCount++;
    }
  }

  // Create an index README for the diagrams
  diagramsFolder.file(
    "README.md",
    `# Architecture Diagrams for ${prd.title}

Koleksi diagram Mermaid arsitektur sistem yang diekstrak langsung dari PRD.
Dapat dibuka langsung di VS Code / Cursor menggunakan ekstensi Mermaid Previewer, GitHub markdown preview, atau https://mermaid.live.

## Daftar Diagram (${addedCount} diagram):
${diagramMap
  .filter((d) => d.content && d.content.trim().length > 0)
  .map((d) => `- [${d.title}](./${d.filename})`)
  .join("\n")}
`
  );
}
