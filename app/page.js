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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with gradient */}
        <div className="flex items-center justify-between p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl text-white">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">🎯 Tulip Competitive Intelligence</h1>
            <p className="mt-2 text-blue-100 text-lg">Command Center for Market Monitoring</p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <Activity className="h-4 w-4" />
                Live Monitoring Active
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <Zap className="h-4 w-4" />
                Auto-refresh every 15 min
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/tulip-command-center">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg w-full">
                <span className="mr-2">👑</span>
                Tulip Command Center
              </Button>
            </Link>
            <Button 
              onClick={runMarketMonitor} 
              disabled={runningAgent} 
              size="lg" 
              variant="secondary"
              className="shadow-lg"
            >
              {runningAgent ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Running...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Market Monitor
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards - Enhanced */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Competitors</CardTitle>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{competitors.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Tracked continuously via RSS & APIs</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Signals</CardTitle>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {competitors.filter(c => c.latestSignal).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">New activity in the last 7 days</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority Alerts</CardTitle>
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {competitors.filter(c => c.latestSignal?.severity === 'high').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Require immediate action</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Enhanced */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Navigate to key features and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Link href="/tulip-command-center" className="group">
                <div className="p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all cursor-pointer text-center">
                  <span className="text-3xl mb-2 block">👑</span>
                  <p className="text-sm font-medium">Command Center</p>
                </div>
              </Link>
              <Link href="/signals" className="group">
                <div className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Signal Feed</p>
                </div>
              </Link>
              <Link href="/battlecard" className="group">
                <div className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Battlecards</p>
                </div>
              </Link>
              <Link href="/methodology" className="group">
                <div className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer text-center">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">Methodology</p>
                </div>
              </Link>
              <Link href="/activity" className="group">
                <div className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer text-center">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-sm font-medium">Activity Log</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

      {/* Competitors Table - Enhanced */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
          <CardTitle className="text-2xl">Competitor Overview</CardTitle>
          <CardDescription>
            Click on a competitor to view their full profile, recent signals, and battlecards
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Competitor</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Latest Signal</TableHead>
                <TableHead className="font-semibold">Signal Type</TableHead>
                <TableHead className="font-semibold">Severity</TableHead>
                <TableHead className="font-semibold">Last Updated</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((competitor) => (
                <TableRow key={competitor.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      {competitor.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">{competitor.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm">
                      {competitor.latestSignal?.title || <span className="text-muted-foreground italic">No signals yet</span>}
                    </p>
                  </TableCell>
                  <TableCell>
                    {competitor.latestSignal && (
                      <Badge variant="secondary" className="font-medium">
                        {competitor.latestSignal.type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {competitor.latestSignal && (
                      <Badge variant={getSeverityColor(competitor.latestSignal.severity)} className="font-medium">
                        {competitor.latestSignal.severity}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {competitor.latestSignal 
                      ? new Date(competitor.latestSignal.timestamp).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Link href={`/competitors/${competitor.id}`}>
                      <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                        View Profile →
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default function App() {
  return <Dashboard />;
}