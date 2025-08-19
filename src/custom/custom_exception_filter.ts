import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Support for all exception
@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'InternalServerError';
    let message = 'Some thing went wrong with server. Please try again!';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      error = exception.name;
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      error: error,
      message: message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
