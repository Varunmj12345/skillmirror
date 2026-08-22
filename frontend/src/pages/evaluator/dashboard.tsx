import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { projectService, Project, ProjectSubmissionVersion } from '../../services/projectService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal, StaggerChildren } from '../../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';
import { useToast } from '../../components/motion/Toast';

const EvaluatorDashboardPage: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [decision, setDecision] = useState<'ACCEPT' | 'REVISION_REQUIRED' | 'REJECT' | 'REQUEST_MORE_INFO'>('ACCEPT');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'under_evaluation' | 'revision_required' | 'accepted'>('all');

  const loadEvaluatorQueue = async (showToast = false) => {
    try {
      setLoading(true);
      const res: any = await projectService.getEvaluatorDashboard();
      const projList = res?.data?.projects || res?.projects || [];
      setProjects(projList);

      if (projList.length > 0 && !selectedProject) {
        setSelectedProject(projList[0]);
      }

      if (showToast) {
        addToast({
          type: 'success',
          title: 'Audit Queue Synced',
          message: `Indexed ${projList.length} submissions pending technical evaluation.`
        });
      }
    } catch (err: any) {
      console.error('Failed to load evaluator queue:', err);
      if (err?.response?.status === 403) {
        router.push('/403');
      } else {
        addToast({
          type: 'error',
          title: 'Sync Failed',
          message: 'Could not connect to technical evaluation queue.'
        });
      }
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
      addToast({
        type: 'warning',
        title: 'Feedback Required',
        message: 'Detailed audit comments are required when requesting revisions, more info, or rejecting.'
      });
      return;
    }

    try {
      setSubmitting(true);
      await projectService.takeEvaluatorAction({
        project_id: selectedProject.id,
        decision,
        comments: comments.trim()
      });

      addToast({
        type: decision === 'ACCEPT' ? 'success' : decision === 'REVISION_REQUIRED' ? 'warning' : 'info',
        title: 'Technical Verdict Recorded',
        message: `Verdict '${decision.replace('_', ' ')}' successfully submitted for ${selectedProject.title}.`
      });

      setComments('');
      await loadEvaluatorQueue();
    } catch (err: any) {
      console.error('Action failed:', err);
      addToast({
        type: 'error',
        title: 'Verdict Failed',
        message: err?.response?.data?.error || 'Failed to record evaluator verdict.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (statusFilter !== 'all') {
      list = list.filter(p => p.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.student_email?.toLowerCase().includes(q) ||
        p.problem_statement?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = projects.length;
    const underReview = projects.filter(p => p.status === 'under_evaluation').length;
    const revisionsNeeded = projects.filter(p => p.status === 'revision_required').length;
    const approved = projects.filter(p => p.status === 'accepted' || p.status === 'owner_review' || p.status === 'completed').length;

    return {
      total,
      underReview: underReview || total,
      revisionsNeeded,
      approved
    };
  }, [projects]);

  const latestSub: ProjectSubmissionVersion | undefined = selectedProject?.submissions?.[0];
  const evalData = latestSub?.evaluation;
  const reqEvals = evalData?.requirement_evaluations || [];
  const autoChecks = evalData?.automated_checks || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <i className="fa-solid fa-circle-check text-[9px]" />
            <span>Accepted</span>
          </span>
        );
      case 'owner_review':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <i className="fa-solid fa-user-check text-[9px]" />
            <span>Owner Review</span>
          </span>
        );
      case 'under_evaluation':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 animate-pulse">
            <i className="fa-solid fa-microchip text-[9px]" />
            <span>Audit Queue</span>
          </span>
        );
      case 'revision_required':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <i className="fa-solid fa-triangle-exclamation text-[9px]" />
            <span>Revision Required</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-white/10">
            {status?.replace('_', ' ') || 'In Development'}
          </span>
        );
    }
  };

  return (
    <Layout>
      <Head>
        <title>Technical Evaluator Portal • SkillMirror OS</title>
        <meta name="description" content="Technical audit console inspecting student deliverables against original specifications, code correctness, and live deployments." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-12"
        section="TECHNICAL AUDIT & EVALUATION ENGINE"
        title="TECHNICAL EVALUATOR CONSOLE"
        subtitle="Perform rigorous code audits, live URL verifications, automated test coverage analyses, and issue objective technical acceptance verdicts."
        badge="EVALUATOR CLEARANCE"
        badgeVariant="outline-cyan"
        bulletVariant="cyan"
        glowColor="indigo"
        actions={
          <button
            onClick={() => loadEvaluatorQueue(true)}
            className="px-4 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <i className={`fa-solid fa-arrows-rotate text-xs text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Queue</span>
          </button>
        }
        stats={
          <>
            <PageStatChip label="Audit Queue" value={stats.underReview} icon="fa-hourglass-half" color="cyan" />
            <PageStatChip label="Needs Revision" value={stats.revisionsNeeded} icon="fa-rotate-left" color="amber" />
            <PageStatChip label="Passed Audits" value={stats.approved} icon="fa-shield-check" color="emerald" />
          </>
        }
      />

      <div className="px-4 sm:px-6 pb-24 max-w-[1400px] mx-auto space-y-8">
        {loading ? (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-3">
              <SkeletonCard className="!h-[100px]" />
              <SkeletonCard className="!h-[100px]" />
              <SkeletonCard className="!h-[100px]" />
            </div>
            <div className="lg:col-span-8">
              <SkeletonCard className="!h-[450px]" />
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center backdrop-blur-xl space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <i className="fa-solid fa-clipboard-check text-2xl text-indigo-400" />
            </div>
            <h3 className="text-lg font-display font-black text-white">
              All Technical Submissions Evaluated
            </h3>
            <p className="text-xs font-mono text-slate-400 max-w-md mx-auto leading-relaxed">
              There are currently no student deliverables in the audit queue. New project submissions will automatically stream into this terminal.
            </p>
            <div className="pt-2">
              <Link href="/projects">
                <button className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all">
                  Browse All Projects
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* ── Left Audit Queue Stream (4 Cols) ── */}
            <div className="lg:col-span-4 space-y-4">
              {/* Search & Filter Matrix */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl space-y-2.5">
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass text-slate-500 text-xs absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search submissions or student..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/60"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'under_evaluation', label: 'Audit Queue' },
                    { id: 'revision_required', label: 'Revisions' },
                    { id: 'accepted', label: 'Passed' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setStatusFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                        statusFilter === f.id
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/60'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Projects List */}
              <div className="space-y-3">
                {filteredProjects.map((p) => {
                  const isSelected = selectedProject?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProject(p)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer space-y-2.5 relative overflow-hidden ${
                        isSelected
                          ? 'bg-slate-900 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400" />
                      )}

                      <div className="flex items-center justify-between gap-2">
                        {getStatusBadge(p.status)}
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(p.created_at || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-display font-bold text-white truncate">
                        {p.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-white/[0.04]">
                        <span className="truncate flex items-center gap-1.5">
                          <i className="fa-solid fa-user-gear text-indigo-400 text-[10px]" />
                          <span className="truncate max-w-[140px]">{p.student_email || 'Student Developer'}</span>
                        </span>
                        <span className="text-indigo-300 font-bold">{p.progress_percentage || 0}% Done</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Right Technical Audit & Decision Deck (8 Cols) ── */}
            {selectedProject ? (
              <div className="lg:col-span-8 space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-6">
                  {/* Audit Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
                          AUDIT CONSOLE • WORKSPACE #{selectedProject.id}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                        {selectedProject.title}
                      </h2>
                      <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
                        <span>Developer:</span>
                        <span className="text-indigo-300 font-bold">{selectedProject.student_email || 'Student'}</span>
                      </p>
                    </div>

                    <div className="self-start sm:self-auto flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {selectedProject.is_real_world ? '🏢 REAL-WORLD DEMAND' : '🤖 AI PRACTICE'}
                      </span>
                    </div>
                  </div>

                  {/* Deliverables Link Check Panel */}
                  {latestSub ? (
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-4 text-xs font-mono">
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2 font-bold text-indigo-300 text-sm">
                          <i className="fa-solid fa-code-pull-request" />
                          <span>Student Deliverables (Version #{latestSub.version_number})</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                          latestSub.deployment_status === 'reachable'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          Health Check: {latestSub.deployment_status || 'Reachable'}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <i className="fa-brands fa-github text-slate-300 text-xs" />
                            GitHub Code Repository
                          </span>
                          <a
                            href={latestSub.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-cyan-300 font-bold hover:underline truncate"
                          >
                            {latestSub.github_url}
                          </a>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <i className="fa-solid fa-globe text-emerald-400 text-xs" />
                            Live Published Application Link
                          </span>
                          <a
                            href={latestSub.published_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-emerald-400 font-bold hover:underline truncate"
                          >
                            {latestSub.published_url}
                          </a>
                        </div>
                      </div>

                      {latestSub.documentation && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Setup & Architecture Instructions:
                          </span>
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-sans text-xs leading-relaxed whitespace-pre-wrap">
                            {latestSub.documentation}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/[0.05] text-center text-xs font-mono text-amber-300">
                      <i className="fa-solid fa-hourglass-half mr-2" />
                      Deliverables submission pending from student.
                    </div>
                  )}

                  {/* Automated Technical Metrics */}
                  {evalData && (
                    <div className="space-y-4 pt-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                        Automated Test Coverage & Static Code Quality
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] text-center">
                          <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Overall Coverage</span>
                          <p className="text-xl font-display font-black text-cyan-300 mt-1">{evalData.requirement_coverage_pct}%</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] text-center">
                          <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Critical Path</span>
                          <p className={`text-xl font-display font-black mt-1 ${evalData.critical_requirement_coverage_pct >= 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {evalData.critical_requirement_coverage_pct}%
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] text-center">
                          <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Code Quality</span>
                          <p className="text-xl font-display font-black text-emerald-400 mt-1">{evalData.quality_score} / 100</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] text-center">
                          <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Owner Gate</span>
                          <p className={`text-xs font-mono font-black mt-2 uppercase ${evalData.is_ready_for_owner_review ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {evalData.is_ready_for_owner_review ? 'GATE PASSED' : 'BLOCKED'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                        <span className={`px-3 py-1 rounded-xl font-bold border ${autoChecks.github_reachable ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'}`}>
                          GitHub Repo: {autoChecks.github_reachable ? '✓ Accessible' : '✗ Unreachable'}
                        </span>
                        <span className={`px-3 py-1 rounded-xl font-bold border ${autoChecks.published_url_reachable ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'}`}>
                          Live Endpoint: {autoChecks.published_url_reachable ? '✓ HTTP 200 OK' : '✗ Failed Endpoint'}
                        </span>
                        <span className={`px-3 py-1 rounded-xl font-bold border ${autoChecks.file_completeness ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'}`}>
                          Documentation: {autoChecks.file_completeness ? '✓ Complete' : '✗ Incomplete'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Requirement-by-Requirement Breakdown */}
                  {reqEvals.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                        Per-Requirement Technical Verification Matrix
                      </span>

                      <div className="space-y-3 text-xs">
                        {reqEvals.map((item: any) => (
                          <div key={item.requirement_id} className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px]">
                                  {item.requirement_id}
                                </span>
                                <span className="font-bold text-white text-xs">{item.title}</span>
                              </div>

                              <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-black uppercase ${
                                item.status === 'SATISFIED' ? 'bg-emerald-500/20 text-emerald-300' : (item.status === 'PARTIALLY_SATISFIED' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300')
                              }`}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </div>

                            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">{item.reason}</p>
                            
                            {item.status !== 'SATISFIED' && (
                              <div className="p-2.5 rounded-xl bg-slate-950 text-amber-300 text-[11px] font-mono font-semibold border border-amber-500/20">
                                💡 Suggested Fix: {item.suggested_action}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Evaluator Verdict & Action Deck ── */}
                  <form onSubmit={handleDecisionSubmit} className="space-y-5 pt-4 border-t border-white/[0.08]">
                    <div>
                      <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-clipboard-check text-indigo-400" />
                        <span>Technical Evaluator Verdict</span>
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-1">
                        Accepting advances this solution to the Organization Problem Owner review gate.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'ACCEPT', label: 'Pass Technical Audit', icon: 'fa-check', color: 'emerald' },
                        { id: 'REVISION_REQUIRED', label: 'Require Revisions', icon: 'fa-rotate-left', color: 'amber' },
                        { id: 'REQUEST_MORE_INFO', label: 'Need Clarification', icon: 'fa-circle-question', color: 'indigo' },
                        { id: 'REJECT', label: 'Reject Solution', icon: 'fa-xmark', color: 'rose' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDecision(opt.id as any)}
                          className={`p-3 rounded-2xl border text-xs font-mono font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 text-center ${
                            decision === opt.id
                              ? opt.id === 'ACCEPT'
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : opt.id === 'REVISION_REQUIRED'
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : opt.id === 'REQUEST_MORE_INFO'
                                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                                : 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <i className={`fa-solid ${opt.icon} text-xs`} />
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                        <span>Evaluator Audit Notes & Technical Feedback</span>
                        {['REVISION_REQUIRED', 'REJECT', 'REQUEST_MORE_INFO'].includes(decision) && (
                          <span className="text-amber-400 font-bold">* Mandatory for this verdict</span>
                        )}
                      </label>
                      <textarea
                        rows={4}
                        placeholder={
                          decision === 'ACCEPT'
                            ? 'Provide technical commentary or pass verification remarks...'
                            : 'Detail technical defects, failed test cases, or missing architectural elements...'
                        }
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full py-3.5 rounded-2xl font-mono font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${
                        decision === 'ACCEPT'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                          : decision === 'REVISION_REQUIRED'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                          : decision === 'REQUEST_MORE_INFO'
                          ? 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:brightness-110 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]'
                          : 'bg-gradient-to-r from-rose-600 to-red-700 hover:brightness-110 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                      }`}
                    >
                      <i className={`fa-solid fa-stamp text-xs ${submitting ? 'animate-spin' : ''}`} />
                      <span>{submitting ? 'Recording Verdict...' : 'Submit Technical Verdict →'}</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-8 p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 font-mono text-xs">
                Select a submission from the audit queue to inspect code artifacts and issue a technical verdict.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EvaluatorDashboardPage;
