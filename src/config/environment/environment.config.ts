import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  node_env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  api_prefix: process.env.API_PREFIX || 'api/v1',
  base_url: process.env.BASE_URL || 'http://localhost:3000'
}));
