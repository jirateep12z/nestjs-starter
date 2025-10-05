import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  GetHello(): { message: { en: string; th: string } } {
    return {
      message: {
        en: '🚀 NestJS Backend Starter Template - Ready to use!',
        th: '🚀 NestJS Backend Starter Template - พร้อมใช้งาน'
      }
    };
  }
}
