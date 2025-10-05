import { registerAs } from '@nestjs/config';

export default registerAs('backup', () => ({
  enabled: process.env.BACKUP_ENABLED !== 'false',
  dir: process.env.BACKUP_DIR || './backups',
  database: {
    enabled: process.env.BACKUP_DATABASE_ENABLED !== 'false',
    schedule: process.env.BACKUP_DATABASE_SCHEDULE || '0 2 * * *',
    retention_days: parseInt(
      process.env.BACKUP_DATABASE_RETENTION_DAYS || '30',
      10
    ),
    compress: process.env.BACKUP_DATABASE_COMPRESS !== 'false'
  },
  files: {
    enabled: process.env.BACKUP_FILES_ENABLED !== 'false',
    schedule: process.env.BACKUP_FILES_SCHEDULE || '0 3 * * *',
    retention_days: parseInt(
      process.env.BACKUP_FILES_RETENTION_DAYS || '14',
      10
    ),
    compress: process.env.BACKUP_FILES_COMPRESS !== 'false',
    directories: (process.env.BACKUP_FILES_DIRECTORIES || './uploads,./logs')
      .split(',')
      .map(dir => dir.trim())
  },
  verification: {
    enabled: process.env.BACKUP_VERIFICATION_ENABLED !== 'false',
    check_size: process.env.BACKUP_VERIFICATION_CHECK_SIZE !== 'false',
    min_size_bytes: parseInt(
      process.env.BACKUP_VERIFICATION_MIN_SIZE_BYTES || '1024',
      10
    )
  },
  notifications: {
    enabled: process.env.BACKUP_NOTIFICATIONS_ENABLED !== 'false',
    on_success: process.env.BACKUP_NOTIFICATIONS_ON_SUCCESS === 'true',
    on_failure: process.env.BACKUP_NOTIFICATIONS_ON_FAILURE !== 'false'
  }
}));
