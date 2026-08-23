import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { problemService, Problem } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal, StaggerChildren } from '../../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', label: 'All Domains' },
  { id: 'Backend Architecture', label: 'Backend & Systems' },
  { id: 'Frontend Engineering', label: 'Frontend & UI' },
  { id: 'Fullstack MVP', label: 'Full-Stack Apps' },
  { id: 'AI & Data Science', label: 'AI & Machine Learning' },
  { id: 'Cloud & DevOps', label: 'Cloud & DevOps' },
  { id: 'High-Throughput / Caching', label: 'Distributed Systems' },
];

const COMPLEXITY_LEVELS = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'expert', label: 'Expert' },
];

const AIPracticeArenaPage: React.FC = () => {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [generatingGap, setGeneratingGap] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState<string | null>(null);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const params: any = {
        category: selectedCategory,
        complexity: selectedComplexity,
        search: search.trim()
      };

      const res: any = await problemService.getProblems(params);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setProblems(list);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [selectedCategory, selectedComplexity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadChallenges();
  };

  const handleGenerateGapChallenge = async () => {
    try {
      setGeneratingGap(true);
      setGeneratedSuccess(null);
      const res: any = await problemService.generateGapChallenge({
        gap_skills: ['Distributed Caching', 'Kafka Architecture', 'Performance Optimization'],
        difficulty: 'intermediate'
      });
      const data = res?.data || res;
      if (data?.id) {
        setGeneratedSuccess(`Challenge Generated: ${data.title}`);
        await loadChallenges();
        router.push(`/problems/${data.id}`);
      }
    } catch (err) {
      console.error('Failed to generate gap challenge:', err);
    } finally {
      setGeneratingGap(false);
    }
  };

  const stats = useMemo(() => {
    const list = problems || [];
    return {
      total: list.length,
      intermediateCount: list.filter(p => p.complexity === 'intermediate').length,
      advancedCount: list.filter(p => p.complexity === 'advanced' || p.complexity === 'expert').length,
    };
  }, [problems]);

  const getDifficultyBadge = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'expert':
      case 'advanced':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30';
      case 'intermediate':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
    }
  };

  return (
    <Layout>
      <Head>
        <title>AI Practice Challenge Arena • SkillMirror</title>
        <meta name="description" content="Solve interactive industry-grade challenges and take autonomous AI assessments." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-07"
        section="AI PRACTICE & ASSESSMENTS"
        title="AI PRACTICE CHALLENGE ARENA"
        subtitle="Solve real-world scenario challenges, submit your code or repositories, and receive instant autonomous multi-dimensional AI grading."
        badge="AUTONOMOUS AI GRADER"
        badgeVariant="outline-cyan"
        bulletVariant="cyan"
        glowColor="cyan"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleGenerateGapChallenge}
              disabled={generatingGap}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
            >
              <i className={`fa-solid ${generatingGap ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} text-xs`} />
              <span>{generatingGap ? 'Synthesizing...' : 'Generate Gap Challenge'}</span>
            </button>

            <Link href="/problems/matches">
              <button className="px-3.5 py-2.5 rounded-xl bg-card border border-border text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-light-sm dark:shadow-none">
                <i className="fa-solid fa-bullseye text-xs text-blue-600 dark:text-cyan-400" />
                <span>Gap Challenge Lab</span>
              </button>
            </Link>

            <Link href="/projects/status-center">
              <button className="px-3.5 py-2.5 rounded-xl bg-card border border-border text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-light-sm dark:shadow-none">
                <i className="fa-solid fa-chart-line text-xs text-emerald-600 dark:text-emerald-400" />
                <span>Scorecards & History</span>
              </button>
            </Link>
          </div>
        }
      >
        {/* KPI Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <PageStatChip
            label="Total Challenges"
            value={stats.total}
            icon="fa-code"
            color="cyan"
          />
          <PageStatChip
            label="Intermediate Track"
            value={stats.intermediateCount}
            icon="fa-layer-group"
            color="amber"
          />
          <PageStatChip
            label="Advanced / Expert"
            value={stats.advancedCount}
            icon="fa-fire"
            color="rose"
          />
          <PageStatChip
            label="AI Auto-Grader"
            value="Active"
            icon="fa-brain"
            color="emerald"
            suffix="✓"
          />
        </div>

        {/* AI Recommendations Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-light-sm dark:shadow-none">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              <i className="fa-solid fa-sparkles" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                Personalized AI Assessment Recommendations
              </h3>
              <p className="text-xs font-sans text-slate-600 dark:text-slate-400 mt-0.5">
                Challenges calibrated to your identified skill gaps to accelerate your career readiness.
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateGapChallenge}
            disabled={generatingGap}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider hover:bg-blue-50 transition-all shadow-sm flex-shrink-0"
          >
            Launch Targeted Assessment →
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search challenges by skill, title, architecture..."
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-light-sm dark:shadow-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-blue-600 transition-colors shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Domain Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="!h-[240px]" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-cyan-400">
              <i className="fa-solid fa-code text-lg" />
            </div>
            <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white mb-1">No Practice Challenges Found</h3>
            <p className="text-xs text-slate-500 mb-4">Try adjusting your filters or generate an on-demand gap challenge.</p>
            <button
              onClick={handleGenerateGapChallenge}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-mono font-bold text-xs uppercase"
            >
              Synthesize New Challenge
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((prob) => {
              const skills = Array.isArray(prob.required_skills_list)
                ? prob.required_skills_list
                : (prob.required_skills_list as any)?.skills || ['Architecture', 'Logic'];

              return (
                <motion.div
                  key={prob.id}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl bg-card border border-border p-5 shadow-light-card dark:shadow-none flex flex-col justify-between group transition-all"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${getDifficultyBadge(prob.complexity)}`}>
                        {prob.complexity || 'Intermediate'}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded">
                        +150 XP
                      </span>
                    </div>

                    <h3 className="text-base font-display font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1 mb-2">
                      {prob.title}
                    </h3>

                    <p className="text-xs font-sans text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {prob.description}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {skills.slice(0, 3).map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[10px] font-mono text-slate-600 dark:text-slate-400"
                        >
                          {s}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                          +{skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                      <i className="fa-regular fa-clock text-[9px]" />
                      <span>~45 mins</span>
                    </span>

                    <Link href={`/problems/${prob.id}`}>
                      <button className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950 transition-all shadow-sm flex items-center gap-1.5">
                        <span>Launch Assessment</span>
                        <i className="fa-solid fa-arrow-right text-[10px]" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CyberPageShell>
    </Layout>
  );
};

export default AIPracticeArenaPage;
