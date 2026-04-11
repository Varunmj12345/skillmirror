import React, { useState } from 'react';
import Link from 'next/link';
import { sendCareerMessage } from '../services/aiChat';
import ModeSelector from './ModeSelector';
import ChatUI from './ChatUI';

const AICareerWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('career');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'ai', text: "Hi! I'm your AI Career Assistant. Ask about roadmap, skills, resume, or career advice." },
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
      const replyText = res?.reply || 'I can help with career guidance. Try asking about roadmap, skills, or resume.';
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: replyText,
        },
      ]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulse ring indicator */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-25 pointer-events-none" />
        )}
        <button
          onClick={() => setOpen(!open)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-xl hover:shadow-indigo-600/40 active:scale-95"
          aria-label="AI Career Assistant"
        >
          <svg
            className={`w-6 h-6 transition-transform duration-300 ${open ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            }
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-black/20 border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden sm-panel-in">
          <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
            <span className="font-semibold text-sm">AI Career Assistant</span>
            <div className="flex items-center gap-2">
              <Link href="/roadmap" passHref>
                <a className="text-white/90 hover:text-white text-[11px] font-medium mr-2">
                  View Roadmap
                </a>
              </Link>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 active:scale-90 transition-all duration-150">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {/* Mode Selector — sits above messages, no backend connection */}
          <div className="px-4 pt-4">
            <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
          </div>

          <div className="h-80">
            <ChatUI messages={messages} loading={loading} />
          </div>
          <div className="p-3 border-t border-gray-200 dark:border-slate-800 dark:bg-slate-900 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none sm-input"
            />
            <button
              onClick={send}
              disabled={loading}
              className="p-2.5 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all duration-150 hover:scale-105 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </>
  );
};

export default AICareerWidget;
