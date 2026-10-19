import React from 'react';

const LocationDemand: React.FC = () => {
    const locations = [
        { city: 'Bengaluru, India', jobs: 3450, salary: '₹8L - ₹24L', remote: '35%', trend: 'High' },
        { city: 'Hyderabad, India', jobs: 2100, salary: '₹7L - ₹20L', remote: '25%', trend: 'Med' },
        { city: 'Pune, India', jobs: 1800, salary: '₹6L - ₹18L', remote: '20%', trend: 'Med' },
        { city: 'Remote (India)', jobs: 1200, salary: '₹6L - ₹25L', remote: '100%', trend: 'High' },
        { city: 'Gurgaon, India', jobs: 1500, salary: '₹9L - ₹28L', remote: '15%', trend: 'High' },
    ];

    return (
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden mb-6 font-mono">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">GEOGRAPHIC DISTRIBUTION</span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100">Top Hiring Hubs</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Active tech employment corridors in India</p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px] font-bold">
                    India Core
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs whitespace-nowrap">
                    <thead className="uppercase tracking-wider border-b border-zinc-800 bg-zinc-950/60 text-zinc-500 text-[10px]">
                        <tr>
                            <th scope="col" className="px-5 py-3 font-bold">Node Region</th>
                            <th scope="col" className="px-5 py-3 font-bold">Active Postings</th>
                            <th scope="col" className="px-5 py-3 font-bold">Comp Band</th>
                            <th scope="col" className="px-5 py-3 font-bold">Remote Index</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                        {locations.map((loc, idx) => (
                            <tr key={idx} className="hover:bg-zinc-950/40 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 flex items-center justify-center mr-2.5 font-bold text-[9px]">
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-zinc-200">{loc.city}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-zinc-100 tabular-nums">{loc.jobs.toLocaleString()}</span>
                                        {loc.trend === 'High' && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/10 border border-amber-500/30 text-amber-400">
                                                HOT 🔥
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="bg-zinc-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold tabular-nums">
                                        {loc.salary}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-zinc-400 tabular-nums">
                                    {loc.remote}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LocationDemand;
