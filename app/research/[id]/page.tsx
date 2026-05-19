'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Search, FileText, BarChart3, GitMerge, Sparkles, CheckCircle2, 
  Circle, Loader2, ArrowRight, ExternalLink 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ResearchSession } from '@/lib/types';

const PHASES = [
  { id: 0, name: 'Decomposing Question', icon: Search, color: 'text-blue-400' },
  { id: 1, name: 'Searching Web', icon: Search, color: 'text-purple-400' },
  { id: 2, name: 'Reading & Extracting', icon: FileText, color: 'text-yellow-400' },
  { id: 3, name: 'Cross-referencing', icon: GitMerge, color: 'text-orange-400' },
  { id: 4, name: 'Synthesizing Report', icon: Sparkles, color: 'text-green-400' },
];

export default function ResearchProgressPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/research/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        if (data.status === 'complete') {
          setTimeout(() => router.push(`/report/${params.id}`), 2000);
        }
      }
    } catch (e) {
      console.error('Failed to fetch session', e);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Research session not found</p>
      </div>
    );
  }

  const progressPercent = Math.round(((session.currentPhase + 1) / 5) * 100);
  const isComplete = session.status === 'complete';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Research in Progress</h1>
        <p className="text-muted-foreground text-lg">{session.question}</p>
      </div>

      {/* Progress Bar */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="flex justify-between mt-2">
            {PHASES.map((phase) => (
              <div
                key={phase.id}
                className={cn(
                  'text-xs',
                  session.phases[phase.id] === 'complete' && 'text-green-400',
                  session.phases[phase.id] === 'active' && 'text-blue-400',
                  session.phases[phase.id] === 'pending' && 'text-muted-foreground'
                )}
              >
                {phase.id + 1}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase Cards */}
      <div className="space-y-4">
        {PHASES.map((phase) => {
          const status = session.phases[phase.id];
          const isActive = status === 'active';
          const isComplete = status === 'complete';

          return (
            <Card
              key={phase.id}
              className={cn(
                'glass-card transition-all',
                isActive && 'border-blue-500/50 glow-blue',
                isComplete && 'border-green-500/30'
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div className="relative">
                    {isComplete ? (
                      <CheckCircle2 className="h-8 w-8 text-green-400" />
                    ) : isActive ? (
                      <div className="relative">
                        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                        <div className="absolute inset-0 animate-pulse-ring">
                          <div className="h-8 w-8 rounded-full border-2 border-blue-400" />
                        </div>
                      </div>
                    ) : (
                      <Circle className="h-8 w-8 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Phase Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        'font-semibold',
                        isActive && 'text-blue-400',
                        isComplete && 'text-green-400',
                        !isActive && !isComplete && 'text-muted-foreground'
                      )}>
                        Phase {phase.id + 1}: {phase.name}
                      </h3>
                      {isActive && (
                        <Badge variant="info" className="animate-pulse">Active</Badge>
                      )}
                      {isComplete && <Badge variant="success">Complete</Badge>}
                    </div>

                    {/* Phase Content */}
                    <div className="mt-3">
                      {phase.id === 0 && isComplete && session.subQuestions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground mb-2">Sub-questions identified:</p>
                          {session.subQuestions.map((sq, i) => (
                            <div key={sq.id} className="flex items-start gap-2 text-sm">
                              <span className="text-blue-400 font-mono">{i + 1}.</span>
                              <span>{sq.question}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {phase.id === 1 && (isActive || isComplete) && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {isComplete 
                              ? `Found ${session.sources.length} relevant sources`
                              : `Searching... found ${session.sources.length} sources so far`
                            }
                          </p>
                          {session.sources.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {session.sources.map((source) => (
                                <div
                                  key={source.id}
                                  className="flex items-center gap-2 text-sm p-2 rounded-lg bg-secondary/50"
                                >
                                  <ExternalLink className="h-3 w-3 text-purple-400 flex-shrink-0" />
                                  <span className="truncate">{source.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {phase.id === 2 && (isActive || isComplete) && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {isComplete
                              ? `Extracted ${session.claims.length} claims from ${session.sources.length} sources`
                              : `Processing sources... ${session.claims.length} claims found`
                            }
                          </p>
                        </div>
                      )}

                      {phase.id === 3 && (isActive || isComplete) && session.crossReferences.length > 0 && (
                        <div className="space-y-2">
                          {session.crossReferences.map((cr, i) => (
                            <div key={i} className="text-sm p-2 rounded-lg bg-secondary/50">
                              <p className="font-medium">{cr.claim}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-muted-foreground">Consensus:</span>
                                <Badge variant={cr.consensusScore > 0.8 ? 'success' : 'warning'}>
                                  {Math.round(cr.consensusScore * 100)}%
                                </Badge>
                                {cr.contradictions.length > 0 && (
                                  <Badge variant="destructive">
                                    {cr.contradictions.length} contradiction{cr.contradictions.length > 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {phase.id === 4 && isComplete && (
                        <p className="text-sm text-green-400">
                          Report generated successfully! Redirecting...
                        </p>
                      )}

                      {!isComplete && !isActive && (
                        <p className="text-sm text-muted-foreground italic">Waiting...</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* View Report Button */}
      {isComplete && (
        <div className="text-center">
          <Button
            onClick={() => router.push(`/report/${params.id}`)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8"
          >
            View Full Report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-3">
        <div className="h-8 w-64 bg-secondary rounded animate-pulse" />
        <div className="h-5 w-96 bg-secondary rounded animate-pulse" />
      </div>
      <div className="h-20 bg-secondary rounded-xl animate-pulse" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
