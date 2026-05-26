import OpenAI from 'openai';
import { readJSON } from './storage.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory cache per competitor (6 hour TTL).
const cache = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * Generate competitor-specific threats and opportunities for Tulip.
 * Falls back to deterministic rule-based analysis if OpenAI fails.
 */
export async function generateCompetitorThreatsOpportunities(competitorId) {
  // Serve from cache when fresh
  const hit = cache.get(competitorId);
  if (hit && Date.now() - hit.t < CACHE_TTL_MS) return hit.data;

  const competitors = readJSON('competitors.json');
  const signals = readJSON('signals.json');
  
  const competitor = competitors.find(c => c.id === competitorId);
  if (!competitor) {
    throw new Error('Competitor not found');
  }

  // Get recent signals for this competitor
  const competitorSignals = signals
    .filter(s => s.competitorId === competitorId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  const prompt = `You are analyzing competitive threats and opportunities for Tulip, a manufacturing software platform.

COMPETITOR: ${competitor.name}
CATEGORY: ${competitor.category}
POSITIONING: ${competitor.positioning}

COMPETITOR DETAILS:
- Employees: ${competitor.employees}
- Revenue: ${competitor.revenue}
- Funding: ${competitor.funding}
- Threat Score: ${competitor.threatScore}/100

STRENGTHS:
${competitor.strengths.map(s => `- ${s}`).join('\n')}

WEAKNESSES:
${competitor.weaknesses.map(s => `- ${s}`).join('\n')}

AI CAPABILITIES: ${competitor.aiCapabilities}
PRICING: ${competitor.pricingNotes}

RECENT COMPETITIVE SIGNALS:
${competitorSignals.map(s => `- ${s.title} (${s.severity} severity, ${s.signalType})\n  ${s.summary}`).join('\n')}

Analyze this competitor and provide strategic intelligence in JSON format:

{
  "companyNiche": {
    "coreFunction": "One sentence: What does this company do?",
    "targetMarket": "Who do they serve?",
    "keyDifferentiator": "What makes them unique?",
    "focusAreas": ["3-5 specific areas they focus on"]
  },
  
  "threatsToTulip": [
    {
      "threat": "Specific competitive threat",
      "severity": "critical/high/medium/low",
      "description": "Detailed explanation of the threat",
      "likelihood": "high/medium/low",
      "impactedAreas": ["sales", "product", "marketing"],
      "mitigationStrategy": "How Tulip should respond"
    }
  ],
  
  "opportunitiesForTulip": [
    {
      "opportunity": "Specific opportunity to win",
      "impact": "high/medium/low",
      "description": "How Tulip can capitalize",
      "requiredAction": "What Tulip needs to do",
      "owner": "product/sales/marketing/executive",
      "timeframe": "immediate/short-term/long-term"
    }
  ],
  
  "competitiveGaps": [
    {
      "gap": "What competitor can't do",
      "tulipAdvantage": "How Tulip fills this gap",
      "customerImpact": "Why customers care"
    }
  ],
  
  "marketTrends": {
    "relevantTrends": ["Industry trends affecting this competitor"],
    "howTheyreResponding": "How competitor is adapting",
    "tulipPosition": "How Tulip should position against these trends"
  },
  
  "recommendedActions": [
    {
      "action": "Specific action Tulip should take",
      "priority": "high/medium/low",
      "rationale": "Why this action matters",
      "expectedOutcome": "What success looks like"
    }
  ]
}

Be strategic, specific, and actionable. Focus on insights Tulip can act on.
Respond ONLY with valid JSON.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    const result = {
      competitorId,
      competitorName: competitor.name,
      analysis,
      lastUpdated: new Date().toISOString(),
      basedOnSignals: competitorSignals.length,
      aiEnabled: true,
    };
    cache.set(competitorId, { t: Date.now(), data: result });
    return result;

  } catch (error) {
    console.error('Error generating competitor analysis (using fallback):', error.message);
    const result = {
      competitorId,
      competitorName: competitor.name,
      analysis: buildFallbackAnalysis(competitor, competitorSignals),
      lastUpdated: new Date().toISOString(),
      basedOnSignals: competitorSignals.length,
      aiEnabled: false,
    };
    cache.set(competitorId, { t: Date.now(), data: result });
    return result;
  }
}

// ---- Deterministic fallback analyzer ----
function buildFallbackAnalysis(c, signals) {
  const cat = (c.category || '').toLowerCase();
  const weaknesses = c.weaknesses || [];
  const strengths = c.strengths || [];

  return {
    companyNiche: {
      coreFunction: c.positioning || `${c.name} provides ${c.category} software for manufacturing.`,
      targetMarket: c.verticalFocus || c.industry || 'Manufacturing enterprises',
      keyDifferentiator: strengths[0] || 'Established market presence',
      focusAreas: strengths.slice(0, 4),
    },
    threatsToTulip: [
      {
        threat: `${c.name} ${/connected worker|frontline/.test(cat) ? 'overlaps Tulip directly on frontline ops' : /mes|erp/.test(cat) ? 'bundles MES into ERP transformation deals' : /qms/.test(cat) ? 'is expanding QMS into shop-floor execution' : /cmms|eam/.test(cat) ? 'is moving from asset records into operator workflows' : 'is encroaching on workflow execution territory'}`,
        severity: (c.priority || 'medium').toLowerCase() === 'high' ? 'high' : 'medium',
        description: c.tulipRelevance || c.tulipCompetitiveAngle || `${c.name} is an active competitor in this category and shows up in Tulip deals.`,
        likelihood: 'high',
        impactedAreas: ['sales', 'product'],
        mitigationStrategy: weaknesses[0] ? `Lead with positioning that exploits ${c.name}'s weakness: "${weaknesses[0]}". Tighten the battlecard and arm AEs with proof points.` : `Refresh the Tulip vs ${c.name} battlecard and tighten differentiation in mid-market accounts.`,
      },
      {
        threat: `${c.name}'s AI/automation narrative could shape buyer perception of "modern" manufacturing software`,
        severity: 'medium',
        description: c.aiClaims || `${c.name} is investing in AI-led messaging that resets buyer expectations.`,
        likelihood: 'medium',
        impactedAreas: ['marketing', 'product'],
        mitigationStrategy: `Publish Tulip's frontline-AI POV (operator copilot, app-generation) and benchmark vs ${c.name}'s claims with real customer outcomes.`,
      },
    ],
    opportunitiesForTulip: [
      {
        opportunity: weaknesses[0] ? `Win deals stuck on "${weaknesses[0].toLowerCase()}"` : `Position Tulip as the faster, more flexible alternative`,
        impact: 'high',
        description: `Target ${c.name}'s weakest dimension. Tulip's composability + speed-to-value beats ${c.name}'s ${weaknesses[0] ? weaknesses[0].toLowerCase() : 'incumbent inertia'}.`,
        requiredAction: `Build a 90-day pilot offer; arm sales with side-by-side ROI proof; deliver migration playbook for accounts already on ${c.name}.`,
        owner: /mes|erp/.test(cat) ? 'sales' : /qms/.test(cat) ? 'customer-success' : 'sales',
        timeframe: 'short-term',
      },
      {
        opportunity: `Coexistence play with ${c.name}`,
        impact: 'medium',
        description: `In accounts already running ${c.name}, position Tulip as the operator-facing app layer that closes the loop on ${c.name}'s data/records.`,
        requiredAction: 'Build integration content + joint reference architecture; protect existing footprint, expand into adjacent workflows.',
        owner: 'product',
        timeframe: 'short-term',
      },
      {
        opportunity: `Frontline AI differentiation`,
        impact: 'high',
        description: `${c.name}'s AI focus is primarily on records/analytics. Tulip wins on AI in operator hands.`,
        requiredAction: 'Ship Tulip Frontline Copilot demos and case studies; counter-position vs vendor AI claims.',
        owner: 'product',
        timeframe: 'immediate',
      },
    ],
    competitiveGaps: weaknesses.slice(0, 3).map(w => ({
      gap: w,
      tulipAdvantage: 'Composable app platform with rapid configuration, real-time data, and operator-first UX',
      customerImpact: 'Faster time-to-value, lower TCO, higher operator adoption',
    })),
    marketTrends: {
      relevantTrends: [
        'Generative AI copilots becoming table stakes',
        'Buyers demanding faster ROI and shorter implementations',
        /qms|quality/.test(cat) ? 'QMS + MES convergence accelerating' : /scada|ot/.test(cat) ? 'Unified namespace (UNS) architecture momentum' : 'Plant-floor app composability over monolithic suites',
      ],
      howTheyreResponding: c.aiClaims || `${c.name} is layering AI features and broadening its suite`,
      tulipPosition: 'Tulip leads on composability + operator UX + speed-to-value — the dimensions buyers increasingly prioritise.',
    },
    recommendedActions: [
      {
        action: `Refresh the Tulip vs ${c.name} battlecard with current intel and 3 specific objection-handling responses`,
        priority: 'high',
        rationale: 'Sales needs ammunition that reflects the current state of the competitor, not last year\'s positioning.',
        expectedOutcome: 'Higher win rate in head-to-head deals; shorter sales cycles.',
      },
      {
        action: `Identify the 3 most exposed accounts where Tulip is competing with ${c.name} and run executive-led account plans`,
        priority: 'high',
        rationale: 'Concentrated effort on top deals delivers measurable revenue impact.',
        expectedOutcome: 'Close at least 2 of 3 deals within the quarter.',
      },
      {
        action: 'Publish a coexistence + migration brief addressing this competitor specifically',
        priority: 'medium',
        rationale: 'Empowers field teams to defend the account or expand within it.',
        expectedOutcome: 'Expanded land-and-expand motion; reduced deal slippage.',
      },
    ],
  };
}

/**
 * Get recent news/signals for a competitor
 */
export function getRecentCompetitorNews(competitorId, limit = 5) {
  const signals = readJSON('signals.json');
  
  return signals
    .filter(s => s.competitorId === competitorId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit)
    .map(s => ({
      id: s.id,
      title: s.title,
      summary: s.summary,
      signalType: s.signalType,
      severity: s.severity,
      timestamp: s.timestamp,
      sourceUrl: s.sourceUrl,
      source: s.source
    }));
}
