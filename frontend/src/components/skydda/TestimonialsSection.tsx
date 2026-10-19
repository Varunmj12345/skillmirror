import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    quote:
      "SkillMirror's Career Sentinel flagged 4 critical system design vulnerabilities in my profile that I had no idea were causing initial screen drop-offs. After following the 3-week sprint roadmap, I cleared Staff Engineer interviews at Stripe and Google.",
    author: 'Sarah Chen',
    role: 'STAFF DISTRIBUTED SYSTEMS ENGINEER AT TECHCORP',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=6B5B95',
  },
  {
    id: 2,
    quote:
      "I was stuck submitting hundreds of applications with standard resumes getting auto-rejected by Greenhouse. SkillMirror's ATS Shield reconstructed my technical impact metrics, and my response rate went from 4% to 38% in two weeks.",
    author: 'Marcus Rodriguez',
    role: 'LEAD INFRASTRUCTURE ARCHITECT AT FINTECH GLOBAL',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=88498F',
  },
  {
    id: 3,
    quote:
      "The mock interview engine didn't just ask canned LeetCode questions; it dynamically interrogated my architectural trade-offs, concurrency handling, and failover choices. It felt tougher than the actual on-site loop.",
    author: 'Emily Thompson',
    role: 'PRINCIPAL AI ENGINEER AT CLOUDSCALE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily&backgroundColor=C55A7B',
  },
  {
    id: 4,
    quote:
      "The skill gap radar accurately identified that my knowledge in Kubernetes operators and eBPF was lagging behind market demand for L6 roles. The generated roadmap closed the delta in less than 30 days.",
    author: 'David Kim',
    role: 'SR. PLATFORM LEAD AT ENTERPRISE DYNAMICS',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=4A5899',
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const current = testimonials[currentIndex];

  return (
    <section className="w-full bg-zinc-900 py-24 md:py-32 border-b border-zinc-700/30">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-16">
          <div className="flex items-center gap-3 px-4 py-2 border border-zinc-700 w-fit">
            <div className="w-2.5 h-2.5 bg-amber-500" />
            <span className="text-sm font-medium text-zinc-400 tracking-wide uppercase font-mono">
              Proven Outcomes
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-balance text-white text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight max-w-[650px]">
              {"Engineered for Engineers Who Refuse to Settle".split(" ").map((word, i) => (
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

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
                className="w-12 h-12 border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextTestimonial}
                aria-label="Next testimonial"
                className="w-12 h-12 border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="relative border border-zinc-700/40 bg-zinc-950/60 p-8 md:p-14 min-h-[280px] flex flex-col justify-between">
          <AnimatePresence exitBeforeEnter>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              <p className="text-xl md:text-2xl lg:text-3xl font-light text-zinc-200 leading-relaxed font-sans">
                &ldquo;{current.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                <img
                  src={current.avatar}
                  alt={current.author}
                  className="w-12 h-12 rounded-full border border-zinc-700"
                />
                <div>
                  <h4 className="text-base font-medium text-white">{current.author}</h4>
                  <p className="text-xs font-mono tracking-wider text-amber-500 uppercase mt-0.5">
                    {current.role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Jump to testimonial ${idx + 1}`}
                className={`h-1.5 transition-all duration-300 ${
                  currentIndex === idx ? 'w-8 bg-amber-500' : 'w-2 bg-zinc-700 hover:bg-zinc-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
