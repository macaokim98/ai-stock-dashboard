import { create } from 'zustand';
import type { AIAnalysis } from '../types';

interface AIState {
  analyses: Record<string, AIAnalysis>;
  loading: Record<string, boolean>;
  error: string | null;
}

interface AIActions {
  setAnalysis: (symbol: string, analysis: AIAnalysis) => void;
  setLoading: (symbol: string, loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearAnalysis: (symbol: string) => void;
}

export const useAIStore = create<AIState & AIActions>((set) => ({
  analyses: {},
  loading: {},
  error: null,

  setAnalysis: (symbol, analysis) =>
    set((state) => ({
      analyses: { ...state.analyses, [symbol]: analysis },
      loading: { ...state.loading, [symbol]: false },
    })),

  setLoading: (symbol, loading) =>
    set((state) => ({
      loading: { ...state.loading, [symbol]: loading },
    })),

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  clearAnalysis: (symbol) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [symbol]: _removed, ...rest } = state.analyses;
      return { analyses: rest };
    }),
}));