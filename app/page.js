'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, TrendingUp, AlertCircle, Bell, Zap, Bot, Factory, Users, ShieldCheck, Wrench, Cpu, BarChart3, Eye, Building2, Layers } from 'lucide-react';
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

function Dashboard() {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState(false);
  const [marketSummary, setMarketSummary] = useState(null);
  const [categorySummaries, setCategorySummaries] = useState({});
  const [loadingIntelligence, setLoadingIntelligence] = useState(true);

  useEffect(() => {
    loadCompetitors();
    loadIntelligence();
  }, []);

  async function loadIntelligence() {
    try {
      const [summaryRes, categoriesRes] = await Promise.all([
        fetch('/api/intelligence/market-summary'),
        fetch('/api/intelligence/categories')
      ]);
      
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setMarketSummary(summaryData);
      }
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategorySummaries(categoriesData);
      }
    } catch (error) {
      console.error('Error loading intelligence:', error);
    } finally {
      setLoadingIntelligence(false);
    }
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

        {/* Market Intelligence Summary Box */}
        {marketSummary && (
          <Card className="border-2 border-gray-900 mb-8">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-xl font-medium">Market Intelligence Summary</CardTitle>
              <CardDescription className="text-gray-600">Top 3 things happening this month</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                {marketSummary.top3Events.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
                      {idx + 1}
                    </div>
                    <p className="text-gray-900 flex-1">{event}</p>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1"><strong>Tulip's Position:</strong></p>
                <p className="text-gray-900">{marketSummary.tulipPositioning}</p>
              </div>

              {marketSummary.keyTrend && (
                <div className="mt-4 p-3 bg-gray-50 border-l-2 border-gray-900">
                  <p className="text-sm text-gray-900">
                    <strong className="uppercase text-[10px] tracking-widest text-gray-500 block mb-1">Key Trend</strong>
                    {marketSummary.keyTrend}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                return (
                  <TableRow key={competitor.id} className="border-b border-gray-100 hover:bg-gray-50/70 align-top">
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