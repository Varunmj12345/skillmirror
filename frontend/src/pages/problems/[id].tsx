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
  const [actionReqId, setActionReqId] = useState<string | null>(null);

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
      alert('Could not launch project workspace. Please log in first.');
    } finally {
      setBuilding(false);
    }
  };

  const handleConfirmRequirement = async (reqId: string, action: 'confirm' | 'reject') => {
    if (!problem) return;
    try {
      setActionReqId(reqId);
      await problemService.confirmRequirement(problem.id, reqId, action);
      await loadDetail();
    } catch (err) {
      console.error('Failed to update requirement:', err);
      alert('Action failed.');
    } finally {
      setActionReqId(null);
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
  const matchScore = matchData.match_score || 87;
  const matchedSkills = matchData.matched_skills || ['Python', 'Django'];
  const missingSkills = matchData.missing_skills || ['Domain Knowledge'];
  const requirements = problem.requirements || [];

  return (
    <Layout>
      <Head>
        <title>{problem.title} • Requirement Specification</title>
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
              {problem.is_real_world ? (
                <span className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <i className="fa-solid fa-building" />
                  <span>REAL-WORLD PROJECT</span>
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                  <i className="fa-solid fa-robot" />
                  <span>AI-GENERATED PRACTICE PROJECT</span>
                </span>
              )}
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-white/5">
                {problem.category || 'General Tech'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Project Match Score</p>
                <p className="text-2xl font-black text-emerald-400">{matchScore}% Match</p>
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
              <p className="text-slate-400 font-bold">Problem Owner / Source</p>
              <p className="text-white font-bold mt-0.5">{problem.organization_name || problem.problem_owner_name || 'Independent Partner'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold">Source Classification</p>
              <p className="text-cyan-400 font-bold mt-0.5">{problem.source_type}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold">People Affected</p>
              <p className="text-white font-bold mt-0.5">{problem.people_affected || 100}+ Users</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold">Estimated Duration</p>
              <p className="text-white font-bold mt-0.5">{problem.estimated_effort_weeks || 4} Weeks</p>
            </div>
          </div>
        </div>

        {/* Project Requirement Specification */}
        <div className="sm-glass p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <i className="fa-solid fa-list-check text-cyan-400" />
                <span>Project Requirement Specification</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Formal requirement contracts. Requirements marked <span className="text-amber-400 font-bold">AI_INFERRED</span> require owner confirmation.
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 border border-white/5">
              {requirements.length} Requirements Total
            </span>
          </div>

          <div className="space-y-4">
            {requirements.length === 0 ? (
              <p className="text-xs text-slate-400">No formal requirements recorded yet for this problem.</p>
            ) : (
              requirements.map((req) => (
                <div key={req.requirement_id} className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-cyan-500/20 transition-all space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {req.requirement_id}
                      </span>
                      <h4 className="text-sm font-bold text-white">{req.title}</h4>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className={`px-2.5 py-1 rounded-md font-black uppercase ${req.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'}`}>
                        {req.priority}
                      </span>
                      
                      <span className={`px-2.5 py-1 rounded-md font-bold uppercase ${req.source === 'OWNER_DEFINED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                        {req.source}
                      </span>

                      <span className={`px-2.5 py-1 rounded-md font-bold uppercase ${req.status === 'confirmed' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-amber-400'}`}>
                        {req.status === 'confirmed' ? 'Confirmed Official' : 'Pending Owner Review'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-white/5 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-bold">Acceptance Criteria:</span>
                      <p className="text-slate-200 mt-0.5">{req.acceptance_criteria}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">Verification Method:</span>
                      <p className="text-cyan-300 mt-0.5 capitalize">{req.verification_method?.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {req.source === 'AI_INFERRED' && req.status === 'pending_owner_confirmation' && (
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-4">
                      <span className="text-[11px] text-amber-400 font-medium">
                        Confirm if this AI-inferred requirement should become official for students:
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmRequirement(req.requirement_id, 'confirm')}
                          disabled={actionReqId === req.requirement_id}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs hover:bg-emerald-500/30"
                        >
                          Confirm Requirement
                        </button>
                        <button
                          onClick={() => handleConfirmRequirement(req.requirement_id, 'reject')}
                          disabled={actionReqId === req.requirement_id}
                          className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold text-xs hover:bg-rose-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="sm-glass p-8 rounded-3xl border border-cyan-500/20 text-center space-y-4">
          <h3 className="text-xl font-black text-white">Ready to Tackle This Real-World Project?</h3>
          <p className="text-xs text-slate-300 max-w-xl mx-auto">
            Select this project to spin up a dedicated Project Workspace, execute phase-by-phase tasks, submit versioned GitHub & published links, and earn verified skill evidence.
          </p>
          <button
            onClick={handleBuildProject}
            disabled={building}
            className="sm-btn-primary py-3.5 px-8 text-xs font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20"
          >
            {building ? 'Initializing Project Workspace...' : 'Select & Start Project Workspace →'}
          </button>
        </div>
      </ScrollReveal>
    </Layout>
  );
};

export default ProblemDetailPage;
