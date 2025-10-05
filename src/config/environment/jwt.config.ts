import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret:
    process.env.JWT_SECRET ||
    'your-super-secret-jwt-key-change-this-in-production',
  access_token_expiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
  refresh_token_expiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d'
}));
