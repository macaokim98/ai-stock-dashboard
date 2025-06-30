import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUserPreferences } from './useLocalStorage';

export const useAutoRefresh = () => {
  const queryClient = useQueryClient();
  const [preferences] = useUserPreferences();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (preferences.autoRefresh) {
      intervalRef.current = setInterval(() => {
        // Refresh all queries
        queryClient.invalidateQueries({ queryKey: ['marketIndices'] });
        queryClient.invalidateQueries({ queryKey: ['stockQuote'] });
        queryClient.invalidateQueries({ queryKey: ['dailyData'] });
        queryClient.invalidateQueries({ queryKey: ['multipleStockQuotes'] });
        
        console.log('Auto-refreshing data...');
      }, preferences.refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [preferences.autoRefresh, preferences.refreshInterval, queryClient]);

  const manualRefresh = () => {
    queryClient.invalidateQueries();
    console.log('Manual refresh triggered');
  };

  return { manualRefresh };
};

// Hook for showing last update time
export const useLastUpdateTime = () => {
  const queryClient = useQueryClient();
  
  const getLastUpdateTime = (queryKey: string[]) => {
    const query = queryClient.getQueryState(queryKey);
    return query?.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null;
  };

  return { getLastUpdateTime };
};