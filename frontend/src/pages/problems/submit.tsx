import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { problemService } from '../../services/problemService';
import { ScrollReveal } from '../../components/motion/ScrollReveal';

const SubmitProblemPage: React.FC = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    source_type: 'COMPANY',
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
    required_skills_input: 'Python, Django, React'
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
      if (data?.problem?.id) {
        router.push(`/problems/${data.problem.id}`);
      } else {
        router.push('/problems');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit problem. Please check required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Submit Real-World Problem • SkillMirror</title>
      </Head>

      <ScrollReveal className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/problems" className="hover:text-cyan-400">Real-World Problems</Link>
          <i className="fa-solid fa-chevron-right text-[10px]" />
          <span className="text-slate-200 font-bold">Submit New Problem</span>
        </div>

        <div className="sm-glass p-8 lg:p-10 rounded-3xl border border-white/10 space-y-8">
          <div className="space-y-2 border-b border-white/5 pb-6">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">Problem Intelligence Engine</span>
            <h1 className="text-3xl font-black text-white">Submit Problem Challenge</h1>
            <p className="text-sm text-slate-400">
              Submit a real-world problem statement from your organization, or generate an AI practice challenge for student developers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2 sm:col-span-2">
                <label className="sm-label">Problem Source Classification *</label>
                <select
                  name="source_type"
                  value={form.source_type}
                  onChange={handleChange}
                  className="sm-input px-4 py-3 font-bold text-cyan-300"
                >
                  <option value="REAL_WORLD_ORGANIZATION">Real-World Organization</option>
                  <option value="COMPANY">Private Company</option>
                  <option value="STARTUP">Startup</option>
                  <option value="HOSPITAL">Hospital / Healthcare Facility</option>
                  <option value="NGO">NGO / Non-Profit</option>
                  <option value="GOVERNMENT_PUBLIC">Government / Public Body</option>
                  <option value="COMMUNITY">Community Organization</option>
                  <option value="STUDENT_SUBMITTED">Student / Peer Submitted</option>
                  <option value="AI_GENERATED_PRACTICE">AI-Generated Practice Project (Learning Only)</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="sm-label">Problem Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Hospital OPD Patient Registration & Doctor Appointment System"
                  value={form.title}
                  onChange={handleChange}
                  className="sm-input px-4 py-3 font-bold text-white"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="sm-label">Detailed Original Problem Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Explain the operational bottlenecks, user friction, and manual workflows..."
                  value={form.description}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="sm-label">Problem Owner / Requester Name</label>
                <input
                  type="text"
                  name="problem_owner_name"
                  placeholder="e.g. Dr. A. Sharma / Alex Mercer (Lead Engineer)"
                  value={form.problem_owner_name}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="sm-label">Organization Name</label>
                <input
                  type="text"
                  name="organization_name"
                  placeholder="e.g. City General Hospital / HealthTech Corp"
                  value={form.organization_name}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="sm-label">Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  placeholder="owner@organization.com"
                  value={form.contact_email}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="sm-label">Industry Sector</label>
                <input
                  type="text"
                  name="industry"
                  placeholder="e.g. Healthcare, Agriculture, Commerce"
                  value={form.industry}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="sm-label">Expected Outcome & Deliverable Goals</label>
                <textarea
                  name="expected_outcome"
                  rows={2}
                  placeholder="Describe expected outcome (e.g. Patient can register, book appointments, view doctor availability)..."
                  value={form.expected_outcome}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="sm-label">Required Tech Stack (comma separated)</label>
                <input
                  type="text"
                  name="required_skills_input"
                  placeholder="e.g. Python, Django, React, PostgreSQL, REST API"
                  value={form.required_skills_input}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="sm-btn-primary py-4 px-8 !text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {submitting ? 'Analyzing & Synthesizing Requirement Spec...' : 'Submit & Synthesize Requirement Spec →'}
              </button>
            </div>
          </form>
        </div>
      </ScrollReveal>
    </Layout>
  );
};

export default SubmitProblemPage;
