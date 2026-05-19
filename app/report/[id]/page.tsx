'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, Download, Share2, ExternalLink, Star, Shield, 
  TrendingUp, AlertTriangle, Copy, Check 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ResearchReport } from '@/lib/types';

export default function ReportPage() {
  const params = useParams();
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch(`/api/research/${params.id}/report`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error('Failed to fetch report', e);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadMarkdown() {
    if (!report) return;
    
    let md = `# Research Report: ${report.question}\n\n`;
    md += `## Executive Summary\n${report.executiveSummary}\n\n`;
    md += `## Key Findings\n\n`;
    report.findings.forEach((finding, i) => {
      md += `### ${i + 1}. ${finding.title}\n`;
      md += `${finding.description}\n`;
      md += `*Confidence: ${Math.round(finding.confidence * 100)}%*\n\n`;
    });
    md += `## Sources\n\n`;
    report.sources.forEach((source, i) => {
      md += `[${i + 1}] ${source.title} - ${source.url}\n`;
      md += `Reliability: ${Math.round(source.reliability * 100)}%\n\n`;
    });
    md += `\n---\nOverall Confidence: ${Math.round(report.overallConfidence * 100)}%\n`;
    md += `Generated: ${new Date(report.generatedAt).toLocaleString()}\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-report-${params.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <ReportSkeleton />;
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Report not found or still generating...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-6 w-6 text-blue-400" />
            <Badge variant="info">Research Report</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">{report.question}</h1>
          <p className="text-sm text-muted-foreground">
            Generated on {new Date(report.generatedAt).toLocaleDateString()} at{' '}
            {new Date(report.generatedAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? 'Copied!' : 'Share'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadMarkdown}>
            <Download className="h-4 w-4 mr-1" />
            Markdown
          </Button>
        </div>
      </div>

      {/* Confidence Meter */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Overall Confidence</p>
                <p className="text-3xl font-bold text-green-400">
                  {Math.round(report.overallConfidence * 100)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Sources Analyzed</p>
              <p className="text-3xl font-bold">{report.sources.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Key Findings</p>
              <p className="text-3xl font-bold">{report.findings.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{report.executiveSummary}</p>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-400" />
          Key Findings
        </h2>
        <div className="space-y-4">
          {report.findings.map((finding, index) => (
            <Card key={finding.id} className="glass-card hover:border-blue-500/30 transition-all">
              <CardContent className="p-5">
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
                <p className="text-muted-foreground leading-relaxed">{finding.description}</p>
                {finding.citations.length > 0 && (
                  <div className="flex items-center gap-1 mt-3">
                    <span className="text-xs text-muted-foreground mr-1">Citations:</span>
                    {finding.citations.map((cite) => (
                      <Badge key={cite} variant="outline" className="text-xs px-1.5 py-0">
                        [{cite}]
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ExternalLink className="h-6 w-6 text-purple-400" />
          Sources
        </h2>
        <div className="space-y-3">
          {report.sources.map((source, index) => (
            <Card key={source.id} className="glass-card hover:border-purple-500/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 font-mono text-lg font-bold">[{index + 1}]</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-blue-400 transition-colors flex items-center gap-1"
                      >
                        {source.title}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                      <Badge
                        variant={source.reliability >= 0.9 ? 'success' : source.reliability >= 0.8 ? 'info' : 'warning'}
                        className="flex-shrink-0"
                      >
                        {Math.round(source.reliability * 100)}% reliable
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{source.snippet}</p>
                    <p className="text-xs text-muted-foreground/50 mt-1 truncate">{source.url}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-muted-foreground">
        <p>This report was generated by AI Research Agent</p>
        <p className="mt-1">Always verify critical information from primary sources</p>
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-3">
        <div className="h-6 w-32 bg-secondary rounded animate-pulse" />
        <div className="h-8 w-96 bg-secondary rounded animate-pulse" />
      </div>
      <div className="h-24 bg-secondary rounded-xl animate-pulse" />
      <div className="h-32 bg-secondary rounded-xl animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 bg-secondary rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
