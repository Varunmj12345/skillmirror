import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const msgVariant = {
  hidden:  { opacity: 0, y: 10, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
};

const TypingIndicator = () => (
  <motion.div
    variants={msgVariant}
    initial="hidden"
    animate="visible"
    className="flex items-end gap-2"
  >
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" />
      </svg>
    </div>
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms'   }} />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </motion.div>
);

const MessageBubble = ({ message, index }) => {
  const isUser = message.role === 'user';
  return (
    <motion.div
      variants={msgVariant}
      initial="hidden"
      animate="visible"
      custom={index}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* AI avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20 transition-transform duration-200 hover:scale-110">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" />
          </svg>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`
          max-w-[80%] px-4 py-2.5 text-sm leading-relaxed shadow-sm
          transition-all duration-200 hover:shadow-md
          ${isUser
            ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-br-md shadow-indigo-500/20'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-md'
          }
        `}
      >
        {message.text}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center flex-shrink-0 border border-slate-600 transition-transform duration-200 hover:scale-110">
          <svg className="w-3.5 h-3.5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
      )}
    </motion.div>
  );
};

const ChatUI = ({ messages = [], loading = false }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 bg-slate-50 dark:bg-slate-950/50 scroll-smooth sm-scrollbar">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} index={index} />
        ))}
        {loading && <TypingIndicator key="typing" />}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatUI;
