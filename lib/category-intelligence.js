import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { readJSON } from './storage.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory cache so we don't hammer OpenAI on every page load.
let cache = null;          // { generatedAt, data }
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const SEED_PATH = path.join(process.cwd(), 'data', 'category-insights.json');

// Map raw competitor category strings to one of 9 buckets.
export function getCategoryGroup(category) {
  const c = (category || '').toLowerCase();
  if (c.includes('vision') || c.includes('ai quality')) return 'ai_vision';
  if (c.includes('mes') || c.includes('erp')) return 'mes_erp';
  if (c.includes('connected worker') || c.includes('frontline') || c.includes('workforce') || c.includes('mobile form')) return 'connected_worker';
  if (c.includes('qms') || c.includes('quality') || c.includes('validation') || c.includes('plm')) return 'qms';
  if (c.includes('cmms') || c.includes('eam')) return 'cmms';
  if (c.includes('scada') || c.includes('ot') || c.includes('iiot') || c.includes('edge') || c.includes('industrial data') || c.includes('cloud iot')) return 'scada_ot';
  if (c.includes('analytics') || c.includes('intelligence') || c.includes('data ops') || c.includes('process')) return 'analytics';
  if (c.includes('low-code') || c.includes('platform')) return 'platform';
  return 'other';
}

function loadSeed() {
  try { return JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8')); }
  catch { return {}; }
}

/**
 * Generate category-level intelligence — what's happening + Tulip takeaways
 * for each of the 8 main category buckets. Tries OpenAI enrichment; falls back
 * to high-quality curated research baked into category-insights.json.
 */
export async function generateCategoryIntelligence({ force = false } = {}) {
  // Return cached version if fresh
  if (!force && cache && Date.now() - cache.generatedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  const competitors = readJSON('competitors.json').filter(c => c.id !== 'tulip');
  const signals = readJSON('signals.json');
  const seed = loadSeed();

  // Group competitors by bucket
  const groups = {};
  competitors.forEach(c => {
    const g = getCategoryGroup(c.category);
    if (!groups[g]) groups[g] = [];
    groups[g].push(c);
  });

  // Build base entries from seed + competitor list
  const buckets = Object.keys(seed).filter(k => groups[k] && groups[k].length > 0);

  const items = await Promise.all(buckets.map(async (key) => {
    const seedItem = seed[key];
    const comps = (groups[key] || []).sort((a, b) => (b.threatScore || 0) - (a.threatScore || 0));

    // Try to refine with AI (best effort; falls back silently on rate-limit/quota)
    let refined = null;
    try {
      refined = await tryAIRefine(key, seedItem, comps, signals);
    } catch (e) {
      console.warn(`AI refine failed for ${key}:`, e.message);
    }

    return {
      key,
      title: seedItem.title,
      summary: refined?.summary || seedItem.summary,
      happening: refined?.happening || seedItem.happening,
      takeaways: refined?.takeaways || seedItem.takeaways,
      aiEnriched: !!refined,
      competitors: comps.map(c => ({
        id: c.id,
        name: c.name,
        category: c.category,
        threatScore: c.threatScore || 0,
        priority: c.priority,
      })),
      competitorCount: comps.length,
    };
  }));

  // Stable ordering by category importance to Tulip
  const order = ['connected_worker', 'mes_erp', 'qms', 'cmms', 'scada_ot', 'analytics', 'ai_vision', 'platform'];
  items.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

  const data = {
    generatedAt: new Date().toISOString(),
    cacheTtlMinutes: CACHE_TTL_MS / 60000,
    categories: items,
    aiEnabledCount: items.filter(i => i.aiEnriched).length,
  };

  cache = { generatedAt: Date.now(), data };
  return data;
}

async function tryAIRefine(key, seedItem, comps, signals) {
  // Only top-5 competitors used in prompt to stay token-efficient
  const top = comps.slice(0, 5);
  const recentSig = signals
    .filter(s => top.some(c => c.id === s.competitorId))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 6);

  const prompt = `You are a senior competitive strategist for Tulip, a manufacturing frontline operations platform.

Refresh the strategic insights for the "${seedItem.title}" category, grounding it in the current data below.
Keep tone professional, opinionated, and actionable. Be specific about vendor moves.

Existing baseline (you may improve, not contradict):
- Summary: ${seedItem.summary}
- Happening (product/ai/sales/pricing): ${JSON.stringify(seedItem.happening)}
- Takeaways: ${seedItem.takeaways.join(' | ')}

Top vendors in this category:
${top.map(c => `- ${c.name} (${c.category}) — threat ${c.threatScore || 0}/100. Positioning: ${c.positioning || '—'}. Tulip angle: ${c.tulipRelevance || c.tulipCompetitiveAngle || '—'}`).join('\n')}

Recent signals:
${recentSig.length ? recentSig.map(s => `- ${s.competitorName}: ${s.title} (${s.severity})`).join('\n') : '(no recent signals)'}

Return ONLY a JSON object with this exact shape:
{
  "summary": "2-3 sentence executive view of what's happening in this category",
  "happening": {
    "product": "One sentence on most important product moves",
    "ai": "One sentence on AI-specific activity",
    "sales": "One sentence on sales / GTM dynamics",
    "pricing": "One sentence on pricing trends"
  },
  "takeaways": [
    "Concrete action #1 for Tulip",
    "Concrete action #2 for Tulip",
    "Concrete action #3 for Tulip"
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(completion.choices[0].message.content);
  // Basic shape validation
  if (!parsed.summary || !parsed.happening || !Array.isArray(parsed.takeaways)) return null;
  return parsed;
}
