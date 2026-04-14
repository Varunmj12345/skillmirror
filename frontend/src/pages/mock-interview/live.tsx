import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import LiveInterviewSystem from '../../components/Interview/LiveInterviewSystem';
import { interviewService } from '../../services/interviewService';

const LiveInterviewPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;

    const [interviewData, setInterviewData] = useState<any>(null);

    useEffect(() => {
        if (id) {
            interviewService.getDetail(parseInt(id as string)).then((res: any) => {
                setInterviewData(res.data);
            });
        }
    }, [id]);

    const handleComplete = async (report: any) => {
        try {
            await interviewService.finalizeInterview(parseInt(id as string), report);
            router.push(`/mock-interview/result?id=${id}`);
        } catch (err) {
            console.error("Finalization failed", err);
            router.push(`/mock-interview/result?id=${id}`);
        }
    };

    if (!id || !interviewData) return (
        <Layout>
            <div className="flex items-center justify-center min-h-[60vh] text-slate-500 font-bold uppercase tracking-widest text-xs">
                {id ? 'Initializing AI Proctor...' : 'Redirecting to Interview Setup...'}
            </div>
        </Layout>
    );

    return (
        <Layout>
            <Head>
                <title>Live AI Interview • SkillMirror</title>
            </Head>

            <section className="max-w-7xl mx-auto px-4 py-12">
                <header className="mb-12">
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mb-2">Real-time Persistence System</p>
                    <h1 className="text-4xl font-black text-white leading-tight">Interactive AI <br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Interview Session</span></h1>
                </header>

                <LiveInterviewSystem
                    interviewId={parseInt(id as string)}
                    role={interviewData.role}
                    level={interviewData.experience_level}
                    skills={interviewData.questions.map((q: any) => q.category)} // or use from metadata if available
                    onComplete={handleComplete}
                />

                <div className="mt-12 grid md:grid-cols-3 gap-8">
                    <div className="p-6 glass-panel border-white/5 bg-white/[0.02]">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                            <i className="fa-solid fa-microphone-lines text-emerald-400"></i>
                        </div>
                        <h4 className="text-white font-bold mb-2">Voice Recognition</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">Speak naturally. Our AI uses real-time STT to understand your technical explanations and logic.</p>
                    </div>
                    <div className="p-6 glass-panel border-white/5 bg-white/[0.02]">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                            <i className="fa-solid fa-video text-indigo-400"></i>
                        </div>
                        <h4 className="text-white font-bold mb-2">Behavioral Tracking</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">Maintain eye contact. The system analyzes your non-verbal cues to assess confidence and clarity.</p>
                    </div>
                    <div className="p-6 glass-panel border-white/5 bg-white/[0.02]">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                            <i className="fa-solid fa-brain text-purple-400"></i>
                        </div>
                        <h4 className="text-white font-bold mb-2">Adaptive Questioning</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">The AI adjusts based on your answers, diving deeper into specific tech stacks if it detects expertise.</p>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default withAuth(LiveInterviewPage);
