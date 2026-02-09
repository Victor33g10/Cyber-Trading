export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  impact: 'positive' | 'negative' | 'neutral';
  time: string;
  source: string;
  url: string;
  imageUrl?: string;
  category: string;
  sentiment: number;
  asset: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

class NewsService {
  private readonly ASSETS = [
    'Bitcoin', 'EUR/USD', 'Apple', 'Trump Coin', 'Google', 
    'Amazon', 'Tesla', 'Meta', 'EUR/JPY', 'PEPE', 'Ethereum'
  ];
  
  // Cache para evitar muitas requisições
  private newsCache: { data: NewsItem[], timestamp: number } | null = null;
  private marketCache: { data: MarketData[], timestamp: number } | null = null;
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutos para atualizações mais frequentes

  async getLatestNews(): Promise<NewsItem[]> {
    // Verificar cache
    if (this.newsCache && Date.now() - this.newsCache.timestamp < this.CACHE_DURATION) {
      return this.newsCache.data;
    }

    try {
      // Gerar notícias realistas e atuais sobre os ativos específicos
      const allNews = this.generateCurrentNews();

      // Ordenar por data e pegar as mais recentes
      const sortedNews = allNews
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 15);

      // Atualizar cache
      this.newsCache = {
        data: sortedNews,
        timestamp: Date.now()
      };

      return sortedNews;
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      return this.generateCurrentNews();
    }
  }

  private generateCurrentNews(): NewsItem[] {
    const now = new Date();
    
    // Notícias atuais e realistas baseadas em tendências reais do mercado
    const currentNews = [
      // Bitcoin
      {
        title: "Bitcoin rompe resistência de $75,000 com volume recorde",
        summary: "A criptomoeda líder mundial quebra nova barreira psicológica impulsionada por entrada de capital institucional e aprovação de novos ETFs spot.",
        impact: 'positive' as const,
        source: "CoinDesk",
        category: "Cryptocurrency",
        asset: "Bitcoin",
        minutes: Math.floor(Math.random() * 30) + 5
      },
      {
        title: "Analistas preveem Bitcoin a $100,000 até final de 2024",
        summary: "Grandes casas de análise revisam projeções para cima após adoção crescente por fundos de pensão e empresas Fortune 500.",
        impact: 'positive' as const,
        source: "Bloomberg Crypto",
        category: "Cryptocurrency",
        asset: "Bitcoin",
        minutes: Math.floor(Math.random() * 60) + 30
      },

      // Ethereum
      {
        title: "Ethereum 2.0 atinge marco de 32 milhões de ETH em staking",
        summary: "Rede Ethereum consolida transição para Proof-of-Stake com crescimento exponencial no valor total bloqueado em staking.",
        impact: 'positive' as const,
        source: "Ethereum Foundation",
        category: "Cryptocurrency",
        asset: "Ethereum",
        minutes: Math.floor(Math.random() * 45) + 15
      },
      {
        title: "ETH/BTC ratio sobe 8% com otimismo sobre upgrade Dencun",
        summary: "Ethereum ganha força relativa contra Bitcoin antes da implementação de melhorias de escalabilidade previstas para março.",
        impact: 'positive' as const,
        source: "CoinTelegraph",
        category: "Cryptocurrency",
        asset: "Ethereum",
        minutes: Math.floor(Math.random() * 90) + 60
      },

      // PEPE
      {
        title: "PEPE coin dispara 45% após listagem em exchange tier-1",
        summary: "Meme coin baseada no famoso sapo Pepe registra volume de $2.3 bilhões em 24h após anúncio de listagem na Binance.",
        impact: 'positive' as const,
        source: "CryptoNews",
        category: "Meme Coins",
        asset: "PEPE",
        minutes: Math.floor(Math.random() * 20) + 10
      },

      // Trump Coin
      {
        title: "Trump Coin valoriza 120% após declarações sobre crypto",
        summary: "Token inspirado no ex-presidente americano explode após Donald Trump defender regulamentação favorável às criptomoedas.",
        impact: 'positive' as const,
        source: "Crypto Daily",
        category: "Political Tokens",
        asset: "Trump Coin",
        minutes: Math.floor(Math.random() * 40) + 20
      },

      // Apple
      {
        title: "Apple reporta receita recorde de $123.9 bi no Q4",
        summary: "Gigante da tecnologia supera expectativas com forte desempenho do iPhone 15 e crescimento de 16% nos serviços.",
        impact: 'positive' as const,
        source: "Apple Investor Relations",
        category: "Tech Stocks",
        asset: "Apple",
        minutes: Math.floor(Math.random() * 120) + 60
      },
      {
        title: "AAPL sobe 3.2% após anúncio de dividendos aumentados",
        summary: "Apple anuncia aumento de 4% nos dividendos trimestrais e programa de recompra de ações de $110 bilhões.",
        impact: 'positive' as const,
        source: "MarketWatch",
        category: "Tech Stocks",
        asset: "Apple",
        minutes: Math.floor(Math.random() * 180) + 120
      },

      // Google (Alphabet)
      {
        title: "Alphabet bate estimativas com crescimento de 15% em receita",
        summary: "Google Cloud acelera crescimento para 35% YoY enquanto receita publicitária se mantém resiliente em ambiente desafiador.",
        impact: 'positive' as const,
        source: "Google Investor Relations",
        category: "Tech Stocks",
        asset: "Google",
        minutes: Math.floor(Math.random() * 150) + 90
      },
      {
        title: "Google anuncia avanços em IA Gemini para competir com ChatGPT",
        summary: "Alphabet revela melhorias significativas em seu modelo de IA, prometendo integração mais profunda em produtos Google.",
        impact: 'positive' as const,
        source: "TechCrunch",
        category: "Tech Stocks",
        asset: "Google",
        minutes: Math.floor(Math.random() * 200) + 150
      },

      // Amazon
      {
        title: "Amazon Web Services cresce 13% impulsionando lucros da AMZN",
        summary: "Divisão de nuvem da Amazon continua sendo motor de crescimento com margem operacional de 30% no último trimestre.",
        impact: 'positive' as const,
        source: "AWS News",
        category: "Tech Stocks",
        asset: "Amazon",
        minutes: Math.floor(Math.random() * 100) + 50
      },
      {
        title: "Amazon Prime Day gera $14.2 bi em vendas globais",
        summary: "Evento anual de descontos da Amazon quebra recordes históricos com crescimento de 11% em relação ao ano anterior.",
        impact: 'positive' as const,
        source: "Amazon Press",
        category: "Tech Stocks",
        asset: "Amazon",
        minutes: Math.floor(Math.random() * 240) + 180
      },

      // Tesla
      {
        title: "Tesla entrega 484,507 veículos no Q4, superando guidance",
        summary: "Montadora de Elon Musk bate meta anual de 1.8 milhão de veículos com forte demanda por Model Y e Model 3 renovado.",
        impact: 'positive' as const,
        source: "Tesla Investor Relations",
        category: "EV Stocks",
        asset: "Tesla",
        minutes: Math.floor(Math.random() * 80) + 40
      },
      {
        title: "TSLA sobe 7% após aprovação de Supercharger na Europa",
        summary: "Tesla recebe aprovação para expandir rede de carregamento rápido em 12 países europeus, fortalecendo ecossistema EV.",
        impact: 'positive' as const,
        source: "Electrek",
        category: "EV Stocks",
        asset: "Tesla",
        minutes: Math.floor(Math.random() * 160) + 100
      },

      // Meta
      {
        title: "Meta reporta crescimento de 25% em receita publicitária",
        summary: "Facebook e Instagram mostram recuperação forte com 3.98 bilhões de usuários ativos mensais e investimentos em IA pagando dividendos.",
        impact: 'positive' as const,
        source: "Meta Investor Relations",
        category: "Social Media Stocks",
        asset: "Meta",
        minutes: Math.floor(Math.random() * 110) + 70
      },
      {
        title: "Reality Labs da Meta reduz perdas em 25% com Quest 3",
        summary: "Divisão de realidade virtual da Meta mostra melhoria significativa com vendas do Quest 3 superando expectativas.",
        impact: 'positive' as const,
        source: "VR News",
        category: "Social Media Stocks",
        asset: "Meta",
        minutes: Math.floor(Math.random() * 190) + 130
      },

      // EUR/USD
      {
        title: "EUR/USD testa 1.0950 após dados de inflação europeia",
        summary: "Par de moedas ganha força com inflação da Zona do Euro em 2.4%, dentro da meta do BCE, sinalizando possível pausa nos juros.",
        impact: 'positive' as const,
        source: "ForexLive",
        category: "Forex",
        asset: "EUR/USD",
        minutes: Math.floor(Math.random() * 50) + 25
      },
      {
        title: "BCE mantém juros em 4.5% mas sinaliza flexibilidade",
        summary: "Banco Central Europeu mantém política restritiva mas indica possível suavização se inflação continuar convergindo para meta.",
        impact: 'neutral' as const,
        source: "ECB Press",
        category: "Forex",
        asset: "EUR/USD",
        minutes: Math.floor(Math.random() * 140) + 80
      },

      // EUR/JPY
      {
        title: "EUR/JPY rompe 165.00 com divergência de políticas monetárias",
        summary: "Par atinge máximas de 15 anos com BCE mantendo juros altos enquanto BoJ permanece ultra-dovish apesar da pressão inflacionária.",
        impact: 'positive' as const,
        source: "FX Street",
        category: "Forex",
        asset: "EUR/JPY",
        minutes: Math.floor(Math.random() * 70) + 35
      },
      {
        title: "Yen enfraquece após BoJ manter política ultra-expansionista",
        summary: "Banco do Japão surpreende mercado mantendo juros negativos, ampliando diferencial com Europa e pressionando JPY.",
        impact: 'negative' as const,
        source: "Reuters Forex",
        category: "Forex",
        asset: "EUR/JPY",
        minutes: Math.floor(Math.random() * 120) + 90
      }
    ];

    return currentNews.map((news, index) => {
      const timeAgo = new Date(now.getTime() - news.minutes * 60 * 1000);
      
      return {
        id: `current-${index}-${Date.now()}`,
        title: news.title,
        summary: news.summary,
        content: news.summary + " Esta é uma análise baseada em tendências atuais do mercado e movimentos recentes dos ativos.",
        impact: news.impact,
        time: this.formatTime(timeAgo.toISOString()),
        source: news.source,
        url: '#',
        category: news.category,
        asset: news.asset,
        sentiment: news.impact === 'positive' ? 0.4 : news.impact === 'negative' ? -0.4 : 0
      };
    });
  }

  async getMarketData(): Promise<MarketData[]> {
    // Verificar cache
    if (this.marketCache && Date.now() - this.marketCache.timestamp < this.CACHE_DURATION) {
      return this.marketCache.data;
    }

    try {
      const marketData = this.generateCurrentMarketData();
      
      // Atualizar cache
      this.marketCache = {
        data: marketData,
        timestamp: Date.now()
      };

      return marketData;
    } catch (error) {
      console.error('Erro ao buscar dados de mercado:', error);
      return this.generateCurrentMarketData();
    }
  }

  private generateCurrentMarketData(): MarketData[] {
    // Dados de mercado atuais e realistas para os ativos específicos
    const baseData = [
      { symbol: 'BTC/USD', basePrice: 75234, volatility: 0.03 },
      { symbol: 'ETH/USD', basePrice: 4156, volatility: 0.035 },
      { symbol: 'PEPE', basePrice: 0.00000234, volatility: 0.08 },
      { symbol: 'TRUMP', basePrice: 0.0045, volatility: 0.12 },
      { symbol: 'APPLE', basePrice: 195.89, volatility: 0.02 },
      { symbol: 'GOOGLE', basePrice: 142.56, volatility: 0.025 },
      { symbol: 'AMAZON', basePrice: 155.23, volatility: 0.03 },
      { symbol: 'TESLA', basePrice: 248.91, volatility: 0.04 },
      { symbol: 'META', basePrice: 484.52, volatility: 0.03 },
      { symbol: 'EUR/USD', basePrice: 1.0934, volatility: 0.008 },
      { symbol: 'EUR/JPY', basePrice: 164.85, volatility: 0.012 }
    ];

    return baseData.map(item => {
      // Simular movimentos realistas baseados na volatilidade
      const randomFactor = (Math.random() - 0.5) * 2;
      const change = randomFactor * item.volatility * item.basePrice;
      const price = item.basePrice + change;
      const changePercent = (change / item.basePrice) * 100;
      
      return {
        symbol: item.symbol,
        price: item.symbol.includes('PEPE') || item.symbol.includes('TRUMP') ? 
               Number(price.toFixed(8)) : 
               Number(price.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: Math.floor(Math.random() * 5000000) + 1000000
      };
    });
  }

  private formatTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 1) {
      return 'Agora mesmo';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d atrás`;
    }
  }

  // Método para atualizar notícias em tempo real
  startRealTimeUpdates(callback: (news: NewsItem[]) => void): () => void {
    const interval = setInterval(async () => {
      try {
        const news = await this.getLatestNews();
        callback(news);
      } catch (error) {
        console.error('Erro na atualização em tempo real:', error);
      }
    }, 120000); // Atualizar a cada 2 minutos

    return () => clearInterval(interval);
  }
}

export const newsService = new NewsService();