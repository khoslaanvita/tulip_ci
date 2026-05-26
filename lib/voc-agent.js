import { customerTranscripts } from './customer-transcripts.js';
import { analyzeSignalWithAI } from './ai-helpers.js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.EMERGENT_LLM_KEY,
});

/**
 * Voice of Customer Agent - Analyzes customer transcripts for competitor intelligence
 */

/**
 * Analyze a single transcript for competitor insights
 */
export async function analyzeTranscript(transcript, competitorId) {
  const prompt = `You are analyzing a customer conversation transcript to extract competitive intelligence.

TRANSCRIPT:
Customer: ${transcript.customerName}
Industry: ${transcript.customerIndustry}
Date: ${transcript.date}
Type: ${transcript.type}
Competitors Mentioned: ${transcript.competitorsMentioned.join(', ')}

CONVERSATION:
${transcript.transcript}

Extract insights about competitor "${competitorId}" in JSON format:
{
  "competitorMentioned": true/false,
  "customerPerception": "What does the customer think about this competitor?",
  "strengths": ["List competitor strengths mentioned by customer"],
  "weaknesses": ["List competitor weaknesses or concerns mentioned"],
  "pricingInsights": "Any pricing information mentioned",
  "competitiveDifferentiators": "How Tulip positioned against this competitor",
  "dealStage": "customer stage (evaluation, technical-validation, negotiation, etc)",
  "winProbability": "low/medium/high",
  "keyQuote": "Most revealing quote from the customer about this competitor"
}

Respond ONLY with valid JSON.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return JSON.parse(message.content[0].text);
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    return null;
  }
}

/**
 * Get all transcripts mentioning a specific competitor
 */
export function getTranscriptsForCompetitor(competitorId) {
  return customerTranscripts.filter(t => 
    t.competitorsMentioned.includes(competitorId)
  );
}

/**
 * Analyze all transcripts for a competitor and generate insights
 */
export async function generateVoCInsights(competitorId) {
  const transcripts = getTranscriptsForCompetitor(competitorId);
  
  if (transcripts.length === 0) {
    return {
      competitorId,
      totalMentions: 0,
      insights: [],
      summary: 'No customer conversations mention this competitor yet.'
    };
  }

  const insights = [];
  
  for (const transcript of transcripts) {
    const analysis = await analyzeTranscript(transcript, competitorId);
    
    if (analysis && analysis.competitorMentioned) {
      insights.push({
        transcriptId: transcript.id,
        customerName: transcript.customerName,
        industry: transcript.customerIndustry,
        date: transcript.date,
        type: transcript.type,
        dealStage: transcript.stage,
        sentiment: transcript.sentiment,
        urgency: transcript.urgency,
        ...analysis
      });
    }
  }

  // Generate summary
  const summaryPrompt = `Based on these customer conversation insights about a competitor, provide an executive summary:

${JSON.stringify(insights, null, 2)}

Provide a brief executive summary in JSON format:
{
  "overallSentiment": "How customers generally feel about this competitor",
  "commonStrengths": ["Top 3 strengths customers mention"],
  "commonWeaknesses": ["Top 3 weaknesses or concerns"],
  "pricePositioning": "How this competitor is positioned on price",
  "tulipAdvantages": ["Key ways Tulip wins against this competitor based on customer feedback"],
  "atRiskDeals": number,
  "recommendedActions": ["Strategic recommendations based on customer feedback"]
}

Respond ONLY with valid JSON.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: summaryPrompt }],
    });

    const summary = JSON.parse(message.content[0].text);

    return {
      competitorId,
      totalMentions: transcripts.length,
      insights,
      summary,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating VoC summary:', error);
    return {
      competitorId,
      totalMentions: transcripts.length,
      insights,
      summary: {
        overallSentiment: 'Unable to generate summary',
        commonStrengths: [],
        commonWeaknesses: [],
        pricePositioning: 'Unknown',
        tulipAdvantages: [],
        atRiskDeals: 0,
        recommendedActions: []
      },
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Get quick stats for dashboard
 */
export function getVoCStats() {
  const totalTranscripts = customerTranscripts.length;
  const atRiskCount = customerTranscripts.filter(t => t.sentiment === 'at-risk').length;
  const highUrgencyCount = customerTranscripts.filter(t => t.urgency === 'high').length;
  
  const competitorMentions = {};
  customerTranscripts.forEach(t => {
    t.competitorsMentioned.forEach(comp => {
      competitorMentions[comp] = (competitorMentions[comp] || 0) + 1;
    });
  });

  return {
    totalTranscripts,
    atRiskDeals: atRiskCount,
    highUrgencyDeals: highUrgencyCount,
    competitorMentions,
    recentTranscripts: customerTranscripts
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
