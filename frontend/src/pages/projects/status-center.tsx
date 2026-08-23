import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { problemService } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal, StaggerChildren } from '../../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';
import { motion } from 'framer-motion';

const AIAssessmentScorecardsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pass' | 'revision'>('all');

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const res: any = await problemService.getAIPracticeSubmissions();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSubmissions(list);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const stats = useMemo(() => {
    const list = submissions || [];
    const passed = list.filter(s => s.decision === 'ACCEPT' || s.quality_score >= 75).length;
    const avgScore = list.length
      ? Math.round(list.reduce((acc, curr) => acc + (curr.quality_score || 0), 0) / list.length)
      : 0;

    return {
      total: list.length,
      passed,
      avgScore,
      totalXp: list.length * 150
    };
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    if (filter === 'pass') {
      return submissions.filter(s => s.decision === 'ACCEPT' || s.quality_score >= 75);
    }
    if (filter === 'revision') {
      return submissions.filter(s => s.decision !== 'ACCEPT' && s.quality_score < 75);
    }
    return submissions;
  }, [submissions, filter]);

  return (
    <Layout>
      <Head>
        <title>AI Assessment Scorecards & History • SkillMirror</title>
        <meta name="description" content="Review your AI assessment scorecards, multi-dimensional code evaluations, and verified skill achievements." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-08"
        section="AI PRACTICE & ASSESSMENTS"
        title="AI ASSESSMENT SCORECARDS & HISTORY"
        subtitle="Review your historical multi-dimensional AI evaluations, line-by-line feedback, and verified XP gains."
        badge="ASSESSMENT TELEMETRY"
        badgeVariant="outline-cyan"
        bulletVariant="cyan"
        glowColor="cyan"
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/problems">
              <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2">
                <i className="fa-solid fa-code text-xs" />
                <span>Practice Arena</span>
              </button>
            </Link>
            <Link href="/problems/matches">
              <button className="px-3.5 py-2 rounded-xl bg-card border border-border text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-light-sm dark:shadow-none">
                <i className="fa-solid fa-bullseye text-xs text-blue-600 dark:text-cyan-400" />
                <span>Gap Lab</span>
              </button>
            </Link>
          </div>
        }
      >
        {/* KPI Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <PageStatChip label="Total Submissions" value={stats.total} icon="fa-list-check" color="cyan" />
          <PageStatChip label="Assessments Passed" value={stats.passed} icon="fa-circle-check" color="emerald" />
          <PageStatChip label="Avg AI Score" value={`${stats.avgScore}%`} icon="fa-bolt" color="amber" />
          <PageStatChip label="XP Earned" value={`+${stats.totalXp}`} icon="fa-star" color="cyan" suffix="XP" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
              filter === 'all'
                ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-900 border border-transparent'
            }`}
          >
            All Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setFilter('pass')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
              filter === 'pass'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-900 border border-transparent'
            }`}
          >
            Passed ({stats.passed})
          </button>
          <button
            onClick={() => setFilter('revision')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
              filter === 'revision'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                : 'text-slate-500 hover:text-slate-900 border border-transparent'
            }`}
          >
            Revision Suggested ({submissions.length - stats.passed})
          </button>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} className="!h-[180px]" />
            ))}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-cyan-400">
              <i className="fa-solid fa-clipboard-check text-lg" />
            </div>
            <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white mb-1">
              No Assessment Submissions Found
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Take your first challenge in the AI Practice Arena to receive instant evaluation.
            </p>
            <Link href="/problems">
              <button className="px-4 py-2 rounded-xl bg-blue-600 text-white font-mono font-bold text-xs uppercase">
                Explore Practice Arena
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((sub) => {
              const isPassed = sub.decision === 'ACCEPT' || sub.quality_score >= 75;
              const dateStr = sub.submitted_at
                ? new Date(sub.submitted_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              return (
                <motion.div
                  key={sub.id}
                  whileHover={{ y: -2 }}
                  className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-light-card dark:shadow-none space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                            isPassed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                          }`}
                        >
                          {isPassed ? 'Passed ✓' : 'Revision Suggested'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Version {sub.version_number || 1} • {dateStr}</span>
                      </div>
                      <h3 className="text-base font-display font-black text-slate-900 dark:text-white">
                        {sub.challenge_title || 'AI Practice Challenge'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-display font-black text-slate-900 dark:text-white">
                          {sub.quality_score || 80}<span className="text-xs text-slate-400">/100</span>
                        </div>
                        <div className="text-[9px] font-mono text-emerald-600 font-bold uppercase">
                          Score Quality
                        </div>
                      </div>

                      <Link href={`/problems/${sub.project_id || 1}`}>
                        <button className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          Retake Assessment
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Feedback preview */}
                  {sub.comments && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-xs font-sans text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong className="font-mono text-slate-800 dark:text-slate-200">AI Feedback: </strong>
                      {sub.comments}
                    </div>
                  )}

                  {/* Dimension breakdown if available */}
                  {sub.dimension_scores && typeof sub.dimension_scores === 'object' && Object.keys(sub.dimension_scores).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(sub.dimension_scores).map(([k, v]: any, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/5"
                        >
                          {k.replace('_', ' ')}: <strong className="text-slate-900 dark:text-white">{v}%</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CyberPageShell>
    </Layout>
  );
};

export default AIAssessmentScorecardsPage;
