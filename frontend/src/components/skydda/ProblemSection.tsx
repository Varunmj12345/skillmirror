import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

export function ProblemSection() {
  return (
    <section id="problem" className="relative w-full bg-zinc-900 py-24 md:py-32 border-b border-zinc-700/30">
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><filter id=\"noise\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" result=\"noise\" /></filter><rect width=\"100\" height=\"100\" filter=\"url(%23noise)\" fill=\"%23ffffff\"/></svg>')",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-center px-6 md:px-12 lg:px-16">
        <div className="space-y-8 text-center flex flex-col items-center max-w-4xl">
          {/* Section Indicator */}
          <div className="flex items-center gap-3 px-4 py-2 border border-zinc-700 w-fit">
            <div className="w-2.5 h-2.5 bg-amber-500" />
            <span className="text-sm font-medium text-zinc-400 tracking-wide uppercase font-mono">
              The Problem
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-balance text-4xl font-normal tracking-tight text-white md:text-5xl lg:text-6xl">
            {"The Career Perimeter Has Dissolved".split(" ").map((word, i) => (
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

          {/* Paragraph */}
          <p className="text-balance text-base md:text-lg leading-relaxed text-zinc-400 max-w-2xl">
            Traditional resumes and passive job boards were engineered for a static era. Today, automated ATS screening algorithms discard 85% of applicants without human review, while interview bars shift overnight. Technical liabilities and unquantified skill blindspots cost engineers promotions and six-figure offers. You don&apos;t need a higher application volume; you need sharper vision.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-center w-full sm:w-auto">
            <Link href="/skill-gap">
              <Button size="lg" className="w-full sm:w-auto bg-white text-zinc-950 hover:bg-zinc-200">
                Analyze Your Vulnerabilities
              </Button>
            </Link>
            <a href="#telemetry">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-zinc-700 text-white hover:bg-zinc-800"
              >
                View Live Telemetry
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
