import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TradingService } from './trading.service';

@Controller('binance')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Get('price')
  async getPrice(@Query('symbol') symbol: string) {
    const price = await this.tradingService.getPrice(symbol || 'BTCUSDT');
    return { success: true, price };
  }

  @Get('balance')
  async getBalance() {
    const balance = await this.tradingService.getBalance();
    return { success: true, balance };
  }

  @Post('order')
  async placeOrder(@Body() body: { symbol: string; side: 'BUY' | 'SELL'; quantity: number }) {
    const order = await this.tradingService.placeOrder(body.symbol, body.side, body.quantity);
    return { success: true, order };
  }

  @Get('orders')
  async getOrders(@Query('symbol') symbol: string) {
    const orders = await this.tradingService.getOrders(symbol);
    return { success: true, orders };
  }
}