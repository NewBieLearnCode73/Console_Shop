import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomResponseInterceptor } from './custom/custom_response_interceptor';
import { CustomExceptionFilter } from './custom/custom_exception_filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new CustomResponseInterceptor());
  app.useGlobalFilters(new CustomExceptionFilter());
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3001'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);

  const config = new DocumentBuilder()
    .setTitle('Console Shop API')
    .setDescription('API docs for Console Shop')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.KAFKA,
  //   options: {
  //     client: {
  //       brokers: ['localhost:9092'],
  //     },
  //     consumer: {
  //       groupId: 'my-app-consumer',
  //     },
  //   },
  // });

  // Connect Kafka microservice async
  const kafkaMicroservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'], // Docker: đổi thành 'kafka:9092'
      },
      consumer: {
        groupId: 'my-app-consumer',
      },
    },
  });

  // Start Kafka async với retry đơn giản
  const startKafka = async () => {
    let connected = false;
    while (!connected) {
      try {
        await kafkaMicroservice.listen();
        connected = true;
        console.log('Kafka microservice connected');
      } catch (e) {
        console.log('Kafka not ready, retry in 3s...');
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  };

  // await app.startAllMicroservices().then(() => {
  //   console.log('Microservices are listening');
  // });
  await startKafka(); // chạy async, không block API
}
bootstrap();
