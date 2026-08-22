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
                    title: 'Neural Network Synchronized',
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
                title: 'All Signals Acknowledged',
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

    // Categories filter configuration
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

        // Sorting
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
            glowClass: string;
            borderClass: string;
            textColor: string;
            accentBg: string;
        }> = {
            market: {
                icon: 'fa-chart-line',
                label: 'Market Surge',
                badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                glowClass: 'from-sky-500/20 via-transparent to-transparent',
                borderClass: 'border-sky-500/30 hover:border-sky-400/60',
                textColor: 'text-sky-400',
                accentBg: 'bg-sky-500'
            },
            opportunity: {
                icon: 'fa-wand-magic-sparkles',
                label: 'AI Opportunity',
                badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
                glowClass: 'from-violet-500/20 via-transparent to-transparent',
                borderClass: 'border-violet-500/30 hover:border-violet-400/60',
                textColor: 'text-violet-400',
                accentBg: 'bg-violet-500'
            },
            predictive_risk: {
                icon: 'fa-triangle-exclamation',
                label: 'Predictive Risk',
                badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
                glowClass: 'from-rose-500/20 via-transparent to-transparent',
                borderClass: 'border-rose-500/30 hover:border-rose-400/60',
                textColor: 'text-rose-400',
                accentBg: 'bg-rose-500'
            },
            skill_gap: {
                icon: 'fa-chart-pie',
                label: 'Skill Gap',
                badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                glowClass: 'from-amber-500/20 via-transparent to-transparent',
                borderClass: 'border-amber-500/30 hover:border-amber-400/60',
                textColor: 'text-amber-400',
                accentBg: 'bg-amber-500'
            },
            roadmap: {
                icon: 'fa-route',
                label: 'Milestone Pace',
                badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
                glowClass: 'from-indigo-500/20 via-transparent to-transparent',
                borderClass: 'border-indigo-500/30 hover:border-indigo-400/60',
                textColor: 'text-indigo-400',
                accentBg: 'bg-indigo-500'
            },
            behavioral: {
                icon: 'fa-brain',
                label: 'Behavioral Vector',
                badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
                glowClass: 'from-cyan-500/20 via-transparent to-transparent',
                borderClass: 'border-cyan-500/30 hover:border-cyan-400/60',
                textColor: 'text-cyan-400',
                accentBg: 'bg-cyan-500'
            },
            readiness: {
                icon: 'fa-shield-check',
                label: 'Readiness Shift',
                badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                glowClass: 'from-emerald-500/20 via-transparent to-transparent',
                borderClass: 'border-emerald-500/30 hover:border-emerald-400/60',
                textColor: 'text-emerald-400',
                accentBg: 'bg-emerald-500'
            },
            interview: {
                icon: 'fa-microphone-lines',
                label: 'Interview Radar',
                badgeColor: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
                glowClass: 'from-fuchsia-500/20 via-transparent to-transparent',
                borderClass: 'border-fuchsia-500/30 hover:border-fuchsia-400/60',
                textColor: 'text-fuchsia-400',
                accentBg: 'bg-fuchsia-500'
            },
            achievement: {
                icon: 'fa-trophy',
                label: 'Achievement',
                badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                glowClass: 'from-emerald-500/20 via-transparent to-transparent',
                borderClass: 'border-emerald-500/30 hover:border-emerald-400/60',
                textColor: 'text-emerald-400',
                accentBg: 'bg-emerald-500'
            }
        };

        return themeMap[alert.alert_type] || {
            icon: 'fa-bell',
            label: 'System Signal',
            badgeColor: 'bg-slate-700/30 text-slate-300 border-slate-700/50',
            glowClass: 'from-slate-700/20 via-transparent to-transparent',
            borderClass: 'border-slate-800 hover:border-slate-700',
            textColor: 'text-slate-400',
            accentBg: 'bg-slate-500'
        };
    };

    return (
        <Layout>
            <Head>
                <title>Smart Career Signals & Alerts • SkillMirror OS</title>
                <meta name="description" content="AI-Powered career intelligence telemetry, market spikes, and skill drift alerts." />
            </Head>

            <CyberPageShell
                moduleCode="MOD-06"
                section="AI CAREER INTELLIGENCE ENGINE"
                title="SMART CAREER ALERTS"
                subtitle="Autonomous neural telemetry scanning live job market surges, competency drift, and career acceleration vectors."
                badge="LIVE SIGNALS ACTIVE"
                badgeVariant="outline-cyan"
                bulletVariant="cyan"
                glowColor="cyan"
                actions={
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => loadData(true)}
                            disabled={isRefreshing}
                            className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-slate-300 hover:text-white hover:border-cyan-500/40 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                            title="Synchronize Neural Feed"
                        >
                            <i className={`fa-solid fa-arrows-rotate text-xs text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Sync AI</span>
                        </button>
                        <button
                            onClick={handleMarkAllRead}
                            disabled={stats.unread === 0}
                            className={`px-4 py-2 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                                stats.unread > 0 
                                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400' 
                                    : 'bg-slate-900/40 border border-white/[0.05] text-slate-600 cursor-not-allowed'
                            }`}
                        >
                            <i className="fa-solid fa-check-double text-xs" />
                            <span>Mark All Read</span>
                        </button>
                    </div>
                }
                stats={
                    <>
                        <PageStatChip label="Active Signals" value={stats.total} icon="fa-satellite-dish" color="cyan" />
                        <PageStatChip label="Action Needed" value={stats.unread} icon="fa-bolt" color="amber" />
                        <PageStatChip label="AI Precision" value={`${stats.avgConfidence}%`} icon="fa-microchip" color="emerald" />
                    </>
                }
            />

            <div className="px-4 sm:px-6 pb-24 max-w-[1400px] mx-auto space-y-8">
                {/* ── 1. Weekly AI Intelligence Hub & Next Best Action ── */}
                {summary && (
                    <ScrollReveal>
                        <div className="relative rounded-3xl bg-gradient-to-b from-[#121624] via-[#0d101a] to-[#0a0c14] border border-indigo-500/25 p-6 sm:p-7 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)] group">
                            {/* Ambient Top Glow Wave */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent" />
                            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/15 transition-all duration-700" />
                            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 space-y-6">
                                {/* Header badge + title */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
                                            <i className="fa-solid fa-brain-circuit text-lg animate-pulse" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-indigo-400">
                                                    AUTONOMOUS CAREER COPILOT
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
                                                    SYNCHRONIZED
                                                </span>
                                            </div>
                                            <h2 className="text-lg sm:text-xl font-display font-black text-white tracking-tight">
                                                Weekly Intelligence & Predictive Trajectory
                                            </h2>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 self-start sm:self-auto">
                                        <span className="text-[11px] font-mono text-slate-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/[0.06]">
                                            <i className="fa-regular fa-clock text-indigo-400 mr-1.5" />
                                            Active Horizon: 7 Days
                                        </span>
                                    </div>
                                </div>

                                {/* 4 Telemetry Metrics Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Roadmap Momentum</span>
                                            <i className="fa-solid fa-route text-indigo-400 text-xs" />
                                        </div>
                                        <div className="text-xl sm:text-2xl font-display font-black text-white">
                                            {summary.roadmap_completion_rate} <span className="text-xs font-mono font-normal text-slate-400">milestones</span>
                                        </div>
                                        <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-2.5 overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" 
                                                style={{ width: `${Math.min(100, (summary.roadmap_completion_rate / 8) * 100)}%` }} 
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Interview Accuracy</span>
                                            <i className="fa-solid fa-microphone-lines text-cyan-400 text-xs" />
                                        </div>
                                        <div className="text-xl sm:text-2xl font-display font-black text-cyan-300">
                                            {summary.interview_avg}% <span className="text-xs font-mono font-normal text-slate-400">benchmark</span>
                                        </div>
                                        <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-2.5 overflow-hidden">
                                            <div 
                                                className="h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                                                style={{ width: `${summary.interview_avg}%` }} 
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Dominant Vector</span>
                                            <i className="fa-solid fa-shield-halved text-emerald-400 text-xs" />
                                        </div>
                                        <div className="text-base sm:text-lg font-display font-black text-emerald-400 truncate" title={summary.strongest_skill}>
                                            {summary.strongest_skill || 'Core Architecture'}
                                        </div>
                                        <span className="inline-block text-[10px] font-mono text-emerald-500/90 mt-1 font-bold">
                                            ★ Top 10% Candidate Tier
                                        </span>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Market Delta</span>
                                            <i className="fa-solid fa-arrow-trend-up text-violet-400 text-xs" />
                                        </div>
                                        <div className="text-xl sm:text-2xl font-display font-black text-violet-300">
                                            {summary.readiness_delta || '+12.5%'}
                                        </div>
                                        <span className="inline-block text-[10px] font-mono text-slate-400 mt-1">
                                            Readiness velocity lift
                                        </span>
                                    </div>
                                </div>

                                {/* Next Best Action Callout Banner */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                            <i className="fa-solid fa-bolt-lightning text-sm" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400/90">
                                                RECOMMENDED HIGH-IMPACT ACTION
                                            </span>
                                            <p className="text-xs sm:text-sm font-sans font-semibold text-slate-100">
                                                {summary.next_best_action || 'Complete your active roadmap milestones to boost target readiness.'}
                                            </p>
                                        </div>
                                    </div>
                                    <Link href="/roadmap" className="shrink-0 w-full sm:w-auto">
                                        <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-mono font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2">
                                            <span>Accelerate</span>
                                            <i className="fa-solid fa-arrow-right text-[10px]" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* ── 2. Tri-Stat HUD Cards with Interactive Quick Toggles ── */}
                <StaggerChildren className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
                    {/* Signal Volume Card */}
                    <ScrollReveal stagger>
                        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden group shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-slate-400">
                                        SIGNAL VOLUME
                                    </span>
                                    <div className="text-4xl font-display font-black text-white mt-1">
                                        {stats.total}
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                    <i className="fa-solid fa-satellite-dish" />
                                </div>
                            </div>
                            <p className="text-xs font-mono text-slate-400 mt-2">
                                Continuous real-time indexing of 12,500+ market telemetry vectors.
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* Unchecked Insights Card (Clickable to Filter Unread) */}
                    <ScrollReveal stagger>
                        <div 
                            onClick={() => setUnreadOnly(!unreadOnly)}
                            className={`p-6 rounded-3xl bg-slate-900/60 border transition-all duration-300 relative overflow-hidden group shadow-lg cursor-pointer ${
                                unreadOnly 
                                    ? 'border-amber-400/80 bg-amber-500/[0.07] ring-1 ring-amber-400/40' 
                                    : 'border-slate-800/80 hover:border-amber-500/40'
                            }`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-slate-400">
                                            UNCHECKED SIGNALS
                                        </span>
                                        {unreadOnly && (
                                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                ACTIVE FILTER
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-4xl font-display font-black text-amber-400 mt-1">
                                        {stats.unread}
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                    <i className="fa-solid fa-lightbulb" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-2">
                                <span>{unreadOnly ? 'Showing unread only' : 'Click to filter unacknowledged'}</span>
                                <i className={`fa-solid fa-arrow-right text-[10px] text-amber-400 group-hover:translate-x-1 transition-transform`} />
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Critical Risks Card */}
                    <ScrollReveal stagger>
                        <div 
                            onClick={() => setFilter(filter === 'predictive_risk' ? 'all' : 'predictive_risk')}
                            className={`p-6 rounded-3xl bg-slate-900/60 border transition-all duration-300 relative overflow-hidden group shadow-lg cursor-pointer ${
                                filter === 'predictive_risk'
                                    ? 'border-rose-500 bg-rose-500/[0.07] ring-1 ring-rose-500/40'
                                    : 'border-slate-800/80 hover:border-rose-500/40'
                            }`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all" />
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-slate-400">
                                        CRITICAL RISK VECTORS
                                    </span>
                                    <div className={`text-4xl font-display font-black mt-1 ${stats.critical > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                                        {stats.critical}
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-lg shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                                    <i className="fa-solid fa-triangle-exclamation" />
                                </div>
                            </div>
                            <p className="text-xs font-mono text-slate-400 mt-2">
                                {stats.critical === 0 ? 'Optimal trajectory. No critical regressions detected.' : 'Skill volatility detected. Immediate intervention recommended.'}
                            </p>
                        </div>
                    </ScrollReveal>
                </StaggerChildren>

                {/* ── 3. Cyber Intelligence Dock (Filters, Search, Sorting) ── */}
                <div className="space-y-4">
                    <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                        {/* Category Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                            {filterOptions.map(opt => {
                                const isActive = filter === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => setFilter(opt.id)}
                                        className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border ${
                                            isActive
                                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_18px_rgba(99,102,241,0.4)]'
                                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                        }`}
                                    >
                                        <i className={`fa-solid ${opt.icon} text-[11px] ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                        <span>{opt.label}</span>
                                        {opt.count > 0 && (
                                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                {opt.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search & Sort Row */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            {/* Search Input */}
                            <div className="relative flex-1 sm:w-60">
                                <i className="fa-solid fa-magnifying-glass text-slate-500 text-xs absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Filter signals..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                                    >
                                        <i className="fa-solid fa-xmark" />
                                    </button>
                                )}
                            </div>

                            {/* Sort Selector */}
                            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5">
                                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e: any) => setSortBy(e.target.value)}
                                    className="bg-transparent text-xs font-mono text-slate-300 font-bold outline-none cursor-pointer"
                                >
                                    <option value="impact" className="bg-slate-900 text-white">Impact Level</option>
                                    <option value="confidence" className="bg-slate-900 text-white">AI Confidence</option>
                                    <option value="newest" className="bg-slate-900 text-white">Newest First</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 4. Main Alert Feed Stream ── */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="space-y-4">
                            <SkeletonCard className="!h-36" />
                            <SkeletonCard className="!h-36" />
                            <SkeletonCard className="!h-36" />
                        </div>
                    ) : filteredAlerts.length === 0 ? (
                        /* Empty State with Cyber Scanner */
                        <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center relative overflow-hidden backdrop-blur-xl">
                            <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center mx-auto mb-5 border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative">
                                <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
                                <i className="fa-solid fa-radar text-2xl text-cyan-400 animate-pulse" />
                            </div>
                            <h3 className="text-lg font-display font-black text-white">
                                All Clear • Trajectory Stabilized
                            </h3>
                            <p className="text-xs font-mono text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                                No active warnings or pending vectors found matching your current filter. Continuous neural monitoring remains active.
                            </p>
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                {(filter !== 'all' || unreadOnly || searchQuery) && (
                                    <button
                                        onClick={() => { setFilter('all'); setUnreadOnly(false); setSearchQuery(''); }}
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase transition-all"
                                    >
                                        Clear Active Filters
                                    </button>
                                )}
                                <button
                                    onClick={() => loadData(true)}
                                    className="px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-mono font-bold uppercase transition-all flex items-center gap-2"
                                >
                                    <i className="fa-solid fa-arrows-rotate" />
                                    <span>Run Deep Market Sweep</span>
                                </button>
                            </div>
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
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.25 }}
                                        className={`group relative rounded-3xl bg-slate-900/70 border backdrop-blur-xl p-6 sm:p-7 transition-all duration-300 shadow-xl overflow-hidden ${
                                            !alert.is_read 
                                                ? 'border-white/[0.12] shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
                                                : 'border-slate-800/80 opacity-90 hover:opacity-100'
                                        } ${ui.borderClass}`}
                                    >
                                        {/* Dynamic Gradient Corner Accent */}
                                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${ui.glowClass}`} />
                                        
                                        {/* Unread Left Border Highlight */}
                                        {!alert.is_read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
                                        )}

                                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                                            {/* Left Icon Capsule & Live Impact Gauge */}
                                            <div className="flex lg:flex-col items-center gap-4 shrink-0">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg border relative ${ui.badgeColor}`}>
                                                    <i className={`fa-solid ${ui.icon}`} />
                                                    {!alert.is_read && (
                                                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-950 animate-pulse" />
                                                    )}
                                                </div>

                                                <div className="flex lg:flex-col items-center gap-1.5">
                                                    <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
                                                        IMPACT
                                                    </div>
                                                    <div className="w-16 lg:w-2 bg-slate-950 rounded-full h-2 lg:h-12 overflow-hidden p-0.5 border border-white/[0.06] flex items-end">
                                                        <div 
                                                            className={`w-full ${ui.accentBg} rounded-full transition-all duration-500`}
                                                            style={{ 
                                                                height: `${impactScore}%`,
                                                                width: '100%' 
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-mono font-black text-slate-300">
                                                        {impactScore}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Center Content Column */}
                                            <div className="flex-1 space-y-4 min-w-0">
                                                {/* Meta Tag Bar */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* Alert Type Badge */}
                                                    <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-3 py-1 rounded-xl border ${ui.badgeColor}`}>
                                                        {ui.label}
                                                    </span>

                                                    {/* Priority Badge */}
                                                    {(alert.priority === 'high' || alert.category === 'critical') && (
                                                        <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                                                            <i className="fa-solid fa-triangle-exclamation text-[10px]" />
                                                            Priority Action
                                                        </span>
                                                    )}

                                                    {/* AI Confidence Meter */}
                                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                        {confidence}% Confidence
                                                    </span>

                                                    {/* Risk Level Badge */}
                                                    {alert.predicted_risk_level && (
                                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                                            Risk: {alert.predicted_risk_level}
                                                        </span>
                                                    )}

                                                    {/* Timestamp */}
                                                    <span className="text-[11px] font-mono text-slate-500 ml-auto flex items-center gap-1.5">
                                                        <i className="fa-regular fa-clock text-[10px]" />
                                                        {new Date(alert.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                {/* Headline */}
                                                <div>
                                                    <h3 className={`text-base sm:text-lg font-display font-black leading-snug tracking-tight ${!alert.is_read ? 'text-white' : 'text-slate-300'}`}>
                                                        {alert.message}
                                                    </h3>
                                                </div>

                                                {/* AI Synthesis Reasoning Capsule */}
                                                {alert.ai_reasoning && (
                                                    <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] relative overflow-hidden group-hover:border-white/[0.1] transition-all">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs shrink-0 mt-0.5">
                                                                <i className="fa-solid fa-sparkles text-[10px]" />
                                                            </div>
                                                            <div className="space-y-1 text-xs font-sans text-slate-300 leading-relaxed">
                                                                <p className="font-medium">{alert.ai_reasoning}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Projected Career Improvement Chip & Snapshot Toggle */}
                                                <div className="flex flex-wrap items-center gap-4 pt-1">
                                                    {alert.improvement_projection > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                                                                Projected Career Lift:
                                                            </span>
                                                            <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                                                                +{alert.improvement_projection}% Match Boost
                                                            </span>
                                                        </div>
                                                    )}

                                                    {alert.behavioral_flag && (
                                                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg font-bold">
                                                            <i className="fa-solid fa-shield-virus text-[10px]" />
                                                            <span>Vector: {alert.behavioral_flag}</span>
                                                        </div>
                                                    )}

                                                    {alert.data_reference_snapshot && (
                                                        <button
                                                            onClick={() => toggleExpand(alert.id)}
                                                            className="text-[11px] font-mono font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 ml-auto transition-colors"
                                                        >
                                                            <span>{isExpanded ? 'Hide Intel Snapshot' : 'Inspect Neural Data'}</span>
                                                            <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-[9px]`} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Expandable Data Reference Snapshot */}
                                                {isExpanded && alert.data_reference_snapshot && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono overflow-x-auto text-slate-400 space-y-2"
                                                    >
                                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                            <i className="fa-solid fa-database text-cyan-400" />
                                                            <span>Neural Telemetry Data Snapshot</span>
                                                        </div>
                                                        <pre className="text-[11px] text-cyan-300/90 whitespace-pre-wrap">
                                                            {JSON.stringify(alert.data_reference_snapshot, null, 2)}
                                                        </pre>
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Right Action Matrix */}
                                            <div className="flex flex-row lg:flex-col gap-2.5 shrink-0 justify-end w-full lg:w-44 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
                                                {/* Primary Action Button */}
                                                <Link href={alert.action_link || '#'} className="flex-1 lg:w-full">
                                                    <button 
                                                        onClick={() => !alert.is_read && handleAction(alert.id, 'read')}
                                                        className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_25px_rgba(59,130,246,0.55)] transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <span>Execute Action</span>
                                                        <i className="fa-solid fa-bolt text-[10px] text-amber-300" />
                                                    </button>
                                                </Link>

                                                {/* Secondary Action Link */}
                                                {alert.secondary_action_link && (
                                                    <Link href={alert.secondary_action_link} className="flex-1 lg:w-full">
                                                        <button className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white font-mono font-bold text-[10px] uppercase tracking-wider transition-all text-center">
                                                            {alert.secondary_action_text || 'Secondary Vector'}
                                                        </button>
                                                    </Link>
                                                )}

                                                {/* Utility Action Buttons (Read/Snooze/Dismiss) */}
                                                <div className="flex items-center gap-1.5 self-center lg:w-full">
                                                    {!alert.is_read && (
                                                        <button
                                                            onClick={() => handleAction(alert.id, 'read')}
                                                            className="flex-1 px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all text-xs flex items-center justify-center"
                                                            title="Mark as Read"
                                                        >
                                                            <i className="fa-solid fa-check" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleAction(alert.id, 'snooze')}
                                                        className="flex-1 px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-all text-xs flex items-center justify-center"
                                                        title="Snooze for 24 Hours"
                                                    >
                                                        <i className="fa-regular fa-clock" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(alert.id, 'dismiss')}
                                                        className="flex-1 px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-all text-xs flex items-center justify-center"
                                                        title="Dismiss Signal"
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
