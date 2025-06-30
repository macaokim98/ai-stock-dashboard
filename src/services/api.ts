import axios from 'axios';
import type { StockData, ChartData } from '../types';

const api = axios.create({
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export class StockAPI {
  // Yahoo Finance API endpoints
  private static readonly YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
  private static readonly YAHOO_QUOTE_BASE = 'https://query1.finance.yahoo.com/v7/finance/quote';
  
  static async getQuote(symbol: string): Promise<StockData> {
    try {
      const response = await api.get(`${this.YAHOO_QUOTE_BASE}?symbols=${symbol}`);
      
      const result = response.data.quoteResponse.result[0];
      if (!result) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const change = result.regularMarketChange || 0;
      const changePercent = result.regularMarketChangePercent || 0;

      return {
        symbol: result.symbol,
        price: result.regularMarketPrice || 0,
        change: change,
        changePercent: changePercent,
        volume: result.regularMarketVolume || 0,
        high: result.regularMarketDayHigh || 0,
        low: result.regularMarketDayLow || 0,
        open: result.regularMarketOpen || 0,
        previousClose: result.regularMarketPreviousClose || 0,
        timestamp: new Date(result.regularMarketTime * 1000).toISOString().split('T')[0],
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  static async getHistoricalData(symbol: string, period: string = '1mo', interval: string = '1d'): Promise<ChartData[]> {
    try {
      const response = await api.get(`${this.YAHOO_FINANCE_BASE}/${symbol}`, {
        params: {
          period1: this.getPeriodTimestamp(period),
          period2: Math.floor(Date.now() / 1000),
          interval: interval,
          includePrePost: false,
          events: 'div,splits'
        }
      });

      const result = response.data.chart.result[0];
      if (!result || !result.timestamp) {
        throw new Error(`No historical data found for symbol: ${symbol}`);
      }

      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];
      
      return timestamps.map((timestamp: number, index: number) => ({
        timestamp: new Date(timestamp * 1000).toISOString().split('T')[0],
        price: quotes.close[index] || 0,
        volume: quotes.volume?.[index] || 0,
      })).filter((item: { timestamp: string; price: number; volume: number }) => item.price > 0);
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      throw error;
    }
  }

  static async getIntradayData(symbol: string, interval: string = '5m'): Promise<ChartData[]> {
    return this.getHistoricalData(symbol, '1d', interval);
  }

  static async getDailyData(symbol: string): Promise<ChartData[]> {
    return this.getHistoricalData(symbol, '3mo', '1d');
  }

  // Helper method to convert period string to timestamp
  private static getPeriodTimestamp(period: string): number {
    const now = Date.now();
    const periods: Record<string, number> = {
      '1d': now - 24 * 60 * 60 * 1000,
      '5d': now - 5 * 24 * 60 * 60 * 1000,
      '1mo': now - 30 * 24 * 60 * 60 * 1000,
      '3mo': now - 90 * 24 * 60 * 60 * 1000,
      '6mo': now - 180 * 24 * 60 * 60 * 1000,
      '1y': now - 365 * 24 * 60 * 60 * 1000,
      '2y': now - 2 * 365 * 24 * 60 * 60 * 1000,
      '5y': now - 5 * 365 * 24 * 60 * 60 * 1000,
    };
    
    return Math.floor((periods[period] || periods['1mo']) / 1000);
  }

  // Get multiple quotes at once
  static async getMultipleQuotes(symbols: string[]): Promise<StockData[]> {
    try {
      const symbolsStr = symbols.join(',');
      const response = await api.get(`${this.YAHOO_QUOTE_BASE}?symbols=${symbolsStr}`);
      
      const results = response.data.quoteResponse.result;
      if (!results || results.length === 0) {
        throw new Error('No data found for provided symbols');
      }

      return results.map((result: {
        symbol: string;
        regularMarketPrice: number;
        regularMarketChange: number;
        regularMarketChangePercent: number;
        regularMarketVolume: number;
        regularMarketDayHigh: number;
        regularMarketDayLow: number;
        regularMarketOpen: number;
        regularMarketPreviousClose: number;
        regularMarketTime: number;
      }) => {
        const change = result.regularMarketChange || 0;
        const changePercent = result.regularMarketChangePercent || 0;

        return {
          symbol: result.symbol,
          price: result.regularMarketPrice || 0,
          change: change,
          changePercent: changePercent,
          volume: result.regularMarketVolume || 0,
          high: result.regularMarketDayHigh || 0,
          low: result.regularMarketDayLow || 0,
          open: result.regularMarketOpen || 0,
          previousClose: result.regularMarketPreviousClose || 0,
          timestamp: new Date(result.regularMarketTime * 1000).toISOString().split('T')[0],
        };
      });
    } catch (error) {
      console.error('Error fetching multiple quotes:', error);
      throw error;
    }
  }

  // Get market indices
  static async getMarketIndices(): Promise<{ name: string; value: number; change: number; changePercent: number }[]> {
    const indices = ['^GSPC', '^IXIC', '^DJI', '^KS11', '^KQ11']; // S&P 500, NASDAQ, Dow Jones, KOSPI, KOSDAQ
    
    try {
      const data = await this.getMultipleQuotes(indices);
      return data.map(item => ({
        name: this.getIndexName(item.symbol),
        value: item.price,
        change: item.change,
        changePercent: item.changePercent,
      }));
    } catch (error) {
      console.error('Error fetching market indices:', error);
      throw error;
    }
  }

  private static getIndexName(symbol: string): string {
    const names: Record<string, string> = {
      '^GSPC': 'S&P 500',
      '^IXIC': 'NASDAQ',
      '^DJI': 'Dow Jones',
      '^KS11': 'KOSPI',
      '^KQ11': 'KOSDAQ',
    };
    return names[symbol] || symbol;
  }
}