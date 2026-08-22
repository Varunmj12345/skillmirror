import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from './ui/card';
import { Bullet } from './ui/bullet';
import { Badge } from './ui/badge';

const features = [
  {
    code: 'MOD-01',
    title: 'INTELLIGENCE HUB',
    desc: 'Deep neural graph evaluation benchmarking user skills against 50,000+ real-time market roles.',
    icon: 'fa-brain',
    bulletVariant: 'cyan',
    badge: 'CORE ENGINE',
    badgeVariant: 'outline-cyan',
  },
  {
    code: 'MOD-02',
    title: 'ADAPTIVE ROADMAPS',
    desc: 'Dynamic learning curriculum synthesized by LLMs with video modules, milestones, and project goals.',
    icon: 'fa-compass',
    bulletVariant: 'default',
    badge: 'AUTONOMOUS',
    badgeVariant: 'default',
  },
  {
    code: 'MOD-03',
    title: 'ATS RESUME OPTIMIZER',
    desc: 'Automated keyword density mapping, parsing validation, and formatting calibration achieving 95%+ pass rates.',
    icon: 'fa-file-shield',
    bulletVariant: 'success',
    badge: 'ATS READY',
    badgeVariant: 'outline-success',
  },
  {
    code: 'MOD-04',
    title: 'AI MOCK INTERVIEWS',
    desc: 'Voice and text simulations with role-tailored technical probes, STAR format feedback, and confidence indexing.',
    icon: 'fa-headset',
    bulletVariant: 'warning',
    badge: 'REAL-TIME',
    badgeVariant: 'outline-warning',
  },
  {
    code: 'MOD-05',
    title: 'MARKET COMPENSATION RADAR',
    desc: 'Salary distribution curves, demand heatmaps, and regional hiring velocity across engineering stacks.',
    icon: 'fa-chart-line',
    bulletVariant: 'cyan',
    badge: 'TELEMETRY',
    badgeVariant: 'outline-cyan',
  },
  {
    code: 'MOD-06',
    title: 'SMART CAREER ALERTS',
    desc: 'Algorithmic notifications triggered when job matching score thresholds and hiring spikes intersect.',
    icon: 'fa-bell',
    bulletVariant: 'success',
    badge: 'INSTANT DISPATCH',
    badgeVariant: 'outline-success',
  },
];

const FeatureCards = () => {
  return (
    <section className="py-24 relative bg-background border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/[0.08] bg-pop text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-4">
            <Bullet variant="cyan" size="sm" />
            <span>ARCHITECTURE SPECIFICATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight mb-4">
            INTELLIGENCE MODULE MATRIX
          </h2>
          <p className="sm-body-text max-w-2xl mx-auto text-slate-400">
            A cohesive suite of autonomous machine-learning subsystems working together to calculate and accelerate your career trajectory.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Card glow className="h-full group">
                <CardHeader
                  title={f.title}
                  bulletVariant={f.bulletVariant}
                  addon={<Badge variant={f.badgeVariant}>{f.badge}</Badge>}
                />
                <CardContent className="flex flex-col justify-between h-[calc(100%-48px)] p-4">
                  <div>
                    <div className="flex items-center justify-between text-slate-500 font-mono text-[10px] mb-3">
                      <span>{f.code}</span>
                      <i className={`fa-solid ${f.icon} text-sm text-cyan-400 group-hover:scale-110 transition-transform`} />
                    </div>
                    <p className="text-xs font-mono text-slate-300 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-400 group-hover:text-cyan-300 transition-colors">
                    <span>INITIALIZE PROTOCOL</span>
                    <i className="fa-solid fa-chevron-right text-[9px] group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
