// @ts-nocheck
import React from 'react';
import { Bullet } from './ui/bullet';
import { Badge } from './ui/badge';
import { TVNoise } from './ui/tv-noise';

const LocationDemand: React.FC = () => {
    const locations = [
        { city: 'Bengaluru, India', jobs: 3450, salary: '₹8L - ₹24L', remote: '35%', trend: 'High' },
        { city: 'Hyderabad, India', jobs: 2100, salary: '₹7L - ₹20L', remote: '25%', trend: 'Med' },
        { city: 'Pune, India', jobs: 1800, salary: '₹6L - ₹18L', remote: '20%', trend: 'Med' },
        { city: 'Remote (India)', jobs: 1200, salary: '₹6L - ₹25L', remote: '100%', trend: 'High' },
        { city: 'Gurgaon, India', jobs: 1500, salary: '₹9L - ₹28L', remote: '15%', trend: 'High' },
    ];

    return (
        <div className="bg-pop rounded-2xl border border-white/[0.07] overflow-hidden mb-6 relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
            <TVNoise opacity={0.02} />

            <div className="p-6 border-b border-white/[0.05] flex justify-between items-center relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Bullet variant="success" size="sm" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">GEOGRAPHIC DISTRIBUTION</span>
                    </div>
                    <h3 className="text-base font-display font-black text-white">Top Hiring Hubs</h3>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">Based on active position feeds across Indian tech ecosystems</p>
                </div>
                <Badge variant="outline-cyan">
                    <i className="fa-solid fa-earth-asia mr-1.5 text-xs"></i> India Hub
                </Badge>
            </div>

            <div className="overflow-x-auto relative z-10">
                <table className="min-w-full text-left text-xs font-mono whitespace-nowrap">
                    <thead className="uppercase tracking-wider border-b border-white/[0.05] bg-white/[0.02] text-slate-400 text-[10px]">
                        <tr>
                            <th scope="col" className="px-6 py-3.5 font-bold">Node / Region</th>
                            <th scope="col" className="px-6 py-3.5 font-bold">Active Postings</th>
                            <th scope="col" className="px-6 py-3.5 font-bold">Avg Range</th>
                            <th scope="col" className="px-6 py-3.5 font-bold">Remote Index</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {locations.map((loc, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.03] transition-colors group cursor-default">
                                <td className="px-6 py-3.5">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400 flex items-center justify-center mr-3 font-bold text-[10px] group-hover:border-cyan-500/40 group-hover:text-cyan-400 transition-colors">
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">{loc.city}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-display font-black text-white text-sm">{loc.jobs.toLocaleString()}</span>
                                        {loc.trend === 'High' && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300">
                                                HOT 🔥
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3.5">
                                    <span className="bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded-md border border-emerald-500/20 font-bold">
                                        {loc.salary}
                                    </span>
                                </td>
                                <td className="px-6 py-3.5">
                                    <div className="flex items-center">
                                        <div className="w-20 h-1.5 bg-white/[0.06] rounded-full mr-2.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${parseInt(loc.remote) > 50 ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                                                style={{ width: loc.remote }}
                                            ></div>
                                        </div>
                                        <span className="text-slate-400 font-bold">{loc.remote}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-3.5 text-center border-t border-white/[0.05] bg-white/[0.01] relative z-10">
                <button
                    onClick={() => window.open('https://www.linkedin.com/jobs/search/?keywords=Software+Development&location=India', '_blank')}
                    className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                    <span>View Extended Regional Map</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
            </div>
        </div>
    );
};

export default LocationDemand;
