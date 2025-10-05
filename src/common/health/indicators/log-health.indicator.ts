import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LogHealthIndicator extends HealthIndicator {
  constructor(private readonly config_service: ConfigService) {
    super();
  }

  async IsHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const log_dir = this.config_service.get<string>('logger.dir', './logs');
      if (!fs.existsSync(log_dir)) {
        throw new Error(
          JSON.stringify({
            en: 'Log directory does not exist',
            th: 'ไม่พบโฟลเดอร์ log'
          })
        );
      }
      const files = fs.readdirSync(log_dir);
      const log_files = files.filter(file => file.endsWith('.log'));
      let total_size = 0;
      for (const file of log_files) {
        const file_path = path.join(log_dir, file);
        const stats = fs.statSync(file_path);
        total_size += stats.size;
      }
      const max_size = 1024 * 1024 * 1024;
      const is_healthy = total_size < max_size;
      const result = this.getStatus(key, is_healthy, {
        log_directory: log_dir,
        total_log_files: log_files.length,
        total_size: this.FormatBytes(total_size),
        max_size: this.FormatBytes(max_size),
        usage_percent: ((total_size / max_size) * 100).toFixed(2) + '%'
      });
      if (is_healthy) {
        return result;
      }
      throw new HealthCheckError(
        JSON.stringify({
          en: 'Log check failed',
          th: 'การตรวจสอบ log ไม่ผ่าน'
        }),
        result
      );
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: error.message || 'Failed to check log health'
      });
      throw new HealthCheckError(
        JSON.stringify({
          en: 'Log check failed',
          th: 'การตรวจสอบ log ไม่ผ่าน'
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
