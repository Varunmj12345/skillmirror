import React from 'react';

interface ScoreCardsProps {
    scores: {
        readiness: number;
        technical: number;
        soft: number;
    };
    intelligence?: {
        readiness_change: number;
        technical_change: number;
        soft_change: number;
        market_average: number;
        percentile: number;
    };
}

const SkillGapScoreCards: React.FC<ScoreCardsProps> = ({ scores, intelligence }) => {
    const getProgressColor = (score: number, type: string) => {
        if (type === 'readiness') return 'stroke-sky-500';
        if (type === 'technical') return 'stroke-indigo-500';
        return 'stroke-emerald-500';
    };

    const getGlowColor = (score: number, type: string) => {
        if (type === 'readiness') return 'rgba(14, 165, 233, 0.5)';
        if (type === 'technical') return 'rgba(99, 102, 241, 0.5)';
        return 'rgba(16, 185, 129, 0.5)';
    };

    function CircularProgress({ score, label, type, change }: { score: number; label: string; type: string; change?: number }): React.ReactElement {
        const radius = 36;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;

        return (
            <div className="p-8 rounded-3xl bg-card border border-border shadow-light-card dark:shadow-none flex flex-col items-center justify-center group relative overflow-hidden transition-all hover:border-blue-300 dark:hover:border-slate-700">
                <div className="relative w-28 h-28 mb-4">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            className="text-slate-100 dark:text-slate-800 stroke-current"
                            strokeWidth="6"
                            fill="transparent"
                            r={radius}
                            cx="56"
                            cy="56"
                        />
                        <circle
                            className={`${getProgressColor(score, type)} stroke-current transition-all duration-[1500ms] ease-out`}
                            strokeWidth="6"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            fill="transparent"
                            r={radius}
                            cx="56"
                            cy="56"
                            style={{ filter: `drop-shadow(0 0 8px ${getGlowColor(score, type)})` }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{Math.round(score)}%</span>
                        {change !== undefined && (
                            <span className={`text-[10px] font-black ${change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} flex items-center gap-0.5`}>
                                <i className={`fa-solid fa-caret-${change >= 0 ? 'up' : 'down'}`}></i>
                                {Math.abs(change)}%
                            </span>
                        )}
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{label}</span>
                    {intelligence && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase">Market Avg</span>
                                <span className="text-[9px] text-slate-800 dark:text-slate-300 font-black">{intelligence.market_average}%</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase">Percentile</span>
                                <span className={`text-[9px] font-black ${score > intelligence.market_average ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    Top {intelligence.percentile}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CircularProgress
                score={scores.readiness}
                label="Overall Readiness"
                type="readiness"
                change={intelligence?.readiness_change}
            />
            <CircularProgress
                score={scores.technical}
                label="Technical Alignment"
                type="technical"
                change={intelligence?.technical_change}
            />
            <CircularProgress
                score={scores.soft}
                label="Behavioral Fit"
                type="soft"
                change={intelligence?.soft_change}
            />
        </div>
    );
};

export default SkillGapScoreCards;
