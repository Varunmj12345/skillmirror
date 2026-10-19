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
        <title>AI Assessment Scorecards & History • SkillMirror Core</title>
        <meta name="description" content="Review your AI assessment scorecards, multi-dimensional code evaluations, and verified skill achievements." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-08"
        section="AI PRACTICE & ASSESSMENTS"
        title="AI ASSESSMENT SCORECARDS & HISTORY"
        subtitle="Review your historical multi-dimensional AI evaluations, line-by-line feedback, and verified XP gains."
        badge="ASSESSMENT TELEMETRY"
        badgeVariant="outline-amber"
        bulletVariant="amber"
        glowColor="amber"
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/problems">
              <button className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm">
                <i className="fa-solid fa-code text-xs" />
                <span>Practice Arena</span>
              </button>
            </Link>
            <Link href="/problems/matches">
              <button className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center gap-2">
                <i className="fa-solid fa-bullseye text-xs text-amber-400" />
                <span>Gap Lab</span>
              </button>
            </Link>
          </div>
        }
      >
        {/* KPI Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <PageStatChip label="Total Submissions" value={stats.total} icon="fa-list-check" color="amber" />
          <PageStatChip label="Assessments Passed" value={stats.passed} icon="fa-circle-check" color="emerald" />
          <PageStatChip label="Avg AI Score" value={`${stats.avgScore}%`} icon="fa-bolt" color="zinc" />
          <PageStatChip label="XP Earned" value={`+${stats.totalXp}`} icon="fa-star" color="amber" suffix="XP" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 sm-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase transition-colors border ${
              filter === 'all'
                ? 'bg-amber-400/10 text-amber-400 border-amber-400/40'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            All Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setFilter('pass')}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase transition-colors border ${
              filter === 'pass'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            Passed ({stats.passed})
          </button>
          <button
            onClick={() => setFilter('revision')}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase transition-colors border ${
              filter === 'revision'
                ? 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
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
          <div className="p-12 text-center bg-zinc-900/80 border border-zinc-800">
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <i className="fa-solid fa-clipboard-check text-lg" />
            </div>
            <h3 className="text-sm font-mono font-bold text-white mb-1">
              No Assessment Submissions Found
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Take your first challenge in the AI Practice Arena to receive instant evaluation.
            </p>
            <Link href="/problems">
              <button className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">
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
                <div
                  key={sub.id}
                  className="p-5 sm:p-6 bg-zinc-900/90 border border-zinc-800 space-y-4 text-zinc-200 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                            isPassed
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                              : 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                          }`}
                        >
                          [ {isPassed ? 'Passed ✓' : 'Revision Suggested'} ]
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">Version {sub.version_number || 1} • {dateStr}</span>
                      </div>
                      <h3 className="text-base font-mono font-bold text-white">
                        {sub.challenge_title || 'AI Practice Challenge'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-white">
                          {sub.quality_score || 80}<span className="text-xs text-zinc-500">/100</span>
                        </div>
                        <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
                          Score Quality
                        </div>
                      </div>

                      <Link href={`/problems/${sub.project_id || 1}`}>
                        <button className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-amber-400/60 hover:text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider transition-colors">
                          Retake Assessment
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Feedback preview */}
                  {sub.comments && (
                    <div className="p-3.5 bg-zinc-950 border border-zinc-800 text-xs font-sans text-zinc-300 leading-relaxed">
                      <strong className="font-mono text-amber-400">AI Feedback: </strong>
                      {sub.comments}
                    </div>
                  )}

                  {/* Dimension breakdown if available */}
                  {sub.dimension_scores && typeof sub.dimension_scores === 'object' && Object.keys(sub.dimension_scores).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(sub.dimension_scores).map(([k, v]: any, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-zinc-950 text-[10px] font-mono text-zinc-400 border border-zinc-800"
                        >
                          {k.replace('_', ' ')}: <strong className="text-amber-400">{v}%</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CyberPageShell>
    </Layout>
  );
};

export default AIAssessmentScorecardsPage;
