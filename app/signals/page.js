'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Mail, Filter, ExternalLink, Shield, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function SignalsPage() {
  const [signals, setSignals] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    competitorId: '',
    signalText: '',
    source: '',
    sourceUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterSeverity, filterType]);

  async function loadData() {
    try {
      const [signalsRes, competitorsRes] = await Promise.all([
        fetch(`/api/signals?${filterSeverity !== 'all' ? `severity=${filterSeverity}` : ''}${filterType !== 'all' ? `&signalType=${filterType}` : ''}`),
        fetch('/api/competitors')
      ]);
      
      const signalsData = await signalsRes.json();
      const competitorsData = await competitorsRes.json();
      
      setSignals(signalsData);
      setCompetitors(competitorsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load signals');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Signal added and analyzed successfully!');
        setDialogOpen(false);
        setFormData({ competitorId: '', signalText: '', source: '', sourceUrl: '' });
        loadData();
      } else {
        toast.error(data.error || 'Failed to add signal');
      }
    } catch (error) {
      console.error('Error adding signal:', error);
      toast.error('Failed to add signal');
    } finally {
      setSubmitting(false);
    }
  }

  async function generateEmailDraft(signal) {
    try {
      const response = await fetch('/api/email/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId: signal.id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.mailtoUrl;
        toast.success('Opening email client...');
      }
    } catch (error) {
      console.error('Error generating email:', error);
      toast.error('Failed to generate email');
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

  function getConfidenceColor(confidence) {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading signals...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Signal Feed</h1>
            <p className="text-muted-foreground">Real-time competitive intelligence with verified sources</p>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Internal Signal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Internal Signal</DialogTitle>
              <DialogDescription>
                Manually add competitive intelligence from sales calls, customer feedback, or analyst notes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="competitor">Competitor *</Label>
                  <Select 
                    value={formData.competitorId} 
                    onValueChange={(value) => setFormData({...formData, competitorId: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select competitor" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitors.map(comp => (
                        <SelectItem key={comp.id} value={comp.id}>{comp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="signalText">Signal Information *</Label>
                  <Textarea
                    id="signalText"
                    placeholder="Paste sales call notes, customer feedback, analyst insights, pricing changes, etc."
                    value={formData.signalText}
                    onChange={(e) => setFormData({...formData, signalText: e.target.value})}
                    rows={6}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="source">Source (optional)</Label>
                  <Input
                    id="source"
                    placeholder="e.g., Sales call with Acme Corp, Gartner report"
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="sourceUrl">Source URL (optional)</Label>
                  <Input
                    id="sourceUrl"
                    type="url"
                    placeholder="https://..."
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({...formData, sourceUrl: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Analyzing...' : 'Add Signal'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Severity</Label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label>Signal Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="AI">AI</SelectItem>
                  <SelectItem value="fundraising">Fundraising</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="gtm">GTM</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signals */}
      <div className="space-y-4">
        {signals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No signals found. Try adjusting your filters or run the Market Monitor.</p>
            </CardContent>
          </Card>
        ) : (
          signals.map(signal => (
            <Card key={signal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getSeverityColor(signal.severity)}>
                        {signal.severity}
                      </Badge>
                      <Badge variant="outline">{signal.signalType}</Badge>
                      <Badge variant="secondary">{signal.competitorName}</Badge>
                      {signal.sourceConfidence && (
                        <Badge variant="outline" className={getConfidenceColor(signal.sourceConfidence)}>
                          <Shield className="h-3 w-3 mr-1" />
                          {signal.sourceConfidence} confidence
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{signal.title}</CardTitle>
                    <CardDescription className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Source:</span>
                        <span>{signal.source}</span>
                        {signal.sourceUrl && (
                          <>
                            <span>•</span>
                            <a 
                              href={signal.sourceUrl} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Source
                            </a>
                          </>
                        )}
                      </div>
                      {(signal.verifiedDate || signal.timestamp) && (
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>Published: {new Date(signal.verifiedDate || signal.timestamp).toLocaleDateString()}</span>
                          {signal.discoveredDate && (
                            <>
                              <span>•</span>
                              <span>Discovered: {new Date(signal.discoveredDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => generateEmailDraft(signal)}
                    title="Create email alert"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground">{signal.summary}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Why It Matters to Tulip</h4>
                  <p className="text-sm text-muted-foreground">{signal.whyItMatters}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Recommended Action</h4>
                  <p className="text-sm text-muted-foreground">{signal.recommendedAction}</p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Recommended Owner:</span>
                    <Badge variant="outline">{signal.recommendedOwner}</Badge>
                  </div>
                  <Link href={`/competitors/${signal.competitorId}`}>
                    <Button variant="outline" size="sm">View Competitor Profile</Button>
                  </Link>
                </div>
              </CardContent>
              
              {/* Source Attribution Footer */}
              <CardFooter className="border-t pt-4 bg-muted/30">
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {signal.sourceUrl ? (
                        <a 
                          href={signal.sourceUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Original Source
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No URL available</span>
                      )}
                      {signal.dataQuality && (
                        <Badge variant="outline" className="text-xs">
                          {signal.dataQuality} quality
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {signal.discoveredDate && (
                        <span>Discovered: {new Date(signal.discoveredDate).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Rating Breakdown */}
                  {signal.ratingCriteria && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        How was this signal rated? (Impact Score: {signal.ratingCriteria.totalImpact})
                      </summary>
                      <div className="mt-2 p-3 bg-background rounded border space-y-1">
                        <p>• <strong>Base Severity:</strong> {signal.ratingCriteria.baseScore} points</p>
                        <p>• <strong>Type Weight:</strong> {signal.ratingCriteria.typeWeight}x ({signal.signalType})</p>
                        <p>• <strong>Recency Bonus:</strong> +{signal.ratingCriteria.recencyBonus} points</p>
                        <p>• <strong>Total Impact:</strong> {signal.ratingCriteria.totalImpact} points</p>
                        {signal.severityReason && (
                          <p className="mt-2 pt-2 border-t"><strong>Reason:</strong> {signal.severityReason}</p>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Info about methodology */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">About Signal Sources & Rating</p>
              <p className="text-sm text-blue-800 mt-1">
                All signals are automatically collected from verified RSS feeds and news sources, analyzed by AI, and rated based on severity, type, and recency. 
                <Link href="/methodology" className="underline ml-1 font-medium">
                  View full methodology →
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}