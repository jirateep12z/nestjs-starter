import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { JWTPayload } from '../../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config_service: ConfigService,
    private readonly user_service: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config_service.get<string>('jwt.secret')
    });
  }

  async validate(payload: JWTPayload) {
    const user = await this.user_service.FindByEmailWithRole(payload.email);
    if (!user || !user.is_active) {
      throw new UnauthorizedException({
        en: 'Unauthorized',
        th: 'ไม่ได้รับอนุญาต'
      });
    }
    return user;
  }
}
