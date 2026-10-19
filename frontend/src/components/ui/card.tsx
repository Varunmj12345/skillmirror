import React from 'react';
import { cn } from '../../lib/utils';
import { Bullet, BulletProps } from './bullet';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'panel' | 'ghost' | 'interactive';
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  glow = false,
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-sm',
    panel: 'bg-zinc-850 border border-zinc-800 text-zinc-200',
    ghost: 'bg-transparent border border-zinc-800/80 text-zinc-100',
    interactive:
      'bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-sm hover:border-zinc-700 transition-all duration-150 cursor-pointer',
  };

  return (
    <div
      className={cn(
        'rounded-none overflow-hidden flex flex-col',
        variantStyles[variant] || variantStyles.default,
        glow && 'hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  bulletVariant?: BulletProps['variant'];
  addon?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  bulletVariant = 'default',
  addon,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 border-b border-zinc-800/60 min-h-[44px]',
        className
      )}
      {...props}
    >
      {title ? (
        <div className="flex items-center gap-2.5 min-w-0">
          <Bullet variant={bulletVariant} />
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-mono font-semibold tracking-wide uppercase text-zinc-100 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      ) : (
        children
      )}
      {addon && <div className="shrink-0 ml-3">{addon}</div>}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h3
      className={cn(
        'text-xs sm:text-sm font-mono font-semibold tracking-wide uppercase text-zinc-100',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <p className={cn('text-xs font-mono text-zinc-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={cn('p-4 flex-1 text-zinc-300 font-mono text-xs', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 border-t border-zinc-800/60 text-xs font-mono text-zinc-400 bg-zinc-950/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
