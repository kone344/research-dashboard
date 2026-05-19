import { ResearchSession, ResearchReport, Finding, Source, CrossReference } from './types';
import { store } from './database';

const MOCK_SOURCES: Omit<Source, 'id'>[] = [
  {
    url: 'https://arxiv.org/abs/2301.00001',
    title: 'Large Language Models and Software Engineering: A Systematic Review',
    reliability: 0.95,
    snippet: 'This systematic review examines the impact of LLMs on software development practices, finding significant productivity gains in code generation and debugging tasks.',
  },
  {
    url: 'https://www.mckinsey.com/ai-impact-2024',
    title: 'The State of AI in Software Development - McKinsey Report 2024',
    reliability: 0.88,
    snippet: 'McKinsey reports that AI-assisted development tools have increased developer productivity by 35-45% in organizations that have adopted them at scale.',
  },
  {
    url: 'https://github.blog/ai-developer-survey',
    title: 'GitHub Developer Survey: AI Tools Adoption and Impact',
    reliability: 0.90,
    snippet: 'Survey of 5,000 developers shows 92% are using AI coding tools, with 70% reporting significant productivity improvements.',
  },
  {
    url: 'https://ieeexplore.ieee.org/ai-software-testing',
    title: 'AI-Driven Software Testing: Challenges and Opportunities',
    reliability: 0.92,
    snippet: 'AI-powered testing tools can generate 60% more test coverage while reducing test maintenance effort by 40%.',
  },
  {
    url: 'https://nature.com/ai-code-quality',
    title: 'Impact of AI Code Assistants on Code Quality and Maintainability',
    reliability: 0.94,
    snippet: 'Study finds that while AI-assisted code is produced faster, it requires 15% more review effort initially but results in comparable long-term quality.',
  },
];

const MOCK_SUB_QUESTIONS = [
  'How do AI coding assistants affect developer productivity?',
  'What is the impact of AI on software testing and quality assurance?',
  'How are organizations adopting AI tools in their software development workflows?',
];

const MOCK_FINDINGS: Omit<Finding, 'id'>[] = [
  {
    title: 'Significant Productivity Gains',
    description: 'AI coding assistants have been shown to increase developer productivity by 35-55% across multiple studies. The primary gains come from code generation, auto-completion, and boilerplate reduction [1][2][3].',
    confidence: 0.92,
    citations: [1, 2, 3],
  },
  {
    title: 'Improved Testing Coverage',
    description: 'AI-driven testing tools demonstrate 60% better test coverage with 40% less maintenance effort. These tools excel at generating edge cases and regression tests [4].',
    confidence: 0.85,
    citations: [4],
  },
  {
    title: 'Code Quality Trade-offs',
    description: 'While AI-assisted code is produced faster, initial reviews indicate a 15% increase in review effort. However, long-term code quality metrics are comparable to human-written code [5][1].',
    confidence: 0.78,
    citations: [5, 1],
  },
  {
    title: 'Rapid Industry Adoption',
    description: 'Over 92% of developers report using AI coding tools in some capacity, with 70% citing significant productivity improvements. Enterprise adoption is accelerating [3][2].',
    confidence: 0.95,
    citations: [3, 2],
  },
];

const MOCK_CROSS_REFS: CrossReference[] = [
  {
    claim: 'AI increases developer productivity',
    sources: ['source-1', 'source-2', 'source-3'],
    consensusScore: 0.94,
    contradictions: [],
  },
  {
    claim: 'AI improves test coverage',
    sources: ['source-4'],
    consensusScore: 0.85,
    contradictions: [],
  },
  {
    claim: 'AI code quality is comparable',
    sources: ['source-1', 'source-5'],
    consensusScore: 0.78,
    contradictions: ['Initial review effort may increase'],
  },
];

const PHASE_DURATIONS = [5000, 10000, 8000, 4000, 3000]; // ms per phase

export async function runMockResearch(sessionId: string): Promise<void> {
  const session = store.get(sessionId);
  if (!session) return;

  // Phase 1: Decomposing
  store.update(sessionId, {
    currentPhase: 0,
    phases: ['active', 'pending', 'pending', 'pending', 'pending'],
    status: 'in_progress',
    updatedAt: new Date().toISOString(),
  });

  await delay(PHASE_DURATIONS[0]);

  store.update(sessionId, {
    subQuestions: MOCK_SUB_QUESTIONS.map((q, i) => ({ id: `sq-${i}`, question: q })),
    phases: ['complete', 'active', 'pending', 'pending', 'pending'],
    currentPhase: 1,
    updatedAt: new Date().toISOString(),
  });

  // Phase 2: Searching
  await delay(PHASE_DURATIONS[1]);

  const sources: Source[] = MOCK_SOURCES.map((s, i) => ({
    ...s,
    id: `source-${i + 1}`,
  }));

  store.update(sessionId, {
    sources,
    phases: ['complete', 'complete', 'active', 'pending', 'pending'],
    currentPhase: 2,
    updatedAt: new Date().toISOString(),
  });

  // Phase 3: Reading & Extracting
  await delay(PHASE_DURATIONS[2]);

  const claims = sources.flatMap((source, si) => [
    { id: `claim-${si}-0`, sourceId: source.id, text: `Finding from ${source.title}`, confidence: 0.85 + Math.random() * 0.1 },
    { id: `claim-${si}-1`, sourceId: source.id, text: `Secondary insight from ${source.title}`, confidence: 0.75 + Math.random() * 0.15 },
  ]);

  store.update(sessionId, {
    claims,
    phases: ['complete', 'complete', 'complete', 'active', 'pending'],
    currentPhase: 3,
    updatedAt: new Date().toISOString(),
  });

  // Phase 4: Cross-referencing
  await delay(PHASE_DURATIONS[3]);

  store.update(sessionId, {
    crossReferences: MOCK_CROSS_REFS,
    phases: ['complete', 'complete', 'complete', 'complete', 'active'],
    currentPhase: 4,
    updatedAt: new Date().toISOString(),
  });

  // Phase 5: Synthesizing
  await delay(PHASE_DURATIONS[4]);

  const report: ResearchReport = {
    id: `report-${sessionId}`,
    question: session.question,
    executiveSummary: `This research examines the impact of AI on software development, drawing from ${sources.length} authoritative sources. The findings indicate that AI coding assistants have become nearly ubiquitous in modern development workflows, with significant productivity gains observed across multiple dimensions. While adoption rates exceed 90% among developers, the quality implications remain nuanced, with initial review overhead offset by long-term maintainability benefits.`,
    findings: MOCK_FINDINGS.map((f, i) => ({ ...f, id: `finding-${i}` })),
    sources,
    overallConfidence: 0.88,
    generatedAt: new Date().toISOString(),
  };

  store.update(sessionId, {
    report,
    phases: ['complete', 'complete', 'complete', 'complete', 'complete'],
    status: 'complete',
    currentPhase: 5,
    updatedAt: new Date().toISOString(),
  });
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
