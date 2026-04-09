import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { alertService, SmartAlert } from '../services/alertService';

const NotificationBell: React.FC = () => {
    const [alerts, setAlerts] = useState<SmartAlert[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const loadAlerts = async () => {
        try {
            const res: any = await alertService.getAlerts();
            const alertList = Array.isArray(res) ? res : (res?.data || []);
            setAlerts(alertList);
            setUnreadCount(alertList.filter((a: SmartAlert) => !a.is_read).length);
        } catch (err) {
            console.error('Failed to load alerts', err);
        }
    };

    useEffect(() => {
        loadAlerts();
        const interval = setInterval(loadAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => setIsOpen(!isOpen);

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'skill_gap': return 'fa-chart-pie text-amber-400';
            case 'roadmap': return 'fa-route text-rose-400';
            case 'interview': return 'fa-microphone text-indigo-400';
            case 'readiness': return 'fa-check-circle text-emerald-400';
            case 'market': return 'fa-briefcase text-sky-400';
            case 'predictive_risk': return 'fa-triangle-exclamation text-rose-500';
            case 'opportunity': return 'fa-wand-magic-sparkles text-violet-400';
            case 'behavioral': return 'fa-user-gear text-indigo-300';
            case 'regression': return 'fa-chart-line-down text-orange-400';
            case 'achievement': return 'fa-trophy text-amber-500';
            default: return 'fa-bell text-slate-400';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all group"
            >
                <i className="fa-solid fa-bell text-slate-400 group-hover:text-indigo-400 transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-bold text-white items-center justify-center">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 max-h-[480px] overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[100] animate-fadeIn">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-100 italic">AI Intelligence</h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Predictive Career Engine</p>
                        </div>
                        <span
                            onClick={() => {
                                setIsOpen(false);
                                router.push('/smart-alerts');
                            }}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        >
                            Explore All
                        </span>
                    </div>

                    <div className="overflow-y-auto max-h-80 sm-scrollbar">
                        {(alerts?.length || 0) === 0 ? (
                            <div className="p-8 text-center">
                                <i className="fa-solid fa-cloud-check text-slate-700 text-2xl mb-2" />
                                <p className="text-xs text-slate-500">System scan complete. No critical risks detected.</p>
                            </div>
                        ) : (
                            alerts.slice(0, 5).map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors relative group ${!alert.is_read ? 'bg-indigo-500/5' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`mt-0.5 w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] shadow-sm`}>
                                            <i className={`fa-solid ${getAlertIcon(alert.alert_type)}`} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-[11px] leading-relaxed flex-1 ${!alert.is_read ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>
                                                    {alert.message}
                                                </p>
                                                {alert.priority === 'high' && <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse mt-1 ml-2" />}
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
                                                    {alert.impact_score > 0 ? `Impact: ${alert.impact_score}%` : 'Analysis Pending'}
                                                </span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => alertService.markAsRead(alert.id).then(loadAlerts)} className="text-[9px] text-indigo-500/70 hover:text-indigo-400 font-black uppercase tracking-widest">Read</button>
                                                    <button onClick={() => alertService.dismiss(alert.id).then(loadAlerts)} className="text-[9px] text-slate-600 hover:text-rose-400 font-black uppercase tracking-widest">Clear</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 text-center border-t border-slate-800 bg-slate-950/20">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                router.push('/smart-alerts');
                            }}
                            className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 transition-all"
                        >
                            Access Career Strategist
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};

export default NotificationBell;
