import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { projectService, Project } from '../../services/projectService';
import { problemService, Problem } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal, StaggerChildren } from '../../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../components/motion/Toast';

const OwnerDashboardPage: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [requirements, setRequirements] = useState<Problem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [decision, setDecision] = useState<'ACCEPT' | 'REQUEST_CHANGES' | 'REJECT'>('ACCEPT');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'owner_review' | 'accepted' | 'revision_required'>('all');
  const [activeTab, setActiveTab] = useState<'solutions' | 'requirements'>('solutions');

  const loadOwnerPortal = async (showToast = false) => {
    try {
      setLoading(true);
      const res: any = await projectService.getOwnerDashboard();
      const reqList = res?.data?.requirements || res?.requirements || [];
      const projList = res?.data?.projects || res?.projects || [];
      setRequirements(reqList);
      setProjects(projList);

      if (projList.length > 0 && !selectedProject) {
        setSelectedProject(projList[0]);
      }

      if (showToast) {
        addToast({
          type: 'success',
          title: 'Command Center Synced',
          message: `Indexed ${reqList.length} organization requirements & ${projList.length} student solutions.`
        });
      }
    } catch (err: any) {
      console.error('Failed to load owner portal:', err);
      if (err?.response?.status === 403) {
        router.push('/403');
      } else {
        addToast({
          type: 'error',
          title: 'Sync Failed',
          message: 'Unable to connect to the organization command portal.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerPortal();
  }, []);

  const handleOwnerDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    if (['REQUEST_CHANGES', 'REJECT'].includes(decision) && !comments.trim()) {
      addToast({
        type: 'warning',
        title: 'Feedback Required',
        message: 'Feedback comments are mandatory when requesting changes or rejecting.'
      });
      return;
    }

    try {
      setSubmitting(true);
      await projectService.takeOwnerAction({
        project_id: selectedProject.id,
        decision,
        comments
      });

      addToast({
        type: decision === 'ACCEPT' ? 'success' : decision === 'REQUEST_CHANGES' ? 'warning' : 'info',
        title: 'Decision Recorded',
        message: `Decision '${decision.replace('_', ' ')}' successfully submitted for ${selectedProject.title}.`
      });

      setComments('');
      await loadOwnerPortal();
    } catch (err: any) {
      console.error('Owner action failed:', err);
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err?.response?.data?.error || 'Failed to submit decision.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const projList = projects || [];
    const pendingReview = projList.filter(p => p.status === 'owner_review' || p.status === 'under_evaluation').length;
    const acceptedCount = projList.filter(p => p.status === 'accepted' || p.status === 'completed').length;
    const totalDevelopers = new Set(projList.map(p => p.student_email).filter(Boolean)).size;

    return {
      requirementsCount: requirements.length,
      pendingReview,
      acceptedCount,
      totalDevelopers: totalDevelopers || projList.length
    };
  }, [projects, requirements]);

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
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
            <i className="fa-solid fa-clock text-[9px]" />
            <span>Ready for Review</span>
          </span>
        );
      case 'under_evaluation':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            <i className="fa-solid fa-microchip text-[9px]" />
            <span>Technical Check</span>
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
        <title>Requester Command Center • SkillMirror OS</title>
        <meta name="description" content="Manage submitted real-world requirements, inspect student solutions, and confirm organization acceptance." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-11"
        section="ORGANIZATION & REQUESTER ENGINE"
        title="REQUESTER COMMAND CENTER"
        subtitle="Manage submitted organizational requirements, inspect live student deployments, and execute real-world solution acceptance decisions."
        badge="ORGANIZATION PORTAL"
        badgeVariant="outline-cyan"
        bulletVariant="cyan"
        glowColor="cyan"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => loadOwnerPortal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              title="Refresh Workspace Data"
            >
              <i className={`fa-solid fa-arrows-rotate text-xs text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
            <Link href="/problems/submit">
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,217,255,0.35)] transition-all flex items-center gap-2">
                <i className="fa-solid fa-plus text-xs" />
                <span>Submit Requirement</span>
              </button>
            </Link>
          </div>
        }
        stats={
          <>
            <PageStatChip label="Posted Demands" value={stats.requirementsCount} icon="fa-folder-open" color="cyan" />
            <PageStatChip label="Pending Review" value={stats.pendingReview} icon="fa-clock" color="amber" />
            <PageStatChip label="Accepted MVP" value={stats.acceptedCount} icon="fa-shield-check" color="emerald" />
          </>
        }
      />

      <div className="px-4 sm:px-6 pb-24 max-w-[1400px] mx-auto space-y-8">
        {/* ── 1. Tabbed Navigation Dock (Solutions vs Requirements) ── */}
        <ScrollReveal>
          <div className="flex items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('solutions')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeTab === 'solutions'
                    ? 'bg-cyan-500/20 border border-cyan-400/80 text-cyan-200 shadow-[0_0_15px_rgba(0,217,255,0.25)]'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <i className="fa-solid fa-code text-xs text-cyan-400" />
                <span>Student Solutions Under Review ({projects.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('requirements')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeTab === 'requirements'
                    ? 'bg-cyan-500/20 border border-cyan-400/80 text-cyan-200 shadow-[0_0_15px_rgba(0,217,255,0.25)]'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <i className="fa-solid fa-building-circle-check text-xs text-emerald-400" />
                <span>My Submitted Requirements ({requirements.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pr-2">
              <span className="text-[11px] font-mono text-slate-400">
                <i className="fa-solid fa-users text-cyan-400 mr-1.5" />
                {stats.totalDevelopers} Active Student Developers
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* ── 2. Tab Content ── */}
        {activeTab === 'requirements' ? (
          /* Requirements Management View */
          <div className="space-y-4">
            {requirements.length === 0 ? (
              <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center backdrop-blur-xl space-y-3">
                <i className="fa-solid fa-folder-open text-3xl text-slate-600" />
                <h3 className="text-base font-display font-bold text-white">No Requirements Posted</h3>
                <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
                  Submit real-world organizational challenges for students to build verified solutions against.
                </p>
                <div className="pt-2">
                  <Link href="/problems/submit">
                    <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono font-bold text-xs uppercase tracking-wider">
                      + Post New Requirement
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requirements.map(req => (
                  <ScrollReveal stagger key={req.id}>
                    <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-xl transition-all shadow-xl space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            {req.category || 'Real-World Demand'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(req.created_at || Date.now()).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-base font-display font-black text-white line-clamp-2">
                          {req.title}
                        </h3>

                        <p className="text-xs font-sans text-slate-400 line-clamp-3 leading-relaxed">
                          {req.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-cyan-300 font-bold">
                          {req.organization_name || 'Organization'}
                        </span>
                        <Link href={`/problems/${req.id}`}>
                          <button className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-slate-200 hover:text-cyan-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5">
                            <span>Inspect</span>
                            <i className="fa-solid fa-arrow-right text-[9px]" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </StaggerChildren>
            )}
          </div>
        ) : (
          /* Solutions Under Review Console */
          loading ? (
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-3">
                <SkeletonCard className="!h-[100px]" />
                <SkeletonCard className="!h-[100px]" />
                <SkeletonCard className="!h-[100px]" />
              </div>
              <div className="lg:col-span-8">
                <SkeletonCard className="!h-[400px]" />
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center backdrop-blur-xl space-y-4">
              <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                <i className="fa-solid fa-code text-2xl text-cyan-400" />
              </div>
              <h3 className="text-lg font-display font-black text-white">
                No Student Solutions Submitted Yet
              </h3>
              <p className="text-xs font-mono text-slate-400 max-w-md mx-auto leading-relaxed">
                You have {requirements.length} active requirement(s). When student developers build and submit solutions against your demands, they will appear in this review console.
              </p>
              <div className="pt-2">
                <Link href="/problems">
                  <button className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all">
                    Browse All Demands
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* ── Left Solutions Stream (4 Cols) ── */}
              <div className="lg:col-span-4 space-y-4">
                {/* Search & Filter Bar */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl space-y-2.5">
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass text-slate-500 text-xs absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search solutions or student..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/60"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'owner_review', label: 'Review Queue' },
                      { id: 'accepted', label: 'Accepted' },
                      { id: 'revision_required', label: 'Revisions' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setStatusFilter(f.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                          statusFilter === f.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project List */}
                <div className="space-y-3">
                  {filteredProjects.map((p) => {
                    const isSelected = selectedProject?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer space-y-2.5 relative overflow-hidden ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(0,217,255,0.2)]'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
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
                            <i className="fa-solid fa-user-graduate text-cyan-400 text-[10px]" />
                            <span className="truncate max-w-[140px]">{p.student_email || 'Student Developer'}</span>
                          </span>
                          <span className="text-cyan-300 font-bold">{p.progress_percentage || 0}% Done</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Right Solution Inspection & Decision Console (8 Cols) ── */}
              {selectedProject ? (
                <div className="lg:col-span-8 space-y-6">
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-6">
                    {/* Console Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                            STUDENT SOLUTION WORKSPACE #{selectedProject.id}
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                          {selectedProject.title}
                        </h2>
                        <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
                          <span>Developer:</span>
                          <span className="text-cyan-300 font-bold">{selectedProject.student_email || 'Student'}</span>
                        </p>
                      </div>

                      <div className="self-start sm:self-auto">
                        {getStatusBadge(selectedProject.status)}
                      </div>
                    </div>

                    {/* Problem Statement Recap */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Target Requirement Statement
                      </span>
                      <p className="text-xs font-sans text-slate-300 leading-relaxed">
                        {selectedProject.problem_statement || 'Student implementation addressing organizational specifications.'}
                      </p>
                    </div>

                    {/* Submitted Solution Artifacts & Links */}
                    {selectedProject.submissions && selectedProject.submissions.length > 0 ? (
                      <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-4 text-xs font-mono">
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                          <div className="flex items-center gap-2 font-bold text-cyan-300 text-sm">
                            <i className="fa-solid fa-box-open" />
                            <span>Submitted Artifacts (Version #{selectedProject.submissions[0].version_number})</span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(selectedProject.submissions[0].created_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Direct Repositories & Live Preview */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <i className="fa-brands fa-github text-slate-300 text-xs" />
                              GitHub Code Repository
                            </span>
                            <a
                              href={selectedProject.submissions[0].github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-cyan-300 font-bold hover:underline truncate"
                            >
                              {selectedProject.submissions[0].github_url}
                            </a>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <i className="fa-solid fa-globe text-emerald-400 text-xs" />
                              Live Deployment URL
                            </span>
                            <a
                              href={selectedProject.submissions[0].published_url}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-emerald-400 font-bold hover:underline truncate"
                            >
                              {selectedProject.submissions[0].published_url}
                            </a>
                          </div>
                        </div>

                        {/* Solution Documentation */}
                        {selectedProject.submissions[0].documentation && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Developer Documentation & Architecture Summary:
                            </span>
                            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-sans text-xs leading-relaxed whitespace-pre-wrap">
                              {selectedProject.submissions[0].documentation}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-black/40 border border-white/[0.05] text-center space-y-2">
                        <i className="fa-solid fa-hourglass-half text-amber-400 text-lg" />
                        <p className="text-xs font-mono text-slate-300">
                          Student is currently actively executing tasks in their workspace.
                        </p>
                        <p className="text-[11px] font-mono text-slate-500">
                          Progress: {selectedProject.progress_percentage || 0}% tasks completed.
                        </p>
                      </div>
                    )}

                    {/* ── Problem Owner Acceptance Decision Deck ── */}
                    <form onSubmit={handleOwnerDecision} className="space-y-5 pt-4 border-t border-white/[0.08]">
                      <div>
                        <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
                          <i className="fa-solid fa-gavel text-cyan-400" />
                          <span>Organization Acceptance Decision</span>
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400 mt-1">
                          Accepting this solution confirms it satisfies your organizational requirements and issues verified Evidence of Skill to the developer.
                        </p>
                      </div>

                      {/* 3 Action Buttons */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'ACCEPT', label: 'Accept Solution', icon: 'fa-check', color: 'emerald' },
                          { id: 'REQUEST_CHANGES', label: 'Request Revisions', icon: 'fa-rotate-left', color: 'amber' },
                          { id: 'REJECT', label: 'Reject Solution', icon: 'fa-xmark', color: 'rose' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setDecision(opt.id as any)}
                            className={`p-3.5 rounded-2xl border text-xs font-mono font-black uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                              decision === opt.id
                                ? opt.id === 'ACCEPT'
                                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                  : opt.id === 'REQUEST_CHANGES'
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                  : 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <i className={`fa-solid ${opt.icon} text-xs`} />
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Feedback Textarea */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                          <span>Feedback / Revision Notes</span>
                          {['REQUEST_CHANGES', 'REJECT'].includes(decision) && (
                            <span className="text-amber-400 font-bold">* Mandatory for this decision</span>
                          )}
                        </label>
                        <textarea
                          rows={4}
                          placeholder={
                            decision === 'ACCEPT'
                              ? 'Provide any positive feedback or remarks on the verified solution...'
                              : 'Specify precisely what modifications, tests, or adjustments the developer needs to make...'
                          }
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all leading-relaxed"
                        />
                      </div>

                      {/* Submit Action */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-3.5 rounded-2xl font-mono font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${
                          decision === 'ACCEPT'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                            : decision === 'REQUEST_CHANGES'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                            : 'bg-gradient-to-r from-rose-600 to-red-700 hover:brightness-110 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                        }`}
                      >
                        <i className={`fa-solid fa-paper-plane text-xs ${submitting ? 'animate-bounce' : ''}`} />
                        <span>{submitting ? 'Recording Decision...' : 'Confirm Real-World Decision →'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-8 p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 font-mono text-xs">
                  Select a solution from the left stream to inspect artifacts and confirm acceptance.
                </div>
              )}
            </div>
          )
        )}
      </div>
    </Layout>
  );
};

export default OwnerDashboardPage;
