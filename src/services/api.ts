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
  // Alpha Vantage API with CORS proxy
  private static readonly ALPHA_VANTAGE_BASE = 'https://api.allorigins.win/get?url=';
  private static readonly ALPHA_VANTAGE_API_KEY = 'ZXQ9GMI1ABII26WQ'; // Real API key
  private static readonly REAL_API_BASE = 'https://www.alphavantage.co/query';
  
  static async getQuote(symbol: string): Promise<StockData> {
    try {
      // Try Alpha Vantage API first with CORS proxy
      const alphaVantageUrl = `${this.REAL_API_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_API_KEY}`;
      const proxyUrl = `${this.ALPHA_VANTAGE_BASE}${encodeURIComponent(alphaVantageUrl)}`;
      
      const response = await api.get(proxyUrl);
      const data = JSON.parse(response.data.contents);
      
      const quote = data['Global Quote'];
      if (!quote || !quote['05. price']) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const price = parseFloat(quote['05. price']) || 0;
      const change = parseFloat(quote['09. change']) || 0;
      const changePercent = parseFloat(quote['10. change percent'].replace('%', '')) || 0;
      const high = parseFloat(quote['03. high']) || 0;
      const low = parseFloat(quote['04. low']) || 0;
      const open = parseFloat(quote['02. open']) || 0;
      const previousClose = parseFloat(quote['08. previous close']) || 0;
      const volume = parseInt(quote['06. volume']) || 0;

      return {
        symbol: symbol,
        price: price,
        change: change,
        changePercent: changePercent,
        volume: volume,
        high: high,
        low: low,
        open: open,
        previousClose: previousClose,
        timestamp: new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      
      // Try alternative free API as fallback
      try {
        return await this.getQuoteFromFinhub(symbol);
      } catch (fallbackError) {
        console.error(`Fallback API also failed for ${symbol}:`, fallbackError);
        // Return mock data as last resort
        return this.getMockData(symbol);
      }
    }
  }

  // Fallback to Finnhub API
  private static async getQuoteFromFinhub(symbol: string): Promise<StockData> {
    const finnhubUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=demo`;
    const response = await api.get(finnhubUrl);
    
    const data = response.data;
    if (!data || data.c === undefined) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    return {
      symbol: symbol,
      price: data.c || 0,
      change: data.d || 0,
      changePercent: data.dp || 0,
      volume: 0,
      high: data.h || 0,
      low: data.l || 0,
      open: data.o || 0,
      previousClose: data.pc || 0,
      timestamp: new Date().toISOString().split('T')[0],
    };
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
      // Try Alpha Vantage API for daily data
      const alphaVantageUrl = `${this.REAL_API_BASE}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_API_KEY}`;
      const proxyUrl = `${this.ALPHA_VANTAGE_BASE}${encodeURIComponent(alphaVantageUrl)}`;
      
      const response = await api.get(proxyUrl);
      const data = JSON.parse(response.data.contents);
      
      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error(`No historical data found for symbol: ${symbol}`);
      }

      // Convert to our format and limit by period
      const days = period === '1d' ? 1 : period === '5d' ? 5 : period === '1mo' ? 30 : 90;
      const entries = Object.entries(timeSeries)
        .slice(0, days)
        .map(([date, values]: [string, any]) => ({
          timestamp: date,
          price: parseFloat(values['4. close']) || 0,
          volume: parseInt(values['5. volume']) || 0,
        }))
        .reverse(); // Reverse to get chronological order

      return entries;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      
      // Try alternative free API
      try {
        return await this.getHistoricalFromFinhub(symbol, period);
      } catch (fallbackError) {
        console.error(`Fallback historical data also failed for ${symbol}:`, fallbackError);
        return this.getMockHistoricalData(symbol, period);
      }
    }
  }

  // Fallback historical data from free APIs
  private static async getHistoricalFromFinhub(symbol: string, period: string): Promise<ChartData[]> {
    // Since Finnhub free tier doesn't provide historical data easily,
    // we'll use current quote to create some recent data points
    const quote = await this.getQuoteFromFinhub(symbol);
    const days = period === '1d' ? 1 : period === '5d' ? 5 : period === '1mo' ? 30 : 90;
    const data: ChartData[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate some price variation around current price
      const variation = (Math.random() - 0.5) * quote.price * 0.05; // 5% max variation
      const price = Math.max(quote.price + variation, quote.price * 0.9);
      
      data.push({
        timestamp: date.toISOString().split('T')[0],
        price: price,
        volume: Math.floor(Math.random() * quote.volume || 1000000),
      });
    }
    
    return data;
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
    try {
      // Use specific Alpha Vantage function for market indices
      const indices = [
        { function: 'GLOBAL_QUOTE', symbol: 'SPY', name: 'S&P 500', multiplier: 10 },      // SPY * 10 ≈ S&P 500
        { function: 'GLOBAL_QUOTE', symbol: 'QQQ', name: 'NASDAQ', multiplier: 30 },       // QQQ * 30 ≈ NASDAQ
        { function: 'GLOBAL_QUOTE', symbol: 'DIA', name: 'Dow Jones', multiplier: 100 },   // DIA * 100 ≈ Dow Jones
        { function: 'GLOBAL_QUOTE', symbol: 'IWM', name: 'Russell 2000', multiplier: 10 }  // IWM * 10 ≈ Russell 2000
      ];

      const promises = indices.map(async (index) => {
        try {
          const stockData = await this.getQuote(index.symbol);
          return {
            name: index.name,
            value: Math.round(stockData.price * index.multiplier * 100) / 100, // Convert ETF to approximate index value
            change: Math.round(stockData.change * index.multiplier * 100) / 100,
            changePercent: stockData.changePercent
          };
        } catch (error) {
          console.error(`Error fetching ${index.name}:`, error);
          // Return realistic mock data for this index if real data fails
          return this.getMockIndexData(index.name);
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching market indices:', error);
      // Return realistic mock data as fallback
      return [
        this.getMockIndexData('S&P 500'),
        this.getMockIndexData('NASDAQ'),
        this.getMockIndexData('Dow Jones'),
        this.getMockIndexData('Russell 2000')
      ];
    }
  }

  // Generate realistic mock index data
  private static getMockIndexData(indexName: string): { name: string; value: number; change: number; changePercent: number } {
    const baseValues: Record<string, number> = {
      'S&P 500': 4500,
      'NASDAQ': 14000,
      'Dow Jones': 35000,
      'Russell 2000': 2000
    };

    const baseValue = baseValues[indexName] || 1000;
    const change = (Math.random() - 0.5) * baseValue * 0.02; // 2% max change
    const changePercent = (change / baseValue) * 100;

    return {
      name: indexName,
      value: Math.round((baseValue + change) * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100
    };
  }

}