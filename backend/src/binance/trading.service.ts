import { Injectable } from '@nestjs/common';
import Binance from 'binance-api-node';

@Injectable()
export class TradingService {
  private client: any;

  constructor() {
    console.log('TRADING SERVICE LOADED');
    
    var apiKey = process.env.BINANCE_API_KEY;
    var apiSecret = process.env.BINANCE_SECRET_KEY;
    
    console.log('API Key exists:', !!apiKey);
    console.log('Secret Key exists:', !!apiSecret);

    if (!apiKey || !apiSecret) {
      throw new Error('API keys missing! Check .env file.');
    }

    this.client = Binance({
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim(),
      httpBase: 'https://testnet.binance.vision',
      wsBase: 'wss://testnet.binance.vision',
    });
  }

  async getLivePrice(symbol: string) {
    try {
      var price = await this.client.prices({ symbol: symbol });
      return { success: true, price: parseFloat(price[symbol]) };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async placeOrder(symbol: string, side: string, quantity: number) {
    try {
      console.log('Placing order for ' + symbol);
      var order = await this.client.order({
        symbol: symbol,
        side: side,
        type: 'MARKET',
        quantity: quantity,
      });
      return { success: true, orderId: order.orderId, status: order.status };
    } catch (error: any) {
      console.error('Order failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  async getBalance() {
    try {
      var accountInfo = await this.client.accountInfo();
      var balances: any[] = [];
      for (var i = 0; i < accountInfo.balances.length; i++) {
        var b = accountInfo.balances[i];
        if (parseFloat(b.free) > 0 || parseFloat(b.locked) > 0) {
          balances.push({
            asset: b.asset,
            free: parseFloat(b.free),
            locked: parseFloat(b.locked)
          });
        }
      }
      return { success: true, balances: balances };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async getOrders(symbol: string) {
    try {
      var orders = await this.client.allOrders({ symbol: symbol, limit: 20 });
      var result: any[] = [];
      for (var i = orders.length - 1; i >= 0; i--) {
        var o = orders[i];
        result.push({
          orderId: o.orderId,
          symbol: o.symbol,
          side: o.side,
          type: o.type,
          quantity: parseFloat(o.origQty),
          price: parseFloat(o.price),
          executedQty: parseFloat(o.executedQty),
          status: o.status,
          time: new Date(o.time).toLocaleString()
        });
      }
      return { success: true, orders: result };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}