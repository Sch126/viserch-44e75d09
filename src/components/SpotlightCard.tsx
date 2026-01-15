import { forwardRef, ReactNode, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

export const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(
  ({ children, className = '', spotlightColor = 'rgba(128, 151, 179, 0.4)', spotlightSize = 200 }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const cardRef = ref || internalRef;
    const [spotlight, setSpotlight] = useState({ x: 0, y: 0, active: false });

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      const element = (cardRef as React.RefObject<HTMLDivElement>).current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setSpotlight({ x, y, active: true });
    }, [cardRef]);

    const handleMouseLeave = useCallback(() => {
      setSpotlight(prev => ({ ...prev, active: false }));
    }, []);

    return (
      <motion.div
        ref={cardRef as React.RefObject<HTMLDivElement>}
        className={`relative overflow-hidden ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          '--spotlight-x': `${spotlight.x}px`,
          '--spotlight-y': `${spotlight.y}px`,
        } as React.CSSProperties}
      >
        {/* Spotlight overlay on border */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
          animate={{
            opacity: spotlight.active ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(${spotlightSize}px circle at var(--spotlight-x) var(--spotlight-y), ${spotlightColor}, transparent 70%)`,
            maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
            maskClip: 'padding-box, border-box',
            maskComposite: 'exclude',
            WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
            WebkitMaskClip: 'padding-box, border-box',
            WebkitMaskComposite: 'xor',
            padding: '2px',
          }}
        />
        {children}
      </motion.div>
    );
  }
);

SpotlightCard.displayName = 'SpotlightCard';
