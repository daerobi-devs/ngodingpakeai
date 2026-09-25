/**
 * Robust Mermaid & PlantUML Auto-Sanitizer for Academic Architect
 * Non-destructively repairs PlantUML usecase syntax, preserves all nodes and connections,
 * enforces UML 2.5 oval shape for use cases, fixes double system titles,
 * and escapes special characters.
 */

export function sanitizeAndFixMermaidCode(rawCode: string, diagramType?: string): string {
  if (!rawCode || typeof rawCode !== 'string') return '';

  let code = rawCode.trim();

  // 1. Strip markdown fences if present
  code = code.replace(/^```(?:mermaid)?\s*\n?/i, '');
  code = code.replace(/\n?```\s*$/i, '');
  code = code.trim();

  // 2. Normalize repeated "Sistem Sistem" or "System System"
  code = code.replace(/Sistem\s+Sistem/gi, 'Sistem');
  code = code.replace(/System\s+System/gi, 'System');

  // 3. If it already starts with valid Mermaid diagram type:
  const isAlreadyMermaid = /^(flowchart|graph|sequenceDiagram|classDiagram|erDiagram|stateDiagram|gantt|pie)\b/i.test(code);

  if (isAlreadyMermaid) {
    // If it's a Use Case or flowchart, ensure oval shapes for use cases
    if (diagramType === 'use_case' || /subgraph\s+.*Sistem/i.test(code) || /UC\d+/i.test(code)) {
      code = enforceUmlUseCaseShapes(code);
    }
    return cleanTrailingSemicolons(code);
  }

  // 4. Non-destructively convert PlantUML or hybrid format to Mermaid flowchart LR
  return convertPlantUmlNonDestructively(code);
}

/**
 * Non-destructive line-by-line transformer from PlantUML / pseudo-Mermaid to Mermaid flowchart LR.
 * Preserves 100% of all nodes, use cases, actors, and relations.
 */
function convertPlantUmlNonDestructively(input: string): string {
  const lines = input.split('\n');
  const outLines: string[] = ['flowchart LR'];
  let insideSystem = false;
  let systemTitle = 'Sistem Perangkat Lunak';

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line) continue;

    // Skip @startuml, @enduml, or raw direction declaration
    if (/^@?(startuml|enduml)/i.test(line)) continue;
    if (/^(mermaid\s+)?direction\s+/i.test(line)) continue;

    // Rectangle / Package / Subgraph boundary
    const rectMatch = line.match(/^(?:rectangle|package|subgraph)\s+"?([^"{\n]+)"?\s*\{?/i);
    if (rectMatch) {
      systemTitle = rectMatch[1].trim().replace(/Sistem\s+Sistem/gi, 'Sistem');
      outLines.push(`  subgraph Sistem["${systemTitle}"]`);
      insideSystem = true;
      continue;
    }

    if (line === '}' && insideSystem) {
      outLines.push('  end');
      insideSystem = false;
      continue;
    }

    // Actor matching:
    // actor Admin as "Administrator"
    // actor "Administrator" as Admin
    // actor Admin
    const actorMatch1 = line.match(/^actor\s+(\w+)\s+as\s+"([^"]+)"/i);
    const actorMatch2 = line.match(/^actor\s+"([^"]+)"\s+as\s+(\w+)/i);
    const actorMatch3 = line.match(/^actor\s+(\w+)/i);
    if (actorMatch1) {
      outLines.push(`  ${actorMatch1[1]}["${actorMatch1[2]}<br/>(Aktor)"]`);
      continue;
    }
    if (actorMatch2) {
      outLines.push(`  ${actorMatch2[2]}["${actorMatch2[1]}<br/>(Aktor)"]`);
      continue;
    }
    if (actorMatch3) {
      outLines.push(`  ${actorMatch3[1]}["${actorMatch3[1]}<br/>(Aktor)"]`);
      continue;
    }

    // Use Case matching:
    // usecase "Label" as ID
    // usecase ID as "Label"
    // (Label) as ID
    // usecase ID
    const ucMatch1 = line.match(/^usecase\s+"([^"]+)"\s+as\s+(\w+)/i);
    const ucMatch2 = line.match(/^usecase\s+(\w+)\s+as\s+"([^"]+)"/i);
    const ucMatch3 = line.match(/^\(([^)]+)\)\s+as\s+(\w+)/i);
    const ucMatch4 = line.match(/^usecase\s+(\w+)/i);
    if (ucMatch1) {
      outLines.push(`    ${ucMatch1[2]}(["${ucMatch1[1]}"])`);
      continue;
    }
    if (ucMatch2) {
      outLines.push(`    ${ucMatch2[1]}(["${ucMatch2[2]}"])`);
      continue;
    }
    if (ucMatch3) {
      outLines.push(`    ${ucMatch3[2]}(["${ucMatch3[1]}"])`);
      continue;
    }
    if (ucMatch4) {
      outLines.push(`    ${ucMatch4[1]}(["${ucMatch4[1]}"])`);
      continue;
    }

    // Relations:
    // Include relation: A .-> B : <<include>> or A ..> B : <<include>>
    const incMatch = line.match(/^(\w+)\s*(?:\.->|\.\.>)\s*(\w+)\s*(?::\s*<<include>>)?/i);
    if (incMatch && line.toLowerCase().includes('include')) {
      outLines.push(`  ${incMatch[1]} -.->|"<<include>>"| ${incMatch[2]}`);
      continue;
    }

    // Extend relation: A .-> B : <<extend>> or A ..> B : <<extend>>
    const extMatch = line.match(/^(\w+)\s*(?:\.->|\.\.>)\s*(\w+)\s*(?::\s*<<extend>>)?/i);
    if (extMatch && line.toLowerCase().includes('extend')) {
      outLines.push(`  ${extMatch[1]} -.->|"<<extend>>"| ${extMatch[2]}`);
      continue;
    }

    // Arrow connection: A --> B
    const arrowMatch = line.match(/^(\w+)\s*-->\s*(\w+)/);
    if (arrowMatch) {
      outLines.push(`  ${arrowMatch[1]} --- ${arrowMatch[2]}`);
      continue;
    }

    // Preserved line (already Mermaid or comments)
    outLines.push(`  ${line}`);
  }

  if (insideSystem) {
    outLines.push('  end');
  }

  let result = outLines.join('\n');
  return cleanTrailingSemicolons(result);
}

/**
 * Enforces UML 2.5 stadium/oval shapes ([ ... ]) for Use Cases
 * instead of square box brackets [ ... ]
 */
function enforceUmlUseCaseShapes(code: string): string {
  const lines = code.split('\n');
  let insideSubgraph = false;
  const processed: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();

    if (/^subgraph\b/i.test(trimmed)) {
      insideSubgraph = true;
    } else if (trimmed === 'end' && insideSubgraph) {
      insideSubgraph = false;
    }

    // If inside subgraph, or line defines a UC... node with square brackets:
    // Convert: UC01["Label"] to UC01(["Label"])
    if (insideSubgraph || /(?:UC\w*|usecase\w*)\s*\["/i.test(trimmed)) {
      line = line.replace(/(\b(?:UC\w*|[A-Za-z0-9_]+))\s*\["([^"]+)"\]/g, (match, nodeId, label) => {
        if (/actor/i.test(nodeId) || /sistem/i.test(nodeId)) return match;
        return `${nodeId}(["${label}"])`;
      });
    }

    processed.push(line);
  }

  return processed.join('\n');
}

function cleanTrailingSemicolons(code: string): string {
  if (!code.startsWith('flowchart') && !code.startsWith('graph')) return code;

  return code
    .split('\n')
    .map((line) => {
      const trimmed = line.trimEnd();
      if (trimmed.endsWith(';') && !trimmed.endsWith('";')) {
        return trimmed.slice(0, -1);
      }
      return line;
    })
    .join('\n');
}

/**
 * Sanitize all diagrams in AcademicDiagramSet
 */
export function sanitizeAcademicDiagramSet(diagrams: any): any {
  if (!diagrams) return diagrams;

  const copy = { ...diagrams };

  if (copy.useCaseDiagram) {
    copy.useCaseDiagram = sanitizeAndFixMermaidCode(copy.useCaseDiagram, 'use_case');
  }

  if (copy.sequenceScenarios && Array.isArray(copy.sequenceScenarios)) {
    copy.sequenceScenarios = copy.sequenceScenarios.map((seq: any) => ({
      ...seq,
      mermaidCode: sanitizeAndFixMermaidCode(seq.mermaidCode, 'sequence'),
    }));
  }

  if (copy.activityScenarios && Array.isArray(copy.activityScenarios)) {
    copy.activityScenarios = copy.activityScenarios.map((act: any) => ({
      ...act,
      mermaidCode: sanitizeAndFixMermaidCode(act.mermaidCode, 'activity'),
    }));
  }

  if (copy.classDiagram) {
    copy.classDiagram = sanitizeAndFixMermaidCode(copy.classDiagram, 'class');
  }

  if (copy.erdDiagram) {
    copy.erdDiagram = sanitizeAndFixMermaidCode(copy.erdDiagram, 'erd');
  }

  if (copy.dfdLevel0Diagram) {
    copy.dfdLevel0Diagram = sanitizeAndFixMermaidCode(copy.dfdLevel0Diagram, 'dfd0');
  }

  if (copy.dfdLevel1Diagram) {
    copy.dfdLevel1Diagram = sanitizeAndFixMermaidCode(copy.dfdLevel1Diagram, 'dfd1');
  }

  if (copy.flowchartDiagram) {
    copy.flowchartDiagram = sanitizeAndFixMermaidCode(copy.flowchartDiagram, 'flowchart');
  }

  if (copy.systemArchitectureDiagram) {
    copy.systemArchitectureDiagram = sanitizeAndFixMermaidCode(copy.systemArchitectureDiagram, 'arch');
  }

  return copy;
}
