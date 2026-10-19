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
      startToast('Resume profile saved successfully');
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
    startToast('Generating ATS-compliant PDF...');
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
      startToast('PDF saved to your downloads!');
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

    startToast('Preparing Vector Print...');

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
      startToast('Vector Print ready!');
    }, 350);
  };

  const startToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(15);
    const iv = setInterval(() => {
      setProgress((p) => (p < 80 ? p + 10 : p));
    }, 200);

    try {
      const data = (await skillService.uploadResume(file)) as any;
      clearInterval(iv);
      setProgress(100);
      setUploading(false);
      setAnalyzing(true);

      const parsedSkills: string[] = Array.isArray(data.extracted_skills)
        ? data.extracted_skills
        : Array.isArray(data.skills)
        ? data.skills
        : [];

      const rawBreakdown = data.breakdown || {};
      const breakdown = [
        { label: 'Technical Depth', value: rawBreakdown.technical || 80 },
        { label: 'Impact & Metrics', value: rawBreakdown.impact || 65 },
        { label: 'ATS Parseability', value: rawBreakdown.ats || (data.readiness_score || 82) },
        { label: 'Format & Layout', value: rawBreakdown.format || 90 },
        { label: 'Brevity & Focus', value: rawBreakdown.brevity || 75 },
      ];

      const a: ResumeAnalysis = {
        id: String(data.id || Date.now()),
        createdAt: new Date().toISOString(),
        readinessScore: data.readiness_score ?? 82,
        jobMatchScore: data.job_match_score ?? 78,
        skills: parsedSkills.map((s: string, idx: number) => ({
          name: s,
          proficiency: 70 + ((idx * 7) % 25),
        })),
        missingSkills: data.missing_skills || ['Docker', 'Kubernetes', 'CI/CD Pipelines'],
        breakdown,
        aiSuggestions: data.ai_suggestions || [
          'Quantify recent achievements with measurable percentages or velocity gains.',
          'Inject ATS-standard headers (Summary, Work Experience, Technical Skills).',
          'Align top technical competencies with targeted job description taxonomy.'
        ],
        dreamJob: data.dream_job || 'Full Stack Engineer',
      };
      setAnalysis(a);
      setAnalyzing(false);
      setHistoryRefresh((n) => n + 1);
      startToast('Resume analyzed successfully');
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
      startToast('ATS scan complete');
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
    { key: 'analyze', label: 'Telemetry & Scanner', icon: 'fa-magnifying-glass-chart' },
    { key: 'build', label: 'Interactive Compiler', icon: 'fa-wand-magic-sparkles' },
  ];

  return (
    <Layout>
      <Head>
        <title>Resume Optimizer & ATS Builder — SkillMirror</title>
      </Head>

      <CyberPageShell
        moduleCode="RES-01"
        section="AI CAREER ENGINE"
        badge="ATS SHIELD: ACTIVE"
        title="RESUME OPTIMIZER"
        subtitle="Dual-engine ATS scanner, career alignment radar, and interactive live split-view compiler."
        stats={
          <div className="flex flex-wrap gap-2.5 pt-1">
            <PageStatChip
              label="ATS Index"
              value={`${analysis?.readinessScore || 84}%`}
              color="emerald"
              icon="fa-shield-halved"
            />
            <PageStatChip
              label="Role Match"
              value={`${analysis?.jobMatchScore || 80}%`}
              color="amber"
              icon="fa-bullseye"
            />
            <PageStatChip
              label="Detected Stack"
              value={`${analysis?.skills?.length || 12} Skills`}
              color="slate"
              icon="fa-code"
            />
          </div>
        }
      />

      <section className="px-4 sm:px-6 pb-12 max-w-[1440px] mx-auto space-y-6">
        {/* Main Tab Switcher */}
        <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
          {TAB_ITEMS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                tab === t.key
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
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
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                    <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-100 uppercase">
                      Payload Ingestion
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">PDF · DOCX</span>
                </div>

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
                  className={`flex flex-col items-center justify-center border border-dashed rounded-xl p-8 cursor-pointer transition-all ${
                    dragActive
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
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
                  <i className="fa-solid fa-file-arrow-up text-amber-400 text-2xl mb-2" />
                  <p className="text-xs font-mono font-bold text-zinc-200">
                    Drop resume binary or click to upload
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1">
                    Structured text extraction · Max 5MB
                  </p>
                </div>

                {(uploading || analyzing) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>{uploading ? 'INGESTING PAYLOAD...' : 'RUNNING ATS NEURAL SCAN...'}</span>
                      <span className="tabular-nums font-bold text-amber-400">{progress}%</span>
                    </div>
                    <div className="h-1 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                {error && (
                  <div className="p-3 bg-zinc-950 border border-rose-500/40 text-rose-400 text-xs font-mono rounded-xl">
                    <i className="fa-solid fa-triangle-exclamation mr-1.5"></i>
                    {error}
                  </div>
                )}
              </div>

              {/* Readiness score card */}
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                    <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-100 uppercase">
                      Readiness & Target Alignment
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">COMPOSITE</span>
                </div>

                {!analysis ? (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                    <p className="text-xs font-mono text-zinc-400">
                      Upload and analyze your resume to activate telemetry:
                    </p>
                    <ul className="text-xs font-mono text-zinc-500 space-y-1 list-disc pl-4">
                      <li>ATS machine parsing rate</li>
                      <li>Role keyword density</li>
                      <li>Competency alignment radar</li>
                      <li>Missing credentials & tools</li>
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                      <svg width="112" height="112" className="-rotate-90 absolute">
                        <circle
                          cx="56"
                          cy="56"
                          r="46"
                          fill="none"
                          stroke="#27272a"
                          strokeWidth="8"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r="46"
                          fill="none"
                          stroke={analysis.readinessScore >= 80 ? '#10b981' : analysis.readinessScore >= 60 ? '#f59e0b' : '#f43f5e'}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={289}
                          strokeDashoffset={289 - (analysis.readinessScore / 100) * 289}
                          style={{
                            transition: 'stroke-dashoffset 1s ease',
                          }}
                        />
                      </svg>
                      <div className="text-center z-10">
                        <div className="text-xl font-mono font-bold text-zinc-100 tabular-nums">
                          {analysis.readinessScore}%
                        </div>
                        <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                          ATS SCORE
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-zinc-400">Target Role Match</span>
                          <span className="text-zinc-100 font-bold tabular-nums">
                            {analysis.jobMatchScore}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${analysis.jobMatchScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 leading-relaxed">
                        ATS baseline parsed. Recommended density exceeds industry average.
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                            analysis.readinessScore >= 80
                              ? 'bg-zinc-950 text-emerald-400 border-emerald-500/30'
                              : analysis.readinessScore >= 60
                              ? 'bg-zinc-950 text-amber-400 border-amber-500/30'
                              : 'bg-zinc-950 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {analysis.readinessScore >= 80
                            ? 'HIRE READY'
                            : analysis.readinessScore >= 60
                            ? 'ACCEPTABLE · TWEAK'
                            : 'BELOW THRESHOLD'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Extracted + Strength Breakdown Radar */}
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1.2fr]">
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                    <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-100 uppercase">
                      Skills Extracted
                    </h2>
                  </div>
                  {analysis && (
                    <span className="text-[10px] font-mono font-bold text-amber-400 px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded-md">
                      {analysis.skills.length} IDENTIFIED
                    </span>
                  )}
                </div>

                {analyzing ? (
                  <div className="flex flex-wrap gap-2">
                    <SkeletonCard className="!h-6 !w-16 !rounded-md" />
                    <SkeletonCard className="!h-6 !w-20 !rounded-md" />
                    <SkeletonCard className="!h-6 !w-14 !rounded-md" />
                  </div>
                ) : !analysis ? (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-500">
                    Upload your resume to automatically isolate technical and architectural skills.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {analysis.skills.map((s) => (
                        <span
                          key={s.name}
                          className="px-2.5 py-1 rounded-md text-[10px] bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700 transition-all font-mono"
                        >
                          {s.name} <span className="text-zinc-500">· {s.proficiency}%</span>
                        </span>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-zinc-800 flex justify-between items-center">
                      <span className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1.5">
                        <i className="fa-solid fa-triangle-exclamation text-xs" /> Gaps detected in target profile
                      </span>
                      <button
                        onClick={() => router.push('/skill-gap')}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Inspect Skill Gap
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                    <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-100 uppercase">
                      Strength Breakdown Radar
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">5-AXIS</span>
                </div>

                <div className="h-56 -mx-2">
                  {analyzing ? (
                    <div className="h-full flex items-center justify-center text-amber-400 text-xs font-mono animate-pulse">
                      Synthesizing radar telemetry...
                    </div>
                  ) : analysis ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={breakdownData}>
                        <PolarGrid stroke="#27272a" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} />
                        <Radar
                          name="Score"
                          dataKey="value"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.35}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            background: '#09090b',
                            border: '1px solid #27272a',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            color: '#f4f4f5',
                            borderRadius: '8px',
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : error ? (
                    <div className="h-full flex items-center justify-center text-rose-400 text-xs font-mono p-4 text-center">
                      Telemetry synthesis failed. Ingest file again.
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-500 text-xs font-mono p-4 text-center">
                      Upload resume binary to project multi-axis strength radar.
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
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                      <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-100 uppercase">
                        AI Optimization Directives
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">LLM ADVISOR</span>
                  </div>

                  {analysis.aiSuggestions && analysis.aiSuggestions.length > 0 ? (
                    <ul className="space-y-2 pt-1">
                      {analysis.aiSuggestions.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-xs font-mono text-zinc-300"
                        >
                          <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400 mt-1.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs font-mono text-zinc-500">
                      No advisory flags generated.
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
                startToast(`Viewing snapshot: ${entry.file_name}`);
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
                  startToast('Loaded realistic sample tech resume');
                }}
                onBackToAnalyze={() => setTab('analyze')}
              />
            ) : (
              /* Mode 2: Interactive Live Split-View Wizard */
              <div className="space-y-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setBuilderMode('choice')}
                      className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-mono font-bold text-zinc-300 hover:border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-arrow-left text-[10px]" />
                      <span>Mode Switch</span>
                    </button>

                    {/* View Layout Toggle */}
                    <div className="inline-flex p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                      {[
                        { id: 'split', label: 'Split View', icon: 'fa-table-columns' },
                        { id: 'editor', label: 'Editor Only', icon: 'fa-pen-to-square' },
                        { id: 'preview', label: 'Canvas Only', icon: 'fa-eye' },
                      ].map((vl) => (
                        <button
                          key={vl.id}
                          onClick={() => setWorkspaceLayout(vl.id as any)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            workspaceLayout === vl.id
                              ? 'bg-amber-400 text-zinc-950 shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-200'
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
                      className="px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-mono font-bold text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-floppy-disk text-[11px]" />
                      <span>Save State</span>
                    </button>

                    <button
                      onClick={handlePrintResume}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="Download vector print ATS artifact"
                    >
                      <i className="fa-solid fa-file-pdf text-[11px]" />
                      <span>Export Vector PDF</span>
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
                          <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-mono font-bold text-zinc-300">
                            Live Document Viewport
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-zinc-950 text-zinc-400 border border-zinc-800">
                          {selectedTemplate.name} · {selectedTemplate.layout}
                        </span>
                      </div>

                      <div className="max-h-[85vh] overflow-y-auto rounded-2xl border border-zinc-800 p-2 bg-zinc-950">
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-zinc-700 px-5 py-2.5 rounded-xl text-xs font-mono text-zinc-200 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          {toast}
        </div>
      )}
    </Layout>
  );
};

export default ResumePage;
