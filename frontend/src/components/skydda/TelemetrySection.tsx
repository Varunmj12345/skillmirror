import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Shield,
  Zap,
  TrendingUp,
  Activity,
  Cpu,
  ArrowUpRight,
  Radio,
  Layers,
  Terminal,
  Clock,
  Sparkles
} from 'lucide-react';

type Timeframe = '7d' | '30d' | '12m';
type MetricView = 'compensation' | 'demand' | 'readiness';

const chartDataSets: Record<MetricView, Record<Timeframe, { label: string; user: number; market: number; target: number }[]>> = {
  compensation: {
    '7d': [
      { label: 'Day 1', user: 142, market: 125, target: 155 },
      { label: 'Day 2', user: 144, market: 126, target: 155 },
      { label: 'Day 3', user: 145, market: 128, target: 158 },
      { label: 'Day 4', user: 149, market: 129, target: 160 },
      { label: 'Day 5', user: 152, market: 130, target: 162 },
      { label: 'Day 6', user: 155, market: 132, target: 165 },
      { label: 'Day 7', user: 162, market: 134, target: 170 },
    ],
    '30d': [
      { label: 'Wk 1', user: 120, market: 115, target: 140 },
      { label: 'Wk 2', user: 135, market: 120, target: 150 },
      { label: 'Wk 3', user: 148, market: 125, target: 160 },
      { label: 'Wk 4', user: 162, market: 130, target: 170 },
      { label: 'Wk 5', user: 175, market: 135, target: 185 },
    ],
    '12m': [
      { label: 'Q1', user: 110, market: 105, target: 130 },
      { label: 'Q2', user: 130, market: 115, target: 150 },
      { label: 'Q3', user: 155, market: 125, target: 170 },
      { label: 'Q4', user: 185, market: 140, target: 200 },
    ],
  },
  demand: {
    '7d': [
      { label: 'Day 1', user: 78, market: 65, target: 85 },
      { label: 'Day 2', user: 80, market: 68, target: 86 },
      { label: 'Day 3', user: 82, market: 70, target: 88 },
      { label: 'Day 4', user: 85, market: 72, target: 90 },
      { label: 'Day 5', user: 88, market: 73, target: 92 },
      { label: 'Day 6', user: 91, market: 75, target: 95 },
      { label: 'Day 7', user: 96, market: 78, target: 98 },
    ],
    '30d': [
      { label: 'Wk 1', user: 70, market: 60, target: 80 },
      { label: 'Wk 2', user: 78, market: 65, target: 85 },
      { label: 'Wk 3', user: 85, market: 70, target: 90 },
      { label: 'Wk 4', user: 92, market: 75, target: 95 },
      { label: 'Wk 5', user: 96, market: 78, target: 98 },
    ],
    '12m': [
      { label: 'Q1', user: 65, market: 55, target: 75 },
      { label: 'Q2', user: 76, market: 62, target: 85 },
      { label: 'Q3', user: 88, market: 70, target: 92 },
      { label: 'Q4', user: 96, market: 78, target: 99 },
    ],
  },
  readiness: {
    '7d': [
      { label: 'Day 1', user: 82, market: 70, target: 90 },
      { label: 'Day 2', user: 84, market: 71, target: 91 },
      { label: 'Day 3', user: 86, market: 72, target: 92 },
      { label: 'Day 4', user: 89, market: 73, target: 93 },
      { label: 'Day 5', user: 91, market: 74, target: 94 },
      { label: 'Day 6', user: 93, market: 75, target: 95 },
      { label: 'Day 7', user: 94, market: 76, target: 96 },
    ],
    '30d': [
      { label: 'Wk 1', user: 74, market: 68, target: 85 },
      { label: 'Wk 2', user: 80, market: 70, target: 88 },
      { label: 'Wk 3', user: 86, market: 72, target: 91 },
      { label: 'Wk 4', user: 91, market: 74, target: 94 },
      { label: 'Wk 5', user: 94, market: 76, target: 96 },
    ],
    '12m': [
      { label: 'Q1', user: 68, market: 62, target: 80 },
      { label: 'Q2', user: 78, market: 68, target: 86 },
      { label: 'Q3', user: 88, market: 72, target: 92 },
      { label: 'Q4', user: 94, market: 76, target: 96 },
    ],
  },
};

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 shadow-2xl text-xs font-mono">
        <div className="text-zinc-400 font-bold mb-1.5 pb-1 border-b border-zinc-800">
          TIMEFRAME: {label}
        </div>
        <div className="text-amber-400 font-bold flex items-center justify-between gap-4">
          <span>YOUR VECTOR:</span>
          <span>{unit === '$' ? `$${payload[0]?.value}k` : `${payload[0]?.value}%`}</span>
        </div>
        <div className="text-zinc-300 flex items-center justify-between gap-4 mt-1">
          <span>TARGET BENCHMARK:</span>
          <span>{unit === '$' ? `$${payload[1]?.value}k` : `${payload[1]?.value}%`}</span>
        </div>
        <div className="text-zinc-500 flex items-center justify-between gap-4 mt-1">
          <span>MARKET MEDIAN:</span>
          <span>{unit === '$' ? `$${payload[2]?.value}k` : `${payload[2]?.value}%`}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function TelemetrySection() {
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [metricView, setMetricView] = useState<MetricView>('compensation');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [activeSignalFilter, setActiveSignalFilter] = useState<'all' | 'high' | 'market'>('all');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const chartData = useMemo(() => {
    return chartDataSets[metricView][timeframe];
  }, [metricView, timeframe]);

  const unit = metricView === 'compensation' ? '$' : '%';

  const liveSignals = [
    {
      id: 'SIG-901',
      type: 'HIRING SURGE',
      priority: 'high',
      time: '2m ago',
      title: 'PYTORCH & DISTRIBUTED SYSTEMS SPIKE',
      desc: '+38.4% increase in Staff AI Engineer openings across Tier-1 AI infrastructure teams.',
      impact: '+14% Market Velocity',
    },
    {
      id: 'SIG-902',
      type: 'COMPENSATION',
      priority: 'medium',
      time: '18m ago',
      title: 'SENIOR TECH LEAD SALARY LIFT',
      desc: 'Remote US/EU contract baselines adjusted up to $185k–$225k base compensation tier.',
      impact: '+$35k Projected Lift',
    },
    {
      id: 'SIG-903',
      type: 'CAPABILITY DRIFT',
      priority: 'high',
      time: '1h ago',
      title: 'KUBERNETES & CACHE DEFICIT DETECTED',
      desc: 'Closing Redis clustering & container networking gaps unlocks Top 3% qualification tier.',
      impact: '3 Critical Sprints',
    },
    {
      id: 'SIG-904',
      type: 'RECRUITER MESH',
      priority: 'medium',
      time: '3h ago',
      title: 'INBOUND SEARCH PATTERN SURGE',
      desc: '42 verified partner engineering directors indexed Digital Twins with your capability stack.',
      impact: '98.4% Profile Match',
    },
  ];

  const filteredSignals = useMemo(() => {
    if (activeSignalFilter === 'all') return liveSignals;
    if (activeSignalFilter === 'high') return liveSignals.filter(s => s.priority === 'high');
    return liveSignals.filter(s => s.type.includes('HIRING') || s.type.includes('COMPENSATION'));
  }, [activeSignalFilter]);

  return (
    <section id="telemetry" className="w-full bg-zinc-950 text-white py-24 border-b border-zinc-800 relative overflow-hidden">
      {/* Background Subtle Technical Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative z-10 space-y-16">
        {/* ── Section Header ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-3.5 py-1.5 border border-zinc-800 bg-zinc-900/90 w-fit">
            <span className="w-2 h-2 bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Live Intelligence Telemetry
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold tracking-tight text-zinc-100 uppercase">
                Real-Time Career Vector Signals
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base font-mono max-w-2xl leading-relaxed">
                Decentralized telemetry continuously evaluating market hiring dynamics, ATS parsing integrity, and individual capability trajectories.
              </p>
            </div>

            {/* Live Operational Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 px-3 py-2 border border-zinc-800 bg-zinc-900/90 text-zinc-300">
                <span className="w-1.5 h-1.5 bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-bold">STREAM ONLINE</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border border-zinc-800 bg-zinc-900/90 text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentTime || 'SYNCING...'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 1. Top Telemetry Metrics Ribbon (4 Precision Cards) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-5 border border-zinc-800 bg-zinc-900/90 hover:border-amber-400/50 transition-all space-y-3 group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                [ VECTOR_01 ]
              </span>
              <span className="px-1.5 py-0.5 border border-amber-400/30 bg-amber-400/10 text-amber-400 text-[9px] font-mono font-bold">
                TOP 5%
              </span>
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Readiness Index
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-mono font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                  94.2%
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center">
                  +9.2% ↑
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
              <span>TARGET: 85.0%</span>
              <span className="text-zinc-400">OUTPERFORMING</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 border border-zinc-800 bg-zinc-900/90 hover:border-amber-400/50 transition-all space-y-3 group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                [ VECTOR_02 ]
              </span>
              <span className="px-1.5 py-0.5 border border-amber-400/30 bg-amber-400/10 text-amber-400 text-[9px] font-mono font-bold">
                AUDIT READY
              </span>
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Skill Delta Deficits
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-mono font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                  3 GAPS
                </span>
                <span className="text-xs font-mono text-zinc-400 font-bold">
                  [SOLVABLE]
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
              <span>REDIS • K8S • ARCH</span>
              <span className="text-amber-400">3 SPRINTS</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 border border-zinc-800 bg-zinc-900/90 hover:border-amber-400/50 transition-all space-y-3 group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                [ VECTOR_03 ]
              </span>
              <span className="px-1.5 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold">
                PROJECTED
              </span>
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Market Salary Lift
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-mono font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                  +$42.5k
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  / YEAR
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
              <span>MEDIAN: $140,000</span>
              <span className="text-zinc-400">90TH PERCENTILE</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-5 border border-zinc-800 bg-zinc-900/90 hover:border-amber-400/50 transition-all space-y-3 group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                [ VECTOR_04 ]
              </span>
              <span className="px-1.5 py-0.5 border border-zinc-700 bg-zinc-950 text-zinc-300 text-[9px] font-mono font-bold">
                FIDELITY
              </span>
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                ATS Parsing Shield
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-mono font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                  98.4
                </span>
                <span className="text-xs font-mono text-zinc-500 font-bold">
                  / 100
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
              <span>SCREENING RATE: 99.2%</span>
              <span className="text-emerald-400">OPTIMAL</span>
            </div>
          </div>
        </div>

        {/* ── 2. Interactive Market & Vector Trajectory Console ── */}
        <div className="border border-zinc-800 bg-zinc-900/90 p-6 md:p-8 space-y-6">
          {/* Console Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400" />
                <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                  AUTONOMOUS VECTOR TRAJECTORY MODEL
                </h3>
              </div>
              <p className="text-[11px] font-mono text-zinc-500">
                Multi-axial career compensation, demand velocities, and qualification milestones.
              </p>
            </div>

            {/* Metric Mode Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800">
                {(['compensation', 'demand', 'readiness'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetricView(m)}
                    className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                      metricView === m
                        ? 'bg-amber-400 text-zinc-950'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {m === 'compensation' ? 'SALARY ALPHA' : m === 'demand' ? 'MARKET DEMAND' : 'READINESS'}
                  </button>
                ))}
              </div>

              {/* Timeframe Selectors */}
              <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800">
                {(['7d', '30d', '12m'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase transition-all ${
                      timeframe === t
                        ? 'border border-amber-400/50 bg-amber-400/10 text-amber-400'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recharts Area Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="vectorAmberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="marketZincGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                  fontFamily="monospace"
                  domain={metricView === 'compensation' ? [100, 210] : [50, 100]}
                />
                <Tooltip content={<CustomTooltip unit={unit} />} />
                <Area
                  type="monotone"
                  dataKey="user"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#vectorAmberGradient)"
                  name="Your Vector"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#e4e4e7"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                  name="Target Benchmark"
                />
                <Area
                  type="monotone"
                  dataKey="market"
                  stroke="#52525b"
                  strokeWidth={1}
                  fillOpacity={1}
                  fill="url(#marketZincGradient)"
                  name="Market Median"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend & Telemetry Readouts */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-800 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-400" />
                <span className="text-zinc-200">YOUR TRAJECTORY VECTOR</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 border-t border-dashed border-zinc-300" />
                <span className="text-zinc-400">STAFF TARGET BENCHMARK</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-zinc-700" />
                <span className="text-zinc-500">MARKET MEDIAN</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-zinc-400">
              <span>SAMPLING: 52,480 LIVE NODES</span>
              <span className="text-amber-400 font-bold">CONFIDENCE: 99.4%</span>
            </div>
          </div>
        </div>

        {/* ── 3. Split Matrix: Live Signal Stream vs Autonomous System Defense ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Live Signals Stream */}
          <div className="border border-zinc-800 bg-zinc-900/90 p-6 md:p-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 border border-amber-400/30 bg-amber-400/10 flex items-center justify-center text-amber-400 text-xs">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider">
                      LIVE SIGNALS & VECTOR ALERTS
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500">Continuous early warning intelligence</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  {(['all', 'high', 'market'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveSignalFilter(filter)}
                      className={`px-2 py-1 uppercase border transition-all ${
                        activeSignalFilter === filter
                          ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Signals Feed */}
              <div className="space-y-3">
                {filteredSignals.map((sig) => (
                  <div
                    key={sig.id}
                    className="p-3.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 border font-bold uppercase ${
                          sig.priority === 'high'
                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                            : 'border-amber-400/40 bg-amber-400/10 text-amber-400'
                        }`}>
                          [ {sig.type} ]
                        </span>
                        <span className="text-zinc-500">{sig.id}</span>
                      </div>
                      <span className="text-zinc-500">{sig.time}</span>
                    </div>

                    <h4 className="text-xs font-mono font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">
                      {sig.title}
                    </h4>

                    <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                      {sig.desc}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                      <span className="text-amber-400 font-bold">{sig.impact}</span>
                      <span className="text-zinc-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                        <span>DRILL DOWN</span>
                        <ArrowUpRight className="w-3 h-3 text-amber-400" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <Link href="/smart-alerts">
                <button className="w-full py-2.5 bg-zinc-950 border border-zinc-800 hover:border-amber-400 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                  <span>OPEN FULL SIGNALS COMMAND CENTER</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Right: Autonomous System Defense & Capability Matrix */}
          <div className="border border-zinc-800 bg-zinc-900/90 p-6 md:p-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 border border-amber-400/30 bg-amber-400/10 flex items-center justify-center text-amber-400 text-xs">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider">
                      AUTONOMOUS DEFENSE POSTURE
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500">Real-time heuristics and telemetry integrity</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                  99.98% HEALTH
                </span>
              </div>

              {/* Status Nodes Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
                    <span>ATS CORE</span>
                    <span className="w-1.5 h-1.5 bg-emerald-400" />
                  </div>
                  <div className="text-base font-mono font-bold text-zinc-100">99.8% FIDELITY</div>
                  <p className="text-[9px] font-mono text-emerald-400 uppercase">[OPERATIONAL]</p>
                </div>

                <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
                    <span>CRAWLER MESH</span>
                    <span className="w-1.5 h-1.5 bg-amber-400 animate-pulse" />
                  </div>
                  <div className="text-base font-mono font-bold text-zinc-100">52,480 NODES</div>
                  <p className="text-[9px] font-mono text-amber-400 uppercase">[STREAMING]</p>
                </div>

                <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
                    <span>AI SYNTHESIZER</span>
                    <span className="w-1.5 h-1.5 bg-emerald-400" />
                  </div>
                  <div className="text-base font-mono font-bold text-zinc-100">v2.4 KERNEL</div>
                  <p className="text-[9px] font-mono text-emerald-400 uppercase">[SYNCHRONIZED]</p>
                </div>

                <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
                    <span>LATENCY PING</span>
                    <span className="w-1.5 h-1.5 bg-amber-400" />
                  </div>
                  <div className="text-base font-mono font-bold text-zinc-100">14MS LATENCY</div>
                  <p className="text-[9px] font-mono text-amber-400 uppercase">[REALTIME]</p>
                </div>
              </div>

              {/* Capability Benchmark Vector Bars */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Target Domain Competency Weights
                </span>

                <div className="space-y-2.5">
                  {[
                    { domain: 'Distributed Systems & Microservices', pct: 92, tier: 'Top 3%' },
                    { domain: 'AI Architecture & Vector Pipelines', pct: 96, tier: 'Top 1%' },
                    { domain: 'Cloud Infrastructure & Kubernetes', pct: 84, tier: 'Top 8%' },
                    { domain: 'Runtime Complexity & Algorithmic Profiling', pct: 90, tier: 'Top 4%' },
                  ].map((bar, i) => (
                    <div key={i} className="p-2.5 bg-zinc-950 border border-zinc-800 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-zinc-300 font-bold">{bar.domain}</span>
                        <span className="text-amber-400 font-bold">{bar.pct}% ({bar.tier})</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-amber-400 transition-all duration-700"
                          style={{ width: `${bar.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <Link href="/skill-gap">
                <button className="w-full py-2.5 bg-zinc-950 border border-zinc-800 hover:border-amber-400 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                  <span>AUDIT YOUR FULL SKILL GAP RADAR</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── 4. Network Mastery & Verified Candidate Nodes ── */}
        <div className="border border-zinc-800 bg-zinc-900/90 p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 border border-amber-400/30 bg-amber-400/10 flex items-center justify-center text-amber-400 text-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider">
                  VERIFIED CANDIDATE VECTOR NETWORK
                </h3>
                <p className="text-[10px] font-mono text-zinc-500">Anonymized high-performing node benchmarks</p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold text-amber-400 px-2 py-1 border border-amber-400/30 bg-amber-400/10 uppercase">
              SEASON 4 LIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'NODE_VORTEX', role: 'Staff AI Systems Architect', streak: '4-Wk Streak 🔥', score: 980, skills: ['PyTorch', 'Next.js', 'Redis'], tier: 'TOP 1%' },
              { id: 'NODE_DEV_SYS', role: 'Senior Distributed Engineer', streak: '2-Wk Streak ⚡', score: 845, skills: ['Go', 'K8s', 'Kafka'], tier: 'TOP 4%' },
              { id: 'NODE_CYBER', role: 'Lead Frontend Systems Engineer', streak: '6-Day Streak', score: 760, skills: ['React', 'WebGL', 'TypeScript'], tier: 'TOP 8%' },
              { id: 'NODE_ZENITH', role: 'AI Infrastructure Specialist', streak: '1-Wk Streak', score: 690, skills: ['Python', 'Docker', 'FastAPI'], tier: 'TOP 12%' },
            ].map((node, i) => (
              <div key={i} className="p-4 bg-zinc-950 border border-zinc-800 hover:border-amber-400/50 transition-all space-y-3 group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 border border-zinc-700 bg-zinc-900 flex items-center justify-center text-[10px] font-mono font-bold text-amber-400">
                      #{i + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">
                      {node.id}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-400 border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.2">
                    {node.tier}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-mono text-zinc-400 truncate">{node.role}</p>
                  <p className="text-[10px] font-mono text-emerald-400 font-bold mt-0.5">{node.streak}</p>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {node.skills.map(sk => (
                    <span key={sk} className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {sk}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-500">POINTS:</span>
                  <span className="text-zinc-100 font-bold">{node.score} PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. Bottom Trajectory Synchronization CTA ── */}
        <div className="border border-amber-400/40 bg-amber-400/5 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 animate-pulse" />
              <h3 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-wider">
                SYNCHRONIZE YOUR CAREER VECTOR NOW
              </h3>
            </div>
            <p className="text-xs font-mono text-zinc-300 max-w-xl leading-relaxed">
              Activate autonomous market tracking, calibrate ATS screening heuristics, and synthesize your custom sprint roadmap in under 60 seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/roadmap">
              <button className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-all border border-amber-400 flex items-center gap-2">
                <span>INITIALIZE ROADMAP</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-200 border border-zinc-700 hover:border-zinc-500 font-mono font-bold text-xs uppercase tracking-wider transition-all">
                JOIN THE MESH
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TelemetrySection;
