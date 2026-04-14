import React, { useState, useEffect } from 'react';
import { searchVideos, saveVideo, getSavedVideos, updateVideoProgress, getVideoSummary } from '../services/roadmap';
import ProductivityMode from './roadmap/ProductivityMode';

interface Video {
    video_id: string;
    title: string;
    thumbnail_url: string;
    channel_title: string;
    duration?: string;
    is_saved?: boolean;
    is_completed?: boolean;
    summary?: string;
}

interface YouTubeLearningProps {
    skills?: string[];
}

const YouTubeLearning: React.FC<YouTubeLearningProps> = ({ skills = ['Python', 'SQL', 'React', 'Machine Learning'] }) => {
    const [query, setQuery] = useState('');
    const [videos, setVideos] = useState<Video[]>([]);
    const [savedVideos, setSavedVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(false);
    const [summLoading, setSummLoading] = useState<string | null>(null);
    const [summaryErrors, setSummaryErrors] = useState<{ [key: string]: string }>({});
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [tab, setTab] = useState<'search' | 'saved'>('search');

    const [activeSkill, setActiveSkill] = useState<string>('');

    useEffect(() => {
        loadSaved();
    }, []);

    useEffect(() => {
        if (skills && skills.length > 0) {
            const initialSkill = skills[0];
            setActiveSkill(initialSkill);
            handleSearch(initialSkill);
        }
    }, [JSON.stringify(skills)]);

    const loadSaved = async () => {
        try {
            const res: any = await getSavedVideos();
            setSavedVideos(res || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSearch = async (searchTerm: string) => {
        const q = searchTerm || query;
        if (!q.trim()) return;
        setLoading(true);
        setTab('search');
        try {
            // Enhanced query for better quality results
            const enhancedQuery = `${q} tutorial for beginners 2026`;
            const res: any = await searchVideos(enhancedQuery);
            setVideos(res || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToggle = async (video: Video) => {
        const isSaved = !video.is_saved;
        try {
            await saveVideo(video, isSaved);
            setVideos(prev => prev.map(v => v.video_id === video.video_id ? { ...v, is_saved: isSaved } : v));
            loadSaved();
        } catch (e) {
            console.error(e);
        }
    };

    const handleProgressToggle = async (video: Video) => {
        const isCompleted = !video.is_completed;
        try {
            await updateVideoProgress(video.video_id, isCompleted);
            setSavedVideos(prev => prev.map(v => v.video_id === video.video_id ? { ...v, is_completed: isCompleted } : v));
        } catch (e) {
            console.error(e);
        }
    };

    const handleSummarize = async (video: Video) => {
        if (video.summary) return;
        setSummLoading(video.video_id);
        setSummaryErrors(prev => ({ ...prev, [video.video_id]: '' }));
        try {
            const res: any = await getVideoSummary(video.video_id, video.title);
            const summary = res.summary;
            setVideos(prev => prev.map(v => v.video_id === video.video_id ? { ...v, summary } : v));
            setSavedVideos(prev => prev.map(v => v.video_id === video.video_id ? { ...v, summary } : v));
            if (selectedVideo?.video_id === video.video_id) {
                setSelectedVideo({ ...selectedVideo, summary });
            }
        } catch (e: any) {
            console.error(e);
            const msg = e.response?.data?.detail || "Failed to generate summary.";
            setSummaryErrors(prev => ({ ...prev, [video.video_id]: msg }));
        } finally {
            setSummLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                    <i className="fa-brands fa-youtube text-red-500 text-2xl"></i>
                    Video Learning Engine
                </h2>
                <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                    <button onClick={() => setTab('search')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'search' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>Explore</button>
                    <button onClick={() => setTab('saved')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'saved' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>My List ({savedVideos.length})</button>
                </div>
            </div>

            {tab === 'search' && skills.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center mr-2">Top Skills:</span>
                    {skills.slice(0, 4).map(skill => (
                        <button
                            key={skill}
                            onClick={() => {
                                setActiveSkill(skill);
                                handleSearch(skill);
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${activeSkill === skill ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                        >
                            {skill}
                        </button>
                    ))}
                </div>
            )}

            {tab === 'search' && (
                <div className="space-y-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search any topic..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                            className="w-full pl-12 pr-24 py-4 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all group-hover:border-slate-600 shadow-xl"
                        />
                        <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-lg"></i>
                        <button onClick={() => handleSearch(query)} disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-50">
                            {loading ? '...' : 'Search'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading && Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-slate-900 rounded-2xl h-64 border border-slate-800/50"></div>
                        ))}
                        {!loading && videos.map(video => (
                            <div key={video.video_id} className="group bg-slate-950/40 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all">
                                <div className="relative aspect-video cursor-pointer" onClick={() => setSelectedVideo(video)}>
                                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-2xl">
                                            <i className="fa-solid fa-play text-white ml-0.5"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-100 cursor-pointer" onClick={() => setSelectedVideo(video)}>{video.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => handleSummarize(video)}
                                            disabled={summLoading === video.video_id}
                                            title={summaryErrors[video.video_id] || "Generate AI Summary"}
                                            className={`text-[10px] font-bold px-2 py-1 rounded transition-all flex items-center gap-1.5 ${video.summary ? 'text-indigo-400' : summaryErrors[video.video_id] ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 shadow-sm border border-indigo-500/20'}`}
                                        >
                                            {summLoading === video.video_id ? <i className="fa-solid fa-spinner animate-spin"></i> : summaryErrors[video.video_id] ? <i className="fa-solid fa-triangle-exclamation"></i> : <i className="fa-solid fa-bolt"></i>}
                                            {video.summary ? 'AI Summarized' : summaryErrors[video.video_id] ? 'Failed' : 'AI Summary'}
                                        </button>
                                        <button onClick={() => handleSaveToggle(video)} className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${video.is_saved ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                                            <i className={`fa-${video.is_saved ? 'solid' : 'regular'} fa-bookmark text-[11px]`}></i>
                                        </button>
                                    </div>
                                    {video.summary && (
                                        <div className="mt-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl animate-in fade-in duration-500">
                                            <p className="text-[11px] text-slate-300 leading-relaxed italic line-clamp-3">
                                                {video.summary}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'saved' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedVideos.map(video => (
                        <div key={video.video_id} className={`group bg-slate-950 border rounded-2xl overflow-hidden transition-all ${video.is_completed ? 'border-green-500/30 opacity-80' : 'border-slate-800'}`}>
                            <div className="relative aspect-video cursor-pointer" onClick={() => setSelectedVideo(video)}>
                                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                                {video.is_completed && (
                                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-[1px]">
                                        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-2xl flex items-center gap-1.5"><i className="fa-solid fa-check"></i> Finished</div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 space-y-3">
                                <h3 className="line-clamp-2 text-sm font-semibold text-slate-100 leading-snug">{video.title}</h3>
                                <div className="flex items-center justify-between">
                                    <button onClick={() => handleProgressToggle(video)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${video.is_completed ? 'bg-green-600/10 border-green-500/50 text-green-400' : 'border-slate-700 bg-slate-900 text-slate-400'}`}>
                                        {video.is_completed ? 'Completed' : 'Finish'}
                                    </button>
                                    <button onClick={() => handleSaveToggle({ ...video, is_saved: true })} className="text-slate-500 hover:text-red-400 text-xs"><i className="fa-regular fa-trash-can"></i></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/70 animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
                        <button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10"><i className="fa-solid fa-xmark"></i></button>
                        <div className="aspect-video w-full">
                            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${selectedVideo.video_id}?autoplay=1`} title={selectedVideo.title} frameBorder="0" allowFullScreen></iframe>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <h2 className="text-xl font-bold text-slate-50">{selectedVideo.title}</h2>
                            <p className="text-sm text-slate-400 mt-1">{selectedVideo.channel_title}</p>

                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => handleSummarize(selectedVideo)}
                                    disabled={!!selectedVideo.summary || summLoading === selectedVideo.video_id}
                                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${summaryErrors[selectedVideo.video_id] ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'btn-primary'}`}
                                >
                                    {summLoading === selectedVideo.video_id ? <i className="fa-solid fa-spinner animate-spin"></i> : summaryErrors[selectedVideo.video_id] ? <i className="fa-solid fa-triangle-exclamation"></i> : <i className="fa-solid fa-bolt"></i>}
                                    {selectedVideo.summary ? 'Summary Generated' : summaryErrors[selectedVideo.video_id] ? 'Failed - Retry' : 'Generate AI Summary'}
                                </button>
                                {summaryErrors[selectedVideo.video_id] && (
                                    <p className="w-full text-center text-red-400 text-xs mt-2">{summaryErrors[selectedVideo.video_id]}</p>
                                )}
                                <button onClick={() => { handleSaveToggle(selectedVideo); setSelectedVideo(null); }} className="flex-1 bg-slate-900 border border-slate-700 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-bookmark"></i>
                                    {selectedVideo.is_saved ? 'Remove' : 'Save Resource'}
                                </button>
                            </div>

                            {selectedVideo.summary && (
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                                    <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 animate-in zoom-in duration-500">
                                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-brain"></i> AI Key Takeaways
                                        </h4>
                                        <div className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap">
                                            {selectedVideo.summary}
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-indigo-500/10">
                                            <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Interview Insight</h5>
                                            <p className="text-[10px] text-slate-400 italic">"How would you apply {skills[0]} in a low-latency environment?"</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <ProductivityMode />
                                        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Watch Intelligence</h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-[10px] font-bold">
                                                    <span className="text-slate-500">Focus Score</span>
                                                    <span className="text-white">88/100</span>
                                                </div>
                                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 w-[88%] shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                                </div>
                                                <p className="text-[9px] text-slate-500 leading-relaxed">System detected <span className="text-indigo-400">high conceptual density</span>. Recommended: Rewatch 4:20 - 6:15.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YouTubeLearning;
