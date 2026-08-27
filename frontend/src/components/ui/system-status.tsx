import React from 'react';
import { Card, CardHeader, CardContent } from './card';
import { Badge } from './badge';
import { Bullet } from './bullet';

interface StatusMetric {
  title: string;
  value: string;
  status: string;
  variant: 'success' | 'warning' | 'destructive' | 'cyan';
}

const statusList: StatusMetric[] = [
  {
    title: 'ATS MATCHING ENGINE',
    value: '99.4%',
    status: '[OPERATIONAL]',
    variant: 'success',
  },
  {
    title: 'MARKET TELEMETRY CRAWLER',
    value: '52,480 NODES',
    status: '[STREAMING]',
    variant: 'cyan',
  },
  {
    title: 'NEURAL ROADMAP SYNTHESIZER',
    value: 'v2.4-LLM',
    status: '[READY]',
    variant: 'success',
  },
  {
    title: 'LATENCY BENCHMARK',
    value: '42ms',
    status: '[OPTIMAL]',
    variant: 'warning',
  },
];

export const SystemStatus: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader
        title="NEURAL ENGINE & SECURITY POSTURE"
        bulletVariant="success"
        addon={<Badge variant="outline-success">ONLINE</Badge>}
      />
      <CardContent className="p-3 bg-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {statusList.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                item.variant === 'success'
                  ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-500/5'
                  : item.variant === 'cyan'
                  ? 'border-blue-200 dark:border-cyan-500/30 bg-blue-50/80 dark:bg-cyan-500/5'
                  : item.variant === 'warning'
                  ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-500/5'
                  : 'border-rose-200 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-500/5'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Bullet variant={item.variant} size="sm" />
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-700 dark:text-slate-300 truncate">
                    {item.title}
                  </span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-display font-black text-slate-900 dark:text-white">
                  {item.value}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    item.variant === 'success'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : item.variant === 'cyan'
                      ? 'text-blue-600 dark:text-cyan-400'
                      : item.variant === 'warning'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Engine Diagnostic Bar */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 dark:text-slate-300 font-bold">NEURAL REASONING CORES: 8/8 ACTIVE</span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-bold">UPTIME 99.98%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;
