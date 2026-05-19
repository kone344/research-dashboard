'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PhaseStatus } from '@/lib/types';

interface PhaseCardProps {
  phaseNumber: number;
  title: string;
  status: PhaseStatus;
  children?: React.ReactNode;
  className?: string;
}

export function PhaseCard({ phaseNumber, title, status, children, className }: PhaseCardProps) {
  const isActive = status === 'active';
  const isComplete = status === 'complete';

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-all',
        'bg-card/80 backdrop-blur-sm',
        isActive && 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
        isComplete && 'border-green-500/30',
        !isActive && !isComplete && 'border-border/50 opacity-60',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {isComplete ? (
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          ) : isActive ? (
            <div className="relative">
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              <div className="absolute inset-0 animate-pulse-ring">
                <div className="h-8 w-8 rounded-full border-2 border-blue-400 opacity-50" />
              </div>
            </div>
          ) : (
            <Circle className="h-8 w-8 text-muted-foreground/30" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3
              className={cn(
                'font-semibold',
                isActive && 'text-blue-400',
                isComplete && 'text-green-400',
                !isActive && !isComplete && 'text-muted-foreground'
              )}
            >
              Phase {phaseNumber}: {title}
            </h3>
            {isActive && <Badge variant="info" className="animate-pulse">Active</Badge>}
            {isComplete && <Badge variant="success">Complete</Badge>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
