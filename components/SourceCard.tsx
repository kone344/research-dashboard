'use client';

import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Source } from '@/lib/types';

interface SourceCardProps {
  source: Source;
  index: number;
  className?: string;
}

export function SourceCard({ source, index, className }: SourceCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border/50 p-4 transition-all',
        'bg-card/50 hover:border-purple-500/30 hover:bg-card/80',
        'group',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-purple-400 font-mono text-lg font-bold flex-shrink-0">
          [{index + 1}]
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sm hover:text-blue-400 transition-colors flex items-center gap-1.5 group/link"
            >
              {source.title}
              <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
            </a>
            <Badge
              variant={source.reliability >= 0.9 ? 'success' : source.reliability >= 0.8 ? 'info' : 'warning'}
              className="flex-shrink-0 text-xs"
            >
              {Math.round(source.reliability * 100)}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{source.snippet}</p>
          <p className="text-xs text-muted-foreground/40 mt-1 truncate">{source.url}</p>
        </div>
      </div>
    </div>
  );
}
