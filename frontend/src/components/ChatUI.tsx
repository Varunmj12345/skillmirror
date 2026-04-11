import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const msgVariant = {
  hidden:  { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

const TypingIndicator = () => (
  <motion.div
    variants={msgVariant}
    initial="hidden"
    animate="visible"
    className="flex items-end gap-3 mb-4"
  >
    <div className="w-8 h-8 rounded-xl bg-brand-neural/20 flex items-center justify-center flex-shrink-0 shadow-inner border border-brand-neural/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-neural/10 animate-pulse" />
      <i className="fa-solid fa-brain-circuit text-brand-neural text-xs relative z-10" />
    </div>
    <div className="bg-white/5 border border-white/5 rounded-[20px] rounded-bl-sm px-5 py-4 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-neural/70 animate-bounce" style={{ animationDelay: '0ms'   }} />
        <span className="w-1.5 h-1.5 rounded-full bg-brand-neural/70 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-brand-neural/70 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </motion.div>
);

interface Message {
  role: string;
  text: string;
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
      className={`flex items-end gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser ? (
        <div className="w-8 h-8 rounded-xl bg-brand-neural/10 flex items-center justify-center flex-shrink-0 border border-brand-neural/20 hover:scale-110 transition-transform relative">
          <i className="fa-solid fa-sparkles text-brand-neural text-xs" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10 hover:scale-110 transition-transform">
          <i className="fa-solid fa-user text-slate-400 text-xs" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`
          max-w-[80%] px-5 py-3.5 text-sm leading-relaxed shadow-sm backdrop-blur-md
          transition-all duration-300 hover:shadow-md font-medium tracking-wide
          ${isUser
            ? 'bg-brand-neural text-white rounded-[20px] rounded-br-[4px] shadow-glass-glow shadow-brand-neural/20'
            : 'bg-white/5 text-slate-200 border border-white/10 rounded-[20px] rounded-bl-[4px] hover:bg-white/10'
          }
        `}
      >
        {message.text}
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
    <div className="h-full overflow-y-auto overscroll-contain px-6 py-6 scroll-smooth sm-scrollbar">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} index={index} />
        ))}
        {loading && <TypingIndicator key="typing" />}
      </AnimatePresence>
      <div ref={bottomRef} className="h-4" />
    </div>
  );
};

export default ChatUI;
