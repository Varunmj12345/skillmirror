import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import LiveInterviewSystem from '../../components/Interview/LiveInterviewSystem';
import { interviewService } from '../../services/interviewService';
import { CyberPageShell } from '../../components/CyberPageShell';

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
            <div className="flex items-center justify-center min-h-[60vh] text-zinc-500 font-mono uppercase tracking-wider text-xs">
                {id ? 'INITIALIZING LIVE AI PROCTOR ENVIRONMENT...' : 'REDIRECTING TO PARAMETER COMPILER...'}
            </div>
        </Layout>
    );

    return (
        <Layout>
            <Head>
                <title>Live AI Interview • SkillMirror OS</title>
            </Head>

            <CyberPageShell
                moduleCode="INT-LIVE"
                section="AI CAREER ENGINE"
                badge="STREAM: ACTIVE"
                title="LIVE PROCTOR SESSION"
                subtitle="Real-time multi-modal audio transcription, behavioral telemetry, and adaptive questioning."
            />

            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-8">
                <LiveInterviewSystem
                    interviewId={parseInt(id as string)}
                    role={interviewData.role}
                    level={interviewData.experience_level}
                    skills={interviewData.questions.map((q: any) => q.category)}
                    onComplete={handleComplete}
                />

                <div className="grid md:grid-cols-3 gap-4 pt-4">
                    <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-2">
                            <i className="fa-solid fa-microphone-lines text-amber-400 text-xs"></i>
                        </div>
                        <h4 className="text-zinc-200 font-mono font-bold text-xs uppercase tracking-wider">Voice Recognition</h4>
                        <p className="text-xs font-mono text-zinc-400 leading-relaxed">Continuous STT parsing captures architectural concepts, trade-offs, and terminology accuracy.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-2">
                            <i className="fa-solid fa-video text-amber-400 text-xs"></i>
                        </div>
                        <h4 className="text-zinc-200 font-mono font-bold text-xs uppercase tracking-wider">Behavioral Tracking</h4>
                        <p className="text-xs font-mono text-zinc-400 leading-relaxed">Vision heuristics track visual composure, engagement cadence, and speech hesitation markers.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-2">
                            <i className="fa-solid fa-brain text-amber-400 text-xs"></i>
                        </div>
                        <h4 className="text-zinc-200 font-mono font-bold text-xs uppercase tracking-wider">Adaptive Ingestion</h4>
                        <p className="text-xs font-mono text-zinc-400 leading-relaxed">The proctor dynamically generates subsequent questions based on your demonstrated technical depth.</p>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default withAuth(LiveInterviewPage);
