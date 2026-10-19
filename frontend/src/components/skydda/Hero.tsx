import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Menu, X, ArrowRight, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

interface HeroProps {
  user?: any;
}

export function Hero({ user }: HeroProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-zinc-950 flex flex-col justify-between">
      {/* Background Hero Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45"
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')",
        }}
      />

      {/* Subtle Dark Vignette & Mesh Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/40 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Top Header / Navigation */}
      <header className="relative z-50 w-full px-6 py-6 border-b border-zinc-800/60 bg-zinc-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-3 text-white group cursor-pointer">
              <div className="w-8 h-8 rounded-none border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-base tracking-tight text-white flex items-center gap-1.5">
                  SkillMirror <span className="text-amber-500 text-xs px-1.5 py-0.2 border border-amber-500/40 bg-amber-500/10 uppercase font-mono">Core</span>
                </span>
              </div>
            </a>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-8 text-sm text-zinc-300 lg:flex">
            <a href="#problem" className="transition-colors hover:text-white">
              The Problem
            </a>
            <a href="#solution" className="transition-colors hover:text-white">
              Solution
            </a>
            <a href="#features" className="transition-colors hover:text-white">
              Capabilities
            </a>
            <a href="#telemetry" className="transition-colors hover:text-white">
              Live Telemetry
            </a>
            <a href="#pricing" className="transition-colors hover:text-white">
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-white">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-4">
            {!user ? (
              <Link href="/login">
                <a className="hidden text-sm font-medium text-zinc-300 transition-colors hover:text-white lg:block">
                  Sign In
                </a>
              </Link>
            ) : null}

            <Link href={user ? '/dashboard' : '/signup'}>
              <Button
                variant="white"
                size="sm"
                className="hidden lg:inline-flex text-xs font-semibold uppercase tracking-wider"
              >
                {user ? 'Open Dashboard' : 'Get Started'}
              </Button>
            </Link>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white lg:hidden p-2 hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 lg:hidden">
            <div className="flex flex-col px-6 py-6 gap-4 text-sm">
              <a
                href="#problem"
                className="text-zinc-300 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                The Problem
              </a>
              <a
                href="#solution"
                className="text-zinc-300 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solution
              </a>
              <a
                href="#features"
                className="text-zinc-300 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Capabilities
              </a>
              <a
                href="#telemetry"
                className="text-zinc-300 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Live Telemetry
              </a>
              <a
                href="#pricing"
                className="text-zinc-300 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-zinc-300 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
                {!user ? (
                  <Link href="/login">
                    <a className="text-zinc-300 hover:text-white py-1">Sign In</a>
                  </Link>
                ) : null}
                <Link href={user ? '/dashboard' : '/signup'}>
                  <Button variant="white" size="sm" className="w-full">
                    {user ? 'Open Dashboard' : 'Get Started'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-16 pb-20 text-center max-w-5xl mx-auto">
        {/* Subtle Status Pill */}
        <div className="flex items-center gap-3 px-4 py-1.5 border border-zinc-700/80 bg-zinc-900/60 backdrop-blur-sm mb-8">
          <div className="w-2.5 h-2.5 bg-amber-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300 tracking-wider uppercase font-mono">
            Autonomous Career Sentinel • Engine v2.4
          </span>
        </div>

        {/* Word-by-Word Blur Reveal Headline */}
        <h1 className="text-balance text-5xl font-normal tracking-tight text-white md:text-6xl lg:text-7xl max-w-4xl">
          {"Fix Your Resume Before Recruiters Reject It".split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ filter: "blur(10px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-balance text-zinc-300 text-base leading-relaxed md:text-lg">
          Upload your resume. Get your ATS score, your skill gaps, and a personalized plan to close them, all before you hit apply.
        </p>

        {/* Dual Stark CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row w-full sm:w-auto">
          <Link href={user ? '/dashboard' : '/signup'}>
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-zinc-950 hover:bg-zinc-200 px-8 font-medium text-sm"
            >
              <span>{user ? 'Open Dashboard' : 'Scan My Resume Free'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>

          <Link href="/skill-gap">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-zinc-700 bg-zinc-900/40 text-white hover:bg-zinc-800/80 px-8 text-sm"
            >
              <Terminal className="w-4 h-4 mr-1 text-amber-500" />
              <span>Analyze Skill Gaps</span>
            </Button>
          </Link>
        </div>

        {/* Micro Guarantee Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span>Zero-Risk Career Telemetry</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span>ATS Parsing Accuracy: 99.4%</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span>Real-Time Market Benchmarks</span>
          </div>
        </div>
      </div>

      {/* Bottom Border Line */}
      <div className="w-full border-b border-zinc-800" />
    </section>
  );
}
