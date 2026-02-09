import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Upload,
  Loader2,
  Binary,
  Cpu,
  Network,
  Waves,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  DollarSign,
  BarChart3,
  LineChart,
  Activity,
  Zap,
  Target,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import { Toaster, toast } from 'react-hot-toast';
import { SuccessNotification } from './components/SuccessNotification';
import { TradingParticles } from './components/TradingParticles';
import { FloatingNumbers } from './components/FloatingNumbers';
import { PulsingOrbs } from './components/PulsingOrbs';
import { MarketNews } from './components/MarketNews';
import { OptimizedMotion } from './components/OptimizedMotion';
import { useDeviceDetection } from './hooks/useDeviceDetection';

type Sinal = {
  direcao: 'compra' | 'venda';
  confianca: number;
  tempo: string;
};

type Notification = {
  id: number;
  message: string;
};

function App() {
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [analisando, setAnalisando] = useState(false);
  const [sinal, setSinal] = useState<Sinal | null>(null);
  const [etapaAnalise, setEtapaAnalise] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isValidChart, setIsValidChart] = useState<boolean | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationIdRef = useRef(0);
  
  // Hook para detectar dispositivo
  const { isMobile, isLowPerformance, prefersReducedMotion } = useDeviceDetection();

  const showSuccessNotification = () => {
    const pessoas = Math.floor(Math.random() * (987 - 198 + 1)) + 198;
    const newNotification = {
      id: notificationIdRef.current++,
      message: `${pessoas} traders lucraram com o sinal no ultimo minuto!`
    };
    setNotifications(prev => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  useEffect(() => {
    // Primeira notificação após 5 segundos
    const initialTimer = setTimeout(() => {
      showSuccessNotification();
    }, 5000);

    // Notificações subsequentes a cada 90 segundos
    const intervalTimer = setInterval(() => {
      showSuccessNotification();
    }, 90000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  const playAudio = async () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://codigofonte.site/0imagens/APPLEFACE.mp3');
      }
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const verificarGrafico = async (imageUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (!ctx) {
          resolve(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Características específicas do gráfico Avant
        let greenPixels = 0;
        let redPixels = 0;
        let darkBackgroundPixels = 0;
        let gridPixels = 0;
        let avantLogoPixels = 0;
        let interfaceElements = 0;
        const totalPixels = canvas.width * canvas.height;
        
        // Análise mais detalhada dos pixels
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // Velas verdes (mais preciso)
          if (g > 150 && r < 100 && b < 100) {
            greenPixels++;
          }
          // Velas vermelhas (mais preciso)
          else if (r > 150 && g < 100 && b < 100) {
            redPixels++;
          }
          // Fundo escuro característico
          else if (r < 40 && g < 40 && b < 40) {
            darkBackgroundPixels++;
          }
          // Grade do gráfico
          else if (Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && r > 30 && r < 70) {
            gridPixels++;
          }
          // Logo Avant e elementos de interface
          else if ((Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && r > 150) ||
                   (r > 200 && g > 200 && b > 200)) {
            interfaceElements++;
          }
        }

        // Cálculo de porcentagens e verificações
        const candlePixelsPercentage = ((greenPixels + redPixels) / totalPixels) * 100;
        const darkBackgroundPercentage = (darkBackgroundPixels / totalPixels) * 100;
        const gridPercentage = (gridPixels / totalPixels) * 100;
        const interfacePercentage = (interfaceElements / totalPixels) * 100;

        // Critérios mais precisos baseados nas imagens de exemplo
        const hasCandles = candlePixelsPercentage > 0.1 && candlePixelsPercentage < 20;
        const hasDarkTheme = darkBackgroundPercentage > 40;
        const hasGrid = gridPercentage > 0.05 && gridPercentage < 15;
        const hasInterface = interfacePercentage > 0.1 && interfacePercentage < 25;
        const hasProperRatio = canvas.width / canvas.height > 1.2;

        // Sistema de pontuação ponderado
        let score = 0;
        if (hasCandles) score += 35;
        if (hasDarkTheme) score += 25;
        if (hasGrid) score += 20;
        if (hasInterface) score += 15;
        if (hasProperRatio) score += 5;

        const isChart = score >= 75; // Aumentado o limite mínimo para maior precisão

        if (!isChart) {
          toast.error('Esta imagem não parece ser um gráfico válido da Avant. Por favor, envie uma captura de tela do gráfico de trading com velas.', {
            duration: 5000,
            icon: '⚠️',
          });
        }

        resolve(isChart);
      };
      
      img.onerror = () => {
        toast.error('Não foi possível carregar a imagem. Por favor, tente novamente.', {
          duration: 3000,
          icon: '❌',
        });
        resolve(false);
      };
      img.src = imageUrl;
    });
  };

  const selecionarArquivo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0];
    if (arquivo) {
      const url = URL.createObjectURL(arquivo);
      
      const isValid = await verificarGrafico(url);
      
      if (!isValid) {
        setIsValidChart(false);
        setArquivoSelecionado(null);
        setUrlPreview(null);
      } else {
        setIsValidChart(true);
        setArquivoSelecionado(arquivo);
        setUrlPreview(url);
        setSinal(null); // Reset signal when new file is selected
        
        setTimeout(() => {
          if (previewRef.current) {
            previewRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  const resetarAnalise = () => {
    setArquivoSelecionado(null);
    setUrlPreview(null);
    setSinal(null);
    setAnalisando(false);
    setEtapaAnalise(0);
    setIsValidChart(null);
    
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  useEffect(() => {
    if (sinal && resultadoRef.current) {
      resultadoRef.current.scrollIntoView({ behavior: 'smooth' });
      playAudio();
    }
  }, [sinal]);

  const analisarGrafico = async () => {
    if (!isValidChart) {
      toast.error('Por favor, selecione uma imagem válida de um gráfico de trading.', {
        duration: 4000,
        icon: '⚠️',
      });
      return;
    }

    setAnalisando(true);
    setSinal(null);
    setEtapaAnalise(0);
    
    // Play audio when analysis starts
    playAudio();
    
    const etapas = [
      "Processando imagem...",
      "Identificando padrões...",
      "Analisando tendências...",
      "Calculando indicadores...",
      "Gerando previsão...",
      "Finalizando análise...",
      "Validando resultados..."
    ];

    for (let i = 0; i < etapas.length; i++) {
      setEtapaAnalise(i);
      await new Promise(resolve => setTimeout(resolve, isLowPerformance ? 1500 : 1200));
    }
    
    const direcao = Math.random() > 0.5 ? 'compra' : 'venda';
    const confianca = Math.floor(Math.random() * 40) + 60;
    const tempo = Math.random() > 0.5 ? '1m' : '5m';
    
    setSinal({
      direcao,
      confianca,
      tempo
    });
    
    setAnalisando(false);
  };

  const BrokerButton = () => (
    <a
      href="https://avantxgroup.com/?ref=HTTPSAVANTXGROUPCOMREFCML42QWTA0C65MW092I70EPKX"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center py-3 px-6 rounded-xl bg-gradient-to-r from-red-400 to-red-600 hover:from-red-300 hover:to-red-500 text-white font-bold transition-all duration-300 shadow-lg shadow-red-500/50 hover:shadow-red-400/70 text-sm neon-glow animate-pulse-glow"
    >
      <ExternalLink className="w-5 h-5 mr-2" />
      Abrir Corretora
    </a>
  );

  const FloatingIcon = ({ Icon, delay = 0, className = "" }: { Icon: any, delay?: number, className?: string }) => (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: [0.3, 1, 0.3],
        y: [0, isLowPerformance ? -10 : -20, 0],
        rotate: [0, isLowPerformance ? 180 : 360]
      }}
      transition={{ 
        duration: isLowPerformance ? 6 : 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className={`absolute ${className}`}
    >
      <Icon className="w-6 h-6 text-red-400 neon-glow" />
    </OptimizedMotion>
  );

  // Configurações de animação sincronizadas para as flechas do título
  const titleArrowAnimationConfig = {
    rotate: [0, 360],
    scale: [1, isLowPerformance ? 1.05 : 1.1, 1]
  };

  const titleArrowTransitionConfig = {
    duration: isLowPerformance ? 4 : 3,
    repeat: Infinity,
    ease: "easeInOut" as const
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <Toaster position="top-center" />
      
      {/* Animated Background with Earth at the top */}
      <div className="absolute inset-0">
        {/* Earth Background - Positioned at the top */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-0">
          <OptimizedMotion
            animate={{ rotate: 360 }}
            transition={{ 
              duration: isLowPerformance ? 300 : 200, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className={`${isLowPerformance ? 'w-[60vh] h-[60vh]' : 'w-[80vh] h-[80vh]'} opacity-30`}
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2074)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '50%',
              filter: isLowPerformance 
                ? 'brightness(0.8) contrast(1.2) saturate(1.5) hue-rotate(300deg)'
                : 'brightness(0.8) contrast(1.3) saturate(1.8) hue-rotate(300deg)',
              boxShadow: isLowPerformance
                ? '0 0 100px rgba(239, 68, 68, 0.3), inset 0 0 50px rgba(248, 113, 113, 0.2)'
                : '0 0 200px rgba(239, 68, 68, 0.4), inset 0 0 100px rgba(248, 113, 113, 0.3)',
            }}
          />
          
          {/* Earth atmosphere glow */}
          <OptimizedMotion
            animate={{ 
              scale: [1, 1.02, 1],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ 
              duration: isLowPerformance ? 8 : 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
              isLowPerformance ? 'w-[70vh] h-[70vh]' : 'w-[90vh] h-[90vh]'
            } rounded-full`}
            style={{
              background: 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(248,113,113,0.2) 20%, rgba(252,165,165,0.1) 40%, transparent 70%)',
            }}
          />
          
          {/* Additional space glow */}
          <OptimizedMotion
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: -360
            }}
            transition={{ 
              duration: isLowPerformance ? 400 : 300, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
              isLowPerformance ? 'w-[80vh] h-[80vh]' : 'w-[100vh] h-[100vh]'
            } rounded-full`}
            style={{
              background: 'conic-gradient(from 0deg, rgba(248,113,113,0.1) 0%, rgba(239,68,68,0.05) 25%, rgba(252,165,165,0.1) 50%, rgba(248,113,113,0.05) 75%, rgba(248,113,113,0.1) 100%)',
            }}
          />
        </div>
        
        {/* Original gradient overlays - positioned above Earth */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-red-950/15 to-black/60 z-10" />
        <div className="absolute inset-0 bg-black/30 z-10" />
        
        {/* Neon Grid Lines - Simplificadas para mobile */}
        {!isLowPerformance && (
          <div className="absolute inset-0 opacity-20 z-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-pulse" 
                 style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 98px, #ef4444 100px)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent animate-pulse" 
                 style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 98px, #dc2626 100px)' }} />
          </div>
        )}
      </div>

      {/* Trading Particles */}
      <TradingParticles />
      
      {/* Floating Numbers */}
      <FloatingNumbers />
      
      {/* Pulsing Orbs */}
      <PulsingOrbs />
      
      {/* Floating Trading Icons - Reduzidos para mobile */}
      {!isLowPerformance && (
        <>
          <FloatingIcon Icon={DollarSign} delay={0} className="top-20 left-10 z-30" />
          <FloatingIcon Icon={BarChart3} delay={1} className="top-32 right-20 z-30" />
          <FloatingIcon Icon={LineChart} delay={2} className="bottom-40 left-16 z-30" />
          <FloatingIcon Icon={Activity} delay={3} className="bottom-20 right-10 z-30" />
          {!isMobile && (
            <>
              <FloatingIcon Icon={Zap} delay={0.5} className="top-1/2 left-8 z-30" />
              <FloatingIcon Icon={Target} delay={1.5} className="top-1/3 right-12 z-30" />
              <FloatingIcon Icon={TrendingDown} delay={2.5} className="bottom-1/3 left-20 z-30" />
            </>
          )}
        </>
      )}
      
      <AnimatePresence>
        {notifications.map(notification => (
          <SuccessNotification
            key={notification.id}
            message={notification.message}
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          />
        ))}
      </AnimatePresence>

      <OptimizedMotion 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 relative z-40"
      >
        <header className="flex items-center justify-center mb-12 relative">
          {/* Rotating Neon Rings - Simplificados para mobile */}
          {!isLowPerformance && (
            <>
              <OptimizedMotion
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: isLowPerformance ? 30 : 20, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute w-64 h-64 border-2 border-red-400/30 rounded-full neon-ring"
              />
              <OptimizedMotion
                animate={{ rotate: -360 }}
                transition={{ 
                  duration: isLowPerformance ? 20 : 15, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute w-48 h-48 border-2 border-red-500/30 rounded-full neon-ring"
              />
              <OptimizedMotion
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: isLowPerformance ? 35 : 25, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute w-32 h-32 border-2 border-red-300/40 rounded-full neon-ring"
              />
            </>
          )}
          
          <div className="relative z-10 text-center">
            <OptimizedMotion
              className="flex items-center justify-center gap-4 mb-2"
              animate={{ 
                textShadow: isLowPerformance ? [
                  "0 0 5px #ef4444",
                  "0 0 10px #ef4444",
                  "0 0 5px #ef4444"
                ] : [
                  "0 0 10px #ef4444",
                  "0 0 20px #ef4444, 0 0 30px #dc2626",
                  "0 0 10px #ef4444"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Flecha esquerda - Sincronizada */}
              <OptimizedMotion
                animate={titleArrowAnimationConfig}
                transition={titleArrowTransitionConfig}
              >
                <TrendingUp className="w-12 h-12 text-red-400 neon-glow" />
              </OptimizedMotion>
              
              <h1 className={`${isMobile ? 'text-4xl' : 'text-6xl'} font-bold text-white neon-text`}>
                Cyber Trading
              </h1>
              
              {/* Flecha direita - Sincronizada (mesma animação) */}
              <OptimizedMotion
                animate={titleArrowAnimationConfig}
                transition={titleArrowTransitionConfig}
                className="scale-x-[-1]"
              >
                <TrendingUp className="w-12 h-12 text-red-400 neon-glow" />
              </OptimizedMotion>
            </OptimizedMotion>
            <OptimizedMotion 
              className={`${isMobile ? 'text-xl' : 'text-2xl'} text-red-300 mt-2 neon-text-small`}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Análises com Inteligência Artificial
            </OptimizedMotion>
            <div className="mt-6">
              <BrokerButton />
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto">
          <OptimizedMotion 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-red-500/30 relative overflow-hidden neon-border mobile-optimized"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-red-950/20 to-black/40" />
            
            {/* Animated Corner Elements */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-red-400 neon-corner animate-pulse" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-red-400 neon-corner animate-pulse" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-red-400 neon-corner animate-pulse" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-red-400 neon-corner animate-pulse" />
            
            <div className="relative">
              <div className="mb-8">
                <label className={`block text-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 hover:bg-black/40 group relative overflow-hidden ${
                  isValidChart === false 
                    ? 'border-red-500/50 bg-red-500/5 neon-border-red' 
                    : isValidChart === true
                      ? 'border-red-400/70 bg-red-500/10 neon-border-success'
                      : 'border-gray-600 hover:border-red-400 hover:neon-border'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={selecionarArquivo}
                    className="hidden"
                  />
                  
                  {/* Animated Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {isValidChart === false ? (
                    <OptimizedMotion
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400 neon-glow-red" />
                    </OptimizedMotion>
                  ) : (
                    <OptimizedMotion
                      animate={{ 
                        y: [0, isLowPerformance ? -5 : -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: isLowPerformance ? 3 : 2, 
                        repeat: Infinity 
                      }}
                    >
                      <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400 group-hover:text-red-400 transition-colors neon-glow" />
                    </OptimizedMotion>
                  )}
                  <p className={`text-lg ${
                    isValidChart === false 
                      ? 'text-red-400 neon-text-red' 
                      : 'text-gray-300 group-hover:text-red-300 neon-text-small'
                  } transition-colors relative z-10`}>
                    {isValidChart === false 
                      ? 'Imagem inválida. Selecione um gráfico de trading.'
                      : arquivoSelecionado 
                        ? arquivoSelecionado.name 
                        : 'Enviar imagem do gráfico'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 relative z-10">
                    Selecione uma imagem nítida do gráfico
                  </p>
                </label>
              </div>

              <AnimatePresence>
                {urlPreview && isValidChart && (
                  <motion.div 
                    ref={previewRef}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="mb-8 relative"
                  >
                    <div className="relative rounded-2xl overflow-hidden border-2 border-red-400/50 neon-border">
                      <img
                        src={urlPreview}
                        alt="Gráfico selecionado"
                        className="w-full shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 via-transparent to-red-500/10 pointer-events-none" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={analisarGrafico}
                disabled={!isValidChart || analisando || sinal !== null}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg relative overflow-hidden ${
                  !isValidChart || analisando || sinal !== null
                    ? 'bg-gray-900 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white neon-button'
                } transition-all duration-300`}
              >
                {/* Animated Background for Active Button */}
                {isValidChart && !analisando && sinal === null && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-red-500/20 to-red-400/20 animate-pulse" />
                )}
                
                <div className="relative z-10">
                  {analisando ? (
                    <div className="flex items-center justify-center space-x-4">
                      <OptimizedMotion
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-6 h-6" />
                      </OptimizedMotion>
                      <OptimizedMotion
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {["Processando imagem...", "Identificando padrões...", "Analisando tendências...", "Calculando indicadores...", "Gerando previsão...", "Finalizando análise...", "Validando resultados..."][etapaAnalise]}
                      </OptimizedMotion>
                    </div>
                  ) : sinal !== null ? (
                    'Análise Concluída'
                  ) : (
                    'Analisar Gráfico'
                  )}
                </div>
              </motion.button>

              <AnimatePresence>
                {analisando && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-8 flex justify-around"
                  >
                    {[Binary, Cpu, Network, Waves].map((Icon, index) => (
                      <OptimizedMotion
                        key={index}
                        animate={{ 
                          y: [0, isLowPerformance ? -8 : -15, 0],
                          opacity: [0.3, 1, 0.3],
                          scale: [0.8, isLowPerformance ? 1.1 : 1.2, 0.8]
                        }}
                        transition={{ 
                          duration: isLowPerformance ? 2 : 1.5, 
                          repeat: Infinity, 
                          delay: index * 0.2,
                          ease: "easeInOut"
                        }}
                      >
                        <Icon className="w-8 h-8 text-red-400 neon-glow" />
                      </OptimizedMotion>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {sinal && (
                  <motion.div 
                    ref={resultadoRef}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.9 }}
                    className="mt-8 p-8 bg-black/80 backdrop-blur-xl rounded-2xl border-2 border-red-400/50 relative overflow-hidden neon-result mobile-optimized"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-red-950/20 to-red-950/20" />
                    
                    {/* Animated Result Background */}
                    {!isLowPerformance && (
                      <div className="absolute inset-0 opacity-10">
                        <OptimizedMotion
                          animate={{ 
                            background: [
                              "radial-gradient(circle at 20% 50%, #ef4444 0%, transparent 50%)",
                              "radial-gradient(circle at 80% 50%, #dc2626 0%, transparent 50%)",
                              "radial-gradient(circle at 50% 20%, #ef4444 0%, transparent 50%)",
                              "radial-gradient(circle at 50% 80%, #dc2626 0%, transparent 50%)"
                            ]
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="w-full h-full"
                        />
                      </div>
                    )}
                    
                    <div className="relative z-10">
                      <motion.h2 
                        initial={{ x: -20 }}
                        animate={{ x: 0 }}
                        className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mb-8 text-white neon-text text-center`}
                      >
                        🎯 Resultado da Análise
                      </motion.h2>
                      
                      <div className="space-y-8">
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center justify-center"
                        >
                          <div className={`flex items-center ${isMobile ? 'text-xl' : 'text-2xl'} font-bold ${
                            sinal.direcao === 'compra' ? 'text-green-400 neon-text-green' : 'text-red-400 neon-text-red'
                          }`}>
                            <OptimizedMotion
                              animate={{ 
                                scale: [1, isLowPerformance ? 1.1 : 1.2, 1],
                                rotate: sinal.direcao === 'compra' ? [0, 360] : [0, -360]
                              }}
                              transition={{ 
                                duration: isLowPerformance ? 3 : 2, 
                                repeat: Infinity 
                              }}
                              className="mr-4"
                            >
                              {sinal.direcao === 'compra' ? (
                                <ArrowUpCircle className="w-12 h-12 neon-glow-green" />
                              ) : (
                                <ArrowDownCircle className="w-12 h-12 neon-glow-red" />
                              )}
                            </OptimizedMotion>
                            <OptimizedMotion
                              animate={{ 
                                textShadow: sinal.direcao === 'compra' 
                                  ? isLowPerformance 
                                    ? ["0 0 5px #00ff40", "0 0 10px #00ff40", "0 0 5px #00ff40"]
                                    : ["0 0 10px #00ff40", "0 0 20px #00ff40, 0 0 30px #40ff80", "0 0 10px #00ff40"]
                                  : isLowPerformance
                                    ? ["0 0 5px #ff0040", "0 0 10px #ff0040", "0 0 5px #ff0040"]
                                    : ["0 0 10px #ff0040", "0 0 20px #ff0040, 0 0 30px #ff8080", "0 0 10px #ff0040"]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {sinal.direcao.toUpperCase()}
                            </OptimizedMotion>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="space-y-4"
                        >
                          <div className="text-center">
                            <span className="text-gray-300 text-lg">Confiança:</span>
                            <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mt-2 ${
                              sinal.direcao === 'compra' ? 'text-green-400 neon-text-green' : 'text-red-400 neon-text-red'
                            }`}>
                              {sinal.confianca}%
                            </div>
                          </div>
                          <div className="relative">
                            <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-red-500/30">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${sinal.confianca}%` }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className={`h-full relative ${
                                  sinal.direcao === 'compra' 
                                    ? 'bg-gradient-to-r from-green-600 via-green-400 to-green-500 neon-progress-green' 
                                    : 'bg-gradient-to-r from-red-600 via-red-400 to-red-500 neon-progress-red'
                                }`}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="flex items-center justify-center"
                        >
                          <span className="text-gray-300 text-lg mr-4">Tempo:</span>
                          <OptimizedMotion 
                            className={`font-mono px-6 py-3 rounded-xl font-bold ${isMobile ? 'text-lg' : 'text-xl'} ${
                              sinal.direcao === 'compra' 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-black neon-badge-green'
                                : 'bg-gradient-to-r from-red-500 to-red-600 text-black neon-badge-red'
                            }`}
                            animate={{ 
                              boxShadow: sinal.direcao === 'compra'
                                ? isLowPerformance
                                  ? ["0 0 5px #00ff40", "0 0 10px #00ff40", "0 0 5px #00ff40"]
                                  : ["0 0 10px #00ff40", "0 0 20px #00ff40, 0 0 30px #40ff80", "0 0 10px #00ff40"]
                                : isLowPerformance
                                  ? ["0 0 5px #ff0040", "0 0 10px #ff0040", "0 0 5px #ff0040"]
                                  : ["0 0 10px #ff0040", "0 0 20px #ff0040, 0 0 30px #ff8080", "0 0 10px #ff0040"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {sinal.tempo}
                          </OptimizedMotion>
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="pt-8 space-y-6"
                        >
                          <div className="flex justify-center">
                            <BrokerButton />
                          </div>
                          <motion.button
                            onClick={resetarAnalise}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full flex items-center justify-center py-3 px-6 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-bold transition-all duration-300 border border-red-500/30 neon-border-subtle"
                          >
                            <OptimizedMotion
                              animate={{ rotate: 360 }}
                              transition={{ 
                                duration: isLowPerformance ? 3 : 2, 
                                repeat: Infinity, 
                                ease: "linear" 
                              }}
                              className="mr-3"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </OptimizedMotion>
                            Novo Gráfico
                          </motion.button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </OptimizedMotion>
        </div>

        {/* Market News Section */}
        <MarketNews />
      </OptimizedMotion>
    </div>
  );
}

export default App;