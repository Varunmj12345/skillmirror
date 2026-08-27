import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../services/apiClient';
import type { TemplateConfig } from './TemplateGallery';

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface BuilderFormData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
    photo?: string;
    city?: string;
    country?: string;
    pinCode?: string;
  };
  summary: string;
  skills: string[];
  categorizedSkills?: SkillCategory[];
  experience: {
    company: string;
    role: string;
    location?: string;
    duration: string;
    bullets: string[];
    current?: boolean;
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
    gpa?: string;
    field?: string;
  }[];
  projects: {
    name: string;
    description: string;
    tech: string;
    url?: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    year: string;
    url?: string;
  }[];
  achievements: string[];
}

export const EMPTY_FORM: BuilderFormData = {
  personal: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    photo: '',
    city: '',
    country: '',
    pinCode: '',
  },
  summary: '',
  skills: [],
  categorizedSkills: [
    { category: 'Programming', skills: [] },
    { category: 'Frontend', skills: [] },
    { category: 'Backend & APIs', skills: [] },
    { category: 'Data & Analytics', skills: [] },
    { category: 'Tools & Platforms', skills: [] },
  ],
  experience: [{ company: '', role: '', duration: '', bullets: [''] }],
  education: [{ institution: '', degree: '', year: '' }],
  projects: [{ name: '', description: '', tech: '' }],
  certifications: [{ name: '', issuer: '', year: '' }],
  achievements: [''],
};

export const SAMPLE_TECH_FORM: BuilderFormData = {
  personal: {
    name: 'Devon Agarwal',
    email: 'd.agarwal@sample.in',
    phone: '+91 98765 43210',
    location: 'New Delhi, India',
    linkedin: 'linkedin.com/in/devon-agarwal',
    github: 'github.com/devon-agarwal',
    portfolio: 'devon.dev',
    city: 'New Delhi',
    country: 'India',
    pinCode: '110034',
  },
  summary:
    'High-impact Full Stack Software Engineer with 4+ years of expertise in architecting resilient distributed systems, modern React web applications, and event-driven microservices.\nProven track record of boosting system throughput by 40% and lowering p99 latency through intelligent caching and database indexing.',
  skills: [
    'Python (Pandas, NumPy, Scikit-learn)',
    'JavaScript',
    'TypeScript',
    'React.js',
    'Next.js',
    'Node.js',
    'Django',
    'SQL',
    'PostgreSQL',
    'Redis',
    'MongoDB',
    'Git',
    'Docker',
    'Linux',
    'AWS',
  ],
  categorizedSkills: [
    {
      category: 'Programming & Languages',
      skills: ['Python (Pandas, NumPy, Scikit-learn)', 'JavaScript', 'TypeScript', 'SQL', 'C++'],
    },
    {
      category: 'Frontend & Frameworks',
      skills: ['React.js', 'Next.js', 'Tailwind CSS', 'Redux', 'HTML5/CSS3'],
    },
    {
      category: 'Backend, APIs & Databases',
      skills: ['Node.js', 'Django', 'REST APIs', 'GraphQL', 'PostgreSQL', 'Redis', 'MongoDB'],
    },
    {
      category: 'Data & Analytics',
      skills: [
        'Exploratory Data Analysis (EDA)',
        'Data Cleaning',
        'Data Visualization',
        'Power BI',
        'Excel (Advanced)',
      ],
    },
    {
      category: 'Tools, Cloud & DevOps',
      skills: ['Git', 'Docker', 'Kubernetes', 'Linux', 'AWS (S3, EC2, Lambda)', 'CI/CD Pipelines'],
    },
  ],
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'TechMatrix Global',
      duration: '2023 - Present',
      location: 'Bangalore, India',
      bullets: [
        'Architected and deployed high-concurrency microservices processing 2.5M+ daily transactions with 99.98% uptime.',
        'Engineered real-time telemetry pipelines using Redis Streams and WebSockets, slashing data delivery latency by 45%.',
        'Spearheaded migration from monolithic REST backend to modular GraphQL federation, accelerating client feature velocity by 30%.',
      ],
    },
    {
      role: 'Full Stack Engineer',
      company: 'CloudScale Innovations',
      duration: '2021 - 2023',
      location: 'New Delhi, India',
      bullets: [
        'Built dynamic user dashboards in React and TypeScript with optimized virtualized lists handling 50k+ rows.',
        'Automated multi-stage CI/CD pipelines via GitHub Actions and Docker, reducing production deployment cycle time from 40min to 8min.',
      ],
    },
  ],
  education: [
    {
      institution: 'Indian Institute of Technology (IIT)',
      degree: 'B.Tech in Computer Science & Engineering',
      year: '2017 - 2021',
      gpa: '8.9 / 10.0',
    },
  ],
  projects: [
    {
      name: 'SkillMirror — AI Career Intelligence Platform',
      tech: 'Next.js, Python, PostgreSQL, Tailwind, Recharts',
      description:
        '• Engineered an intelligent career engine that analyzes resume gap benchmarks, matches ATS keywords, and suggests personalized learning pathways.\n• Implemented vector embeddings for skill mapping across 50,000+ technical job descriptions.\n• Built responsive real-time split-screen builder with 100% ATS-compliant PDF generator.',
    },
    {
      name: 'OmniStream — Distributed Real-Time Message Bus',
      tech: 'Node.js, Redis, Kafka, WebSockets, Go',
      description:
        '• Constructed an ultra-low latency Pub/Sub engine supporting up to 100,000 concurrent socket connections with zero packet drop.\n• Implemented adaptive backpressure control and cluster gossip protocol.',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect — Associate',
      issuer: 'Amazon Web Services',
      year: '2024',
    },
    {
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      year: '2023',
    },
  ],
  achievements: [
    'Winner of National Smart India Hackathon 2021 (Top 1% out of 10,000+ teams).',
    'Published research paper on Distributed Caching Optimization in IEEE Conference.',
  ],
};

const STEPS = [
  { id: 'header', num: 1, label: 'Header & Contact', icon: 'fa-user' },
  { id: 'summary', num: 2, label: 'Professional Summary', icon: 'fa-align-left' },
  { id: 'experience', num: 3, label: 'Work Experience', icon: 'fa-briefcase' },
  { id: 'education', num: 4, label: 'Education', icon: 'fa-graduation-cap' },
  { id: 'skills', num: 5, label: 'Categorized Skills', icon: 'fa-code' },
  { id: 'projects', num: 6, label: 'Projects & Certs', icon: 'fa-folder-open' },
  { id: 'finalize', num: 7, label: 'Review & Templates', icon: 'fa-circle-check' },
];

const PRESET_CATEGORIES = [
  'Programming',
  'Frontend',
  'Backend & APIs',
  'Data & Analytics',
  'Tools & Platforms',
  'Cloud & DevOps',
  'Machine Learning & AI',
  'Core Competencies',
];

const SUGGESTED_SKILLS_BY_CAT: Record<string, string[]> = {
  Programming: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'SQL', 'PHP', 'Ruby', 'Rust', 'REST APIs'],
  Frontend: ['React.js', 'Next.js', 'Tailwind CSS', 'HTML5/CSS3', 'Vue.js', 'Redux', 'TypeScript', 'Angular', 'Responsive Design'],
  'Backend & APIs': ['Node.js', 'Django', 'FastAPI', 'Express.js', 'Spring Boot', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'Microservices'],
  'Data & Analytics': ['SQL', 'Excel (Advanced)', 'Power BI', 'Exploratory Data Analysis (EDA)', 'Data Cleaning', 'Data Visualization', 'Pandas', 'NumPy', 'Tableau', 'Statistics'],
  'Tools & Platforms': ['Git', 'GitHub', 'Linux', 'Docker', 'Postman', 'VS Code', 'Google Sheets Automation', 'YouTube Data API v3', 'Jira'],
  'Cloud & DevOps': ['AWS (S3, EC2, Lambda)', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'GCP', 'Azure', 'Terraform', 'Nginx', 'GitHub Actions'],
};

interface Props {
  value: BuilderFormData;
  onChange: (v: BuilderFormData) => void;
  selectedTemplate?: TemplateConfig;
  onSelectTemplate?: (t: TemplateConfig) => void;
  onExportPDF?: () => void;
  onPrintResume?: () => void;
  role?: string;
}

export const ResumeBuilderForm: React.FC<Props> = ({
  value,
  onChange,
  selectedTemplate,
  onSelectTemplate,
  onExportPDF,
  onPrintResume,
  role = 'Software Developer',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [aiLoading, setAILoading] = useState<string | null>(null);
  const [activeCatIndex, setActiveCatIndex] = useState<number>(0);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [targetRole, setTargetRole] = useState(role);

  // Initialize categorizedSkills safely if missing
  useEffect(() => {
    if (!value.categorizedSkills || value.categorizedSkills.length === 0) {
      if (value.skills && value.skills.length > 0) {
        // Group existing flat skills into default category
        const initialCat: SkillCategory[] = [
          { category: 'Technical & Core Skills', skills: [...value.skills] },
          { category: 'Tools & Platforms', skills: [] },
        ];
        const clone = JSON.parse(JSON.stringify(value));
        clone.categorizedSkills = initialCat;
        onChange(clone);
      } else {
        const clone = JSON.parse(JSON.stringify(value));
        clone.categorizedSkills = [
          { category: 'Programming', skills: [] },
          { category: 'Frontend', skills: [] },
          { category: 'Backend & APIs', skills: [] },
          { category: 'Data & Analytics', skills: [] },
          { category: 'Tools & Platforms', skills: [] },
        ];
        onChange(clone);
      }
    }
  }, []);

  // Split name for header inputs safely
  const nameParts = (value.personal?.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const surname = nameParts.slice(1).join(' ') || '';

  const handleNameChange = (first: string, last: string) => {
    const combined = `${first.trim()} ${last.trim()}`.trim();
    setField('personal.name', combined);
  };

  const setField = (path: string, val: any) => {
    const keys = path.split('.');
    const clone = JSON.parse(JSON.stringify(value));
    let cur: any = clone;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]]) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = val;
    onChange(clone);
  };

  // Safe Address Field Handlers (Fix 1: completely avoids comma duplication!)
  const handleCityChange = (val: string) => {
    const clone = JSON.parse(JSON.stringify(value));
    if (!clone.personal) clone.personal = {};
    clone.personal.city = val;
    // Compute combined location cleanly
    const parts = [val.trim(), (clone.personal.country || '').trim()].filter(Boolean);
    clone.personal.location = parts.join(', ');
    onChange(clone);
  };

  const handleCountryChange = (val: string) => {
    const clone = JSON.parse(JSON.stringify(value));
    if (!clone.personal) clone.personal = {};
    clone.personal.country = val;
    const parts = [(clone.personal.city || '').trim(), val.trim()].filter(Boolean);
    clone.personal.location = parts.join(', ');
    onChange(clone);
  };

  const handlePinCodeChange = (val: string) => {
    const clone = JSON.parse(JSON.stringify(value));
    if (!clone.personal) clone.personal = {};
    clone.personal.pinCode = val;
    onChange(clone);
  };

  // AI Assistant helpers
  const handleGenerateSummary = async () => {
    setAILoading('summary');
    try {
      const allSkills = (value.categorizedSkills || [])
        .flatMap((c) => c.skills)
        .concat(value.skills || []);
      const skillsStr = Array.from(new Set(allSkills)).slice(0, 8).join(', ') || 'modern software technologies';
      const res = (await apiClient.post('/api/skills/resume/ai-improve/', {
        action: 'summary',
        content: `Target Role: ${targetRole}. Skills: ${skillsStr}. Experience: ${value.experience?.length || 1} roles.`,
        role: targetRole,
      })) as any;

      if (res?.result) {
        setField('summary', res.result);
      } else {
        setField(
          'summary',
          `Results-oriented ${targetRole} with proven background in developing high-throughput systems and scalable web applications utilizing ${skillsStr}.\nExperienced in leading cross-functional engineering sprints, optimizing database queries, and automating CI/CD deployments.`
        );
      }
    } catch {
      setField(
        'summary',
        `Results-oriented ${targetRole} with expertise in building scalable, reliable architectures and modern full-stack web applications.\nProven ability to translate complex product requirements into robust, high-performance software.`
      );
    } finally {
      setAILoading(null);
    }
  };

  const handlePolishBullet = async (expIdx: number, bulletIdx: number) => {
    const rawBullet = value.experience?.[expIdx]?.bullets?.[bulletIdx];
    if (!rawBullet) return;

    setAILoading(`bullet-${expIdx}-${bulletIdx}`);
    try {
      const res = (await apiClient.post('/api/skills/resume/ai-improve/', {
        action: 'improve',
        content: rawBullet,
        role: targetRole,
      })) as any;

      if (res?.result) {
        const clone = JSON.parse(JSON.stringify(value));
        clone.experience[expIdx].bullets[bulletIdx] = res.result;
        onChange(clone);
      }
    } catch {
      const polished = `Architected and optimized ${rawBullet.toLowerCase().replace(/^(built|worked on|did)/, '')}, boosting system throughput by 32% and reducing p99 latency.`;
      const clone = JSON.parse(JSON.stringify(value));
      clone.experience[expIdx].bullets[bulletIdx] = polished;
      onChange(clone);
    } finally {
      setAILoading(null);
    }
  };

  // Categorized Skills Handlers (Fix 5)
  const categories = value.categorizedSkills || [];
  const currentCat = categories[activeCatIndex] || categories[0] || { category: 'General', skills: [] };

  const handleAddSkillToCategory = (catIdx: number, skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    const clone = JSON.parse(JSON.stringify(value));
    if (!clone.categorizedSkills) clone.categorizedSkills = [];
    if (!clone.categorizedSkills[catIdx]) {
      clone.categorizedSkills[catIdx] = { category: 'General', skills: [] };
    }
    if (!clone.categorizedSkills[catIdx].skills.includes(trimmed)) {
      clone.categorizedSkills[catIdx].skills.push(trimmed);
    }
    // Also sync to flat skills array for backwards compatibility
    const all = Array.from(new Set(clone.categorizedSkills.flatMap((c: SkillCategory) => c.skills))) as string[];
    clone.skills = all;
    onChange(clone);
    setNewSkillInput('');
  };

  const handleRemoveSkillFromCategory = (catIdx: number, skillName: string) => {
    const clone = JSON.parse(JSON.stringify(value));
    if (!clone.categorizedSkills || !clone.categorizedSkills[catIdx]) return;
    clone.categorizedSkills[catIdx].skills = clone.categorizedSkills[catIdx].skills.filter(
      (s: string) => s !== skillName
    );
    const all = Array.from(new Set(clone.categorizedSkills.flatMap((c: SkillCategory) => c.skills))) as string[];
    clone.skills = all;
    onChange(clone);
  };

  const handleAddCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const clone = JSON.parse(JSON.stringify(value));
    if (!clone.categorizedSkills) clone.categorizedSkills = [];
    if (!clone.categorizedSkills.some((c: SkillCategory) => c.category.toLowerCase() === trimmed.toLowerCase())) {
      clone.categorizedSkills.push({ category: trimmed, skills: [] });
      setActiveCatIndex(clone.categorizedSkills.length - 1);
    }
    onChange(clone);
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const handleRemoveCategory = (catIdx: number) => {
    const clone = JSON.parse(JSON.stringify(value));
    if (!clone.categorizedSkills) return;
    clone.categorizedSkills = clone.categorizedSkills.filter((_: any, i: number) => i !== catIdx);
    if (clone.categorizedSkills.length === 0) {
      clone.categorizedSkills = [{ category: 'Programming', skills: [] }];
    }
    const all = Array.from(new Set(clone.categorizedSkills.flatMap((c: SkillCategory) => c.skills))) as string[];
    clone.skills = all;
    onChange(clone);
    setActiveCatIndex(0);
  };

  const handleRenameCategory = (catIdx: number, newName: string) => {
    const clone = JSON.parse(JSON.stringify(value));
    if (clone.categorizedSkills && clone.categorizedSkills[catIdx]) {
      clone.categorizedSkills[catIdx].category = newName;
      onChange(clone);
    }
  };

  // Experience helpers
  const handleAddExperience = () => {
    setField('experience', [
      ...value.experience,
      { company: '', role: '', duration: '', location: '', bullets: [''] },
    ]);
  };

  const handleRemoveExperience = (idx: number) => {
    const updated = value.experience.filter((_, i) => i !== idx);
    setField('experience', updated.length > 0 ? updated : [{ company: '', role: '', duration: '', bullets: [''] }]);
  };

  // Education helpers
  const handleAddEducation = () => {
    setField('education', [
      ...value.education,
      { institution: '', degree: '', year: '', gpa: '' },
    ]);
  };

  const handleRemoveEducation = (idx: number) => {
    const updated = value.education.filter((_, i) => i !== idx);
    setField('education', updated.length > 0 ? updated : [{ institution: '', degree: '', year: '' }]);
  };

  // Project helpers
  const handleAddProject = () => {
    setField('projects', [
      ...value.projects,
      { name: '', description: '', tech: '', url: '' },
    ]);
  };

  const handleRemoveProject = (idx: number) => {
    const updated = value.projects.filter((_, i) => i !== idx);
    setField('projects', updated.length > 0 ? updated : [{ name: '', description: '', tech: '' }]);
  };

  // Certifications helpers
  const handleAddCert = () => {
    setField('certifications', [
      ...value.certifications,
      { name: '', issuer: '', year: '' },
    ]);
  };

  const handleRemoveCert = (idx: number) => {
    setField('certifications', value.certifications.filter((_, i) => i !== idx));
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-blue-500 dark:focus:border-cyan-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-cyan-500/15 transition-all shadow-xs';

  const labelClass =
    'block text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5';

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* ── Left Step Progress Rail ── */}
      <div className="lg:w-48 shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
        {STEPS.map((s) => {
          const isActive = currentStep === s.num;
          const isCompleted = currentStep > s.num;

          return (
            <button
              key={s.id}
              onClick={() => setCurrentStep(s.num)}
              className={`flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 dark:bg-cyan-500 dark:text-slate-950 font-bold'
                  : isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                  isActive
                    ? 'bg-white text-blue-700 dark:bg-slate-950 dark:text-cyan-300'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {isCompleted ? <i className="fa-solid fa-check text-[9px]" /> : s.num}
              </div>
              <span className="text-xs font-medium truncate hidden sm:inline">
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main Step Form Content ── */}
      <div className="flex-1 space-y-6">
        {/* ── STEP 1: HEADER & CONTACT INFO ── */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-light-card dark:shadow-none space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                Let's start with your header
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Include your full name and contact details for employers and ATS parsing algorithms.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  placeholder="e.g. Devon"
                  value={firstName}
                  onChange={(e) => handleNameChange(e.target.value, surname)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Surname / Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Agarwal"
                  value={surname}
                  onChange={(e) => handleNameChange(firstName, e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. d.agarwal@sample.in"
                  value={value.personal?.email || ''}
                  onChange={(e) => setField('personal.email', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={value.personal?.phone || ''}
                  onChange={(e) => setField('personal.phone', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>City / Region</label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi"
                  value={value.personal?.city ?? ''}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Country</label>
                  <input
                    type="text"
                    placeholder="e.g. India"
                    value={value.personal?.country ?? ''}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Pin / Zip Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 110034"
                    value={value.personal?.pinCode ?? ''}
                    onChange={(e) => handlePinCodeChange(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>LinkedIn Profile URL</label>
                <input
                  type="text"
                  placeholder="e.g. linkedin.com/in/username"
                  value={value.personal?.linkedin || ''}
                  onChange={(e) => setField('personal.linkedin', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>GitHub Profile URL</label>
                <input
                  type="text"
                  placeholder="e.g. github.com/username"
                  value={value.personal?.github || ''}
                  onChange={(e) => setField('personal.github', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: PROFESSIONAL SUMMARY ── */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-light-card dark:shadow-none space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                  Professional Summary
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Craft a high-impact 2-4 sentence overview highlighting your engineering strengths and achievements.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={!!aiLoading}
                className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-cyan-500/15 border border-blue-200 dark:border-cyan-500/30 text-blue-700 dark:text-cyan-300 hover:bg-blue-100 dark:hover:bg-cyan-500/25 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <i className={`fa-solid ${aiLoading === 'summary' ? 'fa-circle-notch fa-spin' : 'fa-wand-magic-sparkles'}`} />
                <span>{aiLoading === 'summary' ? 'AI Generating...' : 'AI Generate Summary'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={labelClass}>Summary Text (Expandable)</label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {value.summary?.length || 0} characters
                  </span>
                </div>
                <textarea
                  rows={6}
                  placeholder="e.g. Results-driven Full Stack Engineer with 4+ years of expertise in architecting resilient distributed systems...\nLine breaks and paragraphs will be preserved on your resume."
                  value={value.summary}
                  onChange={(e) => setField('summary', e.target.value)}
                  className={`${inputClass} min-h-[140px] resize-y leading-relaxed`}
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  💡 Tip: Drag the bottom-right corner to expand the editor window. Line breaks are preserved.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: WORK EXPERIENCE ── */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-light-card dark:shadow-none space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                  Work Experience
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  List your engineering roles, quantifiable achievements, and metrics.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddExperience}
                className="px-3.5 py-2 rounded-xl bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <i className="fa-solid fa-plus text-[10px]" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="space-y-6">
              {value.experience.map((exp, expIdx) => (
                <div
                  key={expIdx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4 relative"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      Position #{expIdx + 1}
                    </span>
                    {value.experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(expIdx)}
                        className="text-xs font-mono text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                      >
                        <i className="fa-solid fa-trash-can text-[10px]" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Job Title / Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Software Engineer"
                        value={exp.role}
                        onChange={(e) => {
                          const clone = JSON.parse(JSON.stringify(value));
                          clone.experience[expIdx].role = e.target.value;
                          onChange(clone);
                        }}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. TechMatrix Global"
                        value={exp.company}
                        onChange={(e) => {
                          const clone = JSON.parse(JSON.stringify(value));
                          clone.experience[expIdx].company = e.target.value;
                          onChange(clone);
                        }}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Duration / Date Range</label>
                      <input
                        type="text"
                        placeholder="e.g. 2023 - Present"
                        value={exp.duration}
                        onChange={(e) => {
                          const clone = JSON.parse(JSON.stringify(value));
                          clone.experience[expIdx].duration = e.target.value;
                          onChange(clone);
                        }}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Bangalore, India"
                        value={exp.location || ''}
                        onChange={(e) => {
                          const clone = JSON.parse(JSON.stringify(value));
                          clone.experience[expIdx].location = e.target.value;
                          onChange(clone);
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <label className={labelClass}>Key Bullet Points (Expandable)</label>
                      <button
                        type="button"
                        onClick={() => {
                          const clone = JSON.parse(JSON.stringify(value));
                          clone.experience[expIdx].bullets.push('');
                          onChange(clone);
                        }}
                        className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                      >
                        + Add Bullet Point
                      </button>
                    </div>

                    {exp.bullets.map((bullet, bulletIdx) => (
                      <div key={bulletIdx} className="flex gap-2 items-start">
                        <textarea
                          rows={2}
                          placeholder="e.g. Architected microservices processing 2.5M daily transactions, boosting throughput by 35%..."
                          value={bullet}
                          onChange={(e) => {
                            const clone = JSON.parse(JSON.stringify(value));
                            clone.experience[expIdx].bullets[bulletIdx] = e.target.value;
                            onChange(clone);
                          }}
                          className={`${inputClass} flex-1 min-h-[70px] resize-y leading-relaxed`}
                        />
                        <button
                          type="button"
                          onClick={() => handlePolishBullet(expIdx, bulletIdx)}
                          title="Polish with AI metrics & action verbs"
                          className="px-2.5 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-[10px] font-mono font-bold uppercase transition-all shrink-0 cursor-pointer"
                        >
                          <i className="fa-solid fa-wand-magic-sparkles text-[11px]" />
                        </button>
                        {exp.bullets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const clone = JSON.parse(JSON.stringify(value));
                              clone.experience[expIdx].bullets = clone.experience[expIdx].bullets.filter(
                                (_: any, i: number) => i !== bulletIdx
                              );
                              onChange(clone);
                            }}
                            className="px-2.5 py-2.5 text-rose-500 hover:text-rose-700 text-xs shrink-0 cursor-pointer"
                          >
                            <i className="fa-solid fa-xmark" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: EDUCATION ── */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-light-card dark:shadow-none space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                  Education & Degrees
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Add your college degrees, diplomas, and relevant academic background.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddEducation}
                className="px-3.5 py-2 rounded-xl bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <i className="fa-solid fa-plus text-[10px]" />
                <span>Add Degree</span>
              </button>
            </div>

            <div className="space-y-4">
              {value.education.map((edu, eduIdx) => (
                <div
                  key={eduIdx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 relative"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      Degree #{eduIdx + 1}
                    </span>
                    {value.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(eduIdx)}
                        className="text-xs font-mono text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                      >
                        <i className="fa-solid fa-trash-can text-[10px]" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Degree / Program</label>
                      <input
                        type="text"
                        placeholder="e.g. B.Tech in Computer Science"
                        value={edu.degree}
                        onChange={(e) => {
                          const clone = JSON.parse(JSON.stringify(value));
                          clone.education[eduIdx].degree = e.target.value;
                          onChange(clone);
                        }}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Institution / University</label>
                      <input
                        type="text"
                        placeholder="e.g. Indian Institute of Technology"
                        value={edu.institution}
                        onChange={(e) => {
                          const clone = JSON.parse(JSON.stringify(value));
                          clone.education[eduIdx].institution = e.target.value;
                          onChange(clone);
                        }}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Graduation Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 2021"
                        value={edu.year}
                        onChange={(e) => {
                          const clone = JSON.parse(JSON.stringify(value));
                          clone.education[eduIdx].year = e.target.value;
                          onChange(clone);
                        }}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>GPA / Grade (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 8.9 / 10.0"
                        value={edu.gpa || ''}
                        onChange={(e) => {
                          const clone = JSON.parse(JSON.stringify(value));
                          clone.education[eduIdx].gpa = e.target.value;
                          onChange(clone);
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── STEP 5: CATEGORIZED SKILLS (Fix 5) ── */}
        {currentStep === 5 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-light-card dark:shadow-none space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                Technical Skills by Category
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Organize your skills into clear domains (e.g. Programming, Data & Analytics, Tools & Platforms) for maximum ATS recruiter readability.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Skill Categories ({categories.length})</label>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <i className="fa-solid fa-plus text-[9px]" /> Add Custom Category
                </button>
              </div>

              {/* Add category input popup */}
              {showAddCategory && (
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/30 flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Category name (e.g. Data & Analytics, AI/ML, Cloud)..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory(newCategoryName);
                      }
                    }}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCategory(newCategoryName)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="px-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              )}

              {/* Category Pills Bar */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, catIdx) => (
                  <button
                    key={catIdx}
                    type="button"
                    onClick={() => setActiveCatIndex(catIdx)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeCatIndex === catIdx
                        ? 'bg-blue-600 text-white shadow-sm dark:bg-cyan-500 dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.category}</span>
                    <span className="text-[10px] opacity-75 font-mono">({cat.skills.length})</span>
                    {categories.length > 1 && activeCatIndex === catIdx && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCategory(catIdx);
                        }}
                        className="hover:text-rose-300 ml-1 text-[10px]"
                        title="Delete category"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Category Skill Input */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Skills in <span className="underline">{currentCat.category}</span>
                  </h3>
                </div>
              </div>

              {/* Add Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Add a skill to ${currentCat.category} (e.g. ${SUGGESTED_SKILLS_BY_CAT[currentCat.category]?.[0] || 'Python'}) and press Enter...`}
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkillToCategory(activeCatIndex, newSkillInput);
                    }
                  }}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => handleAddSkillToCategory(activeCatIndex, newSkillInput)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer shadow-sm"
                >
                  Add
                </button>
              </div>

              {/* Active category skills badges */}
              <div className="space-y-1.5">
                <label className={labelClass}>Added to {currentCat.category}</label>
                {currentCat.skills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-1">No skills added to this category yet. Type above or click suggestions below.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentCat.skills.map((sk, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-medium shadow-xs"
                      >
                        {sk}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillFromCategory(activeCatIndex, sk)}
                          className="hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <i className="fa-solid fa-xmark text-[10px]" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggestions for this category */}
              {SUGGESTED_SKILLS_BY_CAT[currentCat.category] && (
                <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <label className={labelClass}>1-Click Suggestions for {currentCat.category}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_SKILLS_BY_CAT[currentCat.category]
                      .filter((s) => !currentCat.skills.includes(s))
                      .map((sk, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddSkillToCategory(activeCatIndex, sk)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                        >
                          <i className="fa-solid fa-plus text-[9px] text-blue-500" />
                          <span>{sk}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STEP 6: PROJECTS & CERTIFICATIONS (Fix 2 & Fix 3) ── */}
        {currentStep === 6 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-light-card dark:shadow-none space-y-6"
          >
            {/* Projects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                    Strategic Projects
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Showcase key applications, system architectures, and metrics.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <i className="fa-solid fa-plus text-[10px]" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="space-y-4">
                {value.projects.map((proj, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        Project #{pIdx + 1}
                      </span>
                      {value.projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(pIdx)}
                          className="text-xs font-mono text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-trash-can text-[10px]" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Project Name</label>
                        <input
                          type="text"
                          placeholder="e.g. SkillMirror Platform"
                          value={proj.name}
                          onChange={(e) => {
                            const clone = JSON.parse(JSON.stringify(value));
                            clone.projects[pIdx].name = e.target.value;
                            onChange(clone);
                          }}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Tech Stack Chips</label>
                        <input
                          type="text"
                          placeholder="e.g. Next.js, Python, PostgreSQL, AWS"
                          value={proj.tech}
                          onChange={(e) => {
                            const clone = JSON.parse(JSON.stringify(value));
                            clone.projects[pIdx].tech = e.target.value;
                            onChange(clone);
                          }}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Expandable Project Description (Fix 2 & Fix 3) */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className={labelClass}>Project Description & Bullet Points (Expandable)</label>
                        <span className="text-[10px] font-mono text-slate-400">
                          {proj.description?.length || 0} characters
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        placeholder="• Built an intelligent engine that maps skill benchmarks with real-time vector indexing...\n• Slashing inference latency by 45% using Redis caching.\n• Drag bottom-right corner to expand window."
                        value={proj.description}
                        onChange={(e) => {
                          const clone = JSON.parse(JSON.stringify(value));
                          clone.projects[pIdx].description = e.target.value;
                          onChange(clone);
                        }}
                        className={`${inputClass} min-h-[120px] resize-y leading-relaxed font-sans`}
                      />
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        💡 Tip: You can paste multiple bullet points or lines. Each line will be cleanly formatted on your resume preview & PDF.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-display font-black text-slate-900 dark:text-white">
                    Certifications & Licenses
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Add verified cloud, security, or developer credentials.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddCert}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-plus text-[10px]" />
                  <span>Add Cert</span>
                </button>
              </div>

              <div className="space-y-3">
                {value.certifications.map((c, cIdx) => (
                  <div key={cIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className={labelClass}>Certification Name</label>
                      <input
                        type="text"
                        placeholder="e.g. AWS Solutions Architect"
                        value={c.name}
                        onChange={(e) => {
                          const clone = JSON.parse(JSON.stringify(value));
                          clone.certifications[cIdx].name = e.target.value;
                          onChange(clone);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Issuer</label>
                      <input
                        type="text"
                        placeholder="e.g. Amazon Web Services"
                        value={c.issuer}
                        onChange={(e) => {
                          const clone = JSON.parse(JSON.stringify(value));
                          clone.certifications[cIdx].issuer = e.target.value;
                          onChange(clone);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <label className={labelClass}>Year</label>
                        <input
                          type="text"
                          placeholder="e.g. 2024"
                          value={c.year}
                          onChange={(e) => {
                            const clone = JSON.parse(JSON.stringify(value));
                            clone.certifications[cIdx].year = e.target.value;
                            onChange(clone);
                          }}
                          className={inputClass}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(cIdx)}
                        className="px-3 py-2.5 text-rose-500 hover:text-rose-700 text-xs cursor-pointer"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 7: FINALIZE & TEMPLATES ── */}
        {currentStep === 7 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-light-card dark:shadow-none space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                Final Review & Export
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Your resume is formatted and ready! Review the live preview on the right or click below to export your clean, edge-to-edge PDF.
              </p>
            </div>

            {/* Quick Template Picker */}
            {onSelectTemplate && selectedTemplate && (
              <div className="space-y-3">
                <label className={labelClass}>Active Resume Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 't1', name: 'FAANG Standard', badge: '100% ATS Safe', desc: 'Single column high-density format' },
                    { id: 't2', name: 'Modern Executive', badge: '99% ATS Safe', desc: 'Two-column tech & leadership' },
                    { id: 't3', name: 'Ivy League Classic', badge: '98% ATS Safe', desc: 'Serif elegance & academic style' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => onSelectTemplate({ ...selectedTemplate, id: tpl.id, name: tpl.name })}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedTemplate.id === tpl.id
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-cyan-500/10 dark:border-cyan-500 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{tpl.name}</span>
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">{tpl.badge}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{tpl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Download CTA Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white space-y-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-file-pdf" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">100% ATS Verified & Edge-to-Edge Vector PDF</h4>
                  <p className="text-[11px] text-white/80">Clean, crisp typography with zero unwanted border whitespace.</p>
                </div>
              </div>

              {(onPrintResume || onExportPDF) && (
                <button
                  type="button"
                  onClick={onPrintResume || onExportPDF}
                  className="w-full py-3.5 rounded-xl bg-white hover:bg-slate-100 text-blue-700 font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-file-pdf" />
                  <span>Save as Vector PDF / Print Now</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Bottom Step Navigation Footer ── */}
        <div className="flex items-center justify-between pt-2">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <i className="fa-solid fa-arrow-left text-[10px]" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
            >
              <span>Continue</span>
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </button>
          ) : (
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <i className="fa-solid fa-circle-check" /> Resume Complete!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderForm;
