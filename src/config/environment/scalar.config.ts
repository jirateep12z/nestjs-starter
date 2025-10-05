import { registerAs } from '@nestjs/config';

export default registerAs('scalar', () => ({
  enabled: process.env.SCALAR_ENABLED === 'true',
  title: process.env.SCALAR_TITLE || 'NestJS Backend API',
  description:
    process.env.SCALAR_DESCRIPTION ||
    'API Documentation for NestJS Backend Starter Template',
  version: process.env.SCALAR_VERSION || '1.0',
  path: process.env.SCALAR_PATH || 'api/docs'
}));
