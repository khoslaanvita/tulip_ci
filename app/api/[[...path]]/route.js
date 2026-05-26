import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON, appendToJSON, updateInJSON } from '@/lib/storage';
import { analyzeSignalWithAI, generateBattlecardWithAI, generateEmailAlert } from '@/lib/ai-helpers';
import { startScheduler, getSchedulerStatus } from '@/lib/agent-scheduler';
import { generateComprehensiveVoCInsights, getVoCStats } from '@/lib/voc-agent-enhanced';
import { generateMarketSummary, generateCategorySummaries, generateDepartmentBriefings } from '@/lib/intelligence-agent';
import { migrateCustomerTranscripts } from '@/lib/db-operations';

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
      
      // Enrich with latest signal info
      const enriched = competitors.map(comp => {
        const compSignals = signals.filter(s => s.competitorId === comp.id)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const latestSignal = compSignals[0];
        
        return {
          ...comp,
          latestSignal: latestSignal ? {
            title: latestSignal.title,
            type: latestSignal.signalType,
            severity: latestSignal.severity,
            timestamp: latestSignal.timestamp
          } : null
        };
      });
      
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
      const stats = getVoCStats();
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