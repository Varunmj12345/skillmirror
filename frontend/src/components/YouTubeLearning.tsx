import React, { useState, useEffect } from 'react';
import { searchVideos, saveVideo, getSavedVideos, updateVideoProgress, getVideoSummary } from '../services/roadmap';

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

interface AcademicCourse {
    id: string;
    title: string;
    platform: 'MIT OpenCourseWare' | 'IIT NPTEL' | 'Harvard CS50' | 'Stanford Online' | 'Coursera' | 'edX' | 'freeCodeCamp';
    institution: string;
    instructor: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    rating: number;
    skills: string[];
    url: string;
    image: string;
    free: boolean;
    certificate: boolean;
}

const ACADEMIC_COURSES: AcademicCourse[] = [
    {
        id: 'c1',
        title: 'CS50x: Introduction to Computer Science',
        platform: 'Harvard CS50',
        institution: 'Harvard University',
        instructor: 'Prof. David J. Malan',
        level: 'Beginner',
        duration: '12 Weeks (6-18 hrs/wk)',
        rating: 4.9,
        skills: ['C', 'Python', 'SQL', 'Algorithms', 'Data Structures', 'Web Development'],
        url: 'https://cs50.harvard.edu/x/',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&q=80',
        free: true,
        certificate: true
    },
    {
        id: 'c2',
        title: 'MIT 6.006: Introduction to Algorithms & Computational Thinking',
        platform: 'MIT OpenCourseWare',
        institution: 'Massachusetts Institute of Technology (MIT)',
        instructor: 'Prof. Erik Demaine & Dr. Jason Ku',
        level: 'Intermediate',
        duration: '14 Weeks (Full Lectures)',
        rating: 4.9,
        skills: ['Algorithms', 'Dynamic Programming', 'Graph Theory', 'Data Structures', 'Python'],
        url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&q=80',
        free: true,
        certificate: false
    },
    {
        id: 'c3',
        title: 'NPTEL: Data Structures & Algorithms with System Optimization',
        platform: 'IIT NPTEL',
        institution: 'IIT Madras / IIT Kharagpur',
        instructor: 'Prof. Naveen Garg',
        level: 'Intermediate',
        duration: '8 Weeks',
        rating: 4.8,
        skills: ['C++', 'Data Structures', 'Tree Algorithms', 'Complexity Analysis', 'Problem Solving'],
        url: 'https://nptel.ac.in/courses/106102064',
        image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=640&q=80',
        free: true,
        certificate: true
    },
    {
        id: 'c4',
        title: 'CS50P: CS50’s Introduction to Programming with Python',
        platform: 'Harvard CS50',
        institution: 'Harvard University',
        instructor: 'Prof. David J. Malan',
        level: 'Beginner',
        duration: '10 Weeks',
        rating: 4.9,
        skills: ['Python', 'Functions', 'Object-Oriented Programming', 'Testing', 'Libraries'],
        url: 'https://cs50.harvard.edu/python/',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&q=80',
        free: true,
        certificate: true
    },
    {
        id: 'c5',
        title: 'Stanford CS144: Introduction to Computer Networking',
        platform: 'Stanford Online',
        institution: 'Stanford University',
        instructor: 'Prof. Nick McKeown & Prof. Philip Levis',
        level: 'Advanced',
        duration: '10 Weeks',
        rating: 4.8,
        skills: ['TCP/IP', 'Networking Architecture', 'HTTP/3', 'Sockets', 'Distributed Systems'],
        url: 'https://cs144.github.io/',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=640&q=80',
        free: true,
        certificate: false
    },
    {
        id: 'c6',
        title: 'NPTEL: Database Management System & High-Concurrency Architecture',
        platform: 'IIT NPTEL',
        institution: 'IIT Kharagpur',
        instructor: 'Prof. Partha Pratim Das',
        level: 'Intermediate',
        duration: '8 Weeks',
        rating: 4.7,
        skills: ['SQL', 'PostgreSQL', 'Relational Algebra', 'Transactions & ACID', 'Indexing'],
        url: 'https://nptel.ac.in/courses/106105175',
        image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=640&q=80',
        free: true,
        certificate: true
    },
    {
        id: 'c7',
        title: 'MIT 6.036: Introduction to Machine Learning & Deep Neural Nets',
        platform: 'MIT OpenCourseWare',
        institution: 'MIT',
        instructor: 'Prof. Leslie Kaelbling',
        level: 'Advanced',
        duration: '12 Weeks',
        rating: 4.9,
        skills: ['Machine Learning', 'Neural Networks', 'Linear Classifiers', 'Backpropagation', 'PyTorch'],
        url: 'https://openlearninglibrary.mit.edu/courses/course-v1:MITx+6.036+1T2019/about',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=640&q=80',
        free: true,
        certificate: false
    },
    {
        id: 'c8',
        title: 'Full Stack Open: Deep Dive into Modern Web Development',
        platform: 'freeCodeCamp',
        institution: 'University of Helsinki & freeCodeCamp',
        instructor: 'Matti Luukkainen',
        level: 'Intermediate',
        duration: 'Self-Paced (13 Parts)',
        rating: 4.9,
        skills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'Docker', 'CI/CD'],
        url: 'https://fullstackopen.com/en/',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&q=80',
        free: true,
        certificate: true
    }
];

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
    const [tab, setTab] = useState<'search' | 'courses' | 'saved'>('search');
    const [coursePlatformFilter, setCoursePlatformFilter] = useState<string>('All');
    const [activeSkill, setActiveSkill] = useState<string>('');

    useEffect(() => {
        loadSaved();
    }, []);

    // Auto-sync roadmap skills whenever props change
    useEffect(() => {
        if (skills && skills.length > 0) {
            const initialSkill = skills[0];
            setActiveSkill(initialSkill);
            setQuery(initialSkill);
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

    const handleSearch = async (searchTerm?: string) => {
        const q = searchTerm || query || (skills.length > 0 ? skills[0] : 'Programming');
        if (!q.trim()) return;
        setLoading(true);
        setTab('search');
        try {
            const res: any = await searchVideos(q.trim());
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

    const filteredCourses = ACADEMIC_COURSES.filter(c => {
        if (coursePlatformFilter === 'All') return true;
        return c.platform.toLowerCase().includes(coursePlatformFilter.toLowerCase());
    });

    return (
        <div className="space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i className="fa-brands fa-youtube text-red-500 text-2xl" />
                        <span>Roadmap Learning & Courses Hub</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Synchronized with your active career path • Top YouTube tutorials & Elite University Courses
                    </p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <button
                        onClick={() => setTab('search')}
                        className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${tab === 'search' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                        <i className="fa-solid fa-play text-[10px]" />
                        <span>Video Masterclasses</span>
                    </button>
                    <button
                        onClick={() => setTab('courses')}
                        className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${tab === 'courses' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                        <i className="fa-solid fa-graduation-cap text-[10px]" />
                        <span>MIT • IIT • CS50 Courses</span>
                    </button>
                    <button
                        onClick={() => setTab('saved')}
                        className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${tab === 'saved' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                        <i className="fa-solid fa-bookmark text-[10px]" />
                        <span>My Library ({savedVideos.length})</span>
                    </button>
                </div>
            </div>

            {/* Auto-synced Skills Quick Bar */}
            {skills.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/70 dark:border-white/5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
                        <i className="fa-solid fa-arrows-rotate text-blue-500 animate-spin-slow" /> Synced Roadmap Skills:
                    </span>
                    {skills.map(skill => (
                        <button
                            key={skill}
                            onClick={() => {
                                setActiveSkill(skill);
                                setQuery(skill);
                                handleSearch(skill);
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeSkill === skill ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'}`}
                        >
                            <span>{skill}</span>
                            {activeSkill === skill && <i className="fa-solid fa-check text-[9px]" />}
                        </button>
                    ))}
                </div>
            )}

            {/* TAB 1: YOUTUBE VIDEO SEARCH & CURATED VIDEOS */}
            {tab === 'search' && (
                <div className="space-y-5">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search any skill, tool, or roadmap topic..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                            className="w-full pl-12 pr-28 py-3.5 bg-card border border-border rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all shadow-sm"
                        />
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                        <button
                            onClick={() => handleSearch(query)}
                            disabled={loading}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                        >
                            {loading ? <i className="fa-solid fa-circle-notch fa-spin text-xs" /> : <i className="fa-solid fa-bolt text-xs" />}
                            <span>{loading ? 'Fetching...' : 'Explore'}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading && Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-900/60 rounded-3xl h-64 border border-slate-200 dark:border-white/5" />
                        ))}
                        {!loading && videos.map(video => (
                            <div key={video.video_id} className="group bg-card border border-border rounded-3xl overflow-hidden hover:border-blue-400 dark:hover:border-blue-500/50 transition-all shadow-light-card dark:shadow-none flex flex-col justify-between">
                                <div>
                                    <div className="relative aspect-video cursor-pointer overflow-hidden bg-slate-900" onClick={() => setSelectedVideo(video)}>
                                        <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                                <i className="fa-solid fa-play text-white text-lg ml-0.5" />
                                            </div>
                                        </div>
                                        {video.duration && (
                                            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                                                {video.duration}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">{video.channel_title}</div>
                                        <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors" onClick={() => setSelectedVideo(video)}>
                                            {video.title}
                                        </h3>
                                    </div>
                                </div>

                                <div className="p-4 pt-0 space-y-3 border-t border-slate-100 dark:border-white/5 mt-2">
                                    <div className="flex items-center justify-between pt-2">
                                        <button
                                            onClick={() => handleSummarize(video)}
                                            disabled={summLoading === video.video_id}
                                            title={summaryErrors[video.video_id] || "Generate AI Key Takeaways"}
                                            className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${video.summary ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300'}`}
                                        >
                                            {summLoading === video.video_id ? <i className="fa-solid fa-spinner animate-spin" /> : <i className="fa-solid fa-brain text-indigo-500" />}
                                            <span>{video.summary ? 'AI Notes Ready' : 'AI Takeaways'}</span>
                                        </button>
                                        <button
                                            onClick={() => handleSaveToggle(video)}
                                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${video.is_saved ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-500/20 dark:border-blue-500 dark:text-cyan-300' : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
                                        >
                                            <i className={`fa-${video.is_saved ? 'solid' : 'regular'} fa-bookmark text-xs`} />
                                        </button>
                                    </div>

                                    {video.summary && (
                                        <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 rounded-xl animate-in fade-in">
                                            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed italic line-clamp-3">
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

            {/* TAB 2: MULTI-PLATFORM ELITE ACADEMIC COURSES */}
            {tab === 'courses' && (
                <div className="space-y-6">
                    {/* Platform Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {['All', 'Harvard CS50', 'MIT OpenCourseWare', 'IIT NPTEL', 'Stanford Online', 'freeCodeCamp'].map(plat => (
                            <button
                                key={plat}
                                onClick={() => setCoursePlatformFilter(plat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${coursePlatformFilter === plat ? 'bg-indigo-600 text-white shadow-md' : 'bg-card border border-border text-slate-600 dark:text-slate-300 hover:border-indigo-400'}`}
                            >
                                <i className="fa-solid fa-university text-[11px]" />
                                <span>{plat}</span>
                            </button>
                        ))}
                    </div>

                    {/* Courses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="p-6 rounded-3xl bg-card border border-border hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all shadow-light-card dark:shadow-none flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                                            {course.platform}
                                        </span>
                                        <span className="text-xs font-black text-amber-500 flex items-center gap-1">
                                            <i className="fa-solid fa-star text-[10px]" /> {course.rating}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{course.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                                            <i className="fa-solid fa-chalkboard-user text-xs text-slate-400" />
                                            <span>{course.instructor} • {course.institution}</span>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                                            ⏱️ {course.duration}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                            {course.free ? 'Free / Open Access' : 'Verified'}
                                        </span>
                                        {course.certificate && (
                                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                                📜 Certificate Available
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {course.skills.map((sk, idx) => (
                                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold">
                                                {sk}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <a
                                    href={course.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <span>Start Course on {course.platform}</span>
                                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: SAVED LIBRARY */}
            {tab === 'saved' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedVideos.length === 0 ? (
                        <div className="col-span-full p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                            <i className="fa-solid fa-bookmark text-2xl text-slate-400" />
                            <p className="text-sm font-bold">No saved videos in your library yet.</p>
                            <p className="text-xs">Click the bookmark icon on any video to add it to your study roadmap.</p>
                        </div>
                    ) : (
                        savedVideos.map(video => (
                            <div key={video.video_id} className={`p-4 rounded-3xl bg-card border transition-all space-y-3 ${video.is_completed ? 'border-emerald-300 dark:border-emerald-500/30' : 'border-border'}`}>
                                <div className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer" onClick={() => setSelectedVideo(video)}>
                                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                                    {video.is_completed && (
                                        <div className="absolute inset-0 bg-emerald-950/60 flex items-center justify-center backdrop-blur-[1px]">
                                            <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                                                <i className="fa-solid fa-check" /> Finished
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-slate-100">{video.title}</h3>
                                <div className="flex items-center justify-between pt-1">
                                    <button
                                        onClick={() => handleProgressToggle(video)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${video.is_completed ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30' : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                                    >
                                        {video.is_completed ? '✓ Completed' : 'Mark as Completed'}
                                    </button>
                                    <button onClick={() => handleSaveToggle({ ...video, is_saved: true })} className="text-slate-400 hover:text-rose-600 text-xs">
                                        <i className="fa-regular fa-trash-can" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/70 animate-in fade-in duration-200">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-4 right-4 z-10 w-9 h-9 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>
                        <div className="aspect-video w-full bg-black">
                            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${selectedVideo.video_id}?autoplay=1`} title={selectedVideo.title} frameBorder="0" allowFullScreen />
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <h2 className="text-lg font-bold text-white">{selectedVideo.title}</h2>
                            <p className="text-xs text-slate-400">{selectedVideo.channel_title}</p>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    onClick={() => handleSummarize(selectedVideo)}
                                    disabled={!!selectedVideo.summary || summLoading === selectedVideo.video_id}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                                >
                                    {summLoading === selectedVideo.video_id ? <i className="fa-solid fa-spinner animate-spin" /> : <i className="fa-solid fa-brain" />}
                                    <span>{selectedVideo.summary ? 'AI Takeaways Generated' : 'Generate AI Takeaways'}</span>
                                </button>
                                <button
                                    onClick={() => { handleSaveToggle(selectedVideo); }}
                                    className="px-6 py-3 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-bookmark" />
                                    <span>{selectedVideo.is_saved ? 'Saved in Library' : 'Save to Library'}</span>
                                </button>
                            </div>

                            {selectedVideo.summary && (
                                <div className="p-5 bg-indigo-950/40 rounded-2xl border border-indigo-500/20 text-slate-300 text-xs leading-relaxed space-y-2">
                                    <div className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                        <i className="fa-solid fa-lightbulb" /> Key Concept Summary
                                    </div>
                                    <p className="whitespace-pre-wrap">{selectedVideo.summary}</p>
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
