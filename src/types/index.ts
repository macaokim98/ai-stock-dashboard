export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export interface ChartData {
  timestamp: string;
  price: number;
  volume?: number;
}

export interface PortfolioItem {
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice?: number;
}

export interface AIAnalysis {
  symbol: string;
  analysis: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timestamp: string;
}

export interface UserSettings {
  favoriteSymbols: string[];
  refreshInterval: number;
  chartTimeframe: '1H' | '1D' | '1W' | '1M';
  theme: 'light' | 'dark';
}