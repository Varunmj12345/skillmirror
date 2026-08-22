import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { TVNoise } from './tv-noise';

export interface TelemetryWidgetProps {
  location?: string;
  timezone?: string;
  engineStatus?: string;
  className?: string;
}

export const TelemetryWidget: React.FC<TelemetryWidgetProps> = ({
  location = 'Global Career Mesh',
  timezone = 'UTC+05:30',
  engineStatus = 'Neural v2.4 Active',
  className = '',
}) => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return { day: 'SYNCING', dateStr: 'Connecting node...' };
    const day = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();
    return { day, dateStr };
  };

  const { day, dateStr } = formatDate(time);

  return (
    <Card className={`w-full relative overflow-hidden group ${className}`}>
      <TVNoise opacity={0.05} intensity={0.18} speed={40} />
      <CardContent className="flex flex-col justify-between p-4 min-h-[160px] relative z-20 bg-gradient-to-b from-card via-card to-pop/60">
        {/* Top Header */}
        <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-wider text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400">{day}</span>
          </div>
          <span>{dateStr}</span>
        </div>

        {/* Center Clock Display */}
        <div className="text-center my-2">
          <div className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            {formatTime(time)}
          </div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
            {engineStatus}
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="flex justify-between items-center pt-2 border-t border-white/[0.06] text-[10px] font-mono text-slate-400">
          <span className="truncate max-w-[140px]">{location}</span>
          <Badge variant="outline-cyan">{timezone}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TelemetryWidget;
