// @ts-nocheck
import React from 'react';

const LocationDemand: React.FC = () => {
    // Mock data for location demand - Indian context
    const locations = [
        { city: 'Bengaluru, India', jobs: 3450, salary: '₹8L - ₹24L', remote: '35%', trend: 'High' },
        { city: 'Hyderabad, India', jobs: 2100, salary: '₹7L - ₹20L', remote: '25%', trend: 'Med' },
        { city: 'Pune, India', jobs: 1800, salary: '₹6L - ₹18L', remote: '20%', trend: 'Med' },
        { city: 'Remote (India)', jobs: 1200, salary: '₹6L - ₹25L', remote: '100%', trend: 'High' },
        { city: 'Gurgaon, India', jobs: 1500, salary: '₹9L - ₹28L', remote: '15%', trend: 'High' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Top Hiring Hubs</h3>
                    <p className="text-xs text-gray-500">Based on active job postings</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                    <i className="fa-solid fa-earth-asia mr-1"></i> India
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="uppercase tracking-wider border-b border-gray-100 bg-gray-50/50 text-gray-500 text-xs">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">City / Region</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Active Jobs</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Avg Salary</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Remote %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {locations.map((loc, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group cursor-default">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            {idx + 1}
                                        </div>
                                        <span className="font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors">{loc.city}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <span className="font-bold text-gray-800 text-base mr-2">{loc.jobs.toLocaleString()}</span>
                                        {loc.trend === 'High' && <i className="fa-solid fa-fire text-orange-500 text-xs animate-pulse" title="High Demand"></i>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 text-xs font-medium">
                                        {loc.salary}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-16 h-2 bg-gray-100 rounded-full mr-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${parseInt(loc.remote) > 50 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}
                                                style={{ width: loc.remote }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">{loc.remote}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                <button
                    onClick={() => window.open('https://www.linkedin.com/jobs/search/?keywords=Software+Development&location=India', '_blank')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    View All Locations <i className="fa-solid fa-arrow-right ml-1"></i>
                </button>
            </div>
        </div>
    );
};

export default LocationDemand;
