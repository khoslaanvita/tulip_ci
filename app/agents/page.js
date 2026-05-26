'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bot, Zap, MessageSquare, TrendingUp, Users, Clock, CheckCircle2, AlertCircle, PauseCircle } from 'lucide-react';

// Format timestamp into a human-readable relative + absolute string.
function formatRelativeTime(iso) {
  if (!iso) return { rel: 'Never run', abs: '—' };
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  let rel;
  if (diffMin < 1) rel = 'just now';
  else if (diffMin < 60) rel = `${diffMin}m ago`;
  else if (diffHr < 24) rel = `${diffHr}h ago`;
  else rel = `${diffDay}d ago`;
  const abs = date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  return { rel, abs };
}

export default function AgentsPage() {
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/scheduler/status').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/activity-log').then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([status, log]) => {
      setSchedulerStatus(status);
      setActivityLog(Array.isArray(log) ? log : []);
      setLoading(false);
    });
  }, []);

  // Last-run timestamps per agentType derived from activity log.
  const lastRunByAgent = activityLog.reduce((acc, entry) => {
    const k = entry.agentType;
    if (!k) return acc;
    if (!acc[k] || new Date(entry.timestamp) > new Date(acc[k])) acc[k] = entry.timestamp;
    return acc;
  }, {});

  const agents = [
    {
      key: "Market Monitor",
      name: "Market Monitor Agent",
      icon: TrendingUp,
      type: "Autonomous",
      schedule: "Daily (24h cycle)",
      description: "Continuously monitors competitive landscape via RSS feeds and news sources.",
      capabilities: [
        "Fetches RSS feeds from 8+ industry sources",
        "Scrapes competitor news and announcements",
        "Filters signals by keywords and relevance",
        "Creates structured signals with severity scoring",
        "Deduplicates content to avoid noise"
      ],
      outputs: "New competitive signals added to database with severity levels (low / medium / high).",
      technology: "Node.js · RSS Parser · OpenAI GPT-4o for analysis",
      file: "/app/lib/agent-scheduler.js · /app/lib/rss-monitor.js"
    },
    {
      key: "Intelligence Summary",
      name: "Intelligence Summary Agent",
      icon: Zap,
      type: "On-Demand",
      schedule: "Page load / Manual refresh",
      description: "Generates executive market summaries and strategic insights.",
      capabilities: [
        "Analyzes last 30 days of competitive signals",
        "Identifies top 3 most important market events",
        "Assesses overall threat level (low / medium / high)",
        "Determines Tulip's current market position",
        "Identifies key trends affecting competitive landscape"
      ],
      outputs: "Market summary box on dashboard with actionable intelligence.",
      technology: "OpenAI GPT-4o with strategic analysis prompts",
      file: "/app/lib/intelligence-agent.js → generateMarketSummary()"
    },
    {
      key: "Category Analysis",
      name: "Category Analysis Agent",
      icon: TrendingUp,
      type: "On-Demand",
      schedule: "Page load / Manual refresh",
      description: "Analyzes competitive dynamics by category (MES, Connected Worker, etc.).",
      capabilities: [
        "Groups competitors by category automatically",
        "Identifies key developments per category",
        "Explains why category trends matter to Tulip",
        "Recommends specific actions per category",
        "Tracks category-level threat evolution"
      ],
      outputs: "Category summary cards with key updates, implications, and actions.",
      technology: "OpenAI GPT-4o analyzing category-specific signals",
      file: "/app/lib/intelligence-agent.js → generateCategorySummaries()"
    },
    {
      key: "Department Briefing",
      name: "Department Briefing Agent",
      icon: Users,
      type: "On-Demand",
      schedule: "Page load / Manual refresh",
      description: "Creates role-specific intelligence briefings for each team.",
      capabilities: [
        "Filters signals by owner (product, sales, marketing, customer success, executive)",
        "Generates executive summary per department",
        "Identifies top 3 insights relevant to each team",
        "Creates prioritized action items (high / medium / low)",
        "Recommends competitors to watch",
        "Assigns timeframes (immediate / short-term / long-term)"
      ],
      outputs: "Department-specific briefing pages with tailored insights and actions.",
      technology: "OpenAI GPT-4o with role-specific analysis",
      file: "/app/lib/intelligence-agent.js → generateDepartmentBriefings()"
    },
    {
      key: "Competitor Analysis",
      name: "Competitor Analysis Agent",
      icon: Bot,
      type: "On-Demand",
      schedule: "Page load / Manual refresh",
      description: "Generates deep competitive intelligence per competitor.",
      capabilities: [
        "Analyzes company niche and positioning",
        "Identifies specific threats to Tulip (severity, likelihood, mitigation)",
        "Discovers opportunities for Tulip to win (impact, actions, owner)",
        "Maps competitive gaps and Tulip advantages",
        "Tracks market trends and competitor responses",
        "Generates recommended actions with priorities"
      ],
      outputs: "Threats & Opportunities sections on competitor detail pages.",
      technology: "OpenAI GPT-4o analyzing competitor signals and profile data",
      file: "/app/lib/competitor-analysis.js → generateCompetitorThreatsOpportunities()"
    },
    {
      key: "Voice of Customer",
      name: "Voice of Customer Agent",
      icon: MessageSquare,
      type: "On-Demand",
      schedule: "Page load / Manual refresh",
      description: "Analyzes customer conversations for competitive intelligence.",
      capabilities: [
        "Processes customer call transcripts mentioning competitors",
        "Extracts SWOT analysis from customer feedback",
        "Identifies pricing insights and customer perceptions",
        "Analyzes product capabilities and limitations",
        "Maps sales & GTM approaches from customer perspective",
        "Determines win conditions and loss conditions",
        "Generates Tulip win strategies based on real customer input",
        "Identifies deal risks and mitigation strategies"
      ],
      outputs: "Comprehensive VoC insights with threats, opportunities, key quotes, and actionable recommendations.",
      technology: "OpenAI GPT-4o analyzing customer conversation transcripts from MongoDB",
      file: "/app/lib/voc-agent-enhanced.js → generateComprehensiveVoCInsights()"
    },
    {
      key: "Battlecard Update",
      name: "Battlecard Generator Agent",
      icon: Zap,
      type: "On-Demand",
      schedule: "Manual trigger",
      description: "Generates sales battlecards for competitive deals.",
      capabilities: [
        "Analyzes competitor positioning and recent signals",
        "Identifies when competitor typically appears in deals",
        "Maps where Tulip wins vs this competitor",
        "Anticipates likely objections from prospects",
        "Recommends sales responses and handling strategies",
        "Creates discovery questions to position Tulip favorably",
        "Generates product and marketing implications"
      ],
      outputs: "Structured battlecard with positioning, objection handling, and discovery questions.",
      technology: "OpenAI GPT-4o / Claude analyzing competitor data and signals",
      file: "/app/lib/ai-helpers.js → generateBattlecardWithAI()"
    }
  ];

  // Determine status badge for an agent.
  function getAgentStatus(agent) {
    const lastRun = lastRunByAgent[agent.key];
    if (agent.type === 'Autonomous') {
      if (schedulerStatus?.running) {
        return { label: 'Active', tone: 'live', icon: CheckCircle2 };
      }
      return { label: 'Idle', tone: 'idle', icon: PauseCircle };
    }
    if (lastRun) return { label: 'Ready', tone: 'ready', icon: CheckCircle2 };
    return { label: 'On Demand', tone: 'idle', icon: PauseCircle };
  }

  const toneClass = {
    live: 'bg-black text-white border-black',
    ready: 'bg-white text-black border-black',
    idle: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  const totalRuns = activityLog.length;
  const lastGlobalRun = schedulerStatus?.lastRunTime || activityLog[0]?.timestamp;
  const lastGlobal = formatRelativeTime(lastGlobalRun);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <Link href="/">
            <Button variant="ghost" className="mb-4 -ml-3">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-3">
            AI Agents
          </h1>
          <p className="text-lg text-gray-600">
            Autonomous and on-demand agents powering competitive intelligence
          </p>
        </div>

        {/* Status Bar */}
        <div className="grid md:grid-cols-3 gap-0 border border-gray-900 mb-10 divide-x divide-gray-900">
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Scheduler</div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${schedulerStatus?.running ? 'bg-gray-900 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-2xl font-light text-gray-900">
                {loading ? '—' : (schedulerStatus?.running ? 'Running' : 'Stopped')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {schedulerStatus?.intervalMinutes ? `Every ${Math.round(schedulerStatus.intervalMinutes / 60)} hours` : 'Daily cycle'}
            </p>
          </div>
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Last Global Run</div>
            <div className="text-2xl font-light text-gray-900">
              {loading ? '—' : lastGlobal.rel}
            </div>
            <p className="text-xs text-gray-500 mt-1 font-mono">{lastGlobal.abs}</p>
          </div>
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Total Agent Runs</div>
            <div className="text-2xl font-light text-gray-900">
              {loading ? '—' : totalRuns}
            </div>
            <p className="text-xs text-gray-500 mt-1">{agents.length} agents configured</p>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="space-y-6">
          {agents.map((agent, idx) => {
            const Icon = agent.icon;
            const status = getAgentStatus(agent);
            const StatusIcon = status.icon;
            const lastRun = lastRunByAgent[agent.key];
            const time = formatRelativeTime(lastRun);

            return (
              <Card key={idx} className="border border-gray-900 rounded-none">
                <CardHeader className="bg-gray-50 border-b border-gray-900">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-black text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-light">{agent.name}</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">{agent.description}</CardDescription>
                      </div>
                    </div>

                    {/* Status pill + timing */}
                    <div className="flex flex-col items-end gap-2 min-w-[180px]">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[11px] font-medium uppercase tracking-wider ${toneClass[status.tone]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-gray-300 bg-white text-[11px] text-gray-700">
                        <span className="text-gray-400 uppercase tracking-wider text-[10px]">{agent.type}</span>
                        <span className="text-gray-300">·</span>
                        <span>{agent.schedule}</span>
                      </span>
                    </div>
                  </div>

                  {/* Timing strip */}
                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-6 text-xs text-gray-600 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span className="uppercase tracking-wider text-[10px] text-gray-400">Last Run</span>
                      <span className="font-medium text-gray-900">{time.rel}</span>
                      <span className="text-gray-400 font-mono">· {time.abs}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Left */}
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Capabilities</h4>
                      <ul className="space-y-1.5 text-sm text-gray-800">
                        {agent.capabilities.map((cap, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">·</span>
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right */}
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Outputs</h4>
                        <p className="text-sm text-gray-800">{agent.outputs}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Technology</h4>
                        <p className="text-sm text-gray-800">{agent.technology}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Implementation</h4>
                        <p className="text-xs text-gray-500 font-mono break-all">{agent.file}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How agents work together — B&W */}
        <Card className="mt-10 border-2 border-gray-900 rounded-none">
          <CardHeader className="border-b border-gray-900 bg-black text-white">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-lg font-light text-white">How Agents Work Together</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ol className="space-y-3 text-sm text-gray-800">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 border border-gray-900 flex items-center justify-center text-xs font-medium">1</span>
                <span><strong>Market Monitor</strong> runs daily to gather competitive signals from RSS and news.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 border border-gray-900 flex items-center justify-center text-xs font-medium">2</span>
                <span><strong>Intelligence agents</strong> analyze signals to produce market, category, and departmental briefings.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 border border-gray-900 flex items-center justify-center text-xs font-medium">3</span>
                <span><strong>Competitor Analysis</strong> generates per-company threats, opportunities, and strategy.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 border border-gray-900 flex items-center justify-center text-xs font-medium">4</span>
                <span><strong>VoC agent</strong> enriches intelligence with customer transcript signals.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 border border-gray-900 flex items-center justify-center text-xs font-medium">5</span>
                <span><strong>Battlecard Generator</strong> packages everything for sales teams.</span>
              </li>
            </ol>
            <p className="mt-5 pt-4 border-t border-gray-200 text-xs text-gray-500">
              All agents use OpenAI GPT-4o for analysis. Data is stored in MongoDB for persistence and querying.
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity Log (last 8) */}
        {activityLog.length > 0 && (
          <Card className="mt-8 border border-gray-200 rounded-none">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-light">Recent Agent Activity</CardTitle>
              <CardDescription>Latest agent run events</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {activityLog.slice(0, 8).map((entry, i) => {
                  const t = formatRelativeTime(entry.timestamp);
                  return (
                    <div key={entry.id || i} className="px-6 py-3 flex items-start gap-4 hover:bg-gray-50">
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 w-32 flex-shrink-0 pt-1">
                        {entry.agentType}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 font-medium">{entry.action}</div>
                        <div className="text-xs text-gray-600 mt-0.5 line-clamp-1">{entry.description}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-900">{t.rel}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{t.abs}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* White space at bottom */}
        <div className="h-16"></div>
      </div>
    </div>
  );
}
