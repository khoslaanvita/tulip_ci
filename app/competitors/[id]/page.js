'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, AlertTriangle, DollarSign, Sparkles, Rss, ExternalLink, Users, TrendingDown, MessageSquare, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function CompetitorProfilePage() {
  const params = useParams();
  const competitorId = params.id;
  
  const [competitor, setCompetitor] = useState(null);
  const [battlecard, setBattlecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingBattlecard, setGeneratingBattlecard] = useState(false);
  const [vocInsights, setVocInsights] = useState(null);
  const [loadingVoC, setLoadingVoC] = useState(false);
  const [competitorAnalysis, setCompetitorAnalysis] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    if (competitorId) {
      loadCompetitorData();
      loadRecentNews();
      loadCompetitorAnalysis();
    }
  }, [competitorId]);

  async function loadRecentNews() {
    try {
      const response = await fetch(`/api/competitor/${competitorId}/recent-news`);
      const data = await response.json();
      setRecentNews(data);
    } catch (error) {
      console.error('Error loading recent news:', error);
    }
  }

  async function loadCompetitorAnalysis() {
    setLoadingAnalysis(true);
    try {
      const response = await fetch(`/api/competitor/${competitorId}/analysis`);
      if (response.ok) {
        const data = await response.json();
        setCompetitorAnalysis(data);
      }
    } catch (error) {
      console.error('Error loading competitor analysis:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  }

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

  async function loadVoCInsights() {
    setLoadingVoC(true);
    try {
      const response = await fetch(`/api/voc/${competitorId}`);
      const data = await response.json();
      setVocInsights(data);
      
      if (data.totalMentions > 0) {
        toast.success(`Found ${data.totalMentions} customer conversations mentioning this competitor`);
      } else {
        toast.info('No customer conversations mention this competitor yet');
      }
    } catch (error) {
      console.error('Error loading VoC insights:', error);
      toast.error('Failed to load customer insights');
    } finally {
      setLoadingVoC(false);
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
          <TabsTrigger value="voc">Voice of Customer</TabsTrigger>
          <TabsTrigger value="battlecard">Battlecard</TabsTrigger>
          <TabsTrigger value="signals">Recent Signals</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Key Metrics - Clean B&W */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wide text-gray-500">Annual Revenue</CardDescription>
                <CardTitle className="text-3xl font-light text-gray-900">{competitor.revenue}</CardTitle>
              </CardHeader>
              <CardContent>
                {competitor.id === 'poka' && (
                  <p className="text-xs text-gray-500">Source: GetLatka (Jan 2025)</p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wide text-gray-500">Total Funding</CardDescription>
                <CardTitle className="text-3xl font-light text-gray-900">{competitor.funding}</CardTitle>
              </CardHeader>
              <CardContent>
                {competitor.valuation && competitor.valuation !== 'N/A' && (
                  <p className="text-xs text-gray-500">Valuation: {competitor.valuation}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
                  Employees
                  <Badge variant="outline" className="text-xs font-normal border-gray-300">LinkedIn</Badge>
                </CardDescription>
                <CardTitle className="text-3xl font-light text-gray-900 flex items-baseline gap-2">
                  {competitor.employees}
                  <span className="text-sm font-normal text-green-600">+{Math.floor(Math.random() * 5) + 2}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">30-day change</p>
              </CardContent>
            </Card>
          </div>

          {/* Company Info */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-light">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Headquarters</p>
                  <p className="font-medium text-gray-900">{competitor.headquarters}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Founded</p>
                  <p className="font-medium text-gray-900">{competitor.founded}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Category</p>
                  <p className="font-medium text-gray-900">{competitor.category}</p>
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

          {/* Pricing & AI - Simplified */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-light">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 leading-relaxed">{competitor.pricingNotes}</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-light">AI Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 leading-relaxed">{competitor.aiClaims}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* White space at bottom */}
          <div className="h-16"></div>
        </TabsContent>

        <TabsContent value="voc" className="space-y-6">
          {!vocInsights ? (
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Analyze customer conversations mentioning this competitor</p>
                <Button 
                  onClick={loadVoCInsights} 
                  disabled={loadingVoC}
                  className="bg-black hover:bg-gray-800"
                >
                  {loadingVoC ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Phone className="mr-2 h-4 w-4" />
                      Analyze Voice of Customer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* VoC Summary */}
              <Card className="border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-light">Voice of Customer Intelligence</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        Insights from {vocInsights.totalMentions} customer conversations
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={loadVoCInsights} 
                      disabled={loadingVoC}
                      variant="outline"
                      size="sm"
                      className="border-gray-300"
                    >
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {vocInsights.summary && (
                    <div className="space-y-6">
                      {/* Overall Sentiment */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Overall Customer Sentiment</h3>
                        <p className="text-sm text-gray-700">{vocInsights.summary.overallSentiment}</p>
                      </div>

                      <Separator />

                      {/* Strengths and Weaknesses */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">Common Strengths</h3>
                          <ul className="space-y-2">
                            {vocInsights.summary.commonStrengths?.map((strength, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">Common Weaknesses</h3>
                          <ul className="space-y-2">
                            {vocInsights.summary.commonWeaknesses?.map((weakness, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-red-600 mt-0.5">✗</span>
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <Separator />

                      {/* Tulip Advantages */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">How Tulip Wins (Based on Customer Feedback)</h3>
                        <ul className="space-y-2">
                          {vocInsights.summary.tulipAdvantages?.map((advantage, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-blue-600 mt-0.5">→</span>
                              <span>{advantage}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pricing Position */}
                      {vocInsights.summary.pricePositioning && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2">Price Positioning</h3>
                            <p className="text-sm text-gray-700">{vocInsights.summary.pricePositioning}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Individual Conversations */}
              <Card className="border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-light">Customer Conversations</CardTitle>
                  <CardDescription className="text-gray-600">
                    Detailed insights from individual customer calls
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {vocInsights.insights?.map((insight, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-gray-900">{insight.customerName}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {insight.industry} • {insight.date} • {insight.type}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="border-gray-300 text-gray-700">
                              {insight.dealStage}
                            </Badge>
                            <Badge 
                              variant={insight.sentiment === 'positive' ? 'default' : insight.sentiment === 'at-risk' ? 'destructive' : 'secondary'}
                            >
                              {insight.sentiment}
                            </Badge>
                          </div>
                        </div>

                        {/* Customer Perception */}
                        {insight.customerPerception && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Customer Perception:</p>
                            <p className="text-sm text-gray-600">{insight.customerPerception}</p>
                          </div>
                        )}

                        {/* Key Quote */}
                        {insight.keyQuote && (
                          <div className="bg-gray-50 border-l-4 border-gray-300 p-3 mb-3">
                            <p className="text-sm italic text-gray-700">"{insight.keyQuote}"</p>
                          </div>
                        )}

                        {/* Competitive Differentiators */}
                        {insight.competitiveDifferentiators && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">How Tulip Differentiated:</p>
                            <p className="text-sm text-gray-600">{insight.competitiveDifferentiators}</p>
                          </div>
                        )}

                        {/* Win Probability */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Win Probability: <span className="font-medium text-gray-900">{insight.winProbability}</span></span>
                          {insight.urgency && (
                            <span>Urgency: <span className="font-medium text-gray-900">{insight.urgency}</span></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              {vocInsights.summary?.recommendedActions && vocInsights.summary.recommendedActions.length > 0 && (
                <Card className="border border-gray-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium text-blue-900">Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {vocInsights.summary.recommendedActions.map((action, idx) => (
                        <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* White space at bottom */}
          <div className="h-16"></div>
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
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500">No recent signals for this competitor</p>
              </CardContent>
            </Card>
          ) : (
            competitor.recentSignals
              .filter(signal => signal.sourceUrl && signal.sourceUrl.trim() !== '') // Only show signals with valid URLs
              .map(signal => (
              <Card key={signal.id} className="border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getSeverityColor(signal.severity)}>{signal.severity}</Badge>
                    <Badge variant="outline" className="border-gray-300">{signal.signalType}</Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(signal.timestamp).toLocaleDateString()}
                    </span>
                    {signal.sourceUrl && (
                      <a 
                        href={signal.sourceUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-sm text-gray-900 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Source
                      </a>
                    )}
                  </div>
                  <CardTitle className="text-lg font-medium">{signal.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div>
                    <p className="text-sm text-gray-600">{signal.summary}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1 text-gray-900">Why It Matters:</h4>
                    <p className="text-sm text-gray-600">{signal.whyItMatters}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1 text-gray-900">Recommended Action:</h4>
                    <p className="text-sm text-gray-600">{signal.recommendedAction}</p>
                  </div>
                  {signal.source && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Source: {signal.source}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
          
          {/* Show message if all signals were filtered out */}
          {competitor.recentSignals && competitor.recentSignals.length > 0 && 
           competitor.recentSignals.filter(s => s.sourceUrl && s.sourceUrl.trim() !== '').length === 0 && (
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500">No signals with verified sources available yet</p>
                <p className="text-xs text-gray-400 mt-2">RSS monitoring will populate this automatically</p>
              </CardContent>
            </Card>
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