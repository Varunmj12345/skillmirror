import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  routeKey?: string;
  className?: string;
}

const variants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,
    transition: {
      duration: 0.15,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const PageTransition: React.FC<PageTransitionProps> = ({ children, routeKey, className = '' }) => {
  return (
    <motion.div
      key={routeKey}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={`w-full min-h-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
