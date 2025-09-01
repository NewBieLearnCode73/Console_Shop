import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafka: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafka.connect();
  }

  // Send event and not take response
  sendEvent(topic: string, message: any) {
    return this.kafka.emit(topic, message);
  }

  // Send message and take response
  sendMessage(topic: string, message: any) {
    return this.kafka.send(topic, message);
  }
}
