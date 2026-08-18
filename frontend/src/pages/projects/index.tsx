import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { projectService, Project } from '../../services/projectService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal } from '../../components/motion/ScrollReveal';

const ProjectsListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res: any = await projectService.getUserProjects();
      setProjects(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <Layout>
      <Head>
        <title>My Projects • Project Intelligence</title>
      </Head>

      <ScrollReveal className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">Project Intelligence Engine</span>
            <h1 className="sm-h1 !text-4xl">My Real-World Projects</h1>
            <p className="sm-body-text mt-1">
              Track project milestones, execute tasks, bridge skill gaps, and generate verifiable Evidence of Skill.
            </p>
          </div>
          <Link href="/problems">
            <button className="sm-btn-primary py-3 px-5 !text-xs uppercase tracking-widest">
              + Discover Problems
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            <SkeletonCard className="!h-[200px]" />
            <SkeletonCard className="!h-[200px]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="sm-glass p-12 text-center rounded-3xl space-y-4">
            <div className="text-4xl">🛠️</div>
            <h3 className="text-lg font-bold text-white">No Active Projects</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Select a validated real-world problem from the Problem Discovery Engine to generate a practical MVP project plan.
            </p>
            <Link href="/problems">
              <button className="sm-btn-primary py-3 px-6 text-xs font-bold uppercase tracking-widest">
                Browse Problems
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="sm-glass p-7 rounded-3xl space-y-5 border border-white/5 sm-card-hover">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                    {proj.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{proj.progress_percentage}% Complete</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{proj.problem_statement}</p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${proj.progress_percentage}%` }} />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(proj.tech_stack || []).slice(0, 3).map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                  <Link href={`/projects/${proj.id}`}>
                    <button className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 transition-all">
                      Open Command Center →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollReveal>
    </Layout>
  );
};

export default ProjectsListPage;
