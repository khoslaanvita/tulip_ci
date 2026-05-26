import { readJSON, writeJSON, appendToJSON } from './storage';
import { analyzeSignalWithAI } from './ai-helpers';
import { competitorSources, competitorKeywords } from './data-sources';
import { runRSSMonitoring } from './rss-monitor';

// Scheduler state
let schedulerRunning = false;
let lastRunTime = null;

// Run interval - once per day (24 hours)
const RUN_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Start the background agent scheduler
 */
export function startScheduler() {
  if (schedulerRunning) {
    console.log('Scheduler already running');
    return;
  }
  
  schedulerRunning = true;
  console.log('🤖 Agent Scheduler Started - Running once per day');
  
  // Run immediately on start
  runScheduledAgents();
  
  // Then run on interval (daily)
  setInterval(() => {
    runScheduledAgents();
  }, RUN_INTERVAL_MS);
}

/**
 * Stop the background agent scheduler
 */
export function stopScheduler() {
  schedulerRunning = false;
  console.log('🛑 Agent Scheduler Stopped');
}

/**
 * Run all scheduled agent tasks
 */
async function runScheduledAgents() {
  console.log('⏰ Running scheduled agents at:', new Date().toISOString());
  lastRunTime = new Date().toISOString();
  
  try {
    // Task 1: Check for new signals from RSS feeds (simplified for demo)
    await checkForNewSignals();
    
    // Task 2: Update competitive threat scores
    await updateThreatScores();
    
    // Task 3: Clean up old activity logs (keep last 100)
    await cleanupActivityLogs();
    
    console.log('✅ Scheduled agents completed successfully');
  } catch (error) {
    console.error('❌ Error running scheduled agents:', error);
  }
}

/**
 * Public: run agents on demand (Manual Run button)
 */
export async function runAgentsNow() {
  await runScheduledAgents();
  return { ranAt: lastRunTime };
}

/**
 * Check for new competitive signals
 * Now actually runs RSS monitoring
 */
async function checkForNewSignals() {
  console.log('  📡 Checking for new signals from RSS feeds...');
  
  try {
    // Run actual RSS monitoring
    const result = await runRSSMonitoring();
    
    console.log(`  ✓ RSS Monitoring: ${result.totalCreated} new signals from ${result.totalProcessed} articles`);
    
    // Log activity
    const activity = {
      id: `act-${Date.now()}`,
      agentType: 'Market Monitor',
      action: 'RSS Feed Scan',
      description: `Scanned RSS feeds for all competitors. Found ${result.totalCreated} new signals from ${result.totalProcessed} articles.`,
      timestamp: new Date().toISOString(),
      result: { 
        totalProcessed: result.totalProcessed,
        totalCreated: result.totalCreated,
        details: result.results
      }
    };
    
    appendToJSON('activity-log.json', activity);
  } catch (error) {
    console.error('  ✗ Error in RSS monitoring:', error.message);
    
    // Fallback: just log that we're monitoring
    const competitors = readJSON('competitors.json');
    const monitoredCount = competitors.length;
    
    console.log(`  ✓ Monitored ${monitoredCount} competitors (fallback mode)`);
    
    const activity = {
      id: `act-${Date.now()}`,
      agentType: 'Market Monitor',
      action: 'Scheduled Scan',
      description: `Automated scan of ${monitoredCount} competitor sources. RSS monitoring encountered issues: ${error.message}`,
      timestamp: new Date().toISOString(),
      result: { competitorsScanned: monitoredCount, error: error.message }
    };
    
    appendToJSON('activity-log.json', activity);
  }
}

/**
 * Update threat scores for each competitor
 */
async function updateThreatScores() {
  console.log('  📊 Updating competitive threat scores...');
  
  const competitors = readJSON('competitors.json');
  const signals = readJSON('signals.json');
  
  // Calculate threat score based on:
  // - Recent high-severity signals
  // - Growth rate
  // - Product release velocity
  // - Funding
  
  competitors.forEach(competitor => {
    if (competitor.id === 'tulip') return; // Skip Tulip reference
    
    const competitorSignals = signals.filter(s => s.competitorId === competitor.id);
    const highSeverityCount = competitorSignals.filter(s => s.severity === 'high').length;
    const mediumSeverityCount = competitorSignals.filter(s => s.severity === 'medium').length;
    
    // Simple threat score calculation
    let threatScore = 0;
    threatScore += highSeverityCount * 10;
    threatScore += mediumSeverityCount * 5;
    
    // Add recent activity bonus
    const recentSignals = competitorSignals.filter(s => {
      const signalDate = new Date(s.timestamp);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return signalDate > thirtyDaysAgo;
    });
    
    threatScore += recentSignals.length * 2;
    
    // Determine threat level
    let threatLevel = 'low';
    if (threatScore >= 20) threatLevel = 'high';
    else if (threatScore >= 10) threatLevel = 'medium';
    
    competitor.threatScore = threatScore;
    competitor.threatLevel = threatLevel;
  });
  
  writeJSON('competitors.json', competitors);
  console.log(`  ✓ Updated threat scores for ${competitors.length - 1} competitors`);
}

/**
 * Clean up old activity logs
 */
async function cleanupActivityLogs() {
  const logs = readJSON('activity-log.json');
  
  if (logs.length > 100) {
    // Keep only the most recent 100 logs
    const recentLogs = logs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 100);
    
    writeJSON('activity-log.json', recentLogs);
    console.log(`  🧹 Cleaned up activity logs (kept ${recentLogs.length} most recent)`);
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    running: schedulerRunning,
    lastRunTime,
    nextRunIn: schedulerRunning ? RUN_INTERVAL_MS : null,
    intervalMinutes: RUN_INTERVAL_MS / (60 * 1000)
  };
}