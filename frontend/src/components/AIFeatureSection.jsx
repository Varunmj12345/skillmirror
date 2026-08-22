import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from './ui/card';
import { Bullet } from './ui/bullet';
import { Badge } from './ui/badge';
import { TVNoise } from './ui/tv-noise';

const aiModes = [
  {
    id: 'career',
    code: 'MODE-01',
    label: 'CAREER STRATEGIST',
    title: 'Autonomous Career Optimization',
    promptSample: 'Synthesize optimal step-by-step roadmap to transition from Mid Frontend to Staff Full-Stack AI Engineer within 9 months.',
    outputSample: '>> Analyzed 1,420 Senior L5 requirements.\n>> Identified 3 high-impact skill deltas: PyTorch Fine-Tuning, Distributed Cache Design, Vector DB Indexing.\n>> Recommended Phase 1: Deploy RAG pipeline with FastAPI & Neon Postgres.',
    bulletVariant: 'cyan',
    badge: 'STRATEGY',
    badgeVariant: 'outline-cyan',
    highlights: ['Skill Delta Prioritization', 'Target Salary Calibration', 'Milestone Verification'],
  },
  {
    id: 'interview',
    code: 'MODE-02',
    label: 'TECHNICAL PROBE ENGINE',
    title: 'Real-Time Mock Interview Simulation',
    promptSample: 'Conduct a 45-minute distributed systems technical interview for a Senior Backend role focusing on idempotency and eventual consistency.',
    outputSample: '>> Probe Q1: How do you guarantee exactly-once processing in high-throughput Kafka consumers when database transactions fail?\n>> Evaluation criteria: Idempotency keys, outbox pattern, dead-letter queues.',
    bulletVariant: 'warning',
    badge: 'INTERVIEW SIM',
    badgeVariant: 'outline-warning',
    highlights: ['Dynamic Follow-Up Probes', 'Confidence & Clarity Metric', 'STAR Format Assessment'],
  },
  {
    id: 'resume',
    code: 'MODE-03',
    label: 'ATS COMPLIANCE SCANNER',
    title: 'Deterministic Resume Parsing & Scoring',
    promptSample: 'Evaluate uploaded resume for Google Senior Software Engineer opening and output keyword density match report.',
    outputSample: '>> Overall ATS Score: 94/100 (Top 6% tier)\n>> Extracted 18 core technical entities.\n>> Missing keywords: Kubernetes Helm charts, OpenTelemetry tracing.',
    bulletVariant: 'success',
    badge: 'PARSER v3',
    badgeVariant: 'outline-success',
    highlights: ['Quantified Impact Score', 'Entity Keyword Extraction', 'Instant PDF/DOCX Export'],
  },
];

const AIFeatureSection = () => {
  const [activeId, setActiveId] = useState('career');
  const activeMode = aiModes.find((m) => m.id === activeId) || aiModes[0];

  return (
    <section className="py-24 relative bg-background border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/[0.08] bg-pop text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-4">
            <Bullet variant="warning" size="sm" />
            <span>NEURAL INTERACTION SUITE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight mb-4">
            AI COPILOT RUNTIME MODES
          </h2>
          <p className="sm-body-text max-w-2xl mx-auto text-slate-400">
            Switch reasoning context on demand. Tailored neural prompt templates optimized for software engineering and technical growth.
          </p>
        </motion.div>

        {/* Mode Selector & Terminal Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Mode Switchers (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            {aiModes.map((mode) => {
              const isActive = mode.id === activeId;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveId(mode.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                    isActive
                      ? 'bg-pop border-cyan-500/50 shadow-[0_0_20px_rgba(0,217,255,0.15)]'
                      : 'bg-card/60 border-white/[0.06] hover:border-white/[0.15] hover:bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Bullet variant={mode.bulletVariant} size="sm" />
                      <span className="text-xs font-mono font-bold text-white tracking-wide">
                        {mode.label}
                      </span>
                    </div>
                    <Badge variant={mode.badgeVariant}>{mode.code}</Badge>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 pl-4">
                    {mode.title}
                  </p>
                </button>
              );
            })}

            <div className="pt-2">
              <Link href="/dashboard">
                <button className="sm-btn-primary w-full py-4 text-xs tracking-wider">
                  <i className="fa-solid fa-bolt text-xs" />
                  <span>INITIALIZE AI RUNTIME</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Interactive Console Screen (Col 7) */}
          <div className="lg:col-span-7">
            <Card className="relative overflow-hidden group">
              <TVNoise opacity={0.04} intensity={0.16} speed={45} />
              <CardHeader
                title={`TERMINAL OUTPUT // ${activeMode.code}`}
                bulletVariant={activeMode.bulletVariant}
                addon={<Badge variant="outline-cyan">ONLINE • 24ms</Badge>}
              />
              <CardContent className="p-5 bg-card min-h-[360px] flex flex-col justify-between relative z-20">
                {/* Prompt Section */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block mb-1.5">
                      INPUT PROMPT QUERY:
                    </span>
                    <div className="p-3 rounded bg-pop/80 border border-white/[0.06] text-xs font-mono text-cyan-300">
                      &gt; {activeMode.promptSample}
                    </div>
                  </div>

                  {/* Output Simulation */}
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block mb-1.5">
                      SYNTHESIZED NEURAL TELEMETRY:
                    </span>
                    <div className="p-3.5 rounded bg-background/90 border border-white/[0.06] text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed">
                      {activeMode.outputSample}
                    </div>
                  </div>
                </div>

                {/* Capability Tags */}
                <div className="pt-4 mt-4 border-t border-white/[0.06] flex flex-wrap gap-2">
                  {activeMode.highlights.map((h) => (
                    <span
                      key={h}
                      className="px-2.5 py-1 rounded bg-pop border border-white/[0.06] text-[10px] font-mono text-slate-400"
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIFeatureSection;
