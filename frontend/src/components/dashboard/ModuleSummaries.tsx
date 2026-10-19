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

const ModuleSummaries: React.FC<ModuleSummaryProps> = ({ summaries }) => {
  const getDisplayValue = (val: number | null | undefined, suffix: string = '%'): string => {
    if (val === null || val === undefined || val === 0) {
      return 'Initialize →';
    }
    return `${Math.round(val)}${suffix}`;
  };

  const modules = [
    {
      title: 'Resume Analyzer',
      value: getDisplayValue(summaries?.resume?.score),
      label: 'Readiness Score',
      link: '/resume',
      icon: 'fa-file-invoice',
      cta: 'Open Engine',
    },
    {
      title: 'Career Roadmap',
      value: getDisplayValue(summaries?.roadmap?.progress),
      label: 'Curriculum Finish',
      link: '/roadmap',
      icon: 'fa-compass',
      cta: 'Open Path',
    },
    {
      title: 'Mock Interview',
      value: getDisplayValue(summaries?.interview?.last_score),
      label: 'Latest Analytics',
      link: '/mock-interview',
      icon: 'fa-headset',
      cta: 'Practice',
    },
    {
      title: 'Job Intel',
      value: getDisplayValue(summaries?.job_intelligence?.top_match),
      label: 'Market Alignment',
      link: '/job-intelligence',
      icon: 'fa-magnifying-glass-chart',
      cta: 'Scan Jobs',
    },
    {
      title: 'Smart Alerts',
      value: summaries?.alerts?.count ? `${summaries.alerts.count} Signals` : '0 Active',
      label: 'Priority Signals',
      link: '/smart-alerts',
      icon: 'fa-bell',
      cta: 'Signals',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {modules.map((mod, i) => (
        <div
          key={i}
          className="p-5 border border-zinc-800 bg-zinc-900/90 hover:border-zinc-700 transition-colors flex flex-col justify-between group"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-8 h-8 border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-amber-500 transition-colors">
              <i className={`fa-solid ${mod.icon} text-xs`} />
            </div>
            <Link href={mod.link}>
              <a className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5">
                <span>{mod.cta}</span>
                <i className="fa-solid fa-arrow-right text-[8px]" />
              </a>
            </Link>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 bg-amber-500" />
              <h3 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                {mod.title}
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-normal tracking-tight text-white tabular-nums">
                {mod.value}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                {mod.label}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModuleSummaries;

