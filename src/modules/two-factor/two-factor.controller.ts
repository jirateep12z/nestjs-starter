import { Controller, Post, Body, Get, Delete } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { TwoFactorService } from './two-factor.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CheckPermissions } from '../../common/decorators/check-permissions.decorator';

@ApiTags('Two-Factor Authentication')
@ApiBearerAuth()
@Controller('2fa')
export class TwoFactorController {
  constructor(private readonly two_factor_service: TwoFactorService) {}

  @Get('generate')
  @CheckPermissions('users.view')
  @ApiOperation({ summary: 'สร้าง 2FA Secret และ QR Code' })
  @ApiResponse({ status: 200, description: 'สร้างสำเร็จ' })
  async GenerateSecret(@CurrentUser('id') user_id: string) {
    return await this.two_factor_service.GenerateSecret(user_id);
  }

  @Post('enable')
  @CheckPermissions('users.update')
  @ApiOperation({ summary: 'เปิดใช้งาน 2FA' })
  @ApiResponse({ status: 200, description: 'เปิดใช้งานสำเร็จ' })
  @ApiResponse({ status: 400, description: 'รหัสยืนยันไม่ถูกต้อง' })
  async EnableTwoFactor(
    @CurrentUser('id') user_id: string,
    @Body() body: { token: string; secret: string }
  ) {
    await this.two_factor_service.EnableTwoFactor(
      user_id,
      body.token,
      body.secret
    );
    return {
      message: {
        en: 'Two-factor authentication enabled successfully',
        th: 'เปิดใช้งานการยืนยันตัวตนสองขั้นตอนสำเร็จ'
      }
    };
  }

  @Delete('disable')
  @CheckPermissions('users.update')
  @ApiOperation({ summary: 'ปิดใช้งาน 2FA' })
  @ApiResponse({ status: 200, description: 'ปิดใช้งานสำเร็จ' })
  @ApiResponse({ status: 400, description: 'รหัสยืนยันไม่ถูกต้อง' })
  async DisableTwoFactor(
    @CurrentUser('id') user_id: string,
    @Body() body: { token: string }
  ) {
    await this.two_factor_service.DisableTwoFactor(user_id, body.token);
    return {
      message: {
        en: 'Two-factor authentication disabled successfully',
        th: 'ปิดใช้งานการยืนยันตัวตนสองขั้นตอนสำเร็จ'
      }
    };
  }
}
