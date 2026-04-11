import React from 'react';
import Link from 'next/link';

interface ModuleSummaryProps {
  summaries: {
    resume: { score: number };
    roadmap: { progress: number };
    interview: { last_score: number | null };
    job_intelligence: { top_match: number };
    alerts: { count: number };
  };
}

const colorMap: Record<string, string> = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40',
  violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20 group-hover:border-violet-500/40',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40',
  rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40',
};

const ModuleSummaries: React.FC<ModuleSummaryProps> = ({ summaries }) => {
  const modules = [
    {
      title: 'Resume Analyzer',
      value: `${summaries.resume.score}%`,
      label: 'Intelligence Score',
      link: '/resume',
      icon: 'fa-file-invoice',
      color: 'emerald',
      cta: 'Open Engine'
    },
    {
      title: 'Career Roadmap',
      value: `${summaries.roadmap.progress}%`,
      label: 'Curriculum Finish',
      link: '/roadmap',
      icon: 'fa-stairs',
      color: 'blue',
      cta: 'Open Path'
    },
    {
      title: 'Mock Interview',
      value: summaries.interview.last_score ? `${Math.round(summaries.interview.last_score)}%` : 'N/A',
      label: 'Last Analytics',
      link: '/mock-interview',
      icon: 'fa-microphone-lines',
      color: 'violet',
      cta: 'Practice'
    },
    {
      title: 'Job Intel',
      value: `${summaries.job_intelligence.top_match}%`,
      label: 'Market Alignment',
      link: '/job-intelligence',
      icon: 'fa-briefcase',
      color: 'amber',
      cta: 'Scan Jobs'
    },
    {
      title: 'Smart Alerts',
      value: summaries.alerts.count,
      label: 'New Signals',
      link: '/smart-alerts',
      icon: 'fa-bell',
      color: 'rose',
      cta: 'Signals'
    }
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {modules.map((mod, i) => (
        <div key={i} className="glass-panel p-5 flex flex-col justify-between hover:border-white/20 transition-all group border-white/5 bg-[#0F172A]/40 relative overflow-hidden sm-card">
          {/* Subtle icon background */}
          <div className="absolute -bottom-4 -right-4 opacity-[0.03] text-6xl group-hover:scale-125 transition-transform duration-700 pointer-events-none">
            <i className={`fa-solid ${mod.icon}`} />
          </div>

          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xl transition-all duration-500 group-hover:scale-110 ${colorMap[mod.color]}`}>
              <i className={`fa-solid ${mod.icon} text-sm`} />
            </div>
            <Link href={mod.link}>
              <span className="cursor-pointer text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                {mod.cta} <i className="fa-solid fa-arrow-right text-[7px]" />
              </span>
            </Link>
          </div>

          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1.5">{mod.title}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">{mod.value}</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{mod.label}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModuleSummaries;

