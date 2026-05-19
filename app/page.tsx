'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, BookOpen, FileText, Database, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ResearchSession } from '@/lib/types';

interface Stats {
  total: number;
  sources: number;
  reports: number;
}

export default function HomePage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<Stats>({ total: 0, sources: 0, reports: 0 });
  const [recentResearch, setRecentResearch] = useState<ResearchSession[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecent();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setStats(data.stats || { total: 0, sources: 0, reports: 0 });
    } catch (e) {
      console.error('Failed to fetch stats', e);
    }
  }

  async function fetchRecent() {
    try {
      const res = await fetch('/api/history?limit=5');
      const data = await res.json();
      setRecentResearch(data.sessions || []);
    } catch (e) {
      console.error('Failed to fetch recent', e);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), depth: 'standard' }),
      });
      const data = await res.json();
      router.push(`/research/${data.id}`);
    } catch (e) {
      console.error('Failed to start research', e);
      setIsSubmitting(false);
    }
  }

  const statCards = [
    { label: 'Total Researches', value: stats.total, icon: Database, color: 'text-blue-400' },
    { label: 'Sources Analyzed', value: stats.sources, icon: BookOpen, color: 'text-purple-400' },
    { label: 'Reports Generated', value: stats.reports, icon: FileText, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center pt-12 pb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
          <Sparkles className="h-4 w-4" />
          Powered by Autonomous AI Agent
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
          <span className="text-gradient">AI Research Agent</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Ask any research question and watch the AI agent decompose, search, analyze, and synthesize findings in real-time.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative flex gap-2 bg-card rounded-xl p-2 border border-border/50">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g., What is the impact of AI on software development?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="pl-10 h-12 bg-transparent border-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button
                type="submit"
                disabled={!question.trim() || isSubmitting}
                className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Starting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Research
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {statCards.map((stat) => (
          <Card key={stat.label} className="glass-card hover:border-border transition-colors">
            <CardContent className="p-6 text-center">
              <stat.icon className={cn('h-8 w-8 mx-auto mb-3', stat.color)} />
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Research */}
      {recentResearch.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Recent Research</h2>
          <div className="space-y-3">
            {recentResearch.map((session) => (
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
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate group-hover:text-blue-400 transition-colors">
                      {session.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                      <Badge
                        variant={
                          session.status === 'complete'
                            ? 'success'
                            : session.status === 'in_progress'
                            ? 'info'
                            : 'secondary'
                        }
                      >
                        {session.status === 'complete' ? 'Complete' : session.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
