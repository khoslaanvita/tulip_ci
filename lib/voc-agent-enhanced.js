import OpenAI from 'openai';
import { getTranscriptsByCompetitor, getAllCustomerTranscripts } from './db-operations.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Enhanced Voice of Customer Agent - Comprehensive competitive intelligence from customer conversations
 */

/**
 * Analyze transcripts for a competitor and generate comprehensive insights
 */
export async function generateComprehensiveVoCInsights(competitorId) {
  // Get transcripts from MongoDB
  const transcripts = await getTranscriptsByCompetitor(competitorId);
  
  if (transcripts.length === 0) {
    return {
      competitorId,
      totalConversations: 0,
      insights: null,
      message: 'No customer conversations mention this competitor yet.'
    };
  }

  // Prepare conversation data for analysis
  const conversationsText = transcripts.map(t => `
CONVERSATION ${t.id}:
Customer: ${t.customerName} (${t.customerIndustry})
Date: ${t.date}
Type: ${t.type}
Deal Stage: ${t.stage}
Sentiment: ${t.sentiment}
Urgency: ${t.urgency}

Transcript:
${t.transcript}

---
`).join('\n');

  const prompt = `You are a competitive intelligence analyst analyzing customer conversations about a competitor.

CUSTOMER CONVERSATIONS:
${conversationsText}

Analyze these conversations and provide a COMPREHENSIVE competitive intelligence report in JSON format:

{
  "executiveSummary": "2-3 sentence overview of what customers think about this competitor",
  
  "strengths": {
    "summary": "Overall view of competitor strengths from customer perspective",
    "specifics": [
      {
        "strength": "Specific strength mentioned",
        "evidence": "Quote or paraphrase from conversation",
        "frequency": "how often mentioned (rare/sometimes/frequently)"
      }
    ]
  },
  
  "weaknesses": {
    "summary": "Overall view of competitor weaknesses from customer perspective", 
    "specifics": [
      {
        "weakness": "Specific weakness mentioned",
        "evidence": "Quote or paraphrase from conversation",
        "frequency": "how often mentioned",
        "severity": "low/medium/high"
      }
    ]
  },
  
  "threats": {
    "toTulip": [
      {
        "threat": "Specific competitive threat to Tulip",
        "description": "Why this is threatening",
        "likelihood": "low/medium/high"
      }
    ]
  },
  
  "opportunities": {
    "forTulip": [
      {
        "opportunity": "Specific opportunity for Tulip to win",
        "description": "How Tulip can capitalize",
        "impact": "low/medium/high"
      }
    ]
  },
  
  "pricing": {
    "positioning": "How is this competitor positioned on price? (premium/competitive/budget)",
    "customerPerception": "What customers say about their pricing",
    "comparisonToTulip": "How their pricing compares to Tulip based on conversations",
    "priceObjections": ["List any price-related objections or concerns mentioned"]
  },
  
  "product": {
    "coreCapabilities": ["Key product capabilities customers mention"],
    "limitations": ["Product limitations or gaps customers identify"],
    "differentiators": ["What makes their product different"],
    "integrations": ["Integrations or ecosystem mentions"],
    "userExperience": "What customers say about ease of use, interface, etc."
  },
  
  "salesAndGTM": {
    "salesApproach": "How do they sell based on customer mentions?",
    "typicalDealSize": "Any mentions of deal sizes or pricing models",
    "implementationTimeline": "How long do implementations take?",
    "supportQuality": "Any mentions of customer support quality"
  },
  
  "competitivePositioning": {
    "howTheyPosition": "How this competitor positions themselves in market",
    "targetCustomers": ["Types of customers they target"],
    "winConditions": ["Situations where they tend to win"],
    "lossConditions": ["Situations where they tend to lose"]
  },
  
  "tulipWinStrategies": [
    {
      "strategy": "Specific strategy Tulip should use against this competitor",
      "when": "When to use this strategy",
      "messaging": "Key messages to emphasize",
      "evidence": "Supporting evidence from conversations"
    }
  ],
  
  "dealRisks": {
    "atRiskDeals": number,
    "riskFactors": ["Factors that put Tulip deals at risk against this competitor"],
    "mitigationStrategies": ["How to mitigate these risks"]
  },
  
  "keyQuotes": [
    {
      "quote": "Actual quote from customer",
      "context": "Who said it and in what context",
      "significance": "Why this quote matters"
    }
  ],
  
  "actionableInsights": [
    {
      "insight": "Key insight",
      "action": "Specific action Tulip should take",
      "owner": "product/sales/marketing/customer-success/executive",
      "priority": "high/medium/low",
      "timeframe": "immediate/short-term/long-term"
    }
  ]
}

Be thorough, specific, and actionable. Extract real value from these conversations.
Respond ONLY with valid JSON.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const insights = JSON.parse(completion.choices[0].message.content);

    return {
      competitorId,
      totalConversations: transcripts.length,
      conversations: transcripts.map(t => ({
        id: t.id,
        customerName: t.customerName,
        industry: t.customerIndustry,
        date: t.date,
        type: t.type,
        stage: t.stage,
        sentiment: t.sentiment,
        urgency: t.urgency
      })),
      insights,
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error generating comprehensive VoC insights:', error);
    throw new Error(`Failed to analyze customer conversations: ${error.message}`);
  }
}

/**
 * Get VoC statistics across all transcripts
 */
export async function getVoCStats() {
  const transcripts = await getAllCustomerTranscripts();
  
  const atRiskCount = transcripts.filter(t => t.sentiment === 'at-risk').length;
  const highUrgencyCount = transcripts.filter(t => t.urgency === 'high').length;
  
  const competitorMentions = {};
  transcripts.forEach(t => {
    t.competitorsMentioned.forEach(comp => {
      competitorMentions[comp] = (competitorMentions[comp] || 0) + 1;
    });
  });

  const industryBreakdown = {};
  transcripts.forEach(t => {
    industryBreakdown[t.customerIndustry] = (industryBreakdown[t.customerIndustry] || 0) + 1;
  });

  return {
    totalTranscripts: transcripts.length,
    atRiskDeals: atRiskCount,
    highUrgencyDeals: highUrgencyCount,
    competitorMentions,
    industryBreakdown,
    recentTranscripts: transcripts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        customer: t.customerName,
        date: t.date,
        competitors: t.competitorsMentioned,
        sentiment: t.sentiment
      }))
  };
}
