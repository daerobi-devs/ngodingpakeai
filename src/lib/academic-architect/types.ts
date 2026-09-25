export type DiagramType =
  | 'use_case'
  | 'sequence'
  | 'activity'
  | 'class_diagram'
  | 'erd'
  | 'dfd'
  | 'flowchart';

export type CurriculumSchool = 'uml' | 'structured';

export interface UseCaseScenarioStep {
  step: number;
  actorAction: string;
  systemReaction: string;
}

export interface UseCaseScenario {
  id: string;
  useCaseName: string;
  primaryActor: string;
  description: string;
  preCondition: string;
  postCondition: string;
  mainFlow: UseCaseScenarioStep[];
  alternativeFlow: string[];
}

export interface DataDictionaryField {
  columnName: string;
  dataType: string;
  length?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: string;
  nullable: boolean;
  description: string;
}

export interface DataDictionaryTable {
  tableName: string;
  description: string;
  fields: DataDictionaryField[];
}

export interface SequenceScenario {
  id: string;
  title: string;
  featureKey: string;
  mermaidCode: string;
  description: string;
  steps: string[];
}

export interface ActivityScenario {
  id: string;
  title: string;
  featureKey: string;
  mermaidCode: string;
  swimlanes: {
    actor: string;
    actions: string[];
  }[];
}

export interface DefenseQAItem {
  id: string;
  diagramTarget: DiagramType | 'general';
  criticalQuestion: string;
  scientificAnswer: string;
  laymanAnalogy: string;
  theoryReference: string;
}

export interface AuditIssue {
  id: string;
  diagramType: DiagramType;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  violationExplanation: string;
  suggestedFix: string;
  autoFixAvailable: boolean;
  theoryRule: string;
}

export interface CodeTraceItem {
  diagramElement: string;
  diagramType: DiagramType;
  sourceFile: string;
  lineReference?: string;
  elementRole: string;
  status: 'verified' | 'inferred' | 'repaired';
}

export interface ScannedSourceFile {
  path: string;
  fileType: 'sql' | 'prisma' | 'route' | 'controller' | 'manifest' | 'config';
  summary: string;
  extractedEntities: string[];
}

export interface AcademicDiagramSet {
  useCaseDiagram: string;
  useCaseScenarios: UseCaseScenario[];
  sequenceScenarios: SequenceScenario[];
  activityScenarios: ActivityScenario[];
  classDiagram: string;
  erdDiagram: string;
  dataDictionary: DataDictionaryTable[];
  dfdLevel0Diagram: string;
  dfdLevel1Diagram: string;
  flowchartDiagram: string;
  systemArchitectureDiagram: string;
  sqlDdlScript: string;
}

export interface RawExtractedBlueprint {
  systemTitle: string;
  systemDescription: string;
  techStackSummary: {
    frontend?: string;
    backend?: string;
    database?: string;
    thirdPartyServices?: string[];
  };
  actors: string[];
  modules: {
    id: string;
    name: string;
    actor: string;
    endpoints: string[];
    tables: string[];
    steps: string[];
  }[];
  detectedTables: {
    name: string;
    columns: {
      name: string;
      type: string;
      isPk: boolean;
      isFk: boolean;
      references?: string;
    }[];
  }[];
  sourceFilesCount: number;
  warnings?: string[];
}

export interface ArchitectProject {
  id: string;
  title: string;
  description: string;
  curriculumSchool: CurriculumSchool;
  createdAt: string;
  updatedAt: string;
  sourceType: 'drag_folder' | 'github_repo' | 'mcp_agent' | 'prd_import' | 'idea_scratch';
  sourceMetadata?: {
    repoUrl?: string;
    folderName?: string;
    prdId?: string;
    filesScanned?: ScannedSourceFile[];
  };
  blueprint: RawExtractedBlueprint;
  diagrams: AcademicDiagramSet;
  auditIssues: AuditIssue[];
  defenseQA: DefenseQAItem[];
  traceabilityMatrix: CodeTraceItem[];
  revisionHistory?: {
    version: number;
    timestamp: string;
    instruction: string;
  }[];
}
