import React from 'react';

interface BenchmarkingProps {
  userScore?: number;
  marketAvg?: number;
  percentile?: number;
  data?: {
    user_score?: number;
    market_avg?: number;
    percentile?: number;
  };
}

const Benchmarking: React.FC<BenchmarkingProps> = (props) => {
  const userScore = props.userScore ?? props.data?.user_score ?? 75;
  const marketAvg = props.marketAvg ?? props.data?.market_avg ?? 65;
  const percentile = props.percentile ?? props.data?.percentile ?? 82;

  return (
    <div className="p-6 border border-zinc-800 bg-zinc-900/90 relative">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 bg-amber-500" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            Competitive Benchmarking
          </h2>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 border border-zinc-800 bg-zinc-950">
          PERCENTILE: {percentile}TH
        </span>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-3xl font-normal tracking-tight text-white tabular-nums leading-none mb-1">
              {percentile}th
            </p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Global IQ Standing
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-emerald-400 font-medium block">
              Top {100 - percentile}% Worldwide
            </span>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">
              Target Role Vector
            </p>
          </div>
        </div>

        {/* Progress Track */}
        <div className="relative h-12 flex items-center py-2">
          {/* Base track */}
          <div className="absolute inset-x-0 h-2 bg-zinc-950 border border-zinc-800" />

          {/* Market Avg Line */}
          <div
            className="absolute h-10 border-l border-dashed border-zinc-500 top-1 z-10"
            style={{ left: `${marketAvg}%` }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider whitespace-nowrap bg-zinc-950 px-1 py-0.2 border border-zinc-800">
                AVG {marketAvg}%
              </span>
            </div>
          </div>

          {/* User Score Bar */}
          <div
            className="h-2 bg-amber-500 relative z-20 transition-all duration-700 ease-out"
            style={{ width: `${userScore}%` }}
          >
            <div className="absolute -top-5 right-0 translate-x-1/2">
              <span className="text-[8px] font-mono text-zinc-950 font-medium uppercase tracking-wider whitespace-nowrap bg-amber-500 px-1 py-0.2">
                YOU {userScore}%
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {[
            { label: 'Technical Proficiency', value: userScore + 5, market: marketAvg - 2 },
            { label: 'Strategic Visibility', value: Math.max(0, userScore - 15), market: marketAvg + 10 },
          ].map((item, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-400 uppercase tracking-wider">{item.label}</span>
                <span className={item.value > item.market ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                  {item.value > item.market ? '+' : ''}{item.value - item.market}% Δ
                </span>
              </div>
              <div className="h-1.5 bg-zinc-950 border border-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-zinc-700 transition-all duration-700"
                  style={{ width: `${item.market}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Benchmarking;

