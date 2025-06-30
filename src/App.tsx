import { useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { MarketIndices } from './components/MarketOverview/MarketIndices';
import { StockChart } from './components/StockChart/StockChart';
import { Watchlist } from './components/Watchlist/Watchlist';
import { Portfolio } from './components/Portfolio/Portfolio';
import { AIAnalysis } from './components/AIAnalysis/AIAnalysis';
import { useStockStore } from './store/stockStore';
import { useMarketIndices, useDailyData } from './hooks/useStockData';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import type { MarketIndex, StockChart as StockChartData, WatchlistItem, Portfolio as PortfolioType } from './types/stock';
import './App.css';

// Mock data for demonstration
const mockMarketIndices: MarketIndex[] = [
  { name: 'KOSPI', value: 2456.78, change: 15.23, changePercent: 0.62 },
  { name: 'KOSDAQ', value: 756.89, change: -8.45, changePercent: -1.10 },
  { name: 'S&P 500', value: 4567.12, change: 25.67, changePercent: 0.57 },
  { name: 'NASDAQ', value: 14234.56, change: -45.23, changePercent: -0.32 },
];

const mockChartData: StockChartData[] = [
  { timestamp: '2024-01-01', open: 170, high: 175, low: 168, close: 173, volume: 1000000 },
  { timestamp: '2024-01-02', open: 173, high: 178, low: 171, close: 176, volume: 1200000 },
  { timestamp: '2024-01-03', open: 176, high: 179, low: 174, close: 177, volume: 980000 },
  { timestamp: '2024-01-04', open: 177, high: 182, low: 176, close: 180, volume: 1500000 },
  { timestamp: '2024-01-05', open: 180, high: 184, low: 178, close: 182, volume: 1300000 },
];

const mockWatchlist: WatchlistItem[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', alertPrice: 180 },
  { id: '2', symbol: 'GOOGL', name: 'Alphabet Inc.', alertPrice: 2800 },
  { id: '3', symbol: 'MSFT', name: 'Microsoft Corp.', alertPrice: 350 },
  { id: '4', symbol: 'TSLA', name: 'Tesla Inc.' },
  { id: '5', symbol: 'AMZN', name: 'Amazon.com Inc.' },
];

const mockPortfolio: PortfolioType[] = [
  {
    symbol: 'AAPL',
    shares: 100,
    avgCost: 150.00,
    currentPrice: 175.43,
    totalValue: 17543,
    gainLoss: 2543,
    gainLossPercent: 16.95
  },
  {
    symbol: 'GOOGL',
    shares: 10,
    avgCost: 2900.00,
    currentPrice: 2847.63,
    totalValue: 28476.30,
    gainLoss: -523.70,
    gainLossPercent: -1.81
  },
  {
    symbol: 'MSFT',
    shares: 50,
    avgCost: 320.00,
    currentPrice: 342.85,
    totalValue: 17142.50,
    gainLoss: 1142.50,
    gainLossPercent: 7.14
  }
];

function App() {
  const { 
    darkMode, 
    activeTab, 
    watchlist, 
    portfolio,
    setWatchlist, 
    setPortfolio 
  } = useStockStore();

  // Use React Query hooks for data fetching
  const { data: marketIndices, isLoading: marketLoading, error: marketError } = useMarketIndices();
  const { data: chartData, isLoading: chartLoading, error: chartError } = useDailyData('AAPL');
  
  // Auto-refresh functionality
  useAutoRefresh();

  useEffect(() => {
    // Initialize mock watchlist and portfolio if not set
    if (watchlist.length === 0) {
      setWatchlist(mockWatchlist);
    }
    if (portfolio.length === 0) {
      setPortfolio(mockPortfolio);
    }
  }, [watchlist.length, portfolio.length, setWatchlist, setPortfolio]);

  useEffect(() => {
    // Apply dark mode theme
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  const renderContent = () => {
    if (marketLoading || chartLoading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      );
    }

    if (marketError || chartError) {
      return (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-grid">
            <MarketIndices indices={marketIndices || mockMarketIndices} />
            <StockChart 
              data={chartData ? chartData.map(item => ({
                timestamp: item.timestamp,
                open: item.price,
                high: item.price,
                low: item.price,
                close: item.price,
                volume: item.volume || 0
              })) : mockChartData} 
              symbol="AAPL" 
            />
          </div>
        );
      case 'watchlist':
        return <Watchlist items={watchlist} />;
      case 'portfolio':
        return <Portfolio portfolio={portfolio} />;
      case 'analysis':
        return <AIAnalysis />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
