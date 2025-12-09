import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    const errors: any[] = [];
    console.log(exception);
    // 🟩 ZodValidationException (nestjs-zod)
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();
      status = HttpStatus.BAD_REQUEST;

      if (zodError instanceof ZodError) {
        message = 'Validation failed';
        errors.push(
          ...zodError.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        );
      } else {
        message = 'Invalid request data';
      }

      // 🟩 ZodError (plain)
    } else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      // console.error(exception);
      message = 'Validation failed';
      errors.push(
        ...exception.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      );

      // 🟧 Nest built-in exceptions
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      //console.log('here');
      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object') {
        message = (responseBody as any).message || message;
        if ((responseBody as any).errors)
          errors.push((responseBody as any).errors);
      }

      // 🟨 Generic Error
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error
    console.error({
      status,
      message,
      stack: exception instanceof Error ? exception.stack : null,
    });

    response.status(status).json({
      status: status,
      message,
      errors,
    });
  }
}
