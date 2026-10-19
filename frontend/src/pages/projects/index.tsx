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
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400" />
            <span>VERIFIED ACCEPTED</span>
          </span>
        );
      case 'owner_review':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-800/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-400" />
            <span>OWNER REVIEW</span>
          </span>
        );
      case 'under_evaluation':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-950 text-zinc-300 border border-zinc-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-zinc-400" />
            <span>EVALUATION QUEUE</span>
          </span>
        );
      case 'revision_required':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-950/40 text-rose-400 border border-rose-800/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-rose-400" />
            <span>REVISION NEEDED</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-950 text-zinc-400 border border-zinc-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-zinc-500" />
            <span>{status?.replace('_', ' ') || 'ACTIVE'}</span>
          </span>
        );
    }
  };

  return (
    <Layout>
      <Head>
        <title>My Real-World Projects • SkillMirror Core</title>
        <meta name="description" content="Manage practical MVP project workspaces, execute milestone tasks, and build verifiable Evidence of Skill." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-08"
        section="PROJECTS & REAL-WORLD PORTFOLIO"
        title="MY PROJECTS & WORKSPACES"
        subtitle="Manage practical MVP workspaces, execute milestone tasks, bridge skill gaps, and generate verifiable Evidence of Skill for recruiters."
        badge="EVIDENCE OF SKILL"
        badgeVariant="outline-amber"
        bulletVariant="amber"
        glowColor="amber"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/projects/status-center">
              <button className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center gap-2">
                <i className="fa-solid fa-chart-line text-xs text-emerald-400" />
                <span>Status Center</span>
              </button>
            </Link>
            <Link href="/problems">
              <button className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm">
                <i className="fa-solid fa-plus text-xs" />
                <span>Discover Problems</span>
              </button>
            </Link>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <PageStatChip label="Active Projects" value={stats.total} icon="fa-diagram-project" color="amber" />
          <PageStatChip label="Avg Completion" value={`${stats.avgProgress}%`} icon="fa-chart-pie" color="zinc" />
          <PageStatChip label="Verified Complete" value={stats.completed} icon="fa-shield-check" color="emerald" />
        </div>

        <div className="space-y-6">
          {/* Filter Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm-scrollbar">
            {[
              { id: 'all', label: 'All Workspaces', count: stats.total },
              { id: 'in_progress', label: 'In Development', count: stats.inProgress },
              { id: 'evaluation', label: 'In Review / Evaluation' },
              { id: 'completed', label: 'Verified & Accepted', count: stats.completed }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border ${
                  filter === tab.id
                    ? 'bg-amber-400/10 text-amber-400 border-amber-400/40'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`px-1.5 py-0.2 text-[10px] font-mono ${filter === tab.id ? 'bg-amber-400/20 text-amber-400' : 'bg-zinc-950 text-zinc-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              <SkeletonCard className="!h-[240px]" />
              <SkeletonCard className="!h-[240px]" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-16 bg-zinc-900/80 border border-zinc-800 text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-amber-400">
                <i className="fa-solid fa-code text-2xl" />
              </div>
              <h3 className="text-lg font-mono font-bold text-white">
                No Projects Found In This Stage
              </h3>
              <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto leading-relaxed">
                Launch a validated real-world problem from the Practice Arena to generate an MVP architecture plan and task breakdown.
              </p>
              <div className="pt-2">
                <Link href="/problems">
                  <button className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">
                    Browse Practice Directory
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredProjects.map((proj) => {
                const progress = proj.progress_percentage || 0;
                const isVerified = proj.status === 'accepted' || proj.status === 'completed';

                return (
                  <div
                    key={proj.id}
                    className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 p-6 transition-colors space-y-5 text-zinc-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        {getStatusBadge(proj.status)}
                        <span className="text-xs font-mono font-bold text-zinc-400">
                          {progress}% Completed
                        </span>
                      </div>

                      {/* Title & Statement */}
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-mono font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                          {proj.title}
                        </h3>
                        <p className="text-xs font-sans text-zinc-400 line-clamp-2 leading-relaxed">
                          {proj.problem_statement || 'Real-world MVP implementation addressing validated organizational requirements.'}
                        </p>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full h-1.5 bg-zinc-950 border border-zinc-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isVerified ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Tech Stack Chips & Action CTA */}
                    <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(proj.tech_stack || []).slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <Link href={`/projects/${proj.id}`}>
                        <button className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-300 group-hover:border-amber-400/60 group-hover:text-amber-400 font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                          <span>Open Workspace</span>
                          <i className="fa-solid fa-arrow-right text-[10px]" />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CyberPageShell>
    </Layout>
  );
};

export default ProjectsListPage;
