'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Activity, Zap, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ActivityLogPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadActivities() {
    try {
      const response = await fetch('/api/activity-log');
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  }

  function getAgentIcon(agentType) {
    switch (agentType) {
      case 'Market Monitor':
        return <Activity className="h-5 w-5 text-blue-600" />;
      case 'Battlecard Update':
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <Zap className="h-5 w-5 text-purple-600" />;
    }
  }

  function getAgentColor(agentType) {
    switch (agentType) {
      case 'Market Monitor':
        return 'bg-blue-50 border-blue-200';
      case 'Battlecard Update':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-purple-50 border-purple-200';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading activity log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agent Activity Log</h1>
            <p className="text-muted-foreground">Real-time tracking of AI agent operations</p>
          </div>
        </div>
        <Button onClick={loadActivities} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">All-time agent actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => a.agentType === 'Market Monitor').length}
            </div>
            <p className="text-xs text-muted-foreground">Competitive signals detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Battlecards Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => a.agentType === 'Battlecard Update').length}
            </div>
            <p className="text-xs text-muted-foreground">Sales enablement updates</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            Chronological log of all agent operations and outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No agent activities yet</p>
              <p className="text-sm text-muted-foreground mt-2">Run the Market Monitor to see agent activities</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative">
                  {/* Timeline line */}
                  {index !== activities.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                  )}
                  
                  <div className={`flex gap-4 p-4 rounded-lg border ${getAgentColor(activity.agentType)}`}>
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center">
                        {getAgentIcon(activity.agentType)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{activity.agentType}</Badge>
                            <Badge variant="secondary">{activity.action}</Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      </div>
                      
                      {activity.result && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Result:</p>
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                            {JSON.stringify(activity.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold mb-1">About Agent Operations</p>
              <p className="text-sm text-muted-foreground">
                The Tulip Competitive Intelligence Command Center uses two AI agents:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                <li>• <span className="font-medium">Market Monitor Agent</span> - Continuously scans for competitive signals, analyzes their significance, and assigns severity scores</li>
                <li>• <span className="font-medium">Battlecard Update Agent</span> - Automatically generates and updates sales battlecards based on competitive intelligence</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                All agent activities are logged here in real-time with detailed results and timestamps.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}