import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON, appendToJSON, updateInJSON } from '@/lib/storage';
import { analyzeSignalWithAI, generateBattlecardWithAI, generateEmailAlert } from '@/lib/ai-helpers';
import { startScheduler, getSchedulerStatus } from '@/lib/agent-scheduler';
import { generateComprehensiveVoCInsights, getVoCStats } from '@/lib/voc-agent-enhanced';
import { generateMarketSummary, generateCategorySummaries, generateDepartmentBriefings } from '@/lib/intelligence-agent';
import { migrateCustomerTranscripts } from '@/lib/db-operations';
import { generateCompetitorThreatsOpportunities, getRecentCompetitorNews } from '@/lib/competitor-analysis';
import { generateStrategicInsights, computeThreatScore } from '@/lib/strategic-insights';
import { generateCategoryIntelligence } from '@/lib/category-intelligence';
import { computeEmailTriggers, generateEmailDraft, getEmailAgentRules, getRecentEmailDrafts, saveEmailDraft } from '@/lib/email-agent';
import fs from 'fs';
import path from 'path';

const TULIP_PROFILE_PATH = path.join(process.cwd(), 'data', 'tulip-profile.json');

// Start the background scheduler when the API loads
if (typeof window === 'undefined') { // Server-side only
  startScheduler();
  // Migrate customer transcripts to MongoDB on startup
  migrateCustomerTranscripts().catch(console.error);
}

export async function GET(request) {
  const { pathname, searchParams } = new URL(request.url);
  const path = pathname.replace('/api', '') || '/';

  try {
    // Root API endpoint
    if (path === '/' || path === '') {
      return NextResponse.json({ 
        message: 'Tulip Competitive Intelligence API',
        version: '1.0.0'
      });
    }

    // GET /api/competitors - List all competitors
    if (path === '/competitors') {
      const competitors = readJSON('competitors.json');
      const signals = readJSON('signals.json');
      
      // Enrich with latest signal info and computed threat score
      const enriched = competitors.map(comp => {
        const compSignals = signals.filter(s => s.competitorId === comp.id)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const latestSignal = compSignals[0];
        const dynamicScore = computeThreatScore(comp, signals);
        
        return {
          ...comp,
          threatScore: dynamicScore,
          latestSignal: latestSignal ? {
            title: latestSignal.title,
            type: latestSignal.signalType,
            severity: latestSignal.severity,
            timestamp: latestSignal.timestamp
          } : null
        };
      });
      
      // Sort by threat score (highest first) so dashboard surfaces the most relevant
      enriched.sort((a, b) => (b.threatScore || 0) - (a.threatScore || 0));
      return NextResponse.json(enriched);
    }

    // GET /api/competitors/:id - Get single competitor
    if (path.startsWith('/competitors/')) {
      const id = path.split('/')[2];
      const competitors = readJSON('competitors.json');
      const signals = readJSON('signals.json');
      
      const competitor = competitors.find(c => c.id === id);
      if (!competitor) {
        return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });
      }
      
      const competitorSignals = signals
        .filter(s => s.competitorId === id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return NextResponse.json({
        ...competitor,
        recentSignals: competitorSignals.slice(0, 10)
      });
    }

    // GET /api/signals - List all signals with optional filters
    if (path === '/signals') {
      const signals = readJSON('signals.json');
      const competitorId = searchParams.get('competitorId');
      const severity = searchParams.get('severity');
      const signalType = searchParams.get('signalType');
      
      let filtered = signals;
      
      if (competitorId) {
        filtered = filtered.filter(s => s.competitorId === competitorId);
      }
      if (severity) {
        filtered = filtered.filter(s => s.severity === severity);
      }
      if (signalType) {
        filtered = filtered.filter(s => s.signalType === signalType);
      }
      
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return NextResponse.json(filtered);
    }

    // GET /api/battlecards - List all battlecards
    if (path === '/battlecards') {
      const battlecards = readJSON('battlecards.json');
      return NextResponse.json(battlecards);
    }

    // GET /api/battlecards/:competitorId - Get battlecard for competitor
    if (path.startsWith('/battlecards/')) {
      const competitorId = path.split('/')[2];
      const battlecards = readJSON('battlecards.json');
      const battlecard = battlecards.find(b => b.competitorId === competitorId);
      
      if (!battlecard) {
        return NextResponse.json({ error: 'Battlecard not found' }, { status: 404 });
      }
      
      return NextResponse.json(battlecard);
    }

    // GET /api/activity-log - Get agent activity log
    if (path === '/activity-log') {
      const log = readJSON('activity-log.json');
      log.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return NextResponse.json(log);
    }

    // GET /api/scheduler/status - Get scheduler status
    if (path === '/scheduler/status') {
      const status = getSchedulerStatus();
      return NextResponse.json(status);
    }

    // GET /api/voc/stats - Get Voice of Customer statistics
    if (path === '/voc/stats') {
      const stats = await getVoCStats();
      return NextResponse.json(stats);
    }

    // GET /api/voc/:competitorId - Get comprehensive VoC insights for a specific competitor
    if (path.startsWith('/voc/')) {
      const competitorId = path.split('/')[2];
      if (!competitorId) {
        return NextResponse.json({ error: 'Competitor ID required' }, { status: 400 });
      }
      
      try {
        const insights = await generateComprehensiveVoCInsights(competitorId);
        return NextResponse.json(insights);
      } catch (error) {
        console.error('VoC analysis error:', error);
        return NextResponse.json({ 
          error: 'Failed to analyze customer conversations',
          message: error.message 
        }, { status: 500 });
      }
    }

    // GET /api/intelligence/market-summary - Get market intelligence summary
    if (path === '/intelligence/market-summary') {
      const summary = await generateMarketSummary();
      return NextResponse.json(summary);
    }

    // GET /api/intelligence/strategic-insights - Top-3 strategic insights w/ actions
    if (path === '/intelligence/strategic-insights') {
      const insights = await generateStrategicInsights();
      return NextResponse.json(insights);
    }

    // GET /api/intelligence/category-intelligence - Category-grouped insights with Tulip takeaways
    if (path === '/intelligence/category-intelligence') {
      const force = searchParams.get('force') === '1';
      const data = await generateCategoryIntelligence({ force });
      return NextResponse.json(data);
    }

    // GET /api/tulip-profile - Tulip's own self-reported company data (editable)
    if (path === '/tulip-profile') {
      try {
        const profile = JSON.parse(fs.readFileSync(TULIP_PROFILE_PATH, 'utf-8'));
        return NextResponse.json(profile);
      } catch {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
    }

    // GET /api/email-agents/rules - List configured email-agent rules
    if (path === '/email-agents/rules') {
      return NextResponse.json({ rules: getEmailAgentRules() });
    }

    // GET /api/email-agents/triggers - Compute which rules have triggered recently
    if (path === '/email-agents/triggers') {
      const triggers = await computeEmailTriggers();
      return NextResponse.json(triggers);
    }

    // GET /api/email-agents/drafts - List recent email drafts
    if (path === '/email-agents/drafts') {
      return NextResponse.json({ drafts: getRecentEmailDrafts() });
    }

    // GET /api/intelligence/categories - Get category summaries
    if (path === '/intelligence/categories') {
      const summaries = await generateCategorySummaries();
      return NextResponse.json(summaries);
    }

    // GET /api/intelligence/briefings - Get department briefings
    if (path === '/intelligence/briefings') {
      const briefings = await generateDepartmentBriefings();
      return NextResponse.json(briefings);
    }

    // GET /api/competitor/:id/analysis - Get threats & opportunities analysis
    if (path.startsWith('/competitor/') && path.endsWith('/analysis')) {
      const competitorId = path.split('/')[2];
      try {
        const analysis = await generateCompetitorThreatsOpportunities(competitorId);
        return NextResponse.json(analysis);
      } catch (error) {
        console.error('Competitor analysis error:', error);
        return NextResponse.json({ 
          error: 'Failed to analyze competitor',
          message: error.message 
        }, { status: 500 });
      }
    }

    // GET /api/competitor/:id/recent-news - Get recent news for competitor
    if (path.startsWith('/competitor/') && path.endsWith('/recent-news')) {
      const competitorId = path.split('/')[2];
      const news = getRecentCompetitorNews(competitorId, 5);
      return NextResponse.json(news);
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api', '') || '/';

  try {
    const body = await request.json();

    // POST /api/tulip-profile - Update Tulip's self-reported metrics (revenue, etc.)
    if (path === '/tulip-profile') {
      let profile = {};
      try { profile = JSON.parse(fs.readFileSync(TULIP_PROFILE_PATH, 'utf-8')); } catch {}
      const allowed = ['revenue', 'employees', 'funding', 'valuation', 'positioning', 'verticalFocus', 'geography'];
      const update = {};
      allowed.forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
      const next = { ...profile, ...update, lastUpdated: new Date().toISOString() };
      fs.writeFileSync(TULIP_PROFILE_PATH, JSON.stringify(next, null, 2));
      return NextResponse.json(next);
    }

    // POST /api/email-agents/draft - Persist a generated draft (after user reviews)
    if (path === '/email-agents/draft') {
      const draft = saveEmailDraft(body);
      return NextResponse.json(draft);
    }

    // POST /api/email-agents/generate - Generate an AI-drafted email for a trigger
    if (path === '/email-agents/generate') {
      const { triggerId } = body;
      if (!triggerId) return NextResponse.json({ error: 'triggerId required' }, { status: 400 });
      const draft = await generateEmailDraft(triggerId);
      return NextResponse.json(draft);
    }

    // POST /api/agents/run - Manually trigger an agent so its timestamp refreshes
    if (path === '/agents/run') {
      const { agentKey } = body;
      if (!agentKey) return NextResponse.json({ error: 'agentKey required' }, { status: 400 });

      const result = { agentKey, ranAt: new Date().toISOString(), output: 'ok' };

      try {
        switch (agentKey) {
          case 'Market Monitor': {
            const { startScheduler: _s, runAgentsNow } = await import('@/lib/agent-scheduler');
            if (typeof runAgentsNow === 'function') {
              await runAgentsNow();
              result.output = 'RSS scan + threat refresh complete';
            } else {
              result.output = 'Daily cycle armed';
            }
            break;
          }
          case 'Intelligence Summary': {
            const { generateMarketSummary: gen } = await import('@/lib/intelligence-agent');
            const data = await gen();
            result.output = `Market summary refreshed — ${data?.top3Events?.length || 0} events`;
            break;
          }
          case 'Category Analysis': {
            const data = await generateCategoryIntelligence({ force: true });
            result.output = `${data.categories.length} categories refreshed, ${data.aiEnabledCount} via AI`;
            break;
          }
          case 'Department Briefing': {
            const { generateDepartmentBriefings: gen } = await import('@/lib/intelligence-agent');
            const data = await gen();
            result.output = `${Object.keys(data || {}).length} department briefings refreshed`;
            break;
          }
          case 'Strategic Insights': {
            const data = await generateStrategicInsights({ force: true });
            result.output = `Top ${data.insights?.length || 0} moves refreshed · posture: ${data.posture}`;
            break;
          }
          case 'Competitor Analysis':
          case 'Voice of Customer':
          case 'Battlecard Update':
            result.output = 'On-demand agent — runs when you open a competitor page';
            break;
          // Email agent rules — all share the same trigger compute
          case 'Email · High-Severity':
          case 'Email · Critical Watchlist':
          case 'Email · Category Burst':
          case 'Email · Acquisition / M&A':
          case 'Email · AI Launch': {
            const data = await computeEmailTriggers();
            result.output = `${data.totalTriggers} open triggers across ${Object.keys(data.byRule).length} rules`;
            break;
          }
          default:
            result.output = 'Agent acknowledged';
        }
      } catch (err) {
        console.warn(`Agent run failed (${agentKey}):`, err.message);
        result.output = `Completed with warning: ${err.message}`;
      }

      // Append to activity log so the agents page picks it up
      try {
        const activityLog = readJSON('activity_log.json');
        const entry = {
          id: `act-${Date.now()}`,
          agentType: agentKey,
          action: 'Manual Run',
          description: result.output,
          timestamp: result.ranAt,
        };
        activityLog.unshift(entry);
        writeJSON('activity_log.json', activityLog.slice(0, 200));
      } catch (e) {
        // non-fatal
      }

      return NextResponse.json(result);
    }

    // POST /api/signals - Add new signal (manual input)
    if (path === '/signals') {
      const { competitorId, signalText, source, sourceUrl } = body;
      
      if (!competitorId || !signalText) {
        return NextResponse.json({ 
          error: 'Missing required fields: competitorId, signalText' 
        }, { status: 400 });
      }
      
      // Get competitor context
      const competitors = readJSON('competitors.json');
      const competitor = competitors.find(c => c.id === competitorId);
      
      if (!competitor) {
        return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });
      }
      
      // Analyze with AI
      const competitorContext = `Name: ${competitor.name}\nCategory: ${competitor.category}\nPositioning: ${competitor.positioning}`;
      const analysis = await analyzeSignalWithAI(signalText, competitorContext);
      
      // Create signal
      const signal = {
        id: `sig-${uuidv4().slice(0, 8)}`,
        competitorId,
        competitorName: competitor.name,
        title: analysis.title,
        signalType: analysis.signalType,
        source: source || 'Manual Input',
        sourceUrl: sourceUrl || '',
        summary: analysis.summary,
        whyItMatters: analysis.whyItMatters,
        recommendedAction: analysis.recommendedAction,
        severity: analysis.severity,
        recommendedOwner: analysis.recommendedOwner,
        timestamp: new Date().toISOString(),
        processed: true
      };
      
      appendToJSON('signals.json', signal);
      
      // Log activity
      const activity = {
        id: `act-${uuidv4().slice(0, 8)}`,
        agentType: 'Market Monitor',
        action: 'Signal Added',
        description: `Analyzed manual signal for ${competitor.name}: ${signal.title}`,
        timestamp: new Date().toISOString(),
        result: { signalId: signal.id, severity: signal.severity }
      };
      appendToJSON('activity-log.json', activity);
      
      // If high or medium severity, trigger battlecard update
      if (signal.severity === 'high' || signal.severity === 'medium') {
        // Run battlecard update agent in background
        setTimeout(async () => {
          try {
            await runBattlecardUpdateAgent(competitorId);
          } catch (error) {
            console.error('Background battlecard update failed:', error);
          }
        }, 0);
      }
      
      return NextResponse.json({ 
        success: true, 
        signal,
        message: 'Signal added and analyzed successfully'
      });
    }

    // POST /api/battlecards/generate - Generate new battlecard
    if (path === '/battlecards/generate') {
      const { competitorId, dealContext } = body;
      
      if (!competitorId) {
        return NextResponse.json({ 
          error: 'Missing required field: competitorId' 
        }, { status: 400 });
      }
      
      const battlecard = await runBattlecardUpdateAgent(competitorId, dealContext);
      
      return NextResponse.json({ 
        success: true, 
        battlecard,
        message: 'Battlecard generated successfully'
      });
    }

    // POST /api/agents/run-monitor - Run Market Monitor Agent
    if (path === '/agents/run-monitor') {
      const { competitorIds } = body;
      
      // Simulate market monitoring
      const competitors = readJSON('competitors.json');
      const targetCompetitors = competitorIds 
        ? competitors.filter(c => competitorIds.includes(c.id))
        : competitors;
      
      const results = [];
      
      for (const competitor of targetCompetitors) {
        // Simulate finding a signal (in real implementation, this would scrape RSS/URLs)
        const mockSignalText = `Recent update from ${competitor.name}: Enhanced ${competitor.category} capabilities with new features and improved performance.`;
        
        try {
          const competitorContext = `Name: ${competitor.name}\nCategory: ${competitor.category}\nPositioning: ${competitor.positioning}`;
          const analysis = await analyzeSignalWithAI(mockSignalText, competitorContext);
          
          const signal = {
            id: `sig-${uuidv4().slice(0, 8)}`,
            competitorId: competitor.id,
            competitorName: competitor.name,
            title: analysis.title,
            signalType: analysis.signalType,
            source: 'Market Monitor Agent',
            sourceUrl: '',
            summary: analysis.summary,
            whyItMatters: analysis.whyItMatters,
            recommendedAction: analysis.recommendedAction,
            severity: analysis.severity,
            recommendedOwner: analysis.recommendedOwner,
            timestamp: new Date().toISOString(),
            processed: true
          };
          
          appendToJSON('signals.json', signal);
          results.push({ competitor: competitor.name, signalId: signal.id, severity: signal.severity });
          
          // Trigger battlecard update for high/medium severity
          if (signal.severity === 'high' || signal.severity === 'medium') {
            await runBattlecardUpdateAgent(competitor.id);
          }
        } catch (error) {
          console.error(`Error processing ${competitor.name}:`, error);
          results.push({ competitor: competitor.name, error: error.message });
        }
      }
      
      // Log activity
      const activity = {
        id: `act-${uuidv4().slice(0, 8)}`,
        agentType: 'Market Monitor',
        action: 'Market Scan Completed',
        description: `Scanned ${targetCompetitors.length} competitors and found ${results.length} signals`,
        timestamp: new Date().toISOString(),
        result: { signalsFound: results.length, competitors: targetCompetitors.map(c => c.name) }
      };
      appendToJSON('activity-log.json', activity);
      
      return NextResponse.json({ 
        success: true,
        message: 'Market monitor completed',
        results
      });
    }

    // POST /api/email/draft - Generate email draft URL
    if (path === '/api/email/draft') {
      const { signalId } = body;
      
      if (!signalId) {
        return NextResponse.json({ error: 'Missing signalId' }, { status: 400 });
      }
      
      const signals = readJSON('signals.json');
      const signal = signals.find(s => s.id === signalId);
      
      if (!signal) {
        return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
      }
      
      const battlecardLink = `${process.env.NEXT_PUBLIC_BASE_URL}/competitors/${signal.competitorId}`;
      const emailContent = await generateEmailAlert(signal, battlecardLink);
      
      // Create mailto: URL
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;
      
      return NextResponse.json({ 
        success: true,
        mailtoUrl,
        preview: emailContent
      });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

// Helper function: Run Battlecard Update Agent
async function runBattlecardUpdateAgent(competitorId, dealContext = null) {
  const competitors = readJSON('competitors.json');
  const signals = readJSON('signals.json');
  const battlecards = readJSON('battlecards.json');
  
  const competitor = competitors.find(c => c.id === competitorId);
  if (!competitor) {
    throw new Error('Competitor not found');
  }
  
  // Get recent signals for this competitor
  const recentSignals = signals
    .filter(s => s.competitorId === competitorId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
  
  // Generate battlecard with AI
  const battlecardContent = await generateBattlecardWithAI(competitor, recentSignals);
  
  const battlecard = {
    id: `bc-${uuidv4().slice(0, 8)}`,
    competitorId,
    competitorName: competitor.name,
    lastUpdated: new Date().toISOString(),
    dealContext,
    ...battlecardContent
  };
  
  // Update or add battlecard
  const existingIndex = battlecards.findIndex(b => b.competitorId === competitorId);
  if (existingIndex !== -1) {
    battlecards[existingIndex] = battlecard;
  } else {
    battlecards.push(battlecard);
  }
  writeJSON('battlecards.json', battlecards);
  
  // Log activity
  const activity = {
    id: `act-${uuidv4().slice(0, 8)}`,
    agentType: 'Battlecard Update',
    action: 'Battlecard Generated',
    description: `Updated battlecard for ${competitor.name} based on ${recentSignals.length} recent signals`,
    timestamp: new Date().toISOString(),
    result: { battlecardId: battlecard.id, competitorName: competitor.name }
  };
  appendToJSON('activity-log.json', activity);
  
  return battlecard;
}