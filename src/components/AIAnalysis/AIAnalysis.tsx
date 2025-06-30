import { useState } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle } from 'lucide-react';
import { useStockAnalysis, useMarketSentiment, useAnalyzeMutation } from '../../hooks/useClaudeAnalysis';
import { useMarketIndices, useStockQuote } from '../../hooks/useStockData';

const POPULAR_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];

export const AIAnalysis = () => {
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const { data: marketIndices } = useMarketIndices();
  const { data: stockData, isLoading: stockLoading } = useStockQuote(selectedStock);
  const { data: analysis, isLoading: analysisLoading, error: analysisError } = useStockAnalysis(stockData || null);
  const { data: marketSentiment, isLoading: sentimentLoading } = useMarketSentiment(marketIndices || []);
  const analyzeMutation = useAnalyzeMutation();

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="text-green-500" size={20} />;
      case 'bearish':
        return <TrendingDown className="text-red-500" size={20} />;
      default:
        return <Minus className="text-gray-500" size={20} />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'positive';
      case 'bearish':
        return 'negative';
      default:
        return '';
    }
  };

  const handleRefreshAnalysis = () => {
    if (stockData) {
      analyzeMutation.mutate({ stockData });
    }
  };

  return (
    <div className="ai-analysis">
      {/* Market Sentiment Card */}
      <div className="card market-sentiment">
        <div className="card-header">
          <h3 className="card-title">시장 전체 분석</h3>
          <Brain size={24} className="card-icon" />
        </div>
        <div className="sentiment-content">
          {sentimentLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>시장 분석 중...</p>
            </div>
          ) : marketSentiment ? (
            <div className="sentiment-text">
              <p>{marketSentiment}</p>
            </div>
          ) : (
            <div className="error-state">
              <AlertCircle size={48} className="error-icon" />
              <p>시장 분석을 불러올 수 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* Stock Selection */}
      <div className="card stock-selection">
        <div className="card-header">
          <h3 className="card-title">개별 종목 분석</h3>
          <div className="analysis-controls">
            <select 
              value={selectedStock} 
              onChange={(e) => setSelectedStock(e.target.value)}
              className="stock-selector"
            >
              {POPULAR_STOCKS.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
            <button 
              onClick={handleRefreshAnalysis}
              disabled={analyzeMutation.isPending || !stockData}
              className="refresh-button"
            >
              <RefreshCw 
                size={16} 
                className={analyzeMutation.isPending ? 'animate-spin' : ''} 
              />
              분석
            </button>
          </div>
        </div>

        {/* Stock Info */}
        {stockData && (
          <div className="stock-info-panel">
            <div className="stock-header">
              <h4>{selectedStock}</h4>
              <div className="stock-metrics">
                <span className="stock-price">${stockData.price.toFixed(2)}</span>
                <span className={`stock-change ${stockData.change >= 0 ? 'positive' : 'negative'}`}>
                  {stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)} 
                  ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        <div className="analysis-results">
          {stockLoading || analysisLoading || analyzeMutation.isPending ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>AI 분석 중...</p>
            </div>
          ) : analysisError ? (
            <div className="error-state">
              <AlertCircle size={48} className="error-icon" />
              <p>분석을 불러올 수 없습니다</p>
              <button onClick={handleRefreshAnalysis} className="retry-button">
                다시 시도
              </button>
            </div>
          ) : analysis ? (
            <div className="analysis-content">
              <div className="analysis-header">
                <div className="sentiment-indicator">
                  {getSentimentIcon(analysis.sentiment)}
                  <span className={`sentiment-label ${getSentimentColor(analysis.sentiment)}`}>
                    {analysis.sentiment === 'bullish' ? '강세' : 
                     analysis.sentiment === 'bearish' ? '약세' : '중립'}
                  </span>
                </div>
                <div className="confidence-meter">
                  <span className="confidence-label">신뢰도</span>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${analysis.confidence}%` }}
                    ></div>
                  </div>
                  <span className="confidence-value">{analysis.confidence}%</span>
                </div>
              </div>
              <div className="analysis-text">
                <p>{analysis.analysis}</p>
              </div>
              <div className="analysis-meta">
                <small>
                  분석 시간: {new Date(analysis.timestamp).toLocaleString('ko-KR')}
                </small>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Brain size={48} className="empty-icon" />
              <p>종목을 선택하고 분석 버튼을 클릭하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};