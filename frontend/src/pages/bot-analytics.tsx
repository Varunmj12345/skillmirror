import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Terminal, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  BarChart3, 
  Layers, 
  Server,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Search,
  Download,
  Database,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import Layout from '../components/Layout';
import { SentinelPageShell, PageStatChip } from '../components/CyberPageShell';
import { 
  fetchBotPerformanceOverview, 
  fetchBotPerformanceLogs, 
  runBotLiveDiagnostic, 
  submitBotFeedback,
  BotOverviewResponse, 
  TelemetryLog,
  DiagnosticResult,
  seedBotTelemetry,
  downloadBotReport
} from '../services/botAnalytics';

const TASK_COLORS: Record<string, string> = {
  career_chat: '#f59e0b',
  career_intelligence: '#3b82f6',
  resume_intelligence: '#10b981',
  code_evaluation: '#8b5cf6',
  gap_challenge: '#ec4899',
  progressive_hint: '#06b6d4',
  diagnostic_probe: '#64748b'
};

const BotAnalyticsPage: React.FC = () => {
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<BotOverviewResponse | null>(null);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'diagnostic'>('overview');
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Diagnostic states
  const [probing, setProbing] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  // Seeding state
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedMsg, setSeedMsg] = useState<string>('');

    // Selected log for detailed inspect modal
  const [selectedLog, setSelectedLog] = useState<TelemetryLog | null>(null);

  const loadData = useCallback(async (showSpinner: boolean = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [overviewRes, logsRes] = await Promise.all([
        fetchBotPerformanceOverview(days, typeFilter || undefined),
        fetchBotPerformanceLogs(100, typeFilter || undefined, statusFilter || undefined)
      ]);
      setData(overviewRes);
      setLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Failed to load bot telemetry:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [days, typeFilter, statusFilter]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData(false);
    }, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  const handleRunProbe = async () => {
    setProbing(true);
    try {
      const result = await runBotLiveDiagnostic();
      setDiagnosticResult(result);
      loadData(false);
    } catch (err: any) {
      setDiagnosticResult({
        status: 'degraded',
        provider: 'groq',
        model: 'openai/gpt-oss-120b',
        latency_ms: 0,
        error: err?.message || 'Diagnostic probe request timed out',
        timestamp: new Date().toISOString(),
        verified: false
      });
    } finally {
      setProbing(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg('');
    try {
      const res = await seedBotTelemetry(14, 80);
      if (res.status === 'skipped') {
        setSeedMsg(res.message || 'Already seeded.');
      } else {
        setSeedMsg('Seeded ' + res.created + ' records. Refreshing...');
        setTimeout(() => loadData(true), 800);
      }
    } catch (e: any) {
      setSeedMsg('Seed failed: ' + (e?.message || 'unknown error'));
    } finally {
      setSeeding(false);
    }
  };

  const handleFeedback = async (logId: string, rating: number) => {
    try {
      await submitBotFeedback(logId, rating);
      setLogs((prev) =>
        prev.map((l) => (l.id === logId ? { ...l, user_rating: rating } : l))
      );
      if (selectedLog && selectedLog.id === logId) {
        setSelectedLog({ ...selectedLog, user_rating: rating });
      }
    } catch (err) {
      console.error('Failed to record feedback:', err);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.prompt_preview?.toLowerCase().includes(q) ||
      log.response_preview?.toLowerCase().includes(q) ||
      log.interaction_type.toLowerCase().includes(q) ||
      log.model.toLowerCase().includes(q) ||
      log.user_email.toLowerCase().includes(q)
    );
  });

  const summary = data?.summary;
  const engineStatus = data?.engine_status;

  return (
    <Layout>
      <Head>
        <title>AI Diagnostics | SkillMirror</title>
        <meta 
          name="description" 
          content="Real-time bot performance, inference telemetry, token throughput, and model health diagnostics powered by Groq." 
        />
      </Head>

      <SentinelPageShell
        moduleCode="ENG-09"
        section="AI CAREER ENGINES"
        title="AI DIAGNOSTICS"
        subtitle="Real-time inference telemetry, token throughput, model health verification, and query auditing powered by Groq."
        badge={engineStatus?.api_key_configured ? "GROQ 120B // ONLINE" : "KEY REQUIRED"}
        badgeVariant={engineStatus?.api_key_configured ? "amber" : "red"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Auto refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
                autoRefresh
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle 8-second live telemetry refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin text-amber-400' : ''}`} />
              <span>{autoRefresh ? 'LIVE (8s)' : 'AUTO-POLL'}</span>
            </button>

            {/* Live diagnostic trigger */}
            <button
              onClick={handleRunProbe}
              disabled={probing}
              className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-amber-500/20"
            >
              <Zap className={`w-3.5 h-3.5 ${probing ? 'animate-bounce' : ''}`} />
              <span>{probing ? 'PROBING GROQ...' : 'RUN LIVE PROBE'}</span>
            </button>

            {/* Seed demo data (shown only when no real data) */}
            {(!data?.summary?.total_requests || data.summary.total_requests === 0) && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/30 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                title="Seed realistic sample telemetry data to populate the dashboard"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{seeding ? 'SEEDING...' : 'SEED DATA'}</span>
              </button>
            )}

            {/* Download report */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5">
              <button
                onClick={() => downloadBotReport('csv', days, typeFilter || undefined, statusFilter || undefined)}
                className="px-2.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-all"
                title="Download telemetry report as CSV"
              >
                <Download className="w-3 h-3" />
                <span>CSV</span>
              </button>
              <div className="w-px h-4 bg-zinc-800" />
              <button
                onClick={() => downloadBotReport('json', days, typeFilter || undefined, statusFilter || undefined)}
                className="px-2.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-blue-400 flex items-center gap-1 transition-all"
                title="Download telemetry report as JSON"
              >
                <Download className="w-3 h-3" />
                <span>JSON</span>
              </button>
            </div>

            {/* Time range selector */}
            <div className="flex bg-zinc-900 border border-zinc-800 p-0.5">
              {[1, 7, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-2.5 py-1 text-[11px] font-mono transition-all ${
                    days === d
                      ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {d === 1 ? '24H' : `${d}D`}
                </button>
              ))}
            </div>
          </div>
        }
        stats={
          <div className="flex flex-wrap gap-2.5 mt-2">
            <PageStatChip
              label="ENGINE STATUS"
              value="ACTIVE // HEALTHY"
              color={summary && summary.health_score > 90 ? "emerald" : "amber"}
            />
            <PageStatChip
              label="PRIMARY MODEL"
              value={engineStatus?.primary_model || "openai/gpt-oss-120b"}
              color="amber"
            />
            <PageStatChip
              label="PROVIDER"
              value="GROQ LPU CLUSTER"
              color="blue"
            />
            <PageStatChip
              label="KEY STATUS"
              value={engineStatus?.key_preview || "Configured"}
              color="purple"
            />
          </div>
        }
      >
        <div className="space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-sm px-2 pt-2 gap-2">
            {[
              { id: 'overview', label: 'ANALYTICAL OVERVIEW', icon: BarChart3 },
              { id: 'logs', label: `TELEMETRY AUDIT LOGS (${filteredLogs.length})`, icon: Layers },
              { id: 'diagnostic', label: 'LIVE PROBE CONSOLE', icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-mono font-medium tracking-wider uppercase border-b-2 transition-all ${
                    isActive
                      ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {/* TAB 1: OVERVIEW METRICS & TELEMETRY CHARTS                        */}
          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Executive KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Total Queries */}
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-none relative overflow-hidden group hover:border-amber-400/50 transition-all">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Total Bot Queries</span>
                    <Cpu className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-mono font-bold text-zinc-100 mb-1">
                    {summary?.total_requests ?? 0}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span className="text-emerald-400 font-bold">
                      {summary?.successful_requests ?? 0} ok
                    </span>
                    <span>â€¢</span>
                    <span className="text-rose-400">
                      {summary?.failed_requests ?? 0} failed
                    </span>
                  </div>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/5 blur-xl pointer-events-none" />
                </div>

                {/* Metric 2: Avg Latency */}
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-none relative overflow-hidden group hover:border-amber-400/50 transition-all">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Average Latency</span>
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-mono font-bold text-zinc-100 mb-1">
                    {summary?.avg_latency_ms ? `${summary.avg_latency_ms} ms` : '0 ms'}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span className="text-zinc-300">P95: {summary?.p95_latency_ms ?? 0} ms</span>
                    <span>â€¢</span>
                    <span className="text-zinc-500">Min: {summary?.min_latency_ms ?? 0} ms</span>
                  </div>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-400/5 blur-xl pointer-events-none" />
                </div>

                {/* Metric 3: Success & Health Index */}
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-none relative overflow-hidden group hover:border-amber-400/50 transition-all">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Health Index</span>
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-mono font-bold text-zinc-100 mb-1">
                    {summary?.health_score ?? 100}%
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-emerald-400 font-bold">{summary?.success_rate ?? 100}% success</span>
                    <span>â€¢</span>
                    <span className="text-zinc-400">{summary?.satisfaction_rate ?? 98}% satisfaction</span>
                  </div>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/5 blur-xl pointer-events-none" />
                </div>

                {/* Metric 4: Total Tokens */}
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-none relative overflow-hidden group hover:border-amber-400/50 transition-all">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Total Tokens</span>
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-3xl font-mono font-bold text-zinc-100 mb-1">
                    {summary?.total_tokens_consumed?.toLocaleString() ?? 0}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span>Prompt: {summary?.prompt_tokens?.toLocaleString() ?? 0}</span>
                    <span>â€¢</span>
                    <span>Comp: {summary?.completion_tokens?.toLocaleString() ?? 0}</span>
                  </div>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-400/5 blur-xl pointer-events-none" />
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart 1: Latency & Volume Timeline (2 cols) */}
                <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 p-5 rounded-none">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-400" />
                        Inference Latency & Throughput Timeline
                      </h3>
                      <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                        Historical average response latency (ms) and query volume
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 border border-amber-400/20">
                      ROLLING {days} DAYS
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    {data?.timeline && data.timeline.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="date" stroke="#71717a" fontSize={11} fontFamily="monospace" />
                          <YAxis stroke="#71717a" fontSize={11} fontFamily="monospace" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#09090b', 
                              borderColor: '#3f3f46', 
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              borderRadius: '0px'
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="avg_latency_ms" 
                            name="Avg Latency (ms)" 
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#latencyGradient)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-500">
                        No telemetry data logged for selected period.
                      </div>
                    )}
                  </div>
                </div>

                {/* Chart 2: Task Distribution Breakdown (1 col) */}
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-none flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-blue-400" />
                      Task Distribution
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500 mb-4">
                      Breakdown by AI feature subsystem
                    </p>

                    <div className="space-y-3">
                      {data?.task_distribution && data.task_distribution.length > 0 ? (
                        data.task_distribution.map((task) => {
                          const total = summary?.total_requests || 1;
                          const pct = Math.round((task.requests / total) * 100);
                          const color = TASK_COLORS[task.type] || '#71717a';
                          return (
                            <div key={task.type} className="space-y-1">
                              <div className="flex justify-between items-center text-xs font-mono">
                                <span className="text-zinc-300 truncate max-w-[150px]">{task.label}</span>
                                <span className="text-zinc-400">{task.requests} ({pct}%)</span>
                              </div>
                              <div className="w-full h-1.5 bg-zinc-900 overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-500" 
                                  style={{ width: `${pct}%`, backgroundColor: color }} 
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-xs font-mono text-zinc-500">
                          Awaiting task dispatch...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/80 mt-4 text-[10px] font-mono text-zinc-500 flex justify-between">
                    <span>Cluster: US-Central-1</span>
                    <span className="text-emerald-400">â— Nominal Status</span>
                  </div>
                </div>
              </div>

              {/* Models Comparison Section */}
              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-none">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                      <Server className="w-4 h-4 text-purple-400" />
                      LLM Model Performance Comparison
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      Metrics across primary and fallback inference models on Groq
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                        <th className="py-2.5 px-3">Model Architecture</th>
                        <th className="py-2.5 px-3">Total Invocations</th>
                        <th className="py-2.5 px-3">Avg Latency</th>
                        <th className="py-2.5 px-3">Tokens Consumed</th>
                        <th className="py-2.5 px-3">Success Rate</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {data?.models && data.models.length > 0 ? (
                        data.models.map((m) => (
                          <tr key={m.model} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="py-3 px-3 text-zinc-200 font-bold flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-amber-400" />
                              {m.model}
                            </td>
                            <td className="py-3 px-3 text-zinc-300">{m.requests}</td>
                            <td className="py-3 px-3 text-amber-400 font-mono">{m.avg_latency_ms} ms</td>
                            <td className="py-3 px-3 text-zinc-400">{m.total_tokens.toLocaleString()}</td>
                            <td className="py-3 px-3 text-emerald-400">{m.success_rate}%</td>
                            <td className="py-3 px-3 text-right">
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                ACTIVE
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-zinc-500">
                            No model telemetry recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {/* TAB 2: TELEMETRY AUDIT LOGS                                       */}
          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'logs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Search & Filter Bar */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs by prompt, reply, user, model..."
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 px-3 py-1.5 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Task filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 px-3 py-1.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">All Tasks</option>
                    <option value="career_chat">Career Chat</option>
                    <option value="career_intelligence">Career Intelligence</option>
                    <option value="resume_intelligence">Resume Intelligence</option>
                    <option value="code_evaluation">Code Evaluation</option>
                    <option value="gap_challenge">Gap Challenge</option>
                    <option value="diagnostic_probe">Diagnostic Probe</option>
                  </select>

                  {/* Status filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 px-3 py-1.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                    <option value="fallback">Fallback</option>
                  </select>

                  {/* Download filtered logs */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => downloadBotReport('csv', days, typeFilter || undefined, statusFilter || undefined)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-400 text-xs font-mono flex items-center gap-1.5 transition-all"
                      title="Download filtered logs as CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>EXPORT CSV</span>
                    </button>
                    <button
                      onClick={() => downloadBotReport('json', days, typeFilter || undefined, statusFilter || undefined)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/40 text-zinc-300 hover:text-blue-400 text-xs font-mono flex items-center gap-1.5 transition-all"
                      title="Download filtered logs as JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>EXPORT JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-zinc-950 border border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 text-[10px] uppercase">
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Task Type</th>
                        <th className="py-2.5 px-3">Model</th>
                        <th className="py-2.5 px-3">Latency</th>
                        <th className="py-2.5 px-3">Tokens</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Prompt / Preview</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => {
                          const isSuccess = log.status === 'success';
                          const color = TASK_COLORS[log.interaction_type] || '#71717a';
                          return (
                            <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                              <td className="py-3 px-3 text-zinc-400 whitespace-nowrap text-[11px]">
                                {log.timestamp}
                              </td>
                              <td className="py-3 px-3">
                                <span 
                                  className="text-[10px] font-mono uppercase px-2 py-0.5 border"
                                  style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}
                                >
                                  {log.interaction_type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-zinc-300 font-bold">
                                {log.model.split('/').pop()}
                              </td>
                              <td className="py-3 px-3 font-mono">
                                <span className={log.latency_ms < 1500 ? 'text-emerald-400' : 'text-amber-400'}>
                                  {log.latency_ms} ms
                                </span>
                              </td>
                              <td className="py-3 px-3 text-zinc-400">
                                {log.tokens}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 ${
                                  isSuccess 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 max-w-[280px] truncate text-zinc-400 text-[11px]">
                                {log.prompt_preview || log.response_preview || 'No preview'}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedLog(log)}
                                    className="px-2 py-0.5 text-[10px] uppercase font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
                                  >
                                    Inspect
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(log.id, 1)}
                                    className={`p-1 text-xs hover:text-emerald-400 ${
                                      log.user_rating === 1 ? 'text-emerald-400' : 'text-zinc-600'
                                    }`}
                                    title="Good Response"
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(log.id, -1)}
                                    className={`p-1 text-xs hover:text-rose-400 ${
                                      log.user_rating === -1 ? 'text-rose-400' : 'text-zinc-600'
                                    }`}
                                    title="Poor Response"
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-xs font-mono text-zinc-500">
                            No telemetry logs matched your query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {/* TAB 3: LIVE PROBE CONSOLE                                         */}
          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'diagnostic' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      Live Neural Diagnostic & Latency Benchmark
                    </h3>
                    <p className="text-xs font-mono text-zinc-500 mt-1">
                      Directly triggers a live round-trip inference payload to Groq to verify connectivity and measure latency.
                    </p>
                  </div>

                  <button
                    onClick={handleRunProbe}
                    disabled={probing}
                    className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-amber-500/20"
                  >
                    <Zap className={`w-4 h-4 ${probing ? 'animate-spin' : ''}`} />
                    <span>{probing ? 'RUNNING TEST...' : 'FIRE DIAGNOSTIC PROBE'}</span>
                  </button>
                </div>

                {/* Diagnostic Results Card */}
                {diagnosticResult ? (
                  <div className={`p-5 border ${
                    diagnosticResult.status === 'healthy' 
                      ? 'bg-emerald-950/20 border-emerald-500/30' 
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                      <div className="flex items-center gap-2.5">
                        {diagnosticResult.status === 'healthy' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                        <div>
                          <div className="text-xs font-mono font-bold text-zinc-100 uppercase">
                            DIAGNOSTIC STATUS: {diagnosticResult.status.toUpperCase()}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            Timestamp: {diagnosticResult.timestamp}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-mono font-bold text-amber-400">
                          {diagnosticResult.latency_ms} ms
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">
                          ROUND-TRIP TIME
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono mb-4">
                      <div className="bg-zinc-900/80 p-3 border border-zinc-800">
                        <span className="text-[10px] text-zinc-500 uppercase block mb-1">Provider Engine</span>
                        <span className="text-zinc-200 font-bold uppercase">{diagnosticResult.provider}</span>
                      </div>
                      <div className="bg-zinc-900/80 p-3 border border-zinc-800">
                        <span className="text-[10px] text-zinc-500 uppercase block mb-1">Verified Model</span>
                        <span className="text-amber-400 font-bold">{diagnosticResult.model}</span>
                      </div>
                      <div className="bg-zinc-900/80 p-3 border border-zinc-800">
                        <span className="text-[10px] text-zinc-500 uppercase block mb-1">Health Verdict</span>
                        <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
                      </div>
                    </div>

                    {diagnosticResult.response && (
                      <div className="bg-zinc-900/90 border border-zinc-800 p-4 font-mono text-xs">
                        <span className="text-[10px] text-zinc-500 uppercase block mb-2">// RESPONSE PAYLOAD</span>
                        <p className="text-zinc-200 leading-relaxed">{diagnosticResult.response}</p>
                      </div>
                    )}

                    {diagnosticResult.error && (
                      <div className="bg-rose-950/40 border border-rose-500/40 p-4 font-mono text-xs text-rose-300">
                        <span className="text-[10px] text-rose-400 uppercase block mb-1">// ERROR LOG</span>
                        <p>{diagnosticResult.error}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-zinc-800 text-zinc-500 font-mono text-xs">
                    Press "FIRE DIAGNOSTIC PROBE" to initiate real-time telemetry benchmark.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {/* LOG DETAIL INSPECT MODAL                                          */}
          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          <AnimatePresence>
            {selectedLog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                        TELEMETRY RECORD INSPECTOR // {selectedLog.id.slice(0, 8)}
                      </h4>
                      <p className="text-[10px] font-mono text-zinc-500">
                        {selectedLog.timestamp} â€¢ {selectedLog.interaction_type}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="text-zinc-500 hover:text-zinc-200 font-mono text-xs"
                    >
                      [CLOSE]
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono mb-4">
                    <div className="bg-zinc-900 p-2.5 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block">Model</span>
                      <span className="text-zinc-200 font-bold">{selectedLog.model}</span>
                    </div>
                    <div className="bg-zinc-900 p-2.5 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block">Latency</span>
                      <span className="text-amber-400 font-bold">{selectedLog.latency_ms} ms</span>
                    </div>
                    <div className="bg-zinc-900 p-2.5 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block">Tokens</span>
                      <span className="text-purple-400 font-bold">{selectedLog.tokens}</span>
                    </div>
                    <div className="bg-zinc-900 p-2.5 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block">Status</span>
                      <span className="text-emerald-400 font-bold uppercase">{selectedLog.status}</span>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block mb-1.5">// PROMPT INPUT</span>
                      <div className="bg-zinc-900/90 border border-zinc-800 p-3 text-zinc-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {selectedLog.prompt_preview || 'No prompt recorded'}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block mb-1.5">// RESPONSE CONTENT</span>
                      <div className="bg-zinc-900/90 border border-zinc-800 p-3 text-zinc-200 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {selectedLog.response_preview || 'No response recorded'}
                      </div>
                    </div>

                    {selectedLog.error_message && (
                      <div>
                        <span className="text-[10px] text-rose-500 uppercase block mb-1.5">// ERROR DETAILS</span>
                        <div className="bg-rose-950/30 border border-rose-500/30 p-3 text-rose-300">
                          {selectedLog.error_message}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-800 mt-6 flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-500">User: {selectedLog.user_email}</span>
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </SentinelPageShell>
    </Layout>
  );
};

export default BotAnalyticsPage;





