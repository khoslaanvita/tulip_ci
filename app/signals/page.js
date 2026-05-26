'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Mail, Filter } from 'lucide-react';
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
            <p className="text-muted-foreground">Real-time competitive intelligence signals</p>
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
                    </div>
                    <CardTitle className="text-xl">{signal.title}</CardTitle>
                    <CardDescription>
                      {signal.source} • {new Date(signal.timestamp).toLocaleDateString()}
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
            </Card>
          ))
        )}
      </div>
    </div>
  );
}