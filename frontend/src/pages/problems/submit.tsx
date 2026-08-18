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
    organization_name: '',
    org_type: 'company',
    industry: 'Healthcare',
    location: '',
    current_method: '',
    people_affected: 50,
    frequency: 'daily',
    estimated_impact: 'medium',
    required_solution: '',
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
      alert('Failed to submit problem. Please check fields.');
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
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">Problem Collector Hub</span>
            <h1 className="text-3xl font-black text-white">Submit Real-World Problem</h1>
            <p className="text-sm text-slate-400">
              Submit a genuine challenge from your organization, startup, hospital, NGO, or institution to get matched with skilled developers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2 sm:col-span-2">
                <label className="sm-label">Problem Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Hospital OPD Appointment & Patient Management System"
                  value={form.title}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="sm-label">Detailed Problem Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Explain the background context, root challenges, and workflow bottlenecks..."
                  value={form.description}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="sm-label">Organization Name</label>
                <input
                  type="text"
                  name="organization_name"
                  placeholder="e.g. City General Hospital / AgriTech Startup"
                  value={form.organization_name}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="sm-label">Organization Type</label>
                <select
                  name="org_type"
                  value={form.org_type}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                >
                  <option value="company">Company</option>
                  <option value="startup">Startup</option>
                  <option value="hospital">Hospital / Healthcare</option>
                  <option value="ngo">NGO / Non-Profit</option>
                  <option value="college">College / University</option>
                  <option value="agriculture">Farmers / Agriculture</option>
                  <option value="local_business">Local Business</option>
                  <option value="govt">Government Organization</option>
                  <option value="student">Student Group</option>
                  <option value="mentor">Mentor / Researcher</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="sm-label">Industry</label>
                <input
                  type="text"
                  name="industry"
                  placeholder="e.g. Healthcare, Agriculture, EdTech"
                  value={form.industry}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="sm-label">Estimated People Affected</label>
                <input
                  type="number"
                  name="people_affected"
                  value={form.people_affected}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="sm-label">Current Method / Existing Workaround</label>
                <textarea
                  name="current_method"
                  rows={2}
                  placeholder="How is this problem currently handled? (e.g. Manual Excel sheets, physical registers)"
                  value={form.current_method}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="sm-label">Required Solution & Desired Features</label>
                <textarea
                  name="required_solution"
                  rows={2}
                  placeholder="Describe the desired digital web/mobile application solution..."
                  value={form.required_solution}
                  onChange={handleChange}
                  className="sm-input px-4 py-3"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="sm-label">Required Skills / Tech Preferences (comma separated)</label>
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
                {submitting ? 'Processing Submission...' : 'Submit & Analyze Problem'}
              </button>
            </div>
          </form>
        </div>
      </ScrollReveal>
    </Layout>
  );
};

export default SubmitProblemPage;
