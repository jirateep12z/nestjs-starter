import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
  Req
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly auth_service: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'ลงทะเบียนผู้ใช้ใหม่' })
  @ApiResponse({ status: 201, description: 'ลงทะเบียนสำเร็จ' })
  @ApiResponse({ status: 409, description: 'อีเมลนี้ถูกใช้งานแล้ว' })
  async Register(@Body() register_dto: RegisterDto, @Req() request: any) {
    const user = await this.auth_service.Register(register_dto);
    const ip_address =
      request.ip ||
      request.headers['x-forwarded-for'] ||
      request.socket?.remoteAddress ||
      'unknown';
    const user_agent = request.headers['user-agent'] || 'unknown';
    return await this.auth_service.Login(user, ip_address, user_agent);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'เข้าสู่ระบบ' })
  @ApiResponse({ status: 200, description: 'เข้าสู่ระบบสำเร็จ' })
  @ApiResponse({ status: 401, description: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
  async Login(
    @Body() _login_dto: LoginDto,
    @CurrentUser() user: any,
    @Req() request: any
  ) {
    const ip_address =
      request.ip ||
      request.headers['x-forwarded-for'] ||
      request.socket?.remoteAddress ||
      'unknown';
    const user_agent = request.headers['user-agent'] || 'unknown';
    return await this.auth_service.Login(user, ip_address, user_agent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'รีเฟรช Access Token' })
  @ApiResponse({ status: 200, description: 'รีเฟรชสำเร็จ' })
  @ApiResponse({ status: 401, description: 'Refresh token ไม่ถูกต้อง' })
  async RefreshTokens(@Body() refresh_token_dto: RefreshTokenDto) {
    return await this.auth_service.RefreshTokens(
      refresh_token_dto.refresh_token
    );
  }

  @UseGuards(JWTAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ออกจากระบบ' })
  @ApiResponse({ status: 204, description: 'ออกจากระบบสำเร็จ' })
  async Logout(@CurrentUser('id') user_id: string) {
    await this.auth_service.Logout(user_id);
  }
}
