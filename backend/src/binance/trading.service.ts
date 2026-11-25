import { Injectable } from '@nestjs/common';

@Injectable()
export class TradingService {
  private readonly baseUrl = 'https://testnet.binance.vision';

  constructor() {
    console.log('✅ TradingService initialized');
    console.log(`🌐 Base URL: ${this.baseUrl}`);
  }

  /**
   * Get live price using Binance Testnet public API
   */
  async getPrice(symbol: string): Promise<number> {
    try {
      console.log(`🔍 Fetching price for ${symbol}...`);
      
      const url = `${this.baseUrl}/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`;
      console.log(`📡 Requesting: ${url}`);
      
      const response = await fetch(url);
      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data: any = await response.json();
      console.log(`📦 Raw response:`, JSON.stringify(data));
      
      const price = parseFloat(data.price);
      
      if (isNaN(price) || price <= 0) {
        throw new Error(`Invalid price value: ${data.price}`);
      }
      
      console.log(`✅ SUCCESS: ${symbol} = $${price.toLocaleString()}`);
      return price;
      
    } catch (err: any) {
      console.error(`❌ FAILED to get price for ${symbol}:`);
      console.error(`   Error: ${err.message}`);
      console.error(`   Stack: ${err.stack?.split('\n').slice(0, 3).join('\n          ')}`);
      return 0;
    }
  }

  /**
   * Get account balance (mocked for now - requires API signature)
   */
  async getBalance() {
    console.log('⚠️ Balance endpoint requires HMAC signature - returning testnet mock data');
    return {
      balances: [
        { asset: 'USDT', free: '10000.00000000', locked: '0.00000000' },
        { asset: 'BTC', free: '0.50000000', locked: '0.00000000' },
        { asset: 'ETH', free: '5.00000000', locked: '0.00000000' },
        { asset: 'BNB', free: '10.00000000', locked: '0.00000000' },
      ]
    };
  }

  /**
   * Place a market order (mocked for now)
   */
  async placeOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number) {
    console.log(`📝 Order request: ${side} ${quantity} ${symbol}`);
    
    // Mock successful order
    const mockOrder = {
      symbol,
      orderId: Date.now(),
      status: 'FILLED',
      side,
      type: 'MARKET',
      origQty: quantity.toString(),
      executedQty: quantity.toString(),
      cummulativeQuoteQty: (quantity * 58000).toFixed(2),
      time: Date.now(),
    };
    
    console.log(`✅ Mock order placed:`, JSON.stringify(mockOrder));
    return mockOrder;
  }

  /**
   * Get order history (mocked for now)
   */
  async getOrders(symbol?: string) {
    console.log(`📋 Fetching orders for ${symbol || 'all'}...`);
    
    // Return some mock historical orders
    return [
      {
        symbol: 'BTCUSDT',
        orderId: 1001,
        side: 'BUY',
        type: 'MARKET',
        qty: '0.001',
        price: '57500.00',
        status: 'FILLED',
        time: Date.now() - 3600000,
      },
      {
        symbol: 'ETHUSDT',
        orderId: 1002,
        side: 'SELL',
        type: 'MARKET',
        qty: '0.01',
        price: '3200.00',
        status: 'FILLED',
        time: Date.now() - 7200000,
      }
    ];
  }
}