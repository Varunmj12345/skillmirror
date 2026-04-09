import React, { useEffect, useState } from 'react';

interface Notification {
    id: string;
    type: 'market' | 'skill' | 'achievement' | 'critical';
    message: string;
    insight: string;
}

const SmartNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Mock simulation of smart insights
        const timer = setTimeout(() => {
            setNotifications([
                {
                    id: '1',
                    type: 'market',
                    message: 'Frontend Market Shift',
                    insight: 'Demand for Next.js App Router skills increased by 12% this week in Tech industry.'
                },
                {
                    id: '2',
                    type: 'critical',
                    message: 'Critical Gap Alert',
                    insight: 'System Design is now a mandatory requirement for 80% of Senior roles you follow.'
                }
            ]);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[100] space-y-4 max-w-sm pointer-events-none">
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className="pointer-events-auto animate-in slide-in-from-right-8 fade-in duration-500"
                >
                    <div className="glass-panel p-4 border-slate-700/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl flex items-start gap-4 group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'
                            }`}>
                            <i className={`fa-solid ${n.type === 'critical' ? 'fa-triangle-exclamation' : 'fa-chart-line'}`}></i>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">{n.message}</span>
                                <button
                                    onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                                    className="text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                    <i className="fa-solid fa-xmark text-[10px]"></i>
                                </button>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                {n.insight}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest cursor-pointer hover:text-indigo-300 transition-colors">
                                    View Strategy
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                    AI Insight
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SmartNotifications;
