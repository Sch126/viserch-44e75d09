import { useRef, useCallback, useState, useEffect } from 'react';

interface MagneticPosition {
  x: number;
  y: number;
}

export function useMagneticEffect(strength: number = 0.3, radius: number = 100) {
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<MagneticPosition>({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
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
  }, [strength, radius]);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const parent = element.closest('.magnetic-container') || document;
    parent.addEventListener('mousemove', handleMouseMove as EventListener);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      parent.removeEventListener('mousemove', handleMouseMove as EventListener);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { ref, position };
}
