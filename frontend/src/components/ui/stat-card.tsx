import React from 'react';
import { Card, CardHeader, CardContent } from './card';
import { Bullet } from './bullet';
import { Badge } from './badge';

export interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
  intent?: 'positive' | 'negative' | 'neutral' | 'cyan';
  direction?: 'up' | 'down';
  tag?: string;
  icon?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  description,
  intent = 'positive',
  direction,
  tag,
  icon,
  className = '',
}) => {
  const bulletVariant =
    intent === 'positive'
      ? 'success'
      : intent === 'negative'
      ? 'destructive'
      : intent === 'cyan'
      ? 'cyan'
      : 'warning';

  return (
    <Card className={`group ${className}`}>
      <CardHeader
        title={label}
        bulletVariant={bulletVariant}
        addon={
          tag ? (
            <Badge variant="secondary">{tag}</Badge>
          ) : icon ? (
            <i className={`fa-solid ${icon} text-slate-400 text-xs`} />
          ) : null
        }
      />
      <CardContent className="flex items-center justify-between p-4 bg-card min-h-[100px]">
        <div className="flex flex-col justify-center">
          <div className="sm-metric group-hover:text-cyan-300 transition-colors">
            {value}
          </div>
          <span className="sm-label mt-1 text-slate-400">
            {description}
          </span>
        </div>

        {direction && (
          <div className="shrink-0 flex items-center justify-center pl-2">
            <span
              className={`text-center text-4xl sm:text-5xl font-display font-black leading-none block transition-all duration-700 animate-marquee-pulse ${
                direction === 'up' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {direction === 'up' ? '↑' : '↓'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
