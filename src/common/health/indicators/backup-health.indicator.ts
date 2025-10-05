import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError
} from '@nestjs/terminus';
import { BackupService } from '../../backup/backup.service';

@Injectable()
export class BackupHealthIndicator extends HealthIndicator {
  constructor(private readonly backup_service: BackupService) {
    super();
  }

  async IsHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const stats = await this.backup_service.GetBackupStats();
      const two_days_ago = new Date();
      two_days_ago.setDate(two_days_ago.getDate() - 2);
      const has_recent_backup =
        stats.newest_backup && stats.newest_backup > two_days_ago;
      const is_healthy =
        stats.total_backups === 0 ||
        (stats.total_backups > 0 && Boolean(has_recent_backup));
      const result = this.getStatus(key, is_healthy, {
        total_backups: stats.total_backups,
        database_backups: stats.database_backups,
        files_backups: stats.files_backups,
        total_size: this.FormatBytes(stats.total_size_bytes),
        newest_backup: stats.newest_backup || 'No backups yet',
        oldest_backup: stats.oldest_backup || 'No backups yet'
      });
      if (is_healthy) {
        return result;
      }
      throw new HealthCheckError(
        JSON.stringify({
          en: 'Backup check failed',
          th: 'การตรวจสอบสำรองไม่ผ่าน'
        }),
        result
      );
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: error.message || 'Failed to check backup health'
      });
      throw new HealthCheckError(
        JSON.stringify({
          en: 'Backup check failed',
          th: 'การตรวจสอบสำรองไม่ผ่าน'
        }),
        result
      );
    }
  }

  private FormatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
