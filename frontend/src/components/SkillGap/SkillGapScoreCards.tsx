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
        if (type === 'readiness') return 'stroke-amber-400';
        if (type === 'technical') return 'stroke-white';
        return 'stroke-emerald-400';
    };

    function CircularProgress({ score, label, type, change }: { score: number; label: string; type: string; change?: number }): React.ReactElement {
        const radius = 36;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;

        return (
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center justify-center group relative overflow-hidden transition-all hover:border-zinc-700">
                <div className="relative w-28 h-28 mb-4">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            className="text-zinc-800 stroke-current"
                            strokeWidth="5"
                            fill="transparent"
                            r={radius}
                            cx="56"
                            cy="56"
                        />
                        <circle
                            className={`${getProgressColor(score, type)} stroke-current transition-all duration-[1500ms] ease-out`}
                            strokeWidth="5"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            fill="transparent"
                            r={radius}
                            cx="56"
                            cy="56"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black font-mono text-white tracking-tight">{Math.round(score)}%</span>
                        {change !== undefined && (
                            <span className={`text-[10px] font-mono font-bold ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-0.5`}>
                                <i className={`fa-solid fa-caret-${change >= 0 ? 'up' : 'down'}`}></i>
                                {Math.abs(change)}%
                            </span>
                        )}
                    </div>
                </div>

                <div className="text-center space-y-2 w-full">
                    <div className="flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
                    </div>
                    {intelligence && (
                        <div className="pt-3 border-t border-zinc-800 flex flex-col gap-1.5 w-full">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-zinc-500 uppercase">Market Avg</span>
                                <span className="text-zinc-300 font-bold">{intelligence.market_average}%</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-zinc-500 uppercase">Percentile</span>
                                <span className={`font-bold ${score > intelligence.market_average ? 'text-emerald-400' : 'text-amber-400'}`}>
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
