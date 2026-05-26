import OpenAI from 'openai';
import { readJSON } from './storage.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Derive a meaningful 0-100 threat score for a competitor.
 * Combines: priority weight, revenue scale, recent signal activity, category overlap.
 */
export function computeThreatScore(competitor, signals = []) {
  let score = 0;

  // Priority weight (base)
  const p = (competitor.priority || '').toLowerCase();
  if (p === 'high') score += 55;
  else if (p === 'medium') score += 35;
  else if (p === 'low') score += 15;
  else score += 25;

  // Revenue scale -> proxy for market power
  const rev = (competitor.revenue || '').toString();
  const billion = /\$\s*\d+\s*B/i.test(rev);
  const hundredsM = /\$\s*\d{3}\s*M/i.test(rev);
  const millions = /\$\s*\d+\s*M/i.test(rev);
  if (billion) score += 20;
  else if (hundredsM) score += 14;
  else if (millions) score += 8;

  // Category overlap with Tulip core (frontline operations, MES, connected worker)
  const cat = (competitor.category || '').toLowerCase();
  if (/connected worker|mes/.test(cat) && !cat.includes('erp')) score += 12;
  else if (/mes|erp|qms|cmms/.test(cat)) score += 7;

  // Recent signal activity (last 30 days)
  const thirty = new Date();
  thirty.setDate(thirty.getDate() - 30);
  const recent = signals.filter(s => s.competitorId === competitor.id && new Date(s.timestamp) > thirty);
  const highSev = recent.filter(s => (s.severity || '').toLowerCase() === 'high').length;
  const medSev  = recent.filter(s => (s.severity || '').toLowerCase() === 'medium').length;
  score += Math.min(20, highSev * 6 + medSev * 3 + recent.length);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getThreatBand(score) {
  if (score >= 70) return { band: 'critical', label: 'Critical', tone: 'red' };
  if (score >= 50) return { band: 'high',     label: 'High',     tone: 'amber' };
  if (score >= 30) return { band: 'medium',   label: 'Medium',   tone: 'slate' };
  return                  { band: 'low',      label: 'Low',      tone: 'green' };
}

/**
 * Build a strategic insights summary — top 3 most strategically threatening
 * or opportunistic competitor moves with concrete actions for Tulip.
 *
 * Uses OpenAI when available, otherwise falls back to high-quality
 * rule-based insights computed from competitor + signal data.
 */
export async function generateStrategicInsights() {
  const competitors = readJSON('competitors.json').filter(c => c.id !== 'tulip');
  const signals = readJSON('signals.json');

  // Rank competitors by computed threat score
  const ranked = competitors
    .map(c => ({ ...c, _score: computeThreatScore(c, signals) }))
    .sort((a, b) => b._score - a._score);

  const top3 = ranked.slice(0, 3);

  // Attempt AI enhancement
  let aiInsights = null;
  try {
    aiInsights = await tryAIEnhancement(top3, signals);
  } catch (err) {
    console.warn('Strategic Insights AI fallback:', err.message);
  }

  const insights = top3.map((c, idx) => {
    const ai = aiInsights?.[idx];
    return {
      rank: idx + 1,
      competitorId: c.id,
      competitorName: c.name,
      category: c.category,
      threatScore: c._score,
      band: getThreatBand(c._score),
      // Strategic narrative
      headline: ai?.headline || deriveHeadline(c),
      whyItMatters: ai?.whyItMatters || deriveWhyItMatters(c),
      // Concrete Tulip action
      action: ai?.action || deriveAction(c),
      actionOwner: ai?.actionOwner || deriveOwner(c),
      timeframe: ai?.timeframe || 'Next 30 days',
      tulipAdvantage: ai?.tulipAdvantage || deriveTulipAdvantage(c),
    };
  });

  // Compute overall posture
  const avgScore = ranked.length ? Math.round(ranked.reduce((s, c) => s + c._score, 0) / ranked.length) : 0;
  const highThreatCount = ranked.filter(c => c._score >= 70).length;
  const posture = highThreatCount >= 3 ? 'Defensive — multiple high-threat fronts'
                : highThreatCount >= 1 ? 'Active — defend & differentiate'
                : 'Strong — press the advantage';

  return {
    generatedAt: new Date().toISOString(),
    aiEnabled: !!aiInsights,
    insights,
    posture,
    averageThreatScore: avgScore,
    highThreatCount,
    totalTracked: competitors.length,
  };
}

// ---------------- helpers ----------------

function deriveHeadline(c) {
  const angle = c.tulipRelevance || c.tulipCompetitiveAngle || '';
  if (angle) {
    const first = angle.split(/[.!?]/)[0].trim();
    return first.length > 12 ? first : `${c.name} pressures Tulip in ${c.category}`;
  }
  return `${c.name} is strengthening its position in ${c.category}`;
}

function deriveWhyItMatters(c) {
  const rev = c.revenue ? `Revenue ${c.revenue}.` : '';
  const cat = c.category || 'this category';
  const weakness = (c.weaknesses && c.weaknesses[0]) || '';
  const strength = (c.strengths && c.strengths[0]) || '';
  if (strength && weakness) {
    return `Strong in ${cat.toLowerCase()} with "${strength.toLowerCase()}", yet weak on "${weakness.toLowerCase()}" — that gap is where Tulip wins. ${rev}`.trim();
  }
  return c.positioning || `Active competitor with overlap into Tulip's frontline operations footprint. ${rev}`.trim();
}

function deriveAction(c) {
  const cat = (c.category || '').toLowerCase();
  const angle = c.tulipRelevance || c.tulipCompetitiveAngle || '';
  if (/connected worker/.test(cat)) {
    return `Run win/loss reviews on the last 5 Tulip vs ${c.name} deals; tighten the "composable apps + speed-to-value" message in mid-market discovery.`;
  }
  if (/mes|erp/.test(cat)) {
    return `Refresh the ${c.name} battlecard with the "fast plant-floor app layer, no rip-and-replace" positioning; arm AEs with a 90-day pilot ROI proof.`;
  }
  if (/qms|quality/.test(cat)) {
    return `Publish a co-existence brief showing where Tulip executes shop-floor workflows and ${c.name} owns compliance records — protect the deal, expand the footprint.`;
  }
  if (/cmms|eam/.test(cat)) {
    return `Position Tulip as the operator-facing app layer above ${c.name}; ship integration content + sales play for asset-heavy verticals.`;
  }
  if (/scada|ot|edge|iiot/.test(cat)) {
    return `Move the conversation from data infrastructure to workflow outcomes. Build a partner motion with ${c.name} where it makes sense, compete where it doesn't.`;
  }
  if (/analytics|intelligence/.test(cat)) {
    return `Lead with "from insight to action" — show Tulip apps closing the loop on ${c.name}'s analytics in operator hands.`;
  }
  if (/vision|ai quality/.test(cat)) {
    return `Frame Tulip as the workflow layer around vision/AI inspection. Co-sell where possible, displace where customer wants one platform.`;
  }
  return `Sharpen Tulip vs ${c.name} differentiation in current pipeline; prioritise the 3 most exposed accounts for executive engagement.`;
}

function deriveOwner(c) {
  const cat = (c.category || '').toLowerCase();
  if (/connected worker|frontline/.test(cat)) return 'Sales + Product Marketing';
  if (/mes|erp/.test(cat)) return 'Sales Leadership';
  if (/qms|quality/.test(cat)) return 'Customer Success + Product';
  if (/cmms|eam/.test(cat)) return 'Product + Partner';
  if (/scada|ot|edge/.test(cat)) return 'Partnerships + Product';
  if (/analytics|intelligence/.test(cat)) return 'Product Marketing';
  if (/vision|ai/.test(cat)) return 'Product + AI Team';
  return 'Competitive Intel + Sales';
}

function deriveTulipAdvantage(c) {
  const weaknesses = c.weaknesses || [];
  if (weaknesses.length > 0) {
    return `Tulip counters with: ${weaknesses.slice(0, 2).map(w => w.toLowerCase().replace(/\.$/, '')).join('; ')}.`;
  }
  return 'Tulip wins on composability, speed-to-value, and frontline operator usability.';
}

async function tryAIEnhancement(top3, signals) {
  const prompt = `You are a senior competitive strategist for Tulip, a manufacturing frontline operations platform.

For each of these 3 most-threatening competitors, write a tight strategic insight.
Return ONLY a JSON object with key "insights" mapped to an array of exactly 3 items in the same order, each with:
{
  "headline": "One punchy sentence describing the strategic move/threat",
  "whyItMatters": "Two sentences. Specific. Mention category dynamics or recent signals.",
  "action": "One specific action Tulip should take in the next 30 days",
  "actionOwner": "Sales | Product | Marketing | Customer Success | Partnerships",
  "timeframe": "Immediate | 30 days | Quarter",
  "tulipAdvantage": "One sentence describing where Tulip wins vs this competitor"
}

Competitors (ranked by threat):
${top3.map((c, i) => `
${i + 1}. ${c.name} (${c.category}) - threat ${c._score}/100
   Positioning: ${c.positioning || '—'}
   Tulip angle: ${c.tulipRelevance || c.tulipCompetitiveAngle || '—'}
   Strengths: ${(c.strengths || []).slice(0, 2).join('; ')}
   Weaknesses: ${(c.weaknesses || []).slice(0, 2).join('; ')}
`).join('')}

Be sharp, opinionated, and CEO-grade.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(completion.choices[0].message.content);
  return Array.isArray(parsed.insights) ? parsed.insights : null;
}
