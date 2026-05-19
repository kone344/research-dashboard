'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Finding } from '@/lib/types';

interface FindingCardProps {
  finding: Finding;
  index: number;
  className?: string;
}

export function FindingCard({ finding, index, className }: FindingCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/50 p-5 transition-all',
        'bg-card/50 hover:border-blue-500/30 hover:bg-card/80',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold flex items-start gap-2">
          <span className="text-blue-400 font-mono text-sm mt-1">{index + 1}.</span>
          {finding.title}
        </h3>
        <Badge
          variant={
            finding.confidence >= 0.9 ? 'success' :
            finding.confidence >= 0.7 ? 'info' : 'warning'
          }
          className="flex-shrink-0"
        >
          {Math.round(finding.confidence * 100)}% confident
        </Badge>
      </div>
      <p className="text-muted-foreground leading-relaxed text-sm">{finding.description}</p>
      {finding.citations.length > 0 && (
        <div className="flex items-center gap-1 mt-3">
          <span className="text-xs text-muted-foreground mr-1">Citations:</span>
          {finding.citations.map((cite) => (
            <Badge key={cite} variant="outline" className="text-xs px-1.5 py-0 font-mono">
              [{cite}]
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
