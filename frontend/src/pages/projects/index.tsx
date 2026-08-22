import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { projectService, Project } from '../../services/projectService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal, StaggerChildren } from '../../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';

const ProjectsListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res: any = await projectService.getUserProjects();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setProjects(list);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const stats = useMemo(() => {
    const list = projects || [];
    const completedCount = list.filter(p => p.status === 'accepted' || p.status === 'completed').length;
    const inProgressCount = list.filter(p => p.status === 'in_progress' || p.status === 'draft').length;
    const avgProgress = list.length ? Math.round(list.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0) / list.length) : 0;

    return {
      total: list.length,
      completed: completedCount,
      inProgress: inProgressCount,
      avgProgress
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (filter === 'all') return projects;
    if (filter === 'completed') return projects.filter(p => p.status === 'accepted' || p.status === 'completed');
    if (filter === 'in_progress') return projects.filter(p => p.status === 'in_progress' || p.status === 'draft');
    if (filter === 'evaluation') return projects.filter(p => p.status === 'under_evaluation' || p.status === 'owner_review');
    return projects;
  }, [projects, filter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <i className="fa-solid fa-circle-check text-[10px]" />
            <span>VERIFIED ACCEPTED</span>
          </span>
        );
      case 'owner_review':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
            <i className="fa-solid fa-user-check text-[10px]" />
            <span>OWNER REVIEW</span>
          </span>
        );
      case 'under_evaluation':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
            <i className="fa-solid fa-microchip text-[10px]" />
            <span>EVALUATION QUEUE</span>
          </span>
        );
      case 'revision_required':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
            <i className="fa-solid fa-triangle-exclamation text-[10px]" />
            <span>REVISION NEEDED</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1.5">
            <i className="fa-solid fa-code text-[10px] text-cyan-400" />
            <span>{status?.replace('_', ' ') || 'ACTIVE'}</span>
          </span>
        );
    }
  };

  return (
    <Layout>
      <Head>
        <title>My Real-World Projects • SkillMirror OS</title>
        <meta name="description" content="Manage practical MVP project workspaces, execute milestone tasks, and build verifiable Evidence of Skill." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-08"
        section="PROJECTS & REAL-WORLD PORTFOLIO"
        title="MY PROJECTS & WORKSPACES"
        subtitle="Manage practical MVP workspaces, execute milestone tasks, bridge skill gaps, and generate verifiable Evidence of Skill for recruiters."
        badge="EVIDENCE OF SKILL"
        badgeVariant="outline-cyan"
        bulletVariant="cyan"
        glowColor="cyan"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/projects/status-center">
              <button className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                <i className="fa-solid fa-chart-line text-xs text-cyan-400" />
                <span>Status Center</span>
              </button>
            </Link>
            <Link href="/problems">
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(0,217,255,0.3)] transition-all flex items-center gap-2">
                <i className="fa-solid fa-plus text-xs" />
                <span>Discover Problems</span>
              </button>
            </Link>
          </div>
        }
        stats={
          <>
            <PageStatChip label="Active Projects" value={stats.total} icon="fa-diagram-project" color="cyan" />
            <PageStatChip label="Avg Completion" value={`${stats.avgProgress}%`} icon="fa-chart-pie" color="amber" />
            <PageStatChip label="Verified Complete" value={stats.completed} icon="fa-shield-check" color="emerald" />
          </>
        }
      />

      <div className="px-4 sm:px-6 pb-24 max-w-[1400px] mx-auto space-y-8">
        {/* Filter Navigation Tabs */}
        <ScrollReveal>
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl w-fit overflow-x-auto">
            {[
              { id: 'all', label: 'All Workspaces', count: stats.total },
              { id: 'in_progress', label: 'In Development', count: stats.inProgress },
              { id: 'evaluation', label: 'In Review / Evaluation' },
              { id: 'completed', label: 'Verified & Accepted', count: stats.completed }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  filter === tab.id
                    ? 'bg-cyan-500/20 border border-cyan-400/80 text-cyan-200 shadow-[0_0_15px_rgba(0,217,255,0.25)]'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filter === tab.id ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            <SkeletonCard className="!h-[240px]" />
            <SkeletonCard className="!h-[240px]" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center relative overflow-hidden backdrop-blur-xl space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center mx-auto mb-5 border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <i className="fa-solid fa-code text-2xl text-cyan-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-display font-black text-white">
              No Projects Found In This Stage
            </h3>
            <p className="text-xs font-mono text-slate-400 max-w-md mx-auto leading-relaxed">
              Launch a validated real-world problem from the Problem Discovery Engine to generate an MVP architecture plan and task breakdown.
            </p>
            <div className="pt-2">
              <Link href="/problems">
                <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,217,255,0.35)] hover:brightness-110 transition-all">
                  Browse Problem Directory
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <StaggerChildren className="grid md:grid-cols-2 gap-6">
            {filteredProjects.map((proj) => {
              const progress = proj.progress_percentage || 0;
              const isVerified = proj.status === 'accepted' || proj.status === 'completed';

              return (
                <ScrollReveal stagger key={proj.id}>
                  <div className="group relative rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 backdrop-blur-xl p-7 transition-all duration-300 shadow-xl space-y-5 overflow-hidden hover:shadow-[0_12px_35px_rgba(0,0,0,0.6)]">
                    {/* Top Glow Accent Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isVerified ? 'from-emerald-500/60 to-transparent' : 'from-cyan-500/60 to-transparent'}`} />

                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      {getStatusBadge(proj.status)}
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {progress}% Completed
                      </span>
                    </div>

                    {/* Title & Statement */}
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-display font-black text-white group-hover:text-cyan-300 transition-colors leading-snug">
                        {proj.title}
                      </h3>
                      <p className="text-xs font-sans text-slate-400 line-clamp-2 leading-relaxed">
                        {proj.problem_statement || 'Real-world MVP implementation addressing validated organizational requirements.'}
                      </p>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full h-2 rounded-full bg-slate-950 border border-white/[0.05] overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isVerified 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                              : 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(0,217,255,0.5)]'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Tech Stack Chips & Action CTA */}
                    <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(proj.tech_stack || []).slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-950 border border-white/[0.06] text-[10px] font-mono text-slate-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <Link href={`/projects/${proj.id}`}>
                        <button className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-500/10 text-slate-200 hover:text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group/btn">
                          <span>Open Workspace</span>
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

export default ProjectsListPage;
