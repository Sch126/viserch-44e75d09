import { Bell, Search, User } from 'lucide-react';
import { FocusModeToggle } from './FocusModeToggle';

interface DashboardHeaderProps {
  isFocusMode?: boolean;
  onFocusModeToggle?: () => void;
}

export function DashboardHeader({ isFocusMode = false, onFocusModeToggle }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal mb-1 tracking-wide">
          Welcome back, <span className="text-gradient">Alex</span>
        </h1>
        <p className="text-sm text-charcoal/50 tracking-wide">
          Continue your learning journey
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-panel">
          <Search className="w-4 h-4 text-charcoal/50" />
          <input
            type="text"
            placeholder="Search lessons..."
            className="bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none w-40 tracking-wide"
          />
        </div>

        {/* Focus Mode Toggle */}
        {onFocusModeToggle && (
          <FocusModeToggle isActive={isFocusMode} onToggle={onFocusModeToggle} />
        )}

        {/* Notifications */}
        <button className="relative w-11 h-11 rounded-2xl glass-panel flex items-center justify-center hover:bg-parchment transition-smooth">
          <Bell className="w-5 h-5 text-charcoal/50" />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-slate-blue rounded-full" />
        </button>

        {/* Profile */}
        <button className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-blue/30 to-slate-blue/10 border border-gold flex items-center justify-center hover:border-slate-blue transition-smooth">
          <User className="w-5 h-5 text-slate-blue" />
        </button>
      </div>
    </header>
  );
}
