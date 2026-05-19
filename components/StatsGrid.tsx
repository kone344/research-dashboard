'use client';

import { Database, BookOpen, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsGridProps {
  total: number;
  sources: number;
  reports: number;
  className?: string;
}

export function StatsGrid({ total, sources, reports, className }: StatsGridProps) {
  const stats = [
    { label: 'Total Researches', value: total, icon: Database, color: 'text-blue-400' },
    { label: 'Sources Analyzed', value: sources, icon: BookOpen, color: 'text-purple-400' },
    { label: 'Reports Generated', value: reports, icon: FileText, color: 'text-green-400' },
  ];

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', className)}>
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-border transition-colors">
          <CardContent className="p-6 text-center">
            <stat.icon className={cn('h-8 w-8 mx-auto mb-3', stat.color)} />
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
