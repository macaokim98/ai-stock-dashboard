import { Globe } from 'lucide-react';
import type { MarketIndex } from '../../types/stock';

interface MarketIndicesProps {
  indices: MarketIndex[];
}

export const MarketIndices = ({ indices }: MarketIndicesProps) => {
  const getChangeColor = (change: number) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return '';
  };

  return (
    <div className="card market-indices">
      <div className="card-header">
        <h3 className="card-title">시장 현황</h3>
        <Globe size={24} className="card-icon" />
      </div>
      <div className="indices-grid">
        {indices.map((index) => (
          <div key={index.name} className="index-card">
            <div className="index-name">{index.name}</div>
            <div className="index-value">
              {index.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <div className={`index-change ${getChangeColor(index.change)}`}>
              {index.change > 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent > 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};