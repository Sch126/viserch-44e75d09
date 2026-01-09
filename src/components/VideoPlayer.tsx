import { Play, Pause, Volume2, Maximize2, SkipBack, SkipForward, Settings, Pencil, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { DrawingOverlay } from './DrawingOverlay';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  onCircleCapture?: (bounds: { x: number; y: number; width: number; height: number }) => void;
  isPlaying?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function VideoPlayer({ onCircleCapture, isPlaying: externalIsPlaying, onPlayStateChange }: VideoPlayerProps) {
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const isPlaying = externalIsPlaying ?? internalIsPlaying;
  const [progress, setProgress] = useState(35);
  const [isAnnotating, setIsAnnotating] = useState(false);

  const handlePlayToggle = () => {
    const newState = !isPlaying;
    setInternalIsPlaying(newState);
    onPlayStateChange?.(newState);
  };

  const handleCircleCapture = useCallback((bounds: { x: number; y: number; width: number; height: number }) => {
    console.log('Circle captured:', bounds);
    onCircleCapture?.(bounds);
  }, [onCircleCapture]);

  return (
    <div className={`glass-panel active-glow-edge flex-1 flex flex-col min-h-[400px] p-6 transition-smooth ${!isPlaying ? 'interaction-highlight' : ''}`}>
      {/* Video Container */}
      <div className="relative flex-1 bg-charcoal/5 rounded-[32px] overflow-hidden mb-4 border border-gold">
        {/* Drawing Overlay */}
        <DrawingOverlay 
          isActive={isAnnotating} 
          onCircleCapture={handleCircleCapture}
        />

        {/* Placeholder for video */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-parchment-light/40 to-parchment/20">
          <div className="text-center space-y-4">
            <motion.div 
              className="w-20 h-20 rounded-full bg-slate-blue/20 flex items-center justify-center mx-auto"
              style={{ boxShadow: '0 0 40px rgba(128, 151, 179, 0.3)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-8 h-8 text-slate-blue ml-1" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-charcoal mb-1 tracking-wide">
                Understanding Wave Functions
              </h3>
              <p className="text-sm text-charcoal/50 tracking-wide">
                Introduction to Physics • Lesson 4
              </p>
            </div>
          </div>
        </div>

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-white/60 backdrop-blur-sm border border-gold/20 pointer-events-auto">
            <span className="text-xs font-medium text-charcoal tracking-wide">12:34 / 45:20</span>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Annotation Toggle */}
            <motion.button 
              onClick={() => setIsAnnotating(!isAnnotating)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-smooth ${
                isAnnotating 
                  ? 'bg-slate-blue text-white shadow-lg' 
                  : 'bg-parchment-light/80 backdrop-blur-sm hover:bg-parchment-light text-charcoal border border-gold'
              }`}
              style={isAnnotating ? { boxShadow: '0 0 20px rgba(128, 151, 179, 0.4)' } : {}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isAnnotating ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="pen"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Pencil className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button 
              className="w-8 h-8 rounded-xl bg-parchment-light/80 backdrop-blur-sm border border-gold flex items-center justify-center hover:bg-parchment-light transition-smooth"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4 text-charcoal" />
            </motion.button>
          </div>
        </div>

        {/* Annotation mode indicator */}
        <AnimatePresence>
          {isAnnotating && (
            <motion.div
              className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-slate-blue/20 border border-slate-blue/40 backdrop-blur-sm z-30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <span className="text-xs font-medium text-slate-blue-dark tracking-wide">
                ✏️ Annotation Mode — Circle diagrams to save them
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="group relative">
          <div className="h-1.5 bg-charcoal/10 rounded-full overflow-hidden cursor-pointer">
            <motion.div
              className="h-full bg-slate-blue rounded-full relative"
              style={{ width: `${progress}%` }}
              layoutId="progress"
            >
              <motion.div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-blue rounded-full opacity-0 group-hover:opacity-100 transition-smooth shadow-lg"
                whileHover={{ scale: 1.3 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button 
              className="w-10 h-10 rounded-xl hover:bg-white/40 flex items-center justify-center transition-smooth"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipBack className="w-5 h-5 text-charcoal/50" />
            </motion.button>
            
            <motion.button
              onClick={handlePlayToggle}
              className="w-14 h-14 rounded-2xl bg-slate-blue hover:bg-slate-blue-dark flex items-center justify-center transition-smooth"
              style={{ boxShadow: '0 0 30px rgba(128, 151, 179, 0.3)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-0.5" />
              )}
            </motion.button>

            <motion.button 
              className="w-10 h-10 rounded-xl hover:bg-white/40 flex items-center justify-center transition-smooth"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipForward className="w-5 h-5 text-charcoal/50" />
            </motion.button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-charcoal/50" />
              <div className="w-20 h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-charcoal/30 rounded-full" />
              </div>
            </div>

            <motion.button 
              className="w-10 h-10 rounded-xl hover:bg-white/40 flex items-center justify-center transition-smooth"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Maximize2 className="w-5 h-5 text-charcoal/50" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
