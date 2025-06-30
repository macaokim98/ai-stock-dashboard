export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe?: number;
  high52Week: number;
  low52Week: number;
  timestamp: string;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface StockChart {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  alertPrice?: number;
}

export interface Portfolio {
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}