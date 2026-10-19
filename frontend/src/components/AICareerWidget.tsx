import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { sendCareerMessage } from '../services/aiChat';
import ModeSelector from './ModeSelector';
import ChatUI from './ChatUI';

const AICareerWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('career');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'ai', text: "Sentinel telemetry initialized. I am your autonomous AI Career Architect. How can we calibrate your technical trajectory today?" },
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
      const replyText = res?.reply || 'Synthesizing trajectory models. Ask about your Roadmap, Skill Gap Matrix, or Resume optimization.';
      setMessages((m) => [
        ...m,
        { role: 'ai', text: replyText, latency_ms: res?.latency_ms, model: res?.model },
      ]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Telemetry latency detected. Please retry your request.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Tactical Launcher Beacon */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setOpen(!open)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-3.5 py-2.5 transition-all flex items-center gap-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.85)] border cursor-pointer ${
            open
              ? 'bg-zinc-900 border-amber-400 text-amber-400'
              : 'bg-zinc-950 border-zinc-700 hover:border-amber-400 text-zinc-100'
          }`}
          aria-label="Toggle Sentinel AI Assistant"
        >
          <span className={`w-1.5 h-1.5 bg-amber-400 ${open ? '' : 'animate-pulse'}`} />
          <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-brain'} text-xs text-amber-400`} />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
            {open ? 'CLOSE' : 'AI COPILOT'}
          </span>
          <span className="text-[9px] font-mono text-zinc-500 hidden sm:inline">
            {open ? '[ESC]' : '[ONLINE]'}
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-20 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-zinc-950 border border-zinc-800 shadow-[0_24px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/90 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 border border-amber-400/30 bg-amber-400/10 flex items-center justify-center text-amber-400 text-xs">
                  <i className="fa-solid fa-brain" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider">
                    SENTINEL AI // ARCHITECT
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-amber-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider">ONLINE</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/bot-analytics">
                  <a className="text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 uppercase tracking-wider transition-colors flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-400 animate-pulse" />
                    [INTEL]
                  </a>
                </Link>
                <Link href="/roadmap">
                  <a className="text-[10px] font-mono font-bold text-zinc-400 hover:text-amber-400 uppercase tracking-wider transition-colors">
                    [ROADMAP]
                  </a>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="text-zinc-500 hover:text-zinc-200 text-xs font-mono"
                  title="Close Terminal"
                >
                  [X]
                </button>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="px-3 pt-3 pb-1 bg-zinc-950">
              <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
            </div>

            {/* Chat Messages Container */}
            <div className="h-[360px] relative bg-zinc-950">
              <ChatUI messages={messages} loading={loading} />
            </div>

            {/* Input Console */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/90">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Inquire vector, roadmap, or interview..."
                  className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-400/60"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-mono font-bold uppercase tracking-wider border border-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <i className="fa-solid fa-paper-plane text-[10px]" />
                  <span>SEND</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICareerWidget;
