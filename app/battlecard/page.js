'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function BattlecardGeneratorPage() {
  const [competitors, setCompetitors] = useState([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState('');
  const [dealContext, setDealContext] = useState('');
  const [battlecard, setBattlecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

  async function generateBattlecard() {
    if (!selectedCompetitor) {
      toast.error('Please select a competitor');
      return;
    }

    setGenerating(true);
    toast.info('Generating battlecard with AI...');

    try {
      const response = await fetch('/api/battlecards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          competitorId: selectedCompetitor,
          dealContext: dealContext || null
        })
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
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Battlecard Generator</h1>
          <p className="text-muted-foreground">AI-powered sales battlecard creation</p>
        </div>
      </div>

      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Battlecard</CardTitle>
          <CardDescription>
            Select a competitor and optionally provide deal context for a customized battlecard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="competitor">Competitor *</Label>
            <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
              <SelectTrigger>
                <SelectValue placeholder="Select a competitor" />
              </SelectTrigger>
              <SelectContent>
                {competitors.map(comp => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.name} ({comp.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dealContext">Deal Context (Optional)</Label>
            <Textarea
              id="dealContext"
              placeholder="Provide specific deal context, customer requirements, or competitive dynamics for a more tailored battlecard..."
              value={dealContext}
              onChange={(e) => setDealContext(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Example: "Mid-size automotive manufacturer evaluating MES solutions. They're concerned about integration with existing ERP and ease of use for frontline workers."
            </p>
          </div>

          <Button 
            onClick={generateBattlecard} 
            disabled={generating || !selectedCompetitor}
            size="lg"
            className="w-full"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Battlecard...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Battlecard
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Battlecard */}
      {battlecard && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{battlecard.competitorName} Battlecard</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                Print / Save PDF
              </Button>
              <Link href={`/competitors/${battlecard.competitorId}`}>
                <Button variant="outline">View Full Profile</Button>
              </Link>
            </div>
          </div>

          <Card className="border-primary">
            <CardHeader className="bg-primary/5">
              <CardTitle>When They Appear</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
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

          <Card className="border-green-600">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-600">Where Tulip Wins</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">{battlecard.whereTulipWins}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Likely Objections</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {battlecard.likelyObjections.map((objection, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1 font-bold">•</span>
                      <span className="text-sm text-muted-foreground">{objection}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{battlecard.salesResponse}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-blue-600">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-600">Discovery Questions to Ask</CardTitle>
              <CardDescription>Use these questions to position Tulip favorably</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ol className="space-y-3">
                {battlecard.discoveryQuestions.map((question, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="font-bold text-blue-600 text-lg">{idx + 1}.</span>
                    <span className="text-sm text-muted-foreground pt-0.5">{question}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Team Implications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{battlecard.productImplications}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marketing Team Implications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{battlecard.marketingImplications}</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Battlecard generated: {new Date(battlecard.lastUpdated).toLocaleString()}</p>
            <p className="mt-1">Powered by AI • Review and customize as needed for your specific deal</p>
          </div>
        </div>
      )}
    </div>
  );
}