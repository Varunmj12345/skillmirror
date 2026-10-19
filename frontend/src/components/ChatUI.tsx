import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const msgVariant = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const TypingIndicator = () => (
  <motion.div
    variants={msgVariant}
    initial="hidden"
    animate="visible"
    className="flex items-start gap-2.5 mb-3"
  >
    <div className="w-6 h-6 border border-amber-400/30 bg-amber-400/10 flex items-center justify-center flex-shrink-0 text-amber-400 text-[10px]">
      <i className="fa-solid fa-brain" />
    </div>
    <div className="bg-zinc-950 border border-zinc-800 p-2.5 text-xs font-mono flex items-center gap-2">
      <span className="w-1.5 h-1.5 bg-amber-400 animate-pulse" />
      <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">
        Computing trajectory heuristics...
      </span>
    </div>
  </motion.div>
);

interface Message {
  role: string;
  text: string;
  latency_ms?: number;
  model?: string;
}

interface MessageBubbleProps {
  message: Message;
  index: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
  const isUser = message.role === 'user';
  return (
    <motion.div
      variants={msgVariant}
      initial="hidden"
      animate="visible"
      custom={index}
      className={`flex items-start gap-2.5 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Indicator Box */}
      {!isUser ? (
        <div className="w-6 h-6 border border-amber-400/30 bg-amber-400/10 flex items-center justify-center flex-shrink-0 text-amber-400 text-[10px] mt-0.5">
          <i className="fa-solid fa-brain" />
        </div>
      ) : (
        <div className="w-6 h-6 border border-zinc-700 bg-zinc-900 flex items-center justify-center flex-shrink-0 text-zinc-300 text-[10px] mt-0.5">
          <i className="fa-solid fa-user" />
        </div>
      )}

      {/* Bubble Content */}
      <div
        className={`
          max-w-[85%] p-3 text-xs font-mono leading-relaxed transition-all
          ${isUser
            ? 'bg-zinc-900 border border-amber-400/40 text-zinc-100'
            : 'bg-zinc-950 border border-zinc-800 text-zinc-300'
          }
        `}
      >
        <div className="flex items-center justify-between gap-3 mb-1 pb-1 border-b border-zinc-800/80">
          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
            isUser ? 'text-zinc-400' : 'text-amber-400'
          }`}>
            {isUser ? '[ USER // OPERATOR ]' : '[ SENTINEL AI // ARCHITECT ]'}
          </span>
          {!isUser && message.latency_ms && (
            <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.2 border border-zinc-800">
              ⚡ {message.latency_ms}ms
            </span>
          )}
        </div>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </motion.div>
  );
};

interface ChatUIProps {
  messages: Message[];
  loading?: boolean;
}

const ChatUI: React.FC<ChatUIProps> = ({ messages = [], loading = false }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="h-full overflow-y-auto overscroll-contain px-4 py-4 scroll-smooth sm-scrollbar">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} index={index} />
        ))}
        {loading && <TypingIndicator key="typing" />}
      </AnimatePresence>
      <div ref={bottomRef} className="h-2" />
    </div>
  );
};

export default ChatUI;
