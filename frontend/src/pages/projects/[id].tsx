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
        return (
          <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400" />
            <span>Accepted / Completed</span>
          </span>
        );
      case 'owner_review':
        return (
          <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-800/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-400" />
            <span>Pending Owner Review</span>
          </span>
        );
      case 'under_evaluation':
        return (
          <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-950 text-zinc-300 border border-zinc-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-zinc-400" />
            <span>Under Evaluation</span>
          </span>
        );
      case 'revision_required':
        return (
          <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-rose-950/40 text-rose-400 border border-rose-800/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-rose-400" />
            <span>Revision Required</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-950 text-zinc-400 border border-zinc-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-zinc-500" />
            <span>{status.replace('_', ' ')}</span>
          </span>
        );
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
        <title>{project.title} • Project Workspace • SkillMirror Core</title>
      </Head>

      <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-6 py-6 text-zinc-200">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-4">
          <Link href="/projects/status-center" className="hover:text-amber-400 transition-colors">
            STATUS CENTER
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-white font-bold truncate">{project.title}</span>
        </div>

        {/* Header Terminal */}
        <div className="p-8 bg-zinc-900/90 border border-zinc-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {renderStatusBadge(project.status)}
              <span className="text-xs font-mono font-bold text-zinc-400">Progress: {project.progress_percentage}%</span>
            </div>

            <button
              onClick={() => setShowSubmissionModal(true)}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm"
            >
              <i className="fa-solid fa-paper-plane" />
              <span>Submit Project Version ({submissions.length + 1})</span>
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white">{project.title}</h1>
            <p className="text-xs sm:text-sm font-sans text-zinc-300 leading-relaxed">{project.problem_statement}</p>
          </div>

          <div className="w-full h-1.5 bg-zinc-950 border border-zinc-800 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${project.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Revision Required Alert */}
        {project.status === 'revision_required' && latestSub && (
          <div className="p-6 bg-rose-950/20 border border-rose-800/60 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-sm">
              <span className="w-2 h-2 bg-rose-400" />
              <span>Revision Required for Submission Version #{latestSub.version_number}</span>
            </div>
            <p className="text-xs font-sans text-zinc-300 leading-relaxed">
              {latestSub.evaluation?.evaluator_comments || 'Certain critical requirements or live deployment checks failed. Inspect requirement breakdown below, fix issues, and submit a new version.'}
            </p>
          </div>
        )}

        {/* Phased Scope & Task Checklist */}
        <div className="p-8 bg-zinc-900/90 border border-zinc-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-list-check text-amber-400" />
              <span>Project Execution Roadmap & Tasks</span>
            </h3>
            <div className="flex gap-2">
              {(['mvp', 'v2', 'future'] as const).map(phase => (
                <button
                  key={phase}
                  onClick={() => setActivePhase(phase)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors border ${
                    activePhase === phase
                      ? 'bg-amber-400/10 text-amber-400 border-amber-400/40'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
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
                className={`p-4 border transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                  t.is_completed
                    ? 'bg-zinc-950/40 border-zinc-800/60 text-zinc-500'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 border flex items-center justify-center text-[10px] transition-colors ${
                    t.is_completed
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}>
                    {t.is_completed && <i className="fa-solid fa-check" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-mono font-semibold ${t.is_completed ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                      {t.title}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-500">Skill: {t.mapped_skill_name || 'Development'}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold uppercase ${t.is_completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {t.is_completed ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submission Version History */}
        {submissions.length > 0 && (
          <div className="p-8 bg-zinc-900/90 border border-zinc-800 space-y-6">
            <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-amber-400" />
              <span>Submission Version History ({submissions.length})</span>
            </h3>

            <div className="space-y-4">
              {submissions.map((sub: ProjectSubmissionVersion) => (
                <div key={sub.id} className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-zinc-900 text-amber-400 border border-zinc-800">
                        Version #{sub.version_number}
                      </span>
                      <span className="text-xs font-mono text-zinc-500">{new Date(sub.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs font-mono font-bold uppercase border ${
                        sub.deployment_status === 'reachable'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                          : 'bg-rose-950/40 text-rose-400 border-rose-800/60'
                      }`}>
                        Live: {sub.deployment_status}
                      </span>
                      {sub.evaluation && (
                        <span className="text-xs font-mono font-bold text-amber-400">
                          Coverage: {sub.evaluation.requirement_coverage_pct}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-zinc-500 font-bold block mb-0.5">GitHub Repository:</span>
                      <a href={sub.github_url} target="_blank" rel="noreferrer" className="block text-amber-400 font-bold truncate hover:underline">
                        {sub.github_url}
                      </a>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-bold block mb-0.5">Live Published URL:</span>
                      <a href={sub.published_url} target="_blank" rel="noreferrer" className="block text-emerald-400 font-bold truncate hover:underline">
                        {sub.published_url}
                      </a>
                    </div>
                  </div>

                  {sub.evaluation && (
                    <div className="p-4 bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[11px] font-mono font-bold">
                        <span className="text-zinc-400">Evaluator Decision: <span className="text-white">{sub.evaluation.evaluator_decision}</span></span>
                        <span className="text-zinc-400">Quality Score: <span className="text-emerald-400">{sub.evaluation.quality_score}/100</span></span>
                      </div>
                      <p className="text-zinc-300 italic text-[11px] font-sans">"{sub.evaluation.evaluator_comments}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Modal Drawer */}
        {showSubmissionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="p-8 max-w-3xl w-full bg-zinc-900 border border-zinc-800 space-y-6 my-8 text-zinc-200">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-paper-plane text-amber-400" />
                  <span>Submit Project Deliverables (Version #{submissions.length + 1})</span>
                </h3>
                <button onClick={() => setShowSubmissionModal(false)} className="text-zinc-400 hover:text-white">
                  <i className="fa-solid fa-xmark text-lg" />
                </button>
              </div>

              <form onSubmit={handleSubmitVersion} className="space-y-5 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400">
                    GitHub Repository URL (Required)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/project-repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 flex justify-between">
                    <span>Live / Published Project URL (Required)</span>
                    {liveCheckResult && (
                      <span className={`font-bold ${liveCheckResult.is_valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {liveCheckResult.notes}
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://my-app.vercel.app or https://api.render.com"
                      value={publishedUrl}
                      onChange={(e) => setPublishedUrl(e.target.value)}
                      required
                      className="flex-1 px-3 py-2.5 bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleCheckLiveUrl}
                      disabled={checkingUrl}
                      className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs uppercase"
                    >
                      {checkingUrl ? 'Checking...' : 'Check Link'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400">
                    Project Documentation & Architecture Overview (Required)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe backend architecture, API endpoints, database setup, and installation steps..."
                    value={documentation}
                    onChange={(e) => setDocumentation(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                {/* Requirement Mapping Matrix */}
                {reqMappings.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-zinc-800">
                    <label className="block text-[10px] font-mono font-bold uppercase text-amber-400">
                      Requirement Mapping Matrix
                    </label>
                    <p className="text-[11px] font-sans text-zinc-400">
                      Map each official requirement to your implemented feature and evidence link/test:
                    </p>
                    
                    <div className="space-y-3">
                      {reqMappings.map((m, idx) => (
                        <div key={m.requirement_id} className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-amber-400 font-mono font-bold text-[10px]">
                              {m.requirement_id}
                            </span>
                            <span className="font-mono font-bold text-white text-xs">{m.title}</span>
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
                              className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
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
                              className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionModal(false)}
                    className="px-5 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Deliverables...' : 'Submit Deliverables →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectDetailPage;
