'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, TrendingUp, AlertCircle, Bell, Zap, Bot, Factory, Users, ShieldCheck, Wrench, Cpu, BarChart3, Eye, Building2, Layers, Target, ArrowRight, Flame, Shield } from 'lucide-react';
import { toast } from 'sonner';

// Group categories into broader buckets and assign B&W visual identity
function getCategoryGroup(category) {
  const c = (category || '').toLowerCase();
  if (c.includes('vision') || c.includes('ai quality')) return 'ai_vision';
  if (c.includes('mes') || c.includes('erp')) return 'mes_erp';
  if (c.includes('connected worker') || c.includes('frontline') || c.includes('workforce') || c.includes('mobile form')) return 'connected_worker';
  if (c.includes('qms') || c.includes('quality') || c.includes('validation') || c.includes('plm')) return 'qms';
  if (c.includes('cmms') || c.includes('eam')) return 'cmms';
  if (c.includes('scada') || c.includes('ot') || c.includes('iiot') || c.includes('edge') || c.includes('industrial data') || c.includes('cloud iot')) return 'scada_ot';
  if (c.includes('analytics') || c.includes('intelligence') || c.includes('data ops') || c.includes('process')) return 'analytics';
  if (c.includes('low-code') || c.includes('platform')) return 'platform';
  return 'other';
}

const CATEGORY_STYLES = {
  mes_erp:          { label: 'MES / ERP',          icon: Factory,     badge: 'bg-black text-white border-black' },
  connected_worker: { label: 'Connected Worker',   icon: Users,       badge: 'bg-white text-black border-2 border-black' },
  qms:              { label: 'Quality / QMS',      icon: ShieldCheck, badge: 'bg-white text-black border border-dashed border-black' },
  cmms:             { label: 'CMMS / EAM',         icon: Wrench,      badge: 'bg-gray-200 text-gray-900 border border-gray-400' },
  scada_ot:         { label: 'SCADA / OT',         icon: Cpu,         badge: 'bg-gray-800 text-white border-gray-800' },
  analytics:        { label: 'Analytics',          icon: BarChart3,   badge: 'bg-gray-100 text-gray-900 border border-gray-300' },
  ai_vision:        { label: 'AI Vision',          icon: Eye,         badge: 'bg-white text-black border border-double border-black border-[3px]' },
  platform:         { label: 'Platform',           icon: Layers,      badge: 'bg-gray-900 text-white border-gray-900' },
  other:            { label: 'Other',              icon: Building2,   badge: 'bg-white text-gray-600 border border-gray-300' },
};

// Threat score → colored band classes (red / amber / slate / green accent).
function threatStyle(score) {
  const s = score ?? 0;
  if (s >= 70) return { label: 'Critical', dot: 'bg-red-600', pill: 'bg-red-50 text-red-700 border-red-200', barFill: 'bg-red-600' };
  if (s >= 50) return { label: 'High',     dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-800 border-amber-200', barFill: 'bg-amber-500' };
  if (s >= 30) return { label: 'Medium',   dot: 'bg-gray-500', pill: 'bg-gray-50 text-gray-700 border-gray-300', barFill: 'bg-gray-500' };
  return                  { label: 'Low',  dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-800 border-emerald-200', barFill: 'bg-emerald-500' };
}

function Dashboard() {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState(false);
  const [marketSummary, setMarketSummary] = useState(null);
  const [categorySummaries, setCategorySummaries] = useState({});
  const [strategicInsights, setStrategicInsights] = useState(null);
  const [categoryIntel, setCategoryIntel] = useState(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState(true);

  useEffect(() => {
    loadCompetitors();
    loadIntelligence();
  }, []);

  async function loadIntelligence() {
    const safeFetch = async (url, retries = 3) => {
      for (let i = 0; i <= retries; i++) {
        try {
          const r = await fetch(url);
          if (r.ok) return await r.json();
        } catch (e) {
          // swallow & retry
        }
        await new Promise(res => setTimeout(res, 600 + i * 400));
      }
      return null;
    };

    // Fire each independently — update state as each finishes so users see
    // progressive enrichment instead of waiting for the slowest endpoint.
    safeFetch('/api/intelligence/market-summary').then(d => d && setMarketSummary(d));
    safeFetch('/api/intelligence/strategic-insights').then(d => d && setStrategicInsights(d));
    safeFetch('/api/intelligence/category-intelligence').then(d => d && setCategoryIntel(d));
    setLoadingIntelligence(false);
  }

  async function loadCompetitors() {
    try {
      const response = await fetch('/api/competitors');
      const data = await response.json();
      setCompetitors(data);
    } catch (error) {
      console.error('Error loading competitors:', error);
      toast.error('Failed to load competitors');
    } finally {
      setLoading(false);
    }
  }

  async function runMarketMonitor() {
    setRunningAgent(true);
    toast.info('Market Monitor Agent starting...');
    
    try {
      const response = await fetch('/api/agents/run-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Market scan complete! Found ${data.results.length} new signals.`);
        loadCompetitors();
      } else {
        toast.error('Market monitor failed');
      }
    } catch (error) {
      console.error('Error running market monitor:', error);
      toast.error('Failed to run market monitor');
    } finally {
      setRunningAgent(false);
    }
  }

  function getSeverityColor(severity) {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Header - Clean and Minimal */}
        <div className="mb-12">
          <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-3">
            Tulip Competitive Intelligence
          </h1>
          <p className="text-lg text-gray-600">Real-time market monitoring and analysis</p>
          
          <div className="flex items-center gap-4 mt-6">
            <Link href="/tulip-command-center">
              <Button variant="default" className="bg-black hover:bg-gray-800 text-white">
                Tulip Command Center
              </Button>
            </Link>
            <Button 
              onClick={runMarketMonitor} 
              disabled={runningAgent} 
              variant="outline"
              className="border-gray-300"
            >
              {runningAgent ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Running...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Monitor
                </>
              )}
            </Button>
            <div className="ml-auto flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 bg-gray-900 rounded-full animate-pulse"></div>
                Live Monitoring
              </span>
              <span>Auto-refresh: Daily</span>
            </div>
          </div>
        </div>

        {/* Stats Cards - Clean B&W */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs uppercase tracking-wide text-gray-500">Active Competitors</CardDescription>
              <CardTitle className="text-4xl font-light">{competitors.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Tracked via RSS & APIs</p>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs uppercase tracking-wide text-gray-500">Recent Signals</CardDescription>
              <CardTitle className="text-4xl font-light">
                {competitors.filter(c => c.latestSignal).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Last 7 days</p>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs uppercase tracking-wide text-gray-500">High Priority</CardDescription>
              <CardTitle className="text-4xl font-light">
                {competitors.filter(c => c.latestSignal?.severity === 'high').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation - Minimal */}
        <div className="flex gap-3 mb-12 pb-12 border-b border-gray-200">
          <Link href="/signals">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Activity className="mr-2 h-4 w-4" />
              Signals
            </Button>
          </Link>
          <Link href="/battlecard">
            <Button variant="outline" size="sm" className="border-gray-300">
              <TrendingUp className="mr-2 h-4 w-4" />
              Battlecards
            </Button>
          </Link>
          <Link href="/methodology">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Bell className="mr-2 h-4 w-4" />
              Methodology
            </Button>
          </Link>
          <Link href="/agents">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Bot className="mr-2 h-4 w-4" />
              Agents
            </Button>
          </Link>
          <Link href="/activity">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Bell className="mr-2 h-4 w-4" />
              Activity Log
            </Button>
          </Link>
        </div>

        {/* Strategic Insights — Executive briefing of top-3 strategically threatening competitor moves with actions */}
        {strategicInsights && strategicInsights.insights?.length > 0 && (
          <div className="mb-12">
            <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1 w-8 bg-emerald-600"></div>
                  <span className="text-[11px] uppercase tracking-widest text-emerald-700 font-semibold">Strategic Insights</span>
                </div>
                <h2 className="text-3xl font-light text-gray-900 tracking-tight">Top 3 Moves to Make</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Strategic priorities derived from the {strategicInsights.totalTracked} tracked competitors · Posture: <span className="font-medium text-gray-900">{strategicInsights.posture}</span>
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 uppercase tracking-wider">High threat</span>
                  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-red-50 border border-red-200 text-red-700 font-medium rounded-sm">
                    {strategicInsights.highThreatCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 uppercase tracking-wider">Avg threat</span>
                  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-gray-50 border border-gray-300 text-gray-900 font-medium rounded-sm">
                    {strategicInsights.averageThreatScore}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {strategicInsights.insights.map((ins) => {
                const t = threatStyle(ins.threatScore);
                return (
                  <Card key={ins.competitorId} className="border border-gray-200 hover:border-gray-900 transition-colors flex flex-col">
                    {/* Top accent bar */}
                    <div className={`h-1 ${t.barFill}`}></div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 bg-black text-white text-xs font-medium">
                            {ins.rank}
                          </div>
                          <div>
                            <CardTitle className="text-base font-medium text-gray-900 leading-tight">
                              {ins.competitorName}
                            </CardTitle>
                            <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">{ins.category}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border ${t.pill}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`}></span>
                          {t.label} · {ins.threatScore}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1 flex flex-col">
                      <p className="text-sm font-medium text-gray-900 leading-snug mb-2">
                        {ins.headline}
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed mb-4 flex-1">
                        {ins.whyItMatters}
                      </p>

                      {/* Tulip advantage strip — accent green */}
                      <div className="border-l-2 border-emerald-600 pl-2 mb-4">
                        <div className="text-[9px] uppercase tracking-widest text-emerald-700 font-semibold mb-0.5">Tulip Advantage</div>
                        <p className="text-[11px] text-gray-800 leading-snug">{ins.tulipAdvantage}</p>
                      </div>

                      {/* Action box */}
                      <div className="bg-gray-900 text-white p-3 -mx-6 -mb-6 mt-auto">
                        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-gray-400 mb-1.5">
                          <Target className="h-3 w-3" />
                          Recommended Action
                        </div>
                        <p className="text-xs text-white leading-snug mb-2">{ins.action}</p>
                        <div className="flex items-center justify-between gap-2 text-[10px] text-gray-400 pt-2 border-t border-gray-700">
                          <span className="uppercase tracking-wider">{ins.actionOwner}</span>
                          <span className="uppercase tracking-wider">{ins.timeframe}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {!strategicInsights.aiEnabled && (
              <p className="mt-3 text-[10px] uppercase tracking-widest text-gray-400">
                Insights computed deterministically · AI refinement available when OpenAI quota is restored
              </p>
            )}
          </div>
        )}

        {/* Category Intelligence — per-category insights with Tulip takeaways */}
        {categoryIntel && categoryIntel.categories?.length > 0 && (
          <CategoryIntelligence data={categoryIntel} />
        )}

      {/* Competitors Table - Clean and Minimal */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-2xl font-light">Competitors</CardTitle>
          <CardDescription className="text-gray-600">
            Click to view full profile and intelligence
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50">
                <TableHead className="font-medium text-gray-900 uppercase text-xs tracking-wider">Threat</TableHead>
                <TableHead className="font-medium text-gray-900 uppercase text-xs tracking-wider">Company</TableHead>
                <TableHead className="font-medium text-gray-900 uppercase text-xs tracking-wider">Category</TableHead>
                <TableHead className="font-medium text-gray-900 uppercase text-xs tracking-wider">Industry Focus</TableHead>
                <TableHead className="font-medium text-gray-900 uppercase text-xs tracking-wider">Geography</TableHead>
                <TableHead className="font-medium text-gray-900 uppercase text-xs tracking-wider">Tulip Competitive Angle</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((competitor) => {
                const groupKey = getCategoryGroup(competitor.category);
                const groupStyle = CATEGORY_STYLES[groupKey];
                const CatIcon = groupStyle.icon;
                const industry = competitor.industry || competitor.verticalFocus || '-';
                const angle = competitor.tulipRelevance || competitor.tulipCompetitiveAngle || '-';
                const ts = threatStyle(competitor.threatScore);
                return (
                  <TableRow key={competitor.id} className="border-b border-gray-100 hover:bg-gray-50/70 align-top">
                    <TableCell className="py-4 w-[120px]">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-light text-gray-900 leading-none">{competitor.threatScore ?? 0}</span>
                          <span className="text-[10px] text-gray-400">/100</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider border w-fit ${ts.pill}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${ts.dot}`}></span>
                          {ts.label}
                        </span>
                        <div className="h-1 w-16 bg-gray-100 overflow-hidden rounded-sm">
                          <div className={`h-full ${ts.barFill}`} style={{ width: `${competitor.threatScore ?? 0}%` }}></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 py-4">
                      <Link href={`/competitors/${competitor.id}`} className="hover:underline">
                        {competitor.name}
                      </Link>
                      <div className="text-[11px] text-gray-400 mt-1 font-normal">{competitor.category}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-medium uppercase tracking-wider ${groupStyle.badge}`}>
                        <CatIcon className="h-3 w-3" />
                        {groupStyle.label}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 max-w-[240px]">
                      <div className="border-l-2 border-gray-900 pl-3">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-0.5">Vertical</div>
                        <div className="text-sm text-gray-900 leading-snug">{industry}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-700 max-w-[160px]">
                      {competitor.geography || competitor.strongGeography || '-'}
                    </TableCell>
                    <TableCell className="py-4 max-w-md text-sm text-gray-700 leading-snug">
                      {angle}
                    </TableCell>
                    <TableCell className="py-4">
                      <Link href={`/competitors/${competitor.id}`}>
                        <Button variant="ghost" size="sm" className="text-gray-900">
                          View →
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* White space at bottom */}
      <div className="h-24"></div>
      </div>
    </div>
  );
}

export default function App() {
  return <Dashboard />;
}

// Category Intelligence — shows insights per category bucket with Tulip takeaways
function CategoryIntelligence({ data }) {
  const [active, setActive] = useState(data.categories[0]?.key);
  const current = data.categories.find(c => c.key === active) || data.categories[0];

  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1 w-8 bg-emerald-600"></div>
            <span className="text-[11px] uppercase tracking-widest text-emerald-700 font-semibold">Category Intelligence</span>
          </div>
          <h2 className="text-3xl font-light text-gray-900 tracking-tight">What's Moving by Category</h2>
          <p className="text-sm text-gray-500 mt-1">
            {data.categories.length} categories · {data.aiEnabledCount} AI-refreshed · auto-updates hourly
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-gray-400">
          Last updated · {new Date(data.generatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Category tabs as buckets */}
      <div className="flex flex-wrap gap-2 mb-5">
        {data.categories.map(cat => {
          const isActive = cat.key === active;
          return (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={`group inline-flex items-center gap-2 px-3.5 py-2 border text-xs font-medium uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:text-gray-900'
              }`}
            >
              <span>{cat.title}</span>
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] ${
                isActive ? 'bg-white text-black' : 'bg-gray-100 text-gray-700 group-hover:bg-gray-900 group-hover:text-white'
              }`}>
                {cat.competitorCount}
              </span>
              {cat.aiEnriched && (
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active category content */}
      {current && (
        <Card className="border border-gray-900 rounded-none overflow-hidden">
          {/* Header */}
          <div className="bg-black text-white px-6 py-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-light">{current.title}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 border border-gray-600 px-2 py-0.5">
                    {current.competitorCount} competitors
                  </span>
                  {current.aiEnriched && (
                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 border border-emerald-700 px-2 py-0.5 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      AI refreshed
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">{current.summary}</p>
              </div>
            </div>
          </div>

          {/* Body: What's Happening + Tulip Takeaways */}
          <div className="grid lg:grid-cols-5 divide-x divide-gray-200">
            {/* Left: 3 columns of "What's Happening" */}
            <div className="lg:col-span-3 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">What's Happening</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <DimensionBlock label="Product" content={current.happening.product} />
                <DimensionBlock label="AI" content={current.happening.ai} accent />
                <DimensionBlock label="Sales / GTM" content={current.happening.sales} />
                <DimensionBlock label="Pricing" content={current.happening.pricing} />
              </div>

              {/* Competitor pills */}
              <div className="mt-6 pt-5 border-t border-gray-200">
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Competitors in this category</div>
                <div className="flex flex-wrap gap-1.5">
                  {current.competitors.slice(0, 12).map(c => {
                    const t = threatStyle(c.threatScore);
                    return (
                      <Link key={c.id} href={`/competitors/${c.id}`}>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-gray-200 hover:border-gray-900 text-xs text-gray-800 transition-colors">
                          <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`}></span>
                          {c.name}
                          <span className="text-gray-400 text-[10px]">·</span>
                          <span className="text-gray-500 text-[10px]">{c.threatScore}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Takeaways */}
            <div className="lg:col-span-2 p-6 bg-emerald-50/40">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-emerald-700" />
                <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-semibold">Tulip Takeaways</span>
                <div className="flex-1 h-px bg-emerald-200"></div>
              </div>
              <ol className="space-y-3">
                {current.takeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 bg-emerald-700 text-white text-[11px] font-medium flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-900 leading-snug">{t}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function DimensionBlock({ label, content, accent }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={`text-[10px] uppercase tracking-widest font-semibold ${accent ? 'text-emerald-700' : 'text-gray-500'}`}>
          {label}
        </span>
        {accent && <span className="h-1 w-1 rounded-full bg-emerald-600"></span>}
      </div>
      <p className="text-sm text-gray-800 leading-snug">{content}</p>
    </div>
  );
}