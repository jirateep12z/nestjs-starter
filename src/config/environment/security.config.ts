import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  bcrypt_salt_rounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  rate_limit_ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
  rate_limit_max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
}));
