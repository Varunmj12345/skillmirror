import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { projectService, Project } from '../../services/projectService';
import { problemService } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';

const ProjectsListPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'workspaces' | 'external'>('workspaces');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // External Freelancer Projects state
  const [externalProjects, setExternalProjects] = useState<any[]>([]);
  const [loadingExternal, setLoadingExternal] = useState(false);
  const [externalSearch, setExternalSearch] = useState('');
  const [importingUrl, setImportingUrl] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

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

  const loadExternalProjects = async (searchQuery: string = '') => {
    try {
      setLoadingExternal(true);
      const res: any = await problemService.getExternalProjects({ search: searchQuery.trim(), limit: 25 });
      const list = res?.projects || (Array.isArray(res) ? res : []);
      setExternalProjects(list);
    } catch (err) {
      console.error('Failed to load external projects:', err);
    } finally {
      setLoadingExternal(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (activeTab === 'external' && externalProjects.length === 0) {
      loadExternalProjects();
    }
  }, [activeTab]);

  const handleExternalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadExternalProjects(externalSearch);
  };

  const handleImportToWorkspace = async (item: any) => {
    try {
      setImportingUrl(item.url);
      setImportSuccess(null);
      const res: any = await problemService.importExternalProject({
        title: item.title,
        description: item.description,
        url: item.url,
        budget: item.budget,
        budget_numeric: item.budget_numeric,
        skills: item.skills,
        category: item.category,
        complexity: item.complexity
      });
      const data = res?.data || res;
      if (data?.project_id) {
        setImportSuccess(`Imported "${item.title}" into your workspace!`);
        router.push(`/projects/${data.project_id}`);
      }
    } catch (err) {
      console.error('Failed to import external project:', err);
      alert('Could not import external project into workspace. Please try again.');
    } finally {
      setImportingUrl(null);
    }
  };

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
        <title>Projects & Freelance Gigs • SkillMirror Core</title>
        <meta name="description" content="Manage practical MVP workspaces and explore live external client projects scraped from Freelancer.com." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-08"
        section="PROJECTS & REAL-WORLD PORTFOLIO"
        title="PROJECT WORKSPACES & EXTERNAL GIGS"
        subtitle="Manage practical MVP workspaces or explore external real-world freelance client projects web-scraped live from Freelancer.com."
        badge="EVIDENCE OF SKILL"
        badgeVariant="outline-amber"
        bulletVariant="amber"
        glowColor="amber"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-zinc-900 border border-zinc-800 p-1 flex items-center gap-1">
              <button
                onClick={() => setActiveTab('workspaces')}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                  activeTab === 'workspaces' ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                My Workspaces ({stats.total})
              </button>
              <button
                onClick={() => setActiveTab('external')}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                  activeTab === 'external' ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-bolt text-[10px]" />
                <span>Freelancer Gigs</span>
              </button>
            </div>

            <Link href="/problems">
              <button className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center gap-2">
                <i className="fa-solid fa-code text-xs text-amber-400" />
                <span>Practice Arena</span>
              </button>
            </Link>
          </div>
        }
      >
        {/* KPI Stat Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <PageStatChip label="Active Projects" value={stats.total} icon="fa-diagram-project" color="amber" />
          <PageStatChip label="Avg Completion" value={`${stats.avgProgress}%`} icon="fa-chart-pie" color="zinc" />
          <PageStatChip label="Verified Complete" value={stats.completed} icon="fa-shield-check" color="emerald" />
        </div>

        {activeTab === 'external' ? (
          /* ── EXTERNAL PROJECTS LIVE SCRAPED FROM FREELANCER.COM ── */
          <div className="space-y-6">
            <div className="p-4 bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-mono font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
                  <i className="fa-solid fa-satellite-dish" />
                  Live Web-Scraped Client Projects (Freelancer.com)
                </h3>
                <p className="text-[11px] font-sans text-zinc-400 mt-0.5">
                  Real client requirements directly from <span className="text-zinc-200">https://www.freelancer.com/jobs/</span>. Import any gig into a SkillMirror workspace.
                </p>
              </div>
              <button
                onClick={() => loadExternalProjects(externalSearch)}
                disabled={loadingExternal}
                className="px-3 py-1.5 bg-zinc-950 border border-zinc-700 text-zinc-300 hover:border-amber-400 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5"
              >
                <i className={`fa-solid ${loadingExternal ? 'fa-spinner fa-spin' : 'fa-arrows-rotate'} text-xs text-amber-400`} />
                <span>{loadingExternal ? 'Scraping...' : 'Refresh Feed'}</span>
              </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleExternalSearch} className="flex gap-2">
              <div className="relative flex-1">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
                <input
                  type="text"
                  value={externalSearch}
                  onChange={(e) => setExternalSearch(e.target.value)}
                  placeholder="Filter external projects by skill, keyword (e.g. React, Python, Mobile, DevOps)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-zinc-100 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors"
              >
                Search
              </button>
            </form>

            {loadingExternal ? (
              <div className="grid md:grid-cols-2 gap-6">
                <SkeletonCard className="!h-[240px]" />
                <SkeletonCard className="!h-[240px]" />
              </div>
            ) : externalProjects.length === 0 ? (
              <div className="p-16 bg-zinc-900/80 border border-zinc-800 text-center space-y-3">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-amber-400">
                  <i className="fa-solid fa-magnifying-glass text-lg" />
                </div>
                <h4 className="text-sm font-mono font-bold text-white">No External Projects Found</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">Try clearing your search query or refreshing the scraper feed.</p>
                <button
                  onClick={() => { setExternalSearch(''); loadExternalProjects(''); }}
                  className="px-4 py-2 bg-amber-400 text-black font-mono font-bold text-xs uppercase"
                >
                  Clear Filter
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {externalProjects.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 p-6 transition-colors space-y-4 text-zinc-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-amber-950/40 text-amber-400 border border-amber-800/60 flex items-center gap-1">
                          <i className="fa-solid fa-bolt text-[8px]" />
                          <span>FREELANCER.COM</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-800/60">
                            {item.budget || '$250'}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {item.bids || 'Active'}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-mono font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {item.title}
                      </h3>

                      <p className="text-xs font-sans text-zinc-400 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(item.skills || []).slice(0, 4).map((s: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                      >
                        <span>View on Freelancer</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
                      </a>

                      <button
                        onClick={() => handleImportToWorkspace(item)}
                        disabled={importingUrl === item.url}
                        className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <i className={`fa-solid ${importingUrl === item.url ? 'fa-spinner fa-spin' : 'fa-laptop-code'} text-[10px]`} />
                        <span>{importingUrl === item.url ? 'Importing...' : 'Import to Workspace ⚡'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── MY PERSONAL WORKSPACES ── */
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
                  Launch a validated challenge from the Practice Arena or import an external Freelancer gig to create a project workspace.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <Link href="/problems">
                    <button className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">
                      Browse Practice Directory
                    </button>
                  </Link>
                  <button
                    onClick={() => setActiveTab('external')}
                    className="px-5 py-2.5 bg-zinc-900 border border-zinc-700 hover:border-amber-400 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                  >
                    View Freelancer Gigs
                  </button>
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
        )}
      </CyberPageShell>
    </Layout>
  );
};

export default ProjectsListPage;
