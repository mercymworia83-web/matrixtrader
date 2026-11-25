import { Injectable } from '@nestjs/common';
import * as https from 'https';

@Injectable()
export class TradingService {
  private baseUrl = 'https://testnet.binance.vision';
  private apiKey = process.env.BINANCE_API_KEY?.trim();
  private apiSecret = process.env.BINANCE_SECRET_KEY?.trim();

  constructor() {
    console.log('TradingService initialized');
    console.log('API Key present:', !!this.apiKey);
  }

  // Helper to make signed requests
  private async makeRequest(path: string, params: Record<string, any> = {}, method = 'GET'): Promise<any> {
    const timestamp = Date.now();
    const queryParams = new URLSearchParams({
      ...params,
      timestamp: timestamp.toString(),
    });

    // For signed endpoints, we need signature (skip for now, use public endpoints)
    const url = `${this.baseUrl}${path}?${queryParams.toString()}`;
    
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Parse error: ${data}`));
          }
        });
      }).on('error', reject);
    });
  }

  // Get price using PUBLIC endpoint (no auth needed)
  async getPrice(symbol: string): Promise<number> {
    try {
      console.log(`Fetching price for ${symbol}...`);
      const result: any = await this.makeRequest('/api/v3/ticker/price', { symbol });
      const price = parseFloat(result.price);
      console.log(`✅ Price fetched: $${price}`);
      return price;
    } catch (err) {
      console.error('❌ Price fetch failed:', err.message);
      return 0;
    }
  }

  // Get balance (requires auth - skip for now, return mock)
  async getBalance() {
    console.log('⚠️ Balance endpoint requires API signature - returning mock data');
    return {
      balances: [
        { asset: 'USDT', free: '10000.00000000', locked: '0.00000000' },
        { asset: 'BTC', free: '0.50000000', locked: '0.00000000' },
      ]
    };
  }

  // Place order (requires auth - skip for now)
  async placeOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number) {
    console.log(`⚠️ Order placement requires API signature - mock response`);
    return {
      symbol,
      orderId: Date.now(),
      status: 'FILLED',
      side,
      type: 'MARKET',
      origQty: quantity.toString(),
      executedQty: quantity.toString(),
      cummulativeQuoteQty: (quantity * 58000).toString(),
    };
  }

  // Get orders (requires auth - skip for now)
  async getOrders(symbol?: string) {
    console.log('⚠️ Orders endpoint requires API signature - returning empty');
    return [];
  }
}