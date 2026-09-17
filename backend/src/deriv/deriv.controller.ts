import { Controller, Post, Body } from '@nestjs/common';
import { DerivService } from './deriv.service';

@Controller('api/deriv')
export class DerivController {
  constructor(private readonly derivService: DerivService) {}

  @Post('connect')
  async connect(@Body() body: { apiToken: string }) {
    try {
      if (!body.apiToken) {
        return { success: false, message: 'API Token is required' };
      }
      
      const result = await this.derivService.connect(body.apiToken);
      return result;
    } catch (error) {
      console.error('Connection Error:', error);
      return { success: false, message: 'Internal Server Error' };
    }
  }
} 
