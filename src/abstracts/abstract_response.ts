import { HttpStatus } from '@nestjs/common';

export interface AbstractResponse<T> {
  statusCode: HttpStatus;
  message: string;
  data?: T;
}
