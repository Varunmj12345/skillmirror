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

const pastelCardStyles: Record<string, {
  card: string;
  badge: string;
  ctaText: string;
}> = {
  emerald: {
    card: 'bg-[#ECFDF5] border-[#D1FAE5] hover:border-[#A7F3D0] hover:bg-[#E6F8F0] dark:bg-[#0F172A]/50 dark:border-white/5 dark:hover:border-emerald-500/30',
    badge: 'bg-emerald-600 text-white dark:bg-emerald-500/15 dark:text-emerald-400 dark:border dark:border-emerald-500/30 shadow-sm',
    ctaText: 'text-emerald-700 dark:text-slate-400 hover:text-emerald-900 dark:hover:text-white',
  },
  blue: {
    card: 'bg-[#EEF4FF] border-[#DBEAFE] hover:border-[#BFDBFE] hover:bg-[#E0EDFF] dark:bg-[#0F172A]/50 dark:border-white/5 dark:hover:border-blue-500/30',
    badge: 'bg-blue-600 text-white dark:bg-blue-500/15 dark:text-blue-400 dark:border dark:border-blue-500/30 shadow-sm',
    ctaText: 'text-blue-700 dark:text-slate-400 hover:text-blue-900 dark:hover:text-white',
  },
  violet: {
    card: 'bg-[#F5F3FF] border-[#EDE9FE] hover:border-[#DDD6FE] hover:bg-[#EDE9FE] dark:bg-[#0F172A]/50 dark:border-white/5 dark:hover:border-purple-500/30',
    badge: 'bg-purple-600 text-white dark:bg-violet-500/15 dark:text-violet-400 dark:border dark:border-violet-500/30 shadow-sm',
    ctaText: 'text-purple-700 dark:text-slate-400 hover:text-purple-900 dark:hover:text-white',
  },
  amber: {
    card: 'bg-[#FFF7ED] border-[#FED7AA] hover:border-[#FDBA74] hover:bg-[#FEF3C7] dark:bg-[#0F172A]/50 dark:border-white/5 dark:hover:border-amber-500/30',
    badge: 'bg-amber-600 text-white dark:bg-amber-500/15 dark:text-amber-400 dark:border dark:border-amber-500/30 shadow-sm',
    ctaText: 'text-amber-700 dark:text-slate-400 hover:text-amber-900 dark:hover:text-white',
  },
  rose: {
    card: 'bg-[#FFE8EC] border-[#FECDD3] hover:border-[#FDA4AF] hover:bg-[#FDE8E8] dark:bg-[#0F172A]/50 dark:border-white/5 dark:hover:border-rose-500/30',
    badge: 'bg-rose-600 text-white dark:bg-rose-500/15 dark:text-rose-400 dark:border dark:border-rose-500/30 shadow-sm',
    ctaText: 'text-rose-700 dark:text-slate-400 hover:text-rose-900 dark:hover:text-white',
  },
};

const ModuleSummaries: React.FC<ModuleSummaryProps> = ({ summaries }) => {
  const getDisplayValue = (val: number | null | undefined, suffix: string = '%'): string => {
    if (val === null || val === undefined || val === 0) {
      return 'Tap to activate →';
    }
    return `${Math.round(val)}${suffix}`;
  };

  const modules = [
    {
      title: 'Resume Analyzer',
      value: getDisplayValue(summaries?.resume?.score),
      label: 'Intelligence Score',
      link: '/resume',
      icon: 'fa-file-invoice',
      color: 'emerald',
      cta: 'Open Engine'
    },
    {
      title: 'Career Roadmap',
      value: getDisplayValue(summaries?.roadmap?.progress),
      label: 'Curriculum Finish',
      link: '/roadmap',
      icon: 'fa-compass',
      color: 'blue',
      cta: 'Open Path'
    },
    {
      title: 'Mock Interview',
      value: getDisplayValue(summaries?.interview?.last_score),
      label: 'Last Analytics',
      link: '/mock-interview',
      icon: 'fa-headset',
      color: 'violet',
      cta: 'Practice'
    },
    {
      title: 'Job Intel',
      value: getDisplayValue(summaries?.job_intelligence?.top_match),
      label: 'Market Alignment',
      link: '/job-intelligence',
      icon: 'fa-magnifying-glass-chart',
      color: 'amber',
      cta: 'Scan Jobs'
    },
    {
      title: 'Smart Alerts',
      value: summaries?.alerts?.count ? `${summaries.alerts.count} Signals` : 'Tap to activate →',
      label: 'New Signals',
      link: '/smart-alerts',
      icon: 'fa-bell',
      color: 'rose',
      cta: 'Signals'
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {modules.map((mod, i) => {
        const style = pastelCardStyles[mod.color] || pastelCardStyles.blue;
        return (
          <div
            key={i}
            className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between group shadow-light-sm relative overflow-hidden ${style.card}`}
          >
            {/* Subtle icon background */}
            <div className="absolute -bottom-4 -right-4 opacity-[0.04] dark:opacity-[0.03] text-6xl group-hover:scale-125 transition-transform duration-700 pointer-events-none">
              <i className={`fa-solid ${mod.icon}`} />
            </div>

            <div className="flex items-start justify-between mb-7 relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${style.badge}`}>
                <i className={`fa-solid ${mod.icon} text-sm`} />
              </div>
              <Link href={mod.link}>
                <span className={`cursor-pointer text-[10px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${style.ctaText}`}>
                  {mod.cta} <i className="fa-solid fa-arrow-right text-[8px]" />
                </span>
              </Link>
            </div>

            <div className="relative z-10">
              <h3 className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {mod.title}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className={`font-display font-black text-slate-900 dark:text-white tracking-tight ${mod.value.includes('Tap') ? 'text-xs text-blue-600 dark:text-indigo-400 underline decoration-blue-500/40' : 'text-2xl'}`}>
                  {mod.value}
                </span>
                {!mod.value.includes('Tap') && (
                  <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {mod.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ModuleSummaries;
