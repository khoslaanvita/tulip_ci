import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { readJSON } from './storage.js';
import { computeThreatScore } from './strategic-insights.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DRAFTS_PATH = path.join(process.cwd(), 'data', 'email-drafts.json');

// ============================================================
// Email Agent Rules — declarative trigger → team → template
// ============================================================
const RULES = [
  {
    id: 'high-severity-signal',
    name: 'High-Severity Competitive Move',
    description: 'When any competitor has a signal tagged "high" severity in the last 14 days, alert Sales + Product Marketing.',
    trigger: 'severity:high',
    window: '14 days',
    team: 'Sales + Product Marketing',
    recipients: ['sales-leadership@tulip.co', 'product-marketing@tulip.co'],
    enabled: true,
  },
  {
    id: 'critical-watchlist-entry',
    name: 'New Critical Watchlist Entry',
    description: 'When a competitor\'s threat score crosses 70 (Critical band), alert Executive + Product leadership.',
    trigger: 'threat-score:>=70',
    window: 'rolling',
    team: 'Executive + Product',
    recipients: ['execs@tulip.co', 'product-leadership@tulip.co'],
    enabled: true,
  },
  {
    id: 'category-burst',
    name: 'Category Activity Burst',
    description: 'When a single category sees 3+ signals in 30 days, brief that team\'s lead for context-switch.',
    trigger: 'category-signal-count:>=3',
    window: '30 days',
    team: 'Product Marketing',
    recipients: ['product-marketing@tulip.co'],
    enabled: true,
  },
  {
    id: 'acquisition-news',
    name: 'Competitor Acquisition / M&A',
    description: 'Any signal mentioning "acquisition", "acquired", "M&A" → CEO + Corp Dev briefing.',
    trigger: 'keyword:acquisition',
    window: '30 days',
    team: 'Executive + Corp Dev',
    recipients: ['ceo@tulip.co', 'corp-dev@tulip.co'],
    enabled: true,
  },
  {
    id: 'ai-launch',
    name: 'Competitor AI Product Launch',
    description: 'AI-category signals with severity ≥ medium → Product + Marketing alignment.',
    trigger: 'type:AI+severity:>=medium',
    window: '21 days',
    team: 'Product + Marketing',
    recipients: ['product@tulip.co', 'marketing@tulip.co'],
    enabled: true,
  },
];

export function getEmailAgentRules() {
  return RULES;
}

// ============================================================
// Compute triggers — scan signals + competitors against rules
// ============================================================
export async function computeEmailTriggers() {
  const competitors = readJSON('competitors.json').filter(c => c.id !== 'tulip');
  const signals = readJSON('signals.json');
  const now = Date.now();

  const inWindow = (timestamp, days) => {
    if (days === 'rolling') return true;
    const ms = days * 24 * 60 * 60 * 1000;
    return now - new Date(timestamp).getTime() <= ms;
  };

  const triggers = [];

  // Rule: high-severity-signal
  signals
    .filter(s => (s.severity || '').toLowerCase() === 'high' && inWindow(s.timestamp, 14))
    .forEach(s => {
      triggers.push({
        id: `trig-${s.id}-high`,
        ruleId: 'high-severity-signal',
        ruleName: 'High-Severity Competitive Move',
        competitorId: s.competitorId,
        competitorName: s.competitorName,
        signalId: s.id,
        signalTitle: s.title,
        severity: s.severity,
        team: 'Sales + Product Marketing',
        recipients: RULES[0].recipients,
        triggeredAt: s.timestamp,
        context: s.summary,
        whyItMatters: s.whyItMatters,
        recommendedAction: s.recommendedAction,
      });
    });

  // Rule: critical-watchlist-entry (competitors with threat ≥ 70)
  competitors.forEach(c => {
    const score = computeThreatScore(c, signals);
    if (score >= 70) {
      triggers.push({
        id: `trig-${c.id}-critical`,
        ruleId: 'critical-watchlist-entry',
        ruleName: 'New Critical Watchlist Entry',
        competitorId: c.id,
        competitorName: c.name,
        threatScore: score,
        team: 'Executive + Product',
        recipients: RULES[1].recipients,
        triggeredAt: new Date().toISOString(),
        context: `${c.name} sits at threat ${score}/100. Category: ${c.category}. Tulip angle: ${c.tulipRelevance || c.tulipCompetitiveAngle || '—'}`,
        whyItMatters: c.positioning,
        recommendedAction: `Review the Tulip Battle Plan for ${c.name} and align on the next 3 actions in this account-class.`,
      });
    }
  });

  // Rule: category-burst (3+ signals in same competitor-bucket in 30d)
  const categoryGroups = {};
  signals
    .filter(s => inWindow(s.timestamp, 30))
    .forEach(s => {
      const comp = competitors.find(c => c.id === s.competitorId);
      if (!comp) return;
      const cat = (comp.category || 'other').split('/')[0].trim();
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(s);
    });
  Object.entries(categoryGroups).forEach(([cat, sigs]) => {
    if (sigs.length >= 3) {
      triggers.push({
        id: `trig-cat-${cat.replace(/[^a-z0-9]/gi, '')}`,
        ruleId: 'category-burst',
        ruleName: 'Category Activity Burst',
        category: cat,
        signalCount: sigs.length,
        team: 'Product Marketing',
        recipients: RULES[2].recipients,
        triggeredAt: sigs[0].timestamp,
        context: `${sigs.length} new signals in ${cat} in the last 30 days. Vendors: ${[...new Set(sigs.map(s => s.competitorName))].slice(0, 5).join(', ')}.`,
        whyItMatters: `Category momentum — ${cat} is heating up. Update the category battlecard and brief PMM.`,
        recommendedAction: `Refresh the ${cat} category page; circulate a 1-page briefing to PMM and AEs.`,
      });
    }
  });

  // Rule: acquisition-news
  signals
    .filter(s => inWindow(s.timestamp, 30) && /acquis|acquired|m&a/i.test(`${s.title} ${s.summary || ''}`))
    .forEach(s => {
      triggers.push({
        id: `trig-${s.id}-acq`,
        ruleId: 'acquisition-news',
        ruleName: 'Competitor Acquisition / M&A',
        competitorId: s.competitorId,
        competitorName: s.competitorName,
        signalId: s.id,
        signalTitle: s.title,
        team: 'Executive + Corp Dev',
        recipients: RULES[3].recipients,
        triggeredAt: s.timestamp,
        context: s.summary,
        whyItMatters: s.whyItMatters,
        recommendedAction: s.recommendedAction,
      });
    });

  // Rule: ai-launch (AI signalType with severity medium/high)
  signals
    .filter(s => (s.signalType || '').toLowerCase() === 'ai' && /(medium|high)/i.test(s.severity || '') && inWindow(s.timestamp, 21))
    .forEach(s => {
      triggers.push({
        id: `trig-${s.id}-ai`,
        ruleId: 'ai-launch',
        ruleName: 'Competitor AI Product Launch',
        competitorId: s.competitorId,
        competitorName: s.competitorName,
        signalId: s.id,
        signalTitle: s.title,
        team: 'Product + Marketing',
        recipients: RULES[4].recipients,
        triggeredAt: s.timestamp,
        context: s.summary,
        whyItMatters: s.whyItMatters,
        recommendedAction: s.recommendedAction,
      });
    });

  // Sort newest first
  triggers.sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt));

  return {
    generatedAt: new Date().toISOString(),
    totalTriggers: triggers.length,
    byRule: triggers.reduce((acc, t) => { acc[t.ruleId] = (acc[t.ruleId] || 0) + 1; return acc; }, {}),
    triggers,
  };
}

// ============================================================
// Generate AI-drafted email for a specific trigger
// ============================================================
export async function generateEmailDraft(triggerId) {
  const { triggers } = await computeEmailTriggers();
  const trigger = triggers.find(t => t.id === triggerId);
  if (!trigger) throw new Error('Trigger not found');

  let subject = `[Tulip Comp Intel] ${trigger.ruleName}: ${trigger.competitorName || trigger.category || 'Update'}`;
  let body = '';

  // Try AI generation
  try {
    const prompt = `You are drafting an internal email for Tulip's ${trigger.team} team about a competitive intelligence trigger.

Trigger: ${trigger.ruleName}
${trigger.competitorName ? `Competitor: ${trigger.competitorName}` : ''}
${trigger.category ? `Category: ${trigger.category}` : ''}
${trigger.signalTitle ? `Headline: ${trigger.signalTitle}` : ''}
${trigger.threatScore ? `Threat Score: ${trigger.threatScore}/100` : ''}

Context: ${trigger.context}

Why it matters: ${trigger.whyItMatters || '—'}
Recommended action: ${trigger.recommendedAction || '—'}

Write a concise internal email (max ~150 words) with:
- A clear subject line (start with "[Tulip Comp Intel]")
- A 2-3 sentence opener summarising what's happening
- 3 bullet points of "What this means for Tulip"
- 2-3 bullet points of "Recommended actions" (specific, owned)
- A sign-off from "Competitive Intelligence Agent"

Return ONLY a JSON object: { "subject": "...", "body": "..." }
Use plain text in body (newlines, bullets with •).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });
    const parsed = JSON.parse(completion.choices[0].message.content);
    if (parsed.subject && parsed.body) {
      subject = parsed.subject;
      body = parsed.body;
    }
  } catch (e) {
    console.warn('Email draft AI fallback:', e.message);
  }

  // Fallback template
  if (!body) {
    body = `Team,

A competitive intelligence trigger has fired for your team.

${trigger.competitorName ? `Competitor: ${trigger.competitorName}` : ''}${trigger.category ? `Category: ${trigger.category}` : ''}
${trigger.signalTitle ? `Headline: ${trigger.signalTitle}` : ''}

What's happening:
${trigger.context || '—'}

Why this matters:
${trigger.whyItMatters || '—'}

Recommended action:
${trigger.recommendedAction || '—'}

— Competitive Intelligence Agent
Auto-generated · Tulip Comp Intel Command Center`;
  }

  const draft = {
    id: `draft-${Date.now()}`,
    triggerId,
    ruleId: trigger.ruleId,
    ruleName: trigger.ruleName,
    recipients: trigger.recipients,
    team: trigger.team,
    subject,
    body,
    generatedAt: new Date().toISOString(),
  };

  return draft;
}

// ============================================================
// Persist a draft (after user clicks "save")
// ============================================================
export function saveEmailDraft(draft) {
  let drafts = [];
  try { drafts = JSON.parse(fs.readFileSync(DRAFTS_PATH, 'utf-8')); } catch {}
  const next = { ...draft, savedAt: new Date().toISOString() };
  drafts.unshift(next);
  drafts = drafts.slice(0, 50); // keep last 50
  fs.writeFileSync(DRAFTS_PATH, JSON.stringify(drafts, null, 2));
  return next;
}

export function getRecentEmailDrafts() {
  try { return JSON.parse(fs.readFileSync(DRAFTS_PATH, 'utf-8')); }
  catch { return []; }
}
