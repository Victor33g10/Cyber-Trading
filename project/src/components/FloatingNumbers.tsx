import React from 'react';
import { OptimizedMotion } from './OptimizedMotion';
import { useDeviceDetection } from '../hooks/useDeviceDetection';

export const FloatingNumbers: React.FC = () => {
  const { isMobile, isLowPerformance } = useDeviceDetection();
  
  const numbers = [
    '+1.25%', '-0.87%', '+2.34%', '+0.95%', '-1.12%', '+3.45%', 
    '$1,234', '$987', '$2,456', '$1,789', '$3,210', '$876'
  ];

  // Reduzir números em dispositivos de baixa performance
  const displayNumbers = isLowPerformance ? numbers.slice(0, 6) : numbers;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {displayNumbers.map((number, index) => (
        <OptimizedMotion
          key={index}
          className={`absolute text-sm font-mono font-bold ${
            number.startsWith('+') ? 'text-red-400' : 
            number.startsWith('-') ? 'text-red-400' : 'text-red-300'
          }`}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: 0,
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: isLowPerformance ? 5 : isMobile ? 4.5 : Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
          style={{
            textShadow: isLowPerformance 
              ? (number.startsWith('+') ? '0 0 4px #ef4444' : 
                 number.startsWith('-') ? '0 0 4px #ff0040' : '0 0 4px #fca5a5')
              : (number.startsWith('+') ? '0 0 8px #ef4444' : 
                 number.startsWith('-') ? '0 0 8px #ff0040' : '0 0 8px #fca5a5'),
          }}
        >
          {number}
        </OptimizedMotion>
      ))}
    </div>
  );
};