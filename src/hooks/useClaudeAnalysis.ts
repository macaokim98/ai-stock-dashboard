import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClaudeAPI } from '../services/claudeApi';
import type { StockData, AIAnalysis } from '../types';

// Stock analysis query
export const useStockAnalysis = (stockData: StockData | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['stockAnalysis', stockData?.symbol],
    queryFn: () => {
      if (!stockData) throw new Error('No stock data provided');
      return ClaudeAPI.analyzeStock(stockData);
    },
    enabled: enabled && !!stockData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Market sentiment query
export const useMarketSentiment = (marketData: { name: string; value: number; change: number; changePercent: number }[], enabled: boolean = true) => {
  return useQuery({
    queryKey: ['marketSentiment'],
    queryFn: () => ClaudeAPI.getMarketSentiment(marketData),
    enabled: enabled && marketData.length > 0,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
};

// Mutation for getting new analysis
export const useAnalyzeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stockData }: { stockData: StockData }) => 
      ClaudeAPI.analyzeStock(stockData),
    onSuccess: (data, variables) => {
      // Update the query cache
      queryClient.setQueryData(['stockAnalysis', variables.stockData.symbol], data);
    },
  });
};

// Custom hook for batch analysis
export const useBatchAnalysis = () => {
  const queryClient = useQueryClient();

  const analyzeBatch = async (stockDataArray: StockData[]) => {
    const analyses: AIAnalysis[] = [];
    
    for (const stockData of stockDataArray) {
      try {
        const analysis = await ClaudeAPI.analyzeStock(stockData);
        analyses.push(analysis);
        
        // Cache each analysis
        queryClient.setQueryData(['stockAnalysis', stockData.symbol], analysis);
      } catch (error) {
        console.error(`Failed to analyze ${stockData.symbol}:`, error);
      }
    }
    
    return analyses;
  };

  return useMutation({
    mutationFn: analyzeBatch,
  });
};