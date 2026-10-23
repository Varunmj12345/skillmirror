import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  { id: 'skill_labs', label: '🎓 Guided Skill Labs' },
  { id: 'gaps', label: '🎯 My Gap Challenges' },
  { id: 'freelancer', label: '⚡ Freelancer Live Challenges' },
  { id: 'Backend Architecture', label: 'Backend & Systems' },
  { id: 'Frontend Engineering', label: 'Frontend & UI' },
  { id: 'Fullstack MVP', label: 'Full-Stack Apps' },
  { id: 'AI & Data Science', label: 'AI & Machine Learning' },
  { id: 'Cloud & DevOps', label: 'Cloud & DevOps' },
  { id: 'High-Throughput / Caching', label: 'Distributed Systems' },
];

// Category tabs that filter by problem source instead of domain category.
const SOURCE_TABS: Record<string, string> = {
  skill_labs: 'COURSERA_LAB',
  gaps: 'AI_GENERATED_PRACTICE',
  freelancer: 'FREELANCER_SCRAPED',
};

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
  const [generatingLab, setGeneratingLab] = useState(false);
  const [labTopic, setLabTopic] = useState('');
  const [syncingFreelancer, setSyncingFreelancer] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState<string | null>(null);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const params: any = {
        complexity: selectedComplexity,
        search: search.trim(),
        ...(SOURCE_TABS[selectedCategory]
          ? { source_type: SOURCE_TABS[selectedCategory] }
          : (selectedCategory !== 'all' ? { category: selectedCategory } : {}))
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

  // Honour the /problems?tab=gaps deep link once, before the first fetch, so we don't race two requests.
  const deepLinkApplied = useRef(false);
  useEffect(() => {
    if (!router.isReady) return;
    if (!deepLinkApplied.current) {
      deepLinkApplied.current = true;
      if (router.query.tab === 'gaps' && selectedCategory !== 'gaps') {
        setSelectedCategory('gaps');
        return;
      }
    }
    loadChallenges();
  }, [router.isReady, selectedCategory, selectedComplexity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadChallenges();
  };

  const handleSyncFreelancer = async () => {
    try {
      setSyncingFreelancer(true);
      await problemService.syncFreelancerChallenges();
      setSelectedCategory('freelancer');
      await loadChallenges();
    } catch (err) {
      console.error('Failed to sync Freelancer challenges:', err);
    } finally {
      setSyncingFreelancer(false);
    }
  };

  const handleGenerateGapChallenge = async () => {
    try {
      setGeneratingGap(true);
      setGeneratedSuccess(null);
      const res: any = await problemService.generateGapChallenge({
        gap_skills: ['Distributed Caching', 'Kafka Architecture', 'Performance Optimization'],
        difficulty: selectedComplexity === 'all' ? 'intermediate' : selectedComplexity
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

  const handleGenerateSkillLab = async (customTopic?: string) => {
    try {
      setGeneratingLab(true);
      setGeneratedSuccess(null);
      const topicToUse = (customTopic ?? labTopic).trim() || search.trim() || 'REST API Rate Limiting';
      const res: any = await problemService.generateSkillLab({
        topic: topicToUse,
        category: selectedCategory,
        difficulty: selectedComplexity === 'all' ? 'beginner' : selectedComplexity,
      });
      const data = res?.data || res;
      setSelectedCategory('skill_labs');
      await loadChallenges();
      if (data?.title) {
        setGeneratedSuccess(`Guided Skill Lab Ready: ${data.title}`);
      }
    } catch (err) {
      console.error('Failed to generate Guided Skill Lab:', err);
    } finally {
      setGeneratingLab(false);
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
        return 'bg-rose-950/40 text-rose-400 border-rose-800/60';
      case 'intermediate':
        return 'bg-amber-950/40 text-amber-400 border-amber-800/60';
      default:
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';
    }
  };

  return (
    <Layout>
      <Head>
        <title>Practice Problems • SkillMirror Core</title>
        <meta name="description" content="Solve interactive industry-grade challenges and take autonomous AI assessments." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-07"
        section="AI PRACTICE & ASSESSMENTS"
        title="PRACTICE PROBLEMS"
        subtitle="Solve real-world scenario challenges, submit your code or repositories, and receive instant autonomous multi-dimensional AI grading."
        badge="AUTONOMOUS AI GRADER"
        badgeVariant="outline-amber"
        bulletVariant="amber"
        glowColor="amber"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleGenerateSkillLab()}
              disabled={generatingLab}
              className="px-3.5 py-2.5 bg-zinc-900 border border-cyan-400/50 hover:bg-cyan-400 hover:text-black text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <i className={`fa-solid ${generatingLab ? 'fa-spinner fa-spin' : 'fa-graduation-cap'} text-xs`} />
              <span>{generatingLab ? 'Scraping & Building Lab...' : 'Guided Skill Lab'}</span>
            </button>

            <button
              onClick={handleSyncFreelancer}
              disabled={syncingFreelancer}
              className="px-3.5 py-2.5 bg-zinc-900 border border-amber-400/50 hover:bg-amber-400 hover:text-black text-amber-400 font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <i className={`fa-solid ${syncingFreelancer ? 'fa-spinner fa-spin' : 'fa-bolt'} text-xs`} />
              <span>{syncingFreelancer ? 'Scraping Freelancer...' : 'Sync Freelancer'}</span>
            </button>

            <button
              onClick={handleGenerateGapChallenge}
              disabled={generatingGap}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <i className={`fa-solid ${generatingGap ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} text-xs`} />
              <span>{generatingGap ? 'Synthesizing...' : 'Generate Gap Challenge'}</span>
            </button>

            <Link href="/problems/history">
              <button className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center gap-2">
                <i className="fa-solid fa-chart-line text-xs text-emerald-400" />
                <span>Assessment History</span>
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
            color="amber"
          />
          <PageStatChip
            label="Intermediate Track"
            value={stats.intermediateCount}
            icon="fa-layer-group"
            color="zinc"
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
        <div className="mb-8 p-5 bg-zinc-900/90 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
              <i className="fa-solid fa-sparkles" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400" />
                Personalized AI Assessment Recommendations
              </h3>
              <p className="text-xs font-sans text-zinc-400 mt-0.5">
                Challenges calibrated to your identified skill gaps to accelerate your career readiness.
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateGapChallenge}
            disabled={generatingGap}
            className="px-4 py-2 border border-zinc-700 bg-zinc-950 text-amber-400 hover:bg-amber-400 hover:text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors flex-shrink-0"
          >
            Launch Targeted Assessment →
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search challenges by skill, title, architecture..."
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

          {/* Domain Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase whitespace-nowrap transition-colors border ${
                  selectedCategory === cat.id
                    ? 'bg-amber-400/10 text-amber-400 border-amber-400/40'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Coursera-Style Guided Skill Lab Synthesizer Bar */}
          {selectedCategory === 'skill_labs' && (
            <div className="p-4 bg-zinc-900/95 border border-cyan-500/30 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                    <i className="fa-solid fa-graduation-cap text-[10px]" />
                    <span>COURSERA-STYLE GUIDED SKILL LABS • WEB-SCRAPED CURRICULUM INSPIRATION</span>
                  </div>
                  <p className="text-xs font-sans text-zinc-400 mt-0.5">
                    Bite-sized (~15–20 min) hands-on mini-assignments with step-by-step tasks and starter code. Enter any skill topic to scrape live course syllabi and synthesize a custom practice lab.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="text"
                    value={labTopic}
                    onChange={(e) => setLabTopic(e.target.value)}
                    placeholder="e.g. React Hooks, SQL Joins, JWT Auth..."
                    className="px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-400 w-56 sm:w-64"
                  />
                  <button
                    type="button"
                    onClick={() => handleGenerateSkillLab()}
                    disabled={generatingLab}
                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <i className={`fa-solid ${generatingLab ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} text-xs`} />
                    <span>{generatingLab ? 'Synthesizing...' : 'Generate Lab'}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Quick Topics:</span>
                {['Sliding Window Rate Limiter', 'React Debounce Hook', 'SQL Aggregation & Joins', 'JWT Token Validator', 'Python Data Cleaning', 'RAG Cosine Similarity'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    disabled={generatingLab}
                    onClick={() => {
                      setLabTopic(t);
                      handleGenerateSkillLab(t);
                    }}
                    className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 hover:border-cyan-400/50 text-[10px] font-mono text-zinc-300 hover:text-cyan-400 transition-colors"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {generatedSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
              <span>✓ {generatedSuccess}</span>
              <button onClick={() => setGeneratedSuccess(null)} className="text-zinc-400 hover:text-white text-[10px] uppercase">Dismiss</button>
            </div>
          )}
        </div>

        {/* Challenge Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="!h-[240px]" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/80 border border-zinc-800">
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <i className="fa-solid fa-code text-lg" />
            </div>
            <h3 className="text-sm font-mono font-bold text-white mb-1">No Practice Challenges Found</h3>
            <p className="text-xs text-zinc-400 mb-4">Try adjusting your filters, generate a Guided Skill Lab, or sync challenges from Freelancer.com.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleGenerateSkillLab()}
                disabled={generatingLab}
                className="px-3.5 py-2 bg-zinc-950 border border-cyan-400/50 hover:bg-cyan-400 hover:text-black text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                <i className={`fa-solid ${generatingLab ? 'fa-spinner fa-spin' : 'fa-graduation-cap'} text-xs`} />
                <span>{generatingLab ? 'Synthesizing...' : 'Generate Guided Skill Lab'}</span>
              </button>
              <button
                onClick={handleSyncFreelancer}
                disabled={syncingFreelancer}
                className="px-4 py-2 bg-amber-400 text-black hover:bg-amber-300 font-mono font-bold text-xs uppercase tracking-wider transition-colors"
              >
                {syncingFreelancer ? 'Scraping...' : 'Sync Freelancer Challenges'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((prob) => {
              const skills = Array.isArray(prob.required_skills_list)
                ? prob.required_skills_list
                : (prob.required_skills_list as any)?.skills || ['Architecture', 'Logic'];

              return (
                <div
                  key={prob.id}
                  className="bg-zinc-900/90 border border-zinc-800 p-5 hover:border-zinc-700 transition-colors flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${getDifficultyBadge(prob.complexity)}`}>
                          [ {prob.complexity || 'Intermediate'} ]
                        </span>
                        {prob.source_type === 'FREELANCER_SCRAPED' && (
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-amber-950/50 text-amber-400 border border-amber-800/80 flex items-center gap-1">
                            <i className="fa-solid fa-bolt text-[8px]" />
                            <span>FREELANCER</span>
                          </span>
                        )}
                        {prob.source_type === 'COURSERA_LAB' && (
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-cyan-950/50 text-cyan-400 border border-cyan-800/80 flex items-center gap-1">
                            <i className="fa-solid fa-graduation-cap text-[8px]" />
                            <span>GUIDED LAB</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {prob.budget && (
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-zinc-950 px-1.5 py-0.5 border border-zinc-800">
                            ${prob.budget}
                          </span>
                        )}
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 flex items-center gap-1">
                          <span className="w-1 h-1 bg-emerald-400" />
                          +150 XP
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-mono font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
                      {prob.title}
                    </h3>

                    <p className="text-xs font-sans text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                      {prob.description}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {skills.slice(0, 3).map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400"
                        >
                          {s}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono text-zinc-500">
                          +{skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                      <i className="fa-regular fa-clock text-[9px]" />
                      <span>{prob.source_type === 'COURSERA_LAB' ? '~15-20 mins' : '~45 mins'}</span>
                    </span>

                    <Link href={`/problems/${prob.id}`}>
                      <button className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-300 group-hover:border-amber-400/60 group-hover:text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5">
                        <span>{prob.source_type === 'COURSERA_LAB' ? 'Start Guided Lab' : 'Launch Assessment'}</span>
                        <i className="fa-solid fa-arrow-right text-[10px]" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CyberPageShell>
    </Layout>
  );
};

export default AIPracticeArenaPage;
