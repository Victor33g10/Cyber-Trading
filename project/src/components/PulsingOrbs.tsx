import React from 'react';
import { OptimizedMotion } from './OptimizedMotion';
import { useDeviceDetection } from '../hooks/useDeviceDetection';

export const PulsingOrbs: React.FC = () => {
  const { isMobile, isLowPerformance } = useDeviceDetection();
  
  // Reduzir número de orbs em dispositivos móveis e de baixa performance
  const orbCount = isLowPerformance ? 4 : isMobile ? 6 : 8;
  const orbs = Array.from({ length: orbCount }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <OptimizedMotion
          key={orb}
          className="absolute rounded-full"
          style={{
            background: isLowPerformance 
              ? 'radial-gradient(circle, rgba(248,113,113,0.2) 0%, rgba(239,68,68,0.05) 50%, transparent 100%)'
              : 'radial-gradient(circle, rgba(248,113,113,0.3) 0%, rgba(239,68,68,0.1) 50%, transparent 100%)',
            width: Math.random() * (isLowPerformance ? 60 : 100) + (isLowPerformance ? 30 : 50),
            height: Math.random() * (isLowPerformance ? 60 : 100) + (isLowPerformance ? 30 : 50),
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
          }}
          animate={{
            scale: [1, isLowPerformance ? 1.3 : 1.5, 1],
            opacity: [0.3, isLowPerformance ? 0.5 : 0.7, 0.3],
          }}
          transition={{
            duration: isLowPerformance ? 4 : isMobile ? 3.5 : Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};