'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bot, Zap, MessageSquare, TrendingUp, Users, Clock, CheckCircle2, AlertCircle, PauseCircle, Play, Loader2, Mail, Bell, Sparkles, AlertTriangle, Activity, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

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
  const [emailTriggers, setEmailTriggers] = useState(null);
  const [emailRules, setEmailRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [status, log, trigs, rules] = await Promise.all([
      fetch('/api/scheduler/status').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/activity-log').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/email-agents/triggers').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/email-agents/rules').then(r => r.ok ? r.json() : { rules: [] }).catch(() => ({ rules: [] })),
    ]);
    setSchedulerStatus(status);
    setActivityLog(Array.isArray(log) ? log : []);
    setEmailTriggers(trigs);
    setEmailRules(rules.rules || []);
    setLoading(false);
  }

  async function runAgent(agentKey) {
    setRunningAgent(agentKey);
    try {
      const r = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentKey }),
      });
      const result = await r.json();
      if (r.ok) {
        toast.success(`${agentKey} ran — ${result.output}`);
        // refresh activity log
        await loadAll();
      } else {
        toast.error(result.error || 'Run failed');
      }
    } catch (e) {
      toast.error('Run failed');
    } finally {
      setRunningAgent(null);
    }
  }

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
      outputUrl: "/signals",
      outputLabel: "View Signal Feed",
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
      outputs: "Strategic Insights box on the main Dashboard (\"Top 3 Moves to Make\").",
      outputUrl: "/",
      outputLabel: "View on Dashboard",
      technology: "OpenAI GPT-4o-mini with strategic analysis prompts",
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
      outputs: "\"What's Moving by Category\" section on the main Dashboard (8 category tabs).",
      outputUrl: "/",
      outputLabel: "View on Dashboard",
      technology: "OpenAI GPT-4o-mini analyzing category-specific signals",
      file: "/app/lib/category-intelligence.js → generateCategoryIntelligence()"
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
      outputs: "Intelligence Briefing page — 5 dept cards (Executive · Product · Sales · Marketing · Customer Success).",
      outputUrl: "/intelligence-briefing",
      outputLabel: "Open Briefings Page",
      technology: "OpenAI GPT-4o-mini with role-specific analysis",
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
      outputs: "\"Tulip Battle Plan\" section on each Competitor Detail page (auto-loads).",
      outputUrl: "/competitors/sap-digital-manufacturing",
      outputLabel: "Open a Competitor",
      technology: "OpenAI GPT-4o-mini analyzing competitor signals and profile data",
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
      outputs: "\"Voice of Customer\" tab on Competitor Detail pages.",
      outputUrl: "/competitors/sap-digital-manufacturing",
      outputLabel: "Open a Competitor",
      technology: "OpenAI GPT-4o-mini analyzing customer conversation transcripts from MongoDB",
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
      outputs: "\"Battlecard\" tab on each Competitor Detail page.",
      outputUrl: "/competitors/sap-digital-manufacturing",
      outputLabel: "Open a Competitor",
      technology: "OpenAI GPT-4o-mini analyzing competitor data and signals",
      file: "/app/lib/ai-helpers.js → generateBattlecardWithAI()"
    },
    // ---- Email Agents (trigger-based) ----
    {
      key: "Email · High-Severity",
      group: "email",
      name: "High-Severity Signal Alerter",
      icon: AlertTriangle,
      type: "Trigger-based",
      schedule: "On any high-severity signal (14d window)",
      description: "Drafts an email to Sales + Product Marketing whenever a competitor signal is tagged 'high' severity.",
      capabilities: [
        "Scans new and existing signals for severity=high",
        "Composes team-specific subject lines",
        "Drafts 150-word internal email with What/Why/Actions",
        "Falls back to deterministic template if AI is rate-limited",
      ],
      outputs: "Draft email queued for review at /email-agents.",
      technology: "OpenAI gpt-4o-mini + rule engine",
      file: "/app/lib/email-agent.js → ruleId: high-severity-signal",
      triggerKey: "high-severity-signal",
    },
    {
      key: "Email · Critical Watchlist",
      group: "email",
      name: "Critical Watchlist Notifier",
      icon: Bell,
      type: "Trigger-based",
      schedule: "On threat score crossing 70",
      description: "Drafts an email to Executive + Product leadership when a competitor enters the Critical band (threat ≥ 70).",
      capabilities: [
        "Re-scores all competitors on each scheduler run",
        "Detects new entrants to the Critical band",
        "Aggregates context (category, positioning, Tulip angle)",
        "Drafts brief for executive review",
      ],
      outputs: "Draft email queued for review at /email-agents.",
      technology: "Rule engine + OpenAI gpt-4o-mini",
      file: "/app/lib/email-agent.js → ruleId: critical-watchlist-entry",
      triggerKey: "critical-watchlist-entry",
    },
    {
      key: "Email · Category Burst",
      group: "email",
      name: "Category Activity Watcher",
      icon: Activity,
      type: "Trigger-based",
      schedule: "On 3+ signals in same category (30d)",
      description: "Notifies Product Marketing when a single category sees a burst of competitor activity.",
      capabilities: [
        "Groups signals by category bucket",
        "Detects bursts (3+ in 30 days)",
        "Identifies most active vendors per category",
        "Drafts category-refresh brief for PMM",
      ],
      outputs: "Draft email queued for review at /email-agents.",
      technology: "Rule engine + OpenAI gpt-4o-mini",
      file: "/app/lib/email-agent.js → ruleId: category-burst",
      triggerKey: "category-burst",
    },
    {
      key: "Email · Acquisition / M&A",
      group: "email",
      name: "M&A Tracker",
      icon: Zap,
      type: "Trigger-based",
      schedule: "On any acquisition/M&A keyword (30d)",
      description: "Alerts Executive + Corp Dev when any signal mentions acquisition, M&A, or similar keywords.",
      capabilities: [
        "Keyword scan across signal title + summary",
        "Multi-vendor consolidation tracking",
        "CEO + Corp Dev briefing draft",
        "Links to source URLs for verification",
      ],
      outputs: "Draft email queued for review at /email-agents.",
      technology: "Keyword rule + OpenAI gpt-4o-mini",
      file: "/app/lib/email-agent.js → ruleId: acquisition-news",
      triggerKey: "acquisition-news",
    },
    {
      key: "Email · AI Launch",
      group: "email",
      name: "Competitor AI Launch Alerter",
      icon: Sparkles,
      type: "Trigger-based",
      schedule: "On AI-tagged signal sev ≥ medium (21d)",
      description: "Briefs Product + Marketing when a competitor ships an AI/GenAI feature.",
      capabilities: [
        "Filters signals by type=AI",
        "Severity ≥ medium threshold",
        "Tulip product + marketing context injection",
        "Counter-positioning recommendations",
      ],
      outputs: "Draft email queued for review at /email-agents.",
      technology: "Type+severity rule + OpenAI gpt-4o-mini",
      file: "/app/lib/email-agent.js → ruleId: ai-launch",
      triggerKey: "ai-launch",
    },
  ];

  // Determine status badge for an agent.
  function getAgentStatus(agent) {
    const lastRun = lastRunByAgent[agent.key];

    // Trigger-based email agents: show count of active triggers
    if (agent.group === 'email' && agent.triggerKey) {
      const count = (emailTriggers?.byRule || {})[agent.triggerKey] || 0;
      if (count > 0) return { label: `${count} active`, tone: 'red', icon: AlertCircle };
      return { label: 'Armed', tone: 'live', icon: CheckCircle2 };
    }

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
    live:  'bg-black text-white border-black',
    ready: 'bg-white text-black border-black',
    idle:  'bg-gray-100 text-gray-700 border-gray-300',
    red:   'bg-red-50 text-red-700 border-red-200',
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
                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between gap-6 text-xs text-gray-600 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span className="uppercase tracking-wider text-[10px] text-gray-400">Last Run</span>
                      <span className="font-medium text-gray-900">{time.rel}</span>
                      <span className="text-gray-400 font-mono">· {time.abs}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.outputUrl && (
                        <Link href={agent.outputUrl}>
                          <Button size="sm" variant="outline" className="border-gray-300 h-7 text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {agent.outputLabel || 'View Output'}
                          </Button>
                        </Link>
                      )}
                      {agent.group === 'email' && (
                        <Link href="/email-agents">
                          <Button size="sm" variant="outline" className="border-gray-300 h-7 text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            View Drafts
                            <ExternalLink className="h-3 w-3 ml-1 text-gray-400" />
                          </Button>
                        </Link>
                      )}
                      <Button
                        size="sm"
                        onClick={() => runAgent(agent.key)}
                        disabled={runningAgent === agent.key}
                        className="bg-black hover:bg-gray-900 text-white h-7 text-xs"
                      >
                        {runningAgent === agent.key ? (
                          <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Running…</>
                        ) : (
                          <><Play className="h-3 w-3 mr-1" /> Run Now</>
                        )}
                      </Button>
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
