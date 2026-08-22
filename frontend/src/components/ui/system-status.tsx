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
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                item.variant === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : item.variant === 'cyan'
                  ? 'border-cyan-500/30 bg-cyan-500/5'
                  : item.variant === 'warning'
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-rose-500/30 bg-rose-500/5'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Bullet variant={item.variant} size="sm" />
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300 truncate">
                    {item.title}
                  </span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-display font-black text-white">
                  {item.value}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    item.variant === 'success'
                      ? 'text-emerald-400'
                      : item.variant === 'cyan'
                      ? 'text-cyan-400'
                      : item.variant === 'warning'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Engine Diagnostic Bar */}
        <div className="p-3 rounded-lg bg-pop/60 border border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">NEURAL REASONING CORES: 8/8 ACTIVE</span>
          </div>
          <span className="text-slate-400">UPTIME 99.98%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;
