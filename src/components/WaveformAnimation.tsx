import { motion } from 'framer-motion';

interface WaveformAnimationProps {
  isActive: boolean;
  barCount?: number;
}

export function WaveformAnimation({ isActive, barCount = 5 }: WaveformAnimationProps) {
  return (
    <div className="flex items-center justify-center gap-1 h-6">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-primary"
          initial={{ height: 4 }}
          animate={isActive ? {
            height: [4, 16, 8, 20, 4],
            transition: {
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            },
          } : {
            height: 4,
            transition: { duration: 0.3 },
          }}
        />
      ))}
    </div>
  );
}
