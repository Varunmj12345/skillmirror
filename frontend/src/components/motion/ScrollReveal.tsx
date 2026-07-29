import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

type VariantType = 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'zoomIn';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: VariantType;
  delay?: number;
  width?: 'fit-content' | '100%';
  className?: string;
  stagger?: boolean; // If true, variants will be controlled by a parent StaggerChildren
}

const getVariant = (type: VariantType) => {
  switch (type) {
    case 'fadeUp':
      return {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      };
    case 'fadeLeft':
      return {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      };
    case 'fadeRight':
      return {
        hidden: { opacity: 0, x: 30 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      };
    case 'zoomIn':
      return {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      };
  }
};

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fadeUp',
  delay = 0,
  width = '100%',
  className = '',
  stagger = false
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const selectedVariant = getVariant(variant);

  if (stagger) {
    // When staggering, we don't trigger manually, we rely on parent variants
    return (
      <motion.div variants={selectedVariant} style={{ width }} className={className}>
        {children}
      </motion.div>
    );
  }

  return (
    <div ref={ref} style={{ width, overflow: 'hidden' }} className={className}>
      <motion.div
        variants={selectedVariant}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        transition={{ delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export const StaggerChildren: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.08, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
};
