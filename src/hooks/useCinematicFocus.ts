import { useState, useCallback, useRef, useEffect } from 'react';

export function useCinematicFocus(timeout: number = 3000) {
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerFocus = useCallback(() => {
    setIsActive(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, timeout);
  }, [timeout]);

  const resetFocus = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isActive,
    triggerFocus,
    resetFocus,
  };
}
