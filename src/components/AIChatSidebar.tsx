import { Bot, Send, User, Trash2, Zap } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { VoiceChatButton } from './VoiceChatButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useViserchChat } from '@/hooks/useViserchChat';
import ReactMarkdown from 'react-markdown';
import { WaveformAnimation } from './WaveformAnimation';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content: "Hi there! 👋 I'm your Viserch Learning Assistant. I'm here to help you understand complex topics with clear, concise explanations. What would you like to learn about today?",
};

interface AIChatSidebarProps {
  isVideoPaused?: boolean;
}

// Component for streaming text with character-by-character animation
function StreamingText({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  // Clean content - ensure no undefined/null values are rendered
  const cleanContent = content || '';
  
  // Simple opacity-based reveal animation using framer-motion
  // This prevents the character-mangling bug from the previous interval-based approach
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      key={cleanContent.length} // Re-trigger animation on content change
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => {
            if (children === undefined || children === null) return null;
            return <p className="mb-2 last:mb-0">{children}</p>;
          },
          strong: ({ children }) => {
            if (children === undefined || children === null) return null;
            return <strong className="font-bold">{children}</strong>;
          },
          em: ({ children }) => {
            if (children === undefined || children === null) return null;
            return <em className="italic">{children}</em>;
          },
          ul: ({ children }) => {
            if (children === undefined || children === null) return null;
            return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
          },
          ol: ({ children }) => {
            if (children === undefined || children === null) return null;
            return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
          },
          li: ({ children }) => {
            if (children === undefined || children === null) return null;
            return <li className="leading-relaxed">{children}</li>;
          },
          code: ({ children }) => {
            if (children === undefined || children === null) return null;
            return <code className="bg-charcoal/10 px-1 py-0.5 rounded text-xs">{children}</code>;
          },
        }}
      >
        {cleanContent}
      </ReactMarkdown>
      {isStreaming && cleanContent.length > 0 && (
        <motion.span
          className="inline-block w-1 h-4 bg-slate-blue ml-1 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// AI Status Indicator - pulses when thinking, waveform when listening
function AIStatusIndicator({ isThinking, isListening }: { isThinking: boolean; isListening: boolean }) {
  if (isListening) {
    return (
      <div className="flex items-center gap-1 h-3">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="w-0.5 bg-slate-blue rounded-full"
            animate={{
              height: ['4px', '12px', '4px'],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="w-2.5 h-2.5 rounded-full bg-slate-blue"
      animate={isThinking ? {
        scale: [1, 1.3, 1],
        opacity: [0.6, 1, 0.6],
        boxShadow: [
          '0 0 0 0 rgba(104, 123, 153, 0.4)',
          '0 0 0 6px rgba(104, 123, 153, 0)',
          '0 0 0 0 rgba(104, 123, 153, 0.4)',
        ],
      } : {
        scale: 1,
        opacity: 1,
      }}
      transition={{
        duration: 1.5,
        repeat: isThinking ? Infinity : 0,
        ease: 'easeInOut',
      }}
    />
  );
}

export function AIChatSidebar({ isVideoPaused = true }: AIChatSidebarProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useViserchChat([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userIsScrolling, setUserIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Smart scroll: only auto-scroll if user isn't reading old messages
  const scrollToBottom = useCallback(() => {
    if (!userIsScrolling && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userIsScrolling]);

  // Detect if user is scrolling up
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (!isNearBottom) {
      setUserIsScrolling(true);
      // Reset after 3 seconds of no scrolling
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setUserIsScrolling(false), 3000);
    } else {
      setUserIsScrolling(false);
    }
  }, []);

  // Auto-scroll when new messages arrive or content updates
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Track the last assistant message for streaming detection
  const lastMessage = messages[messages.length - 1];
  const isLastMessageStreaming = isLoading && lastMessage?.role === 'assistant';

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      setUserIsScrolling(false); // Reset scroll lock when sending
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className={`glass-panel slate-glow h-full flex flex-col min-w-[320px] max-w-[380px] p-6 transition-smooth ${isVideoPaused ? 'chat-highlight' : ''}`}>
      {/* Header with AI Status */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div 
          className="w-10 h-10 rounded-2xl bg-slate-blue/20 flex items-center justify-center relative"
          whileHover={{ scale: 1.05 }}
        >
          <Bot className="w-5 h-5 text-slate-blue" />
          <div className="absolute -top-0.5 -right-0.5">
            <AIStatusIndicator isThinking={isLoading} isListening={isVoiceActive} />
          </div>
        </motion.div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-charcoal tracking-wide">Viserch AI</h2>
          <p className="text-xs text-charcoal/50 tracking-wide">ADHD-friendly learning</p>
        </div>
        <motion.button 
          onClick={clearMessages}
          className="w-8 h-8 rounded-xl bg-slate-blue/10 flex items-center justify-center hover:bg-slate-blue/20 transition-smooth"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4 text-slate-blue" />
        </motion.button>
      </div>

      {/* Direct Mode Badge */}
      <motion.div 
        className="flex items-center justify-center gap-1.5 mb-4 py-1.5 px-3 rounded-full bg-slate-blue/10 border border-slate-blue/20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Zap className="w-3 h-3 text-slate-blue" />
        <span className="text-xs font-medium text-slate-blue tracking-wide">Direct Mode: Active</span>
      </motion.div>

      {/* Voice Chat Button */}
      <div className="mb-4">
        <VoiceChatButton 
          onVoiceStart={() => setIsVoiceActive(true)}
          onVoiceEnd={() => setIsVoiceActive(false)}
        />
      </div>

      {/* Messages with smart scroll */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 space-y-4 overflow-y-auto scrollbar-thin pr-2 -mr-2"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => {
            const isCurrentlyStreaming = isLastMessageStreaming && index === messages.length - 1;
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <motion.div
                  className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    message.role === 'user' ? 'bg-parchment-light chat-bubble' : 'bg-slate-blue/10 chat-bubble'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-charcoal/60" />
                  ) : (
                    <Bot className="w-4 h-4 text-slate-blue" />
                  )}
                </motion.div>
                <motion.div
                  className={`flex-1 p-4 rounded-2xl text-sm leading-relaxed tracking-wide chat-bubble prose prose-sm max-w-none ${
                    message.role === 'user'
                      ? 'bg-slate-blue text-white rounded-tr-md prose-invert'
                      : 'bg-parchment-light text-charcoal rounded-tl-md prose-charcoal'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {message.role === 'assistant' ? (
                    <StreamingText 
                      content={message.content} 
                      isStreaming={isCurrentlyStreaming}
                    />
                  ) : (
                    <p className="mb-0">{message.content}</p>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Voice active indicator */}
        <AnimatePresence>
          {isVoiceActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-blue/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-slate-blue" />
              </div>
              <div className="flex-1 p-4 rounded-2xl rounded-tl-md bg-parchment-light">
                <motion.div 
                  className="flex items-center gap-2 text-sm text-charcoal/60 tracking-wide"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span>Listening to you...</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 pt-4 border-t border-slate-blue/30">
        <motion.div 
          className="flex items-center gap-2 p-2 rounded-2xl bg-parchment-light border border-slate-blue/30 focus-within:border-slate-blue/60 transition-smooth"
          whileFocus={{ scale: 1.01 }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-2 py-2 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none tracking-wide disabled:opacity-50"
          />
          <motion.button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-slate-blue hover:bg-slate-blue-dark flex items-center justify-center transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!isLoading && input.trim() ? { scale: 1.1 } : {}}
            whileTap={!isLoading && input.trim() ? { scale: 0.9 } : {}}
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </motion.div>
        <p className="text-xs text-charcoal/40 text-center mt-3 tracking-wide">
          Concise • Bullet points • Base-level explanations
        </p>
      </div>
    </aside>
  );
}
