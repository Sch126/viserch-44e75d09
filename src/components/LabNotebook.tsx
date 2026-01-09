import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Circle, MessageSquare, Trash2, ChevronDown, ChevronUp, Image } from 'lucide-react';

export interface LabEntry {
  id: string;
  type: 'diagram' | 'explanation';
  timestamp: Date;
  content: string;
  bounds?: { x: number; y: number; width: number; height: number };
  videoTimestamp?: string;
}

interface LabNotebookProps {
  entries: LabEntry[];
  onDeleteEntry: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function LabNotebook({ entries, onDeleteEntry, isExpanded, onToggleExpand }: LabNotebookProps) {
  const diagramCount = entries.filter(e => e.type === 'diagram').length;
  const explanationCount = entries.filter(e => e.type === 'explanation').length;

  return (
    <div className="glass-panel flex flex-col p-6">
      {/* Header - Always visible */}
      <button
        onClick={onToggleExpand}
        className="flex items-center justify-between w-full group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-gold" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-charcoal tracking-wide">Lab Notebook</h2>
            <p className="text-xs text-charcoal/50 tracking-wide">
              {diagramCount} diagrams • {explanationCount} notes
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="w-8 h-8 rounded-xl bg-white/40 group-hover:bg-white/60 flex items-center justify-center transition-smooth"
        >
          <ChevronDown className="w-4 h-4 text-charcoal/50" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gold/30 space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
              {entries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center mx-auto mb-3">
                    <Circle className="w-5 h-5 text-charcoal/40" />
                  </div>
                  <p className="text-sm text-charcoal/50 tracking-wide">
                    Circle diagrams on the video to save them here
                  </p>
                </div>
              ) : (
                entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group p-3 rounded-xl bg-white/30 hover:bg-white/50 border border-gold/20 hover:border-gold/40 transition-smooth"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                        ${entry.type === 'diagram' ? 'bg-gold/10 text-gold' : 'bg-cobalt-glow/10 text-cobalt-glow'}
                      `}>
                        {entry.type === 'diagram' ? (
                          <Image className="w-4 h-4" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-charcoal capitalize tracking-wide">
                            {entry.type === 'diagram' ? 'Circled Area' : 'AI Explanation'}
                          </span>
                          {entry.videoTimestamp && (
                            <span className="text-xs text-charcoal/50 tracking-wide">
                              @ {entry.videoTimestamp}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal/60 line-clamp-2 tracking-wide">
                          {entry.content}
                        </p>
                        {entry.bounds && (
                          <p className="text-xs text-charcoal/40 mt-1 font-mono">
                            ({Math.round(entry.bounds.x)}, {Math.round(entry.bounds.y)}) 
                            {Math.round(entry.bounds.width)}×{Math.round(entry.bounds.height)}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-destructive/20 flex items-center justify-center transition-smooth"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
