import { useRef, useState, useCallback, useEffect } from 'react';

interface SpotlightPosition {
  x: number;
  y: number;
  active: boolean;
}

export function useSpotlightEffect() {
  const ref = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState<SpotlightPosition>({ x: 0, y: 0, active: false });

  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSpotlight({ x, y, active: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setSpotlight(prev => ({ ...prev, active: false }));
  }, []);

  return {
    ref,
    spotlight,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
    style: spotlight.active ? {
      '--spotlight-x': `${spotlight.x}px`,
      '--spotlight-y': `${spotlight.y}px`,
    } as React.CSSProperties : {},
  };
}
