import { forwardRef, useRef, useCallback, useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  strength?: number;
  radius?: number;
}

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, className = '', onClick, disabled = false, strength = 0.4, radius = 120 }, forwardedRef) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const ref = (forwardedRef as React.RefObject<HTMLButtonElement>) || internalRef;
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: MouseEvent) => {
      const element = ref.current;
      if (!element || disabled) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < radius) {
        const pull = (1 - distance / radius) * strength;
        setPosition({
          x: distanceX * pull,
          y: distanceY * pull,
        });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    }, [radius, strength, disabled, ref]);

    const handleMouseLeave = useCallback(() => {
      setPosition({ x: 0, y: 0 });
    }, []);

    useEffect(() => {
      const element = ref.current;
      if (!element) return;

      // Listen on parent container for better magnetic effect range
      const container = element.closest('.magnetic-container') || document.body;
      container.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, [handleMouseMove, handleMouseLeave, ref]);

    return (
      <motion.button
        ref={ref}
        className={className}
        onClick={onClick}
        disabled={disabled}
        animate={{
          x: position.x,
          y: position.y,
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 15,
          mass: 0.1,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.button>
    );
  }
);

MagneticButton.displayName = 'MagneticButton';
