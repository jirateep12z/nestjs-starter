import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  enabled: process.env.REDIS_ENABLED === 'true',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  db: parseInt(process.env.REDIS_DB || '0', 10),
  cache_db: parseInt(process.env.REDIS_CACHE_DB || '1', 10),
  rate_limit_db: parseInt(process.env.REDIS_RATE_LIMIT_DB || '2', 10)
}));
