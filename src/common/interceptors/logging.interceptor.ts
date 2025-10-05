import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger_service: LoggerService,
    private readonly config_service: ConfigService
  ) {
    this.logger_service.SetContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const ip = request.ip || request.connection?.remoteAddress;
    const user_agent = request.headers['user-agent'];
    const start_time = Date.now();
    const request_log_enabled = this.config_service.get<boolean>(
      'logger.request_log_enabled',
      true
    );
    if (request_log_enabled) {
      this.logger_service.LogRequest(method, url, ip, user_agent);
    }
    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const status_code = response.statusCode;
          const response_time = Date.now() - start_time;
          const response_log_enabled = this.config_service.get<boolean>(
            'logger.response_log_enabled',
            true
          );
          if (response_log_enabled) {
            this.logger_service.LogResponse(
              method,
              url,
              status_code,
              response_time
            );
          }
          const slow_threshold = this.config_service.get<number>(
            'logger.slow_request_threshold',
            3000
          );
          if (response_time > slow_threshold) {
            this.logger_service.LogSlowRequest(
              method,
              url,
              response_time,
              slow_threshold
            );
          }
        },
        error: error => {
          const response_time = Date.now() - start_time;
          const status_code = error.status || 500;
          this.logger_service.LogResponse(
            method,
            url,
            status_code,
            response_time
          );
          this.logger_service.Error(`Request Error: ${method} ${url}`, error, {
            status_code,
            response_time: `${response_time}ms`
          });
        }
      })
    );
  }
}
