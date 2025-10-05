import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Session } from './entities/session.entity';
import { User } from '../user/entities/user.entity';
import {
  PaginationDto,
  PaginatedResult,
  PaginationHelper
} from '../../common/dto/pagination.dto';
import { QueryBuilderUtil } from '../../common/utils/query-builder.util';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly session_repository: Repository<Session>,
    @InjectRepository(User)
    private readonly user_repository: Repository<User>
  ) {}

  async CreateSession(
    user_id: string,
    ip_address: string,
    user_agent: string,
    refresh_token: string
  ): Promise<Session> {
    const max_sessions = 5;
    const active_sessions = await this.session_repository.count({
      where: { user_id, is_active: true }
    });
    if (active_sessions >= max_sessions) {
      const oldest_session = await this.session_repository.findOne({
        where: { user_id, is_active: true },
        order: { created_at: 'ASC' }
      });
      if (oldest_session) {
        await this.session_repository.remove(oldest_session);
      }
    }
    const session = this.session_repository.create({
      user_id,
      ip_address,
      user_agent,
      refresh_token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    return await this.session_repository.save(session);
  }

  async FindUserSessions(
    user_id: string,
    pagination_dto?: PaginationDto
  ): Promise<PaginatedResult<Session>> {
    const query_builder = this.session_repository
      .createQueryBuilder('session')
      .where('session.user_id = :user_id', { user_id })
      .andWhere('session.is_active = :is_active', { is_active: true });
    if (pagination_dto) {
      QueryBuilderUtil.ApplyAll(query_builder, pagination_dto, 'session', {
        search_fields: ['ip_address', 'user_agent'],
        default_sort_field: 'created_at'
      });
    } else {
      query_builder.orderBy('session.created_at', 'DESC');
    }
    const [items, total] = await query_builder.getManyAndCount();
    if (pagination_dto) {
      return PaginationHelper.CreateResult(
        items,
        pagination_dto.page || 1,
        pagination_dto.limit || 10,
        total
      );
    }
    return PaginationHelper.CreateResult(items, 1, items.length, total);
  }

  async ValidateSession(
    session_id: string,
    refresh_token: string
  ): Promise<Session> {
    const session = await this.session_repository.findOne({
      where: { id: session_id, refresh_token, is_active: true }
    });
    if (!session) {
      throw new UnauthorizedException({
        en: 'Invalid session',
        th: 'เซสชันไม่ถูกต้อง'
      });
    }
    if (session.expires_at < new Date()) {
      session.is_active = false;
      await this.session_repository.save(session);
      throw new UnauthorizedException({
        en: 'Session expired',
        th: 'เซสชันหมดอายุ'
      });
    }
    session.last_activity = new Date();
    await this.session_repository.save(session);
    return session;
  }

  async RevokeSession(session_id: string, user_id: string): Promise<void> {
    const session = await this.session_repository.findOne({
      where: { id: session_id, user_id }
    });
    if (session) {
      session.is_active = false;
      await this.session_repository.save(session);
    }
  }

  async RevokeAllUserSessions(user_id: string): Promise<void> {
    await this.session_repository.update(
      { user_id, is_active: true },
      { is_active: false }
    );
  }

  async CleanupExpiredSessions(): Promise<void> {
    const result = await this.session_repository.delete({
      expires_at: LessThan(new Date())
    });
    return;
  }

  async CleanupInactiveSessions(): Promise<void> {
    const thirty_days_ago = new Date();
    thirty_days_ago.setDate(thirty_days_ago.getDate() - 30);
    const result = await this.session_repository.delete({
      is_active: false,
      updated_at: LessThan(thirty_days_ago)
    });
    return;
  }

  async GetSessionStats(user_id: string): Promise<{
    total_sessions: number;
    active_sessions: number;
    devices: string[];
  }> {
    const result = await this.FindUserSessions(user_id);
    const sessions = result.data;
    return {
      total_sessions: result.metadata.total_items,
      active_sessions: sessions.filter(s => s.is_active).length,
      devices: [...new Set(sessions.map(s => s.user_agent))]
    };
  }

  async UpdateUserSessionActivity(
    user_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<void> {
    const sessions = await this.session_repository.find({
      where: {
        user_id,
        is_active: true,
        ip_address,
        user_agent
      }
    });
    if (sessions.length > 0) {
      const current_time = new Date();
      await this.session_repository.update(
        {
          user_id,
          is_active: true,
          ip_address,
          user_agent
        },
        {
          last_activity: current_time
        }
      );
    }
  }

  async UpdateSessionRefreshToken(
    user_id: string,
    old_refresh_token: string,
    new_refresh_token: string
  ): Promise<void> {
    await this.session_repository.update(
      {
        user_id,
        refresh_token: old_refresh_token,
        is_active: true
      },
      {
        refresh_token: new_refresh_token,
        last_activity: new Date()
      }
    );
  }

  async RevokeSessionByRefreshToken(
    user_id: string,
    refresh_token: string
  ): Promise<void> {
    await this.session_repository.update(
      {
        user_id,
        refresh_token,
        is_active: true
      },
      {
        is_active: false
      }
    );
  }
}
