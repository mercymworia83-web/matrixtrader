import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TradingService } from './trading.service';

@Controller('binance')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Get('price')
  getPrice(@Query('symbol') symbol: string) {
    return this.tradingService.getLivePrice(symbol || 'BTCUSDT');
  }

  @Post('order')
  createOrder(@Body() body: { symbol: string; side: string; quantity: number }) {
    return this.tradingService.placeOrder(body.symbol, body.side, body.quantity);
  }

  @Get('balance')
  getBalance() {
    return this.tradingService.getBalance();
  }

  @Get('orders')
  getOrders(@Query('symbol') symbol: string) {
    return this.tradingService.getOrders(symbol || 'BTCUSDT');
  }
}