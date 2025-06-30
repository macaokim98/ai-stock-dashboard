import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Custom hooks for specific data
export const useWatchlistStorage = () => {
  return useLocalStorage('stock-dashboard-watchlist', []);
};

export const usePortfolioStorage = () => {
  return useLocalStorage('stock-dashboard-portfolio', []);
};

export const useUserPreferences = () => {
  return useLocalStorage('stock-dashboard-preferences', {
    darkMode: false,
    refreshInterval: 30000, // 30 seconds
    selectedSymbols: ['AAPL', 'GOOGL', 'MSFT'],
    chartTimeframe: '1mo',
    enableNotifications: false,
    autoRefresh: true,
  });
};

export const useAIAnalysisCache = () => {
  return useLocalStorage('stock-dashboard-ai-cache', {});
};