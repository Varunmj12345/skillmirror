import React from 'react';

interface CareerOutcomeProps {
    projection: {
        expected_match: number;
        salary_range: string;
        readiness_probability: string;
    } | null;
}

const CareerOutcome: React.FC<CareerOutcomeProps> = ({ projection }) => {
    if (!projection) return null;

    return (
        <div className="glass-panel p-5 bg-gradient-to-br from-indigo-900/10 to-slate-900 border-indigo-500/20">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-chart-line-up"></i>
                AI Career Outcome Projection
            </h5>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Impact Match %</p>
                    <p className="text-xl font-black text-emerald-400">+{projection.expected_match}%</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Salary Band</p>
                    <p className="text-lg font-black text-white">{projection.salary_range}</p>
                </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                <p className="text-[10px] text-slate-400 font-medium italic">
                    "Completion of this path places you in the <span className="text-white font-bold">top 15%</span> of applicant pools."
                </p>
            </div>
        </div>
    );
};

export default CareerOutcome;
