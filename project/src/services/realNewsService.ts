export interface RealNewsItem {
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
  publishedAt: string;
}

export interface RealMarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  lastUpdate: string;
}

class RealNewsService {
  private readonly NEWS_API_KEY = 'demo'; // Em produção, usar variável de ambiente
  private readonly CRYPTO_API_KEY = 'demo'; // Em produção, usar variável de ambiente
  
  // Cache para evitar muitas requisições
  private newsCache: { data: RealNewsItem[], timestamp: number } | null = null;
  private marketCache: { data: RealMarketData[], timestamp: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  private readonly TRADING_KEYWORDS = [
    'bitcoin', 'ethereum', 'crypto', 'trading', 'forex', 'mercado de ações',
    'apple', 'tesla', 'amazon', 'google', 'meta', 'microsoft',
    'EUR/USD', 'USD/JPY', 'GBP/USD', 'ouro', 'petróleo', 'nasdaq'
  ];

  // Dicionário de tradução para termos financeiros
  private readonly TRANSLATION_DICT = {
    // Termos gerais
    'Bitcoin': 'Bitcoin',
    'Ethereum': 'Ethereum',
    'crypto': 'cripto',
    'cryptocurrency': 'criptomoeda',
    'trading': 'negociação',
    'market': 'mercado',
    'price': 'preço',
    'volume': 'volume',
    'bullish': 'alta',
    'bearish': 'baixa',
    'rally': 'alta',
    'surge': 'disparada',
    'plunge': 'queda',
    'gains': 'ganhos',
    'losses': 'perdas',
    'breakout': 'rompimento',
    'resistance': 'resistência',
    'support': 'suporte',
    'volatility': 'volatilidade',
    'analysis': 'análise',
    'forecast': 'previsão',
    'investment': 'investimento',
    'portfolio': 'portfólio',
    'dividend': 'dividendo',
    'earnings': 'lucros',
    'revenue': 'receita',
    'growth': 'crescimento',
    'decline': 'declínio',
    'stock': 'ação',
    'shares': 'ações',
    'exchange': 'bolsa',
    'index': 'índice',
    'futures': 'futuros',
    'options': 'opções',
    'margin': 'margem',
    'leverage': 'alavancagem',
    
    // Empresas
    'Apple': 'Apple',
    'Tesla': 'Tesla',
    'Amazon': 'Amazon',
    'Google': 'Google',
    'Meta': 'Meta',
    'Microsoft': 'Microsoft',
    
    // Categorias
    'Cryptocurrency': 'Criptomoedas',
    'Financial Markets': 'Mercados Financeiros',
    'Stock Market': 'Mercado de Ações',
    'Business News': 'Notícias de Negócios',
    'Tech Stocks': 'Ações de Tecnologia',
    'EV Stocks': 'Ações de Veículos Elétricos',
    'Social Media Stocks': 'Ações de Redes Sociais',
    'Forex': 'Câmbio',
    'Meme Coins': 'Meme Coins',
    'Political Tokens': 'Tokens Políticos',
    
    // Fontes
    'CoinDesk': 'CoinDesk',
    'Cointelegraph': 'Cointelegraph',
    'Bloomberg': 'Bloomberg',
    'Reuters': 'Reuters',
    'Yahoo Finance': 'Yahoo Finanças',
    'MarketWatch': 'MarketWatch',
    'CNBC': 'CNBC',
    'TechCrunch': 'TechCrunch',
    'ForexLive': 'ForexLive',
    'CryptoNews': 'CryptoNews',
    
    // Frases comuns
    'rises': 'sobe',
    'falls': 'cai',
    'hits': 'atinge',
    'reaches': 'alcança',
    'breaks': 'rompe',
    'tests': 'testa',
    'holds': 'mantém',
    'continues': 'continua',
    'shows': 'mostra',
    'reports': 'reporta',
    'announces': 'anuncia',
    'reveals': 'revela',
    'confirms': 'confirma',
    'expects': 'espera',
    'predicts': 'prevê',
    'estimates': 'estima',
    'targets': 'almeja',
    'aims': 'visa',
    'plans': 'planeja',
    'launches': 'lança',
    'introduces': 'introduz',
    'implements': 'implementa',
    'adopts': 'adota',
    'approves': 'aprova',
    'rejects': 'rejeita',
    'delays': 'adia',
    'postpones': 'posterga',
    'accelerates': 'acelera',
    'slows': 'desacelera',
    'maintains': 'mantém',
    'increases': 'aumenta',
    'decreases': 'diminui',
    'doubles': 'dobra',
    'halves': 'reduz pela metade',
    'triples': 'triplica'
  };

  async getLatestNews(): Promise<RealNewsItem[]> {
    // Verificar cache
    if (this.newsCache && Date.now() - this.newsCache.timestamp < this.CACHE_DURATION) {
      return this.newsCache.data;
    }

    try {
      const allNews: RealNewsItem[] = [];

      // Buscar notícias de múltiplas fontes com tratamento de erro individual
      const newsPromises = [
        this.getFinancialNews().catch(error => {
          console.warn('Falha ao buscar notícias financeiras:', error.message);
          return [];
        }),
        this.getStockNews().catch(error => {
          console.warn('Falha ao buscar notícias de ações:', error.message);
          return [];
        }),
        this.getRSSNews().catch(error => {
          console.warn('Falha ao buscar RSS feeds:', error.message);
          return [];
        })
      ];

      const results = await Promise.all(newsPromises);
      results.forEach(newsArray => {
        if (newsArray.length > 0) {
          allNews.push(...newsArray);
        }
      });

      // Se não conseguiu buscar nenhuma notícia real, usar fallback
      if (allNews.length === 0) {
        console.warn('Nenhuma fonte de notícias disponível, usando fallback');
        return this.getFallbackNews();
      }

      // Traduzir todas as notícias para português
      const translatedNews = allNews.map(news => this.translateNewsItem(news));

      // Ordenar por data e pegar as mais recentes
      const sortedNews = translatedNews
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 20);

      // Atualizar cache
      this.newsCache = {
        data: sortedNews,
        timestamp: Date.now()
      };

      return sortedNews;
    } catch (error) {
      console.error('Erro geral ao buscar notícias:', error);
      // Fallback para notícias simuladas se tudo falhar
      return this.getFallbackNews();
    }
  }

  private translateNewsItem(news: RealNewsItem): RealNewsItem {
    return {
      ...news,
      title: this.translateText(news.title),
      summary: this.translateText(news.summary),
      content: this.translateText(news.content),
      category: this.translateText(news.category),
      source: this.translateText(news.source)
    };
  }

  private translateText(text: string): string {
    let translatedText = text;
    
    // Aplicar traduções do dicionário
    Object.entries(this.TRANSLATION_DICT).forEach(([english, portuguese]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedText = translatedText.replace(regex, portuguese);
    });

    // Traduções específicas de frases comuns em notícias financeiras
    const phraseTranslations = [
      { en: /(\w+)\s+rises?\s+(\d+)%/gi, pt: '$1 sobe $2%' },
      { en: /(\w+)\s+falls?\s+(\d+)%/gi, pt: '$1 cai $2%' },
      { en: /(\w+)\s+gains?\s+(\d+)%/gi, pt: '$1 ganha $2%' },
      { en: /(\w+)\s+drops?\s+(\d+)%/gi, pt: '$1 cai $2%' },
      { en: /(\w+)\s+surges?\s+(\d+)%/gi, pt: '$1 dispara $2%' },
      { en: /(\w+)\s+plunges?\s+(\d+)%/gi, pt: '$1 despenca $2%' },
      { en: /hits?\s+new\s+high/gi, pt: 'atinge nova máxima' },
      { en: /hits?\s+new\s+low/gi, pt: 'atinge nova mínima' },
      { en: /breaks?\s+resistance/gi, pt: 'rompe resistência' },
      { en: /tests?\s+support/gi, pt: 'testa suporte' },
      { en: /market\s+cap/gi, pt: 'capitalização de mercado' },
      { en: /trading\s+volume/gi, pt: 'volume de negociação' },
      { en: /price\s+target/gi, pt: 'meta de preço' },
      { en: /earnings\s+report/gi, pt: 'relatório de lucros' },
      { en: /quarterly\s+results/gi, pt: 'resultados trimestrais' },
      { en: /annual\s+revenue/gi, pt: 'receita anual' },
      { en: /stock\s+split/gi, pt: 'desdobramento de ações' },
      { en: /dividend\s+yield/gi, pt: 'rendimento de dividendos' },
      { en: /bull\s+market/gi, pt: 'mercado em alta' },
      { en: /bear\s+market/gi, pt: 'mercado em baixa' },
      { en: /market\s+volatility/gi, pt: 'volatilidade do mercado' },
      { en: /technical\s+analysis/gi, pt: 'análise técnica' },
      { en: /fundamental\s+analysis/gi, pt: 'análise fundamentalista' },
      { en: /investment\s+strategy/gi, pt: 'estratégia de investimento' },
      { en: /risk\s+management/gi, pt: 'gestão de risco' },
      { en: /portfolio\s+diversification/gi, pt: 'diversificação de portfólio' },
      { en: /market\s+sentiment/gi, pt: 'sentimento do mercado' },
      { en: /institutional\s+investors/gi, pt: 'investidores institucionais' },
      { en: /retail\s+investors/gi, pt: 'investidores de varejo' },
      { en: /hedge\s+funds/gi, pt: 'fundos hedge' },
      { en: /mutual\s+funds/gi, pt: 'fundos mútuos' },
      { en: /exchange\s+traded\s+fund/gi, pt: 'fundo negociado em bolsa' },
      { en: /initial\s+public\s+offering/gi, pt: 'oferta pública inicial' },
      { en: /mergers?\s+and\s+acquisitions/gi, pt: 'fusões e aquisições' },
      { en: /central\s+bank/gi, pt: 'banco central' },
      { en: /interest\s+rates?/gi, pt: 'taxas de juros' },
      { en: /inflation\s+rate/gi, pt: 'taxa de inflação' },
      { en: /economic\s+growth/gi, pt: 'crescimento econômico' },
      { en: /gdp\s+growth/gi, pt: 'crescimento do PIB' },
      { en: /unemployment\s+rate/gi, pt: 'taxa de desemprego' },
      { en: /consumer\s+confidence/gi, pt: 'confiança do consumidor' },
      { en: /business\s+confidence/gi, pt: 'confiança empresarial' },
      { en: /supply\s+chain/gi, pt: 'cadeia de suprimentos' },
      { en: /global\s+economy/gi, pt: 'economia global' },
      { en: /emerging\s+markets/gi, pt: 'mercados emergentes' },
      { en: /developed\s+markets/gi, pt: 'mercados desenvolvidos' },
      { en: /currency\s+exchange/gi, pt: 'câmbio de moedas' },
      { en: /foreign\s+exchange/gi, pt: 'câmbio estrangeiro' },
      { en: /commodity\s+prices/gi, pt: 'preços de commodities' },
      { en: /oil\s+prices/gi, pt: 'preços do petróleo' },
      { en: /gold\s+prices/gi, pt: 'preços do ouro' },
      { en: /real\s+estate/gi, pt: 'mercado imobiliário' },
      { en: /housing\s+market/gi, pt: 'mercado habitacional' },
      { en: /mortgage\s+rates/gi, pt: 'taxas hipotecárias' },
      { en: /credit\s+rating/gi, pt: 'classificação de crédito' },
      { en: /debt\s+ceiling/gi, pt: 'teto da dívida' },
      { en: /fiscal\s+policy/gi, pt: 'política fiscal' },
      { en: /monetary\s+policy/gi, pt: 'política monetária' },
      { en: /quantitative\s+easing/gi, pt: 'flexibilização quantitativa' },
      { en: /market\s+correction/gi, pt: 'correção do mercado' },
      { en: /market\s+crash/gi, pt: 'crash do mercado' },
      { en: /financial\s+crisis/gi, pt: 'crise financeira' },
      { en: /economic\s+recession/gi, pt: 'recessão econômica' },
      { en: /economic\s+recovery/gi, pt: 'recuperação econômica' },
      { en: /market\s+rally/gi, pt: 'rally do mercado' },
      { en: /sector\s+rotation/gi, pt: 'rotação setorial' },
      { en: /value\s+investing/gi, pt: 'investimento em valor' },
      { en: /growth\s+investing/gi, pt: 'investimento em crescimento' },
      { en: /day\s+trading/gi, pt: 'day trading' },
      { en: /swing\s+trading/gi, pt: 'swing trading' },
      { en: /long\s+term\s+investing/gi, pt: 'investimento de longo prazo' },
      { en: /short\s+selling/gi, pt: 'venda a descoberto' },
      { en: /margin\s+trading/gi, pt: 'negociação com margem' },
      { en: /options\s+trading/gi, pt: 'negociação de opções' },
      { en: /futures\s+trading/gi, pt: 'negociação de futuros' },
      { en: /algorithmic\s+trading/gi, pt: 'negociação algorítmica' },
      { en: /high\s+frequency\s+trading/gi, pt: 'negociação de alta frequência' },
      { en: /artificial\s+intelligence/gi, pt: 'inteligência artificial' },
      { en: /machine\s+learning/gi, pt: 'aprendizado de máquina' },
      { en: /blockchain\s+technology/gi, pt: 'tecnologia blockchain' },
      { en: /digital\s+currency/gi, pt: 'moeda digital' },
      { en: /central\s+bank\s+digital\s+currency/gi, pt: 'moeda digital de banco central' },
      { en: /decentralized\s+finance/gi, pt: 'finanças descentralizadas' },
      { en: /non\s+fungible\s+token/gi, pt: 'token não fungível' },
      { en: /smart\s+contracts/gi, pt: 'contratos inteligentes' },
      { en: /proof\s+of\s+work/gi, pt: 'prova de trabalho' },
      { en: /proof\s+of\s+stake/gi, pt: 'prova de participação' },
      { en: /mining\s+rewards/gi, pt: 'recompensas de mineração' },
      { en: /staking\s+rewards/gi, pt: 'recompensas de staking' },
      { en: /yield\s+farming/gi, pt: 'yield farming' },
      { en: /liquidity\s+mining/gi, pt: 'mineração de liquidez' },
      { en: /automated\s+market\s+maker/gi, pt: 'formador de mercado automatizado' },
      { en: /decentralized\s+exchange/gi, pt: 'exchange descentralizada' },
      { en: /centralized\s+exchange/gi, pt: 'exchange centralizada' },
      { en: /crypto\s+wallet/gi, pt: 'carteira cripto' },
      { en: /hardware\s+wallet/gi, pt: 'carteira de hardware' },
      { en: /software\s+wallet/gi, pt: 'carteira de software' },
      { en: /cold\s+storage/gi, pt: 'armazenamento frio' },
      { en: /hot\s+wallet/gi, pt: 'carteira quente' },
      { en: /private\s+key/gi, pt: 'chave privada' },
      { en: /public\s+key/gi, pt: 'chave pública' },
      { en: /seed\s+phrase/gi, pt: 'frase semente' },
      { en: /recovery\s+phrase/gi, pt: 'frase de recuperação' },
      { en: /two\s+factor\s+authentication/gi, pt: 'autenticação de dois fatores' },
      { en: /know\s+your\s+customer/gi, pt: 'conheça seu cliente' },
      { en: /anti\s+money\s+laundering/gi, pt: 'anti lavagem de dinheiro' },
      { en: /regulatory\s+compliance/gi, pt: 'conformidade regulatória' },
      { en: /securities\s+and\s+exchange\s+commission/gi, pt: 'comissão de valores mobiliários' },
      { en: /financial\s+conduct\s+authority/gi, pt: 'autoridade de conduta financeira' },
      { en: /commodity\s+futures\s+trading\s+commission/gi, pt: 'comissão de negociação de futuros de commodities' },
      { en: /european\s+securities\s+and\s+markets\s+authority/gi, pt: 'autoridade europeia de valores mobiliários e mercados' },
      { en: /financial\s+action\s+task\s+force/gi, pt: 'força-tarefa de ação financeira' },
      { en: /basel\s+committee/gi, pt: 'comitê de basileia' },
      { en: /international\s+monetary\s+fund/gi, pt: 'fundo monetário internacional' },
      { en: /world\s+bank/gi, pt: 'banco mundial' },
      { en: /bank\s+for\s+international\s+settlements/gi, pt: 'banco de compensações internacionais' },
      { en: /financial\s+stability\s+board/gi, pt: 'conselho de estabilidade financeira' },
      { en: /group\s+of\s+twenty/gi, pt: 'grupo dos vinte' },
      { en: /group\s+of\s+seven/gi, pt: 'grupo dos sete' },
      { en: /organization\s+for\s+economic\s+cooperation\s+and\s+development/gi, pt: 'organização para cooperação e desenvolvimento econômico' },
      { en: /world\s+trade\s+organization/gi, pt: 'organização mundial do comércio' },
      { en: /north\s+american\s+free\s+trade\s+agreement/gi, pt: 'acordo de livre comércio da américa do norte' },
      { en: /european\s+union/gi, pt: 'união europeia' },
      { en: /european\s+central\s+bank/gi, pt: 'banco central europeu' },
      { en: /federal\s+reserve/gi, pt: 'reserva federal' },
      { en: /bank\s+of\s+england/gi, pt: 'banco da inglaterra' },
      { en: /bank\s+of\s+japan/gi, pt: 'banco do japão' },
      { en: /people's\s+bank\s+of\s+china/gi, pt: 'banco popular da china' },
      { en: /reserve\s+bank\s+of\s+australia/gi, pt: 'banco de reserva da austrália' },
      { en: /bank\s+of\s+canada/gi, pt: 'banco do canadá' },
      { en: /swiss\s+national\s+bank/gi, pt: 'banco nacional suíço' },
      { en: /reserve\s+bank\s+of\s+new\s+zealand/gi, pt: 'banco de reserva da nova zelândia' },
      { en: /central\s+bank\s+of\s+brazil/gi, pt: 'banco central do brasil' },
      { en: /central\s+bank\s+of\s+russia/gi, pt: 'banco central da rússia' },
      { en: /reserve\s+bank\s+of\s+india/gi, pt: 'banco de reserva da índia' },
      { en: /south\s+african\s+reserve\s+bank/gi, pt: 'banco de reserva da áfrica do sul' }
    ];

    phraseTranslations.forEach(({ en, pt }) => {
      translatedText = translatedText.replace(en, pt);
    });

    return translatedText;
  }

  private async getFinancialNews(): Promise<RealNewsItem[]> {
    // Tentar múltiplas fontes RSS para notícias financeiras
    const rssFeeds = [
      {
        url: 'https://feeds.finance.yahoo.com/rss/2.0/headline',
        source: 'Yahoo Finanças',
        category: 'Mercados Financeiros'
      },
      {
        url: 'https://feeds.reuters.com/reuters/businessNews',
        source: 'Reuters Negócios',
        category: 'Notícias de Negócios'
      },
      {
        url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
        source: 'CNBC Mercados',
        category: 'Mercados Financeiros'
      }
    ];

    for (const feed of rssFeeds) {
      try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`, {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(8000) // 8 segundos timeout
        });
        
        if (!response.ok) {
          console.warn(`RSS feed ${feed.source} retornou status ${response.status}`);
          continue; // Tentar próximo feed
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          console.warn(`RSS feed ${feed.source} não retornou itens`);
          continue;
        }
        
        return data.items.slice(0, 6).map((item: any, index: number) => ({
          id: `${feed.source.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
          title: item.title || 'Notícia Financeira',
          summary: this.cleanHtml(item.description || item.title || 'Atualização do mercado financeiro'),
          content: this.cleanHtml(item.content || item.description || 'Conteúdo da notícia financeira'),
          impact: this.determineImpact(item.title + ' ' + (item.description || '')),
          time: this.formatTime(item.pubDate || new Date().toISOString()),
          source: feed.source,
          url: item.link || '#',
          imageUrl: item.thumbnail,
          category: feed.category,
          sentiment: this.calculateSentiment(item.title + ' ' + (item.description || '')),
          asset: this.extractAsset(item.title + ' ' + (item.description || '')),
          publishedAt: item.pubDate || new Date().toISOString()
        }));
      } catch (error) {
        console.warn(`Erro ao buscar ${feed.source}:`, error instanceof Error ? error.message : 'Erro desconhecido');
        continue; // Tentar próximo feed
      }
    }

    // Se todos os feeds falharam, retornar array vazio
    throw new Error('Todos os feeds de notícias financeiras estão indisponíveis');
  }

  private async getStockNews(): Promise<RealNewsItem[]> {
    const stockFeeds = [
      {
        url: 'https://feeds.marketwatch.com/marketwatch/topstories/',
        source: 'MarketWatch',
        category: 'Mercado de Ações'
      },
      {
        url: 'https://feeds.bloomberg.com/markets/news.rss',
        source: 'Bloomberg Mercados',
        category: 'Mercados Financeiros'
      }
    ];

    for (const feed of stockFeeds) {
      try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`, {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(8000)
        });
        
        if (!response.ok) {
          console.warn(`Stock feed ${feed.source} retornou status ${response.status}`);
          continue;
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          console.warn(`Stock feed ${feed.source} não retornou itens`);
          continue;
        }
        
        return data.items.slice(0, 6).map((item: any, index: number) => ({
          id: `${feed.source.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
          title: item.title || 'Notícia do Mercado de Ações',
          summary: this.cleanHtml(item.description || item.title || 'Atualização do mercado de ações'),
          content: this.cleanHtml(item.content || item.description || 'Conteúdo da notícia do mercado'),
          impact: this.determineImpact(item.title + ' ' + (item.description || '')),
          time: this.formatTime(item.pubDate || new Date().toISOString()),
          source: feed.source,
          url: item.link || '#',
          imageUrl: item.thumbnail,
          category: feed.category,
          sentiment: this.calculateSentiment(item.title + ' ' + (item.description || '')),
          asset: this.extractAsset(item.title + ' ' + (item.description || '')),
          publishedAt: item.pubDate || new Date().toISOString()
        }));
      } catch (error) {
        console.warn(`Erro ao buscar ${feed.source}:`, error instanceof Error ? error.message : 'Erro desconhecido');
        continue;
      }
    }

    throw new Error('Todos os feeds de notícias de ações estão indisponíveis');
  }

  private async getRSSNews(): Promise<RealNewsItem[]> {
    const feeds = [
      {
        url: 'https://cointelegraph.com/rss',
        source: 'Cointelegraph',
        category: 'Criptomoedas'
      },
      {
        url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
        source: 'CoinDesk',
        category: 'Criptomoedas'
      }
    ];

    const allRssNews: RealNewsItem[] = [];

    for (const feed of feeds) {
      try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`, {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(8000)
        });
        
        if (!response.ok) {
          console.warn(`RSS feed ${feed.source} retornou status ${response.status}`);
          continue;
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          console.warn(`RSS feed ${feed.source} não retornou itens`);
          continue;
        }
        
        const feedNews = data.items.slice(0, 3).map((item: any, index: number) => ({
          id: `rss-${feed.source.toLowerCase()}-${index}-${Date.now()}`,
          title: item.title || 'Notícia de Trading',
          summary: this.cleanHtml(item.description || item.title || 'Atualização do mercado'),
          content: this.cleanHtml(item.content || item.description || 'Conteúdo da notícia'),
          impact: this.determineImpact(item.title + ' ' + (item.description || '')),
          time: this.formatTime(item.pubDate || new Date().toISOString()),
          source: feed.source,
          url: item.link || '#',
          imageUrl: item.thumbnail,
          category: feed.category,
          sentiment: this.calculateSentiment(item.title + ' ' + (item.description || '')),
          asset: this.extractAsset(item.title + ' ' + (item.description || '')),
          publishedAt: item.pubDate || new Date().toISOString()
        }));

        allRssNews.push(...feedNews);
      } catch (error) {
        console.warn(`Erro ao buscar feed ${feed.source}:`, error instanceof Error ? error.message : 'Erro desconhecido');
        continue;
      }
    }

    if (allRssNews.length === 0) {
      throw new Error('Todos os RSS feeds estão indisponíveis');
    }

    return allRssNews;
  }

  async getRealMarketData(): Promise<RealMarketData[]> {
    // Verificar cache
    if (this.marketCache && Date.now() - this.marketCache.timestamp < this.CACHE_DURATION) {
      return this.marketCache.data;
    }

    try {
      const marketData: RealMarketData[] = [];

      // Buscar dados de múltiplas fontes com tratamento de erro individual
      const dataPromises = [
        this.getCryptoMarketData().catch(error => {
          console.warn('Falha ao buscar dados crypto:', error.message);
          return [];
        }),
        this.getForexData().catch(error => {
          console.warn('Falha ao buscar dados forex:', error.message);
          return [];
        }),
        this.getStockMarketData().catch(error => {
          console.warn('Falha ao buscar dados de ações:', error.message);
          return [];
        })
      ];

      const results = await Promise.all(dataPromises);
      results.forEach(dataArray => {
        if (dataArray.length > 0) {
          marketData.push(...dataArray);
        }
      });

      // Se não conseguiu buscar nenhum dado real, usar fallback
      if (marketData.length === 0) {
        console.warn('Nenhuma fonte de dados de mercado disponível, usando fallback');
        return this.getFallbackMarketData();
      }

      // Atualizar cache
      this.marketCache = {
        data: marketData,
        timestamp: Date.now()
      };

      return marketData;
    } catch (error) {
      console.error('Erro geral ao buscar dados de mercado:', error);
      return this.getFallbackMarketData();
    }
  }

  private async getCryptoMarketData(): Promise<RealMarketData[]> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pepe&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
        {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const now = new Date().toISOString();

      return [
        {
          symbol: 'BTC/USD',
          price: data.bitcoin?.usd || 0,
          change: ((data.bitcoin?.usd_24h_change || 0) * (data.bitcoin?.usd || 0)) / 100,
          changePercent: data.bitcoin?.usd_24h_change || 0,
          volume: 0,
          marketCap: data.bitcoin?.usd_market_cap,
          lastUpdate: now
        },
        {
          symbol: 'ETH/USD',
          price: data.ethereum?.usd || 0,
          change: ((data.ethereum?.usd_24h_change || 0) * (data.ethereum?.usd || 0)) / 100,
          changePercent: data.ethereum?.usd_24h_change || 0,
          volume: 0,
          marketCap: data.ethereum?.usd_market_cap,
          lastUpdate: now
        },
        {
          symbol: 'PEPE',
          price: data.pepe?.usd || 0,
          change: ((data.pepe?.usd_24h_change || 0) * (data.pepe?.usd || 0)) / 100,
          changePercent: data.pepe?.usd_24h_change || 0,
          volume: 0,
          marketCap: data.pepe?.usd_market_cap,
          lastUpdate: now
        }
      ];
    } catch (error) {
      console.warn('Erro ao buscar dados crypto:', error);
      return [];
    }
  }

  private async getForexData(): Promise<RealMarketData[]> {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR', {
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const now = new Date().toISOString();

      return [
        {
          symbol: 'EUR/USD',
          price: data.rates?.USD || 1.09,
          change: 0, // API gratuita não fornece mudança
          changePercent: (Math.random() - 0.5) * 2, // Simulado
          volume: 0,
          lastUpdate: now
        },
        {
          symbol: 'EUR/JPY',
          price: data.rates?.JPY || 165,
          change: 0,
          changePercent: (Math.random() - 0.5) * 2,
          volume: 0,
          lastUpdate: now
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar dados forex:', error);
      throw new Error(`Falha ao buscar dados forex: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private async getStockMarketData(): Promise<RealMarketData[]> {
    // Para dados de ações em tempo real, seria necessário uma API paga
    // Aqui vamos simular com dados realistas baseados em preços recentes
    const now = new Date().toISOString();
    
    return [
      {
        symbol: 'APPLE',
        price: 195 + (Math.random() - 0.5) * 10,
        change: (Math.random() - 0.5) * 5,
        changePercent: (Math.random() - 0.5) * 3,
        volume: Math.floor(Math.random() * 50000000) + 10000000,
        lastUpdate: now
      },
      {
        symbol: 'GOOGLE',
        price: 142 + (Math.random() - 0.5) * 8,
        change: (Math.random() - 0.5) * 4,
        changePercent: (Math.random() - 0.5) * 2.5,
        volume: Math.floor(Math.random() * 30000000) + 5000000,
        lastUpdate: now
      },
      {
        symbol: 'TESLA',
        price: 248 + (Math.random() - 0.5) * 15,
        change: (Math.random() - 0.5) * 8,
        changePercent: (Math.random() - 0.5) * 4,
        volume: Math.floor(Math.random() * 80000000) + 20000000,
        lastUpdate: now
      }
    ];
  }

  // Métodos auxiliares
  private determineImpact(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['up', 'rise', 'gain', 'bull', 'surge', 'rally', 'high', 'growth', 'profit', 'increase', 'sobe', 'alta', 'ganho', 'crescimento', 'lucro', 'aumento'];
    const negativeWords = ['down', 'fall', 'drop', 'bear', 'crash', 'decline', 'low', 'loss', 'decrease', 'plunge', 'cai', 'baixa', 'queda', 'declínio', 'perda', 'diminuição'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateSentiment(text: string): number {
    const impact = this.determineImpact(text);
    return impact === 'positive' ? 0.4 : impact === 'negative' ? -0.4 : 0;
  }

  private extractAsset(text: string): string {
    const assets = ['Bitcoin', 'Ethereum', 'PEPE', 'Apple', 'Tesla', 'Google', 'Amazon', 'Meta', 'EUR/USD', 'EUR/JPY'];
    const lowerText = text.toLowerCase();
    
    for (const asset of assets) {
      if (lowerText.includes(asset.toLowerCase()) || 
          lowerText.includes(asset.replace('/', '').toLowerCase())) {
        return asset;
      }
    }
    
    return 'Mercado';
  }

  private cleanHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
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

  private getSourceFromUrl(url: string): string {
    if (url.includes('cointelegraph')) return 'Cointelegraph';
    if (url.includes('coindesk')) return 'CoinDesk';
    if (url.includes('bloomberg')) return 'Bloomberg';
    return 'Notícias de Trading';
  }

  private getCategoryFromSource(source: string): string {
    if (source.includes('Coin')) return 'Criptomoedas';
    if (source.includes('Bloomberg')) return 'Mercados Financeiros';
    return 'Trading';
  }

  private getFallbackNews(): RealNewsItem[] {
    const now = new Date();
    return [
      {
        id: 'fallback-1',
        title: 'Bitcoin mantém alta acima de $75,000 com volume crescente',
        summary: 'A criptomoeda líder mundial continua em território de alta com forte demanda institucional e volume de negociação em crescimento constante.',
        content: 'Bitcoin mantém momentum positivo acima da marca psicológica de $75,000, demonstrando força do mercado cripto...',
        impact: 'positive' as const,
        time: this.formatTime(new Date(now.getTime() - 5 * 60 * 1000).toISOString()),
        source: 'Crypto News Brasil',
        url: '#',
        category: 'Criptomoedas',
        sentiment: 0.4,
        asset: 'Bitcoin',
        publishedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
      },
      {
        id: 'fallback-2',
        title: 'Ethereum atinge novo marco com 32 milhões de ETH em staking',
        summary: 'A rede Ethereum consolida sua transição para Proof-of-Stake com crescimento exponencial no valor total bloqueado em staking.',
        content: 'Ethereum continua evoluindo com implementação bem-sucedida de melhorias de escalabilidade...',
        impact: 'positive' as const,
        time: this.formatTime(new Date(now.getTime() - 15 * 60 * 1000).toISOString()),
        source: 'Ethereum Brasil',
        url: '#',
        category: 'Criptomoedas',
        sentiment: 0.3,
        asset: 'Ethereum',
        publishedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString()
      },
      {
        id: 'fallback-3',
        title: 'Mercados globais mostram estabilidade com volume moderado',
        summary: 'Principais índices mundiais mantêm tendência positiva em meio a dados econômicos favoráveis e expectativas otimistas dos investidores.',
        content: 'Mercados globais em equilíbrio com investidores aguardando próximos dados econômicos...',
        impact: 'neutral' as const,
        time: this.formatTime(new Date(now.getTime() - 30 * 60 * 1000).toISOString()),
        source: 'Mercados Brasil',
        url: '#',
        category: 'Mercados Financeiros',
        sentiment: 0,
        asset: 'Mercado',
        publishedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'fallback-4',
        title: 'Apple reporta crescimento de 16% em receita de serviços',
        summary: 'A divisão de serviços da Apple continua sendo fonte de receita estável com App Store e iCloud liderando o crescimento.',
        content: 'Apple Services demonstra resiliência com crescimento consistente em todas as categorias...',
        impact: 'positive' as const,
        time: this.formatTime(new Date(now.getTime() - 45 * 60 * 1000).toISOString()),
        source: 'Tech News Brasil',
        url: '#',
        category: 'Ações de Tecnologia',
        sentiment: 0.2,
        asset: 'Apple',
        publishedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString()
      },
      {
        id: 'fallback-5',
        title: 'EUR/USD mantém estabilidade próxima a 1.09 em meio a dados do BCE',
        summary: 'O par de moedas EUR/USD mostra estabilidade após divulgação de dados econômicos europeus e sinalizações do Banco Central Europeu.',
        content: 'Forex EUR/USD permanece estável com traders aguardando próximas decisões de política monetária...',
        impact: 'neutral' as const,
        time: this.formatTime(new Date(now.getTime() - 60 * 60 * 1000).toISOString()),
        source: 'Forex Brasil',
        url: '#',
        category: 'Câmbio',
        sentiment: 0,
        asset: 'EUR/USD',
        publishedAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fallback-6',
        title: 'Tesla supera expectativas com entregas de 484,507 veículos no Q4',
        summary: 'A montadora de Elon Musk bate meta anual de 1.8 milhão de veículos com forte demanda global por Model Y e Model 3 renovado.',
        content: 'Tesla demonstra força operacional superando guidance anual com crescimento em todos os mercados...',
        impact: 'positive' as const,
        time: this.formatTime(new Date(now.getTime() - 75 * 60 * 1000).toISOString()),
        source: 'Auto News Brasil',
        url: '#',
        category: 'Ações de Veículos Elétricos',
        sentiment: 0.3,
        asset: 'Tesla',
        publishedAt: new Date(now.getTime() - 75 * 60 * 1000).toISOString()
      },
      {
        id: 'fallback-7',
        title: 'PEPE coin registra alta de 45% após listagem em exchange tier-1',
        summary: 'A meme coin baseada no famoso sapo Pepe explode em volume após anúncio de listagem em grande exchange internacional.',
        content: 'PEPE demonstra força das meme coins com volume excepcional e interesse crescente de investidores...',
        impact: 'positive' as const,
        time: this.formatTime(new Date(now.getTime() - 90 * 60 * 1000).toISOString()),
        source: 'Meme Coins Brasil',
        url: '#',
        category: 'Meme Coins',
        sentiment: 0.4,
        asset: 'PEPE',
        publishedAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString()
      },
      {
        id: 'fallback-8',
        title: 'Google Cloud acelera crescimento para 35% YoY impulsionando Alphabet',
        summary: 'A divisão de nuvem do Google continua sendo motor de crescimento com margem operacional robusta e adoção empresarial crescente.',
        content: 'Google Cloud demonstra competitividade no mercado de nuvem com crescimento acelerado...',
        impact: 'positive' as const,
        time: this.formatTime(new Date(now.getTime() - 105 * 60 * 1000).toISOString()),
        source: 'Cloud News Brasil',
        url: '#',
        category: 'Ações de Tecnologia',
        sentiment: 0.3,
        asset: 'Google',
        publishedAt: new Date(now.getTime() - 105 * 60 * 1000).toISOString()
      },
      {
        id: 'fallback-9',
        title: 'Amazon Web Services mantém liderança com crescimento de 13%',
        summary: 'A divisão de nuvem da Amazon continua dominando o mercado com margem operacional de 30% e expansão global acelerada.',
        content: 'AWS demonstra resiliência e liderança no mercado de computação em nuvem...',
        impact: 'positive' as const,
        time: this.formatTime(new Date(now.getTime() - 120 * 60 * 1000).toISOString()),
        source: 'AWS Brasil',
        url: '#',
        category: 'Ações de Tecnologia',
        sentiment: 0.2,
        asset: 'Amazon',
        publishedAt: new Date(now.getTime() - 120 * 60 * 1000).toISOString()
      },
      {
        id: 'fallback-10',
        title: 'Meta reporta crescimento de 25% em receita publicitária trimestral',
        summary: 'Facebook e Instagram mostram recuperação forte com 3.98 bilhões de usuários ativos mensais e investimentos em IA gerando resultados.',
        content: 'Meta demonstra força em publicidade digital com crescimento robusto em todas as plataformas...',
        impact: 'positive' as const,
        time: this.formatTime(new Date(now.getTime() - 135 * 60 * 1000).toISOString()),
        source: 'Social Media Brasil',
        url: '#',
        category: 'Ações de Redes Sociais',
        sentiment: 0.3,
        asset: 'Meta',
        publishedAt: new Date(now.getTime() - 135 * 60 * 1000).toISOString()
      }
    ];
  }

  private getFallbackMarketData(): RealMarketData[] {
    const now = new Date().toISOString();
    return [
      {
        symbol: 'BTC/USD',
        price: 75234,
        change: 1234,
        changePercent: 1.67,
        volume: 28000000000,
        lastUpdate: now
      },
      {
        symbol: 'ETH/USD',
        price: 2845,
        change: 45,
        changePercent: 1.6,
        volume: 15000000000,
        lastUpdate: now
      },
      {
        symbol: 'PEPE',
        price: 0.00002156,
        change: 0.00000123,
        changePercent: 6.05,
        volume: 2500000000,
        lastUpdate: now
      },
      {
        symbol: 'EUR/USD',
        price: 1.0892,
        change: 0.0012,
        changePercent: 0.11,
        volume: 0,
        lastUpdate: now
      },
      {
        symbol: 'AAPL',
        price: 195.23,
        change: 2.45,
        changePercent: 1.27,
        volume: 45000000,
        lastUpdate: now
      },
      {
        symbol: 'TSLA',
        price: 248.67,
        change: -3.21,
        changePercent: -1.27,
        volume: 78000000,
        lastUpdate: now
      }
    ];
  }

  // Método para atualizar notícias em tempo real
  startRealTimeUpdates(callback: (news: RealNewsItem[]) => void): () => void {
    const interval = setInterval(async () => {
      try {
        const news = await this.getLatestNews();
        callback(news);
      } catch (error) {
        console.error('Erro na atualização em tempo real:', error);
        // Em caso de erro, usar fallback
        callback(this.getFallbackNews());
      }
    }, 5 * 60 * 1000); // Atualizar a cada 5 minutos

    return () => clearInterval(interval);
  }
}

export const realNewsService = new RealNewsService();