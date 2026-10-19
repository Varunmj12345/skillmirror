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
        <div className="fixed bottom-8 right-8 z-[100] space-y-3 max-w-sm pointer-events-none">
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className="pointer-events-auto animate-in slide-in-from-right-8 fade-in duration-300"
                >
                    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-xl flex items-start gap-3.5 group">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            n.type === 'critical'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                        }`}>
                            <i className={`fa-solid ${n.type === 'critical' ? 'fa-triangle-exclamation' : 'fa-chart-line'} text-xs`}></i>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">{n.message}</span>
                                <button
                                    onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    <i className="fa-solid fa-xmark text-[10px]"></i>
                                </button>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                                {n.insight}
                            </p>
                            <div className="mt-2.5 flex items-center gap-2 font-mono text-[9px]">
                                <span className="text-amber-400 font-bold uppercase tracking-wider cursor-pointer hover:underline">
                                    View Strategy
                                </span>
                                <span className="w-1 h-1 rounded-sm bg-zinc-700"></span>
                                <span className="text-zinc-500 uppercase tracking-wider">
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
