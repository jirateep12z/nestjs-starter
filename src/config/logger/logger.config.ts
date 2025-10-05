import { registerAs } from '@nestjs/config';

export default registerAs('logger', () => ({
  level: process.env.LOG_LEVEL || 'info',
  dir: process.env.LOG_DIR || './logs',
  max_files: process.env.LOG_MAX_FILES || '30d',
  max_size: process.env.LOG_MAX_SIZE || '20m',
  date_pattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
  compress: process.env.LOG_COMPRESS === 'true',
  console_enabled: process.env.LOG_CONSOLE_ENABLED !== 'false',
  file_enabled: process.env.LOG_FILE_ENABLED !== 'false',
  error_file: process.env.LOG_ERROR_FILE || 'error-%DATE%.log',
  combined_file: process.env.LOG_COMBINED_FILE || 'combined-%DATE%.log',
  request_log_enabled: process.env.LOG_REQUEST_ENABLED !== 'false',
  response_log_enabled: process.env.LOG_RESPONSE_ENABLED !== 'false',
  slow_request_threshold: parseInt(
    process.env.LOG_SLOW_REQUEST_THRESHOLD || '3000',
    10
  )
}));
