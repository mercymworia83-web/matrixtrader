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
    console.log('TRADING SERVICE LOADED (WebSocket Mode)');
    
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_SECRET_KEY;
    
    if (!apiKey || !apiSecret) {
      throw new Error('API keys missing! Check .env file.');
    }

    this.client = binance.default({
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim(),
      httpBase: 'https://testnet.binance.vision',
      wsBase: 'wss://testnet.binance.vision',
    });
  }

  async onModuleInit() {
    console.log('Initializing WebSocket connections...');
    // Start WebSocket for BTCUSDT by default
    this.startPriceStream('BTCUSDT');
    
    // Cache balance on startup
    try {
      this.balanceCache = await this.client.accountInfo();
      console.log('Balance cached successfully');
    } catch (err) {
      console.error('Failed to cache balance:', err);
    }
  }

  onModuleDestroy() {
    // Close all WebSocket connections
    this.wsConnections.forEach((ws) => ws.close());
    console.log('All WebSocket connections closed');
  }

  // Start a price stream for a symbol
  private startPriceStream(symbol: string) {
    if (this.wsConnections.has(symbol)) return;

    const ws = this.client.ws.ticker(symbol.toLowerCase(), (ticker: any) => {
      this.latestPrices.set(symbol, parseFloat(ticker.lastPrice));
    });

    this.wsConnections.set(symbol, ws);
    console.log(`WebSocket started for ${symbol}`);
  }

  // Get latest price from cache (no API call!)
  async getPrice(symbol: string): Promise<number> {
    this.startPriceStream(symbol); // Ensure stream is running
    
    // Wait up to 5 seconds for first price
    let attempts = 0;
    while (!this.latestPrices.has(symbol) && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    
    return this.latestPrices.get(symbol) || 0;
  }

  // Get balance from cache (refresh every 5 min)
  async getBalance() {
    if (!this.balanceCache) {
      this.balanceCache = await this.client.accountInfo();
    }
    return this.balanceCache;
  }

  // Place order (still uses REST, but only when user clicks button)
  async placeOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number) {
    try {
      const order = await this.client.order({
        symbol,
        side,
        type: 'MARKET',
        quantity: quantity.toString(),
      });
      
      // Refresh orders cache
      this.ordersCache = await this.client.myOrders({ symbol });
      return order;
    } catch (err) {
      console.error('Order failed:', err);
      throw err;
    }
  }

  // Get orders from cache
  async getOrders(symbol?: string) {
    if (this.ordersCache.length === 0) {
      this.ordersCache = await this.client.myOrders({ symbol: symbol || 'BTCUSDT' });
    }
    return this.ordersCache;
  }
}