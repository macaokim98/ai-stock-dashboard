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
      // Return mock analysis if API key is not configured
      return this.getMockAnalysis(stockData);
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
      // Return mock analysis on error
      return this.getMockAnalysis(stockData);
    }
  }

  static async getMarketSentiment(marketData: { name: string; value: number; change: number }[]): Promise<string> {
    if (!CLAUDE_API_KEY) {
      return this.getMockMarketSentiment(marketData);
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
      return this.getMockMarketSentiment(marketData);
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

  // Mock analysis when API is not available
  private static getMockAnalysis(stockData: StockData): AIAnalysis {
    const sentiments = ['bullish', 'bearish', 'neutral'];
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)] as 'bullish' | 'bearish' | 'neutral';
    
    const analysisTexts = {
      bullish: `${stockData.symbol} 종목은 현재 강세 흐름을 보이고 있습니다. 현재가 $${stockData.price}에서 상승 모멘텀이 지속되고 있으며, 기술적 지표들이 긍정적인 신호를 보내고 있습니다.`,
      bearish: `${stockData.symbol} 종목은 현재 약세 구간에 있습니다. 현재가 $${stockData.price}에서 하락 압력이 나타나고 있으며, 단기적으로 조정이 예상됩니다.`,
      neutral: `${stockData.symbol} 종목은 현재 중립적인 상황입니다. 현재가 $${stockData.price}에서 횡보하고 있으며, 명확한 방향성을 찾기 위해서는 추가 관찰이 필요합니다.`
    };

    return {
      symbol: stockData.symbol,
      sentiment: randomSentiment,
      confidence: Math.floor(Math.random() * 30) + 60, // 60-90% confidence
      analysis: analysisTexts[randomSentiment],
      timestamp: new Date().toISOString(),
    };
  }

  // Mock market sentiment
  private static getMockMarketSentiment(marketData: { name: string; value: number; change: number }[]): string {
    const positiveCount = marketData.filter(item => item.change > 0).length;
    const totalCount = marketData.length;
    const positiveRatio = positiveCount / totalCount;

    if (positiveRatio > 0.7) {
      return '현재 시장은 전반적으로 강세를 보이고 있습니다. 대부분의 주요 지수가 상승하며 투자자들의 위험선호도가 증가하고 있는 상황입니다.';
    } else if (positiveRatio < 0.3) {
      return '시장이 전반적으로 약세를 보이고 있습니다. 주요 지수들의 하락으로 투자자들이 신중한 접근을 취하고 있는 상황입니다.';
    } else {
      return '시장이 혼조세를 보이고 있습니다. 일부 지수는 상승하고 일부는 하락하며 방향성을 찾아가는 과정에 있습니다.';
    }
  }
}