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
        <title>AI Gap Challenge Lab • SkillMirror Core</title>
        <meta name="description" content="Personalized AI practice challenges tailored to bridge your exact career skill gaps." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-07"
        section="AI PRACTICE & ASSESSMENTS"
        title="AI GAP CHALLENGE LAB"
        subtitle="On-demand scenario assessments algorithmically designed to bridge your detected skill gaps and accelerate career readiness."
        badge="PRECISION GAP ENGINE"
        badgeVariant="outline-amber"
        bulletVariant="amber"
        glowColor="amber"
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/problems">
              <button className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center gap-2">
                <i className="fa-solid fa-code text-xs text-amber-400" />
                <span>Practice Arena</span>
              </button>
            </Link>
            <Link href="/projects/status-center">
              <button className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center gap-2">
                <i className="fa-solid fa-chart-line text-xs text-emerald-400" />
                <span>Scorecards</span>
              </button>
            </Link>
          </div>
        }
      >
        {/* KPI Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <PageStatChip label="Targeted Challenges" value={stats.total} icon="fa-bullseye" color="amber" />
          <PageStatChip label="Top Alignment" value={stats.highMatch} icon="fa-star" color="zinc" />
          <PageStatChip label="Avg Readiness Lift" value="+8.5%" icon="fa-arrow-trend-up" color="emerald" />
          <PageStatChip label="AI Lab Status" value="Online" icon="fa-bolt" color="amber" suffix="⚡" />
        </div>

        {/* On-Demand Challenge Generator Box */}
        <div className="mb-8 p-6 bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-400" />
                ON-DEMAND AI SYNTHESIS
              </div>
              <h3 className="text-base font-mono font-bold text-white">
                Synthesize a Targeted Skill Gap Assessment
              </h3>
              <p className="text-xs font-sans text-zinc-400 mt-1">
                Select your target difficulty. Our AI will analyze your profile and generate an interactive real-world assessment.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>

              <button
                onClick={handleGenerateCustomGap}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
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
          <div className="p-12 text-center bg-zinc-900/80 border border-zinc-800">
            <h3 className="text-sm font-mono font-bold text-white mb-2">No Challenges Synthesized Yet</h3>
            <button
              onClick={handleGenerateCustomGap}
              className="px-4 py-2 bg-amber-400 text-black hover:bg-amber-300 font-mono font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Generate First Gap Assessment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((prob) => (
              <div
                key={prob.id}
                className="bg-zinc-900/90 border border-zinc-800 p-5 hover:border-zinc-700 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-zinc-950 border border-zinc-800 text-zinc-300">
                      [ {prob.category || 'Gap Challenge'} ]
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-emerald-400" />
                      +150 XP
                    </span>
                  </div>

                  <h3 className="text-base font-mono font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
                    {prob.title}
                  </h3>

                  <p className="text-xs font-sans text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {prob.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    Level: {prob.complexity || 'Intermediate'}
                  </span>
                  <Link href={`/problems/${prob.id}`}>
                    <button className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-300 group-hover:border-amber-400/60 group-hover:text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5">
                      <span>Launch</span>
                      <i className="fa-solid fa-arrow-right text-[10px]" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CyberPageShell>
    </Layout>
  );
};

export default AIGapChallengeLabPage;
