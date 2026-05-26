'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, AlertTriangle, DollarSign, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CompetitorProfilePage() {
  const params = useParams();
  const competitorId = params.id;
  
  const [competitor, setCompetitor] = useState(null);
  const [battlecard, setBattlecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingBattlecard, setGeneratingBattlecard] = useState(false);

  useEffect(() => {
    if (competitorId) {
      loadCompetitorData();
    }
  }, [competitorId]);

  async function loadCompetitorData() {
    try {
      const [compRes, battlecardRes] = await Promise.all([
        fetch(`/api/competitors/${competitorId}`),
        fetch(`/api/battlecards/${competitorId}`).catch(() => ({ ok: false }))
      ]);
      
      const compData = await compRes.json();
      setCompetitor(compData);
      
      if (battlecardRes.ok) {
        const battlecardData = await battlecardRes.json();
        setBattlecard(battlecardData);
      }
    } catch (error) {
      console.error('Error loading competitor:', error);
      toast.error('Failed to load competitor data');
    } finally {
      setLoading(false);
    }
  }

  async function generateBattlecard() {
    setGeneratingBattlecard(true);
    toast.info('Generating battlecard with AI...');
    
    try {
      const response = await fetch('/api/battlecards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Battlecard generated successfully!');
        setBattlecard(data.battlecard);
      } else {
        toast.error('Failed to generate battlecard');
      }
    } catch (error) {
      console.error('Error generating battlecard:', error);
      toast.error('Failed to generate battlecard');
    } finally {
      setGeneratingBattlecard(false);
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
          <p className="mt-4 text-muted-foreground">Loading competitor profile...</p>
        </div>
      </div>
    );
  }

  if (!competitor) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Competitor not found</p>
            <Link href="/">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{competitor.name}</h1>
              <Badge variant="outline" className="text-sm">{competitor.category}</Badge>
              {competitor.id === 'tulip' && (
                <Badge variant="default">Reference Competitor</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span><strong>Revenue:</strong> <span className="text-green-600 font-semibold">{competitor.revenue}</span></span>
              <span>•</span>
              <span><strong>Employees:</strong> {competitor.employees}</span>
              <span>•</span>
              <span><strong>HQ:</strong> {competitor.headquarters}</span>
              <span>•</span>
              <span><strong>Founded:</strong> {competitor.founded}</span>
            </div>
          </div>
        </div>
        
        <Button onClick={generateBattlecard} disabled={generatingBattlecard}>
          {generatingBattlecard ? 'Generating...' : battlecard ? 'Regenerate Battlecard' : 'Generate Battlecard'}
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="battlecard">Battlecard</TabsTrigger>
          <TabsTrigger value="signals">Recent Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Annual Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{competitor.revenue}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Funding</p>
                  <p className="text-2xl font-bold text-blue-600">{competitor.funding}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Employees</p>
                  <p className="text-2xl font-bold">{competitor.employees}</p>
                </div>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Headquarters:</span>
                  <span className="ml-2 font-medium">{competitor.headquarters}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Founded:</span>
                  <span className="ml-2 font-medium">{competitor.founded}</span>
                </div>
                {competitor.valuation && competitor.valuation !== 'N/A' && (
                  <div>
                    <span className="text-muted-foreground">Valuation:</span>
                    <span className="ml-2 font-medium">{competitor.valuation}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent News */}
          {competitor.recentNews && competitor.recentNews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent News & Updates</CardTitle>
                <CardDescription>Latest developments from {competitor.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {competitor.recentNews.map((news, idx) => (
                    <li key={idx} className="flex items-start gap-2 pb-3 border-b last:border-0 last:pb-0">
                      <span className="text-primary mt-1">📰</span>
                      <span className="text-sm text-muted-foreground">{news}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Positioning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Positioning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{competitor.positioning}</p>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {competitor.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-sm text-muted-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Weaknesses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {competitor.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span className="text-sm text-muted-foreground">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Pricing & AI Claims */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{competitor.pricingNotes}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Claims
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{competitor.aiClaims}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="battlecard" className="space-y-6">
          {!battlecard ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No battlecard generated yet</p>
                <Button onClick={generateBattlecard} disabled={generatingBattlecard}>
                  {generatingBattlecard ? 'Generating...' : 'Generate Battlecard'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>When They Appear</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{battlecard.whenTheyAppear}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Their Positioning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{battlecard.theirPositioning}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Where Tulip Wins</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{battlecard.whereTulipWins}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Likely Objections & Sales Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Likely Objections:</h4>
                    <ul className="space-y-1">
                      {battlecard.likelyObjections.map((objection, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span className="text-sm text-muted-foreground">{objection}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Sales Response:</h4>
                    <p className="text-sm text-muted-foreground">{battlecard.salesResponse}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Discovery Questions</CardTitle>
                  <CardDescription>Ask these questions to position Tulip favorably</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {battlecard.discoveryQuestions.map((question, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-semibold text-primary">{idx + 1}.</span>
                        <span className="text-sm text-muted-foreground">{question}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Implications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{battlecard.productImplications}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Marketing Implications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{battlecard.marketingImplications}</p>
                  </CardContent>
                </Card>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Last updated: {new Date(battlecard.lastUpdated).toLocaleString()}
              </p>
            </>
          )}
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          {!competitor.recentSignals || competitor.recentSignals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No recent signals for this competitor</p>
              </CardContent>
            </Card>
          ) : (
            competitor.recentSignals.map(signal => (
              <Card key={signal.id}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getSeverityColor(signal.severity)}>{signal.severity}</Badge>
                    <Badge variant="outline">{signal.signalType}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(signal.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{signal.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{signal.summary}</p>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Why It Matters:</h4>
                    <p className="text-sm text-muted-foreground">{signal.whyItMatters}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Recommended Action:</h4>
                    <p className="text-sm text-muted-foreground">{signal.recommendedAction}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}