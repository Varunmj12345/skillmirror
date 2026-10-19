import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number | string;
  priceYearly: number | string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  type: 'free' | 'subscription' | 'custom';
}

const plans: PricingPlan[] = [
  {
    id: 'observer',
    name: 'Observer',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Essential career telemetry and basic gap audit for early exploratory planning.',
    features: [
      '1 Target Role Vector',
      'Weekly Skill Gap Audit',
      'Basic ATS Resume Parser',
      'Access to Public Practice Arena',
      'Standard Community Support',
    ],
    cta: 'Start Free Observer',
    type: 'free',
  },
  {
    id: 'sentinel-pro',
    name: 'Career Sentinel Pro',
    priceMonthly: 29,
    priceYearly: 23,
    description: 'Autonomous AI career defense with continuous gap detection and mock interviews.',
    features: [
      'Unlimited Target Role Vectors',
      'Real-Time Skill Gap Radar & AST Code Audit',
      'Unlimited AI Mock Interviews with Voice Audio',
      'Full ATS Bullet Rewriter & Formatting Shield',
      'Dynamic Weekly Sprint Roadmap Synthesizer',
      'Real-Time Salary Intelligence & Benchmarks',
      'Priority Neural Copilot Access',
    ],
    cta: 'Deploy Sentinel Pro',
    popular: true,
    type: 'subscription',
  },
  {
    id: 'executive',
    name: 'Executive Lab',
    priceMonthly: 79,
    priceYearly: 63,
    description: 'Dedicated career twin simulation for Staff, Principal, and Engineering Leadership roles.',
    features: [
      'Full Career Digital Twin Simulation',
      'Custom System Design On-Site Scenarios',
      'Executive Compensation & Equity Negotiation AI',
      'Dedicated Senior Advisor Review',
      'Direct Recruiter Matchmaking Telemetry',
      'Guaranteed SLA & Interview Pass Support',
    ],
    cta: 'Access Executive Lab',
    type: 'custom',
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="w-full bg-zinc-900 py-24 md:py-32 border-b border-zinc-700/30">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-4 py-2 border border-zinc-700 w-fit">
            <div className="w-2.5 h-2.5 bg-amber-500" />
            <span className="text-sm font-medium text-zinc-400 tracking-wide uppercase font-mono">
              Pricing
            </span>
          </div>

          <h2 className="text-balance text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight font-normal text-white">
            <span className="block">
              {"Invest in Your Career Alpha".split(" ").map((word, i) => (
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
            </span>
          </h2>
          <p className="text-balance text-zinc-400 text-base md:text-lg max-w-xl">
            Transparent pricing designed to yield an immediate 10x ROI on your next technical offer or promotion.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center border border-zinc-700 bg-zinc-950 p-1">
              <button
                onClick={() => setIsYearly(false)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  !isYearly ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                  isYearly ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                )}
              >
                <span>Annual</span>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-mono px-1.5 py-0.5 border border-amber-500/30">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col justify-between p-8 md:p-10 transition-all duration-300',
                plan.popular
                  ? 'bg-zinc-950 border-2 border-white shadow-2xl'
                  : 'bg-zinc-950/60 border border-zinc-700/50 hover:border-zinc-500'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-8 bg-amber-500 text-black text-[11px] font-bold font-mono tracking-widest uppercase px-3 py-1">
                  RECOMMENDED
                </div>
              )}

              <div>
                <h3 className="text-2xl font-normal text-white">{plan.name}</h3>
                <p className="text-sm text-zinc-400 mt-2 min-h-[40px]">{plan.description}</p>

                {/* Price */}
                <div className="mt-8 flex items-baseline gap-2">
                  <span className="text-5xl font-light text-white tracking-tight">
                    {typeof plan.priceMonthly === 'number'
                      ? `$${isYearly ? plan.priceYearly : plan.priceMonthly}`
                      : plan.priceMonthly}
                  </span>
                  {typeof plan.priceMonthly === 'number' && plan.priceMonthly > 0 && (
                    <span className="text-xs font-mono text-zinc-500 uppercase">
                      / month {isYearly ? '(billed yearly)' : ''}
                    </span>
                  )}
                  {plan.priceMonthly === 0 && (
                    <span className="text-xs font-mono text-zinc-500 uppercase">/ forever</span>
                  )}
                </div>

                {/* Divider */}
                <div className="my-8 h-px bg-zinc-800" />

                {/* Features List */}
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Action Button */}
              <div className="mt-10 pt-6 border-t border-zinc-800/80">
                <Link href={plan.type === 'free' ? '/signup' : '/signup?plan=' + plan.id}>
                  <Button
                    variant={plan.popular ? 'white' : 'outline'}
                    size="lg"
                    className="w-full text-sm font-medium"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
