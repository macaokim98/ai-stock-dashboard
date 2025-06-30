import { Star } from 'lucide-react';
import type { WatchlistItem } from '../../types/stock';

interface WatchlistProps {
  items: WatchlistItem[];
}

// Mock stock data for demonstration
const mockStockPrices: Record<string, { price: number; change: number; changePercent: number }> = {
  'AAPL': { price: 175.43, change: 2.15, changePercent: 1.24 },
  'GOOGL': { price: 2847.63, change: -15.22, changePercent: -0.53 },
  'MSFT': { price: 342.85, change: 5.67, changePercent: 1.68 },
  'TSLA': { price: 248.92, change: -8.43, changePercent: -3.28 },
  'AMZN': { price: 3235.18, change: 12.45, changePercent: 0.39 },
};

export const Watchlist = ({ items }: WatchlistProps) => {

  const getChangeColor = (change: number) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return '';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">주요 종목</h3>
        <Star size={24} className="card-icon" />
      </div>
      
      <div className="watchlist">
        {items.map((item) => {
          const stockData = mockStockPrices[item.symbol] || { price: 0, change: 0, changePercent: 0 };
          
          return (
            <div key={item.id} className="watchlist-item">
              <div className="stock-info">
                <h4 className="stock-symbol">{item.name}</h4>
                <p className="stock-name">{item.symbol}</p>
              </div>
              
              <div className="stock-price">
                <div className="price">${stockData.price.toFixed(2)}</div>
                <div className={`stock-change ${getChangeColor(stockData.change)}`}>
                  {stockData.change > 0 ? '+' : ''}${stockData.change.toFixed(2)} ({stockData.changePercent > 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          );
        })}
        
        {items.length === 0 && (
          <div className="empty-state">
            <Star size={48} className="empty-icon" />
            <p>관심종목을 추가해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
};