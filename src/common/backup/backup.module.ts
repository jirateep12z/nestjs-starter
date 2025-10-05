import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import backupConfig from '../../config/backup/backup.config';

@Module({
  imports: [ConfigModule.forFeature(backupConfig)],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService]
})
export class BackupModule {}
