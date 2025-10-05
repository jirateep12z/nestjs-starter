import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger';
import { BackupService } from './backup.service';
import { RestoreBackupDto } from './dto/backup.dto';
import { JWTAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../modules/rbac/guards/permissions.guard';
import { RequirePermissions } from '../../modules/rbac/decorators/require-permissions.decorator';

@ApiTags('Backups')
@ApiBearerAuth()
@Controller('backups')
@UseGuards(JWTAuthGuard, PermissionsGuard)
@RequirePermissions('backup:manage')
export class BackupController {
  constructor(private readonly backup_service: BackupService) {}

  @Get()
  @ApiOperation({ summary: 'ดึงรายการ Backups ทั้งหมด' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ดึงข้อมูล Backups สำเร็จ'
  })
  async GetBackups() {
    return await this.backup_service.GetBackupsList();
  }

  @Get('stats')
  @ApiOperation({ summary: 'ดึงสถิติ Backups' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ดึงสถิติ Backups สำเร็จ'
  })
  async GetBackupStats() {
    return await this.backup_service.GetBackupStats();
  }

  @Post('database')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'สร้าง Database Backup' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'สร้าง Database Backup สำเร็จ'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'สร้าง Database Backup ล้มเหลว'
  })
  async BackupDatabase() {
    return await this.backup_service.BackupDatabase();
  }

  @Post('files')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'สร้าง Files Backup' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'สร้าง Files Backup สำเร็จ'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'สร้าง Files Backup ล้มเหลว'
  })
  async BackupFiles() {
    return await this.backup_service.BackupFiles();
  }

  @Post('restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore Database จาก Backup',
    description:
      'Restore ฐานข้อมูลจากไฟล์ backup ที่เลือก (รองรับเฉพาะ database backup)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Restore Database สำเร็จ',
    schema: {
      example: {
        success: true,
        message: 'Database restored successfully'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
    schema: {
      example: {
        success: false,
        status_code: 400,
        error: 'Bad Request',
        message: ['backup_file must be a string']
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ไม่พบไฟล์ Backup ที่ระบุ'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Restore Database ล้มเหลว'
  })
  async RestoreDatabase(@Body() restore_dto: RestoreBackupDto) {
    return await this.backup_service.RestoreDatabase(restore_dto);
  }

  @Delete(':file_name')
  @ApiOperation({ summary: 'ลบ Backup File' })
  @ApiParam({ name: 'file_name', description: 'ชื่อไฟล์ Backup' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ลบ Backup สำเร็จ'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ไม่พบไฟล์ Backup ที่ระบุ'
  })
  async DeleteBackup(@Param('file_name') file_name: string) {
    return await this.backup_service.DeleteBackup(file_name);
  }
}
