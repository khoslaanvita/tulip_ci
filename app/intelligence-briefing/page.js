'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function IntelligenceBriefingPage() {
  const [briefings, setBriefings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBriefings();
  }, []);

  async function loadBriefings() {
    try {
      const response = await fetch('/api/intelligence/briefings');
      const data = await response.json();
      setBriefings(data);
    } catch (error) {
      console.error('Error loading briefings:', error);
      toast.error('Failed to load intelligence briefings');
    } finally {
      setLoading(false);
    }
  }

  async function refreshBriefings() {
    setRefreshing(true);
    toast.info('Regenerating intelligence briefings...');
    await loadBriefings();
    setRefreshing(false);
    toast.success('Briefings updated');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading intelligence briefings...</p>
        </div>
      </div>
    );
  }

  const departments = [
    { key: 'executive', label: 'Executive', color: 'border-black' },
    { key: 'product', label: 'Product', color: 'border-blue-600' },
    { key: 'sales', label: 'Sales', color: 'border-green-600' },
    { key: 'marketing', label: 'Marketing', color: 'border-purple-600' },
    { key: 'customer-success', label: 'Customer Success', color: 'border-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-3">
                Intelligence Briefing
              </h1>
              <p className="text-lg text-gray-600">
                Department-specific competitive intelligence and action items
              </p>
            </div>
            <Button 
              onClick={refreshBriefings} 
              disabled={refreshing}
              variant="outline"
              className="border-gray-300"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Refreshing...
                </>
              ) : (
                'Refresh Briefings'
              )}
            </Button>
          </div>
        </div>

        {/* Department Briefings */}
        <div className="space-y-8">
          {departments.map(dept => {
            const briefing = briefings?.[dept.key];
            if (!briefing) return null;

            return (
              <Card key={dept.key} className={`border-l-4 ${dept.color}`}>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-2xl font-light">{dept.label}</CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    Competitive intelligence for the {dept.label.toLowerCase()} team
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Executive Summary */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Executive Summary</h3>
                    <p className="text-gray-700">{briefing.summary}</p>
                  </div>

                  {/* Key Insights */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Key Insights</h3>
                    <div className="space-y-2">
                      {briefing.keyInsights.map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-gray-900 flex-1">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Items */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Recommended Actions</h3>
                    <div className="space-y-3">
                      {briefing.actions.map((action, idx) => (
                        <Card key={idx} className="border border-gray-200">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{action.action}</h4>
                              <Badge 
                                variant={
                                  action.priority === 'high' ? 'destructive' : 
                                  action.priority === 'medium' ? 'default' : 
                                  'secondary'
                                }
                              >
                                {action.priority} priority
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{action.why}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Competitors to Watch */}
                  {briefing.competitorsToWatch && briefing.competitorsToWatch.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Competitors to Watch:</h3>
                      <div className="flex gap-2">
                        {briefing.competitorsToWatch.map((comp, idx) => (
                          <Badge key={idx} variant="outline" className="border-gray-300 text-gray-700">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Auto-update Notice */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Continuously Updating</p>
                <p className="text-sm text-blue-800 mt-1">
                  These briefings automatically update as new competitive signals are detected.
                  Click "Refresh Briefings" to regenerate with the latest intelligence.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* White space at bottom */}
        <div className="h-16"></div>
      </div>
    </div>
  );
}
