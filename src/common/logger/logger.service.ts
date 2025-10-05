import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(private readonly config_service: ConfigService) {
    this.InitializeLogger();
  }

  private InitializeLogger(): void {
    const log_dir = this.config_service.get<string>('logger.dir', './logs');
    const log_level = this.config_service.get<string>('logger.level', 'info');
    const max_files = this.config_service.get<string>(
      'logger.max_files',
      '30d'
    );
    const max_size = this.config_service.get<string>('logger.max_size', '20m');
    const date_pattern = this.config_service.get<string>(
      'logger.date_pattern',
      'YYYY-MM-DD'
    );
    const compress = this.config_service.get<boolean>('logger.compress', false);
    const console_enabled = this.config_service.get<boolean>(
      'logger.console_enabled',
      true
    );
    const file_enabled = this.config_service.get<boolean>(
      'logger.file_enabled',
      true
    );
    if (!fs.existsSync(log_dir)) {
      fs.mkdirSync(log_dir, { recursive: true });
    }
    const log_format = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.printf(
        ({ timestamp, level, message, context, trace, ...meta }) => {
          let log = `${timestamp} [${level.toUpperCase()}]`;
          if (context) {
            log += ` [${context}]`;
          }
          log += ` ${message}`;
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          if (trace) {
            log += `\n${trace}`;
          }
          return log;
        }
      )
    );
    const transports: winston.transport[] = [];
    if (console_enabled) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), log_format)
        })
      );
    }
    if (file_enabled) {
      transports.push(
        new DailyRotateFile({
          filename: path.join(log_dir, 'error-%DATE%.log'),
          datePattern: date_pattern,
          level: 'error',
          maxFiles: max_files,
          maxSize: max_size,
          zippedArchive: compress,
          format: log_format
        })
      );
      transports.push(
        new DailyRotateFile({
          filename: path.join(log_dir, 'combined-%DATE%.log'),
          datePattern: date_pattern,
          maxFiles: max_files,
          maxSize: max_size,
          zippedArchive: compress,
          format: log_format
        })
      );
      transports.push(
        new DailyRotateFile({
          filename: path.join(log_dir, 'info-%DATE%.log'),
          datePattern: date_pattern,
          level: 'info',
          maxFiles: max_files,
          maxSize: max_size,
          zippedArchive: compress,
          format: log_format
        })
      );
      transports.push(
        new DailyRotateFile({
          filename: path.join(log_dir, 'debug-%DATE%.log'),
          datePattern: date_pattern,
          level: 'debug',
          maxFiles: max_files,
          maxSize: max_size,
          zippedArchive: compress,
          format: log_format
        })
      );
    }
    this.logger = winston.createLogger({
      level: log_level,
      transports,
      exitOnError: false
    });
  }

  SetContext(context: string): void {
    this.context = context;
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, {
      context: context || this.context,
      trace
    });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context: context || this.context });
  }

  Info(message: string, meta?: Record<string, any>, context?: string): void {
    this.logger.info(message, {
      context: context || this.context,
      ...meta
    });
  }

  Error(
    message: string,
    error?: Error | string,
    meta?: Record<string, any>,
    context?: string
  ): void {
    const trace = error instanceof Error ? error.stack : error;
    this.logger.error(message, {
      context: context || this.context,
      trace,
      ...meta
    });
  }

  Warn(message: string, meta?: Record<string, any>, context?: string): void {
    this.logger.warn(message, {
      context: context || this.context,
      ...meta
    });
  }

  Debug(message: string, meta?: Record<string, any>, context?: string): void {
    this.logger.debug(message, {
      context: context || this.context,
      ...meta
    });
  }

  LogRequest(
    method: string,
    url: string,
    ip: string,
    user_agent?: string
  ): void {
    this.Info(
      'Incoming Request',
      {
        method,
        url,
        ip,
        user_agent
      },
      'HTTP'
    );
  }

  LogResponse(
    method: string,
    url: string,
    status_code: number,
    response_time: number
  ): void {
    const level =
      status_code >= 500 ? 'error' : status_code >= 400 ? 'warn' : 'info';
    this.logger.log(level, 'Outgoing Response', {
      context: 'HTTP',
      method,
      url,
      status_code,
      response_time: `${response_time}ms`
    });
  }

  LogSlowRequest(
    method: string,
    url: string,
    response_time: number,
    threshold: number
  ): void {
    this.Warn(
      'Slow Request Detected',
      {
        method,
        url,
        response_time: `${response_time}ms`,
        threshold: `${threshold}ms`
      },
      'Performance'
    );
  }

  LogQuery(query: string, execution_time: number, parameters?: any[]): void {
    this.Debug(
      'Database Query',
      {
        query,
        execution_time: `${execution_time}ms`,
        parameters
      },
      'Database'
    );
  }

  LogSlowQuery(query: string, execution_time: number, threshold: number): void {
    this.Warn(
      'Slow Query Detected',
      {
        query,
        execution_time: `${execution_time}ms`,
        threshold: `${threshold}ms`
      },
      'Database'
    );
  }

  LogAuthSuccess(user_id: string | number, ip: string): void {
    this.Info(
      'Authentication Success',
      {
        user_id,
        ip
      },
      'Auth'
    );
  }

  LogAuthFailure(username: string, ip: string, reason: string): void {
    this.Warn(
      'Authentication Failed',
      {
        username,
        ip,
        reason
      },
      'Auth'
    );
  }

  LogSystemEvent(event: string, details?: Record<string, any>): void {
    this.Info(`System Event: ${event}`, details, 'System');
  }

  LogSystemError(event: string, error: Error | string): void {
    this.Error(`System Error: ${event}`, error, {}, 'System');
  }
}
