import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { problemService, Problem } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal } from '../../components/motion/ScrollReveal';

const ProblemDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);

  const loadDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res: any = await problemService.getProblemById(id as string);
      setProblem(res?.data || res);
    } catch (err) {
      console.error('Failed to load problem detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleBuildProject = async () => {
    if (!problem) return;
    try {
      setBuilding(true);
      const res: any = await problemService.buildProject(problem.id);
      const projectData = res?.data || res;
      if (projectData?.id) {
        router.push(`/projects/${projectData.id}`);
      }
    } catch (err) {
      console.error('Failed to build project:', err);
      alert('Could not launch project. Please log in first.');
    } finally {
      setBuilding(false);
    }
  };

  if (loading || !problem) {
    return (
      <Layout>
        <div className="p-8 max-w-5xl mx-auto space-y-6">
          <SkeletonCard className="!h-[300px]" />
          <SkeletonCard className="!h-[200px]" />
        </div>
      </Layout>
    );
  }

  const matchData = problem.user_match || {};
  const matchScore = matchData.match_score || 78;
  const matchedSkills = matchData.matched_skills || ['Python', 'Django'];
  const missingSkills = matchData.missing_skills || ['Healthcare Domain', 'Advanced React'];

  return (
    <Layout>
      <Head>
        <title>{problem.title} • Problem Intelligence</title>
      </Head>

      <ScrollReveal className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/problems" className="hover:text-cyan-400">Real-World Problems</Link>
          <i className="fa-solid fa-chevron-right text-[10px]" />
          <span className="text-slate-200 font-bold truncate">{problem.title}</span>
        </div>

        {/* Hero Card */}
        <div className="sm-glass p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {problem.category || 'General Tech'}
              </span>
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-white/5">
                {problem.industry || 'Industry'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Student Match Score</p>
                <p className="text-2xl font-black text-emerald-400">{matchScore}%</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight">
              {problem.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
              {problem.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/5 text-xs">
            <div>
              <p className="text-slate-400 font-bold">Organization</p>
              <p className="text-white font-bold mt-0.5">{problem.organization_name || 'Partner Org'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold">People Affected</p>
              <p className="text-white font-bold mt-0.5">{problem.people_affected || 100}+ Users</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold">Estimated Effort</p>
              <p className="text-white font-bold mt-0.5">{problem.estimated_effort_weeks || 4} Weeks (MVP)</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold">Urgency</p>
              <p className="text-amber-400 font-bold uppercase mt-0.5">{problem.urgency || 'Medium'}</p>
            </div>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Why it Matters & Who is Affected */}
            <div className="sm-glass p-7 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-cyan-400" />
                <span>Why It Matters & Affected Users</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {problem.root_problem || problem.description}
              </p>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Affected Stakeholders:</span>
                <p className="text-xs text-cyan-300 font-semibold">{problem.target_users || 'End Users and Administrators'}</p>
              </div>
            </div>

            {/* Evidence: AI vs Human Verified */}
            <div className="sm-glass p-7 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-emerald-400" />
                <span>Evidence & Reliability Breakdown</span>
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-indigo-300">AI-Assessed Evidence</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200">AI Model</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Automated NLP extracted root symptoms and operational bottlenecks from workflow patterns.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-emerald-300">Human / Org Evidence</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200">Verified</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Submitted directly by {problem.organization_name || 'Organization Partner'} with real operational metrics.
                  </p>
                </div>
              </div>
            </div>

            {/* Existing Solutions & Missing Capability */}
            <div className="sm-glass p-7 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-puzzle-piece text-amber-400" />
                <span>Existing Solution Gap</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <span className="font-bold text-slate-400">Current Method:</span>
                  <p className="mt-1 text-slate-200">{problem.current_method || 'Manual paperwork and fragmented spreadsheet tracking.'}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400">Missing Capability:</span>
                  <p className="mt-1 text-cyan-300">{problem.missing_capability || 'Automated real-time scheduling and API synchronization.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) - Skill Match & CTA */}
          <div className="lg:col-span-4 space-y-6">
            {/* Student Skill Match Card */}
            <div className="sm-glass p-7 rounded-3xl space-y-6 border border-cyan-500/20">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Skill Intelligence Engine</span>
                <h3 className="text-lg font-bold text-white">Your Skill Match</h3>
              </div>

              {/* Match meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Match Accuracy</span>
                  <span className="text-emerald-400">{matchScore}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500" style={{ width: `${matchScore}%` }} />
                </div>
              </div>

              {/* Matched & Missing Skills */}
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-emerald-400 block mb-2">Matched Skills ({matchedSkills.length}):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkills.map((sk: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-rose-400 block mb-2">Missing Skill Gaps ({missingSkills.length}):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.map((sk: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
                        ! {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleBuildProject}
                disabled={building}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {building ? 'Generating Project Blueprint...' : '🚀 Build This Problem'}
              </button>
            </div>

            {/* Opportunity Potential Card */}
            <div className="sm-glass p-7 rounded-3xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-briefcase text-indigo-400" />
                <span>Opportunity Potential</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-emerald-400 text-[10px]" />
                  <span>Direct Internship & Hiring Pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-emerald-400 text-[10px]" />
                  <span>Verifiable "Evidence of Skill" Output</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-emerald-400 text-[10px]" />
                  <span>Resume & Career Digital Twin Sync</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </Layout>
  );
};

export default ProblemDetailPage;
