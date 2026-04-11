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
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 flex items-center justify-center transition-all"
        aria-label="AI Career Assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
            <span className="font-semibold text-sm">AI Career Assistant</span>
            <div className="flex items-center gap-2">
              <Link href="/roadmap">
                <span className="text-white/90 hover:text-white text-[11px] font-medium mr-2">
                  View Roadmap
                </span>
              </Link>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1">
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
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            <button onClick={send} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/20">
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
