import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { projectService, Project, ProjectTask } from '../../services/projectService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal } from '../../components/motion/ScrollReveal';

const ProjectDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<'mvp' | 'v2' | 'future'>('mvp');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [completing, setCompleting] = useState(false);

  const loadProject = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res: any = await projectService.getProjectById(id as string);
      setProject(res?.data || res);
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

  const handleCompleteProject = async () => {
    if (!project) return;
    try {
      setCompleting(true);
      await projectService.completeProject(project.id, {
        github_url: githubUrl,
        deployment_url: deploymentUrl
      });
      setShowEvidenceModal(false);
      loadProject();
      alert('Congratulations! Your "Evidence of Skill" has been generated and synced into your Resume & Career Digital Twin.');
    } catch (err) {
      console.error('Completion failed:', err);
      alert('Could not complete project.');
    } finally {
      setCompleting(false);
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

  const phaseTasks = (project.tasks || []).filter(t => t.scope_phase === activePhase);

  return (
    <Layout>
      <Head>
        <title>{project.title} • Project Command Center</title>
      </Head>

      <ScrollReveal className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/projects" className="hover:text-cyan-400">My Projects</Link>
          <i className="fa-solid fa-chevron-right text-[10px]" />
          <span className="text-slate-200 font-bold truncate">{project.title}</span>
        </div>

        {/* Header Terminal */}
        <div className="sm-glass p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {project.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-bold">Progress: {project.progress_percentage}%</span>
            </div>

            {project.status !== 'completed' && (
              <button
                onClick={() => setShowEvidenceModal(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                Complete Project & Generate Evidence
              </button>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">{project.title}</h1>
            <p className="text-sm text-slate-300">{project.problem_statement}</p>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500" style={{ width: `${project.progress_percentage}%` }} />
          </div>

          {project.status === 'completed' && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <i className="fa-solid fa-circle-check text-sm" />
                  <span>Project Completed & Evidence Statement Generated</span>
                </div>
                <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-950 text-emerald-300 border border-emerald-500/30">
                  Trust Level: Self-Reported / AI-Assessed
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Your evidence statement has been generated and synced into your Resume Intelligence, Career Digital Twin, and Skill Profile without requiring admin approval.
              </p>
            </div>
          )}
        </div>

        {/* Phased Scope Selector */}
        <div className="flex gap-4 border-b border-white/10 pb-4">
          <button
            onClick={() => setActivePhase('mvp')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              activePhase === 'mvp' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            1. MVP First (Current Scope)
          </button>
          <button
            onClick={() => setActivePhase('v2')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              activePhase === 'v2' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            2. Version 2.0 (Enhanced)
          </button>
          <button
            onClick={() => setActivePhase('future')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              activePhase === 'future' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            3. Future Expansion
          </button>
        </div>

        {/* Tasks Checklist */}
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Task Execution Checklist ({phaseTasks.length})</span>
              <span className="text-xs font-normal text-slate-400">Click task to toggle status</span>
            </h3>

            {phaseTasks.length === 0 ? (
              <div className="sm-glass p-8 text-center rounded-2xl text-slate-400 text-sm">
                No tasks defined for this phase.
              </div>
            ) : (
              phaseTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id, t.is_completed)}
                  className={`sm-glass p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    t.is_completed ? 'bg-emerald-500/5 border-emerald-500/30 opacity-80' : 'border-white/5 hover:border-cyan-500/30'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border mt-0.5 ${
                    t.is_completed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600 bg-slate-900'
                  }`}>
                    {t.is_completed && <i className="fa-solid fa-check text-xs font-black" />}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-bold ${t.is_completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {t.title}
                      </h4>
                      <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {t.mapped_skill_name}
                      </span>
                    </div>

                    {/* Learning Resources */}
                    {t.learning_resources && t.learning_resources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-cyan-400">Recommended Resource:</span>
                        {t.learning_resources.map((res: string, idx: number) => (
                          <a
                            key={idx}
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(res)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-semibold text-slate-300 hover:text-cyan-300 underline flex items-center gap-1"
                          >
                            <i className="fa-brands fa-youtube text-rose-500" />
                            <span>{res}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Sidebar - Blueprint Architecture & Tech Stack */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sm-glass p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-cubes text-cyan-400" />
                <span>Tech Stack & Tech Blueprint</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(project.tech_stack || []).map((tech: string, i: number) => (
                  <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-cyan-300 border border-white/5">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="sm-glass p-6 rounded-3xl space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-diagram-project text-indigo-400" />
                <span>Architecture Plan</span>
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {project.architecture_recommendation || 'Decoupled REST API + Component Frontend Architecture.'}
              </p>
            </div>
          </div>
        </div>

        {/* Evidence Generation Modal */}
        {showEvidenceModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="sm-glass p-8 rounded-3xl max-w-lg w-full space-y-6 border border-emerald-500/30">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-400">Evidence Generation Engine</span>
                <h3 className="text-xl font-bold text-white">Generate Evidence of Skill</h3>
                <p className="text-xs text-slate-400">
                  Provide your code repository and live deployment links to generate a verifiable Evidence Statement.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="sm-label">GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/project-repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="sm-input px-4 py-3"
                  />
                </div>

                <div className="space-y-1">
                  <label className="sm-label">Live Deployment URL</label>
                  <input
                    type="url"
                    placeholder="https://project-demo.onrender.com"
                    value={deploymentUrl}
                    onChange={(e) => setDeploymentUrl(e.target.value)}
                    className="sm-input px-4 py-3"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowEvidenceModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteProject}
                  disabled={completing}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  {completing ? 'Generating...' : 'Confirm & Sync Evidence'}
                </button>
              </div>
            </div>
          </div>
        )}
      </ScrollReveal>
    </Layout>
  );
};

export default ProjectDetailPage;
