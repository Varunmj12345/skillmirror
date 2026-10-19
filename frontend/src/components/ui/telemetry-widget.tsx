import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './card';

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
    <Card className={`w-full relative overflow-hidden bg-zinc-900/90 border-zinc-800 text-zinc-200 group ${className}`}>
      <CardContent className="flex flex-col justify-between p-4 min-h-[160px] relative z-20">
        {/* Top Header */}
        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400" />
            <span className="text-emerald-400 font-semibold">{day}</span>
          </div>
          <span className="text-zinc-500">{dateStr}</span>
        </div>

        {/* Center Clock Display */}
        <div className="text-center my-2">
          <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
            {formatTime(time)}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
            {engineStatus}
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-400">
          <span className="truncate max-w-[140px] text-zinc-300">{location}</span>
          <span className="px-1.5 py-0.5 border border-zinc-700 bg-zinc-950 text-amber-400 text-[10px] font-mono">
            {timezone}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TelemetryWidget;
