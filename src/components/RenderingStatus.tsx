import { motion, AnimatePresence } from 'framer-motion';
import { Film, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

export type RenderState = 'idle' | 'compiling' | 'rendering' | 'healing' | 'complete' | 'error';

interface RenderingStatusProps {
  state: RenderState;
  progress?: number;
  healingAttempt?: number;
  maxHealingAttempts?: number;
  videoUrl?: string;
  error?: string;
}

export function RenderingStatus({
  state,
  progress = 0,
  healingAttempt = 0,
  maxHealingAttempts = 3,
  videoUrl,
  error
}: RenderingStatusProps) {
  const [pulsePhase, setPulsePhase] = useState(0);

  // Smooth pulsing animation for rendering state
  useEffect(() => {
    if (state === 'rendering' || state === 'compiling') {
      const interval = setInterval(() => {
        setPulsePhase(p => (p + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [state]);

  if (state === 'idle') return null;

  const getStateConfig = () => {
    switch (state) {
      case 'compiling':
        return {
          icon: Film,
          label: 'Compiling Animation Code',
          description: 'Preparing visual scenes for render...',
          color: 'slate-blue',
          bgColor: 'bg-slate-blue/10',
          borderColor: 'border-slate-blue/40'
        };
      case 'rendering':
        return {
          icon: Loader2,
          label: 'Rendering Video',
          description: `Progress: ${progress}%`,
          color: 'slate-blue',
          bgColor: 'bg-slate-blue/10',
          borderColor: 'border-slate-blue/40'
        };
      case 'healing':
        return {
          icon: RefreshCw,
          label: 'Self-Healing Code',
          description: `Fixing syntax error (attempt ${healingAttempt}/${maxHealingAttempts})`,
          color: 'warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/40'
        };
      case 'complete':
        return {
          icon: Check,
          label: 'Render Complete',
          description: 'Video ready to play',
          color: 'success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/40'
        };
      case 'error':
        return {
          icon: AlertCircle,
          label: 'Render Failed',
          description: error || 'Unknown error occurred',
          color: 'destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/40'
        };
      default:
        return {
          icon: Loader2,
          label: 'Processing',
          description: 'Please wait...',
          color: 'slate-blue',
          bgColor: 'bg-slate-blue/10',
          borderColor: 'border-slate-blue/40'
        };
    }
  };

  const config = getStateConfig();
  const IconComponent = config.icon;

  // Calculate pulsing glow intensity
  const glowIntensity = Math.sin(pulsePhase * Math.PI / 180) * 0.3 + 0.5;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`p-4 rounded-2xl border ${config.bgColor} ${config.borderColor} overflow-hidden relative`}
        style={{
          boxShadow: (state === 'rendering' || state === 'compiling')
            ? `0 0 ${20 + glowIntensity * 20}px rgba(128, 151, 179, ${glowIntensity * 0.4})`
            : undefined
        }}
      >
        {/* Animated background gradient for rendering state */}
        {(state === 'rendering' || state === 'compiling') && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-blue/10 to-transparent"
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        )}

        <div className="relative flex items-center gap-3">
          {/* Icon with animation */}
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            bg-${config.color}/20 text-${config.color}
          `}
          style={{
            backgroundColor: `hsl(var(--${config.color}) / 0.2)`,
            color: `hsl(var(--${config.color}))`
          }}
          >
            {state === 'rendering' || state === 'compiling' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <IconComponent className="w-5 h-5" />
              </motion.div>
            ) : state === 'healing' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <IconComponent className="w-5 h-5" />
              </motion.div>
            ) : (
              <IconComponent className="w-5 h-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold tracking-wide`}
                style={{ color: `hsl(var(--${config.color}))` }}
              >
                {config.label}
              </span>
            </div>
            <span className="text-xs text-charcoal/60 tracking-wide">
              {config.description}
            </span>
          </div>

          {/* Progress indicator for rendering */}
          {state === 'rendering' && (
            <div className="text-sm font-bold text-slate-blue">
              {progress}%
            </div>
          )}
        </div>

        {/* Progress bar for rendering */}
        {state === 'rendering' && (
          <div className="mt-3 h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-slate-blue rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* Self-healing progress */}
        {state === 'healing' && (
          <div className="mt-3 flex gap-1">
            {Array.from({ length: maxHealingAttempts }).map((_, i) => (
              <motion.div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < healingAttempt ? 'bg-warning' : 'bg-charcoal/10'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: i === healingAttempt - 1 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.5, repeat: i === healingAttempt - 1 ? Infinity : 0 }}
              />
            ))}
          </div>
        )}

        {/* Video preview button when complete */}
        {state === 'complete' && videoUrl && (
          <motion.a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block w-full py-2 px-4 rounded-xl bg-success/20 text-success text-center text-sm font-medium hover:bg-success/30 transition-smooth"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            🎬 View Rendered Video
          </motion.a>
        )}
      </motion.div>
    </AnimatePresence>
  );
}