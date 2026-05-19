import { ResearchSession } from './types';

// In-memory store that works on Vercel (no native dependencies)
class InMemoryStore {
  private sessions: Map<string, ResearchSession> = new Map();

  create(session: ResearchSession): void {
    this.sessions.set(session.id, { ...session });
  }

  get(id: string): ResearchSession | undefined {
    const session = this.sessions.get(id);
    return session ? { ...session } : undefined;
  }

  update(id: string, updates: Partial<ResearchSession>): void {
    const session = this.sessions.get(id);
    if (session) {
      this.sessions.set(id, { ...session, ...updates });
    }
  }

  list(limit = 50, offset = 0): ResearchSession[] {
    const all = Array.from(this.sessions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return all.slice(offset, offset + limit);
  }

  getStats(): { total: number; sources: number; reports: number } {
    const sessions = Array.from(this.sessions.values());
    return {
      total: sessions.length,
      sources: sessions.reduce((acc, s) => acc + s.sources.length, 0),
      reports: sessions.filter(s => s.status === 'complete').length,
    };
  }
}

// Singleton instance
const globalStore = globalThis as typeof globalThis & {
  __researchStore?: InMemoryStore;
};

if (!globalStore.__researchStore) {
  globalStore.__researchStore = new InMemoryStore();
}

export const store = globalStore.__researchStore;
