import { Injectable, NestMiddleware } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Request, Response, NextFunction } from 'express'; // 👈 import từ express
import { LoginRequestDto } from 'src/modules/auth/dto/request/auth-request.dto';

@Injectable()
export class validateLoginDtoMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Chuyển dữ liệu body thành DTO instance
    const loginRequestDto = plainToInstance(LoginRequestDto, req.body);

    // Validate DTO instance
    try {
      await validateOrReject(loginRequestDto);
    } catch (errors) {
      next(errors);
    }

    next();
  }
}
