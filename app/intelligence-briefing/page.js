'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Sparkles, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const departments = [
  { key: 'executive',         label: 'Executive',        accent: 'border-l-black' },
  { key: 'product',           label: 'Product',          accent: 'border-l-gray-900' },
  { key: 'sales',             label: 'Sales',            accent: 'border-l-gray-700' },
  { key: 'marketing',         label: 'Marketing',        accent: 'border-l-gray-500' },
  { key: 'customer-success',  label: 'Customer Success', accent: 'border-l-emerald-700' },
];

function formatRelative(iso) {
  if (!iso) return { rel: '—', abs: '—' };
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  let rel = 'just now';
  if (diffMin >= 60 * 24) rel = `${Math.floor(diffMin / (60 * 24))}d ago`;
  else if (diffMin >= 60) rel = `${Math.floor(diffMin / 60)}h ago`;
  else if (diffMin >= 1) rel = `${diffMin}m ago`;
  const abs = d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return { rel, abs };
}

const priorityTone = (p) => {
  const t = (p || '').toLowerCase();
  if (t === 'high')   return 'bg-red-50 text-red-700 border-red-200';
  if (t === 'medium') return 'bg-amber-50 text-amber-800 border-amber-200';
  return                  'bg-gray-50 text-gray-700 border-gray-300';
};

export default function IntelligenceBriefingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadBriefings(); }, []);

  async function loadBriefings(force = false) {
    try {
      const r = await fetch(force ? '/api/intelligence/briefings?force=1' : '/api/intelligence/briefings');
      const d = await r.json();
      setData(d);
    } catch (e) {
      toast.error('Failed to load briefings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function refreshBriefings() {
    setRefreshing(true);
    toast.info('Regenerating briefings…');
    await loadBriefings(true);
    toast.success('Briefings updated');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500 uppercase tracking-widest">Loading intelligence briefings…</p>
        </div>
      </div>
    );
  }

  // The API returns either the new shape {generatedAt, departments, aiEnabledCount, ...} or legacy flat keys
  const briefings = data?.departments || data;
  const generatedAt = data?.generatedAt;
  const aiEnabledCount = data?.aiEnabledCount;
  const t = formatRelative(generatedAt);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Header */}
        <Link href="/">
          <Button variant="ghost" className="mb-4 -ml-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1 w-8 bg-emerald-600"></div>
            <span className="text-[11px] uppercase tracking-widest text-emerald-700 font-semibold">Department Briefings</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-2">Intelligence Briefing</h1>
              <p className="text-base text-gray-500">Role-specific competitive intelligence with prioritized action items</p>
            </div>
            <Button onClick={refreshBriefings} disabled={refreshing} variant="outline" className="border-gray-300">
              {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {refreshing ? 'Regenerating…' : 'Refresh Now'}
            </Button>
          </div>
        </div>

        {/* Meta strip — Last refreshed */}
        {generatedAt && (
          <div className="grid md:grid-cols-3 gap-0 border border-gray-900 divide-x divide-gray-900 mb-10">
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Last Refreshed</div>
              <div className="flex items-baseline gap-2">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-lg font-light text-gray-900">{t.rel}</span>
              </div>
              <div className="text-[11px] text-gray-500 font-mono mt-0.5">{t.abs}</div>
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Departments</div>
              <div className="text-lg font-light text-gray-900">{Object.keys(briefings || {}).length}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">briefings generated</div>
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">AI Refreshed</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-light text-gray-900">{aiEnabledCount ?? '—'}</span>
                {aiEnabledCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">via GPT-4o-mini</div>
            </div>
          </div>
        )}

        {/* Department Briefings */}
        <div className="space-y-6">
          {departments.map(dept => {
            const briefing = briefings?.[dept.key];
            if (!briefing) return null;
            return (
              <Card key={dept.key} className={`border border-gray-200 border-l-4 ${dept.accent} rounded-none`}>
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="text-2xl font-light text-gray-900">{dept.label}</CardTitle>
                      <CardDescription className="text-gray-500 mt-1">
                        Competitive intelligence for the {dept.label.toLowerCase()} team
                      </CardDescription>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border ${
                      briefing.aiEnabled
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-gray-50 text-gray-600 border-gray-300'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${briefing.aiEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      {briefing.aiEnabled ? 'AI-refreshed' : 'Data-driven'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Executive Summary */}
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Executive Summary</h3>
                    <p className="text-gray-900 leading-relaxed">{briefing.summary}</p>
                  </div>

                  {/* Key Insights */}
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-3">Key Insights</h3>
                    <div className="space-y-2">
                      {(briefing.keyInsights || []).map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 border-l-2 border-gray-900">
                          <div className="flex-shrink-0 w-5 h-5 bg-black text-white flex items-center justify-center text-[11px] font-medium">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-gray-900 flex-1 leading-snug">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-3">Recommended Actions</h3>
                    <div className="space-y-3">
                      {(briefing.actions || []).map((action, idx) => (
                        <div key={idx} className="border border-gray-200 p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-medium text-gray-900 leading-snug flex-1">{action.action}</h4>
                            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border ${priorityTone(action.priority)}`}>
                              {action.priority || 'medium'}
                            </span>
                          </div>
                          {action.why && <p className="text-sm text-gray-600 leading-relaxed">{action.why}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Competitors to Watch */}
                  {briefing.competitorsToWatch?.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Competitors to Watch</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {briefing.competitorsToWatch.map((comp, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 text-xs border border-gray-300 text-gray-800 bg-white">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer note — B&W */}
        <Card className="mt-8 border border-gray-200 rounded-none">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Continuously Updating</p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Briefings cache for 2 hours, then refresh from the latest signals. Click <strong>Refresh Now</strong> to force regenerate. When AI is rate-limited, briefings fall back to data-driven content pulled directly from your signal feed — no placeholder text.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-16"></div>
      </div>
    </div>
  );
}
