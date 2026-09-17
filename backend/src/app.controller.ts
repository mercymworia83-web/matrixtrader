import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Matrix Trader Backend API is Running!';
  }

  @Get('api/health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}