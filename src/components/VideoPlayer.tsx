import { Play, Pause, Volume2, Maximize2, SkipBack, SkipForward, Settings, Pencil, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { DrawingOverlay } from './DrawingOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const { toast } = useToast();

  const handleCircleCapture = useCallback((bounds: { x: number; y: number; width: number; height: number }) => {
    console.log('Circle captured:', bounds);
    toast({
      title: "Area Captured",
      description: `Coordinates: (${Math.round(bounds.x)}, ${Math.round(bounds.y)}) - Size: ${Math.round(bounds.width)}×${Math.round(bounds.height)}`,
    });
  }, [toast]);

  return (
    <div className="bento-card h-full flex flex-col flex-1">
      {/* Video Container */}
      <div className="relative flex-1 bg-black/40 rounded-[1.5rem] overflow-hidden mb-4 min-h-[300px]">
        {/* Drawing Overlay */}
        <DrawingOverlay 
          isActive={isAnnotating} 
          onCircleCapture={handleCircleCapture}
        />

        {/* Placeholder for video */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card to-background">
          <div className="text-center space-y-4">
            <motion.div 
              className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto glow-primary"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-8 h-8 text-primary ml-1" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">
                Understanding Wave Functions
              </h3>
              <p className="text-sm text-muted-foreground">
                Introduction to Physics • Lesson 4
              </p>
            </div>
          </div>
        </div>

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm pointer-events-auto">
            <span className="text-xs font-medium text-foreground">12:34 / 45:20</span>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Annotation Toggle */}
            <motion.button 
              onClick={() => setIsAnnotating(!isAnnotating)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isAnnotating 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                  : 'bg-black/60 backdrop-blur-sm hover:bg-black/80 text-foreground'
              }`}
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
              className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4 text-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Annotation mode indicator */}
        <AnimatePresence>
          {isAnnotating && (
            <motion.div
              className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 backdrop-blur-sm z-30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <span className="text-xs font-medium text-primary">
                ✏️ Annotation Mode — Draw or type on the video
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="group relative">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden cursor-pointer">
            <motion.div
              className="h-full bg-primary rounded-full relative"
              style={{ width: `${progress}%` }}
              layoutId="progress"
            >
              <motion.div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                whileHover={{ scale: 1.3 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button 
              className="w-10 h-10 rounded-xl hover:bg-surface-hover flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipBack className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            
            <motion.button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 flex items-center justify-center transition-all duration-200 glow-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-primary-foreground" />
              ) : (
                <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
              )}
            </motion.button>

            <motion.button 
              className="w-10 h-10 rounded-xl hover:bg-surface-hover flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipForward className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-foreground/50 rounded-full" />
              </div>
            </div>

            <motion.button 
              className="w-10 h-10 rounded-xl hover:bg-surface-hover flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Maximize2 className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
