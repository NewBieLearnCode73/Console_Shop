import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomResponseInterceptor } from './custom/custom_response_interceptor';
import { CustomExceptionFilter } from './custom/custom_exception_filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new CustomResponseInterceptor());
  app.useGlobalFilters(new CustomExceptionFilter());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Console Shop API')
    .setDescription('API docs for Console Shop')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
