import React from 'react';
import { Card, CardHeader, CardContent } from './card';
import { Badge } from './badge';
import { Bullet } from './bullet';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: 'market' | 'skill' | 'salary' | 'job';
  time: string;
  priority: 'high' | 'medium';
}

const sampleAlerts: AlertItem[] = [
  {
    id: 'a1',
    title: 'HIRING SURGE: NEXT.JS & PYTHON',
    message: '+34% increase in full-stack AI engineer openings in the last 72 hours.',
    type: 'market',
    time: '4m ago',
    priority: 'high',
  },
  {
    id: 'a2',
    title: 'SALARY BENCHMARK REVISED',
    message: 'Senior Frontend roles in remote markets adjusted up to $145k-$185k.',
    type: 'salary',
    time: '28m ago',
    priority: 'medium',
  },
  {
    id: 'a3',
    title: 'TARGET ROLE GAP DETECTED',
    message: 'System Design and Docker mastery needed to reach Top 5% candidate tier.',
    type: 'skill',
    time: '2h ago',
    priority: 'high',
  },
];

export const LiveAlertsWidget: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader
        title="LIVE CAREER SIGNALS & ALERTS"
        bulletVariant="warning"
        addon={<Badge variant="outline-warning">3 NEW</Badge>}
      />
      <CardContent className="p-3 bg-card space-y-2.5">
        {sampleAlerts.map((alert) => (
          <div
            key={alert.id}
            className="p-3 rounded-lg bg-pop/60 border border-white/[0.04] hover:border-cyan-500/30 transition-all text-xs font-mono"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-white text-[11px] truncate">
                <Bullet
                  variant={alert.priority === 'high' ? 'warning' : 'cyan'}
                  size="sm"
                />
                <span className="truncate">{alert.title}</span>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">{alert.time}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {alert.message}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LiveAlertsWidget;
