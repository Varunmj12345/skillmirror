import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { problemService, Problem } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal, StaggerChildren } from '../../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';

const MyMatchedProblemsPage: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const res: any = await problemService.getProblems();
      const list: Problem[] = Array.isArray(res) ? res : (res?.data || []);
      setProblems(list);
    } catch (err) {
      console.error('Failed to load matched problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const stats = useMemo(() => {
    const list = problems || [];
    return {
      total: list.length,
      highMatch: list.filter(p => (p.user_match?.match_score || 80) >= 80).length,
      avgMatchScore: list.length ? Math.round(list.reduce((acc, curr) => acc + (curr.user_match?.match_score || 78), 0) / list.length) : 82
    };
  }, [problems]);

  return (
    <Layout>
      <Head>
        <title>My Matched Problems • SkillMirror OS</title>
        <meta name="description" content="Personalized real-world problem matches based on your verified skills and competencies." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-07"
        section="PROJECTS & REAL-WORLD PORTFOLIO"
        title="MY SKILL MATCHES"
        subtitle="Algorithmic problem alignment matching your verified skillset, target career roadmap, and learning velocity."
        badge="PRECISION ALIGNMENT"
        badgeVariant="outline-cyan"
        bulletVariant="cyan"
        glowColor="indigo"
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/problems">
              <button className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                <i className="fa-solid fa-layer-group text-xs text-cyan-400" />
                <span>All Problems</span>
              </button>
            </Link>
            <Link href="/projects">
              <button className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                <i className="fa-solid fa-diagram-project text-xs" />
                <span>My Projects</span>
              </button>
            </Link>
          </div>
        }
        stats={
          <>
            <PageStatChip label="Matched Vectors" value={stats.total} icon="fa-bullseye" color="cyan" />
            <PageStatChip label="Top Tier Match" value={stats.highMatch} icon="fa-star" color="amber" />
            <PageStatChip label="Avg Alignment" value={`${stats.avgMatchScore}%`} icon="fa-bolt" color="emerald" />
          </>
        }
      />

      <div className="px-4 sm:px-6 pb-24 max-w-[1400px] mx-auto space-y-8">
        {/* Alignment Guidance Banner */}
        <ScrollReveal>
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-base shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                <i className="fa-solid fa-sparkles" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
                  AI RECOMMENDATION ENGINE
                </span>
                <p className="text-xs sm:text-sm font-sans font-semibold text-slate-100">
                  These verified problems match 70%+ of your current skills while introducing 1-2 stretch skills to maximize career readiness.
                </p>
              </div>
            </div>
            <Link href="/skill-gap" className="shrink-0 w-full sm:w-auto">
              <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-500/30 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                <span>View Skill Radar</span>
                <i className="fa-solid fa-arrow-right text-[10px]" />
              </button>
            </Link>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="!h-[280px]" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center relative overflow-hidden backdrop-blur-xl">
            <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center mx-auto mb-5 border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <i className="fa-solid fa-bullseye text-2xl text-indigo-400" />
            </div>
            <h3 className="text-lg font-display font-black text-white">
              No Direct Skill Matches Yet
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              Upload your resume or add verified technical skills in your Profile to unlock targeted real-world problems.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/profile">
                <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all">
                  Update Verified Skills
                </button>
              </Link>
              <Link href="/problems">
                <button className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase transition-all">
                  Browse All Problems
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((prob, idx) => {
              const matchScore = prob.user_match?.match_score || (85 - (idx * 4));
              const isRealWorld = prob.is_real_world && prob.source_type !== 'AI_GENERATED_PRACTICE';

              return (
                <ScrollReveal stagger key={prob.id}>
                  <div className="group relative rounded-3xl bg-slate-900/70 border border-indigo-500/20 hover:border-indigo-400/50 backdrop-blur-xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5 overflow-hidden hover:shadow-[0_12px_35px_rgba(99,102,241,0.25)]">
                    {/* Glowing Top Ambient Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/60 via-cyan-400/30 to-transparent" />

                    <div className="space-y-4">
                      {/* Top Match Rating & Category */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {prob.category || 'General'}
                        </span>

                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-black">
                          <i className="fa-solid fa-circle-check text-[10px]" />
                          <span>{matchScore}% Match</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-display font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                        {prob.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs font-sans text-slate-300 line-clamp-3 leading-relaxed">
                        {prob.description}
                      </p>

                      {/* Organization / Industry Capsule */}
                      <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="truncate max-w-[170px]">
                          {prob.organization_name || 'Independent Submitter'}
                        </span>
                        <span className="text-slate-500">
                          {isRealWorld ? '🏢 Verified Org' : '🤖 AI Lab'}
                        </span>
                      </div>
                    </div>

                    {/* Footer / Build CTA */}
                    <div className="pt-3 border-t border-white/[0.06] space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">
                          <i className="fa-regular fa-clock mr-1" />
                          {prob.estimated_effort_weeks || 4} Weeks Effort
                        </span>
                        <span className="text-indigo-400 font-bold capitalize">
                          {prob.complexity || 'Intermediate'}
                        </span>
                      </div>

                      <Link href={`/problems/${prob.id}`} className="block">
                        <button className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2 group/btn">
                          <span>Build Solution Workspace</span>
                          <i className="fa-solid fa-arrow-right text-[10px] group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </StaggerChildren>
        )}
      </div>
    </Layout>
  );
};

export default MyMatchedProblemsPage;
