import { FolderOpen, Plus, MoreHorizontal, Circle } from 'lucide-react';
import { ProcessPaperButton } from './ProcessPaperButton';
import { StatusTracker, PipelineStage } from './StatusTracker';
import { motion } from 'framer-motion';

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

interface ProjectSidebarProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
  pipelineStage: PipelineStage;
  isRefining: boolean;
}

export function ProjectSidebar({ onUpload, isProcessing, pipelineStage, isRefining }: ProjectSidebarProps) {
  return (
    <aside className="glass-panel h-full flex flex-col min-w-[280px] max-w-[320px] p-6">
      {/* Process Paper Section */}
      <div className="mb-6">
        <ProcessPaperButton onUpload={onUpload} isProcessing={isProcessing} />
      </div>

      {/* Status Tracker */}
      {pipelineStage !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 pb-6 border-b border-gold/30"
        >
          <StatusTracker currentStage={pipelineStage} isRefining={isRefining} />
        </motion.div>
      )}

      {/* Projects Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-gold" />
          </div>
          <h2 className="text-lg font-bold text-charcoal tracking-wide">Projects</h2>
        </div>
        <motion.button 
          className="w-8 h-8 rounded-xl bg-white/40 hover:bg-white/60 flex items-center justify-center transition-smooth"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-4 h-4 text-charcoal/60" />
        </motion.button>
      </div>

      {/* Projects List */}
      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group p-4 rounded-2xl bg-white/30 hover:bg-white/50 border border-gold/20 hover:border-gold/40 cursor-pointer transition-smooth"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 ${statusColors[project.status]} rounded-full`} />
                <span className="text-sm font-medium text-charcoal leading-tight tracking-wide">
                  {project.title}
                </span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-smooth">
                <MoreHorizontal className="w-4 h-4 text-charcoal/50" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
              <span className="text-xs text-charcoal/50 tracking-wide">{project.progress}% complete</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Project Button */}
      <div className="mt-4 pt-4 border-t border-gold/30">
        <motion.button 
          className="w-full py-3 rounded-2xl bg-white/30 hover:bg-white/50 border border-gold/20 hover:border-gold/40 text-sm text-charcoal/60 hover:text-charcoal transition-smooth flex items-center justify-center gap-2 tracking-wide"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          New Project
        </motion.button>
      </div>
    </aside>
  );
}
