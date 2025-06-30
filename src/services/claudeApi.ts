import axios from 'axios';
import type { StockData, AIAnalysis } from '../types';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export class ClaudeAPI {
  private static readonly headers = {
    'Content-Type': 'application/json',
    'X-API-Key': CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01'
  };

  static async analyzeStock(stockData: StockData): Promise<AIAnalysis> {
    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured');
    }

    const prompt = this.createAnalysisPrompt(stockData);

    try {
      const response = await axios.post<ClaudeResponse>(
        CLAUDE_API_URL,
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: this.headers,
          timeout: 30000
        }
      );

      const analysisText = response.data.content[0]?.text || '';
      
      return this.parseAnalysis(stockData.symbol, analysisText);
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error('주식 분석을 가져오는데 실패했습니다.');
    }
  }

  static async getMarketSentiment(marketData: { name: string; value: number; change: number }[]): Promise<string> {
    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured');
    }

    const prompt = this.createMarketSentimentPrompt(marketData);

    try {
      const response = await axios.post<ClaudeResponse>(
        CLAUDE_API_URL,
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: this.headers,
          timeout: 20000
        }
      );

      return response.data.content[0]?.text || '시장 분석을 가져올 수 없습니다.';
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error('시장 분석을 가져오는데 실패했습니다.');
    }
  }

  private static createAnalysisPrompt(stockData: StockData): string {
    
    return `
주식 분석을 부탁드립니다.

종목 정보:
- 심볼: ${stockData.symbol}
- 현재가: $${stockData.price}
- 변동: ${stockData.change > 0 ? '+' : ''}$${stockData.change} (${stockData.changePercent > 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%)
- 거래량: ${stockData.volume?.toLocaleString() || 'N/A'}
- 고가: $${stockData.high}
- 저가: $${stockData.low}

다음 항목들을 포함하여 간결하고 명확한 분석을 제공해주세요 (한국어로):

1. 현재 주가 동향 분석
2. 기술적 분석 (지지선/저항선, 추세 등)
3. 투자 전망 (단기/중기)
4. 위험 요소
5. 종합 의견 (매수/보유/매도)

분석은 300-500자 내외로 간결하게 작성해주세요.
`;
  }

  private static createMarketSentimentPrompt(marketData: { name: string; value: number; change: number }[]): string {
    const marketSummary = marketData.map(index => 
      `${index.name}: ${index.value} (${index.change > 0 ? '+' : ''}${index.change})`
    ).join(', ');

    return `
오늘의 주요 시장 지수 현황:
${marketSummary}

이 데이터를 바탕으로 현재 시장 전반적인 분위기와 투자 심리를 200자 내외로 간결하게 분석해주세요. 
한국어로 작성하고, 투자자들이 참고할 만한 시장 전망을 포함해주세요.
`;
  }

  private static parseAnalysis(symbol: string, analysisText: string): AIAnalysis {
    // Extract sentiment from analysis text
    const sentiment = this.extractSentiment(analysisText);
    const confidence = this.extractConfidence(analysisText);

    return {
      symbol,
      analysis: analysisText,
      sentiment,
      confidence,
      timestamp: new Date().toISOString()
    };
  }

  private static extractSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
    const lowerText = text.toLowerCase();
    
    const bullishKeywords = ['매수', '상승', '긍정적', '좋은', '강세', '추천'];
    const bearishKeywords = ['매도', '하락', '부정적', '나쁜', '약세', '주의'];
    
    const bullishCount = bullishKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const bearishCount = bearishKeywords.filter(keyword => lowerText.includes(keyword)).length;
    
    if (bullishCount > bearishCount) return 'bullish';
    if (bearishCount > bullishCount) return 'bearish';
    return 'neutral';
  }

  private static extractConfidence(text: string): number {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('확실') || lowerText.includes('강력')) return 90;
    if (lowerText.includes('가능성이 높') || lowerText.includes('추천')) return 80;
    if (lowerText.includes('예상') || lowerText.includes('전망')) return 70;
    if (lowerText.includes('주의') || lowerText.includes('불확실')) return 50;
    
    return 65; // Default confidence
  }
}