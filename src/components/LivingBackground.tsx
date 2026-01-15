import { motion } from 'framer-motion';

export function LivingBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Slow-moving mesh gradient blobs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(213 26% 60% / 0.3) 0%, transparent 70%)',
          filter: 'blur(80px)',
          top: '-10%',
          left: '-10%',
        }}
        animate={{
          x: [0, 150, 50, 0],
          y: [0, 80, 180, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(44 86% 45% / 0.25) 0%, transparent 70%)',
          filter: 'blur(60px)',
          bottom: '-5%',
          right: '-5%',
        }}
        animate={{
          x: [0, -100, -50, 0],
          y: [0, -120, -50, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5,
        }}
      />
      
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(213 20% 52% / 0.3) 0%, transparent 70%)',
          filter: 'blur(70px)',
          top: '40%',
          left: '30%',
        }}
        animate={{
          x: [0, -80, 100, 0],
          y: [0, 100, -60, 0],
          scale: [1, 1.2, 0.85, 1],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 10,
        }}
      />

      {/* Extra subtle accent blob */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-8"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(43 18% 80% / 0.4) 0%, transparent 70%)',
          filter: 'blur(50px)',
          top: '20%',
          right: '20%',
        }}
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -80, 60, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 15,
        }}
      />
    </div>
  );
}
