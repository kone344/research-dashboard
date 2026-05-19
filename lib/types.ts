export type PhaseStatus = 'pending' | 'active' | 'complete';

export interface SubQuestion {
  id: string;
  question: string;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  reliability: number;
  snippet: string;
}

export interface Claim {
  id: string;
  sourceId: string;
  text: string;
  confidence: number;
}

export interface CrossReference {
  claim: string;
  sources: string[];
  consensusScore: number;
  contradictions: string[];
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  confidence: number;
  citations: number[];
}

export interface ResearchReport {
  id: string;
  question: string;
  executiveSummary: string;
  findings: Finding[];
  sources: Source[];
  overallConfidence: number;
  generatedAt: string;
}

export interface ResearchSession {
  id: string;
  question: string;
  depth: 'quick' | 'standard' | 'deep';
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
  currentPhase: number;
  phases: PhaseStatus[];
  subQuestions: SubQuestion[];
  sources: Source[];
  claims: Claim[];
  crossReferences: CrossReference[];
  report: ResearchReport | null;
  createdAt: string;
  updatedAt: string;
}
