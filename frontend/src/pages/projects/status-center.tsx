import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { projectService, Project } from '../../services/projectService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal } from '../../components/motion/ScrollReveal';

const ProjectStatusCenterPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  const loadStatusCenter = async () => {
    try {
      setLoading(true);
      const res: any = await projectService.getStatusCenter();
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

  if (loading || !data) {
    return (
      <Layout>
        <div className="p-8 max-w-6xl mx-auto space-y-6">
          <SkeletonCard className="!h-[200px]" />
          <SkeletonCard className="!h-[350px]" />
        </div>
      </Layout>
    );
  }

  const counts = data.status_counts || {};
  const projects: Project[] = data.recent_projects || [];

  const filteredProjects = activeTab === 'all' 
    ? projects 
    : projects.filter(p => p.status === activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Accepted</span>;
      case 'owner_review':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">Owner Review</span>;
      case 'under_evaluation':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">Under Evaluation</span>;
      case 'revision_required':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">Revision Required</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-white/5">{status.replace('_', ' ')}</span>;
    }
  };

  return (
    <Layout>
      <Head>
        <title>Project Status Center • SkillMirror</title>
      </Head>

      <ScrollReveal className="space-y-10">
        {/* Header Terminal */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">Lifecycle Monitoring Center</span>
            </div>
            <h1 className="sm-h1 !text-4xl lg:!text-5xl">Project Status Center</h1>
            <p className="sm-body-text mt-2 max-w-2xl">
              Track project lifecycle progression across all stages: from initial discovery, student development, technical evaluation, owner review, to real-world acceptance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/evaluator/dashboard">
              <button className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-xs hover:bg-indigo-500/20">
                Evaluator Portal
              </button>
            </Link>
            <Link href="/owner/dashboard">
              <button className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold text-xs hover:bg-cyan-500/20">
                Problem Owner Portal
              </button>
            </Link>
          </div>
        </div>

        {/* Lifecycle Stage Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { key: 'all', label: 'All Projects', count: projects.length, color: 'text-white' },
            { key: 'in_progress', label: 'In Progress', count: counts.in_progress || 0, color: 'text-amber-400' },
            { key: 'under_evaluation', label: 'Under Eval', count: counts.under_evaluation || 0, color: 'text-indigo-400' },
            { key: 'revision_required', label: 'Revision Required', count: counts.revision_required || 0, color: 'text-rose-400' },
            { key: 'owner_review', label: 'Owner Review', count: counts.owner_review || 0, color: 'text-cyan-400' },
            { key: 'accepted', label: 'Accepted', count: (counts.accepted || 0) + (counts.completed || 0), color: 'text-emerald-400' },
          ].map(stage => (
            <div
              key={stage.key}
              onClick={() => setActiveTab(stage.key)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                activeTab === stage.key ? 'bg-slate-900 border-cyan-500/40 shadow-lg' : 'bg-slate-950/60 border-white/5 hover:border-white/20'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stage.label}</span>
              <p className={`text-2xl font-black ${stage.color}`}>{stage.count}</p>
            </div>
          ))}
        </div>

        {/* Projects Monitoring Table */}
        <div className="sm-glass p-8 rounded-3xl space-y-6 border border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-list-ul text-cyan-400" />
              <span>Monitored Projects ({filteredProjects.length})</span>
            </h3>
          </div>

          {filteredProjects.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No projects in this lifecycle stage.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Project Title</th>
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Problem Source</th>
                    <th className="pb-3">Progress</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-4 font-bold text-white max-w-xs truncate">{p.title}</td>
                      <td className="py-4 text-slate-300">{p.student_email || 'Student'}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.is_real_world ? 'bg-emerald-500/10 text-emerald-300' : 'bg-purple-500/10 text-purple-300'}`}>
                          {p.is_real_world ? 'Real-World' : 'AI Practice'}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-cyan-400">{p.progress_percentage}%</td>
                      <td className="py-4">{getStatusBadge(p.status)}</td>
                      <td className="py-4 text-right">
                        <Link href={`/projects/${p.id}`}>
                          <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 font-bold text-[11px] transition-all">
                            Workspace →
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ScrollReveal>
    </Layout>
  );
};

export default ProjectStatusCenterPage;
