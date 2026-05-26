import OpenAI from 'openai';
import { readJSON } from './storage.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate executive market summary - top 3 things happening this month
 */
export async function generateMarketSummary() {
  const signals = readJSON('signals.json');
  const competitors = readJSON('competitors.json');
  
  // Get signals from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSignals = signals
    .filter(s => new Date(s.timestamp) > thirtyDaysAgo)
    .sort((a, b) => {
      // Sort by severity score and recency
      const scoreA = (a.severityScore || 5) * (a.ratingCriteria?.totalImpact || 1);
      const scoreB = (b.severityScore || 5) * (b.ratingCriteria?.totalImpact || 1);
      return scoreB - scoreA;
    })
    .slice(0, 10); // Top 10 most important recent signals

  const prompt = `You are a competitive intelligence analyst for Tulip, a manufacturing software platform.

Based on these recent competitive signals from the past 30 days, provide an executive briefing:

RECENT SIGNALS:
${recentSignals.map(s => `- ${s.competitorName}: ${s.title} (${s.severity} severity, ${s.signalType})`).join('\n')}

COMPETITORS:
${competitors.map(c => `- ${c.name}: Threat Score ${c.threatScore}/100, Category: ${c.category}`).join('\n')}

Provide a JSON response with:
{
  "top3Events": [
    "Most important market event #1 (one sentence)",
    "Most important market event #2 (one sentence)", 
    "Most important market event #3 (one sentence)"
  ],
  "tulipPositioning": "One sentence about Tulip's current competitive position in the market",
  "overallThreatLevel": "low/medium/high",
  "keyTrend": "One sentence describing the most important trend affecting the competitive landscape"
}

Focus on the most strategically important developments. Be concise and actionable.
Respond ONLY with valid JSON.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error generating market summary:', error);
    return {
      top3Events: [
        'RSS monitoring active across 8 industry feeds',
        'Tracking 5 key competitors in manufacturing software',
        'Voice of Customer analysis available for deal intelligence'
      ],
      tulipPositioning: 'Tulip maintains strong platform differentiation vs. point solutions',
      overallThreatLevel: 'medium',
      keyTrend: 'Competitors increasingly focused on AI capabilities'
    };
  }
}

/**
 * Generate category-based summaries
 */
export async function generateCategorySummaries() {
  const signals = readJSON('signals.json');
  const competitors = readJSON('competitors.json');
  
  // Group competitors by category
  const categories = {};
  competitors.forEach(comp => {
    if (!categories[comp.category]) {
      categories[comp.category] = [];
    }
    categories[comp.category].push(comp);
  });

  const summaries = {};

  for (const [category, comps] of Object.entries(categories)) {
    // Get recent signals for this category
    const categorySignals = signals
      .filter(s => comps.some(c => c.id === s.competitorId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    const prompt = `You are analyzing the "${category}" category in manufacturing software.

COMPETITORS IN THIS CATEGORY:
${comps.map(c => `- ${c.name}: Threat ${c.threatScore}/100`).join('\n')}

RECENT SIGNALS:
${categorySignals.map(s => `- ${s.competitorName}: ${s.title}`).join('\n')}

Provide a JSON response:
{
  "keyUpdate": "One sentence: what's the most important thing happening in this category right now?",
  "whyItMatters": "One sentence: why does this matter to Tulip?",
  "recommendedAction": "One specific action Tulip should take in response"
}

Be strategic and actionable. Respond ONLY with valid JSON.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      summaries[category] = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error(`Error generating summary for ${category}:`, error);
      summaries[category] = {
        keyUpdate: `${comps.length} competitors tracked in ${category}`,
        whyItMatters: 'Maintaining competitive awareness in this segment',
        recommendedAction: 'Continue monitoring for major developments'
      };
    }
  }

  return summaries;
}

/**
 * Generate department-specific intelligence briefings
 */
export async function generateDepartmentBriefings() {
  const signals = readJSON('signals.json');
  const competitors = readJSON('competitors.json');
  
  // Get recent high-impact signals
  const recentSignals = signals
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20);

  const departments = ['product', 'sales', 'marketing', 'customer-success', 'executive'];
  const briefings = {};

  for (const dept of departments) {
    const relevantSignals = recentSignals.filter(s => 
      s.recommendedOwner === dept || 
      (dept === 'executive' && s.severity === 'high')
    );

    const prompt = `You are creating an intelligence briefing for Tulip's ${dept.replace('-', ' ')} team.

RELEVANT COMPETITIVE SIGNALS:
${relevantSignals.slice(0, 8).map(s => 
  `- ${s.competitorName}: ${s.title} (${s.severity})\n  Why it matters: ${s.whyItMatters}`
).join('\n')}

Create a briefing in JSON format:
{
  "summary": "2-3 sentence executive summary of what this team needs to know",
  "keyInsights": [
    "Most important insight #1",
    "Most important insight #2", 
    "Most important insight #3"
  ],
  "actions": [
    {
      "priority": "high/medium/low",
      "action": "Specific action item",
      "why": "Why this matters"
    }
  ],
  "competitorsToWatch": ["competitor1", "competitor2"]
}

Focus on actionable intelligence specific to this team. Respond ONLY with valid JSON.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      briefings[dept] = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error(`Error generating briefing for ${dept}:`, error);
      briefings[dept] = {
        summary: 'Competitive intelligence monitoring active',
        keyInsights: ['Tracking competitor activity', 'RSS feeds operational', 'VoC analysis available'],
        actions: [{
          priority: 'medium',
          action: 'Review latest competitive signals',
          why: 'Stay informed on market developments'
        }],
        competitorsToWatch: competitors.slice(0, 2).map(c => c.name)
      };
    }
  }

  return briefings;
}
