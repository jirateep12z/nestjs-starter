import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Configuration
import {
  CreateDatabaseConfig,
  GetDefaultDatabasePort
} from './config/database/database-config.factory';
import EnvironmentConfig from './config/environment/environment.config';
import DatabaseConfig from './config/environment/database.config';
import RedisConfig from './config/environment/redis.config';
import PerformanceConfig from './config/environment/performance.config';
import JWTConfig from './config/environment/jwt.config';
import SecurityConfig from './config/environment/security.config';
import UploadConfig from './config/environment/upload.config';
import LoggerConfig from './config/logger/logger.config';
import BackupConfig from './config/backup/backup.config';
import ScalarConfig from './config/environment/scalar.config';

// Modules
import { CacheModule } from './modules/cache/cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { SessionModule } from './modules/session/session.module';
import { TwoFactorModule } from './modules/two-factor/two-factor.module';
import { IpWhitelistModule } from './modules/ip-whitelist/ip-whitelist.module';
import { UserModule } from './modules/user/user.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { UploadModule } from './modules/upload/upload.module';
import { NotificationModule } from './modules/notification/notification.module';
import { LoggerModule } from './common/logger/logger.module';
import { BackupModule } from './common/backup/backup.module';
import { HealthModule } from './common/health/health.module';

// Guards
import { JWTAuthGuard } from './modules/auth/guards/jwt-auth.guard';

// Filters & Interceptors
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// Middleware
import { SessionActivityMiddleware } from './common/middleware/session-activity.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        EnvironmentConfig,
        DatabaseConfig,
        RedisConfig,
        PerformanceConfig,
        JWTConfig,
        SecurityConfig,
        UploadConfig,
        LoggerConfig,
        BackupConfig,
        ScalarConfig
      ]
    }),
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config_service: ConfigService) => ({
        secret: config_service.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: config_service.get<string>('jwt.access_token_expiration')
        }
      }),
      inject: [ConfigService],
      global: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config_service: ConfigService) => {
        const db_type = config_service.get<string>('database.type') || 'mysql';
        const db_url = config_service.get<string>('DB_URL');
        const default_port = GetDefaultDatabasePort(db_type);
        const redis_enabled = config_service.get<boolean>('redis.enabled');
        const config_params: any = {
          type: db_type,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize:
            config_service.get<boolean>('database.synchronize') || false,
          logging: config_service.get<boolean>('database.logging') || false,
          redis_enabled,
          redis_config: redis_enabled
            ? {
                host: config_service.get<string>('redis.host') || 'localhost',
                port: config_service.get<number>('redis.port') || 6379,
                password:
                  config_service.get<string>('redis.password') || undefined,
                db: config_service.get<number>('redis.db') || 0
              }
            : undefined,
          query_cache_duration:
            config_service.get<number>('performance.query_cache_duration') ||
            30000
        };
        if (db_url) {
          config_params.url = db_url;
        } else {
          config_params.host =
            config_service.get<string>('database.host') || 'localhost';
          config_params.port =
            config_service.get<number>('database.port') || default_port;
          config_params.username =
            config_service.get<string>('database.username') || 'root';
          config_params.password =
            config_service.get<string>('database.password') || '';
          config_params.database =
            config_service.get<string>('database.database') || 'nestjs_starter';
        }
        return CreateDatabaseConfig(config_params);
      },
      inject: [ConfigService]
    }),
    CacheModule,
    AuthModule,
    SessionModule,
    TwoFactorModule,
    IpWhitelistModule,
    UserModule,
    RbacModule,
    UploadModule,
    NotificationModule,
    LoggerModule,
    BackupModule,
    HealthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JWTAuthGuard
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionActivityMiddleware).forRoutes('*');
  }
}
