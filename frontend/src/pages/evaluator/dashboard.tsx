import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { projectService, Project, ProjectSubmissionVersion } from '../../services/projectService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal } from '../../components/motion/ScrollReveal';

const EvaluatorDashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [decision, setDecision] = useState<'ACCEPT' | 'REVISION_REQUIRED' | 'REJECT' | 'REQUEST_MORE_INFO'>('ACCEPT');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadEvaluatorQueue = async () => {
    try {
      setLoading(true);
      const res: any = await projectService.getEvaluatorDashboard();
      const projList = res?.data?.projects || res?.projects || [];
      setProjects(projList);
      if (projList.length > 0 && !selectedProject) {
        setSelectedProject(projList[0]);
      }
    } catch (err) {
      console.error('Failed to load evaluator queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluatorQueue();
  }, []);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    if (['REVISION_REQUIRED', 'REJECT', 'REQUEST_MORE_INFO'].includes(decision) && !comments.trim()) {
      alert('Evaluator comments are mandatory when requesting revision, rejecting, or requesting more information.');
      return;
    }

    try {
      setSubmitting(true);
      await projectService.takeEvaluatorAction({
        project_id: selectedProject.id,
        decision,
        comments: comments.trim()
      });
      alert(`Decision '${decision}' successfully applied.`);
      setComments('');
      await loadEvaluatorQueue();
    } catch (err: any) {
      console.error('Action failed:', err);
      alert(err?.response?.data?.error || 'Failed to record evaluator decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const latestSub: ProjectSubmissionVersion | undefined = selectedProject?.submissions?.[0];
  const evalData = latestSub?.evaluation;
  const reqEvals = evalData?.requirement_evaluations || [];
  const autoChecks = evalData?.automated_checks || {};

  return (
    <Layout>
      <Head>
        <title>Project Evaluator Dashboard • SkillMirror</title>
      </Head>

      <ScrollReveal className="space-y-8">
        {/* Header Terminal */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-400">Technical Evaluation Portal</span>
            </div>
            <h1 className="sm-h1 !text-4xl lg:!text-5xl">Project Evaluation Dashboard</h1>
            <p className="sm-body-text mt-2 max-w-2xl">
              Objective technical evaluation engine inspecting student deliverables against original requirements, GitHub code, and live published URLs.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
            Queue: {projects.length} Pending Submissions
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            <SkeletonCard className="!h-[400px]" />
            <SkeletonCard className="!h-[400px] md:col-span-2" />
          </div>
        ) : projects.length === 0 ? (
          <div className="sm-glass p-12 rounded-3xl text-center space-y-4 border border-white/5">
            <i className="fa-solid fa-clipboard-check text-4xl text-slate-600" />
            <h3 className="text-lg font-bold text-white">No Pending Submissions</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All submitted student projects have been evaluated. New submissions will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Queue List (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-2">Submissions Queue</h3>
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedProject?.id === p.id ? 'bg-indigo-500/10 border-indigo-500/40 text-white' : 'bg-slate-950/60 border-white/5 hover:border-indigo-500/20 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-900 text-cyan-300 border border-white/5">
                      {p.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold truncate">{p.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">Student: {p.student_email || 'Student'}</p>
                </div>
              ))}
            </div>

            {/* Right Inspection & Decision Workspace (8 cols) */}
            {selectedProject && (
              <div className="lg:col-span-8 space-y-6">
                <div className="sm-glass p-8 rounded-3xl border border-white/10 space-y-6">
                  {/* Header info */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h2 className="text-2xl font-black text-white">{selectedProject.title}</h2>
                      <p className="text-xs text-slate-400 mt-1">Student Developer: <span className="text-cyan-300 font-bold">{selectedProject.student_email}</span></p>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedProject.is_real_world ? 'REAL-WORLD PROJECT' : 'PRACTICE PROJECT'}
                    </span>
                  </div>

                  {/* Submission Deliverables */}
                  {latestSub ? (
                    <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/5 space-y-4 text-xs">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h4 className="font-bold text-cyan-400 text-sm flex items-center gap-2">
                          <i className="fa-solid fa-link" />
                          <span>Student Deliverables (Submission Version #{latestSub.version_number})</span>
                        </h4>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${latestSub.deployment_status === 'reachable' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          Live URL Check: {latestSub.deployment_status}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400 font-bold">GitHub Code Repository:</span>
                          <a href={latestSub.github_url} target="_blank" rel="noreferrer" className="block text-cyan-300 font-bold truncate hover:underline">
                            {latestSub.github_url}
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold">Live Published Application Link:</span>
                          <a href={latestSub.published_url} target="_blank" rel="noreferrer" className="block text-emerald-400 font-bold truncate hover:underline">
                            {latestSub.published_url}
                          </a>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold">Documentation & Setup Instructions:</span>
                        <p className="text-slate-200 mt-1 leading-relaxed bg-slate-900 p-3 rounded-xl border border-white/5">
                          {latestSub.documentation}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                      Student has not submitted deliverables yet.
                    </div>
                  )}

                  {/* Automated Technical Checks & Metrics */}
                  {evalData && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-white text-sm">Automated Technical Checks & Coverage Metrics</h4>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                          <span className="text-slate-400 font-bold text-[10px]">Overall Coverage</span>
                          <p className="text-xl font-black text-cyan-300 mt-1">{evalData.requirement_coverage_pct}%</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                          <span className="text-slate-400 font-bold text-[10px]">Critical Requirements</span>
                          <p className={`text-xl font-black mt-1 ${evalData.critical_requirement_coverage_pct >= 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {evalData.critical_requirement_coverage_pct}%
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                          <span className="text-slate-400 font-bold text-[10px]">Quality Score</span>
                          <p className="text-xl font-black text-emerald-400 mt-1">{evalData.quality_score}/100</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                          <span className="text-slate-400 font-bold text-[10px]">Owner Readiness</span>
                          <p className={`text-xs font-black mt-2 uppercase ${evalData.is_ready_for_owner_review ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {evalData.is_ready_for_owner_review ? 'Ready' : 'Not Ready'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <span className={`px-3 py-1 rounded-lg font-bold border ${autoChecks.github_reachable ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'}`}>
                          GitHub: {autoChecks.github_reachable ? 'Valid' : 'Failed'}
                        </span>
                        <span className={`px-3 py-1 rounded-lg font-bold border ${autoChecks.published_url_reachable ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'}`}>
                          Live URL: {autoChecks.published_url_reachable ? 'Reachable' : 'Deployment Issue'}
                        </span>
                        <span className={`px-3 py-1 rounded-lg font-bold border ${autoChecks.file_completeness ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'}`}>
                          Docs: {autoChecks.file_completeness ? 'Complete' : 'Incomplete'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Requirement-by-Requirement Breakdown */}
                  {reqEvals.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <h4 className="font-bold text-white text-sm">Per-Requirement Technical Breakdown</h4>

                      <div className="space-y-3 text-xs">
                        {reqEvals.map((item: any) => (
                          <div key={item.requirement_id} className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">{item.requirement_id}</span>
                                <span className="font-bold text-white text-xs">{item.title}</span>
                              </div>

                              <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                                item.status === 'SATISFIED' ? 'bg-emerald-500/20 text-emerald-300' : (item.status === 'PARTIALLY_SATISFIED' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300')
                              }`}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </div>

                            <p className="text-slate-300 text-[11px] leading-relaxed">{item.reason}</p>
                            
                            {item.status !== 'SATISFIED' && (
                              <div className="p-2.5 rounded-xl bg-slate-900 text-rose-300 text-[11px] font-semibold border border-rose-500/20">
                                Action required: {item.suggested_action}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evaluator Decision Form */}
                  <form onSubmit={handleDecisionSubmit} className="space-y-4 pt-4 border-t border-white/10 text-xs">
                    <h4 className="font-bold text-white text-sm">Evaluator Action & Feedback</h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['ACCEPT', 'REVISION_REQUIRED', 'REJECT', 'REQUEST_MORE_INFO'] as const).map((dec) => (
                        <button
                          key={dec}
                          type="button"
                          onClick={() => setDecision(dec)}
                          className={`p-3 rounded-xl border text-[11px] font-black uppercase transition-all ${
                            decision === dec ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-900 text-slate-400 border-white/5'
                          }`}
                        >
                          {dec.replace('_', ' ')}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="sm-label">Evaluator Comments & Feedback (Mandatory for Revision/Reject)</label>
                      <textarea
                        rows={4}
                        placeholder="Provide clear rationale, failed requirements, and specific corrections..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="sm-input px-4 py-3"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm-btn-primary py-3.5 rounded-xl text-xs font-black uppercase tracking-widest"
                    >
                      {submitting ? 'Recording Evaluator Action...' : 'Record Technical Action →'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollReveal>
    </Layout>
  );
};

export default EvaluatorDashboardPage;
