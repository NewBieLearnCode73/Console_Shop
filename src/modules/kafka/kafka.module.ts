import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'kafka-client',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'my-app-consumer',
          },
        },
      },
    ]),
  ],
  providers: [],
  exports: [ClientsModule],
})
export class KafkaModule {}
