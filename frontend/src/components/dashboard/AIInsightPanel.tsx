import React from 'react';
import { motion } from 'framer-motion';

const insights = [
  { id: 1, label: 'Market Velocity', value: '+14%', status: 'rising', color: 'brand-neural' },
  { id: 2, label: 'Skill Retention', value: '88%', status: 'stable', color: 'brand-emerald' },
  { id: 3, label: 'Gap Criticality', value: 'High', status: 'warning', color: 'orange-500' },
];

const AIInsightPanel = () => {
  return (
    <div className="sm-glass p-6 sm:p-7 rounded-2xl h-full flex flex-col justify-between shadow-light-card dark:shadow-none">
      <div className="mb-6">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-indigo-400 mb-2">Neural Engine Insights</div>
        <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">Next Best Action</h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-sans">
          Your readiness for "Senior Backend Engineer" has improved by 4% this week. 
          Mastering <span className="text-blue-600 dark:text-brand-neural font-bold">Kafka Streams</span> will unlock a ₹3.5L salary increase.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {insights.map((insight) => (
          <div key={insight.id} className="p-3.5 sm:p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 rounded-xl flex items-center justify-between group hover:bg-blue-50/70 dark:hover:bg-brand-neural/5 transition-colors shadow-light-sm dark:shadow-none">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{insight.label}</span>
              <span className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">{insight.value}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-transparent flex items-center justify-center text-lg shadow-sm">
               {insight.status === 'rising' ? '📈' : insight.status === 'stable' ? '✨' : '🔥'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200/70 dark:border-white/5">
        <button className="w-full py-3.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-white hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-brand-neural transition-all duration-300 shadow-light-sm dark:shadow-none">
           Download Full Readiness Report (PDF)
        </button>
      </div>
    </div>
  );
};

export default AIInsightPanel;
