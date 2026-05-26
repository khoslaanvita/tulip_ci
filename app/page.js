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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Tulip Competitive Intelligence</h1>
          <p className="text-muted-foreground mt-2">Command Center for Market Monitoring</p>
        </div>
        <div className="flex gap-3">
          <Link href="/tulip-command-center">
            <Button size="lg" variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <span className="mr-2">👑</span>
              Tulip Command Center
            </Button>
          </Link>
          <Button onClick={runMarketMonitor} disabled={runningAgent} size="lg" variant="outline">
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Competitors</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitors.length}</div>
            <p className="text-xs text-muted-foreground">Tracked continuously</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Signals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {competitors.filter(c => c.latestSignal).length}
            </div>
            <p className="text-xs text-muted-foreground">In the last 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {competitors.filter(c => c.latestSignal?.severity === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/tulip-command-center">
          <Button variant="default" className="bg-yellow-500 hover:bg-yellow-600">
            <span className="mr-2">👑</span>
            Tulip Command Center
          </Button>
        </Link>
        <Link href="/signals">
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            View Signal Feed
          </Button>
        </Link>
        <Link href="/battlecard">
          <Button variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" />
            Generate Battlecard
          </Button>
        </Link>
        <Link href="/methodology">
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Methodology & Docs
          </Button>
        </Link>
        <Link href="/activity">
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Agent Activity Log
          </Button>
        </Link>
      </div>

      {/* Competitors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Competitor Overview</CardTitle>
          <CardDescription>
            Click on a competitor to view their full profile and recent signals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competitor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Latest Signal</TableHead>
                <TableHead>Signal Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((competitor) => (
                <TableRow key={competitor.id}>
                  <TableCell className="font-medium">{competitor.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{competitor.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {competitor.latestSignal?.title || 'No signals yet'}
                  </TableCell>
                  <TableCell>
                    {competitor.latestSignal && (
                      <Badge variant="secondary">
                        {competitor.latestSignal.type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {competitor.latestSignal && (
                      <Badge variant={getSeverityColor(competitor.latestSignal.severity)}>
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
                      <Button variant="ghost" size="sm">View Details</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  return <Dashboard />;
}