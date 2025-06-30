import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StockData, ChartData } from '../types';

interface StockState {
  stocks: Record<string, StockData>;
  chartData: Record<string, ChartData[]>;
  watchlist: string[];
  loading: boolean;
  error: string | null;
}

interface StockActions {
  updateStock: (symbol: string, data: StockData) => void;
  updateChartData: (symbol: string, data: ChartData[]) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useStockStore = create<StockState & StockActions>()(
  persist(
    (set) => ({
      stocks: {},
      chartData: {},
      watchlist: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
      loading: false,
      error: null,

      updateStock: (symbol, data) =>
        set((state) => ({
          stocks: { ...state.stocks, [symbol]: data },
        })),

      updateChartData: (symbol, data) =>
        set((state) => ({
          chartData: { ...state.chartData, [symbol]: data },
        })),

      addToWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.includes(symbol)
            ? state.watchlist
            : [...state.watchlist, symbol],
        })),

      removeFromWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s !== symbol),
        })),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'stock-store',
      partialize: (state) => ({ watchlist: state.watchlist }),
    }
  )
);