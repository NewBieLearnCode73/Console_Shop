import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';

// Support for all exception
@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    console.log(exception);
    let error = 'InternalServerError';
    let message = ['Some thing went wrong with server. Please try again!'];

    /// Handle HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      error = exception.name;
      message = [];

      const response = exception.getResponse();

      // Response is an object (Validate DTO)
      if (typeof response === 'object' && response !== null) {
        const resMessage = (response as any).message;

        if (typeof resMessage === 'string') {
          message.push(resMessage);
        } else if (Array.isArray(resMessage)) {
          message.push(...resMessage);
        }
      }

      // Response is a string (Throw HttpException)
      if (typeof response === 'string') {
        message.push(response);
      }
    }

    // Handle ValidationError
    if (Array.isArray(exception)) {
      if (exception.every((err) => err instanceof ValidationError)) {
        status = HttpStatus.BAD_REQUEST;
        error = 'ValidationError';
        message = [];
        exception.forEach((err: ValidationError) => {
          message.push(...Object.values(err.constraints || {}));
        });
      }
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
