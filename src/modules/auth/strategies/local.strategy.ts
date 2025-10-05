import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly auth_service: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password'
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.auth_service.ValidateUser(email, password);
    if (!user) {
      throw new UnauthorizedException({
        en: 'Invalid email or password',
        th: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      });
    }
    return user;
  }
}
