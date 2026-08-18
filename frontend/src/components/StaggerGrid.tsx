import React from 'react';
import RevealWrapper from './RevealWrapper';

interface StaggerGridProps {
  children: React.ReactNode;
  staggerDelay?: number; // in milliseconds
  className?: string;
  type?: 'card' | 'heading' | 'default';
}

export const StaggerGrid: React.FC<StaggerGridProps> = ({
  children,
  staggerDelay = 80,
  className = '',
  type = 'card',
}) => {
  const childArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <RevealWrapper key={index} delay={index * staggerDelay} type={type}>
          {child}
        </RevealWrapper>
      ))}
    </div>
  );
};

export default StaggerGrid;
