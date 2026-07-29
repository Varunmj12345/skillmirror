import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '0.5rem',
  className = '',
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
          height="1rem"
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`sm-glass p-6 rounded-[1.5rem] flex flex-col justify-between ${className}`} style={{ height: '140px' }}>
      <div className="flex justify-between items-start">
        <Skeleton width="40%" height="0.875rem" />
        <Skeleton width="2.25rem" height="2.25rem" borderRadius="0.75rem" />
      </div>
      <Skeleton width="30%" height="2.5rem" className="mt-4" />
    </div>
  );
};
