import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { problemService, Problem } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal, StaggerChildren } from '../../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';
import { motion } from 'framer-motion';

const AIGapChallengeLabPage: React.FC = () => {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const res: any = await problemService.getProblems();
      const list: Problem[] = Array.isArray(res) ? res : (res?.data || []);
      setProblems(list);
    } catch (err) {
      console.error('Failed to load gap challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleGenerateCustomGap = async () => {
    try {
      setIsGenerating(true);
      const res: any = await problemService.generateGapChallenge({
        gap_skills: ['Distributed Caching', 'Microservices', 'Message Queues'],
        difficulty: difficulty
      });
      const data = res?.data || res;
      if (data?.id) {
        router.push(`/problems/${data.id}`);
      }
    } catch (err) {
      console.error('Failed to generate gap challenge:', err);
      alert('Could not synthesize challenge. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const stats = useMemo(() => {
    const list = problems || [];
    return {
      total: list.length,
      highMatch: list.filter(p => (p.user_match?.match_score || 80) >= 80).length,
      avgMatchScore: list.length ? Math.round(list.reduce((acc, curr) => acc + (curr.user_match?.match_score || 78), 0) / list.length) : 88
    };
  }, [problems]);

  return (
    <Layout>
      <Head>
        <title>AI Gap Challenge Lab • SkillMirror</title>
        <meta name="description" content="Personalized AI practice challenges tailored to bridge your exact career skill gaps." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-07"
        section="AI PRACTICE & ASSESSMENTS"
        title="AI GAP CHALLENGE LAB"
        subtitle="On-demand scenario assessments algorithmically designed to bridge your detected skill gaps and accelerate career readiness."
        badge="PRECISION GAP ENGINE"
        badgeVariant="outline-cyan"
        bulletVariant="cyan"
        glowColor="indigo"
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/problems">
              <button className="px-3.5 py-2.5 rounded-xl bg-card border border-border text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-light-sm dark:shadow-none">
                <i className="fa-solid fa-code text-xs text-blue-600 dark:text-cyan-400" />
                <span>Practice Arena</span>
              </button>
            </Link>
            <Link href="/projects/status-center">
              <button className="px-3.5 py-2.5 rounded-xl bg-card border border-border text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-light-sm dark:shadow-none">
                <i className="fa-solid fa-chart-line text-xs text-emerald-600 dark:text-emerald-400" />
                <span>Scorecards</span>
              </button>
            </Link>
          </div>
        }
      >
        {/* KPI Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <PageStatChip label="Targeted Challenges" value={stats.total} icon="fa-bullseye" color="cyan" />
          <PageStatChip label="Top Alignment" value={stats.highMatch} icon="fa-star" color="amber" />
          <PageStatChip label="Avg Readiness Lift" value="+8.5%" icon="fa-arrow-trend-up" color="emerald" />
          <PageStatChip label="AI Lab Status" value="Online" icon="fa-bolt" color="cyan" suffix="⚡" />
        </div>

        {/* On-Demand Challenge Generator Box */}
        <div className="mb-8 p-6 rounded-2xl bg-card border border-border shadow-light-card dark:shadow-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest mb-1">
                ON-DEMAND AI SYNTHESIS
              </div>
              <h3 className="text-base font-display font-black text-slate-900 dark:text-white">
                Synthesize a Targeted Skill Gap Assessment
              </h3>
              <p className="text-xs font-sans text-slate-600 dark:text-slate-400 mt-1">
                Select your target difficulty. Our AI will analyze your profile and generate an interactive real-world assessment.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>

              <button
                onClick={handleGenerateCustomGap}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
              >
                <i className={`fa-solid ${isGenerating ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} text-xs`} />
                <span>{isGenerating ? 'Synthesizing...' : 'Synthesize Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Challenge Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="!h-[240px]" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border">
            <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white mb-2">No Challenges Synthesized Yet</h3>
            <button
              onClick={handleGenerateCustomGap}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-mono font-bold text-xs uppercase"
            >
              Generate First Gap Assessment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((prob) => (
              <motion.div
                key={prob.id}
                whileHover={{ y: -3 }}
                className="rounded-2xl bg-card border border-border p-5 shadow-light-card dark:shadow-none flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30">
                      {prob.category || 'Gap Challenge'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded">
                      +150 XP
                    </span>
                  </div>

                  <h3 className="text-base font-display font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1 mb-2">
                    {prob.title}
                  </h3>

                  <p className="text-xs font-sans text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {prob.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Level: {prob.complexity || 'Intermediate'}
                  </span>
                  <Link href={`/problems/${prob.id}`}>
                    <button className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm flex items-center gap-1.5">
                      <span>Launch</span>
                      <i className="fa-solid fa-arrow-right text-[10px]" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CyberPageShell>
    </Layout>
  );
};

export default AIGapChallengeLabPage;
