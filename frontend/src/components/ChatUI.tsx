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

const renderInlineFormatting = (text: string): React.ReactNode[] => {
  // Tokenize **bold** and `inline code` safely into React elements
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="text-zinc-100 font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1 py-0.5 bg-zinc-900 border border-zinc-700/80 text-amber-300 text-[11px] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
};

const renderFormattedMarkdown = (rawText: string): React.ReactNode => {
  const lines = (rawText || '').split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // Skip horizontal rules (--- or ***)
    if (/^[-*_]{3,}$/.test(line)) {
      elements.push(<hr key={`hr-${i}`} className="border-zinc-800 my-2" />);
      i++;
      continue;
    }

    // Markdown Table block (| Col1 | Col2 |)
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const rows = tableLines
        .filter((r) => !/^\|[\s\-:|]+\|$/.test(r))
        .map((r) =>
          r
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim())
        );

      if (rows.length > 0) {
        const headers = rows[0];
        const bodyRows = rows.slice(1);
        elements.push(
          <div key={`tbl-${i}`} className="my-2.5 overflow-x-auto border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-amber-400">
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-2 py-1.5 font-bold border-r border-zinc-800/60 last:border-r-0">
                      {renderInlineFormatting(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-zinc-800/60 last:border-b-0 hover:bg-zinc-900/60">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-2 py-1.5 text-zinc-300 align-top border-r border-zinc-800/40 last:border-r-0">
                        {renderInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Fenced code block (```)
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre
          key={`code-${i}`}
          className="my-2 p-2.5 bg-zinc-900 border border-zinc-800 text-amber-300 text-[11px] font-mono overflow-x-auto"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Headings (#, ##, ###)
    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      elements.push(
        <div
          key={`h-${i}`}
          className="mt-2.5 mb-1 text-xs font-bold text-amber-400 uppercase tracking-wide border-l-2 border-amber-400 pl-2"
        >
          {renderInlineFormatting(headingMatch[2])}
        </div>
      );
      i++;
      continue;
    }

    // Bullet list items (-, *, •)
    const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      elements.push(
        <div key={`ul-${i}`} className="flex items-start gap-2 my-1 pl-1">
          <span className="text-amber-400 text-[10px] mt-0.5 shrink-0">▸</span>
          <span className="text-zinc-200 leading-relaxed">{renderInlineFormatting(bulletMatch[1])}</span>
        </div>
      );
      i++;
      continue;
    }

    // Numbered list items (1. , 2. )
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`ol-${i}`} className="flex items-start gap-2 my-1 pl-1">
          <span className="text-amber-400 font-bold text-[11px] shrink-0">{numMatch[1]}.</span>
          <span className="text-zinc-200 leading-relaxed">{renderInlineFormatting(numMatch[2])}</span>
        </div>
      );
      i++;
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-zinc-200 leading-relaxed">
        {renderInlineFormatting(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
};

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
          max-w-[88%] p-3 text-xs font-sans leading-relaxed transition-all
          ${isUser
            ? 'bg-zinc-900 border border-amber-400/40 text-zinc-100 font-mono'
            : 'bg-zinc-950 border border-zinc-800 text-zinc-300'
          }
        `}
      >
        <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-zinc-800/80">
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
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.text}</p>
        ) : (
          renderFormattedMarkdown(message.text)
        )}
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
