import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How does SkillMirror quantify technical skill gaps accurately?',
    answer:
      'Unlike generic quiz assessments, SkillMirror vectorizes your GitHub repositories, uploaded project artifacts, and target job descriptions. Our neural models analyze code complexity, design patterns, framework depths, and missing architectural competencies, producing a definitive percentage gap delta.',
  },
  {
    id: '2',
    question: 'How do the AI Mock Interviews simulate real FAANG / Tier-1 loops?',
    answer:
      'SkillMirror adapts questions dynamically based on your spoken answers, evaluating architectural trade-offs, edge-case handling, and communication clarity. It simulates both conversational technical deep-dives and live coding execution with instant scorecard analytics.',
  },
  {
    id: '3',
    question: 'What is the ATS Shield and how does it prevent automated rejections?',
    answer:
      'Enterprise Applicant Tracking Systems (Workday, Greenhouse, Lever) use semantic parsing and keyword weighting algorithms. The ATS Shield audits your resume structure against these exact parsers, highlighting missing semantic tags and rewriting bullet points to demonstrate quantifiable impact.',
  },
  {
    id: '4',
    question: 'Is my proprietary code and resume data kept confidential?',
    answer:
      'Yes. SkillMirror operates with zero-retention enterprise privacy standards. Your code, resumes, and interview audio recordings are never used to train public LLM models and remain strictly isolated to your encrypted tenant.',
  },
  {
    id: '5',
    question: 'Can I target multiple distinct roles at the same time?',
    answer:
      'Yes. You can configure multiple career vectors (e.g., Staff Backend Engineer vs. AI Systems Architect). SkillMirror will generate independent radar assessments and custom sprint roadmaps for each path simultaneously.',
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>('1');

  const toggleQuestion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="w-full bg-zinc-900 py-24 md:py-32 border-b border-zinc-700/30">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Header */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-4 py-2 border border-zinc-700 w-fit">
              <div className="w-2.5 h-2.5 bg-amber-500" />
              <span className="text-sm font-medium text-zinc-400 tracking-wide uppercase font-mono">
                FAQ
              </span>
            </div>

            <h2 className="text-balance text-4xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.1]">
              {"Frequently Asked Questions".split(" ").map((word, i) => (
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

            <p className="text-balance text-zinc-400 text-base md:text-lg leading-relaxed max-w-md">
              Everything you need to understand regarding SkillMirror&apos;s neural analysis, mock interview telemetry, and ATS optimization architecture.
            </p>
          </div>

          {/* Right Column - Accordion Items */}
          <div className="flex flex-col border-t border-zinc-800">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} className="border-b border-zinc-800">
                  <button
                    onClick={() => toggleQuestion(faq.id)}
                    className="w-full py-6 flex items-center justify-between text-left group"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={cn(
                        'text-lg md:text-xl font-normal transition-colors pr-4',
                        isOpen ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                      )}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 shrink-0 text-zinc-400 transition-transform duration-300',
                        isOpen && 'rotate-180 text-amber-500'
                      )}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-zinc-400 text-base leading-relaxed pr-6">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
