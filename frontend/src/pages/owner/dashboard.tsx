import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { projectService, Project } from '../../services/projectService';
import { problemService, Problem } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal } from '../../components/motion/ScrollReveal';

const OwnerDashboardPage: React.FC = () => {
  const router = useRouter();
  const [requirements, setRequirements] = useState<Problem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [decision, setDecision] = useState<'ACCEPT' | 'REQUEST_CHANGES' | 'REJECT'>('ACCEPT');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadOwnerPortal = async () => {
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
    } catch (err: any) {
      console.error('Failed to load owner portal:', err);
      if (err?.response?.status === 403) {
        router.push('/403');
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
      alert('Comments are mandatory when requesting changes or rejecting a project.');
      return;
    }

    try {
      setSubmitting(true);
      await projectService.takeOwnerAction({
        project_id: selectedProject.id,
        decision,
        comments
      });
      alert(`Real-World decision '${decision}' successfully recorded.`);
      setComments('');
      await loadOwnerPortal();
    } catch (err: any) {
      console.error('Owner action failed:', err);
      alert(err?.response?.data?.error || 'Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Problem Owner Portal • SkillMirror</title>
      </Head>

      <ScrollReveal className="space-y-8">
        {/* Header Terminal */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">Isolated Organization Portal</span>
            </div>
            <h1 className="sm-h1 !text-4xl lg:!text-5xl">My Requirements & Projects</h1>
            <p className="sm-body-text mt-2 max-w-2xl">
              Manage your submitted real-world problems and review student solutions for real-world acceptance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 font-bold">
              My Requirements: <span className="text-cyan-300">{requirements.length}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold">
              Related Projects: <span>{projects.length}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            <SkeletonCard className="!h-[350px]" />
            <SkeletonCard className="!h-[350px] md:col-span-2" />
          </div>
        ) : projects.length === 0 ? (
          <div className="sm-glass p-12 rounded-3xl text-center space-y-4 border border-white/5">
            <i className="fa-solid fa-folder-open text-4xl text-slate-600" />
            <h3 className="text-lg font-bold text-white">No Related Student Projects</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You currently have {requirements.length} submitted requirement(s). When students select your requirement and submit solutions, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Projects List (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-2">Projects Submitted for My Review</h3>
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedProject?.id === p.id ? 'bg-cyan-500/10 border-cyan-500/40 text-white' : 'bg-slate-950/60 border-white/5 hover:border-cyan-500/20 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-900 text-cyan-300 border border-white/5">
                      {p.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold truncate">{p.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">Assigned Student: {p.student_email || 'Student'}</p>
                </div>
              ))}
            </div>

            {/* Right Project Inspection & Owner Action Workspace (8 cols) */}
            {selectedProject && (
              <div className="lg:col-span-8 space-y-6">
                <div className="sm-glass p-8 rounded-3xl border border-white/10 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h2 className="text-2xl font-black text-white">{selectedProject.title}</h2>
                      <p className="text-xs text-slate-400 mt-1">Student Developer: <span className="text-cyan-300 font-bold">{selectedProject.student_email}</span></p>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                      Status: {selectedProject.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Submission Links */}
                  {selectedProject.submissions && selectedProject.submissions.length > 0 && (
                    <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/5 space-y-4 text-xs">
                      <h4 className="font-bold text-cyan-400 text-sm flex items-center gap-2">
                        <i className="fa-solid fa-link" />
                        <span>Submitted Student Solution (Version #{selectedProject.submissions[0].version_number})</span>
                      </h4>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400 font-bold">GitHub Code Repository:</span>
                          <a href={selectedProject.submissions[0].github_url} target="_blank" rel="noreferrer" className="block text-cyan-300 font-bold truncate hover:underline">
                            {selectedProject.submissions[0].github_url}
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold">Live Published Application Link:</span>
                          <a href={selectedProject.submissions[0].published_url} target="_blank" rel="noreferrer" className="block text-emerald-400 font-bold truncate hover:underline">
                            {selectedProject.submissions[0].published_url}
                          </a>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold">Documentation & Setup Summary:</span>
                        <p className="text-slate-200 mt-1 leading-relaxed bg-slate-900 p-3 rounded-xl border border-white/5">
                          {selectedProject.submissions[0].documentation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Problem Owner Action Form */}
                  <form onSubmit={handleOwnerDecision} className="space-y-4 pt-4 border-t border-white/10 text-xs">
                    <h4 className="font-bold text-white text-sm">Real-World Owner Acceptance Decision</h4>
                    <p className="text-slate-400 text-[11px]">
                      Accepting this project confirms real-world satisfaction for your organization's submitted requirement.
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                      {(['ACCEPT', 'REQUEST_CHANGES', 'REJECT'] as const).map((dec) => (
                        <button
                          key={dec}
                          type="button"
                          onClick={() => setDecision(dec)}
                          className={`p-3.5 rounded-xl border text-[11px] font-black uppercase transition-all ${
                            decision === dec ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-white/5'
                          }`}
                        >
                          {dec.replace('_', ' ')}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="sm-label">Comments & Specific Feedback (Mandatory for Request Changes or Reject)</label>
                      <textarea
                        rows={4}
                        placeholder="Detail why this solution satisfies your organization's need or what modifications are required..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="sm-input px-4 py-3"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm-btn-primary py-3.5 rounded-xl text-xs font-black uppercase tracking-widest"
                    >
                      {submitting ? 'Submitting Real-World Decision...' : 'Confirm Real-World Acceptance Decision →'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollReveal>
    </Layout>
  );
};

export default OwnerDashboardPage;
