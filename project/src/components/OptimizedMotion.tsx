import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useDeviceDetection } from '../hooks/useDeviceDetection';

interface OptimizedMotionProps extends MotionProps {
  children: React.ReactNode;
  fallbackClassName?: string;
  mobileOptimized?: boolean;
}

export const OptimizedMotion: React.FC<OptimizedMotionProps> = ({
  children,
  fallbackClassName = '',
  mobileOptimized = true,
  animate,
  transition,
  ...props
}) => {
  const { isMobile, isLowPerformance, prefersReducedMotion } = useDeviceDetection();

  // Se o usuário prefere movimento reduzido, usar div simples
  if (prefersReducedMotion) {
    return <div className={fallbackClassName}>{children}</div>;
  }

  // Otimizar animações para dispositivos móveis e de baixa performance
  const optimizedAnimate = React.useMemo(() => {
    if (!animate) return animate;
    
    if (isLowPerformance) {
      // Para dispositivos de baixa performance, simplificar animações
      if (typeof animate === 'object') {
        const simplified = { ...animate };
        
        // Remover propriedades que consomem muito processamento
        delete simplified.filter;
        delete simplified.backdropFilter;
        
        // Simplificar transformações complexas
        if (simplified.rotate && Array.isArray(simplified.rotate)) {
          simplified.rotate = [0, 360]; // Simplificar rotação
        }
        
        if (simplified.scale && Array.isArray(simplified.scale)) {
          simplified.scale = [1, 1.05, 1]; // Simplificar escala
        }
        
        return simplified;
      }
    }
    
    if (isMobile && mobileOptimized) {
      // Para mobile, otimizar mas manter funcionalidade
      if (typeof animate === 'object') {
        const mobileOptimized = { ...animate };
        
        // Reduzir intensidade de algumas animações
        if (mobileOptimized.y && Array.isArray(mobileOptimized.y)) {
          mobileOptimized.y = mobileOptimized.y.map((val: number) => val * 0.7);
        }
        
        if (mobileOptimized.x && Array.isArray(mobileOptimized.x)) {
          mobileOptimized.x = mobileOptimized.x.map((val: number) => val * 0.7);
        }
        
        return mobileOptimized;
      }
    }
    
    return animate;
  }, [animate, isMobile, isLowPerformance, mobileOptimized]);

  const optimizedTransition = React.useMemo(() => {
    if (!transition) return transition;
    
    const baseTransition = { ...transition };
    
    if (isLowPerformance) {
      // Para dispositivos de baixa performance, animações mais lentas e suaves
      baseTransition.duration = (baseTransition.duration || 1) * 1.5;
      baseTransition.ease = 'easeOut';
      
      // Reduzir repeat para economizar recursos
      if (baseTransition.repeat === Infinity) {
        baseTransition.repeat = 10; // Limitar repetições infinitas
      }
    } else if (isMobile) {
      // Para mobile, ajustar duração ligeiramente
      baseTransition.duration = (baseTransition.duration || 1) * 1.2;
    }
    
    return baseTransition;
  }, [transition, isMobile, isLowPerformance]);

  return (
    <motion.div
      {...props}
      animate={optimizedAnimate}
      transition={optimizedTransition}
      className={`performance-optimized ${props.className || ''}`}
      style={{
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        ...props.style
      }}
    >
      {children}
    </motion.div>
  );
};