import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { StockChart as StockChartData } from '../../types/stock';

interface StockChartProps {
  data: StockChartData[];
  symbol: string;
}

export const StockChart = ({ data, symbol }: StockChartProps) => {
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === 'close') {
      return [`$${value.toLocaleString()}`, '종가'];
    }
    return [value, name];
  };

  return (
    <div className="card stock-chart">
      <div className="card-header">
        <h3 className="card-title">주가 차트 - {symbol}</h3>
        <BarChart3 size={24} className="card-icon" />
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.1)" 
            />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `$${value}`}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => new Date(label).toLocaleDateString('ko-KR')}
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#667eea" 
              strokeWidth={3}
              dot={false}
              fill="rgba(102, 126, 234, 0.1)"
              activeDot={{ 
                r: 6, 
                fill: '#667eea',
                stroke: '#ffffff',
                strokeWidth: 2 
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};