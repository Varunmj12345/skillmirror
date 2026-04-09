import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { alertService, SmartAlert, WeeklySummary } from '../services/alertService';
import Link from 'next/link';

const SmartAlertsPage: React.FC = () => {
    const [alerts, setAlerts] = useState<SmartAlert[]>([]);
    const [summary, setSummary] = useState<WeeklySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const loadData = async () => {
        try {
            setLoading(true);
            const [alertRes, summaryRes]: [any, any] = await Promise.all([
                alertService.getAlerts(),
                alertService.getWeeklySummary()
            ]);
            setAlerts(Array.isArray(alertRes) ? alertRes : (alertRes?.data || []));
            setSummary(summaryRes?.data || summaryRes);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredAlerts = useMemo(() => {
        if (!alerts) return [];
        if (filter === 'all') return alerts;
        return alerts.filter(a => a.alert_type === filter);
    }, [alerts, filter]);

    const stats = useMemo(() => {
        const list = alerts || [];
        return {
            total: list.length,
            unread: list.filter(a => !a.is_read).length,
            critical: list.filter(a => a.category === 'critical').length
        };
    }, [alerts]);

    const handleAction = async (id: number, type: 'read' | 'dismiss' | 'snooze') => {
        if (type === 'read') await alertService.markAsRead(id);
        if (type === 'dismiss') await alertService.dismiss(id);
        if (type === 'snooze') await alertService.snooze(id);
        loadData();
    };

    const getAlertUI = (alert: SmartAlert) => {
        const icons: any = {
            skill_gap: { icon: 'fa-chart-pie', color: 'amber', label: 'Skill Gap' },
            roadmap: { icon: 'fa-route', color: 'rose', label: 'Roadmap' },
            interview: { icon: 'fa-microphone', color: 'indigo', label: 'Interview' },
            readiness: { icon: 'fa-check-circle', color: 'emerald', label: 'Readiness' },
            market: { icon: 'fa-briefcase', color: 'sky', label: 'Market' },
            predictive_risk: { icon: 'fa-triangle-exclamation', color: 'rose', label: 'Predictive Risk' },
            opportunity: { icon: 'fa-wand-magic-sparkles', color: 'violet', label: 'Opportunity' },
            behavioral: { icon: 'fa-user-gear', color: 'indigo', label: 'Behavioral' },
            regression: { icon: 'fa-chart-line-down', color: 'orange', label: 'Regression' },
            achievement: { icon: 'fa-trophy', color: 'amber', label: 'Achievement' },
        };
        return icons[alert.alert_type] || { icon: 'fa-bell', color: 'slate', label: 'Info' };
    };

    return (
        <Layout>
            <Head>
                <title>Predictive Career Intelligence • Smart Alerts</title>
            </Head>

            <div className="space-y-8 animate-fadeIn">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-500 font-black mb-1">AI Predictive Engine</p>
                        <h1 className="text-3xl font-black text-slate-50">Smart Alerts</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Global AI Network Link: ACTIVE</span>
                        </div>
                        <button onClick={() => alertService.markAllRead().then(loadData)} className="btn-secondary text-xs px-4 py-2 border-slate-800">
                            Mark all as read
                        </button>
                    </div>
                </header>

                {/* Weekly AI Summary Card */}
                {summary && (
                    <div className="glass-panel p-8 border-indigo-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i className="fa-solid fa-brain text-8xl text-indigo-500" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <i className="fa-solid fa-sparkles" />
                                </div>
                                <h2 className="text-xl font-black text-slate-50">Weekly Intelligence Summary</h2>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Roadmap Velocity</p>
                                    <p className="text-lg font-black text-white">{summary.roadmap_completion_rate} milestones</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Interview Avg</p>
                                    <p className="text-lg font-black text-white">{summary.interview_avg}% accuracy</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Core Strength</p>
                                    <p className="text-lg font-black text-emerald-400">{summary.strongest_skill}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Market Delta</p>
                                    <p className="text-lg font-black text-indigo-400">{summary.readiness_delta}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-4">
                                <div className="flex gap-3 items-center">
                                    <i className="fa-solid fa-bolt-lightning text-amber-400" />
                                    <p className="text-xs font-bold text-indigo-200">Next Best Action: {summary.next_best_action}</p>
                                </div>
                                <Link href="/roadmap">
                                    <button className="text-[10px] font-black uppercase tracking-widest bg-white text-slate-900 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all shrink-0">Accelerate</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                <section className="grid gap-6 md:grid-cols-3">
                    {[
                        { label: 'Alert Volume', value: stats.total, color: 'indigo', icon: 'fa-bullseye' },
                        { label: 'Unchecked Insights', value: stats.unread, color: 'amber', icon: 'fa-lightbulb' },
                        { label: 'Critical Risks', value: stats.critical, color: 'rose', icon: 'fa-triangle-exclamation' },
                    ].map((s, i) => (
                        <div key={i} className="glass-panel p-6 border-slate-800/60 transition-all hover:border-indigo-500/20">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                                <div className={`w-8 h-8 rounded-lg bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-400`}>
                                    <i className={`fa-solid ${s.icon} text-xs`} />
                                </div>
                            </div>
                            <span className="text-3xl font-black text-white">{s.value}</span>
                        </div>
                    ))}
                </section>

                <div className="bg-slate-900/40 rounded-3xl border border-slate-800/60 overflow-hidden">
                    <div className="p-4 border-b border-slate-800/60 flex flex-wrap gap-2 items-center justify-between bg-slate-950/20">
                        <div className="flex gap-2">
                            {['all', 'predictive_risk', 'opportunity', 'regression', 'behavioral'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${filter === f ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                                >
                                    {f.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="divide-y divide-slate-800/60">
                        {loading ? (
                            <div className="p-20 text-center text-slate-500 animate-pulse">Running predictive simulations...</div>
                        ) : filteredAlerts.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center mx-auto mb-4 border border-slate-800">
                                    <i className="fa-solid fa-check text-emerald-400 text-xl" />
                                </div>
                                <p className="text-slate-400 font-medium">No alerts detected in this vector.</p>
                                <p className="text-[11px] text-slate-600 mt-1">AI trajectory remains stable. Neural network link is synchronized and monitoring 10,000+ job data points.</p>
                            </div>
                        ) : (
                            filteredAlerts.map(alert => {
                                const ui = getAlertUI(alert);
                                return (
                                    <div key={alert.id} className={`p-8 group/card transition-all hover:bg-slate-800/20 ${!alert.is_read ? 'bg-indigo-500/5' : ''}`}>
                                        <div className="flex flex-col lg:flex-row gap-8">
                                            <div className="flex flex-col items-center gap-4 shrink-0">
                                                <div className={`w-14 h-14 rounded-2xl bg-${ui.color}-500/10 border border-${ui.color}-500/20 flex items-center justify-center text-2xl text-${ui.color}-400 shadow-lg`}>
                                                    <i className={`fa-solid ${ui.icon}`} />
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase">Impact</span>
                                                    <div className="h-10 w-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className={`w-full bg-${ui.color}-500`} style={{ height: `${alert.impact_score}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-4">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-${ui.color}-500/20 text-${ui.color}-400 border border-${ui.color}-500/20`}>
                                                        {ui.label}
                                                    </span>
                                                    {alert.priority === 'high' && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/20">
                                                            Priority Action
                                                        </span>
                                                    )}
                                                    {alert.confidence_score > 90 && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                                                            High Confidence {alert.confidence_score}%
                                                        </span>
                                                    )}
                                                    {alert.predicted_risk_level && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400">
                                                            Risk: {alert.predicted_risk_level}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-slate-600 font-medium ml-auto">
                                                        {new Date(alert.created_at).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    <h3 className={`text-xl font-black leading-tight ${!alert.is_read ? 'text-white' : 'text-slate-400'}`}>
                                                        {alert.message}
                                                    </h3>
                                                    {alert.ai_reasoning && (
                                                        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex gap-3">
                                                            <i className="fa-solid fa-quote-left text-slate-700 text-xs mt-1" />
                                                            <p className="text-xs text-slate-500 italic leading-relaxed">
                                                                {alert.ai_reasoning}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-4 items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-500">Projected Improvement:</span>
                                                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">+{alert.improvement_projection}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row lg:flex-col gap-3 shrink-0 justify-end lg:justify-start min-w-[160px]">
                                                <Link href={alert.action_link || '#'}>
                                                    <button className="btn-primary text-[10px] px-6 py-3 w-full flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/10">
                                                        Execute Action <i className="fa-solid fa-bolt text-[9px]" />
                                                    </button>
                                                </Link>
                                                {alert.secondary_action_link && (
                                                    <Link href={alert.secondary_action_link}>
                                                        <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border border-slate-800 p-2 rounded-xl text-center">
                                                            {alert.secondary_action_text || 'Secondary Task'}
                                                        </button>
                                                    </Link>
                                                )}
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleAction(alert.id, 'snooze')} className="flex-1 bg-slate-950 border border-slate-800 text-slate-500 p-2.5 rounded-xl hover:text-white hover:border-slate-600 transition-all text-xs" title="Snooze 24h">
                                                        <i className="fa-regular fa-clock" />
                                                    </button>
                                                    <button onClick={() => handleAction(alert.id, 'dismiss')} className="flex-1 bg-slate-950 border border-slate-800 text-slate-500 p-2.5 rounded-xl hover:text-rose-400 hover:border-rose-900/50 transition-all text-xs" title="Dismiss">
                                                        <i className="fa-regular fa-trash-can" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SmartAlertsPage;
