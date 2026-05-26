'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, AlertTriangle, DollarSign, Sparkles, Rss, ExternalLink, Users, TrendingDown } from 'lucide-react';
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
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards - Enhanced */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Annual Revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{competitor.revenue}</p>
                {competitor.id === 'poka' && (
                  <p className="text-xs text-muted-foreground mt-2">Source: GetLatka (Jan 2025)</p>
                )}
                {competitor.id === 'apprentice' && (
                  <p className="text-xs text-muted-foreground mt-2">+54% YoY growth</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Total Funding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{competitor.funding}</p>
                {competitor.valuation && competitor.valuation !== 'N/A' && (
                  <p className="text-xs text-muted-foreground mt-2">Valuation: {competitor.valuation}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Total Employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{competitor.employees}</p>
                <p className="text-xs text-muted-foreground mt-2">Last updated: LinkedIn</p>
              </CardContent>
            </Card>
          </div>

          {/* Company Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Headquarters</p>
                  <p className="font-semibold">{competitor.headquarters}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Founded</p>
                  <p className="font-semibold">{competitor.founded}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="font-semibold">{competitor.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employee Growth Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Employee Growth Tracking
              </CardTitle>
              <CardDescription>LinkedIn-based headcount monitoring (simulated historical data)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current employee count with trend */}
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Employees</p>
                    <p className="text-3xl font-bold text-purple-600">{competitor.employees}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">30-day change</p>
                    <p className="text-xl font-semibold flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      +{Math.floor(Math.random() * 8) + 2}%
                    </p>
                  </div>
                </div>

                {/* Historical timeline */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Growth Timeline (Last 12 Months)</p>
                  <div className="space-y-2">
                    {[
                      { month: 'May 2025', count: competitor.employees, change: '+2.4%' },
                      { month: 'Apr 2025', count: Math.floor(competitor.employees * 0.976), change: '+1.8%' },
                      { month: 'Mar 2025', count: Math.floor(competitor.employees * 0.959), change: '+3.2%' },
                      { month: 'Feb 2025', count: Math.floor(competitor.employees * 0.929), change: '+1.5%' },
                      { month: 'Jan 2025', count: Math.floor(competitor.employees * 0.915), change: '+2.1%' },
                      { month: 'Dec 2024', count: Math.floor(competitor.employees * 0.896), change: '+0.9%' }
                    ].map((data, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                        <span className="text-sm text-muted-foreground w-24">{data.month}</span>
                        <div className="flex-1 mx-4">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full" 
                              style={{width: `${(data.count / competitor.employees) * 100}%`}}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium w-16 text-right">{data.count}</span>
                        <span className="text-xs text-green-600 font-medium w-16 text-right">{data.change}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Insight:</strong> Steady hiring growth indicates expansion. Monitor for rapid spikes (&gt;15% in 30 days) which may signal new product launches or market expansion.
                  </p>
                </div>
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
            <Card className="border-t-4 border-t-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Pricing Intelligence
                </CardTitle>
                <CardDescription>Latest pricing information and strategy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Pricing Model</p>
                  <p className="text-sm">{competitor.pricingNotes}</p>
                </div>
                {competitor.id === 'poka' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-xs text-amber-900">
                      <strong>Competitive Note:</strong> Pricing typically per-user/month. Enterprise deals negotiated separately.
                    </p>
                  </div>
                )}
                {competitor.id === 'apprentice' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-xs text-amber-900">
                      <strong>Competitive Note:</strong> Premium pricing in pharma vertical. Validated systems command higher prices.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  AI Capabilities & Claims
                </CardTitle>
                <CardDescription>How they position their AI features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{competitor.aiClaims}</p>
                {competitor.id === 'poka' && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                    <p className="text-xs text-purple-900">
                      <strong>Tulip Advantage:</strong> Tulip's AI Composer + Agents go beyond knowledge management to full process automation.
                    </p>
                  </div>
                )}
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

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rss className="h-5 w-5" />
                Monitored Data Sources
              </CardTitle>
              <CardDescription>
                RSS feeds, news sources, and data streams we monitor for {competitor.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* RSS Feeds */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Rss className="h-4 w-4 text-orange-600" />
                    RSS & News Feeds
                  </h3>
                  <div className="space-y-3">
                    {competitor.id === 'tulip' && (
                      <>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">Tulip Press Releases</p>
                              <p className="text-sm text-muted-foreground mt-1">Official Tulip press releases and announcements</p>
                              <Badge variant="outline" className="mt-2 text-xs">HTML Scraping</Badge>
                            </div>
                            <a href="https://tulip.co/press/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">Tulip Blog</p>
                              <p className="text-sm text-muted-foreground mt-1">Product updates and thought leadership</p>
                              <Badge variant="outline" className="mt-2 text-xs">HTML Scraping</Badge>
                            </div>
                            <a href="https://tulip.co/blog/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">Assembly Magazine RSS</p>
                              <p className="text-sm text-muted-foreground mt-1">Industry news mentioning Tulip (Keywords: Tulip, Tulip Interfaces)</p>
                              <Badge variant="outline" className="mt-2 text-xs bg-green-100">RSS Feed</Badge>
                            </div>
                            <a href="https://www.assemblymag.com/rss" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                    {competitor.id === 'critical-manufacturing' && (
                      <>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">Critical Manufacturing Blog RSS</p>
                              <p className="text-sm text-muted-foreground mt-1">Official blog with product updates and insights</p>
                              <Badge variant="outline" className="mt-2 text-xs bg-green-100">RSS Feed</Badge>
                            </div>
                            <a href="https://www.criticalmanufacturing.com/blog/feed/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">Critical Manufacturing News</p>
                              <p className="text-sm text-muted-foreground mt-1">Company news and press releases</p>
                              <Badge variant="outline" className="mt-2 text-xs">HTML Scraping</Badge>
                            </div>
                            <a href="https://www.criticalmanufacturing.com/all-news/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                    {competitor.id === 'poka' && (
                      <>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">Poka Blog RSS</p>
                              <p className="text-sm text-muted-foreground mt-1">Official blog with product updates and customer stories</p>
                              <Badge variant="outline" className="mt-2 text-xs bg-green-100">RSS Feed</Badge>
                            </div>
                            <a href="https://www.poka.io/en/blog/rss.xml" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">IFS News (Poka Parent)</p>
                              <p className="text-sm text-muted-foreground mt-1">IFS news mentioning Poka (Keywords: Poka)</p>
                              <Badge variant="outline" className="mt-2 text-xs">HTML Scraping</Badge>
                            </div>
                            <a href="https://www.ifs.com/news/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                    {competitor.id === 'parsable' && (
                      <>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">Parsable Blog</p>
                              <p className="text-sm text-muted-foreground mt-1">Company blog and thought leadership</p>
                              <Badge variant="outline" className="mt-2 text-xs">HTML Scraping</Badge>
                            </div>
                            <a href="https://parsable.com/parsable-blog/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">Food Industry Executive RSS</p>
                              <p className="text-sm text-muted-foreground mt-1">Industry news (Keywords: Parsable, CAI Software)</p>
                              <Badge variant="outline" className="mt-2 text-xs bg-green-100">RSS Feed</Badge>
                            </div>
                            <a href="https://www.foodindustryexecutive.com/rss" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                    {competitor.id === 'apprentice' && (
                      <>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">Apprentice.io Newsroom</p>
                              <p className="text-sm text-muted-foreground mt-1">Company news and press releases</p>
                              <Badge variant="outline" className="mt-2 text-xs">HTML Scraping</Badge>
                            </div>
                            <a href="https://www.apprentice.io/learn/newsroom" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">BioPharm International RSS</p>
                              <p className="text-sm text-muted-foreground mt-1">Pharma industry news (Keywords: Apprentice, manufacturing execution)</p>
                              <Badge variant="outline" className="mt-2 text-xs bg-green-100">RSS Feed</Badge>
                            </div>
                            <a href="https://www.biopharminternational.com/rss" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                    {competitor.id === 'siemens-xcelerator' && (
                      <>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">Siemens Press RSS</p>
                              <p className="text-sm text-muted-foreground mt-1">Official Siemens press releases (Keywords: Xcelerator, MindSphere, Industrial AI, Copilot)</p>
                              <Badge variant="outline" className="mt-2 text-xs bg-green-100">RSS Feed</Badge>
                            </div>
                            <a href="https://press.siemens.com/global/en/rss-feed" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">Siemens Industrial AI</p>
                              <p className="text-sm text-muted-foreground mt-1">Industrial AI announcements</p>
                              <Badge variant="outline" className="mt-2 text-xs">HTML Scraping</Badge>
                            </div>
                            <a href="https://www.siemens.com/en-us/company/artificial-intelligence/industrial-ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Additional Data Sources */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Business Metrics & Data Providers
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <p className="font-medium text-sm">Revenue Tracking</p>
                      <p className="text-xs text-muted-foreground mt-1">GetLatka, Growjo, ZoomInfo</p>
                      <Badge variant="outline" className="mt-2 text-xs">Quarterly Updates</Badge>
                    </div>
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <p className="font-medium text-sm flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Employee Tracking
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">LinkedIn Company Pages</p>
                      <Badge variant="outline" className="mt-2 text-xs">Daily Snapshots</Badge>
                    </div>
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <p className="font-medium text-sm">Funding & Valuation</p>
                      <p className="text-xs text-muted-foreground mt-1">Crunchbase, PitchBook</p>
                      <Badge variant="outline" className="mt-2 text-xs">Event-based</Badge>
                    </div>
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <p className="font-medium text-sm">Analyst Reports</p>
                      <p className="text-xs text-muted-foreground mt-1">Gartner, Forrester</p>
                      <Badge variant="outline" className="mt-2 text-xs">Quarterly/Annual</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Industry-Wide Sources */}
                <div>
                  <h3 className="font-semibold mb-3">Industry-Wide News Sources</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    We also monitor general manufacturing and tech news sources that may mention {competitor.name}:
                  </p>
                  <div className="grid md:grid-cols-2 gap-2">
                    <div className="text-sm p-2 border rounded bg-muted/20">
                      <span className="font-medium">TechCrunch Manufacturing</span>
                      <Badge variant="outline" className="ml-2 text-xs bg-green-100">RSS</Badge>
                    </div>
                    <div className="text-sm p-2 border rounded bg-muted/20">
                      <span className="font-medium">VentureBeat Manufacturing</span>
                      <Badge variant="outline" className="ml-2 text-xs bg-green-100">RSS</Badge>
                    </div>
                    <div className="text-sm p-2 border rounded bg-muted/20">
                      <span className="font-medium">Assembly Magazine</span>
                      <Badge variant="outline" className="ml-2 text-xs bg-green-100">RSS</Badge>
                    </div>
                    <div className="text-sm p-2 border rounded bg-muted/20">
                      <span className="font-medium">Manufacturing.net</span>
                      <Badge variant="outline" className="ml-2 text-xs bg-green-100">RSS</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Note */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">About Data Sources & Quality</p>
                  <p className="text-sm text-blue-800 mt-1">
                    All sources are monitored automatically via RSS feeds or scheduled scraping. Data confidence levels are assigned based on source type.
                    <Link href="/methodology" className="underline ml-1 font-medium">
                      View data quality methodology →
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}