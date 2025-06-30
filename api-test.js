// API 테스트 스크립트
import axios from 'axios';

const api = axios.create({
  timeout: 10000,
});

// Yahoo Finance API 테스트
async function testYahooFinance() {
  console.log('=== Testing Yahoo Finance API ===');
  try {
    const response = await api.get('https://query1.finance.yahoo.com/v8/finance/chart/AAPL', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('Yahoo Finance Success:', response.status);
    console.log('Data structure:', Object.keys(response.data));
    
    if (response.data.chart && response.data.chart.result) {
      const result = response.data.chart.result[0];
      console.log('Result keys:', Object.keys(result));
      if (result.meta) {
        console.log('Meta keys:', Object.keys(result.meta));
        console.log('Price:', result.meta.regularMarketPrice);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Yahoo Finance Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers
    });
    throw error;
  }
}

// Finnhub API 테스트
async function testFinnhub() {
  console.log('=== Testing Finnhub API ===');
  try {
    const response = await api.get('https://finnhub.io/api/v1/quote?symbol=AAPL&token=demo');
    
    console.log('Finnhub Success:', response.status);
    console.log('Data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Finnhub Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    throw error;
  }
}

// Mock 데이터 테스트
function testMockData() {
  console.log('=== Testing Mock Data ===');
  
  const symbol = 'AAPL';
  const basePrice = 175;
  const change = (Math.random() - 0.5) * 10;
  const changePercent = (change / basePrice) * 100;
  
  const mockData = {
    symbol,
    price: Math.round((basePrice + change) * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    volume: Math.floor(Math.random() * 10000000),
    high: Math.round((basePrice + Math.abs(change) + Math.random() * 5) * 100) / 100,
    low: Math.round((basePrice - Math.abs(change) - Math.random() * 5) * 100) / 100,
    open: Math.round((basePrice + (Math.random() - 0.5) * 3) * 100) / 100,
    previousClose: basePrice,
    timestamp: new Date().toISOString().split('T')[0],
  };
  
  console.log('Mock data generated:', mockData);
  return mockData;
}

// 모든 테스트 실행
async function runAllTests() {
  console.log('Starting API tests...\n');
  
  // Mock 데이터는 항상 작동해야 함
  console.log('1. Mock Data Test:');
  testMockData();
  
  console.log('\n2. Yahoo Finance Test:');
  try {
    await testYahooFinance();
  } catch (error) {
    console.log('Yahoo Finance failed, continuing...');
  }
  
  console.log('\n3. Finnhub Test:');
  try {
    await testFinnhub();
  } catch (error) {
    console.log('Finnhub failed, continuing...');
  }
  
  console.log('\nAPI tests completed.');
}

// 자동 실행
runAllTests().catch(console.error);