import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = store.get(params.id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.report) {
      return NextResponse.json({ error: 'Report not ready yet' }, { status: 404 });
    }

    return NextResponse.json(session.report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}
