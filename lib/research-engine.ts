import { chat, chatJSON } from './mimo-client';
import { store } from './database';
import { nanoid } from 'nanoid';
import type {
  ResearchSession,
  ResearchReport,
  Finding,
  Source,
  Claim,
  CrossReference,
} from './types';

// ── Phase 0: Decompose question into sub-questions ──────────────────
async function decomposeQuestion(question: string): Promise<string[]> {
  const response = await chatJSON<{ sub_questions: string[] }>([
    {
      role: 'system',
      content: `You are a research planning AI. Given a research question, break it down into 3-5 specific sub-questions that would need to be answered to fully address the main question.
Return JSON only: {"sub_questions": ["q1", "q2", ...]}`,
    },
    {
      role: 'user',
      content: `Research question: "${question}"`,
    },
  ], { max_tokens: 512, temperature: 0.5 });

  return response.sub_questions || [];
}

// ── Phase 1: Search for sources (LLM-generated realistic sources) ───
async function searchSources(
  question: string,
  subQuestions: string[]
): Promise<Omit<Source, 'id'>[]> {
  const sources = await chatJSON<{ sources: Omit<Source, 'id'>[] }>([
    {
      role: 'system',
      content: `You are a research source finder. Given a research question and sub-questions, generate 5-8 realistic and authoritative sources that would contain relevant information.
Each source must have: url, title, reliability (0-1), snippet (2-3 sentence summary).
Use real-looking URLs from known domains (arxiv.org, nature.com, ieee.org, github.blog, mckinsey.com, gartner.com, etc).
Return JSON only: {"sources": [{"url": "...", "title": "...", "reliability": 0.85, "snippet": "..."}]}`,
    },
    {
      role: 'user',
      content: `Main question: "${question}"\n\nSub-questions:\n${subQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
    },
  ], { max_tokens: 2048, temperature: 0.7 });

  return sources.sources || [];
}

// ── Phase 2: Extract claims from sources ─────────────────────────────
async function extractClaims(
  question: string,
  sources: Omit<Source, 'id'>[]
): Promise<Omit<Claim, 'id'>[]> {
  const claims = await chatJSON<{ claims: Omit<Claim, 'id'>[] }>([
    {
      role: 'system',
      content: `You are a research analyst. Given a research question and a list of sources with their snippets, extract key claims/findings from each source.
Each claim must have: sourceIndex (0-based index of the source), text (the claim), confidence (0-1).
Return JSON only: {"claims": [{"sourceIndex": 0, "text": "...", "confidence": 0.85}]}`,
    },
    {
      role: 'user',
      content: `Question: "${question}"\n\nSources:\n${sources
        .map(
          (s, i) =>
            `[${i}] "${s.title}" (${s.url})\nSnippet: ${s.snippet}\nReliability: ${s.reliability}`
        )
        .join('\n\n')}`,
    },
  ], { max_tokens: 2048, temperature: 0.5 });

  return (claims.claims || []).map((c) => ({
    sourceId: `source-${c.sourceIndex + 1}`,
    text: c.text,
    confidence: c.confidence,
  }));
}

// ── Phase 3: Cross-reference claims ──────────────────────────────────
async function crossReference(
  claims: Omit<Claim, 'id'>[],
  sources: Omit<Source, 'id'>[]
): Promise<CrossReference[]> {
  const refs = await chatJSON<{ cross_references: { claim: string; sourceIndices: number[]; consensusScore: number; contradictions: string[] }[] }>([
    {
      role: 'system',
      content: `You are a research cross-referencing AI. Given a list of claims from different sources, identify which claims support each other and any contradictions.
Return JSON only: {"cross_references": [{"claim": "summary of claim", "sourceIndices": [0, 1], "consensusScore": 0.85, "contradictions": []}]}`,
    },
    {
      role: 'user',
      content: `Claims:\n${claims
        .map((c, i) => `[${i}] (from ${c.sourceId}) ${c.text} (confidence: ${c.confidence})`)
        .join('\n')}`,
    },
  ], { max_tokens: 1536, temperature: 0.4 });

  return (refs.cross_references || []).map((r) => ({
    claim: r.claim,
    sources: r.sourceIndices.map((i) => `source-${i + 1}`),
    consensusScore: r.consensusScore,
    contradictions: r.contradictions,
  }));
}

// ── Phase 4: Synthesize final report ─────────────────────────────────
async function synthesizeReport(
  question: string,
  sources: Source[],
  claims: Claim[],
  crossRefs: CrossReference[]
): Promise<{ executiveSummary: string; findings: Omit<Finding, 'id'>[]; overallConfidence: number }> {
  const result = await chatJSON<{
    executive_summary: string;
    findings: { title: string; description: string; confidence: number; citationIndices: number[] }[];
    overall_confidence: number;
  }>([
    {
      role: 'system',
      content: `You are a research report synthesizer. Given a research question, sources, extracted claims, and cross-references, produce a comprehensive research report.
Return JSON only:
{
  "executive_summary": "2-3 paragraph executive summary...",
  "findings": [
    {"title": "Finding title", "description": "Detailed description with citations like [1][2]", "confidence": 0.85, "citationIndices": [0, 1]}
  ],
  "overall_confidence": 0.85
}`,
    },
    {
      role: 'user',
      content: `Question: "${question}"

Sources:
${sources.map((s, i) => `[${i + 1}] "${s.title}" - ${s.url} (reliability: ${s.reliability})`).join('\n')}

Key Claims:
${claims.map((c) => `- ${c.text} (confidence: ${c.confidence})`).join('\n')}

Cross-References:
${crossRefs.map((r) => `- ${r.claim} (consensus: ${r.consensusScore}, contradictions: ${r.contradictions.length > 0 ? r.contradictions.join('; ') : 'none'})`).join('\n')}`,
    },
  ], { max_tokens: 3000, temperature: 0.6 });

  return {
    executiveSummary: result.executive_summary,
    findings: (result.findings || []).map((f) => ({
      title: f.title,
      description: f.description,
      confidence: f.confidence,
      citations: f.citationIndices,
    })),
    overallConfidence: result.overall_confidence,
  };
}

// ── Main research pipeline ───────────────────────────────────────────
export async function runResearch(sessionId: string): Promise<void> {
  const session = store.get(sessionId);
  if (!session) return;

  const update = (partial: Partial<ResearchSession>) => {
    store.update(sessionId, {
      ...partial,
      updatedAt: new Date().toISOString(),
    });
  };

  try {
    // Phase 0: Decompose
    update({
      currentPhase: 0,
      phases: ['active', 'pending', 'pending', 'pending', 'pending'],
      status: 'in_progress',
    });

    const subQuestions = await decomposeQuestion(session.question);

    update({
      subQuestions: subQuestions.map((q, i) => ({ id: `sq-${i}`, question: q })),
      phases: ['complete', 'active', 'pending', 'pending', 'pending'],
      currentPhase: 1,
    });

    // Phase 1: Search sources
    const rawSources = await searchSources(session.question, subQuestions);

    const sources: Source[] = rawSources.map((s, i) => ({
      ...s,
      id: `source-${i + 1}`,
    }));

    update({
      sources,
      phases: ['complete', 'complete', 'active', 'pending', 'pending'],
      currentPhase: 2,
    });

    // Phase 2: Extract claims
    const rawClaims = await extractClaims(session.question, rawSources);

    const claims: Claim[] = rawClaims.map((c, i) => ({
      ...c,
      id: `claim-${i}`,
    }));

    update({
      claims,
      phases: ['complete', 'complete', 'complete', 'active', 'pending'],
      currentPhase: 3,
    });

    // Phase 3: Cross-reference
    const crossReferences = await crossReference(rawClaims, rawSources);

    update({
      crossReferences,
      phases: ['complete', 'complete', 'complete', 'complete', 'active'],
      currentPhase: 4,
    });

    // Phase 4: Synthesize report
    const { executiveSummary, findings, overallConfidence } = await synthesizeReport(
      session.question,
      sources,
      claims,
      crossReferences
    );

    const report: ResearchReport = {
      id: `report-${sessionId}`,
      question: session.question,
      executiveSummary,
      findings: findings.map((f, i) => ({ ...f, id: `finding-${i}` })),
      sources,
      overallConfidence,
      generatedAt: new Date().toISOString(),
    };

    update({
      report,
      phases: ['complete', 'complete', 'complete', 'complete', 'complete'],
      status: 'complete',
      currentPhase: 5,
    });
  } catch (error) {
    console.error('Research pipeline error:', error);
    update({ status: 'failed' });
  }
}
