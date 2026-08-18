import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { problemService, Problem } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal } from '../../components/motion/ScrollReveal';

const ProblemsDiscoveryPage: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  const loadProblems = async () => {
    try {
      setLoading(true);
      const res: any = await problemService.getProblems({
        category: selectedCategory,
        complexity: selectedComplexity,
        industry: selectedIndustry,
        search
      });
      setProblems(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [selectedCategory, selectedComplexity, selectedIndustry]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProblems();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Validated Problem</span>;
      case 'potential':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">Potential Problem</span>;
      case 'under_analysis':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Under Analysis</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-white/5">Submitted</span>;
    }
  };

  return (
    <Layout>
      <Head>
        <title>Real-World Problems Discovery • SkillMirror</title>
      </Head>

      <ScrollReveal className="space-y-10">
        {/* Header Terminal */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">Problem Intelligence Engine</span>
            </div>
            <h1 className="sm-h1 !text-4xl lg:!text-5xl">Real-World Problems</h1>
            <p className="sm-body-text mt-2 max-w-2xl">
              Solve validated real-world challenges from startups, hospitals, NGOs, and industry partners. Convert project evidence into career opportunities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/problems/matches">
              <button className="px-5 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-xs hover:bg-indigo-500/20 transition-all flex items-center gap-2">
                <i className="fa-solid fa-bullseye" />
                <span>My Skill Matches</span>
              </button>
            </Link>
            <Link href="/problems/submit">
              <button className="sm-btn-primary py-3 px-6 !text-xs uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-plus" />
                <span>Submit Problem</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="sm-glass p-6 rounded-3xl space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <input
                type="text"
                placeholder="Search real-world problems by keywords, tech stack, or industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs rounded-xl hover:bg-cyan-500/30 transition-all">
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-4 pt-2 border-t border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Healthcare Tech">Healthcare Tech</option>
                <option value="AgriTech">AgriTech</option>
                <option value="EdTech">EdTech</option>
                <option value="Retail & Small Business">Retail & Business</option>
                <option value="CivicTech & Gov">CivicTech & Gov</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">Complexity:</span>
              <select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Problems Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="!h-[240px]" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="sm-glass p-12 text-center rounded-3xl space-y-4">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-bold text-white">No real-world problems found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              No problems match your filter query. Be the first to submit a problem or clear search filters.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((prob) => (
              <div key={prob.id} className="sm-glass p-6 rounded-3xl flex flex-col justify-between space-y-4 sm-card-hover border border-white/5 hover:border-cyan-500/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                      {prob.category || 'General'}
                    </span>
                    {getStatusBadge(prob.status)}
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                    {prob.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {prob.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-building text-slate-500" />
                      <span className="truncate max-w-[120px]">{prob.organization_name || 'Organization'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-300">
                      <i className="fa-solid fa-clock text-cyan-400" />
                      <span>{prob.estimated_effort_weeks || 4} Weeks</span>
                    </span>
                  </div>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {(prob.required_skills_list || ['Python', 'React']).slice(0, 3).map((sk, idx) => (
                      <span key={idx} className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-white/5">
                        {sk}
                      </span>
                    ))}
                    {(prob.required_skills_list || []).length > 3 && (
                      <span className="text-[10px] text-slate-500">+{prob.required_skills_list.length - 3} more</span>
                    )}
                  </div>

                  <Link href={`/problems/${prob.id}`}>
                    <button className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 font-bold text-xs border border-white/10 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2">
                      <span>View Intelligence Blueprint</span>
                      <i className="fa-solid fa-arrow-right text-[10px]" />
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

export default ProblemsDiscoveryPage;
