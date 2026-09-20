export type RoadmapLevel = 'fundamental' | 'intermediate' | 'advanced' | 'mastery';
export type NodeStatus = 'not_started' | 'in_progress' | 'completed';
export type LinkType = 'doc' | 'course' | 'github' | 'article' | 'job_board' | 'practice';

export interface CuratedLink {
  title: string;
  url: string;
  type: LinkType;
  description?: string;
}

export interface ProjectChallenge {
  title: string;
  description: string;
  deliverable: string;
}

export interface RoadmapSubBranch {
  id: string;
  title: string;
  category?: string;
  summary?: string;
  estimatedHours?: string;
  actionSteps?: string[];
  keyTopics?: string[];
  curatedLinks?: CuratedLink[];
  projectChallenge?: ProjectChallenge;
  commonPitfalls?: string[];
  status?: NodeStatus;
  children?: RoadmapSubBranch[];
  isExpanded?: boolean;
}

export interface RoadmapNode {
  id: string;
  title: string;
  category: string;
  level: RoadmapLevel;
  status: NodeStatus;
  estimatedHours: string;
  summary: string;
  actionSteps: string[];
  keyTopics: string[];
  curatedLinks: CuratedLink[];
  projectChallenge?: ProjectChallenge;
  commonPitfalls?: string[];
  dependencies: string[];
  children?: string[];
  subBranches?: RoadmapSubBranch[];
}

export interface RoadmapOutput {
  id: string;
  goal: string;
  title: string;
  targetRoleOrOutcome: string;
  totalEstimatedWeeks: string;
  summary: string;
  nodes: RoadmapNode[];
  createdAt: string;
  updatedAt: string;
}
