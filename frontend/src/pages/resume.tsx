import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { skillService } from '../services/skillService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import ResumeHistoryPanel from '../components/Resume/ResumeHistoryPanel';
import ATSScorePanel from '../components/Resume/ATSScorePanel';
import JobTargetingPanel from '../components/Resume/JobTargetingPanel';
import AIImprovementPanel from '../components/Resume/AIImprovementPanel';
import ExportPanel from '../components/Resume/ExportPanel';
import ResumeBuilderForm, { EMPTY_FORM, SAMPLE_TECH_FORM } from '../components/Resume/ResumeBuilderForm';
import ResumeChoiceScreen from '../components/Resume/ResumeChoiceScreen';
import TemplateGallery from '../components/Resume/TemplateGallery';
import ResumePreview from '../components/Resume/ResumePreview';
import { SkeletonCard } from '../components/motion/Skeleton';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../components/CyberPageShell';

import type { BuilderFormData } from '../components/Resume/ResumeBuilderForm';
import type { TemplateConfig } from '../components/Resume/TemplateGallery';
import apiClient from '../services/apiClient';

type ResumeAnalysis = {
  id: string;
  createdAt: string;
  readinessScore: number;
  jobMatchScore: number;
  skills: { name: string; proficiency: number }[];
  missingSkills: string[];
  breakdown: { label: string; value: number }[];
  aiSuggestions?: string[];
  dreamJob?: string;
};

type Tab = 'analyze' | 'build';

const DEFAULT_TEMPLATE: TemplateConfig = {
  id: 't1',
  name: 'FAANG Standard',
  category: 'ATS-Friendly',
  color: '#2563eb',
  font: 'Inter',
  layout: '1-col',
  accent: '#2563eb',
};

const ResumePage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('analyze');

  // Build mode: choice screen vs interactive wizard
  const [builderMode, setBuilderMode] = useState<'choice' | 'wizard'>('choice');
  const [workspaceLayout, setWorkspaceLayout] = useState<'split' | 'editor' | 'preview'>('split');

  // Analyze tab state
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [atsData, setAtsData] = useState<any>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // Build tab state
  const [formData, setFormData] = useState<BuilderFormData>(EMPTY_FORM);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig>(DEFAULT_TEMPLATE);
  const [extractingProfile, setExtractingProfile] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = (await skillService.getBuilderProfile()) as any;
        if (res.personal_details && (res.personal_details.name || res.personal_details.email)) {
          setHasExistingProfile(true);
          const rawCategorized =
            res.categorized_skills ||
            res.categorizedSkills ||
            res.template_config?.categorizedSkills ||
            res.personal_details?.categorizedSkills;

          const initialCategories =
            rawCategorized && rawCategorized.length > 0
              ? rawCategorized
              : res.skills && res.skills.length > 0
              ? [
                  { category: 'Programming & Languages', skills: res.skills.slice(0, 5) },
                  { category: 'Frameworks & Tools', skills: res.skills.slice(5) },
                ]
              : [
                  { category: 'Programming', skills: [] },
                  { category: 'Frontend', skills: [] },
                  { category: 'Backend & APIs', skills: [] },
                  { category: 'Data & Analytics', skills: [] },
                  { category: 'Tools & Platforms', skills: [] },
                ];

          setFormData({
            personal: res.personal_details,
            summary: res.summary || '',
            skills: res.skills || [],
            categorizedSkills: initialCategories,
            experience: res.experience?.length
              ? res.experience
              : [{ company: '', role: '', duration: '', bullets: [''] }],
            education: res.education?.length
              ? res.education
              : [{ institution: '', degree: '', year: '' }],
            projects: res.projects?.length
              ? res.projects
              : [{ name: '', description: '', tech: '' }],
            certifications: res.certifications?.length
              ? res.certifications
              : [{ name: '', issuer: '', year: '' }],
            achievements: res.achievements || [''],
          });
        }
        if (res.template_config && res.template_config.id) {
          setSelectedTemplate(res.template_config);
        }
      } catch {}
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await skillService.saveBuilderProfile({
        personal_details: {
          ...formData.personal,
          categorizedSkills: formData.categorizedSkills,
        },
        summary: formData.summary,
        skills: formData.skills,
        categorized_skills: formData.categorizedSkills,
        experience: formData.experience,
        education: formData.education,
        projects: formData.projects,
        certifications: formData.certifications,
        achievements: formData.achievements,
        template_config: {
          ...selectedTemplate,
          categorizedSkills: formData.categorizedSkills,
        },
      });
      setHasExistingProfile(true);
      startToast('✓ Resume profile saved successfully');
    } catch {
      startToast('Failed to save profile');
    }
  };

  const handleExportPDF = async () => {
    if (typeof window === 'undefined') return;
    const element = document.getElementById('resume-export-container');
    if (!element) {
      startToast('Error: Resume preview not found');
      return;
    }
    startToast('⚡ Generating ATS-compliant PDF...');
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0,
        filename: `${(formData.personal?.name || 'SkillMirror_Resume').replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: false,
          backgroundColor: '#ffffff',
          scrollY: 0,
          scrollX: 0,
          width: 794,
          windowWidth: 794,
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const },
      };
      await (html2pdf() as any).set(opt).from(element).save();
      startToast('✓ PDF saved to your downloads!');
    } catch (err) {
      console.error(err);
      startToast('Failed to export PDF');
    }
  };

  const handlePrintResume = () => {
    if (typeof window === 'undefined') return;
    const element = document.getElementById('resume-export-container');
    if (!element) {
      startToast('Error: Resume preview not found');
      return;
    }

    startToast('⚡ Preparing Vector Print...');

    // Remove existing print iframe if any
    const existing = document.getElementById('resume-print-iframe');
    if (existing) existing.remove();

    const printIframe = document.createElement('iframe');
    printIframe.id = 'resume-print-iframe';
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((el) => el.outerHTML)
      .join('\n');

    const doc = printIframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${(formData.personal?.name || 'SkillMirror_Resume').replace(/\s+/g, '_')}_Resume</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              width: 100% !important;
              height: 100% !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #resume-export-container {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              background: #ffffff !important;
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
      } catch {
        window.print();
      }
    }, 350);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data: any = await skillService.checkResumeStatus();
        if (data && data.exists) {
          setAnalysis({
            id: 'loaded',
            createdAt: data.created_at,
            readinessScore: data.readiness_score || 75,
            jobMatchScore: 80,
            skills: (data.skills || []).map((s: string) => ({ name: s, proficiency: 85 })),
            missingSkills: [],
            breakdown: data.strength_breakdown || [
              { label: 'Technical', value: 85 },
              { label: 'Keywords', value: 70 },
              { label: 'Structure', value: 95 },
            ],
            aiSuggestions: data.ai_suggestions,
          });
        }
      } catch {}
    };
    fetchStatus();
  }, []);

  const startToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleFile = async (file: File) => {
    setError(null);
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type)) {
      setError('Only PDF and Word documents are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max 5MB.');
      return;
    }

    setUploading(true);
    setAnalyzing(false);
    setProgress(0);

    const iv = setInterval(() => setProgress((p) => (p >= 90 ? p : p + 10)), 120);

    try {
      const data: any = await skillService.uploadResume(file);
      setProgress(100);
      clearInterval(iv);
      setAnalyzing(true);

      const a: ResumeAnalysis = {
        id: data.id || `${Date.now()}`,
        createdAt: new Date().toISOString(),
        readinessScore: data.readiness_score || 75,
        jobMatchScore: 80,
        skills: (data.skills || []).map((s: string) => ({ name: s, proficiency: 85 })),
        missingSkills: [],
        breakdown: data.strength_breakdown?.map((b: any) => ({
          label: b.label,
          value: b.value,
        })) || [
          { label: 'Technical', value: 85 },
          { label: 'Keywords', value: 70 },
          { label: 'Structure', value: 95 },
        ],
        aiSuggestions: data.ai_suggestions,
      };
      setAnalysis(a);
      setAnalyzing(false);
      setHistoryRefresh((n) => n + 1);
      startToast('✓ Resume analyzed successfully');
    } catch (e: any) {
      clearInterval(iv);
      setProgress(0);
      setError(e?.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadAndLoadIntoBuilder = async (file: File) => {
    await handleFile(file);
    try {
      const data = (await skillService.extractProfile()) as any;
      if (data) {
        setFormData(data);
      }
    } catch {}
    setBuilderMode('wizard');
    setTab('build');
  };

  const handleATSScan = async () => {
    setAtsLoading(true);
    try {
      const res = (await apiClient.post('/api/skills/resume/ats-scan/', {
        target_job: analysis?.dreamJob || 'Software Developer',
      })) as any;
      setAtsData(res);
      startToast('✓ ATS Scan complete');
    } catch {
      startToast('ATS scan failed. Please try again.');
    } finally {
      setAtsLoading(false);
    }
  };

  const breakdownData = useMemo(() => {
    if (!analysis) return [];
    return analysis.breakdown.map((b) => ({
      subject: b.label,
      value: b.value,
      fullMark: 100,
    }));
  }, [analysis]);

  const TAB_ITEMS: { key: Tab; label: string; icon: string }[] = [
    { key: 'analyze', label: 'Analyze Resume', icon: 'fa-magnifying-glass-chart' },
    { key: 'build', label: 'Build Resume', icon: 'fa-wand-magic-sparkles' },
  ];

  return (
    <Layout>
      <Head>
        <title>Resume Optimizer & ATS Builder — SkillMirror</title>
      </Head>

      <CyberPageShell
        moduleCode="MOD-03"
        section="AI CAREER ENGINE"
        badge="NEURAL MESH: ACTIVE"
        title="RESUME OPTIMIZER"
        subtitle="AI-powered resume analysis, ATS scoring, interactive live split-view builder, and verified template engine."
        stats={
          <div className="flex flex-wrap gap-2.5 pt-1">
            <PageStatChip
              label="ATS Score"
              value={`${analysis?.readinessScore || 84}%`}
              color="emerald"
              icon="fa-shield-halved"
            />
            <PageStatChip
              label="Job Match"
              value={`${analysis?.jobMatchScore || 80}%`}
              color="cyan"
              icon="fa-bullseye"
            />
            <PageStatChip
              label="Skills Found"
              value={`${analysis?.skills?.length || 12} Skills`}
              color="slate"
              icon="fa-code"
            />
          </div>
        }
      />

      <section className="px-4 sm:px-6 pb-12 max-w-[1440px] mx-auto space-y-6">
        {/* Main Tab Switcher */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/[0.06] rounded-xl w-fit">
          {TAB_ITEMS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                tab === t.key
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-cyan-500/15 dark:border-cyan-500/30 dark:text-cyan-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <i className={`fa-solid ${t.icon} text-[10px]`} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ============ ANALYZE TAB ============ */}
        {tab === 'analyze' && (
          <ScrollReveal className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_1.2fr]">
              {/* Dropzone card */}
              <div className="sm-glass p-5 space-y-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Upload Resume</h2>
                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) void handleFile(f);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
                    dragActive
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleFile(f);
                    }}
                  />
                  <i className="fa-solid fa-file-arrow-up text-blue-600 dark:text-indigo-400 text-2xl mb-3" />
                  <p className="text-sm text-slate-900 dark:text-slate-50 font-medium">
                    Drop resume or click to browse
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    PDF, DOC, DOCX · Max 5MB
                  </p>
                </div>
                {(uploading || analyzing) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      <span>{uploading ? 'Uploading...' : 'Analyzing...'}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-indigo-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                {error && (
                  <div className="p-2 bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-200 text-[10px] rounded-lg">
                    {error}
                  </div>
                )}
              </div>

              {/* Readiness score card */}
              <div className="sm-glass p-5 space-y-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Readiness & Match</h2>
                {!analysis ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Upload and analyze your resume to see:
                    </p>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                      <li>Career readiness</li>
                      <li>Job match</li>
                      <li>Skill alignment</li>
                      <li>Missing skills</li>
                    </ul>
                  </div>
                ) : (
                  <div className="flex gap-6">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg width="128" height="128" className="-rotate-90 absolute">
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          fill="none"
                          stroke="#e2e8f0"
                          className="dark:stroke-slate-800"
                          strokeWidth="8"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={339}
                          strokeDashoffset={339 - (analysis.readinessScore / 100) * 339}
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))',
                            transition: 'stroke-dashoffset 1s ease',
                          }}
                        />
                      </svg>
                      <div className="text-center z-10">
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {analysis.readinessScore}%
                        </div>
                        <div className="text-[8px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                          Ready
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3 pt-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Job Match</span>
                          <span className="text-slate-900 dark:text-slate-100 font-bold">
                            {analysis.jobMatchScore}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 dark:bg-indigo-400 rounded-full"
                            style={{ width: `${analysis.jobMatchScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        Strong base skills detected from your resume.
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 rounded-lg text-[9px] font-black border ${
                            analysis.readinessScore >= 80
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 border-emerald-200'
                              : analysis.readinessScore >= 60
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400 border-amber-200'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400 border-rose-200'
                          }`}
                        >
                          {analysis.readinessScore >= 80
                            ? '✓ Hire-Ready'
                            : analysis.readinessScore >= 60
                            ? '⚡ Good — Improve'
                            : '⚠ Needs Work'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Extracted + Strength Breakdown Radar */}
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1.2fr]">
              <div className="sm-glass p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Skills Extracted</h2>
                  {analysis && (
                    <span className="text-[10px] font-black text-blue-700 dark:text-indigo-400 px-2 py-1 bg-blue-50 dark:bg-indigo-500/10 border border-blue-200 dark:border-indigo-500/20 rounded-lg">
                      {analysis.skills.length} skills
                    </span>
                  )}
                </div>
                {analyzing ? (
                  <div className="flex flex-wrap gap-2">
                    <SkeletonCard className="!h-6 !w-16 !rounded-full" />
                    <SkeletonCard className="!h-6 !w-16 !rounded-full" />
                    <SkeletonCard className="!h-6 !w-16 !rounded-full" />
                  </div>
                ) : !analysis ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    Upload your resume to automatically identify your technical and professional skills.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {analysis.skills.map((s) => (
                        <span
                          key={s.name}
                          className="px-3 py-1 rounded-full text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 hover:border-blue-500/50 transition-all font-mono font-medium"
                        >
                          {s.name} <span className="text-slate-500 dark:text-slate-400">· {s.proficiency}%</span>
                        </span>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1">
                        <i className="fa-solid fa-triangle-exclamation" /> Review your skill gaps
                      </span>
                      <button
                        onClick={() => router.push('/skill-gap')}
                        className="sm-btn-primary text-[10px] py-1.5 px-3"
                      >
                        Go to Roadmap
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="sm-glass p-5 space-y-4 overflow-hidden">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Strength Breakdown</h2>
                <div className="h-56 -mx-4">
                  {analyzing ? (
                    <div className="h-full flex items-center justify-center text-blue-600 dark:text-indigo-400 text-xs font-semibold animate-pulse">
                      Analyzing your resume...
                    </div>
                  ) : analysis ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={breakdownData}>
                        <PolarGrid stroke="#cbd5e1" className="dark:stroke-slate-700" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Radar
                          name="Score"
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.5}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            fontSize: '10px',
                            borderRadius: '8px',
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : error ? (
                    <div className="h-full flex items-center justify-center text-rose-500 text-xs p-4 text-center">
                      We couldn't complete the analysis. Please try analyzing your resume again.
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs p-4 text-center">
                      Upload and analyze your resume to see your strongest career areas.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ATS Score & Job Targeting Cards */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ATSScorePanel data={atsData} loading={atsLoading} onAnalyze={handleATSScan} />
              <JobTargetingPanel />
            </div>

            {/* AI Suggestions + Export row */}
            {analysis && (
              <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <div className="sm-glass p-5 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    AI Optimization Suggestions
                  </h2>
                  {analysis.aiSuggestions && analysis.aiSuggestions.length > 0 ? (
                    <ul className="space-y-2">
                      {analysis.aiSuggestions.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300"
                        >
                          <i className="fa-solid fa-circle-check text-blue-600 dark:text-indigo-400 text-[10px] mt-0.5 shrink-0"></i>
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No optimization suggestions yet.
                    </p>
                  )}
                </div>
                <ExportPanel />
              </div>
            )}

            {/* AI Improvement Panel */}
            <AIImprovementPanel
              skills={analysis?.skills.map((s) => s.name)}
              injections={atsData?.keyword_injections}
              role={atsData?.target_job || analysis?.dreamJob || 'Software Developer'}
            />

            {/* Resume History */}
            <ResumeHistoryPanel
              onView={(entry) => {
                setAnalysis((prev) =>
                  prev ? { ...prev, jobMatchScore: entry.job_match_score } : null
                );
                startToast(`Viewing: ${entry.file_name}`);
              }}
              refreshTrigger={historyRefresh}
            />
          </ScrollReveal>
        )}

        {/* ============ BUILD TAB ============ */}
        {tab === 'build' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Mode 1: Choice Screen */}
            {builderMode === 'choice' ? (
              <ResumeChoiceScreen
                hasExistingData={hasExistingProfile || !!formData.personal.name}
                onStartNew={() => {
                  setFormData(EMPTY_FORM);
                  setBuilderMode('wizard');
                  startToast('Starting fresh resume build');
                }}
                onContinueExisting={() => {
                  setBuilderMode('wizard');
                  startToast('Restored saved resume draft');
                }}
                onUploadResume={handleUploadAndLoadIntoBuilder}
                onLoadSample={() => {
                  setFormData(SAMPLE_TECH_FORM);
                  setBuilderMode('wizard');
                  startToast('✓ Loaded realistic sample tech resume');
                }}
                onBackToAnalyze={() => setTab('analyze')}
              />
            ) : (
              /* Mode 2: Interactive Live Split-View Wizard */
              <div className="space-y-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setBuilderMode('choice')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-arrow-left text-[10px]" />
                      <span>Mode Choice</span>
                    </button>

                    {/* View Layout Toggle */}
                    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      {[
                        { id: 'split', label: 'Split View', icon: 'fa-table-columns' },
                        { id: 'editor', label: 'Editor Only', icon: 'fa-pen-to-square' },
                        { id: 'preview', label: 'Preview Only', icon: 'fa-eye' },
                      ].map((vl) => (
                        <button
                          key={vl.id}
                          onClick={() => setWorkspaceLayout(vl.id as any)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            workspaceLayout === vl.id
                              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-300 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          <i className={`fa-solid ${vl.icon} text-[10px]`} />
                          <span className="hidden sm:inline">{vl.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-floppy-disk text-[11px]" />
                      <span>Save Draft</span>
                    </button>

                    <button
                      onClick={handlePrintResume}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-display font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      title="Download / Save as 100% Vector PDF via Browser"
                    >
                      <i className="fa-solid fa-file-pdf text-[11px]" />
                      <span>Save / Download PDF</span>
                    </button>
                  </div>
                </div>

                {/* Main Workspace: Editor Left + Sticky Live Document Right */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Left Form Editor */}
                  {(workspaceLayout === 'split' || workspaceLayout === 'editor') && (
                    <div
                      className={`${
                        workspaceLayout === 'split' ? 'w-full lg:w-[54%]' : 'w-full'
                      } space-y-6`}
                    >
                      <ResumeBuilderForm
                        value={formData}
                        onChange={setFormData}
                        selectedTemplate={selectedTemplate}
                        onSelectTemplate={setSelectedTemplate}
                        onExportPDF={handlePrintResume}
                        onPrintResume={handlePrintResume}
                        role={analysis?.dreamJob || 'Software Developer'}
                      />
                    </div>
                  )}

                  {/* Right Real-Time Document Canvas */}
                  {(workspaceLayout === 'split' || workspaceLayout === 'preview') && (
                    <div
                      className={`${
                        workspaceLayout === 'split'
                          ? 'w-full lg:w-[46%] lg:sticky lg:top-20'
                          : 'w-full'
                      } space-y-3`}
                    >
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            Real-Time Document Canvas
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                          {selectedTemplate.name} · {selectedTemplate.layout}
                        </span>
                      </div>

                      <div className="max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 bg-slate-100/70 dark:bg-slate-950/80">
                        <ResumePreview data={formData} template={selectedTemplate} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 px-5 py-2.5 rounded-full text-xs text-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          {toast}
        </div>
      )}
    </Layout>
  );
};

export default ResumePage;
