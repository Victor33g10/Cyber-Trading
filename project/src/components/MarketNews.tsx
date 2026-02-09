import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Globe,
  Clock,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { realNewsService, RealNewsItem, RealMarketData } from '../services/realNewsService';

export const MarketNews: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newsItems, setNewsItems] = useState<RealNewsItem[]>([]);
  const [marketData, setMarketData] = useState<RealMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Monitorar status de conexão
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadInitialData();
    
    // Configurar atualizações em tempo real
    const stopUpdates = realNewsService.startRealTimeUpdates((news) => {
      setNewsItems(news);
      setLastUpdate(new Date());
      setError(null);
    });

    // Atualizar dados de mercado a cada 2 minutos
    const marketInterval = setInterval(async () => {
      if (navigator.onLine) {
        try {
          const data = await realNewsService.getRealMarketData();
          setMarketData(data);
        } catch (error) {
          console.error('Erro ao atualizar dados de mercado:', error);
        }
      }
    }, 2 * 60 * 1000);

    return () => {
      stopUpdates();
      clearInterval(marketInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!navigator.onLine) {
        setError('Sem conexão com a internet. Conecte-se para ver notícias em tempo real.');
        return;
      }

      const [news, market] = await Promise.all([
        realNewsService.getLatestNews(),
        realNewsService.getRealMarketData()
      ]);
      
      setNewsItems(news);
      setMarketData(market);
      setLastUpdate(new Date());
      
      if (news.length === 0) {
        setError('Nenhuma notícia encontrada. Tentando novamente...');
        setTimeout(loadInitialData, 10000);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar notícias em tempo real. Tentando novamente...');
      
      // Tentar novamente após 10 segundos
      setTimeout(loadInitialData, 10000);
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = async () => {
    if (!navigator.onLine) {
      setError('Sem conexão com a internet');
      return;
    }
    
    setLoading(true);
    await loadInitialData();
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-red-300" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'border-red-400/30 bg-red-500/5';
      case 'negative':
        return 'border-red-400/30 bg-red-500/5';
      default:
        return 'border-red-300/30 bg-red-500/5';
    }
  };

  const formatMarketValue = (value: number, symbol: string) => {
    if (symbol.includes('USD') || symbol.includes('EUR') || symbol.includes('JPY')) {
      return value.toFixed(4);
    }
    if (symbol.includes('BTC') || symbol.includes('ETH')) {
      return `$${value.toLocaleString()}`;
    }
    if (symbol.includes('PEPE')) {
      return value.toFixed(8);
    }
    return `$${value.toFixed(2)}`;
  };

  const getConnectionStatus = () => {
    if (!isOnline) {
      return { icon: WifiOff, text: 'Offline', color: 'text-red-400' };
    }
    if (error) {
      return { icon: AlertCircle, text: 'Erro de conexão', color: 'text-yellow-400' };
    }
    return { icon: Wifi, text: 'Conectado - Tempo Real', color: 'text-red-400' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mt-12"
    >
      <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-4 md:p-8 shadow-2xl border-2 border-red-500/30 relative overflow-hidden neon-border">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-red-950/20 to-black/40" />
        
        {/* Animated Corner Elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-red-400 neon-corner animate-pulse" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-red-400 neon-corner animate-pulse" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-red-400 neon-corner animate-pulse" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-red-400 neon-corner animate-pulse" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <motion.div 
              className="flex items-center gap-4"
              animate={{ 
                textShadow: [
                  "0 0 10px #ef4444",
                  "0 0 20px #ef4444, 0 0 30px #dc2626",
                  "0 0 10px #ef4444"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Globe className="w-6 md:w-8 h-6 md:h-8 text-red-400 neon-glow" />
              </motion.div>
              <div>
                <h2 className="text-xl md:text-3xl font-bold text-white neon-text">
                  📈 Notícias em Tempo Real
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <connectionStatus.icon className={`w-4 h-4 ${connectionStatus.color}`} />
                    </motion.div>
                    <span className={`text-xs sm:text-sm font-medium ${connectionStatus.color}`}>
                      {connectionStatus.text}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-400">
                    {error ? error : `Última atualização: ${lastUpdate.toLocaleTimeString('pt-BR')}`}
                  </span>
                </div>
              </div>
            </motion.div>
            
            {/* Mobile-optimized buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <motion.button
                onClick={refreshNews}
                disabled={loading || !isOnline}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all duration-300 border border-red-500/30 text-sm ${
                  loading || !isOnline 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white neon-border-subtle'
                }`}
              >
                <motion.div
                  animate={{ rotate: loading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                >
                  {loading ? <Loader2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                </motion.div>
                <span className="whitespace-nowrap">
                  {loading ? 'Atualizando...' : 'Atualizar'}
                </span>
              </motion.button>
              
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold transition-all duration-300 neon-button text-sm min-h-[48px]"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </motion.div>
                <span className="whitespace-nowrap">
                  {isExpanded ? 'Ocultar Notícias' : 'Mostrar Notícias'}
                </span>
              </motion.button>
            </div>
          </div>

          {/* Market Summary - Always Visible */}
          <motion.div
            className="mb-6 p-4 md:p-6 rounded-2xl bg-gradient-to-r from-red-950/30 via-red-950/30 to-red-950/30 border-2 border-red-400/30 relative overflow-hidden"
            animate={{ 
              boxShadow: [
                "0 0 10px rgba(239,68,68,0.3)",
                "0 0 20px rgba(239,68,68,0.5)",
                "0 0 10px rgba(239,68,68,0.3)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-red-500/5 animate-pulse" />
            <div className="relative">
              <h3 className="text-lg md:text-xl font-bold text-red-300 mb-4 neon-text-small text-center">
                📊 Mercados Agora {isOnline && <span className="text-xs text-red-400">(TEMPO REAL)</span>}
              </h3>
              {marketData.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                  {marketData.map((market, index) => (
                    <motion.div
                      key={market.symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center p-2 rounded-lg bg-black/20"
                    >
                      <div className="text-xs text-gray-400 mb-1 truncate">{market.symbol}</div>
                      <div className={`text-sm md:text-lg font-bold ${
                        market.changePercent > 0 ? 'text-red-400 neon-text' : 
                        market.changePercent < 0 ? 'text-red-400 neon-text-red' : 
                        'text-red-300'
                      }`}>
                        {formatMarketValue(market.price, market.symbol)}
                      </div>
                      <div className={`text-xs ${
                        market.changePercent > 0 ? 'text-red-400' : 
                        market.changePercent < 0 ? 'text-red-400' : 
                        'text-gray-400'
                      }`}>
                        {market.changePercent > 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  {loading ? 'Carregando dados de mercado...' : 'Dados indisponíveis'}
                </div>
              )}
            </div>
          </motion.div>

          {/* News Preview (always visible) */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
            animate={{ opacity: loading ? 0.5 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {newsItems.slice(0, 3).map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-2 ${getImpactColor(news.impact)} backdrop-blur-sm relative overflow-hidden hover:scale-[1.02] transition-transform duration-300`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/5 to-red-500/5 animate-pulse" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: news.impact === 'positive' ? [0, 360] : news.impact === 'negative' ? [0, -360] : [0, 180]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {getImpactIcon(news.impact)}
                    </motion.div>
                    <span className="text-xs text-gray-400 font-mono">{news.time}</span>
                    <span className="text-xs text-red-400 truncate">• {news.source}</span>
                  </div>
                  <h3 className="text-sm font-bold text-red-300 mb-2 neon-text-small line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-xs text-gray-300 line-clamp-2">
                    {news.summary}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 truncate">
                      {news.category}
                    </span>
                    {news.url !== '#' && (
                      <motion.a
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        className="text-red-400 hover:text-red-300 flex-shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Expanded News Section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-4">
                  {newsItems.slice(3).map((news, index) => (
                    <motion.div
                      key={news.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 md:p-6 rounded-2xl border-2 ${getImpactColor(news.impact)} backdrop-blur-sm relative overflow-hidden hover:scale-[1.01] transition-transform duration-300`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/5 to-red-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: news.impact === 'positive' ? [0, 360] : news.impact === 'negative' ? [0, -360] : [0, 180]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {getImpactIcon(news.impact)}
                            </motion.div>
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-400 font-mono">{news.time}</span>
                                </div>
                                <span className="text-xs text-red-400">• {news.source}</span>
                                {isOnline && (
                                  <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                                    TEMPO REAL
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {news.url !== '#' && (
                            <motion.a
                              href={news.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors self-start"
                            >
                              <ExternalLink className="w-4 h-4 text-red-400" />
                            </motion.a>
                          )}
                        </div>
                        
                        <h3 className="text-lg md:text-xl font-bold text-red-300 mb-3 neon-text-small">
                          {news.title}
                        </h3>
                        
                        <p className="text-gray-300 leading-relaxed mb-4 text-sm md:text-base">
                          {news.summary}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                              {news.category}
                            </span>
                            <span className="text-xs text-gray-500">Fonte: {news.source}</span>
                            <span className="text-xs text-red-400">Asset: {news.asset}</span>
                          </div>
                          <motion.div
                            className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                              news.impact === 'positive' ? 'bg-red-500/20 text-red-400' :
                              news.impact === 'negative' ? 'bg-red-500/20 text-red-400' :
                              'bg-red-300/20 text-red-300'
                            }`}
                            animate={{ 
                              boxShadow: news.impact === 'positive' 
                                ? ["0 0 5px #ef4444", "0 0 10px #ef4444", "0 0 5px #ef4444"]
                                : news.impact === 'negative'
                                  ? ["0 0 5px #ff0040", "0 0 10px #ff0040", "0 0 5px #ff0040"]
                                  : ["0 0 5px #fca5a5", "0 0 10px #fca5a5", "0 0 5px #fca5a5"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {news.impact === 'positive' ? 'ALTA' : news.impact === 'negative' ? 'BAIXA' : 'NEUTRO'}
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};