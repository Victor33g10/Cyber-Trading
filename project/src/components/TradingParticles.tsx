import React from 'react';
import { OptimizedMotion } from './OptimizedMotion';
import { useDeviceDetection } from '../hooks/useDeviceDetection';

export const TradingParticles: React.FC = () => {
  const { isMobile, isLowPerformance } = useDeviceDetection();
  
  // Reduzir número de partículas em dispositivos móveis e de baixa performance
  const particleCount = isLowPerformance ? 8 : isMobile ? 12 : 20;
  const particles = Array.from({ length: particleCount }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <OptimizedMotion
          key={particle}
          className="absolute w-1 h-1 bg-red-400 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: typeof window !== 'undefined' ? window.innerHeight + 10 : 800,
            opacity: 0,
          }}
          animate={{
            y: -10,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: isLowPerformance ? 4 : isMobile ? 3.5 : Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "linear",
          }}
          style={{
            boxShadow: isLowPerformance 
              ? '0 0 3px #ef4444' 
              : '0 0 6px #ef4444, 0 0 12px #ef4444',
          }}
        />
      ))}
    </div>
  );
};