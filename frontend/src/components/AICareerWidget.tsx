import React, { useState } from 'react';
import Link from 'next/link';
import { sendCareerMessage } from '../services/aiChat';
import ModeSelector from './ModeSelector';
import ChatUI from './ChatUI';

const AICareerWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('career');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'ai', text: "Neural connection established. I am your AI Career Architect. How can we optimize your trajectory today?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const res = await sendCareerMessage(userMsg);
      const replyText = res?.reply || 'I am processing your career data. Ask about your Roadmap, Skills Matrix, or Resume optimization.';
      setMessages((m) => [
        ...m,
        { role: 'ai', text: replyText },
      ]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Latency detected. Please try your request again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-[100]">
        {!open && (
          <span className="absolute inset-0 rounded-full bg-brand-neural animate-ping opacity-30 pointer-events-none" />
        )}
        <button
          onClick={() => setOpen(!open)}
          className="relative w-16 h-16 rounded-[1.25rem] bg-brand-neural flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-glass-glow shadow-brand-neural/50 overflow-hidden group"
          aria-label="Toggle Neural Assistant"
        >
          {/* Glass glare effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50" />
          
          <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-brain-circuit'} text-2xl text-white relative z-10 transition-transform duration-300 ${open ? 'rotate-90 scale-90' : 'rotate-0 scale-100 group-hover:animate-pulse'}`} />
        </button>
      </div>

      {open && (
        <div className="fixed bottom-28 right-8 z-[100] w-[400px] max-w-[calc(100vw-4rem)] sm-glass bg-brand-obsidian/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 flex flex-col overflow-hidden sm-page-enter [animation-duration:400ms] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),_0_0_20px_2px_rgba(99,102,241,0.15)]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-brand-neural/20 flex items-center justify-center border border-brand-neural/30 relative">
                  <div className="absolute -inset-1 bg-brand-neural/20 blur-md rounded-full" />
                  <i className="fa-solid fa-sparkles text-brand-neural text-xs relative z-10" />
               </div>
               <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Intelligence Node</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                     <span className="sm-nano text-brand-emerald">Online</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/roadmap" passHref>
                <a className="sm-nano text-slate-400 hover:text-white transition-colors">
                  View Roadmap
                </a>
              </Link>
            </div>
          </div>
          
          {/* Mode Selector */}
          <div className="px-6 pt-5 pb-2">
            <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
          </div>

          {/* Chat Container */}
          <div className="h-[360px] relative">
            <ChatUI messages={messages} loading={loading} />
            {/* Soft gradient mask for scroll edge */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-brand-obsidian/95 to-transparent pointer-events-none" />
          </div>
          
          {/* Input Area */}
          <div className="p-5 border-t border-white/5 bg-white/[0.02]">
            <div className="relative flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask your Career Architect..."
                className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-neural/50 focus:bg-white/10 transition-all font-medium tracking-wide"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="w-12 h-[52px] bg-brand-neural text-white flex justify-center items-center rounded-2xl shadow-glass-glow shadow-brand-neural/30 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                <i className="fa-solid fa-paper-plane-top text-sm relative z-10 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AICareerWidget;
