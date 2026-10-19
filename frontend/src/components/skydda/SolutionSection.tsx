import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Shield, Zap, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface SolutionFeature {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
}

const features: SolutionFeature[] = [
  {
    id: 1,
    title: '1 — Learn',
    description:
      'SkillMirror Core ingests your code repositories, resume tokens, and market target profiles to map your exact capability boundary.',
    icon: <Brain className="w-5 h-5" />,
    image: '/images/solution-learn.png',
  },
  {
    id: 2,
    title: '2 — Detect',
    description:
      'Autonomously distinguishes between minor syntax variances and genuine architectural liabilities before interviewers discover them.',
    icon: <Shield className="w-5 h-5" />,
    image: '/images/solution-detect.png',
  },
  {
    id: 3,
    title: '3 — Neutralize',
    description:
      'Incinerates career liabilities instantly through automated roadmap sprints, targeted challenge arenas, and real-time ATS optimization.',
    icon: <Zap className="w-5 h-5" />,
    image: '/images/solution-neutralize.png',
  },
];

export function SolutionSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="solution" className="w-full bg-zinc-900 text-white py-24 flex flex-col items-center overflow-hidden border-b border-zinc-700/30">
      <div className="max-w-7xl w-full px-6 md:px-12 lg:px-16 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col gap-4 max-w-[560px]">
          <div className="flex items-center gap-3 px-4 py-2 border border-zinc-700 w-fit">
            <div className="w-2.5 h-2.5 bg-amber-500" />
            <span className="text-sm font-medium text-zinc-400 tracking-wide uppercase font-mono">
              The Solution
            </span>
          </div>
          <h2 className="text-balance text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight text-white">
            {"Introducing SkillMirror Core™".split(" ").map((word, i) => (
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
          <p className="text-balance text-zinc-400 text-base leading-relaxed">
            The world&apos;s first autonomous career defense engine. Unlike static course platforms, SkillMirror continuously models the capability heartbeat of your profile against live industry benchmarks, allowing high-value opportunities to flow while eliminating deficits.
          </p>
        </div>

        {/* Interactive Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[420px]">
          {/* Left: Image Display */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-800 border border-zinc-700/40">
            <AnimatePresence exitBeforeEnter>
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0"
              >
                <img
                  src={features[activeIndex].image}
                  alt={features[activeIndex].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold">
                    Core Phase 0{features[activeIndex].id}
                  </span>
                  <p className="text-lg font-medium text-white mt-1">
                    {features[activeIndex].title}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Synchronized Progress Indicator */}
            <div className="absolute bottom-3 left-4 right-4 h-1 flex gap-2">
              {features.map((_, idx) => (
                <div key={idx} className="h-full flex-1 bg-white/10 overflow-hidden">
                  {activeIndex === idx && (
                    <motion.div
                      className="h-full bg-amber-500"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 8, ease: 'linear' }}
                    />
                  )}
                  {idx < activeIndex && <div className="h-full w-full bg-amber-500" />}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Interactive Step List */}
          <div className="flex flex-col gap-4">
            {features.map((feature, index) => (
              <motion.button
                key={feature.id}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'group relative w-full text-left p-6 transition-all duration-300 outline-none',
                  activeIndex === index
                    ? 'bg-white/[0.04] border border-white/15 shadow-sm'
                    : 'bg-transparent border border-transparent hover:bg-white/[0.02]'
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'mt-1 p-2.5 transition-colors duration-300',
                      activeIndex === index
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/5 text-zinc-400'
                    )}
                  >
                    {feature.icon}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <h3
                      className={cn(
                        'text-xl font-medium transition-colors duration-300',
                        activeIndex === index ? 'text-white' : 'text-zinc-400'
                      )}
                    >
                      {feature.title}
                    </h3>

                    <AnimatePresence>
                      {activeIndex === index && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-zinc-400 text-base leading-relaxed overflow-hidden"
                        >
                          {feature.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div
                    className={cn(
                      'mt-2 transition-all duration-300',
                      activeIndex === index
                        ? 'opacity-100 translate-x-0 text-amber-500'
                        : 'opacity-0 -translate-x-2 text-zinc-600'
                    )}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer/CTA Area */}
        <div className="pt-12 flex justify-center border-t border-white/5">
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-zinc-950 hover:bg-zinc-200 px-8 flex items-center gap-2">
              <span>Explore SkillMirror Core</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
