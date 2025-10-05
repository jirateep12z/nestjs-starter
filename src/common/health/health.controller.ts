import { Controller, Get, HttpStatus } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BackupHealthIndicator } from './indicators/backup-health.indicator';
import { LogHealthIndicator } from './indicators/log-health.indicator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly disk_path: string;

  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly backup_health: BackupHealthIndicator,
    private readonly log_health: LogHealthIndicator
  ) {
    this.disk_path = process.platform === 'win32' ? process.cwd() : '/';
  }

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'ตรวจสอบสุขภาพระบบทั้งหมด' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ระบบทำงานปกติ'
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'ระบบมีปัญหา'
  })
  Check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
      () =>
        this.disk.checkStorage('disk', {
          path: this.disk_path,
          thresholdPercent: 0.9
        }),
      () => this.backup_health.IsHealthy('backup'),
      () => this.log_health.IsHealthy('logs')
    ]);
  }

  @Get('database')
  @HealthCheck()
  @ApiOperation({ summary: 'ตรวจสอบสุขภาพ Database' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Database ทำงานปกติ'
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Database มีปัญหา'
  })
  CheckDatabase() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }

  @Get('memory')
  @HealthCheck()
  @ApiOperation({ summary: 'ตรวจสอบการใช้งาน Memory' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Memory ใช้งานปกติ'
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Memory ใช้งานเกินกำหนด'
  })
  CheckMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024)
    ]);
  }

  @Get('disk')
  @HealthCheck()
  @ApiOperation({ summary: 'ตรวจสอบพื้นที่ Disk' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Disk มีพื้นที่เพียงพอ'
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Disk เหลือพื้นที่น้อย'
  })
  CheckDisk() {
    return this.health.check([
      () =>
        this.disk.checkStorage('disk', {
          path: this.disk_path,
          thresholdPercent: 0.9
        })
    ]);
  }

  @Get('backup')
  @HealthCheck()
  @ApiOperation({ summary: 'ตรวจสอบสถานะ Backup' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Backup ทำงานปกติ'
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Backup มีปัญหา'
  })
  CheckBackup() {
    return this.health.check([() => this.backup_health.IsHealthy('backup')]);
  }

  @Get('logs')
  @HealthCheck()
  @ApiOperation({ summary: 'ตรวจสอบสถานะ Logs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logs ทำงานปกติ'
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Logs มีปัญหา'
  })
  CheckLogs() {
    return this.health.check([() => this.log_health.IsHealthy('logs')]);
  }
}
