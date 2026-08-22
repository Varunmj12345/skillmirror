import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { projectService, Project } from '../../services/projectService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal, StaggerChildren } from '../../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';

const ProjectStatusCenterPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  const loadStatusCenter = async () => {
    try {
      setLoading(true);
      const res: any = await projectService.getStatusCenter ? await (projectService as any).getStatusCenter() : await projectService.getUserProjects();
      setData(res?.data || res);
    } catch (err) {
      console.error('Failed to load status center:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatusCenter();
  }, []);

  const projects: Project[] = Array.isArray(data) ? data : (data?.recent_projects || data?.projects || []);

  const counts = useMemo(() => {
    return {
      all: projects.length,
      in_progress: projects.filter(p => p.status === 'in_progress' || p.status === 'draft').length,
      under_evaluation: projects.filter(p => p.status === 'under_evaluation').length,
      owner_review: projects.filter(p => p.status === 'owner_review').length,
      revision_required: projects.filter(p => p.status === 'revision_required').length,
      accepted: projects.filter(p => p.status === 'accepted' || p.status === 'completed').length,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeTab === 'all') return projects;
    if (activeTab === 'in_progress') return projects.filter(p => p.status === 'in_progress' || p.status === 'draft');
    return projects.filter(p => p.status === activeTab);
  }, [projects, activeTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return <span className="px-3 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Verified & Accepted</span>;
      case 'owner_review':
        return <span className="px-3 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">Owner Review</span>;
      case 'under_evaluation':
        return <span className="px-3 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">Under Evaluation</span>;
      case 'revision_required':
        return <span className="px-3 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">Revision Required</span>;
      default:
        return <span className="px-3 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-white/10">{status?.replace('_', ' ') || 'In Development'}</span>;
    }
  };

  return (
    <Layout>
      <Head>
        <title>Project Status & Lifecycle Center • SkillMirror OS</title>
        <meta name="description" content="Lifecycle monitoring from development, evaluator check, to owner review and verified portfolio badge." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-08"
        section="PROJECTS & REAL-WORLD PORTFOLIO"
        title="PROJECT STATUS CENTER"
        subtitle="Track end-to-end lifecycle progression: from development, automated deployment checks, mentor evaluation, to organization acceptance."
        badge="LIFECYCLE TELEMETRY"
        badgeVariant="outline-cyan"
        bulletVariant="cyan"
        glowColor="cyan"
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/projects">
              <button className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                <i className="fa-solid fa-diagram-project text-xs text-cyan-400" />
                <span>My Projects</span>
              </button>
            </Link>
            <Link href="/problems">
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(0,217,255,0.3)] transition-all flex items-center gap-2">
                <i className="fa-solid fa-plus text-xs" />
                <span>New Problem</span>
              </button>
            </Link>
          </div>
        }
        stats={
          <>
            <PageStatChip label="Total Tracked" value={counts.all} icon="fa-list-check" color="cyan" />
            <PageStatChip label="In Review" value={counts.under_evaluation + counts.owner_review} icon="fa-clock" color="amber" />
            <PageStatChip label="Accepted" value={counts.accepted} icon="fa-award" color="emerald" />
          </>
        }
      />

      <div className="px-4 sm:px-6 pb-24 max-w-[1400px] mx-auto space-y-8">
        {/* ── Lifecycle Stage Progression Map ── */}
        <ScrollReveal>
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
              PORTFOLIO VERIFICATION PIPELINE
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { step: '01', label: 'Development', desc: 'Tasks & MVP code building', icon: 'fa-code', count: counts.in_progress, color: 'cyan' },
                { step: '02', label: 'Technical Evaluation', desc: 'Code quality & deployment test', icon: 'fa-microchip', count: counts.under_evaluation, color: 'indigo' },
                { step: '03', label: 'Owner Review', desc: 'Requirement acceptance check', icon: 'fa-user-check', count: counts.owner_review, color: 'amber' },
                { step: '04', label: 'Verified Portfolio', desc: 'Verifiable Evidence of Skill', icon: 'fa-award', count: counts.accepted, color: 'emerald' },
              ].map((stage) => (
                <div key={stage.step} className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500">{stage.step}</span>
                    <i className={`fa-solid ${stage.icon} text-xs text-${stage.color}-400`} />
                  </div>
                  <h4 className="text-sm font-display font-black text-white">{stage.label}</h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{stage.desc}</p>
                  <div className="mt-3 pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Active</span>
                    <span className="font-bold text-white">{stage.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Status Tabs ── */}
        <ScrollReveal>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'All Stages', count: counts.all },
              { id: 'in_progress', label: 'In Development', count: counts.in_progress },
              { id: 'under_evaluation', label: 'Evaluation Queue', count: counts.under_evaluation },
              { id: 'owner_review', label: 'Owner Review', count: counts.owner_review },
              { id: 'revision_required', label: 'Revision Needed', count: counts.revision_required },
              { id: 'accepted', label: 'Accepted & Verified', count: counts.accepted },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,217,255,0.3)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* ── Projects List Stream ── */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard className="!h-28" />
            <SkeletonCard className="!h-28" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center backdrop-blur-xl">
            <i className="fa-solid fa-list-check text-3xl text-slate-600 mb-3" />
            <h3 className="text-base font-display font-bold text-white">No Projects In This Stage</h3>
            <p className="text-xs font-mono text-slate-400 mt-1">Select another filter tab or create a project from Problem Discovery.</p>
          </div>
        ) : (
          <StaggerChildren className="space-y-4">
            {filteredProjects.map((p) => (
              <ScrollReveal stagger key={p.id}>
                <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 backdrop-blur-xl transition-all shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {getStatusBadge(p.status)}
                      <span className="text-[11px] font-mono text-slate-500">
                        Updated {new Date(p.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-display font-black text-white truncate">
                      {p.title}
                    </h3>
                    <p className="text-xs font-sans text-slate-400 line-clamp-1">
                      {p.problem_statement || 'Practical MVP workspace for verified organization requirements.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/[0.05] pt-3 md:pt-0">
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-cyan-300">{p.progress_percentage || 0}%</div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Progress</div>
                    </div>

                    <Link href={`/projects/${p.id}`}>
                      <button className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-500/10 text-slate-200 hover:text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2">
                        <span>Workspace</span>
                        <i className="fa-solid fa-arrow-right text-[10px]" />
                      </button>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </StaggerChildren>
        )}
      </div>
    </Layout>
  );
};

export default ProjectStatusCenterPage;
