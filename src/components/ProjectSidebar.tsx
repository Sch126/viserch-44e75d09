import { FolderOpen, Plus, MoreHorizontal, Circle } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
}

const projects: Project[] = [
  { id: '1', title: 'Introduction to Physics', progress: 75, status: 'active' },
  { id: '2', title: 'Creative Writing', progress: 45, status: 'active' },
  { id: '3', title: 'Mathematics Fundamentals', progress: 100, status: 'completed' },
  { id: '4', title: 'Art History', progress: 20, status: 'paused' },
];

const statusColors = {
  active: 'bg-primary',
  completed: 'bg-success',
  paused: 'bg-warning',
};

export function ProjectSidebar() {
  return (
    <aside className="bento-card h-full flex flex-col min-w-[280px] max-w-[320px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Projects</h2>
        </div>
        <button className="w-8 h-8 rounded-xl bg-secondary hover:bg-surface-hover flex items-center justify-center transition-colors">
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group p-4 rounded-2xl bg-secondary/50 hover:bg-surface-hover border border-transparent hover:border-border cursor-pointer transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Circle className={`w-2 h-2 ${statusColors[project.status]} rounded-full`} />
                <span className="text-sm font-medium text-foreground leading-tight">
                  {project.title}
                </span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{project.progress}% complete</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <button className="w-full py-3 rounded-2xl bg-secondary hover:bg-surface-hover text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>
    </aside>
  );
}
