import OpenAI from 'openai';
import { readJSON } from './storage.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate competitor-specific threats and opportunities for Tulip
 */
export async function generateCompetitorThreatsOpportunities(competitorId) {
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
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    return {
      competitorId,
      competitorName: competitor.name,
      analysis,
      lastUpdated: new Date().toISOString(),
      basedOnSignals: competitorSignals.length
    };

  } catch (error) {
    console.error('Error generating competitor analysis:', error);
    throw new Error(`Failed to analyze competitor: ${error.message}`);
  }
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
