import { Bot, Send, Sparkles, User } from 'lucide-react';
import { useState } from 'react';

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

  return (
    <aside className="bento-card h-full flex flex-col min-w-[320px] max-w-[380px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center relative">
          <Bot className="w-5 h-5 text-primary" />
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">AI Tutor</h2>
          <p className="text-xs text-muted-foreground">Always here to help</p>
        </div>
        <button className="ml-auto w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin pr-2 -mr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                message.role === 'user' ? 'bg-secondary' : 'bg-primary/10'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Bot className="w-4 h-4 text-primary" />
              )}
            </div>
            <div
              className={`flex-1 p-4 rounded-2xl text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-md'
                  : 'bg-secondary text-secondary-foreground rounded-tl-md'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-secondary border border-border focus-within:border-primary/50 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button className="w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors">
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          AI responses are personalized to your learning style
        </p>
      </div>
    </aside>
  );
}
