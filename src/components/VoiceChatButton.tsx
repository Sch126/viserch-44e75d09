import { useState, useCallback } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { WaveformAnimation } from './WaveformAnimation';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceChatButtonProps {
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
}

export function VoiceChatButton({ onVoiceStart, onVoiceEnd }: VoiceChatButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleToggleVoice = useCallback(async () => {
    if (isListening) {
      setIsListening(false);
      onVoiceEnd?.();
    } else {
      setIsConnecting(true);
      
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setIsListening(true);
        onVoiceStart?.();
      } catch (error) {
        console.error('Microphone access denied:', error);
      } finally {
        setIsConnecting(false);
      }
    }
  }, [isListening, onVoiceStart, onVoiceEnd]);

  return (
    <motion.button
      onClick={handleToggleVoice}
      disabled={isConnecting}
      className={`
        relative w-full py-4 rounded-2xl border transition-all duration-300
        flex items-center justify-center gap-3 overflow-hidden
        ${isListening 
          ? 'bg-primary/10 border-primary/30 text-primary' 
          : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover hover:border-primary/20'
        }
        ${isConnecting ? 'cursor-wait' : 'cursor-pointer'}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated background glow when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              transition: { duration: 2, repeat: Infinity }
            }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-center gap-3">
        {isConnecting ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Phone className="w-5 h-5" />
            </motion.div>
            <span className="text-sm font-medium">Connecting...</span>
          </>
        ) : isListening ? (
          <>
            <WaveformAnimation isActive={isListening} />
            <span className="text-sm font-medium">Listening...</span>
            <MicOff className="w-4 h-4 opacity-60" />
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            <span className="text-sm font-medium">Voice Chat</span>
          </>
        )}
      </div>

      {/* Pulse ring animation when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary/40"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
