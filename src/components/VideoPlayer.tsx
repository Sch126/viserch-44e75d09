import { Play, Pause, Volume2, Maximize2, SkipBack, SkipForward, Settings } from 'lucide-react';
import { useState } from 'react';

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  return (
    <div className="bento-card h-full flex flex-col flex-1">
      {/* Video Container */}
      <div className="relative flex-1 bg-black/40 rounded-[1.5rem] overflow-hidden mb-4 min-h-[300px]">
        {/* Placeholder for video */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card to-background">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto glow-primary">
              <Play className="w-8 h-8 text-primary ml-1" />
            </div>
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
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm">
            <span className="text-xs font-medium text-foreground">12:34 / 45:20</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors">
              <Settings className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="group relative">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden cursor-pointer">
            <div
              className="h-full bg-primary rounded-full transition-all duration-200 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl hover:bg-surface-hover flex items-center justify-center transition-colors">
              <SkipBack className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 flex items-center justify-center transition-all duration-200 glow-primary"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-primary-foreground" />
              ) : (
                <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
              )}
            </button>

            <button className="w-10 h-10 rounded-xl hover:bg-surface-hover flex items-center justify-center transition-colors">
              <SkipForward className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-foreground/50 rounded-full" />
              </div>
            </div>

            <button className="w-10 h-10 rounded-xl hover:bg-surface-hover flex items-center justify-center transition-colors">
              <Maximize2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
