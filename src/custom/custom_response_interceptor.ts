import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { AbstractResponse } from 'src/abstracts/abstract_response';

@Injectable()
export class CustomResponseInterceptor<T>
  implements NestInterceptor<T, AbstractResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
    // Warping data return from controller (data in map)
    // and transform it to match interface or type
  ): Observable<AbstractResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // console.log(response);

    return next.handle().pipe(
      map((data: any) => {
        // This data is return form controller (Comment for purpose remmember hehe! )
        return {
          statusCode: response.statusCode,
          message: 'Success',
          data: data, // <-- This is T
        };
      }),
    );
  }
}
