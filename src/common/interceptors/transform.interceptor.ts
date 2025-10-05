import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  status_code: number;
  message?: string | Record<string, any>;
  data?: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        const response = context.switchToHttp().getResponse();
        const status_code = response.statusCode;
        const success = status_code >= 200 && status_code < 300;
        const message = data?.message;
        let response_data: any;
        if (data?.data !== undefined) {
          response_data = data.data;
        } else if (data?.message && Object.keys(data).length === 1) {
          response_data = null;
        } else if (data?.message) {
          const { message: _, ...rest } = data;
          response_data = Object.keys(rest).length > 0 ? rest : null;
        } else {
          response_data = data;
        }
        const result: any = {
          success,
          status_code,
          timestamp: new Date().toISOString()
        };
        if (message) {
          result.message = message;
        }
        if (response_data !== null && response_data !== undefined) {
          result.data = response_data;
        }
        return result;
      })
    );
  }
}
