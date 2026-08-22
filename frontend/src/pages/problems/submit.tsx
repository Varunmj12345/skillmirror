import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { problemService } from '../../services/problemService';
import { ScrollReveal } from '../../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';
import { useToast } from '../../components/motion/Toast';

const SubmitProblemPage: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    source_type: 'REAL_WORLD_ORGANIZATION',
    problem_owner_name: '',
    organization_name: '',
    org_type: 'company',
    industry: 'Healthcare',
    location: '',
    current_method: '',
    people_affected: 50,
    frequency: 'daily',
    estimated_impact: 'medium',
    required_solution: '',
    expected_outcome: '',
    budget: '',
    contact_email: '',
    required_skills_input: 'Python, Django, React, PostgreSQL'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const skillsArray = form.required_skills_input.split(',').map(s => s.trim()).filter(Boolean);
      const res: any = await problemService.submitProblem({
        ...form,
        people_affected: Number(form.people_affected),
        required_skills_list: skillsArray
      });

      const data = res?.data || res;
      addToast({
        type: 'success',
        title: 'Requirement Synthesized',
        message: 'Problem statement synthesized into structured architecture and MVP scope.'
      });

      if (data?.problem?.id) {
        router.push(`/problems/${data.problem.id}`);
      } else {
        router.push('/owner/dashboard');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: 'Please review all mandatory fields and try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Submit Real-World Requirement • SkillMirror OS</title>
        <meta name="description" content="Submit real-world organizational demands for student developer matching and verified portfolio builds." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-11"
        section="ORGANIZATION & REQUESTER ENGINE"
        title="SUBMIT REAL-WORLD REQUIREMENT"
        subtitle="Publish authentic organizational demands or curated practice challenges. The AI engine automatically parses requirements into verifiable milestones."
        badge="REQUIREMENT INGESTION"
        badgeVariant="outline-cyan"
        bulletVariant="cyan"
        glowColor="cyan"
        actions={
          <Link href="/owner/dashboard">
            <button className="px-4 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2">
              <i className="fa-solid fa-arrow-left text-xs text-cyan-400" />
              <span>Requester Command Center</span>
            </button>
          </Link>
        }
        stats={
          <>
            <PageStatChip label="Parser Mode" value="AUTO-MVP" icon="fa-wand-magic-sparkles" color="cyan" />
            <PageStatChip label="Source Validation" value="VERIFIED ORG" icon="fa-shield-check" color="emerald" />
            <PageStatChip label="Distribution" value="ALL STUDENTS" icon="fa-network-wired" color="amber" />
          </>
        }
      />

      <div className="px-4 sm:px-6 pb-24 max-w-4xl mx-auto space-y-8">
        <ScrollReveal>
          <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-8">
            <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-display font-black text-white">
                  Organizational Demand Specification
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Fields marked with (*) are required for AI milestone synthesis.
                </p>
              </div>
              <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-full text-[10px] font-mono font-black uppercase">
                Step 1 of 1
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* ── Section 1: Classification & Core Statement ── */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-building text-xs" />
                  <span>1. Source Classification & Problem Scope</span>
                </span>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Problem Source Classification *
                    </label>
                    <select
                      name="source_type"
                      value={form.source_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs outline-none cursor-pointer"
                    >
                      <option value="REAL_WORLD_ORGANIZATION">🏢 Real-World Organization / Enterprise</option>
                      <option value="COMPANY">🏢 Private Tech Company</option>
                      <option value="STARTUP">🚀 Tech Startup</option>
                      <option value="HOSPITAL">🏥 Hospital / Healthcare Facility</option>
                      <option value="NGO">🌱 NGO / Non-Profit Initiative</option>
                      <option value="GOVERNMENT_PUBLIC">🏛️ Government / Civic Body</option>
                      <option value="AI_GENERATED_PRACTICE">🤖 AI Practice Challenge (Learning Only)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Requirement Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder="e.g. Real-Time Hospital OPD Patient Flow & Appointment Booking Engine"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Detailed Problem Statement & Current Bottlenecks *
                    </label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      placeholder="Describe the real-world operational bottlenecks, manual delays, and user friction currently experienced..."
                      value={form.description}
                      onChange={handleChange}
                      className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* ── Section 2: Requester & Organization Credentials ── */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-id-badge text-xs" />
                  <span>2. Organization & Requester Credentials</span>
                </span>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Requester Name & Role
                    </label>
                    <input
                      type="text"
                      name="problem_owner_name"
                      placeholder="e.g. Dr. A. Sharma (Chief Medical Officer)"
                      value={form.problem_owner_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Organization / Entity Name
                    </label>
                    <input
                      type="text"
                      name="organization_name"
                      placeholder="e.g. City General Hospital / MedTech Corp"
                      value={form.organization_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      placeholder="owner@organization.com"
                      value={form.contact_email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Industry Sector
                    </label>
                    <input
                      type="text"
                      name="industry"
                      placeholder="e.g. Healthcare Tech, CivicTech, EdTech"
                      value={form.industry}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/60"
                    />
                  </div>
                </div>
              </div>

              {/* ── Section 3: Expected Outcome & Required Stack ── */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-layer-group text-xs" />
                  <span>3. Expected Deliverables & Required Stack</span>
                </span>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Expected Outcome & Deliverable Goals
                    </label>
                    <textarea
                      name="expected_outcome"
                      rows={3}
                      placeholder="e.g. Patients can self-register, select specialist time slots, receive live SMS alerts, and staff can manage doctor schedules..."
                      value={form.expected_outcome}
                      onChange={handleChange}
                      className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/60 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Recommended Tech Stack (comma separated)
                    </label>
                    <input
                      type="text"
                      name="required_skills_input"
                      placeholder="e.g. Python, Django, React, PostgreSQL, REST API"
                      value={form.required_skills_input}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <Link href="/owner/dashboard">
                  <button
                    type="button"
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-all flex items-center gap-2"
                >
                  <i className={`fa-solid fa-wand-magic-sparkles text-xs ${submitting ? 'animate-spin' : ''}`} />
                  <span>{submitting ? 'Synthesizing Architecture...' : 'Submit & Synthesize Requirement →'}</span>
                </button>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </Layout>
  );
};

export default SubmitProblemPage;
