import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { Portfolio as PortfolioType } from '../../types/stock';

interface PortfolioProps {
  portfolio: PortfolioType[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'];

export const Portfolio = ({ portfolio }: PortfolioProps) => {
  const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
  const totalGainLoss = portfolio.reduce((sum, item) => sum + item.gainLoss, 0);
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  const pieData = portfolio.map((item, index) => ({
    name: item.symbol,
    value: item.totalValue,
    color: COLORS[index % COLORS.length]
  }));

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={16} className="text-green-500" />;
    if (change < 0) return <TrendingDown size={16} className="text-red-500" />;
    return null;
  };

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h2 className="section-title">
          <DollarSign size={20} />
          포트폴리오
        </h2>
      </div>

      <div className="portfolio-summary">
        <div className="summary-card">
          <h3>총 자산 가치</h3>
          <div className="summary-value">
            ${totalValue.toLocaleString()}
          </div>
        </div>
        <div className="summary-card">
          <h3>총 손익</h3>
          <div className={`summary-value ${getChangeColor(totalGainLoss)}`}>
            {getIcon(totalGainLoss)}
            <span>
              {totalGainLoss > 0 ? '+' : ''}${totalGainLoss.toLocaleString()}
            </span>
            <span className="gain-percent">
              ({totalGainLossPercent > 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="portfolio-content">
        <div className="portfolio-chart">
          <h3>자산 구성</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(1)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '가치']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="portfolio-list">
          <h3>보유 종목</h3>
          <div className="holdings-table">
            <div className="table-header">
              <span>종목</span>
              <span>보유량</span>
              <span>평균단가</span>
              <span>현재가</span>
              <span>총 가치</span>
              <span>손익</span>
            </div>
            {portfolio.map((item) => (
              <div key={item.symbol} className="table-row">
                <span className="stock-symbol">{item.symbol}</span>
                <span>{item.shares}</span>
                <span>${item.avgCost.toFixed(2)}</span>
                <span>${item.currentPrice.toFixed(2)}</span>
                <span>${item.totalValue.toLocaleString()}</span>
                <span className={getChangeColor(item.gainLoss)}>
                  {getIcon(item.gainLoss)}
                  {item.gainLoss > 0 ? '+' : ''}${item.gainLoss.toFixed(2)}
                  <br />
                  <small>
                    ({item.gainLossPercent > 0 ? '+' : ''}{item.gainLossPercent.toFixed(2)}%)
                  </small>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {portfolio.length === 0 && (
        <div className="empty-state">
          <DollarSign size={48} className="empty-icon" />
          <p>포트폴리오가 비어있습니다</p>
          <p>종목을 추가하여 포트폴리오를 관리해보세요</p>
        </div>
      )}
    </div>
  );
};