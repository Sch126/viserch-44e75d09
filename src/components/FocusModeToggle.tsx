import { Focus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FocusModeToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export function FocusModeToggle({ isActive, onToggle }: FocusModeToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-smooth ${
        isActive
          ? 'bg-slate-blue text-white shadow-lg'
          : 'glass-panel text-charcoal/70 hover:text-charcoal'
      }`}
      style={isActive ? { boxShadow: '0 0 20px rgba(128, 151, 179, 0.4)' } : {}}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Focus className="w-4 h-4" />
      <span className="text-sm font-medium tracking-wide">Focus Mode</span>
      <div
        className={`w-8 h-4 rounded-full transition-smooth relative ${
          isActive ? 'bg-white/30' : 'bg-charcoal/20'
        }`}
      >
        <motion.div
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-smooth ${
            isActive ? 'bg-white' : 'bg-charcoal/40'
          }`}
          animate={{ left: isActive ? '16px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </motion.button>
  );
}
