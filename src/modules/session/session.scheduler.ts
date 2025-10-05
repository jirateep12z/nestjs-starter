import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionService } from './session.service';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class SessionScheduler {
  constructor(
    private readonly session_service: SessionService,
    private readonly logger_service: LoggerService
  ) {
    this.logger_service.SetContext('SessionScheduler');
  }

  @Cron(CronExpression.EVERY_HOUR)
  async HandleSessionCleanup() {
    this.logger_service.Info('Starting session cleanup task');
    try {
      await this.session_service.CleanupExpiredSessions();
      this.logger_service.Info('Session cleanup completed successfully');
    } catch (error) {
      this.logger_service.Error('Session cleanup failed', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async HandleInactiveSessionCleanup() {
    this.logger_service.Info('Starting inactive session cleanup task');
    try {
      await this.session_service.CleanupInactiveSessions();
      this.logger_service.Info(
        'Inactive session cleanup completed successfully'
      );
    } catch (error) {
      this.logger_service.Error('Inactive session cleanup failed', error);
    }
  }
}
