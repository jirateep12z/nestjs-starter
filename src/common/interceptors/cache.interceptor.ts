import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { LoggerService } from '../logger/logger.service';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cache_manager: Cache,
    private reflector: Reflector,
    private readonly logger_service: LoggerService
  ) {
    this.logger_service.SetContext('HttpCacheInterceptor');
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const cache_key = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler()
    );
    const cache_ttl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler()
    );
    if (!cache_key) {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest();
    const full_cache_key = this.GenerateCacheKey(cache_key, request);
    try {
      const cached_response = await this.cache_manager.get(full_cache_key);
      if (cached_response !== undefined && cached_response !== null) {
        return of(cached_response);
      }
    } catch (error) {
      this.logger_service.Error('Cache get error', error);
    }
    return next.handle().pipe(
      tap(async response => {
        try {
          const ttl = cache_ttl || 60;
          await this.cache_manager.set(full_cache_key, response, ttl);
        } catch (error) {
          this.logger_service.Error('Cache set error', error);
        }
      })
    );
  }

  private GenerateCacheKey(base_key: string, request: any): string {
    const { url, query, params } = request;
    const query_string = JSON.stringify(query || {});
    const params_string = JSON.stringify(params || {});
    return `${base_key}:${url}:${query_string}:${params_string}`;
  }
}
