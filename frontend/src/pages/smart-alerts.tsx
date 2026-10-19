import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { alertService, SmartAlert, WeeklySummary } from '../services/alertService';
import Link from 'next/link';
import { SkeletonCard } from '../components/motion/Skeleton';
import { ScrollReveal, StaggerChildren } from '../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../components/CyberPageShell';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/motion/Toast';

const SmartAlertsPage: React.FC = () => {
    const { addToast } = useToast();
    const [alerts, setAlerts] = useState<SmartAlert[]>([]);
    const [summary, setSummary] = useState<WeeklySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'impact' | 'confidence'>('impact');
    const [expandedAlerts, setExpandedAlerts] = useState<Record<number, boolean>>({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadData = async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) setIsRefreshing(true);
            else setLoading(true);

            const [alertRes, summaryRes]: [any, any] = await Promise.all([
                alertService.getAlerts(),
                alertService.getWeeklySummary()
            ]);

            const alertData = Array.isArray(alertRes) ? alertRes : (alertRes?.data || []);
            setAlerts(alertData);
            setSummary(summaryRes?.data || summaryRes);

            if (showRefreshToast) {
                addToast({
                    type: 'success',
                    title: 'Signals Synchronized',
                    message: `Telemetry updated. ${alertData.length} live career signals evaluated.`
                });
            }
        } catch (err) {
            console.error('Failed to load alerts data', err);
            addToast({
                type: 'error',
                title: 'Sync Failed',
                message: 'Could not connect to the career intelligence telemetry feed.'
            });
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedAlerts(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAction = async (id: number, type: 'read' | 'dismiss' | 'snooze') => {
        try {
            if (type === 'read') {
                await alertService.markAsRead(id);
                setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
                addToast({ type: 'info', title: 'Signal Marked as Read' });
            } else if (type === 'dismiss') {
                await alertService.dismiss(id);
                setAlerts(prev => prev.filter(a => a.id !== id));
                addToast({ type: 'info', title: 'Signal Dismissed' });
            } else if (type === 'snooze') {
                await alertService.snooze(id);
                setAlerts(prev => prev.filter(a => a.id !== id));
                addToast({ type: 'warning', title: 'Snoozed for 24h', message: 'This alert will be hidden until tomorrow.' });
            }
        } catch (error) {
            console.error(`Action ${type} failed`, error);
            addToast({ type: 'error', title: 'Action Failed', message: 'Please try again later.' });
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await alertService.markAllRead();
            setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
            addToast({
                type: 'success',
                title: 'Signals Acknowledged',
                message: 'All unread career alerts have been marked as read.'
            });
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to mark all read' });
        }
    };

    const stats = useMemo(() => {
        const list = alerts || [];
        return {
            total: list.length,
            unread: list.filter(a => !a.is_read).length,
            critical: list.filter(a => a.category === 'critical' || a.priority === 'high' || a.alert_type === 'predictive_risk').length,
            opportunities: list.filter(a => a.alert_type === 'opportunity' || a.alert_type === 'market').length,
            avgConfidence: list.length ? Math.round(list.reduce((acc, curr) => acc + (curr.confidence_score || 85), 0) / list.length) : 94
        };
    }, [alerts]);

    const filterOptions = [
        { id: 'all', label: 'All Signals', count: alerts.length, icon: 'fa-layer-group' },
        { id: 'market', label: 'Market Intel', count: alerts.filter(a => a.alert_type === 'market').length, icon: 'fa-briefcase' },
        { id: 'opportunity', label: 'Opportunities', count: alerts.filter(a => a.alert_type === 'opportunity').length, icon: 'fa-wand-magic-sparkles' },
        { id: 'predictive_risk', label: 'Predictive Risk', count: alerts.filter(a => a.alert_type === 'predictive_risk').length, icon: 'fa-triangle-exclamation' },
        { id: 'skill_gap', label: 'Skill Drift', count: alerts.filter(a => a.alert_type === 'skill_gap').length, icon: 'fa-chart-pie' },
        { id: 'behavioral', label: 'Behavioral & Roadmap', count: alerts.filter(a => a.alert_type === 'behavioral' || a.alert_type === 'roadmap').length, icon: 'fa-route' },
    ];

    const filteredAlerts = useMemo(() => {
        let result = [...alerts];

        if (filter !== 'all') {
            if (filter === 'behavioral') {
                result = result.filter(a => a.alert_type === 'behavioral' || a.alert_type === 'roadmap');
            } else {
                result = result.filter(a => a.alert_type === filter);
            }
        }

        if (unreadOnly) {
            result = result.filter(a => !a.is_read);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(a =>
                a.message?.toLowerCase().includes(query) ||
                a.ai_reasoning?.toLowerCase().includes(query) ||
                a.alert_type?.toLowerCase().includes(query) ||
                a.predicted_risk_level?.toLowerCase().includes(query)
            );
        }

        result.sort((a, b) => {
            if (sortBy === 'impact') return (b.impact_score || 0) - (a.impact_score || 0);
            if (sortBy === 'confidence') return (b.confidence_score || 0) - (a.confidence_score || 0);
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return result;
    }, [alerts, filter, unreadOnly, searchQuery, sortBy]);

    const getAlertUI = (alert: SmartAlert) => {
        const themeMap: Record<string, {
            icon: string;
            label: string;
            badgeColor: string;
            accentDot: string;
        }> = {
            market: {
                icon: 'fa-chart-line',
                label: 'Market Surge',
                badgeColor: 'bg-zinc-950 text-amber-400 border-amber-500/30',
                accentDot: 'bg-amber-400'
            },
            opportunity: {
                icon: 'fa-wand-magic-sparkles',
                label: 'AI Opportunity',
                badgeColor: 'bg-zinc-950 text-emerald-400 border-emerald-500/30',
                accentDot: 'bg-emerald-400'
            },
            predictive_risk: {
                icon: 'fa-triangle-exclamation',
                label: 'Predictive Risk',
                badgeColor: 'bg-zinc-950 text-rose-400 border-rose-500/30',
                accentDot: 'bg-rose-400'
            },
            skill_gap: {
                icon: 'fa-chart-pie',
                label: 'Skill Gap',
                badgeColor: 'bg-zinc-950 text-amber-400 border-amber-500/30',
                accentDot: 'bg-amber-400'
            },
            roadmap: {
                icon: 'fa-route',
                label: 'Milestone Pace',
                badgeColor: 'bg-zinc-950 text-zinc-300 border-zinc-800',
                accentDot: 'bg-zinc-400'
            },
            behavioral: {
                icon: 'fa-brain',
                label: 'Behavioral Vector',
                badgeColor: 'bg-zinc-950 text-zinc-300 border-zinc-800',
                accentDot: 'bg-zinc-400'
            },
            readiness: {
                icon: 'fa-shield-halved',
                label: 'Readiness Shift',
                badgeColor: 'bg-zinc-950 text-emerald-400 border-emerald-500/30',
                accentDot: 'bg-emerald-400'
            },
            interview: {
                icon: 'fa-microphone-lines',
                label: 'Interview Radar',
                badgeColor: 'bg-zinc-950 text-amber-400 border-amber-500/30',
                accentDot: 'bg-amber-400'
            },
            achievement: {
                icon: 'fa-trophy',
                label: 'Achievement',
                badgeColor: 'bg-zinc-950 text-emerald-400 border-emerald-500/30',
                accentDot: 'bg-emerald-400'
            }
        };

        return themeMap[alert.alert_type] || {
            icon: 'fa-bell',
            label: 'System Signal',
            badgeColor: 'bg-zinc-950 text-zinc-400 border-zinc-800',
            accentDot: 'bg-zinc-500'
        };
    };

    return (
        <Layout>
            <Head>
                <title>Smart Career Signals & Alerts • SkillMirror OS</title>
                <meta name="description" content="AI-Powered career intelligence telemetry, market spikes, and skill drift alerts." />
            </Head>

            <CyberPageShell
                moduleCode="ALT-01"
                section="AI CAREER ENGINE"
                badge="TELEMETRY SCANNER: ACTIVE"
                title="SMART CAREER ALERTS"
                subtitle="Autonomous signal ingestion tracking market demand surges, competency drift, and career acceleration vectors."
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => loadData(true)}
                            disabled={isRefreshing}
                            className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                            title="Synchronize Feed"
                        >
                            <i className={`fa-solid fa-arrows-rotate text-xs text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Sync Signals</span>
                        </button>
                        <button
                            onClick={handleMarkAllRead}
                            disabled={stats.unread === 0}
                            className={`px-4 py-2 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                                stats.unread > 0 
                                    ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-sm' 
                                    : 'bg-zinc-950 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                            }`}
                        >
                            <i className="fa-solid fa-check-double text-xs" />
                            <span>Acknowledge All</span>
                        </button>
                    </div>
                }
                stats={
                    <div className="flex flex-wrap gap-2.5 pt-1">
                        <PageStatChip label="Active Signals" value={stats.total} icon="fa-satellite-dish" color="slate" />
                        <PageStatChip label="Action Required" value={stats.unread} icon="fa-bolt" color="amber" />
                        <PageStatChip label="Model Confidence" value={`${stats.avgConfidence}%`} icon="fa-microchip" color="emerald" />
                    </div>
                }
            />

            <div className="px-4 sm:px-6 pb-20 max-w-[1400px] mx-auto space-y-6 font-mono">
                {/* 1. Weekly AI Intelligence Hub */}
                {summary && (
                    <ScrollReveal>
                        <div className="p-6 sm:p-7 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center">
                                        <i className="fa-solid fa-brain text-base" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                                AUTONOMOUS CAREER COPILOT
                                            </span>
                                        </div>
                                        <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                                            Weekly Intelligence & Trajectory Assessment
                                        </h2>
                                    </div>
                                </div>
                                <span className="text-xs text-zinc-500 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 self-start sm:self-auto">
                                    Horizon: 7 Days
                                </span>
                            </div>

                            {/* 4 Telemetry Metrics Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                                    <span className="text-[10px] font-bold uppercase text-zinc-500">Roadmap Momentum</span>
                                    <div className="text-xl font-bold text-zinc-100 tabular-nums">
                                        {summary.roadmap_completion_rate} <span className="text-xs font-normal text-zinc-500">units</span>
                                    </div>
                                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-amber-400 rounded-full" 
                                            style={{ width: `${Math.min(100, (summary.roadmap_completion_rate / 8) * 100)}%` }} 
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                                    <span className="text-[10px] font-bold uppercase text-zinc-500">Interview Accuracy</span>
                                    <div className="text-xl font-bold text-emerald-400 tabular-nums">
                                        {summary.interview_avg}%
                                    </div>
                                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-400 rounded-full" 
                                            style={{ width: `${summary.interview_avg}%` }} 
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-zinc-500">Dominant Vector</span>
                                    <div className="text-sm font-bold text-zinc-200 truncate" title={summary.strongest_skill}>
                                        {summary.strongest_skill || 'Core Architecture'}
                                    </div>
                                    <span className="text-[10px] text-emerald-400 font-bold block pt-1">
                                        ★ Top 10% Candidate Tier
                                    </span>
                                </div>

                                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-zinc-500">Market Delta</span>
                                    <div className="text-xl font-bold text-amber-400 tabular-nums">
                                        {summary.readiness_delta || '+12.5%'}
                                    </div>
                                    <span className="text-[10px] text-zinc-500 block pt-1">
                                        Readiness velocity lift
                                    </span>
                                </div>
                            </div>

                            {/* Next Best Action Banner */}
                            <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                                        <i className="fa-solid fa-bolt-lightning text-xs" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                            HIGH-IMPACT RECOMMENDED ACTION
                                        </span>
                                        <p className="text-xs text-zinc-300 font-sans mt-0.5">
                                            {summary.next_best_action || 'Complete your active roadmap milestones to boost target readiness.'}
                                        </p>
                                    </div>
                                </div>
                                <Link href="/roadmap" className="shrink-0 w-full sm:w-auto">
                                    <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                                        <span>Accelerate</span>
                                        <i className="fa-solid fa-arrow-right text-[10px]" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* 2. Tri-Stat HUD Cards with Interactive Quick Toggles */}
                <StaggerChildren className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <ScrollReveal stagger>
                        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all flex items-start justify-between">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                    SIGNAL VOLUME
                                </span>
                                <div className="text-3xl font-bold text-zinc-100 mt-1 tabular-nums">
                                    {stats.total}
                                </div>
                                <p className="text-[11px] text-zinc-500 mt-2">
                                    Continuous telemetry indexing.
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                                <i className="fa-solid fa-satellite-dish text-xs" />
                            </div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal stagger>
                        <div 
                            onClick={() => setUnreadOnly(!unreadOnly)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                                unreadOnly 
                                    ? 'bg-zinc-900/90 border-amber-400' 
                                    : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                            }`}
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                        ACTION REQUIRED
                                    </span>
                                    {unreadOnly && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-zinc-950">
                                            FILTERED
                                        </span>
                                    )}
                                </div>
                                <div className="text-3xl font-bold text-amber-400 mt-1 tabular-nums">
                                    {stats.unread}
                                </div>
                                <p className="text-[11px] text-zinc-500 mt-2">
                                    {unreadOnly ? 'Showing unacknowledged signals' : 'Click to isolate pending actions'}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400">
                                <i className="fa-solid fa-lightbulb text-xs" />
                            </div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal stagger>
                        <div 
                            onClick={() => setFilter(filter === 'predictive_risk' ? 'all' : 'predictive_risk')}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                                filter === 'predictive_risk'
                                    ? 'bg-zinc-900/90 border-rose-400'
                                    : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                            }`}
                        >
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                    CRITICAL RISK ANOMALIES
                                </span>
                                <div className={`text-3xl font-bold mt-1 tabular-nums ${stats.critical > 0 ? 'text-rose-400' : 'text-zinc-200'}`}>
                                    {stats.critical}
                                </div>
                                <p className="text-[11px] text-zinc-500 mt-2">
                                    {stats.critical === 0 ? 'Trajectory stabilized. No anomalies.' : 'Drift detected in target competency.'}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-rose-400">
                                <i className="fa-solid fa-triangle-exclamation text-xs" />
                            </div>
                        </div>
                    </ScrollReveal>
                </StaggerChildren>

                {/* 3. Filter Dock & Search */}
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    {/* Category Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                        {filterOptions.map(opt => {
                            const isActive = filter === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setFilter(opt.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                                        isActive
                                            ? 'bg-amber-400 text-zinc-950'
                                            : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                                    }`}
                                >
                                    <i className={`fa-solid ${opt.icon} text-[10px]`} />
                                    <span>{opt.label}</span>
                                    {opt.count > 0 && (
                                        <span className={`px-1 rounded text-[10px] tabular-nums ${isActive ? 'bg-zinc-950/20 text-zinc-950' : 'text-zinc-500'}`}>
                                            {opt.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search & Sort Row */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="relative flex-1 sm:w-56">
                            <i className="fa-solid fa-magnifying-glass text-zinc-500 text-xs absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Filter signals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                                >
                                    <i className="fa-solid fa-xmark" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e: any) => setSortBy(e.target.value)}
                                className="bg-transparent text-xs text-zinc-300 font-bold outline-none cursor-pointer"
                            >
                                <option value="impact" className="bg-zinc-900 text-zinc-200">Impact Score</option>
                                <option value="confidence" className="bg-zinc-900 text-zinc-200">Confidence</option>
                                <option value="newest" className="bg-zinc-900 text-zinc-200">Newest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 4. Alert Feed Stream */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="space-y-3">
                            <SkeletonCard className="!h-28" />
                            <SkeletonCard className="!h-28" />
                            <SkeletonCard className="!h-28" />
                        </div>
                    ) : filteredAlerts.length === 0 ? (
                        <div className="p-12 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-amber-400 text-lg">
                                <i className="fa-solid fa-radar animate-pulse" />
                            </div>
                            <h3 className="text-sm font-bold text-zinc-200 uppercase">
                                Telemetry Clear · Zero Anomalies
                            </h3>
                            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                                No active warnings matching your current filter. Autonomous market monitoring remains active.
                            </p>
                            {(filter !== 'all' || unreadOnly || searchQuery) && (
                                <button
                                    onClick={() => { setFilter('all'); setUnreadOnly(false); setSearchQuery(''); }}
                                    className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer"
                                >
                                    Clear Active Filter
                                </button>
                            )}
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredAlerts.map(alert => {
                                const ui = getAlertUI(alert);
                                const isExpanded = !!expandedAlerts[alert.id];
                                const impactScore = alert.impact_score || 70;
                                const confidence = alert.confidence_score || 92;

                                return (
                                    <motion.div
                                        key={alert.id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                        className={`rounded-2xl bg-zinc-900/90 border p-5 sm:p-6 transition-all ${
                                            !alert.is_read 
                                                ? 'border-zinc-700 bg-zinc-900' 
                                                : 'border-zinc-800 hover:border-zinc-700 opacity-95'
                                        }`}
                                    >
                                        <div className="flex flex-col lg:flex-row gap-5 items-start">
                                            {/* Left Icon & Impact Score */}
                                            <div className="flex lg:flex-col items-center gap-3 shrink-0">
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base border relative ${ui.badgeColor}`}>
                                                    <i className={`fa-solid ${ui.icon}`} />
                                                    {!alert.is_read && (
                                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-zinc-950 animate-pulse" />
                                                    )}
                                                </div>

                                                <div className="flex lg:flex-col items-center gap-1">
                                                    <span className="text-[9px] font-bold uppercase text-zinc-500">
                                                        IMPACT
                                                    </span>
                                                    <span className="text-xs font-bold text-zinc-200 tabular-nums">
                                                        {impactScore}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Center Content Column */}
                                            <div className="flex-1 space-y-3 min-w-0">
                                                {/* Meta Tag Bar */}
                                                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                                    <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${ui.badgeColor}`}>
                                                        {ui.label}
                                                    </span>

                                                    {(alert.priority === 'high' || alert.category === 'critical') && (
                                                        <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-950 text-rose-400 border border-rose-500/30">
                                                            Priority
                                                        </span>
                                                    )}

                                                    <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-950 text-emerald-400 border border-emerald-500/30">
                                                        {confidence}% Confidence
                                                    </span>

                                                    {alert.predicted_risk_level && (
                                                        <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-950 text-amber-400 border border-amber-500/30">
                                                            Risk: {alert.predicted_risk_level}
                                                        </span>
                                                    )}

                                                    <span className="text-zinc-500 ml-auto">
                                                        {new Date(alert.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                {/* Headline */}
                                                <h3 className={`text-sm sm:text-base font-bold leading-snug ${!alert.is_read ? 'text-zinc-100' : 'text-zinc-300'}`}>
                                                    {alert.message}
                                                </h3>

                                                {/* Reasoning Capsule */}
                                                {alert.ai_reasoning && (
                                                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                                                        <p className="text-xs font-sans text-zinc-300 leading-relaxed font-medium">
                                                            {alert.ai_reasoning}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Projected Match Lift */}
                                                <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs">
                                                    {alert.improvement_projection > 0 && (
                                                        <span className="text-[11px] font-bold text-emerald-400 bg-zinc-950 border border-emerald-500/30 px-2 py-0.5 rounded">
                                                            +{alert.improvement_projection}% Match Boost
                                                        </span>
                                                    )}

                                                    {alert.data_reference_snapshot && (
                                                        <button
                                                            onClick={() => toggleExpand(alert.id)}
                                                            className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                                                        >
                                                            <span>{isExpanded ? 'Hide Telemetry' : 'Inspect Data'}</span>
                                                            <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-[9px]`} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Expandable JSON Snapshot */}
                                                {isExpanded && alert.data_reference_snapshot && (
                                                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs overflow-x-auto space-y-1">
                                                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Raw Telemetry Node</span>
                                                        <pre className="text-[11px] text-amber-300/90 whitespace-pre-wrap">
                                                            {JSON.stringify(alert.data_reference_snapshot, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Action Matrix */}
                                            <div className="flex flex-row lg:flex-col gap-2 shrink-0 justify-end w-full lg:w-36 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                                                <Link href={alert.action_link || '#'} className="flex-1 lg:w-full">
                                                    <button 
                                                        onClick={() => !alert.is_read && handleAction(alert.id, 'read')}
                                                        className="w-full px-3 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                                    >
                                                        <span>Execute</span>
                                                        <i className="fa-solid fa-arrow-right text-[10px]" />
                                                    </button>
                                                </Link>

                                                {alert.secondary_action_link && (
                                                    <Link href={alert.secondary_action_link} className="flex-1 lg:w-full">
                                                        <button className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase transition-all cursor-pointer">
                                                            {alert.secondary_action_text || 'Secondary'}
                                                        </button>
                                                    </Link>
                                                )}

                                                <div className="flex items-center gap-1 self-center lg:w-full">
                                                    {!alert.is_read && (
                                                        <button
                                                            onClick={() => handleAction(alert.id, 'read')}
                                                            className="flex-1 px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-zinc-700 transition-all text-xs cursor-pointer"
                                                            title="Acknowledge"
                                                        >
                                                            <i className="fa-solid fa-check" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleAction(alert.id, 'snooze')}
                                                        className="flex-1 px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-zinc-700 transition-all text-xs cursor-pointer"
                                                        title="Snooze 24h"
                                                    >
                                                        <i className="fa-regular fa-clock" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(alert.id, 'dismiss')}
                                                        className="flex-1 px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-zinc-700 transition-all text-xs cursor-pointer"
                                                        title="Dismiss"
                                                    >
                                                        <i className="fa-regular fa-trash-can" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default SmartAlertsPage;
