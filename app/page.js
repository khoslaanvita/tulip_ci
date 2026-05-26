'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, TrendingUp, AlertCircle, Bell, Zap } from 'lucide-react';
import { toast } from 'sonner';

function Dashboard() {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState(false);

  useEffect(() => {
    loadCompetitors();
  }, []);

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
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                Live Monitoring
              </span>
              <span>Auto-refresh: 15 min</span>
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
              <TableRow className="border-b border-gray-100">
                <TableHead className="font-medium text-gray-900">Company</TableHead>
                <TableHead className="font-medium text-gray-900">Category</TableHead>
                <TableHead className="font-medium text-gray-900">Latest Signal</TableHead>
                <TableHead className="font-medium text-gray-900">Type</TableHead>
                <TableHead className="font-medium text-gray-900">Severity</TableHead>
                <TableHead className="font-medium text-gray-900">Updated</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((competitor) => (
                <TableRow key={competitor.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {competitor.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-gray-300 text-gray-700">
                      {competitor.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm text-gray-600">
                      {competitor.latestSignal?.title || <span className="italic text-gray-400">No signals</span>}
                    </p>
                  </TableCell>
                  <TableCell>
                    {competitor.latestSignal && (
                      <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-700">
                        {competitor.latestSignal.type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {competitor.latestSignal && (
                      <Badge variant={getSeverityColor(competitor.latestSignal.severity)} className="font-normal">
                        {competitor.latestSignal.severity}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {competitor.latestSignal 
                      ? new Date(competitor.latestSignal.timestamp).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Link href={`/competitors/${competitor.id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-900">
                        View →
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
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