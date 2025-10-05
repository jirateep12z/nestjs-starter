import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config_service: ConfigService) => {
        const redis_enabled = config_service.get<boolean>('redis.enabled');
        if (redis_enabled) {
          return {
            store: redisStore,
            host: config_service.get<string>('redis.host') || 'localhost',
            port: config_service.get<number>('redis.port') || 6379,
            password: config_service.get<string>('redis.password') || undefined,
            db: config_service.get<number>('redis.cache_db') || 1,
            ttl: config_service.get<number>('redis.ttl') || 3600
          };
        }
        return {
          ttl: config_service.get<number>('redis.ttl') || 3600,
          max: 100
        };
      },
      inject: [ConfigService]
    })
  ],
  exports: [NestCacheModule]
})
export class CacheModule {}
