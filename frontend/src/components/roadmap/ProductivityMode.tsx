import React, { useState, useEffect } from 'react';

const ProductivityMode: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 glass-panel bg-indigo-900/10 border-indigo-500/20">
            <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-stopwatch text-indigo-400"></i>
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Pomodoro Focus Mode</h3>
            </div>

            <div className="text-4xl font-black text-white tracking-tighter mb-6 font-mono">
                {formatTime(timeLeft)}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => setIsActive(!isActive)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-red-500/20 border border-red-500/40 text-red-100 hover:bg-red-500/30' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500'}`}
                >
                    {isActive ? 'Pause Session' : 'Start Focus'}
                </button>
                <button
                    onClick={() => { setTimeLeft(25 * 60); setIsActive(false); }}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white"
                >
                    Reset
                </button>
            </div>

            <p className="mt-6 text-[10px] text-slate-500 font-medium italic text-center leading-relaxed">
                "Study session data will be synced with your <br />Consistency Score automatically."
            </p>
        </div>
    );
};

export default ProductivityMode;
