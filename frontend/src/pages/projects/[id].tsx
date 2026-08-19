import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { projectService, Project, ProjectTask, ProjectSubmissionVersion } from '../../services/projectService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal } from '../../components/motion/ScrollReveal';

const ProjectDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<'mvp' | 'v2' | 'future'>('mvp');
  
  // Submission Form State
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');
  const [checkingUrl, setCheckingUrl] = useState(false);
  const [liveCheckResult, setLiveCheckResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Requirement Mapping State
  const [reqMappings, setReqMappings] = useState<any[]>([]);

  const loadProject = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res: any = await projectService.getProjectById(id as string);
      const projData: Project = res?.data || res;
      setProject(projData);

      // Pre-fill requirement mapping draft
      if (projData.requirements && projData.requirements.length > 0) {
        setReqMappings(projData.requirements.map((r: any) => ({
          requirement_id: r.requirement_id,
          title: r.title,
          implemented_feature: '',
          evidence: ''
        })));
      }
    } catch (err) {
      console.error('Failed to load project detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const toggleTask = async (taskId: number, currentCompleted: boolean) => {
    if (!project) return;
    try {
      await projectService.updateTaskStatus(project.id, taskId, !currentCompleted);
      loadProject();
    } catch (err) {
      console.error('Task update failed:', err);
    }
  };

  const handleCheckLiveUrl = async () => {
    if (!publishedUrl.trim()) return;
    try {
      setCheckingUrl(true);
      const res: any = await projectService.checkLiveUrl(publishedUrl.trim());
      setLiveCheckResult(res?.data || res);
    } catch (err) {
      console.error('Check failed:', err);
      setLiveCheckResult({ status: 'deployment_issue', is_valid: false, notes: 'Error connecting to check service.' });
    } finally {
      setCheckingUrl(false);
    }
  };

  const handleSubmitVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    if (!githubUrl.trim() || !publishedUrl.trim() || !documentation.trim()) {
      alert('GitHub Repository URL, Live Published Project URL, and Documentation are required.');
      return;
    }

    try {
      setSubmitting(true);
      await projectService.submitProjectVersion(project.id, {
        github_url: githubUrl.trim(),
        published_url: publishedUrl.trim(),
        documentation: documentation.trim(),
        requirement_mapping: reqMappings,
        demo_video_url: demoVideoUrl.trim()
      });

      setShowSubmissionModal(false);
      await loadProject();
      alert('Project Version submitted for automated technical & evaluator review!');
    } catch (err: any) {
      console.error('Submission failed:', err);
      alert(err?.response?.data?.error || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return <span className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Accepted / Completed</span>;
      case 'owner_review':
        return <span className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">Pending Owner Review</span>;
      case 'under_evaluation':
        return <span className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">Under Technical Evaluation</span>;
      case 'revision_required':
        return <span className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">Revision Required</span>;
      default:
        return <span className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-white/5">{status.replace('_', ' ')}</span>;
    }
  };

  if (loading || !project) {
    return (
      <Layout>
        <div className="p-8 max-w-5xl mx-auto space-y-6">
          <SkeletonCard className="!h-[250px]" />
          <SkeletonCard className="!h-[300px]" />
        </div>
      </Layout>
    );
  }

  const submissions = project.submissions || [];
  const latestSub = submissions[0];
  const phaseTasks = (project.tasks || []).filter(t => t.scope_phase === activePhase);

  return (
    <Layout>
      <Head>
        <title>{project.title} • Project Workspace</title>
      </Head>

      <ScrollReveal className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/projects/status-center" className="hover:text-cyan-400">Status Center</Link>
          <i className="fa-solid fa-chevron-right text-[10px]" />
          <span className="text-slate-200 font-bold truncate">{project.title}</span>
        </div>

        {/* Header Terminal */}
        <div className="sm-glass p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {renderStatusBadge(project.status)}
              <span className="text-xs text-slate-400 font-bold">Progress: {project.progress_percentage}%</span>
            </div>

            <button
              onClick={() => setShowSubmissionModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all"
            >
              <i className="fa-solid fa-paper-plane mr-2" />
              <span>Submit Project Version ({submissions.length + 1})</span>
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">{project.title}</h1>
            <p className="text-sm text-slate-300">{project.problem_statement}</p>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500" style={{ width: `${project.progress_percentage}%` }} />
          </div>
        </div>

        {/* Revision Required Alert */}
        {project.status === 'revision_required' && latestSub && (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <i className="fa-solid fa-triangle-exclamation text-base" />
              <span>Revision Required for Submission Version #{latestSub.version_number}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {latestSub.evaluation?.evaluator_comments || 'Certain critical requirements or live deployment checks failed. Inspect requirement breakdown below, fix issues, and submit a new version.'}
            </p>
          </div>
        )}

        {/* Phased Scope & Task Checklist */}
        <div className="sm-glass p-8 rounded-3xl space-y-6 border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-list-check text-cyan-400" />
              <span>Project Execution Roadmap & Tasks</span>
            </h3>
            <div className="flex gap-2">
              {(['mvp', 'v2', 'future'] as const).map(phase => (
                <button
                  key={phase}
                  onClick={() => setActivePhase(phase)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    activePhase === phase ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {phase.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {phaseTasks.map(t => (
              <div
                key={t.id}
                onClick={() => toggleTask(t.id, t.is_completed)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  t.is_completed ? 'bg-slate-950/40 border-emerald-500/20 text-slate-400' : 'bg-slate-950/80 border-white/5 hover:border-cyan-500/30 text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs transition-all ${t.is_completed ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-slate-700'}`}>
                    {t.is_completed && <i className="fa-solid fa-check" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${t.is_completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>{t.title}</h4>
                    <p className="text-[10px] text-slate-400">Skill: {t.mapped_skill_name || 'Development'}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-cyan-400">
                  {t.is_completed ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submission Version History */}
        {submissions.length > 0 && (
          <div className="sm-glass p-8 rounded-3xl space-y-6 border border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-history text-cyan-400" />
              <span>Submission Version History ({submissions.length})</span>
            </h3>

            <div className="space-y-4">
              {submissions.map((sub: ProjectSubmissionVersion) => (
                <div key={sub.id} className="p-5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Version #{sub.version_number}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(sub.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${sub.deployment_status === 'reachable' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        Live Check: {sub.deployment_status}
                      </span>
                      {sub.evaluation && (
                        <span className="text-xs font-black text-cyan-300">
                          Coverage: {sub.evaluation.requirement_coverage_pct}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold">GitHub Repository:</span>
                      <a href={sub.github_url} target="_blank" rel="noreferrer" className="block text-cyan-400 font-bold truncate hover:underline">
                        {sub.github_url}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">Live Published URL:</span>
                      <a href={sub.published_url} target="_blank" rel="noreferrer" className="block text-emerald-400 font-bold truncate hover:underline">
                        {sub.published_url}
                      </a>
                    </div>
                  </div>

                  {sub.evaluation && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-slate-300">Evaluator Decision: <span className="text-cyan-300">{sub.evaluation.evaluator_decision}</span></span>
                        <span className="text-slate-300">Quality Score: <span className="text-emerald-400">{sub.evaluation.quality_score}/100</span></span>
                      </div>
                      <p className="text-slate-400 italic text-[11px]">"{sub.evaluation.evaluator_comments}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Modal Drawer */}
        {showSubmissionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="sm-glass p-8 rounded-3xl max-w-3xl w-full border border-white/10 space-y-6 my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <i className="fa-solid fa-paper-plane text-cyan-400" />
                  <span>Submit Project Deliverables (Version #{submissions.length + 1})</span>
                </h3>
                <button onClick={() => setShowSubmissionModal(false)} className="text-slate-400 hover:text-white">
                  <i className="fa-solid fa-xmark text-lg" />
                </button>
              </div>

              <form onSubmit={handleSubmitVersion} className="space-y-6 text-xs">
                <div className="space-y-2">
                  <label className="sm-label">GitHub Repository URL (Required)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/project-repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    required
                    className="sm-input px-4 py-3"
                  />
                </div>

                <div className="space-y-2">
                  <label className="sm-label flex justify-between">
                    <span>Live / Published Project URL (Required)</span>
                    {liveCheckResult && (
                      <span className={`font-bold ${liveCheckResult.is_valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {liveCheckResult.notes}
                      </span>
                    )}
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      placeholder="https://my-app.vercel.app or https://api.render.com"
                      value={publishedUrl}
                      onChange={(e) => setPublishedUrl(e.target.value)}
                      required
                      className="sm-input px-4 py-3 flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleCheckLiveUrl}
                      disabled={checkingUrl}
                      className="px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold hover:bg-cyan-500/30"
                    >
                      {checkingUrl ? 'Checking...' : 'Check Link'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="sm-label">Project Documentation & Architecture Overview (Required)</label>
                  <textarea
                    rows={4}
                    placeholder="Describe backend architecture, API endpoints, database setup, and installation steps..."
                    value={documentation}
                    onChange={(e) => setDocumentation(e.target.value)}
                    required
                    className="sm-input px-4 py-3"
                  />
                </div>

                {/* Requirement Mapping Matrix */}
                {reqMappings.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <label className="sm-label font-bold text-cyan-400">Requirement Mapping Matrix</label>
                    <p className="text-[11px] text-slate-400">Map each official requirement to your implemented feature and evidence link/test:</p>
                    
                    <div className="space-y-3">
                      {reqMappings.map((m, idx) => (
                        <div key={m.requirement_id} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">{m.requirement_id}</span>
                            <span className="font-bold text-white text-xs">{m.title}</span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Implemented Feature (e.g. /api/auth endpoint)"
                              value={m.implemented_feature}
                              onChange={(e) => {
                                const next = [...reqMappings];
                                next[idx].implemented_feature = e.target.value;
                                setReqMappings(next);
                              }}
                              className="sm-input px-3 py-2 text-[11px]"
                            />
                            <input
                              type="text"
                              placeholder="Evidence (e.g. screenshot URL or test case)"
                              value={m.evidence}
                              onChange={(e) => {
                                const next = [...reqMappings];
                                next[idx].evidence = e.target.value;
                                setReqMappings(next);
                              }}
                              className="sm-input px-3 py-2 text-[11px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionModal(false)}
                    className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="sm-btn-primary py-3 px-8 text-xs font-black uppercase tracking-widest"
                  >
                    {submitting ? 'Submitting Deliverables...' : 'Submit Deliverables →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </ScrollReveal>
    </Layout>
  );
};

export default ProjectDetailPage;
