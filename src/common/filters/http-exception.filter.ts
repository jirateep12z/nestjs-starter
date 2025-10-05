import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { LoggerService } from '../logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger_service: LoggerService) {
    this.logger_service.SetContext('HttpExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let error = 'Internal Server Error';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exception_response = exception.getResponse();
      if (typeof exception_response === 'string') {
        message = exception_response;
      } else if (typeof exception_response === 'object') {
        message = (exception_response as any).message || exception_response;
        error = (exception_response as any).error || error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }
    this.logger_service.Error(
      `${request.method} ${request.url} - Status: ${status} - Error: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception : undefined
    );
    response.status(status).send({
      success: false,
      status_code: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message
    });
  }
}
