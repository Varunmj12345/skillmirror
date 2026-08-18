import React from 'react';
import { motion } from 'framer-motion';
import useScrollReveal from '../hooks/useScrollReveal';

type RevealType = 'card' | 'heading' | 'default';

interface RevealWrapperProps {
  children: React.ReactNode;
  delay?: number; // delay in milliseconds
  type?: RevealType;
  className?: string;
  width?: 'fit-content' | '100%';
}

const variants = {
  card: {
    hidden: { opacity: 0, y: 24 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        delay: delay / 1000,
      },
    }),
  },
  heading: {
    hidden: { opacity: 0, x: -16 },
    visible: (delay: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        delay: delay / 1000,
      },
    }),
  },
  default: {
    hidden: { opacity: 0 },
    visible: (delay: number) => ({
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        delay: delay / 1000,
      },
    }),
  },
};

export const RevealWrapper: React.FC<RevealWrapperProps> = ({
  children,
  delay = 0,
  type = 'card',
  className = '',
  width = '100%',
}) => {
  const [ref, isVisible] = useScrollReveal();

  const selectedVariant = variants[type] || variants.default;

  return (
    <div ref={ref as any} style={{ width }} className={className}>
      <motion.div
        variants={selectedVariant}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        custom={delay}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default RevealWrapper;
