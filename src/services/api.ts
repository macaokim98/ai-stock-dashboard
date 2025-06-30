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
  // Free alternative API endpoints (no CORS issues)
  private static readonly FINNHUB_BASE = 'https://finnhub.io/api/v1';
  private static readonly FINNHUB_API_KEY = 'demo'; // Using demo key for testing
  
  static async getQuote(symbol: string): Promise<StockData> {
    try {
      // Using Finnhub API as it has better CORS support
      const response = await api.get(`${this.FINNHUB_BASE}/quote?symbol=${symbol}&token=${this.FINNHUB_API_KEY}`);
      
      const data = response.data;
      if (!data || data.c === undefined) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const price = data.c || 0; // current price
      const change = data.d || 0; // change
      const changePercent = data.dp || 0; // change percent
      const high = data.h || 0; // high
      const low = data.l || 0; // low  
      const open = data.o || 0; // open
      const previousClose = data.pc || 0; // previous close

      return {
        symbol: symbol,
        price: price,
        change: change,
        changePercent: changePercent,
        volume: 0, // Not available in free tier
        high: high,
        low: low,
        open: open,
        previousClose: previousClose,
        timestamp: new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      // Fallback to mock data if API fails
      return this.getMockData(symbol);
    }
  }

  // Fallback mock data generator
  private static getMockData(symbol: string): StockData {
    const basePrice = symbol === 'AAPL' ? 175 : symbol === 'GOOGL' ? 2800 : symbol === 'MSFT' ? 350 : 100;
    const change = (Math.random() - 0.5) * 10;
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol,
      price: basePrice + change,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 10000000),
      high: basePrice + Math.abs(change) + Math.random() * 5,
      low: basePrice - Math.abs(change) - Math.random() * 5,
      open: basePrice + (Math.random() - 0.5) * 3,
      previousClose: basePrice,
      timestamp: new Date().toISOString().split('T')[0],
    };
  }

  static async getHistoricalData(symbol: string, period: string = '1mo'): Promise<ChartData[]> {
    try {
      // Generate mock historical data as fallback
      return this.getMockHistoricalData(symbol, period);
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return this.getMockHistoricalData(symbol, period);
    }
  }

  // Generate mock historical data
  private static getMockHistoricalData(symbol: string, period: string): ChartData[] {
    const days = period === '1d' ? 1 : period === '5d' ? 5 : period === '1mo' ? 30 : 90;
    const basePrice = symbol === 'AAPL' ? 175 : symbol === 'GOOGL' ? 2800 : symbol === 'MSFT' ? 350 : 100;
    const data: ChartData[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const randomVariation = (Math.random() - 0.5) * basePrice * 0.1;
      const price = basePrice + randomVariation;
      
      data.push({
        timestamp: date.toISOString().split('T')[0],
        price: Math.max(price, basePrice * 0.9), // Keep within reasonable bounds
        volume: Math.floor(Math.random() * 10000000),
      });
    }
    
    return data;
  }

  static async getIntradayData(symbol: string): Promise<ChartData[]> {
    return this.getHistoricalData(symbol, '1d');
  }

  static async getDailyData(symbol: string): Promise<ChartData[]> {
    return this.getHistoricalData(symbol, '3mo');
  }

  // Get multiple quotes at once
  static async getMultipleQuotes(symbols: string[]): Promise<StockData[]> {
    try {
      // Use Finnhub API or fallback to mock data
      const promises = symbols.map(symbol => this.getQuote(symbol));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching multiple quotes:', error);
      // Return mock data for all symbols
      return symbols.map(symbol => this.getMockData(symbol));
    }
  }

  // Get market indices
  static async getMarketIndices(): Promise<{ name: string; value: number; change: number; changePercent: number }[]> {
    // Return mock market indices data
    try {
      return [
        {
          name: 'KOSPI',
          value: 2456.78 + (Math.random() - 0.5) * 100,
          change: (Math.random() - 0.5) * 50,
          changePercent: (Math.random() - 0.5) * 2
        },
        {
          name: 'KOSDAQ',
          value: 756.89 + (Math.random() - 0.5) * 50,
          change: (Math.random() - 0.5) * 20,
          changePercent: (Math.random() - 0.5) * 2
        },
        {
          name: 'S&P 500',
          value: 4567.12 + (Math.random() - 0.5) * 200,
          change: (Math.random() - 0.5) * 100,
          changePercent: (Math.random() - 0.5) * 1.5
        },
        {
          name: 'NASDAQ',
          value: 14234.56 + (Math.random() - 0.5) * 500,
          change: (Math.random() - 0.5) * 200,
          changePercent: (Math.random() - 0.5) * 1
        }
      ];
    } catch (error) {
      console.error('Error fetching market indices:', error);
      throw error;
    }
  }

}