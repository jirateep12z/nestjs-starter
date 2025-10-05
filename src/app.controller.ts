import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly app_service: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'ข้อความต้อนรับ' })
  @ApiResponse({ status: 200, description: 'ส่งข้อความต้อนรับสำเร็จ' })
  GetHello(): { message: { en: string; th: string } } {
    return this.app_service.GetHello();
  }
}
