import {
  Injectable,
  UnauthorizedException,
  ConflictException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { RbacService } from '../rbac/rbac.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/entities/user.entity';
import { JWTPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly user_service: UserService,
    private readonly session_service: SessionService,
    private readonly rbac_service: RbacService,
    private readonly jwt_service: JwtService,
    private readonly config_service: ConfigService
  ) {}

  async ValidateUser(email: string, password: string): Promise<User | null> {
    const user = await this.user_service.FindByEmail(email);
    if (!user || !user.is_active) {
      return null;
    }
    const is_password_valid = await user.ValidatePassword(password);
    if (!is_password_valid) {
      return null;
    }
    return user;
  }

  async Register(register_dto: RegisterDto): Promise<User> {
    const existing_user = await this.user_service.FindByEmail(
      register_dto.email
    );
    if (existing_user) {
      throw new ConflictException({
        en: 'This email is already in use',
        th: 'อีเมลนี้ถูกใช้งานแล้ว'
      });
    }
    let role_id = (register_dto as any).role_id;
    if (!role_id) {
      try {
        const user_role = await this.rbac_service.FindRoleBySlug('user');
        role_id = user_role.id;
      } catch (error) {}
    }
    return await this.user_service.Create({
      ...register_dto,
      role_id
    });
  }

  async Login(user: User, ip_address?: string, user_agent?: string) {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role_id: user.role_id
    };
    const access_token = this.GenerateAccessToken(payload);
    const refresh_token = this.GenerateRefreshToken(payload);
    const hashed_refresh_token = await bcrypt.hash(refresh_token, 10);
    await this.user_service.UpdateRefreshToken(user.id, hashed_refresh_token);
    if (ip_address && user_agent) {
      await this.session_service.CreateSession(
        user.id,
        ip_address,
        user_agent,
        hashed_refresh_token
      );
    }
    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
        first_name: user.first_name,
        last_name: user.last_name
      }
    };
  }

  async RefreshTokens(refresh_token: string) {
    try {
      const payload = this.jwt_service.verify<JWTPayload>(refresh_token, {
        secret: this.config_service.get<string>('jwt.secret')
      });
      const user = await this.user_service.FindByEmail(payload.email);
      if (!user || !user.is_active || !user.refresh_token) {
        throw new UnauthorizedException({
          en: 'Invalid refresh token',
          th: 'Refresh token ไม่ถูกต้อง'
        });
      }
      const is_refresh_token_valid = await bcrypt.compare(
        refresh_token,
        user.refresh_token
      );
      if (!is_refresh_token_valid) {
        throw new UnauthorizedException({
          en: 'Invalid refresh token',
          th: 'Refresh token ไม่ถูกต้อง'
        });
      }
      const new_payload: JWTPayload = {
        sub: user.id,
        email: user.email,
        role_id: user.role_id
      };
      const new_access_token = this.GenerateAccessToken(new_payload);
      const new_refresh_token = this.GenerateRefreshToken(new_payload);
      const hashed_old_refresh_token = user.refresh_token;
      const hashed_new_refresh_token = await bcrypt.hash(new_refresh_token, 10);
      await this.user_service.UpdateRefreshToken(
        user.id,
        hashed_new_refresh_token
      );
      await this.session_service.UpdateSessionRefreshToken(
        user.id,
        hashed_old_refresh_token,
        hashed_new_refresh_token
      );
      return {
        access_token: new_access_token,
        refresh_token: new_refresh_token
      };
    } catch (error) {
      throw new UnauthorizedException({
        en: 'Invalid or expired refresh token',
        th: 'Refresh token ไม่ถูกต้องหรือหมดอายุ'
      });
    }
  }

  async Logout(user_id: string): Promise<void> {
    await this.user_service.UpdateRefreshToken(user_id, null);
    await this.session_service.RevokeAllUserSessions(user_id);
  }

  private GenerateAccessToken(payload: JWTPayload): string {
    return this.jwt_service.sign(payload, {
      expiresIn: this.config_service.get<string>('jwt.access_token_expiration')
    });
  }

  private GenerateRefreshToken(payload: JWTPayload): string {
    return this.jwt_service.sign(payload, {
      expiresIn: this.config_service.get<string>('jwt.refresh_token_expiration')
    });
  }
}
