import { useQuery, useQueries } from '@tanstack/react-query';
import { StockAPI } from '../services/api';

// Market indices query
export const useMarketIndices = () => {
  return useQuery({
    queryKey: ['marketIndices'],
    queryFn: StockAPI.getMarketIndices,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

// Single stock quote query
export const useStockQuote = (symbol: string) => {
  return useQuery({
    queryKey: ['stockQuote', symbol],
    queryFn: () => StockAPI.getQuote(symbol),
    enabled: !!symbol,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 15 * 1000, // 15 seconds
  });
};

// Multiple stock quotes query
export const useMultipleStockQuotes = (symbols: string[]) => {
  return useQuery({
    queryKey: ['multipleStockQuotes', symbols],
    queryFn: () => StockAPI.getMultipleQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 15 * 1000, // 15 seconds
  });
};

// Historical data query
export const useHistoricalData = (symbol: string, period: string = '1mo') => {
  return useQuery({
    queryKey: ['historicalData', symbol, period],
    queryFn: () => StockAPI.getHistoricalData(symbol, period),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
};

// Daily data query
export const useDailyData = (symbol: string) => {
  return useQuery({
    queryKey: ['dailyData', symbol],
    queryFn: () => StockAPI.getDailyData(symbol),
    enabled: !!symbol,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

// Watchlist data query
export const useWatchlistData = (symbols: string[]) => {
  return useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ['stockQuote', symbol],
      queryFn: () => StockAPI.getQuote(symbol),
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchInterval: 15 * 1000, // 15 seconds
    })),
  });
};

// Portfolio data query
export const usePortfolioData = (symbols: string[]) => {
  return useQuery({
    queryKey: ['portfolioData', symbols],
    queryFn: () => StockAPI.getMultipleQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 15 * 1000, // 15 seconds
  });
};