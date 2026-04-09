import React from 'react';

interface ConsistencyScoreProps {
    score: number;
}

const ConsistencyScore: React.FC<ConsistencyScoreProps> = ({ score }) => {
    return (
        <div className="glass-panel p-6 border-indigo-500/10">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-bolt-lightning text-amber-400"></i>
                    Learning Consistency
                </h2>
                <span className={`text-[10px] font-black uppercase ${score > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {score > 70 ? 'High' : 'Moderate'}
                </span>
            </div>

            <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-200 bg-indigo-500/20">
                            Velocity
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-indigo-400">
                            {score}%
                        </span>
                    </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-900 border border-slate-800">
                    <div
                        style={{ width: `${score}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-1000"
                    />
                </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                Based on activity frequency and completion rates over the last 30 intervals.
            </p>
        </div>
    );
};

export default ConsistencyScore;
