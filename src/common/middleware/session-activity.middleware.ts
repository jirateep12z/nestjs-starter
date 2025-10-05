import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../../modules/session/session.service';
import { JWTPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class SessionActivityMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt_service: JwtService,
    private readonly config_service: ConfigService,
    private readonly session_service: SessionService
  ) {}

  async use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    try {
      const authorization_header = req.headers.authorization;
      if (authorization_header && authorization_header.startsWith('Bearer ')) {
        const token = authorization_header.substring(7);
        try {
          const payload = this.jwt_service.verify<JWTPayload>(token, {
            secret: this.config_service.get<string>('jwt.secret')
          });
          if (payload && payload.sub) {
            const ip_address = this.GetClientIp(req);
            const user_agent = req.headers['user-agent'] || 'Unknown';
            await this.session_service.UpdateUserSessionActivity(
              payload.sub,
              ip_address,
              user_agent
            );
          }
        } catch (error) {}
      }
    } catch (error) {}
    next();
  }

  private GetClientIp(req: FastifyRequest): string {
    const forwarded_for = req.headers['x-forwarded-for'];
    if (forwarded_for) {
      const ips = Array.isArray(forwarded_for)
        ? forwarded_for[0]
        : forwarded_for;
      return ips.split(',')[0].trim();
    }
    return req.ip || 'Unknown';
  }
}
