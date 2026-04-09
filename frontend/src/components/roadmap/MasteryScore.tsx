import React from 'react';

interface MasteryScoreProps {
    score: number;
    confidence: number;
}

const MasteryScore: React.FC<MasteryScoreProps> = ({ score, confidence }) => {
    return (
        <div className="flex gap-4 items-center">
            <div className="flex-1">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter mb-1.5">
                    <span className="text-slate-500">Mastery Score</span>
                    <span className="text-indigo-400">{Math.round(score)}%</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.3)] transition-all duration-1000"
                        style={{ width: `${score}%` }}
                    />
                </div>
            </div>
            <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-tighter text-slate-500 mb-1">Confidence</p>
                <p className={`text-xs font-bold ${confidence > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {confidence > 70 ? 'High' : 'Steady'}
                </p>
            </div>
        </div>
    );
};

export default MasteryScore;
