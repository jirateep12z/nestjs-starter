import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { BackupHealthIndicator } from './indicators/backup-health.indicator';
import { LogHealthIndicator } from './indicators/log-health.indicator';
import { BackupModule } from '../backup/backup.module';

@Module({
  imports: [TerminusModule, BackupModule],
  controllers: [HealthController],
  providers: [BackupHealthIndicator, LogHealthIndicator]
})
export class HealthModule {}
