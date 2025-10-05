import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';
import { JWTStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UserModule,
    SessionModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config_service: ConfigService) => ({
        secret: config_service.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: config_service.get<string>('jwt.access_token_expiration')
        }
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JWTStrategy, LocalStrategy],
  exports: [AuthService]
})
export class AuthModule {}
