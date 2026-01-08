import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Lightbulb, Code, Eye, Check, Loader2, RefreshCw } from 'lucide-react';

export type PipelineStage = 
  | 'idle'
  | 'knowledge-architect'
  | 'metaphorical-director'
  | 'manim-engineer'
  | 'adhd-critic'
  | 'refining'
  | 'complete';

interface StatusTrackerProps {
  currentStage: PipelineStage;
  isRefining?: boolean;
}

const stages = [
  { 
    id: 'knowledge-architect', 
    label: 'Knowledge Architect', 
    icon: Brain,
    description: 'Extracting core concepts'
  },
  { 
    id: 'metaphorical-director', 
    label: 'Metaphorical Director', 
    icon: Lightbulb,
    description: 'Creating visual analogies'
  },
  { 
    id: 'manim-engineer', 
    label: 'Manim Engineer', 
    icon: Code,
    description: 'Building animations'
  },
  { 
    id: 'adhd-critic', 
    label: 'ADHD Critic', 
    icon: Eye,
    description: 'Optimizing engagement'
  },
];

const stageOrder = ['knowledge-architect', 'metaphorical-director', 'manim-engineer', 'adhd-critic'];

export function StatusTracker({ currentStage, isRefining = false }: StatusTrackerProps) {
  const currentIndex = stageOrder.indexOf(currentStage);
  const isComplete = currentStage === 'complete';

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Pipeline Status</h3>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success/20 text-success text-xs font-medium"
          >
            <Check className="w-3 h-3" />
            Complete
          </motion.div>
        )}
      </div>

      {/* Refining Animation */}
      <AnimatePresence>
        {isRefining && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4 text-warning" />
                </motion.div>
                <span className="text-xs font-medium text-warning">
                  Refining for Clarity...
                </span>
              </div>
              <motion.div
                className="mt-2 h-1 bg-warning/20 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-warning rounded-full"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ width: '50%' }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stages */}
      <div className="space-y-2">
        {stages.map((stage, index) => {
          const isActive = stage.id === currentStage;
          const isPast = currentIndex > index || isComplete;
          const isFuture = currentIndex < index && !isComplete;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative p-3 rounded-xl border transition-all duration-300
                ${isActive 
                  ? 'bg-primary/10 border-primary/30' 
                  : isPast 
                    ? 'bg-success/5 border-success/20' 
                    : 'bg-secondary/50 border-border'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className={`
                  w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                  ${isActive 
                    ? 'bg-primary/20 text-primary' 
                    : isPast 
                      ? 'bg-success/20 text-success' 
                      : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {isPast && !isActive ? (
                    <Check className="w-4 h-4" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <stage.icon className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <stage.icon className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`
                      text-xs font-medium transition-colors
                      ${isActive ? 'text-primary' : isPast ? 'text-success' : 'text-muted-foreground'}
                    `}>
                      {index + 1}. {stage.label}
                    </span>
                    {isActive && (
                      <Loader2 className="w-3 h-3 text-primary animate-spin" />
                    )}
                  </div>
                  <span className={`
                    text-xs transition-colors
                    ${isActive || isPast ? 'text-muted-foreground' : 'text-muted-foreground/50'}
                  `}>
                    {stage.description}
                  </span>
                </div>
              </div>

              {/* Progress line */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-primary rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
