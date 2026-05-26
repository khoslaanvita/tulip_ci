'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, Zap, Bell, AlertTriangle, Activity, Inbox, Users, Send, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';

const RULE_ICONS = {
  'high-severity-signal': AlertTriangle,
  'critical-watchlist-entry': Bell,
  'category-burst': Activity,
  'acquisition-news': Zap,
  'ai-launch': Sparkles,
};

function rel(ts) {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const d = Math.floor(hr / 24);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  return `${d}d ago`;
}

export default function EmailAgentsPage() {
  const [rules, setRules] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [byRule, setByRule] = useState({});
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState([]);

  // Draft modal state
  const [activeTrigger, setActiveTrigger] = useState(null);
  const [activeDraft, setActiveDraft] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [draftRecipients, setDraftRecipients] = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [rulesRes, trigsRes, draftsRes] = await Promise.all([
        fetch('/api/email-agents/rules'),
        fetch('/api/email-agents/triggers'),
        fetch('/api/email-agents/drafts'),
      ]);
      const r = await rulesRes.json();
      const t = await trigsRes.json();
      const d = await draftsRes.json();
      setRules(r.rules || []);
      setTriggers(t.triggers || []);
      setByRule(t.byRule || {});
      setDrafts(d.drafts || []);
    } catch (e) {
      toast.error('Failed to load email agents');
    } finally {
      setLoading(false);
    }
  }

  async function openDraft(trigger) {
    setActiveTrigger(trigger);
    setActiveDraft(null);
    setDraftRecipients((trigger.recipients || []).join(', '));
    setGenerating(true);
    try {
      const r = await fetch('/api/email-agents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerId: trigger.id }),
      });
      const draft = await r.json();
      setActiveDraft(draft);
    } catch (e) {
      toast.error('Failed to generate draft');
    } finally {
      setGenerating(false);
    }
  }

  function sendDraft() {
    if (!activeDraft) return;
    const mailto = `mailto:${draftRecipients}?subject=${encodeURIComponent(activeDraft.subject)}&body=${encodeURIComponent(activeDraft.body)}`;
    window.location.href = mailto;
    // Save the draft history
    fetch('/api/email-agents/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...activeDraft, recipients: draftRecipients.split(',').map(s => s.trim()) }),
    }).then(() => loadAll());
    toast.success('Opening email client…');
    setActiveTrigger(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500 uppercase tracking-widest">Loading Email Agents…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-8 py-10 max-w-7xl">
        <Link href="/">
          <Button variant="ghost" className="mb-4 -ml-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1 w-8 bg-emerald-600"></div>
            <span className="text-[11px] uppercase tracking-widest text-emerald-700 font-semibold">Email Agents</span>
          </div>
          <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-2">Trigger-based Alerts</h1>
          <p className="text-base text-gray-500">
            When a defined trigger fires, an agent drafts an email to the relevant team and lets you review before sending.
          </p>
        </div>

        {/* Top stats */}
        <div className="grid gap-0 md:grid-cols-4 mb-10 border border-gray-900 divide-x divide-gray-900">
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Active Rules</div>
            <div className="text-3xl font-light text-gray-900">{rules.filter(r => r.enabled).length}</div>
            <p className="text-xs text-gray-500 mt-1">of {rules.length} configured</p>
          </div>
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Open Triggers</div>
            <div className="text-3xl font-light text-gray-900 flex items-baseline gap-2">
              {triggers.length}
              {triggers.length > 0 && <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">awaiting review</p>
          </div>
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Drafts Sent</div>
            <div className="text-3xl font-light text-gray-900">{drafts.length}</div>
            <p className="text-xs text-gray-500 mt-1">historical</p>
          </div>
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Teams Notified</div>
            <div className="text-3xl font-light text-gray-900">
              {new Set(rules.flatMap(r => r.team.split(/[+,]/).map(t => t.trim()))).size}
            </div>
            <p className="text-xs text-gray-500 mt-1">distinct teams</p>
          </div>
        </div>

        {/* Rules */}
        <h2 className="text-2xl font-light text-gray-900 mb-4">Configured Rules</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {rules.map(rule => {
            const Icon = RULE_ICONS[rule.id] || Bell;
            const count = byRule[rule.id] || 0;
            return (
              <Card key={rule.id} className="border border-gray-200 rounded-none hover:border-gray-900 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-black text-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium text-gray-900 leading-tight">{rule.name}</CardTitle>
                        <p className="text-[11px] uppercase tracking-widest text-gray-400 mt-1">
                          Trigger · {rule.trigger}
                        </p>
                      </div>
                    </div>
                    {count > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border bg-red-50 text-red-700 border-red-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                        {count} active
                      </span>
                    )}
                    {count === 0 && rule.enabled && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border bg-emerald-50 text-emerald-800 border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Armed
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 leading-snug mb-3">{rule.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="uppercase tracking-wider">{rule.team}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="uppercase tracking-wider">{rule.window}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active triggers */}
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-light text-gray-900">Open Triggers</h2>
            <p className="text-sm text-gray-500 mt-1">Click any trigger to generate an AI-drafted email for review</p>
          </div>
        </div>

        <Card className="border border-gray-900 rounded-none mb-12">
          <CardContent className="p-0 divide-y divide-gray-100">
            {triggers.length === 0 && (
              <div className="p-10 text-center">
                <Inbox className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No open triggers. The agents are armed and watching.</p>
              </div>
            )}
            {triggers.slice(0, 20).map(t => {
              const Icon = RULE_ICONS[t.ruleId] || Bell;
              return (
                <button
                  key={t.id}
                  onClick={() => openDraft(t)}
                  className="w-full text-left p-5 hover:bg-gray-50 flex items-start gap-4 transition-colors"
                >
                  <div className="p-2 bg-gray-900 text-white flex-shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900">{t.competitorName || t.category || t.ruleName}</span>
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 border border-gray-300 px-1.5 py-0.5">{t.ruleName}</span>
                      {t.threatScore && (
                        <span className="text-[10px] uppercase tracking-widest border px-1.5 py-0.5 bg-red-50 text-red-700 border-red-200">
                          Threat {t.threatScore}
                        </span>
                      )}
                      {t.severity && (
                        <span className={`text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${
                          t.severity === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                          t.severity === 'medium' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          'bg-gray-50 text-gray-700 border-gray-300'
                        }`}>{t.severity}</span>
                      )}
                    </div>
                    {t.signalTitle && <p className="text-sm text-gray-900 font-medium mb-1">{t.signalTitle}</p>}
                    <p className="text-sm text-gray-600 leading-snug line-clamp-2">{t.context}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        {t.team}
                      </span>
                      <span>·</span>
                      <span>{rel(t.triggeredAt)}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-gray-300 flex-shrink-0">
                    <Mail className="h-3 w-3 mr-1.5" />
                    Draft
                  </Button>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent drafts history */}
        {drafts.length > 0 && (
          <>
            <h2 className="text-2xl font-light text-gray-900 mb-4">Recent Drafts</h2>
            <Card className="border border-gray-200 rounded-none">
              <CardContent className="p-0 divide-y divide-gray-100">
                {drafts.slice(0, 8).map(d => (
                  <div key={d.id} className="p-4 flex items-start gap-4">
                    <Send className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{d.subject}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{d.ruleName} · to {Array.isArray(d.recipients) ? d.recipients.join(', ') : d.recipients}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">{rel(d.savedAt)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Draft Dialog */}
        <Dialog open={!!activeTrigger} onOpenChange={(open) => !open && setActiveTrigger(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review & Send Email Draft</DialogTitle>
              <DialogDescription>
                {activeTrigger?.ruleName} · for {activeTrigger?.team}
              </DialogDescription>
            </DialogHeader>
            {generating && (
              <div className="py-10 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Drafting email…</p>
              </div>
            )}
            {activeDraft && !generating && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Recipients</label>
                  <Input value={draftRecipients} onChange={(e) => setDraftRecipients(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Subject</label>
                  <Input
                    value={activeDraft.subject}
                    onChange={(e) => setActiveDraft({ ...activeDraft, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Body</label>
                  <Textarea
                    value={activeDraft.body}
                    onChange={(e) => setActiveDraft({ ...activeDraft, body: e.target.value })}
                    rows={14}
                    className="text-sm font-mono"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveTrigger(null)}>Cancel</Button>
              <Button onClick={sendDraft} disabled={!activeDraft || generating} className="bg-black text-white">
                <Mail className="h-4 w-4 mr-2" />
                Open in Email Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
