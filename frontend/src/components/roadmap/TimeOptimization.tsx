import React from 'react';

interface TimeOptimizationProps {
    data: {
        status: string;
        hours_saved?: number;
        estimated_remaining?: number;
        hours?: number;
    };
}

const TimeOptimization: React.FC<TimeOptimizationProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div className="flex items-center gap-2 mt-2 p-2 rounded-xl bg-slate-950/40 border border-slate-800/40">
            <i className={`fa-solid ${data.status === 'ahead' ? 'fa-forward-fast text-emerald-400' : 'fa-hourglass-half text-amber-400'} text-[10px]`}></i>
            <p className="text-[10px] font-medium text-slate-400 leading-none">
                {data.status === 'ahead' && <span className="text-emerald-400 font-black">Ahead of schedule!</span>}
                {data.status === 'on_track' && <span>On schedule ({data.hours}h spent)</span>}
                {data.status === 'in_progress' && <span>{data.estimated_remaining}h estimated remaining</span>}
                {data.status === 'not_started' && <span>Suggested focus: 4-5h/week</span>}
            </p>
        </div>
    );
};

export default TimeOptimization;
