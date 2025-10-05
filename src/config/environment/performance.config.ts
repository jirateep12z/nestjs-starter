import { registerAs } from '@nestjs/config';

export default registerAs('performance', () => ({
  db_connection_limit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  db_queue_limit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),
  cache_ttl: parseInt(process.env.CACHE_TTL || '60', 10),
  query_cache_duration: parseInt(
    process.env.QUERY_CACHE_DURATION || '30000',
    10
  ),
  compression_threshold: parseInt(
    process.env.COMPRESSION_THRESHOLD || '1024',
    10
  ),
  brotli_quality: parseInt(process.env.BROTLI_QUALITY || '4', 10),
  gzip_level: parseInt(process.env.GZIP_LEVEL || '6', 10),
  connection_timeout: parseInt(process.env.CONNECTION_TIMEOUT || '30000', 10),
  keep_alive_timeout: parseInt(process.env.KEEP_ALIVE_TIMEOUT || '72000', 10),
  body_limit: parseInt(process.env.BODY_LIMIT || '10485760', 10),
  log_slow_queries: process.env.LOG_SLOW_QUERIES === 'true',
  slow_query_threshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10)
}));
