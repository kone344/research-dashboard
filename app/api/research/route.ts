import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/database';
import { runMockResearch } from '@/lib/mock-research';
import { ResearchSession } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, depth = 'standard' } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const id = nanoid(12);
    const now = new Date().toISOString();

    const session: ResearchSession = {
      id,
      question: question.trim(),
      depth,
      status: 'pending',
      currentPhase: -1,
      phases: ['pending', 'pending', 'pending', 'pending', 'pending'],
      subQuestions: [],
      sources: [],
      claims: [],
      crossReferences: [],
      report: null,
      createdAt: now,
      updatedAt: now,
    };

    store.create(session);

    // Start mock research in background (fire and forget)
    runMockResearch(id).catch(console.error);

    return NextResponse.json({ id, status: 'pending' });
  } catch (error) {
    console.error('Error creating research:', error);
    return NextResponse.json({ error: 'Failed to create research' }, { status: 500 });
  }
}
