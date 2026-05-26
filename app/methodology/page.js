'use client'

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Info, TrendingUp, Calculator, Shield, Users, AlertTriangle } from 'lucide-react';

export default function DocumentationPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Intelligence Methodology</h1>
          <p className="text-muted-foreground mt-1">How we collect, analyze, and rate competitive intelligence</p>
        </div>
      </div>

      <Tabs defaultValue="rating" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rating">Signal Rating</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="employees">Employee Tracking</TabsTrigger>
          <TabsTrigger value="threat">Threat Scoring</TabsTrigger>
        </TabsList>

        {/* Signal Rating Tab */}
        <TabsContent value="rating" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Signal Severity Criteria
              </CardTitle>
              <CardDescription>
                How we determine if a competitive signal is HIGH, MEDIUM, or LOW severity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* HIGH */}
              <div className="border-l-4 border-red-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive">HIGH SEVERITY</Badge>
                  <span className="text-sm text-muted-foreground">Score: 10 points</span>
                </div>
                <p className="text-sm mb-3"><strong>Definition:</strong> Immediate threat requiring action within 1-2 weeks</p>
                <p className="text-sm font-semibold mb-2">Triggers:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Major product launch directly competing with Tulip core features</li>
                  <li>• Significant funding round ({'>'}$50M) enabling aggressive expansion</li>
                  <li>• Acquisition of technology/company strengthening their position</li>
                  <li>• Key customer win in Tulip target accounts</li>
                  <li>• Pricing change undercutting Tulip by {'>'}30%</li>
                  <li>• Executive hire from Tulip or top competitor</li>
                  <li>• Partnership with major tech vendor (Microsoft, AWS, NVIDIA)</li>
                </ul>
                <p className="text-sm mt-3"><strong>Response Time:</strong> 1-2 weeks</p>
                <p className="text-sm"><strong>Owners:</strong> Executive, Product, Sales</p>
              </div>

              {/* MEDIUM */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">MEDIUM SEVERITY</Badge>
                  <span className="text-sm text-muted-foreground">Score: 5 points</span>
                </div>
                <p className="text-sm mb-3"><strong>Definition:</strong> Important competitive move requiring monitoring and potential response</p>
                <p className="text-sm font-semibold mb-2">Triggers:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Product feature enhancement in overlapping area</li>
                  <li>• Moderate funding round ($10-50M)</li>
                  <li>• Entry into new vertical where Tulip operates</li>
                  <li>• Significant marketing campaign or rebranding</li>
                  <li>• New partnership announcement</li>
                  <li>• Customer case study publication</li>
                  <li>• Award or analyst recognition (Gartner, Forrester)</li>
                </ul>
                <p className="text-sm mt-3"><strong>Response Time:</strong> 2-4 weeks</p>
                <p className="text-sm"><strong>Owners:</strong> Product, Marketing, Sales</p>
              </div>

              {/* LOW */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">LOW SEVERITY</Badge>
                  <span className="text-sm text-muted-foreground">Score: 2 points</span>
                </div>
                <p className="text-sm mb-3"><strong>Definition:</strong> Informational update worth tracking but not requiring immediate action</p>
                <p className="text-sm font-semibold mb-2">Triggers:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Minor product updates or bug fixes</li>
                  <li>• Blog post or content publication</li>
                  <li>• Conference participation or speaking engagement</li>
                  <li>• Team expansion announcements</li>
                  <li>• Office opening or relocation</li>
                  <li>• Industry news mention</li>
                  <li>• Social media activity</li>
                </ul>
                <p className="text-sm mt-3"><strong>Response Time:</strong> Monitor over time</p>
                <p className="text-sm"><strong>Owners:</strong> Marketing, Sales</p>
              </div>
            </CardContent>
          </Card>

          {/* Signal Type Weights */}
          <Card>
            <CardHeader>
              <CardTitle>Signal Type Importance Weights</CardTitle>
              <CardDescription>Different signal types have different strategic impact</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Signal Type</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Why It Matters</TableHead>
                    <TableHead>Impact Areas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell><Badge>AI</Badge></TableCell>
                    <TableCell className="font-bold text-red-600">1.8x</TableCell>
                    <TableCell>AI is core competitive differentiator</TableCell>
                    <TableCell className="text-sm">Product, Exec, Marketing</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge>Product</Badge></TableCell>
                    <TableCell className="font-bold">1.5x</TableCell>
                    <TableCell>Direct feature competition</TableCell>
                    <TableCell className="text-sm">Product, Sales, Marketing</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge>Fundraising</Badge></TableCell>
                    <TableCell className="font-bold">1.4x</TableCell>
                    <TableCell>Funding enables expansion</TableCell>
                    <TableCell className="text-sm">Exec, Finance, BD</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge>Pricing</Badge></TableCell>
                    <TableCell className="font-bold">1.3x</TableCell>
                    <TableCell>Price competition impacts deals</TableCell>
                    <TableCell className="text-sm">Sales, Finance, Exec</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge>Partnership</Badge></TableCell>
                    <TableCell className="font-bold">1.3x</TableCell>
                    <TableCell>Partnerships extend capabilities</TableCell>
                    <TableCell className="text-sm">BD, Product, Exec</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge>Customer</Badge></TableCell>
                    <TableCell className="font-bold">1.3x</TableCell>
                    <TableCell>Customer wins validate market fit</TableCell>
                    <TableCell className="text-sm">Sales, Marketing, CS</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge>Hiring</Badge></TableCell>
                    <TableCell>1.2x</TableCell>
                    <TableCell>Team growth indicates ambition</TableCell>
                    <TableCell className="text-sm">HR, Exec, Sales</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge>GTM</Badge></TableCell>
                    <TableCell>1.1x</TableCell>
                    <TableCell>Messaging and positioning shifts</TableCell>
                    <TableCell className="text-sm">Marketing, Sales, Exec</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Quality & Confidence Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-l-4 border-green-500 pl-4">
                <Badge className="mb-2">HIGH CONFIDENCE (95%+)</Badge>
                <p className="text-sm mb-2"><strong>Definition:</strong> Official company announcement or verified public filing</p>
                <p className="text-sm font-semibold mb-1">Sources:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Company press releases</li>
                  <li>• SEC filings and 10-K reports</li>
                  <li>• Official company blogs and newsrooms</li>
                  <li>• Earnings calls and investor presentations</li>
                  <li>• Direct company statements</li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <Badge variant="outline" className="mb-2">MEDIUM CONFIDENCE (75-94%)</Badge>
                <p className="text-sm mb-2"><strong>Definition:</strong> Reputable third-party source or industry publication</p>
                <p className="text-sm font-semibold mb-1">Sources:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• TechCrunch, VentureBeat, Industry publications</li>
                  <li>• GetLatka, ZoomInfo, Growjo (data aggregators)</li>
                  <li>• Crunchbase, PitchBook (funding databases)</li>
                  <li>• LinkedIn company pages</li>
                  <li>• Analyst reports (Gartner, Forrester)</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <Badge variant="secondary" className="mb-2">LOW CONFIDENCE (&lt;75%)</Badge>
                <p className="text-sm mb-2"><strong>Definition:</strong> Unverified or estimated data</p>
                <p className="text-sm font-semibold mb-1">Sources:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Third-party estimates and projections</li>
                  <li>• Aggregator sites without primary sources</li>
                  <li>• Social media posts and rumors</li>
                  <li>• Unverified claims</li>
                  <li>• Industry speculation</li>
                </ul>
                <p className="text-sm mt-2 text-orange-600"><strong>Note:</strong> Low confidence data is marked and should be verified before making strategic decisions.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Source Attribution Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">Tulip Valuation</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Value:</div>
                    <div className="font-semibold">$1.3B</div>
                    <div className="text-muted-foreground">Source:</div>
                    <div>Tulip Press Release</div>
                    <div className="text-muted-foreground">URL:</div>
                    <div><a href="https://tulip.co/press/tulip-secures-120m-series-d/" className="text-blue-600 hover:underline text-xs" target="_blank">tulip.co/press/...</a></div>
                    <div className="text-muted-foreground">Date:</div>
                    <div>January 2026</div>
                    <div className="text-muted-foreground">Confidence:</div>
                    <div><Badge className="text-xs">HIGH</Badge> (Official)</div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">Poka Revenue</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Value:</div>
                    <div className="font-semibold">$18.6M ARR</div>
                    <div className="text-muted-foreground">Source:</div>
                    <div>GetLatka</div>
                    <div className="text-muted-foreground">URL:</div>
                    <div><a href="https://getlatka.com/companies/poka.io" className="text-blue-600 hover:underline text-xs" target="_blank">getlatka.com/companies/poka.io</a></div>
                    <div className="text-muted-foreground">Date:</div>
                    <div>January 2025</div>
                    <div className="text-muted-foreground">Confidence:</div>
                    <div><Badge variant="outline" className="text-xs">MEDIUM</Badge> (Estimate)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Tracking Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee & Hiring Velocity Tracking
              </CardTitle>
              <CardDescription>
                How we monitor competitor hiring patterns and detect strategic shifts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Data Collection</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• <strong>Source:</strong> LinkedIn company pages and employee count APIs</li>
                  <li>• <strong>Frequency:</strong> Daily snapshots at midnight UTC</li>
                  <li>• <strong>Historical:</strong> 24 months of data retention</li>
                  <li>• <strong>Granularity:</strong> Total employees + department breakdown when available</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Alert Thresholds</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <Badge variant="destructive" className="mb-2">RAPID GROWTH ALERT</Badge>
                    <p className="text-sm mb-1"><strong>Trigger:</strong> {'>'}15% employee increase in 30 days</p>
                    <p className="text-sm mb-1"><strong>Severity:</strong> HIGH</p>
                    <p className="text-sm mb-1"><strong>Recipients:</strong> CEO, HR, Strategy team</p>
                    <p className="text-sm text-muted-foreground">Indicates: Potential expansion, new product launch, or post-funding hiring spree</p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <Badge variant="default" className="mb-2">MODERATE GROWTH</Badge>
                    <p className="text-sm mb-1"><strong>Trigger:</strong> 5-15% employee increase in 30 days</p>
                    <p className="text-sm mb-1"><strong>Severity:</strong> MEDIUM</p>
                    <p className="text-sm text-muted-foreground">Indicates: Steady hiring, monitor for strategic shifts</p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <Badge variant="outline" className="mb-2">CONTRACTION ALERT</Badge>
                    <p className="text-sm mb-1"><strong>Trigger:</strong> {'>'}10% employee decrease in 30 days</p>
                    <p className="text-sm mb-1"><strong>Severity:</strong> MEDIUM</p>
                    <p className="text-sm text-muted-foreground">Indicates: Potential financial issues, layoffs, or strategic pivot</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <Badge variant="outline" className="mb-2">DEPARTMENT FOCUS</Badge>
                    <p className="text-sm mb-1"><strong>Trigger:</strong> {'>'}5 hires in specific department in 30 days</p>
                    <p className="text-sm mb-1"><strong>Severity:</strong> MEDIUM</p>
                    <p className="text-sm text-muted-foreground">Indicates: Investment in specific function (e.g., Engineering = new product, Sales = expansion)</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Automated Email Example</h3>
                <div className="p-4 bg-muted rounded-lg text-sm font-mono">
                  <div className="mb-2"><strong>Subject:</strong> 🚨 Hiring Velocity Alert: Poka +18% employees in 30 days</div>
                  <div className="border-t pt-2 mt-2">
                    <p className="mb-2"><strong>THREAT ALERT: Rapid Hiring Detected</strong></p>
                    <p className="mb-1">Competitor: Poka</p>
                    <p className="mb-1">Employee Growth: +30 employees (18%)</p>
                    <p className="mb-1">Time Period: Last 30 days</p>
                    <p className="mb-3">Current Total: 199 employees</p>
                    
                    <p className="mb-1"><strong>Department Breakdown:</strong></p>
                    <p className="mb-1">- Engineering: +15 (50%)</p>
                    <p className="mb-1">- Sales: +8 (27%)</p>
                    <p className="mb-3">- Marketing: +5 (17%)</p>
                    
                    <p className="mb-1"><strong>Why This Matters:</strong></p>
                    <p className="mb-1">Engineering-heavy hiring indicates new product development.</p>
                    <p className="mb-3">Likely preparing for major launch in 2-3 months.</p>
                    
                    <p className="mb-1"><strong>Recommended Actions:</strong></p>
                    <p>1. Monitor for product announcements</p>
                    <p>2. Update competitive battlecards</p>
                    <p>3. Brief sales team</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Scoring Tab */}
        <TabsContent value="threat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Threat Score Calculation
              </CardTitle>
              <CardDescription>
                How we calculate overall competitive threat levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Formula</h3>
                <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                  <p>Total Score = Base Score + (Signal Type Weight × Severity Score) + Recency Bonus</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Components</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold">Base Score</TableCell>
                      <TableCell>Starts at 0 for each competitor</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Severity Score</TableCell>
                      <TableCell>HIGH = 10, MEDIUM = 5, LOW = 2</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Type Weight</TableCell>
                      <TableCell>AI = 1.8x, Product = 1.5x, Pricing = 1.3x, etc.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Recency Bonus</TableCell>
                      <TableCell>+2 points per signal in last 30 days</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Decay Factor</TableCell>
                      <TableCell>-1 point per signal older than 90 days</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Threat Level Thresholds</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-4 p-3 border rounded-lg bg-red-50">
                    <Badge variant="destructive">HIGH THREAT</Badge>
                    <span className="text-sm">≥20 points</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 border rounded-lg bg-yellow-50">
                    <Badge variant="default">MEDIUM THREAT</Badge>
                    <span className="text-sm">10-19 points</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 border rounded-lg bg-green-50">
                    <Badge variant="secondary">LOW THREAT</Badge>
                    <span className="text-sm">&lt;10 points</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Example Calculation: Poka</h3>
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div>
                    <p className="text-sm font-semibold mb-2">Signal 1: AI Toolkit Launch</p>
                    <p className="text-sm text-muted-foreground">Type: AI (1.8x weight)</p>
                    <p className="text-sm text-muted-foreground">Severity: HIGH (10 points)</p>
                    <p className="text-sm text-muted-foreground">Age: 15 days (recency bonus: +2)</p>
                    <p className="text-sm font-mono mt-2">Calculation: (1.8 × 10) + 2 = <strong>20 points</strong></p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Signal 2: Poka Automate Content</p>
                    <p className="text-sm text-muted-foreground">Type: GTM (1.1x weight)</p>
                    <p className="text-sm text-muted-foreground">Severity: LOW (2 points)</p>
                    <p className="text-sm text-muted-foreground">Age: 45 days (recency bonus: +2)</p>
                    <p className="text-sm font-mono mt-2">Calculation: (1.1 × 2) + 2 = <strong>4.2 points</strong></p>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm font-semibold">Total Score: 24.2 points</p>
                    <p className="text-sm">Threat Level: <Badge variant="destructive">HIGH</Badge></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Link href="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}