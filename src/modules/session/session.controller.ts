import { Controller, Get, Delete, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { SessionService } from './session.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CheckPermissions } from '../../common/decorators/check-permissions.decorator';

@ApiTags('Session Management')
@ApiBearerAuth()
@Controller('sessions')
export class SessionController {
  constructor(private readonly session_service: SessionService) {}

  @Get()
  @CheckPermissions('users.view')
  @ApiOperation({ summary: 'ดึงรายการเซสชันของผู้ใช้' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  async GetMySessions(
    @CurrentUser('id') user_id: string,
    @Query() pagination_dto: PaginationDto
  ) {
    return await this.session_service.FindUserSessions(user_id, pagination_dto);
  }

  @Get('stats')
  @CheckPermissions('users.view')
  @ApiOperation({ summary: 'ดึงสถิติเซสชัน' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  async GetSessionStats(@CurrentUser('id') user_id: string) {
    return await this.session_service.GetSessionStats(user_id);
  }

  @Delete(':id')
  @CheckPermissions('users.update')
  @ApiOperation({ summary: 'ยกเลิกเซสชัน' })
  @ApiResponse({ status: 200, description: 'ยกเลิกสำเร็จ' })
  async RevokeSession(
    @Param('id') session_id: string,
    @CurrentUser('id') user_id: string
  ) {
    await this.session_service.RevokeSession(session_id, user_id);
    return {
      message: {
        en: 'Session revoked successfully',
        th: 'ยกเลิกเซสชันสำเร็จ'
      }
    };
  }

  @Delete()
  @CheckPermissions('users.update')
  @ApiOperation({ summary: 'ยกเลิกเซสชันทั้งหมด' })
  @ApiResponse({ status: 200, description: 'ยกเลิกสำเร็จ' })
  async RevokeAllSessions(@CurrentUser('id') user_id: string) {
    await this.session_service.RevokeAllUserSessions(user_id);
    return {
      message: {
        en: 'All sessions revoked successfully',
        th: 'ยกเลิกเซสชันทั้งหมดสำเร็จ'
      }
    };
  }
}
