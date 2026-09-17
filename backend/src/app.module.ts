import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DerivController } from './deriv/deriv.controller';
import { DerivService } from './deriv/deriv.service';
import { TradingController } from './binance/trading.controller';
import { TradingService } from './binance/trading.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, DerivController, TradingController],
  providers: [AppService, DerivService, TradingService],
})
export class AppModule {}