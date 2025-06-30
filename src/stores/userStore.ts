import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings, PortfolioItem } from '../types';

interface UserState {
  settings: UserSettings;
  portfolio: PortfolioItem[];
}

interface UserActions {
  updateSettings: (settings: Partial<UserSettings>) => void;
  addToPortfolio: (item: PortfolioItem) => void;
  removeFromPortfolio: (symbol: string) => void;
  updatePortfolioItem: (symbol: string, updates: Partial<PortfolioItem>) => void;
}

const defaultSettings: UserSettings = {
  favoriteSymbols: ['AAPL', 'GOOGL', 'MSFT'],
  refreshInterval: 5000,
  chartTimeframe: '1D',
  theme: 'light',
};

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      portfolio: [],

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      addToPortfolio: (item) =>
        set((state) => ({
          portfolio: [...state.portfolio, item],
        })),

      removeFromPortfolio: (symbol) =>
        set((state) => ({
          portfolio: state.portfolio.filter((item) => item.symbol !== symbol),
        })),

      updatePortfolioItem: (symbol, updates) =>
        set((state) => ({
          portfolio: state.portfolio.map((item) =>
            item.symbol === symbol ? { ...item, ...updates } : item
          ),
        })),
    }),
    {
      name: 'user-store',
    }
  )
);