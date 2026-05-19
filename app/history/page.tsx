'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { History, Search, Clock, ArrowRight, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ResearchSession } from '@/lib/types';

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'complete' | 'in_progress'>('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (e) {
      console.error('Failed to fetch sessions', e);
    } finally {
      setLoading(false);
    }
  }

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || session.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <History className="h-8 w-8 text-blue-400" />
          Research History
        </h1>
        <p className="text-muted-foreground mt-1">Browse your past research sessions</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search research questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'complete', 'in_progress'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'complete' ? 'Complete' : 'In Progress'}
            </Button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filter !== 'all'
                ? 'No matching research sessions found'
                : 'No research sessions yet. Start your first research!'}
            </p>
            {!searchTerm && filter === 'all' && (
              <Button
                className="mt-4"
                onClick={() => router.push('/')}
              >
                Start Research
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              className="glass-card hover:border-blue-500/30 transition-all cursor-pointer group"
              onClick={() => {
                if (session.status === 'complete') {
                  router.push(`/report/${session.id}`);
                } else {
                  router.push(`/research/${session.id}`);
                }
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-lg truncate group-hover:text-blue-400 transition-colors">
                      {session.question}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                      <Badge
                        variant={
                          session.status === 'complete' ? 'success' :
                          session.status === 'in_progress' ? 'info' : 'secondary'
                        }
                      >
                        {session.status === 'complete' ? 'Complete' :
                         session.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </Badge>
                      <Badge variant="outline">{session.depth}</Badge>
                      {session.sources.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {session.sources.length} sources
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
