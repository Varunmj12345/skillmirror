import React from 'react';

export interface BulletProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'cyan';
  size?: 'sm' | 'default' | 'lg';
}

const variantStyles: Record<string, string> = {
  default: 'bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]',
  success: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
  warning: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
  destructive: 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
  cyan: 'bg-cyan-400 shadow-[0_0_8px_rgba(0,217,255,0.6)]',
};

const sizeStyles: Record<string, string> = {
  sm: 'w-1.5 h-1.5 rounded-[1px]',
  default: 'w-2.5 h-2.5 rounded-[2px]',
  lg: 'w-3.5 h-3.5 rounded-[2.5px]',
};

export const Bullet: React.FC<BulletProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`shrink-0 inline-block transition-colors ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.default} ${className}`}
      {...props}
    />
  );
};

export default Bullet;
