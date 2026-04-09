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
    const modules = [
        {
            title: 'Resume Analyzer',
            value: `${summaries.resume.score}%`,
            label: 'AI Content Score',
            link: '/resume',
            icon: 'fa-file-invoice',
            color: 'emerald',
            cta: 'Open Analyzer'
        },
        {
            title: 'Career Roadmap',
            value: `${summaries.roadmap.progress}%`,
            label: 'Curriculum Finish',
            link: '/roadmap',
            icon: 'fa-stairs',
            color: 'blue',
            cta: 'Open Roadmap'
        },
        {
            title: 'Mock Interview',
            value: summaries.interview.last_score ? `${Math.round(summaries.interview.last_score)}%` : 'N/A',
            label: 'Last Session Score',
            link: '/mock-interview',
            icon: 'fa-microphone-lines',
            color: 'violet',
            cta: 'Practice Now'
        },
        {
            title: 'Job Intelligence',
            value: `${summaries.job_intelligence.top_match}%`,
            label: 'Top Role Match',
            link: '/job-intelligence',
            icon: 'fa-briefcase',
            color: 'amber',
            cta: 'Explore Jobs'
        },
        {
            title: 'Smart Alerts',
            value: summaries.alerts.count,
            label: 'Unread Intelligence',
            link: '/smart-alerts',
            icon: 'fa-bell',
            color: 'rose',
            cta: 'View Alerts'
        }
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {modules.map((mod, i) => (
                <div key={i} className="glass-panel p-4 flex flex-col justify-between hover:border-indigo-500/30 transition-all group border-slate-800/40">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-${mod.color}-500/10 flex items-center justify-center text-${mod.color}-500 border border-${mod.color}-500/20 shadow-sm`}>
                            <i className={`fa-solid ${mod.icon} text-sm`} />
                        </div>
                        <Link href={mod.link}>
                            <span className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                                {mod.cta} <i className="fa-solid fa-arrow-right-long ml-1 text-[8px]" />
                            </span>
                        </Link>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{mod.title}</h3>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-white">{mod.value}</span>
                            <span className="text-[9px] font-medium text-slate-500">{mod.label}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ModuleSummaries;
