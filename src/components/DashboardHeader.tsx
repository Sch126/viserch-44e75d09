import { Bell, Search, User } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Welcome back, <span className="text-gradient">Alex</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Continue your learning journey
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search lessons..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-40"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-11 h-11 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-surface-hover transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Profile */}
        <button className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center hover:border-primary/40 transition-colors">
          <User className="w-5 h-5 text-primary" />
        </button>
      </div>
    </header>
  );
}
