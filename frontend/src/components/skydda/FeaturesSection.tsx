import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Shield, Zap, Compass, Code, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface FeatureItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: '1',
    icon: <Brain className="w-5 h-5 text-black" />,
    title: 'Autonomous Skill Gap Radar',
    description:
      'Continuous multi-dimensional vector audit comparing your exact repository abilities against top 5% market benchmarks to quantify missing competencies.',
  },
  {
    id: '2',
    icon: <Shield className="w-5 h-5 text-black" />,
    title: 'ATS Shield & Resume Optimizer',
    description:
      'Deep structural parser that aligns resume keywords, achievement metrics, and experience hierarchy against modern enterprise screening filters.',
  },
  {
    id: '3',
    icon: <Zap className="w-5 h-5 text-black" />,
    title: 'AI Mock Interview Sentinel',
    description:
      'High-pressure technical and behavioral simulations with adaptive questioning, audio/speech telemetry, and instant rubrics.',
  },
  {
    id: '4',
    icon: <Compass className="w-5 h-5 text-black" />,
    title: 'Dynamic Roadmap Synthesizer',
    description:
      'Synthesizes personalized week-by-week sprint trajectories, curated documentation, and coding challenges to close high-severity deficits.',
  },
  {
    id: '5',
    icon: <Code className="w-5 h-5 text-black" />,
    title: 'Live Practice Arena',
    description:
      'Browser-based coding environment with automated unit tests, runtime complexity profiling, and AI hints tuned to FAANG standards.',
  },
  {
    id: '6',
    icon: <TrendingUp className="w-5 h-5 text-black" />,
    title: 'Market Intelligence & Salary Alpha',
    description:
      'Real-time compensation analytics, hiring momentum trends, and tier-by-tier salary lift projections based on current skills.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="w-full bg-zinc-900 py-24 border-b border-zinc-700/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 mb-16"
        >
          <div className="flex items-center gap-3 px-4 py-2 border border-zinc-700 w-fit">
            <div className="w-2.5 h-2.5 bg-amber-500" />
            <span className="text-sm font-medium text-zinc-400 tracking-wide uppercase font-mono">
              Key Capabilities
            </span>
          </div>

          <h2 className="text-balance text-white text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] max-w-[750px] tracking-tight">
            {"Built for the High-Stakes Technical Market".split(" ").map((word, i) => (
              <motion.span
                key={i}
                initial={{ filter: "blur(10px)", opacity: 0 }}
                whileInView={{ filter: "blur(0px)", opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="inline-block mr-[0.25em]"
              >
                {word}
              </motion.span>
            ))}
          </h2>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-16"
        >
          {DEFAULT_FEATURES.map((feature) => (
            <motion.div key={feature.id} variants={itemVariants} className="flex flex-col group">
              {/* Amber Gradient Icon Badge */}
              <div className="mb-8">
                <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 transform transition-transform group-hover:scale-110 duration-300">
                  {feature.icon}
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-3">
                <h4 className="text-white text-xl font-medium tracking-tight">
                  {feature.title}
                </h4>
                <p className="text-balance text-zinc-400 text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto bg-white text-zinc-950 hover:bg-zinc-200 px-8">
              Explore All Modules
            </Button>
          </Link>
          <a href="#pricing">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-zinc-700 text-white hover:bg-zinc-800 bg-transparent px-8"
            >
              Compare Plans
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
