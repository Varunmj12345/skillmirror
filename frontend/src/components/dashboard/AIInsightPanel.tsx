import React from 'react';
import { motion } from 'framer-motion';

const insights = [
  { id: 1, label: 'Market Velocity', value: '+14%', status: 'rising', color: 'brand-neural' },
  { id: 2, label: 'Skill Retention', value: '88%', status: 'stable', color: 'brand-emerald' },
  { id: 3, label: 'Gap Criticality', value: 'High', status: 'warning', color: 'orange-500' },
];

const AIInsightPanel = () => {
  return (
    <div className="sm-glass p-8 rounded-[2rem] h-full flex flex-col justify-between">
      <div className="mb-8">
        <div className="sm-nano mb-3 opacity-60">Neural Engine Insights</div>
        <h3 className="text-2xl font-black text-white">Next Best Action</h3>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Your readiness for "Senior Backend Engineer" has improved by 4% this week. 
          Mastering <span className="text-brand-neural font-bold">Kafka Streams</span> will unlock a ₹3.5L salary increase.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {insights.map((insight) => (
          <div key={insight.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-brand-neural/5 transition-colors">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">{insight.label}</span>
              <span className={`text-xl font-black text-${insight.color === 'brand-neural' ? 'brand-neural' : 'white'}`}>{insight.value}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl bg-${insight.color}/10 flex items-center justify-center text-xl`}>
               {insight.status === 'rising' ? '📈' : insight.status === 'stable' ? '✨' : '🔥'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-white/5">
        <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-super-wide text-white hover:bg-brand-neural hover:border-brand-neural transition-all duration-300">
           Download Full Readiness Report (PDF)
        </button>
      </div>
    </div>
  );
};

export default AIInsightPanel;
