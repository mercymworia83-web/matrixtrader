import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as binance from 'binance-api-node';

@Injectable()
export class TradingService implements OnModuleInit, OnModuleDestroy {
  private client: any;
  private wsConnections: Map<string, any> = new Map();
  private latestPrices: Map<string, number> = new Map();
  private balanceCache: any = null;
  private ordersCache: any[] = [];

  constructor() {
    console.log('TRADING SERVICE LOADED');
    
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_SECRET_KEY;
    
    if (!apiKey || !apiSecret) {
      throw new Error('API keys missing! Check .env file.');
    }

    this.client = binance.default({
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim(),
      httpBase: 'https://testnet.binance.vision',
      wsBase: 'wss://stream.testnet.binance.vision', // FIXED: Correct testnet WS URL
    });
  }

  async onModuleInit() {
    console.log('Initializing...');
    
    // Cache balance on startup
    try {
      this.balanceCache = await this.client.accountInfo();
      console.log('Balance cached:', JSON.stringify(this.balanceCache.balances.filter((b: any) => parseFloat(b.free) > 0)));
    } catch (err) {
      console.error('Failed to cache balance:', err.message);
    }

    // Start WebSocket for BTCUSDT
    this.startPriceStream('BTCUSDT');
  }

  onModuleDestroy() {
    this.wsConnections.forEach((ws) => {
      if (ws && typeof ws.close === 'function') ws.close();
    });
    console.log('WebSocket connections closed');
  }

  private startPriceStream(symbol: string) {
    if (this.wsConnections.has(symbol)) return;

    console.log(`Starting WebSocket for ${symbol}...`);
    
    try {
      const ws = this.client.ws.ticker(symbol.toLowerCase(), (ticker: any) => {
        const price = parseFloat(ticker.lastPrice || ticker.c);
        if (price > 0) {
          this.latestPrices.set(symbol, price);
          console.log(`📈 ${symbol}: $${price}`);
        }
      });

      this.wsConnections.set(symbol, ws);
      
      // Fallback: If no price after 10 seconds, fetch via REST
      setTimeout(async () => {
        if (!this.latestPrices.has(symbol) || this.latestPrices.get(symbol) === 0) {
          console.log(`⚠️ WebSocket slow for ${symbol}, fetching via REST...`);
          try {
            const ticker = await this.client.ticker({ symbol });
            this.latestPrices.set(symbol, parseFloat(ticker.lastPrice));
          } catch (err) {
            console.error(`REST fallback failed for ${symbol}:`, err.message);
          }
        }
      }, 10000);
      
    } catch (err) {
      console.error(`WebSocket init failed for ${symbol}:`, err.message);
    }
  }

  async getPrice(symbol: string): Promise<number> {
    this.startPriceStream(symbol);
    
    // Wait up to 15 seconds for WebSocket or REST fallback
    let attempts = 0;
    while (attempts < 150) {
      const price = this.latestPrices.get(symbol);
      if (price && price > 0) return price;
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    
    // Last resort: direct REST call
    try {
      const ticker = await this.client.ticker({ symbol });
      const price = parseFloat(ticker.lastPrice);
      this.latestPrices.set(symbol, price);
      return price;
    } catch (err) {
      console.error('All price fetch methods failed:', err.message);
      return 0;
    }
  }

  async getBalance() {
    if (!this.balanceCache) {
      this.balanceCache = await this.client.accountInfo();
    }
    return this.balanceCache;
  }

  async placeOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number) {
    try {
      const order = await this.client.order({
        symbol,
        side,
        type: 'MARKET',
        quantity: quantity.toString(),
      });
      this.ordersCache = await this.client.myOrders({ symbol });
      return order;
    } catch (err) {
      console.error('Order failed:', err.message);
      throw err;
    }
  }

  async getOrders(symbol?: string) {
    if (this.ordersCache.length === 0) {
      this.ordersCache = await this.client.myOrders({ symbol: symbol || 'BTCUSDT' });
    }
    return this.ordersCache;
  }
}