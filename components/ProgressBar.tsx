'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ value, max = 100, showLabel = true, className, size = 'md' }: ProgressBarProps) {
  const percent = Math.round((value / max) * 100);

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">{percent}%</span>
        </div>
      )}
      <Progress value={percent} className={heights[size]} />
    </div>
  );
}
