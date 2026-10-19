import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface CtaSectionProps {
  user?: any;
}

export function CtaSection({ user }: CtaSectionProps) {
  return (
    <section className="relative w-full overflow-hidden border-b border-zinc-700/30">
      {/* Background Image with Dark Vignette Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-16 py-24 md:py-32 lg:py-36">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 px-4 py-2 border border-zinc-700 w-fit mb-8 bg-zinc-900/60 backdrop-blur-sm">
            <div className="w-2.5 h-2.5 bg-amber-500 animate-pulse" />
            <span className="text-xs font-medium text-zinc-300 tracking-wider uppercase font-mono">
              Ready for Deployment
            </span>
          </div>

          <h2 className="text-balance text-4xl font-normal tracking-tight text-white md:text-5xl lg:text-6xl">
            {"Step into the future, guided by AI clarity".split(" ").map((word, i) => (
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

          <p className="text-balance mt-6 max-w-xl text-base leading-relaxed text-zinc-300 md:text-lg">
            Experience autonomous career intelligence and skill gap detection today. Deploy your profile and see how AI fortifies your career trajectory.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link href={user ? '/dashboard' : '/signup'}>
              <Button size="lg" className="w-full sm:w-auto bg-white text-zinc-950 hover:bg-zinc-200 px-8 flex items-center gap-2">
                <span>{user ? 'Open Dashboard' : 'Deploy Career Sentinel Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/mock-interview">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-zinc-700 text-white hover:bg-zinc-800">
                Launch Mock Simulation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
