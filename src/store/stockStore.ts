import { create } from 'zustand';
import type { StockData, MarketIndex, WatchlistItem, Portfolio } from '../types/stock';

interface StockStore {
  // Market data
  marketIndices: MarketIndex[];
  watchlist: WatchlistItem[];
  portfolio: Portfolio[];
  selectedStock: StockData | null;
  
  // UI state
  activeTab: 'dashboard' | 'watchlist' | 'portfolio' | 'analysis';
  darkMode: boolean;
  isLoading: boolean;
  
  // Actions
  setMarketIndices: (indices: MarketIndex[]) => void;
  setWatchlist: (watchlist: WatchlistItem[]) => void;
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  setPortfolio: (portfolio: Portfolio[]) => void;
  setSelectedStock: (stock: StockData | null) => void;
  setActiveTab: (tab: 'dashboard' | 'watchlist' | 'portfolio' | 'analysis') => void;
  toggleDarkMode: () => void;
  setLoading: (loading: boolean) => void;
}

export const useStockStore = create<StockStore>((set) => ({
  // Initial state
  marketIndices: [],
  watchlist: [],
  portfolio: [],
  selectedStock: null,
  activeTab: 'dashboard',
  darkMode: false,
  isLoading: false,
  
  // Actions
  setMarketIndices: (indices) => set({ marketIndices: indices }),
  setWatchlist: (watchlist) => set({ watchlist }),
  addToWatchlist: (item) => set((state) => ({ 
    watchlist: [...state.watchlist, item] 
  })),
  removeFromWatchlist: (id) => set((state) => ({ 
    watchlist: state.watchlist.filter(item => item.id !== id) 
  })),
  setPortfolio: (portfolio) => set({ portfolio }),
  setSelectedStock: (stock) => set({ selectedStock: stock }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setLoading: (loading) => set({ isLoading: loading }),
}));