import React from 'react';
import { Bullet, BulletProps } from './bullet';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className = '',
  glow = false,
  children,
  ...props
}) => {
  return (
    <div
      className={`cyber-card ${glow ? 'hover:border-cyan-500/40 hover:shadow-neon-cyan' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  bulletVariant?: BulletProps['variant'];
  addon?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  bulletVariant = 'default',
  addon,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 min-h-[36px] ${className}`}
      {...props}
    >
      {title ? (
        <div className="flex items-center gap-2.5">
          <Bullet variant={bulletVariant} />
          <span className="sm-card-title">{title}</span>
        </div>
      ) : (
        children
      )}
      {addon && <div className="shrink-0">{addon}</div>}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h3 className={`sm-card-title ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`cyber-card-inner ${className}`} {...props}>
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
    <div className={`flex items-center justify-between px-3 py-2 text-xs text-muted-foreground ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
