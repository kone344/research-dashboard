'use client';

import { useRouter } from 'next/navigation';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ResearchSession } from '@/lib/types';

interface HistoryTableProps {
  sessions: ResearchSession[];
  className?: string;
}

export function HistoryTable({ sessions, className }: HistoryTableProps) {
  const router = useRouter();

  if (sessions.length === 0) {
    return (
      <Card className={cn('bg-card/80 backdrop-blur-sm border-border/50', className)}>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No research sessions found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {sessions.map((session) => (
        <Card
          key={session.id}
          className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-blue-500/30 transition-all cursor-pointer group"
          onClick={() => {
            if (session.status === 'complete') {
              router.push(`/report/${session.id}`);
            } else {
              router.push(`/research/${session.id}`);
            }
          }}
        >
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate group-hover:text-blue-400 transition-colors">
                {session.question}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(session.createdAt).toLocaleDateString()}
                </div>
                <Badge
                  variant={
                    session.status === 'complete' ? 'success' :
                    session.status === 'in_progress' ? 'info' : 'secondary'
                  }
                  className="text-xs"
                >
                  {session.status === 'complete' ? 'Complete' :
                   session.status === 'in_progress' ? 'In Progress' : 'Pending'}
                </Badge>
                {session.sources.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {session.sources.length} sources
                  </span>
                )}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-400 transition-colors flex-shrink-0" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
