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
 * Cached for 2 hours; falls back to real data-driven briefings if AI fails.
 */
let _briefingCache = null;
const _BRIEFING_TTL_MS = 2 * 60 * 60 * 1000;

export async function generateDepartmentBriefings({ force = false } = {}) {
  if (!force && _briefingCache && Date.now() - _briefingCache.t < _BRIEFING_TTL_MS) {
    return _briefingCache.data;
  }

  const signals = readJSON('signals.json');
  const competitors = readJSON('competitors.json').filter(c => c.id !== 'tulip');

  // Get recent high-impact signals
  const recentSignals = signals
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 25);

  // Top competitors by computed threat score
  const sortedComps = [...competitors]
    .map(c => ({ ...c, _threat: c.threatScore || 0 }))
    .sort((a, b) => b._threat - a._threat);

  const departments = ['product', 'sales', 'marketing', 'customer-success', 'executive'];
  const briefings = {};

  for (const dept of departments) {
    // Department-relevant signals (matched by recommendedOwner or executive=high-sev)
    const relevantSignals = recentSignals.filter(s =>
      s.recommendedOwner === dept ||
      (dept === 'executive' && (s.severity || '').toLowerCase() === 'high')
    );

    const prompt = `You are creating an intelligence briefing for Tulip's ${dept.replace('-', ' ')} team.

RELEVANT COMPETITIVE SIGNALS:
${relevantSignals.slice(0, 8).map(s =>
  `- ${s.competitorName}: ${s.title} (${s.severity})\n  Why it matters: ${s.whyItMatters}`
).join('\n')}

TOP COMPETITORS BY THREAT:
${sortedComps.slice(0, 5).map(c => `- ${c.name} (${c.category}, threat ${c._threat}/100)`).join('\n')}

Create a briefing in JSON format with REAL specifics tied to the signals above:
{
  "summary": "2-3 sentence executive summary tied to actual competitor names from the signals",
  "keyInsights": [
    "Most important insight #1 referencing a specific competitor or category",
    "Most important insight #2 referencing a specific competitor or category",
    "Most important insight #3 referencing a specific competitor or category"
  ],
  "actions": [
    {
      "priority": "high|medium|low",
      "action": "Specific action item with a competitor or category name",
      "why": "Why this matters in 1 sentence"
    }
  ],
  "competitorsToWatch": ["actual competitor name 1", "actual competitor name 2"]
}

Use real names from the signals — never use placeholders like "competitor1". Respond ONLY with valid JSON.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
      const parsed = JSON.parse(completion.choices[0].message.content);
      if (parsed && parsed.summary && Array.isArray(parsed.keyInsights)) {
        briefings[dept] = { ...parsed, aiEnabled: true };
        continue;
      }
    } catch (error) {
      console.warn(`Briefing AI fallback for ${dept}:`, error.message);
    }

    // ---- Real data-driven fallback (no dummy text) ----
    briefings[dept] = buildBriefingFromSignals(dept, relevantSignals, sortedComps);
  }

  const data = {
    generatedAt: new Date().toISOString(),
    ttlMinutes: _BRIEFING_TTL_MS / 60000,
    departments: briefings,
    aiEnabledCount: Object.values(briefings).filter(b => b.aiEnabled).length,
    // also expose the per-dept keys directly for backward compat
    ...briefings,
  };
  _briefingCache = { t: Date.now(), data };
  return data;
}

function buildBriefingFromSignals(dept, deptSignals, sortedComps) {
  const top3 = (deptSignals.length > 0 ? deptSignals : []).slice(0, 3);
  const topComps = sortedComps.slice(0, 3);

  const focus = {
    'product': {
      headline: 'product roadmap & AI capabilities',
      verb: 'evaluate', noun: 'product gap',
    },
    'sales': {
      headline: 'pipeline defense & deal positioning',
      verb: 'refresh', noun: 'battlecard',
    },
    'marketing': {
      headline: 'category narrative & competitive positioning',
      verb: 'ship', noun: 'counter-positioning content',
    },
    'customer-success': {
      headline: 'expansion risks & retention',
      verb: 'reach out to', noun: 'at-risk account',
    },
    'executive': {
      headline: 'strategic threats & market posture',
      verb: 'review', noun: 'critical watchlist entry',
    },
  }[dept] || { headline: 'competitive activity', verb: 'review', noun: 'signal' };

  const summary = top3.length > 0
    ? `${top3.length} recent ${dept.replace('-', ' ')}-relevant moves: ${top3.map(s => s.competitorName).join(', ')}. Focus this week is on ${focus.headline}.`
    : `No new ${dept.replace('-', ' ')}-tagged signals in the last cycle. The ${topComps.length > 0 ? topComps.map(c => c.name).slice(0,2).join(' and ') : 'critical watchlist'} remain the priority for ${focus.headline}.`;

  const keyInsights = top3.length > 0
    ? top3.map(s => `${s.competitorName}: ${s.title}${s.whyItMatters ? ' — ' + s.whyItMatters.split('.')[0] : ''}`)
    : topComps.slice(0, 3).map(c => `${c.name} (threat ${c._threat}/100) — ${(c.tulipRelevance || c.positioning || '').split('.')[0]}`);

  const actions = top3.length > 0
    ? top3.map((s, i) => ({
        priority: (s.severity === 'high' ? 'high' : i === 0 ? 'high' : 'medium'),
        action: s.recommendedAction || `${focus.verb.charAt(0).toUpperCase() + focus.verb.slice(1)} ${focus.noun} for ${s.competitorName}`,
        why: s.whyItMatters || `Direct ${dept.replace('-', ' ')} relevance for ${s.competitorName} in ${focus.headline}`,
      }))
    : topComps.slice(0, 2).map((c, i) => ({
        priority: (c._threat >= 70 ? 'high' : 'medium'),
        action: `${focus.verb.charAt(0).toUpperCase() + focus.verb.slice(1)} ${focus.noun} for ${c.name}`,
        why: c.tulipRelevance || c.positioning || `Top-${i + 1} threat in tracked competitor set`,
      }));

  return {
    summary,
    keyInsights: keyInsights.slice(0, 3),
    actions,
    competitorsToWatch: (top3.length > 0 ? top3 : topComps).slice(0, 3).map(x => x.competitorName || x.name),
    aiEnabled: false,
  };
}
