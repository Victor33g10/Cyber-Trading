import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLowPerformance: boolean;
  prefersReducedMotion: boolean;
  devicePixelRatio: number;
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLowPerformance: false,
    prefersReducedMotion: false,
    devicePixelRatio: 1
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // Detectar tipo de dispositivo
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;
      
      // Detectar dispositivos de baixa performance
      const isLowPerformance = 
        // Dispositivos muito pequenos
        (width <= 480) ||
        // Dispositivos com baixo pixel ratio (indicativo de hardware mais antigo)
        (devicePixelRatio < 1.5 && isMobile) ||
        // Detectar alguns dispositivos Android mais antigos
        (userAgent.includes('android') && 
         (userAgent.includes('4.') || userAgent.includes('5.') || userAgent.includes('6.'))) ||
        // Detectar iOS mais antigo
        (userAgent.includes('iphone') && 
         (userAgent.includes('os 10_') || userAgent.includes('os 11_') || userAgent.includes('os 12_'))) ||
        // Detectar se há muitos cores mas baixa frequência (indicativo de processador fraco)
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
      
      // Detectar preferência por movimento reduzido
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isLowPerformance,
        prefersReducedMotion,
        devicePixelRatio
      });
    };

    // Atualizar na inicialização
    updateDeviceInfo();
    
    // Atualizar quando a janela for redimensionada
    window.addEventListener('resize', updateDeviceInfo);
    
    // Escutar mudanças na preferência de movimento
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreferenceChange = () => updateDeviceInfo();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionPreferenceChange);
    } else {
      // Fallback para navegadores mais antigos
      mediaQuery.addListener(handleMotionPreferenceChange);
    }

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
      } else {
        mediaQuery.removeListener(handleMotionPreferenceChange);
      }
    };
  }, []);

  return deviceInfo;
};