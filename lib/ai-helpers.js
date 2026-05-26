import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.EMERGENT_LLM_KEY || 'unset',
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeSignalWithAI(signalText, competitorContext) {
  const prompt = `You are a competitive intelligence analyst for Tulip, a manufacturing software platform.

Analyze the following competitive signal and provide a structured assessment:

COMPETITOR CONTEXT:
${competitorContext}

SIGNAL:
${signalText}

Provide your analysis as a JSON object with these exact keys:
{
  "title": "Brief descriptive title for this signal",
  "summary": "2-3 sentence summary of what this signal means",
  "signalType": "one of: product, pricing, AI, fundraising, hiring, customer, analyst, gtm, other",
  "whyItMatters": "Why this matters to Tulip specifically (2-3 sentences)",
  "recommendedAction": "Specific recommended action for Tulip team",
  "severity": "one of: low, medium, high",
  "recommendedOwner": "one of: sales, product, marketing, exec, customer-success, partnerships"
}`;

  // Try OpenAI first (our default provider)
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    const parsed = JSON.parse(completion.choices[0].message.content);
    if (parsed && parsed.title && parsed.summary) return parsed;
  } catch (err) {
    console.warn('analyzeSignalWithAI: OpenAI failed, will try fallback:', err.message);
  }

  // Deterministic fallback so the user can always add a signal manually
  const firstSentence = (signalText || '').split(/[.!?]/)[0].trim();
  const title = firstSentence.length > 0
    ? firstSentence.slice(0, 100)
    : 'Manual competitive signal';
  const lower = (signalText || '').toLowerCase();
  let signalType = 'other';
  if (/ai\b|copilot|llm|gen ai|machine learning/.test(lower)) signalType = 'AI';
  else if (/launch|release|ships|gA|version|product/.test(lower)) signalType = 'product';
  else if (/price|pricing|tier/.test(lower)) signalType = 'pricing';
  else if (/raise|series|funded|funding|valuation/.test(lower)) signalType = 'fundraising';
  else if (/hire|hiring|joined|cto|ceo|cmo|vp/.test(lower)) signalType = 'hiring';
  else if (/won|customer|deal|signed/.test(lower)) signalType = 'customer';
  else if (/analyst|gartner|forrester|idc/.test(lower)) signalType = 'analyst';
  else if (/marketing|campaign|webinar|launch event/.test(lower)) signalType = 'gtm';

  let severity = 'medium';
  if (/launch|major|landmark|breakthrough|acquire|acquisition/.test(lower)) severity = 'high';
  else if (/minor|blog|small|update/.test(lower)) severity = 'low';

  return {
    title,
    summary: signalText && signalText.length > 30
      ? `${signalText.slice(0, 220)}${signalText.length > 220 ? '…' : ''}`
      : `New signal logged: ${title}`,
    signalType,
    whyItMatters: `This signal is logged manually. Review and update with Tulip-specific implications.`,
    recommendedAction: `Triage with the Competitive Intelligence team. Update the Tulip vs ${competitorContext.match(/Name: ([^\n]+)/)?.[1] || 'competitor'} battlecard if relevant.`,
    severity,
    recommendedOwner: signalType === 'AI' || signalType === 'product' ? 'product' :
                      signalType === 'pricing' || signalType === 'customer' ? 'sales' :
                      signalType === 'hiring' || signalType === 'fundraising' ? 'exec' : 'marketing',
  };
}

export async function generateBattlecardWithAI(competitor, recentSignals) {
  const signalsSummary = recentSignals.map(s => 
    `- ${s.title} (${s.signalType}, ${s.severity} severity)`
  ).join('\n');

  const prompt = `You are a sales enablement expert creating a competitive battlecard for Tulip's sales team.

COMPETITOR: ${competitor.name}
CATEGORY: ${competitor.category}

COMPETITOR PROFILE:
Positioning: ${competitor.positioning}

Strengths:
${competitor.strengths.map(s => `- ${s}`).join('\n')}

Weaknesses:
${competitor.weaknesses.map(s => `- ${s}`).join('\n')}

Pricing: ${competitor.pricingNotes}

AI Claims: ${competitor.aiClaims}

RECENT COMPETITIVE SIGNALS:
${signalsSummary || 'No recent signals'}

Create a comprehensive sales battlecard in the following JSON format:
{
  "whenTheyAppear": "Description of when/where this competitor typically appears in deals",
  "theirPositioning": "How they position themselves in the market",
  "whereTulipWins": "Key areas where Tulip has advantages (2-3 sentences)",
  "likelyObjections": ["Array of 3-5 objections prospects might raise"],
  "salesResponse": "Recommended response to handle these objections (2-3 sentences)",
  "discoveryQuestions": ["Array of 5-7 questions to ask prospects to position Tulip favorably"],
  "productImplications": "What product team should consider based on this competition",
  "marketingImplications": "What marketing team should consider based on this competition"
}

Respond ONLY with valid JSON, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const battlecard = JSON.parse(message.content[0].text);
    return battlecard;
  } catch (error) {
    console.error('Error generating battlecard with AI:', error);
    
    // Fallback to intelligent mock battlecard
    return {
      whenTheyAppear: `${competitor.name} typically appears in ${competitor.category} evaluations, particularly in deals where customers are focused on ${competitor.positioning.substring(0, 100)}... They often enter through functional teams evaluating specialized solutions.`,
      theirPositioning: competitor.positioning,
      whereTulipWins: `Tulip wins by offering a comprehensive platform approach that goes beyond ${competitor.category}. While ${competitor.name} focuses on their specific niche, Tulip provides end-to-end shop floor digitization including machine connectivity, quality management, analytics, and custom app building. This prevents customers from needing multiple point solutions.`,
      likelyObjections: [
        `"${competitor.name} specializes in our specific industry"`,
        `"They seem more focused on ${competitor.category} than Tulip"`,
        `"Their pricing appears more straightforward"`,
        `"We've heard good things about their ${competitor.category} capabilities"`,
        `"Tulip seems like it might be overkill for our needs"`
      ],
      salesResponse: `Acknowledge ${competitor.name}'s strengths in ${competitor.category}, then expand the conversation to other manufacturing challenges beyond their core focus. Position Tulip as a platform that starts with their needs but scales to address broader shop floor requirements, avoiding the complexity and cost of multiple disconnected systems. Reference customers who started focused and expanded their use cases.`,
      discoveryQuestions: [
        `Beyond ${competitor.category}, what other shop floor challenges are you trying to solve?`,
        `How important is it to have a unified platform vs multiple point solutions?`,
        `Who else in your organization has requirements for shop floor digitization?`,
        `How do you plan to scale your digital transformation over the next 2-3 years?`,
        `What's your strategy for connecting machines and collecting real-time production data?`,
        `How important is flexibility to customize workflows as your needs evolve?`,
        `What's your experience with platforms that require IT/OT specialists vs engineer-friendly tools?`
      ],
      productImplications: `Continue strengthening ${competitor.category} capabilities to match ${competitor.name}'s specialized features. Highlight platform advantages and ease of expansion. Consider industry-specific templates or starter packs that demonstrate quick value.`,
      marketingImplications: `Develop content comparing platform vs point solution approaches. Create customer stories showing evolution from single use case to comprehensive adoption. Build competitive comparison content emphasizing Tulip's broader value proposition and lower TCO over time.`
    };
  }
}

export async function generateEmailAlert(signal, battlecardLink) {
  const subject = `Competitive Alert: ${signal.competitorName} - ${signal.signalType}`;
  
  const body = `Hi team,

We've detected a ${signal.severity.toUpperCase()} priority competitive signal:

🎯 COMPETITOR: ${signal.competitorName}
📊 SIGNAL TYPE: ${signal.signalType}
📅 DETECTED: ${new Date(signal.timestamp).toLocaleDateString()}

📰 WHAT CHANGED:
${signal.summary}

💡 WHY IT MATTERS TO TULIP:
${signal.whyItMatters}

✅ RECOMMENDED ACTION:
${signal.recommendedAction}

👤 SUGGESTED OWNER: ${signal.recommendedOwner}

🔗 View full battlecard: ${battlecardLink}
🔗 View in dashboard: ${process.env.NEXT_PUBLIC_BASE_URL}/signals

---
This alert was generated by the Tulip Competitive Intelligence Command Center.
`;

  return { subject, body };
}