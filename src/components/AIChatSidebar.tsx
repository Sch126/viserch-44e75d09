import { Bot, Send, Sparkles, User } from 'lucide-react';
import { useState } from 'react';
import { VoiceChatButton } from './VoiceChatButton';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hi there! 👋 I'm your AI Tutor. I noticed you're learning about wave functions. Would you like me to explain the concept in a different way?",
  },
  {
    id: '2',
    role: 'user',
    content: 'Yes please! Can you use a visual analogy?',
  },
  {
    id: '3',
    role: 'assistant',
    content: "Of course! Think of a wave function like ripples in a pond. When you drop a pebble, the ripples spread out in all directions. The height of each ripple at any point tells us something about that location — that's similar to how wave functions describe particles!",
  },
];

export function AIChatSidebar() {
  const [messages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  return (
    <aside className="glass-panel slate-glow h-full flex flex-col min-w-[320px] max-w-[380px] p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div 
          className="w-10 h-10 rounded-2xl bg-slate-blue/20 flex items-center justify-center relative"
          whileHover={{ scale: 1.05 }}
        >
          <Bot className="w-5 h-5 text-slate-blue" />
          <motion.div 
            className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-parchment-light"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <div>
          <h2 className="text-lg font-bold text-charcoal tracking-wide">AI Tutor</h2>
          <p className="text-xs text-charcoal/50 tracking-wide">Always here to help</p>
        </div>
        <motion.button 
          className="ml-auto w-8 h-8 rounded-xl bg-slate-blue/10 flex items-center justify-center hover:bg-slate-blue/20 transition-smooth"
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
        >
          <Sparkles className="w-4 h-4 text-slate-blue" />
        </motion.button>
      </div>

      {/* Voice Chat Button */}
      <div className="mb-4">
        <VoiceChatButton 
          onVoiceStart={() => setIsVoiceActive(true)}
          onVoiceEnd={() => setIsVoiceActive(false)}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin pr-2 -mr-2">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <motion.div
                className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  message.role === 'user' ? 'bg-parchment-light' : 'bg-slate-blue/10'
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
                className={`flex-1 p-4 rounded-2xl text-sm leading-relaxed tracking-wide ${
                  message.role === 'user'
                    ? 'bg-slate-blue text-white rounded-tr-md'
                    : 'bg-parchment-light text-charcoal rounded-tl-md'
                }`}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {message.content}
              </motion.div>
            </motion.div>
          ))}
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
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent px-2 py-2 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none tracking-wide"
          />
          <motion.button 
            className="w-10 h-10 rounded-xl bg-slate-blue hover:bg-slate-blue-dark flex items-center justify-center transition-smooth"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </motion.div>
        <p className="text-xs text-charcoal/40 text-center mt-3 tracking-wide">
          AI responses are personalized to your learning style
        </p>
      </div>
    </aside>
  );
}
